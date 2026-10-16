/**
 * SVG linearGradient / radialGradient → LeaferUI Paint 对象映射。
 *
 * 支持：
 * - gradientUnits="objectBoundingBox"（默认）：坐标为包围盒比例（0~1 或百分比）
 * - gradientUnits="userSpaceOnUse"：坐标为元素用户空间单位（换算为元素局部坐标）
 * - stop-color / stop-opacity / style
 * - linearGradient 的 x1/y1/x2/y2（含百分比与纯数字比例形式）
 * - radialGradient 的 cx/cy/r/fr
 * - xlink:href 属性 / stop 继承
 * - gradientTransform 的平移分量（换算进坐标）
 *
 * 不支持（降级处理，README 中有记录）：
 * - gradientTransform 的旋转 / 缩放 / 倾斜分量（仅取平移）
 * - radialGradient 焦点 fx/fy 的精确语义（focal point，近似为渐变中心）
 * - userSpaceOnUse 下的百分比坐标（近似按元素包围盒换算）
 */
import type { IColorStop, IGradientPaint, IUnitPointData } from 'leafer-ui';
import { Color } from './color/Color';
import { toFixed } from './util/misc/toFixed';
import { parseUnit } from './util/misc/svgParsing';

export interface IGradientContext {
  /** 元素局部坐标的包围盒（Leafer 元素的 boxBounds） */
  box: { x: number; y: number; width: number; height: number };
  /** 元素局部坐标 → 用户空间的平移偏移（如 rect 的 x/y、text 的锚点偏移） */
  offset?: { x: number; y: number };
  /** 用于解析 em 单位的字体大小 */
  fontSize?: number;
}

/** url(#id) 或 url("#id") → id（不含 # 前缀，与渐变定义 Map 的 key 一致） */
export function parsePaintReference(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const match = /^\s*url\(\s*(['"]?)([^'")]+)\1\s*\)/i.exec(value);
  return match ? match[2].trim().replace(/^#/, '') : undefined;
}

/** 收集文档中所有渐变定义（含 <defs> 内的），key 为 id */
export function collectGradientDefs(doc: Document): Map<string, Element> {
  const map = new Map<string, Element>();
  const all = doc.getElementsByTagName('*');
  for (let i = 0; i < all.length; i++) {
    const el = all[i];
    const tag = el.tagName.replace(/^svg:/i, '');
    if (tag === 'linearGradient' || tag === 'radialGradient') {
      const id = el.getAttribute('id');
      if (id) map.set(id, el);
    }
  }
  return map;
}

/**
 * 解析单个渐变元素为 Leafer Paint。
 * 返回 undefined 表示无法解析（循环引用、无有效 stop、退化半径等）。
 */
export function resolveGradient(
  def: Element,
  ctx: IGradientContext,
  seen = new Set<string>(),
): IGradientPaint | undefined {
  const tag = def.tagName.replace(/^svg:/i, '');
  if (tag !== 'linearGradient' && tag !== 'radialGradient') return undefined;

  const id = def.getAttribute('id');
  if (id) {
    if (seen.has(id)) return undefined;
    seen.add(id);
  }

  // xlink:href 属性 / stop 继承
  const href = def.getAttribute('xlink:href') || def.getAttribute('href');
  let base: Element | undefined;
  if (href && href.startsWith('#')) {
    const baseId = href.slice(1);
    base = def.ownerDocument?.getElementById(baseId) ?? undefined;
    if (base) seen.add(baseId);
  }

  const attr = (name: string): string | null =>
    def.getAttribute(name) ?? base?.getAttribute(name) ?? null;

  const stops = parseStops(def, base);
  if (!stops.length) return undefined;

  const units = attr('gradientUnits') || 'objectBoundingBox';
  const isOBB = units !== 'userSpaceOnUse';

  // gradientTransform 的平移分量可等价并入坐标（其余分量降级忽略）
  let translateX = 0;
  let translateY = 0;
  const gradientTransform = attr('gradientTransform');
  if (gradientTransform) {
    const nums = gradientTransform.match(/[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g);
    if (nums && nums.length >= 6) {
      translateX = parseFloat(nums[4]) || 0;
      translateY = parseFloat(nums[5]) || 0;
    }
  }

  // 解析坐标分量 → 元素局部坐标
  const resolveX = (value: string | null, fallback: number): number =>
    resolveCoord(value, fallback, isOBB, ctx, 'x') + translateX;
  const resolveY = (value: string | null, fallback: number): number =>
    resolveCoord(value, fallback, isOBB, ctx, 'y') + translateY;

  if (tag === 'linearGradient') {
    // SVG 默认 x1=0 y1=0 x2=100% y2=0（水平从左到右）
    return {
      type: 'linear',
      from: toUnitPoint(resolveX(attr('x1'), 0), resolveY(attr('y1'), 0), ctx),
      to: toUnitPoint(resolveX(attr('x2'), 1), resolveY(attr('y2'), 0), ctx),
      stops,
    };
  }

  // radialGradient：SVG 默认 cx=cy=r=50%（objectBoundingBox）
  const cx = resolveX(attr('cx'), isOBB ? 0.5 : 0);
  const cy = resolveY(attr('cy'), isOBB ? 0.5 : 0);
  const r = resolveRadius(attr('r'), isOBB ? 0.5 : 0, isOBB, ctx);

  // 焦点 fx/fy：Leafer 的 radial 只有 from/to/stretch 模型，
  // 把 fx/fy 近似为渐变中心（不支持精确 focal point 语义）
  const fx = attr('fx') != null ? resolveX(attr('fx'), isOBB ? 0.5 : 0) : cx;
  const fy = attr('fy') != null ? resolveY(attr('fy'), isOBB ? 0.5 : 0) : cy;

  // SVG 椭圆渐变在用户空间的半轴：
  // - objectBoundingBox：r 是包围盒单位正方形中的半径 → rx = r * width, ry = r * height
  // - userSpaceOnUse：r 是像素半径 → rx = ry = r
  const rxPx = isOBB ? r * ctx.box.width : r;
  const ryPx = isOBB ? r * ctx.box.height : r;
  if (!(rxPx > 0) || !(ryPx > 0)) return undefined;

  // Leafer radial 模型：from 为圆心，to 在 from 正下方 R 处（R = |from→to|），
  // stretch 沿垂直于 from→to 的方向拉伸（相对宽度比例）形成椭圆。
  // 令 R = ryPx、stretch = (rxPx / ryPx) * (height / width) 可精确还原 SVG 的椭圆渐变
  // （与 Leafer 官方默认 from=center / to=bottom / stretch=1 的行为一致）。
  const R = ryPx;
  const stretch =
    ctx.box.width > 0 && ctx.box.height > 0
      ? toFixed((rxPx / ryPx) * (ctx.box.height / ctx.box.width), 4)
      : 1;

  const paint: IGradientPaint = {
    type: 'radial',
    from: toUnitPoint(fx, fy, ctx),
    to: toUnitPoint(fx, fy + R, ctx),
    stops,
  };
  if (stretch != null && stretch !== 1) paint.stretch = stretch;
  return paint;
}

/**
 * 坐标分量解析 → SVG 元素用户空间坐标（与 getUserBox 同一坐标系）。
 * - objectBoundingBox：数值 / 百分比都是包围盒比例
 * - userSpaceOnUse：数值为用户空间单位，百分比近似按元素包围盒换算
 */
const resolveCoord = (
  value: string | null,
  fallback: number,
  isOBB: boolean,
  ctx: IGradientContext,
  axis: 'x' | 'y',
): number => {
  const box = ctx.box;
  const size = axis === 'x' ? box.width : box.height;
  const base = axis === 'x' ? box.x : box.y;

  if (value == null || value.trim() === '') {
    return base + fallback * size;
  }
  const text = value.trim();
  const ratio = text.endsWith('%') ? parseFloat(text) / 100 : parseFloat(text);
  if (isOBB || text.endsWith('%')) {
    // objectBoundingBox：比例；userSpaceOnUse 下百分比按视口解析，近似按包围盒换算
    return isNaN(ratio) ? base : base + ratio * size;
  }
  const num = parseUnit(text, ctx.fontSize ?? 16);
  return isNaN(num) ? base : num;
};

/**
 * 半径解析：
 * - objectBoundingBox：数值 / 百分比都是归一化对角线的比例（返回比例值 0~1）
 * - userSpaceOnUse：数值为像素半径（返回像素值）；百分比近似按归一化对角线换算
 */
const resolveRadius = (
  value: string | null,
  fallback: number,
  isOBB: boolean,
  ctx: IGradientContext,
): number => {
  if (value == null || value.trim() === '') return fallback;
  const text = value.trim();
  const ratio = text.endsWith('%') ? parseFloat(text) / 100 : parseFloat(text);
  if (isOBB) return isNaN(ratio) ? 0 : ratio;
  if (text.endsWith('%')) {
    const diagonal =
      Math.sqrt((ctx.box.width ** 2 + ctx.box.height ** 2) / 2) || 0;
    return isNaN(ratio) ? 0 : ratio * diagonal;
  }
  const num = parseUnit(text, ctx.fontSize ?? 16);
  return isNaN(num) ? 0 : num;
};

/** 元素局部坐标 → Leafer 渐变的相对包围盒百分比控制点 */
const toUnitPoint = (
  x: number,
  y: number,
  ctx: IGradientContext,
): IUnitPointData => {
  const { box } = ctx;
  return {
    type: 'percent',
    x: box.width ? toFixed((x - box.x) / box.width, 4) : 0,
    y: box.height ? toFixed((y - box.y) / box.height, 4) : 0,
  };
};

/** 解析 <stop> 子元素（含 href 继承），返回 Leafer ColorStop[] */
function parseStops(def: Element, base?: Element): IColorStop[] {
  const stops: IColorStop[] = [];
  const collect = (el: Element) => {
    const children = el.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.tagName.replace(/^svg:/i, '') !== 'stop') continue;
      const offsetText = (child.getAttribute('offset') || '0').trim();
      const offset = offsetText.endsWith('%')
        ? parseFloat(offsetText) / 100
        : parseFloat(offsetText);
      if (isNaN(offset)) continue;

      // style 属性优先于呈现属性
      let color = child.getAttribute('stop-color') || '';
      let opacityText = child.getAttribute('stop-opacity') || '';
      const style = child.getAttribute('style');
      if (style) {
        for (const pair of style.split(';')) {
          const separator = pair.indexOf(':');
          if (separator < 0) continue;
          const name = pair.slice(0, separator).trim();
          const val = pair.slice(separator + 1).trim();
          if (!val) continue;
          if (name === 'stop-color') color = val;
          else if (name === 'stop-opacity') opacityText = val;
        }
      }
      if (!color) color = '#000000';
      const opacity = opacityText ? parseFloat(opacityText) : 1;
      const parsed = new Color(color);
      const rgba = parsed.isUnrecognised
        ? color
        : parsed
          .setAlpha(toFixed(parsed.getAlpha() * (isNaN(opacity) ? 1 : opacity), 2))
          .toRgba();
      stops.push({
        offset: toFixed(Math.min(1, Math.max(0, offset)), 4),
        color: rgba,
      });
    }
  };
  collect(def);
  if (!stops.length && base) collect(base);
  stops.sort((a, b) => a.offset - b.offset);
  return stops;
}
