/**
 * svg 转 leaferjs 对象，移植于 fabric.js 项目
 * https://github.com/fabricjs/fabric.js/tree/master/src/parser
 */
import { Group, Path, Polygon, Rect, Line, Ellipse, Text, Image } from 'leafer-ui';
import type { UI, IFill, IStroke, ITextAlign } from 'leafer-ui';

import { parseUseDirectives } from './parser/parseUseDirectives';
import { applyViewboxTransform } from './parser/applyViewboxTransform';
import { hasInvalidAncestor } from './parser/hasInvalidAncestor';
import { parseAttributes } from './parser/parseAttributes';
import { parseOwnAttributes } from './parser/parseOwnAttributes';
import { getCSSRules } from './parser/getCSSRules';
import { SHARED_ATTRIBUTES } from './parser/attributes';
import { getTagName } from './parser/getTagName';
import { parsePointsAttribute } from './parser/parsePointsAttribute';
import type { SVGParsingOutput, CSSRules } from './parser/typedefs';
import {
  multiplyTransformMatrices,
  createTranslateMatrix,
} from './util/misc/matrix';
import { iMatrix, DEFAULT_SVG_FONT_SIZE, hitRadius, otherPrefix } from './constants';
import type { TMat2D } from './typedefs';

import { mapStyleAttrs, mapPaintAttrs } from './mapStyle';
import {
  collectGradientDefs,
  resolveGradient,
  parsePaintReference,
  type IGradientContext,
} from './gradient';


export interface ParseOptions {
  /**
   * 是否扁平化解析结果，默认 true（全部元素摊平为单层 Group，父级样式 / 变换 / 透明度烘焙到叶子）。
   * 设为 false 时保留 `<g>` 嵌套层级（映射为嵌套 Group），
   * 变换 / 透明度 / 可见性由 Leafer 父子层级天然承担，分组透明度与 SVG 语义完全一致。
   */
  flatten?: boolean;
  /** 设置到返回的 `Group` 及所有子元素上的类名 */
  className?: string;
  /** 提供时覆盖所有子元素的填充色 */
  fill?: string;
}

/** SVG 叶子元素 → 每类元素额外解析的属性 */
const TAG_EXTRA_ATTRS: Record<string, string[]> = {
  path: ['d', 'visible'],
  rect: ['x', 'y', 'rx', 'ry', 'width', 'height', 'visible'],
  circle: ['cx', 'cy', 'r', 'visible'],
  ellipse: ['cx', 'cy', 'r', 'rx', 'ry', 'visible'],
  line: ['x1', 'y1', 'x2', 'y2', 'visible'],
  polyline: ['visible'],
  polygon: ['visible'],
  text: [
    'x',
    'y',
    'dx',
    'dy',
    'font',
    'font-family',
    'font-style',
    'font-weight',
    'font-size',
    'letter-spacing',
    'text-decoration',
    'text-anchor',
    'visible',
  ],
  image: [
    'x',
    'y',
    'width',
    'height',
    'preserveAspectRatio',
    'xlink:href',
    'href',
    'crossOrigin',
    'image-rendering',
    'visible',
  ],
};

const LEAF_TAGS = new Set(Object.keys(TAG_EXTRA_ATTRS));

/** 非扁平模式下映射为嵌套 Group 的容器元素 */
const CONTAINER_TAGS = new Set(['g', 'a', 'svg', 'symbol', 'switch']);

/** 不参与渲染的元素（整棵子树跳过） */
const SKIP_TAGS = new Set([
  'use',
  'title',
  'desc',
  'metadata',
  'defs',
  'clippath',
  'mask',
  'pattern',
  'marker',
  'view',
  'filter',
  'style',
  'script',
  'lineargradient',
  'radialgradient',
  'stop',
  'animate',
  'animatetransform',
  'animatemotion',
  'set',
  'foreignobject',
]);

interface WalkContext {
  flatten: boolean;
  className?: string;
  fill?: string;
  cssRules: CSSRules;
  gradientDefs: Map<string, Element>;
}

export const createEmptyResponse = (): SVGParsingOutput => ({
  objects: [],
  elements: [],
  options: {},
  allElements: [],
});

function parse(
  string?: string,
  options?: ParseOptions,
): Group | undefined {
  if (!string) return;
  const flatten = options?.flatten !== false;
  const { className, fill } = options ?? {};

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(string.trim(), 'text/xml');
  const documentElement = doc.documentElement;
  parseUseDirectives(doc);

  // viewBox / width / height → 等价变换。
  // 根 <svg> 也需处理（包裹 <g> 把 viewbox 变换传递给子元素）
  applyViewboxTransform(documentElement);
  const descendants = Array.from(documentElement.getElementsByTagName('*'));
  descendants.forEach((el) => applyViewboxTransform(el));

  const ctx: WalkContext = {
    flatten,
    className,
    fill,
    cssRules: getCSSRules(doc),
    gradientDefs: collectGradientDefs(doc),
  };

  const group = new Group({
    id: uuid(),
    className,
    hitChildren: false,
    hitFill: 'pixel',
    hitRadius: hitRadius / 4,
    children: [],
    editable: true,
  });

  walkChildren(documentElement, group, ctx);

  if (!group.children.length) return;
  return group;
}

function uuid(): string {
  const bytes = new Uint8Array(16);

  // 填充随机字节（Math.random）
  for (let i = 0; i < 16; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }

  // RFC4122：版本4，第6字节高4位 = 0100
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // RFC4122：变体，第8字节高2位 = 10
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  // 转16进制，不足两位前面补0
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0'));

  return `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-${hex[4]}${hex[5]}-${hex[6]}${hex[7]}-${hex[8]}${hex[9]}-${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`;
}

/** 递归遍历子元素：叶子构建为 Leafer 对象，容器按模式建组或摊平 */
function walkChildren(el: Element, target: Group, ctx: WalkContext): void {
  let children = Array.from(el.children);
  // <switch> 只渲染第一个子元素（SVG 语义）
  if (getTagName(el).toLowerCase() === 'switch') children = children.slice(0, 1);

  for (const child of children) {
    const tag = getTagName(child).toLowerCase();
    if (SKIP_TAGS.has(tag)) continue;
    if (hasInvalidAncestor(child)) continue;

    if (LEAF_TAGS.has(tag)) {
      const leaf = buildLeaf(child, tag, ctx);
      if (leaf) target.add(leaf);
    } else if (CONTAINER_TAGS.has(tag)) {
      if (ctx.flatten) {
        // 扁平化：不建组，样式 / 变换由 parseAttributes 沿父级累乘后烘焙到叶子
        walkChildren(child, target, ctx);
      } else {
        buildContainer(child, ctx, target);
      }
    }
  }
}

/** 非扁平模式：把 `<g>` 等容器映射为嵌套 Group，自身变换 / 透明度 / 可见性由层级承担 */
function buildContainer(el: Element, ctx: WalkContext, target: Group): void {
  const own = parseOwnAttributes(
    el as SVGElement,
    ['transform', 'opacity', 'display', 'visibility'],
    ctx.cssRules,
  );

  const sub = new Group({
    id: uuid(),
    className: ctx.className,
    children: [],
    editable: true,
    hitRadius: hitRadius / 4,
  });
  applyMatrix(sub, own.transformMatrix ?? iMatrix);
  if (typeof own.opacity === 'number') sub.opacity = own.opacity;
  if (typeof own.visible === 'boolean') sub.visible = own.visible;

  walkChildren(el, sub, ctx);
  if (sub.children.length) target.add(sub);
}

function buildLeaf(el: Element, tag: string, ctx: WalkContext): UI | undefined {
  const attrNames = [...SHARED_ATTRIBUTES, ...(TAG_EXTRA_ATTRS[tag] || [])];
  const attrs = parseAttributes(el as SVGElement, attrNames, ctx.cssRules) as Record<string, any>;
  // 非扁平模式下变换 / 透明度 / 可见性只取自身值（父级由嵌套 Group 承担）
  const own = ctx.flatten
    ? ({} as Record<string, any>)
    : parseOwnAttributes(el as SVGElement, ['transform', 'opacity', 'display', 'visibility'], ctx.cssRules);

  const style: Record<string, any> = mapStyleAttrs(attrs, tag === 'text');

  // visible：display:none / visibility:hidden 归一化而来（父级 hidden 会强制子级隐藏）
  const visible = ctx.flatten ? attrs.visible : own.visible;
  if (typeof visible === 'boolean') style.visible = visible;
  const opacity = ctx.flatten ? attrs.opacity : own.opacity;
  if (typeof opacity === 'number') style.opacity = opacity;

  const originalId = el.getAttribute('data-c') || otherPrefix + uuid();
  const common = {
    id: uuid(),
    className: ctx.className,
    data: { originalId },
    editable: true,
    hitRadius: hitRadius / 4,
  };

  let ui: UI | undefined;
  // 几何偏移：元素 x/y 等定位在自身变换之前生效（SVG 语义）
  let offsetX = 0;
  let offsetY = 0;

  switch (tag) {
    case 'path': {
      const d = attrs.d;
      if (typeof d !== 'string' || !d.trim()) return;
      ui = new Path({ ...common, ...style, path: d });
      break;
    }

    case 'rect': {
      const width = toNumber(attrs.width);
      const height = toNumber(attrs.height);
      offsetX = toNumber(attrs.left); // SVG x（attributesMap: x → left）
      offsetY = toNumber(attrs.top); // SVG y（attributesMap: y → top，y 轴与 Leafer 同向）

      // SVG 语义：rx/ry 是角上的椭圆半径，缺省时互相取值，任一为 0 则为直角
      let rx = toOptionalNumber(attrs.rx);
      let ry = toOptionalNumber(attrs.ry);
      if (rx == null && ry == null) {
        rx = ry = 0;
      } else if (rx == null) {
        rx = ry;
      } else if (ry == null) {
        ry = rx;
      }
      rx = Math.max(0, rx!);
      ry = Math.max(0, ry!);
      if (rx === 0 || ry === 0) {
        rx = ry = 0;
      } else {
        rx = Math.min(rx, width / 2);
        ry = Math.min(ry, height / 2);
      }

      const rectVisible = Boolean(
        (typeof style.visible === 'boolean' ? style.visible : true) && width && height,
      );
      style.visible = rectVisible;

      if (rx === ry) {
        ui = new Rect({
          ...common,
          ...style,
          width,
          height,
          ...(rx > 0 ? { cornerRadius: [rx, ry, rx, ry] } : {}),
        });
      } else {
        // rx ≠ ry 时 Leafer 的 cornerRadius（圆形圆角）无法表达椭圆圆角，
        // 降级为带椭圆弧的 Path 精确还原（输出类型为 Path 而非 Rect）
        ui = new Path({
          ...common,
          ...style,
          path: roundedRectPathString(width, height, rx, ry),
        });
      }
      break;
    }

    case 'circle':
    case 'ellipse': {
      // circle 用 r（attributesMap: r → radius）；ellipse 用 rx / ry
      const rx =
        toOptionalNumber(attrs.rx) ?? toOptionalNumber(attrs.radius) ?? 0;
      const ry =
        toOptionalNumber(attrs.ry) ?? toOptionalNumber(attrs.radius) ?? 0;
      offsetX = toNumber(attrs.left) - rx; // SVG cx
      offsetY = toNumber(attrs.top) - ry; // SVG cy
      ui = new Ellipse({
        ...common,
        ...style,
        width: rx * 2,
        height: ry * 2,
      });
      break;
    }

    case 'line': {
      ui = new Line({
        ...common,
        ...style,
        points: [
          toNumber(attrs.x1),
          toNumber(attrs.y1),
          toNumber(attrs.x2),
          toNumber(attrs.y2),
        ],
      });
      break;
    }

    case 'polyline': {
      ui = new Line({
        ...common,
        ...style,
        points: parsePointsAttribute(el.getAttribute('points')),
      });
      break;
    }

    case 'polygon': {
      ui = new Polygon({
        ...common,
        ...style,
        points: parsePointsAttribute(el.getAttribute('points')),
        // SVG <polygon> 始终闭合（描边会画闭合段），与 <polyline> 不同
        closed: true,
      });
      break;
    }

    case 'text': {
      const textContent = (el.textContent || '')
        .replace(/^\s+|\s+$|\n+/g, '')
        .replace(/\s+/g, ' ');
      const textAlign = attrs.textAnchor as ITextAlign | undefined;
      const text = new Text({
        ...common,
        ...style,
        text: textContent,
        ...(textAlign ? { textAlign } : {}),
      });
      ui = text;
      // SVG <text> 的 (x, y) 是字母基线起点，而 Leafer Text 的 (x, y) 是文本框顶边，
      // 首行字母基线渲染在 rows[0].y 处（默认行高 150% 时 ≈ 1.1 * fontSize）。
      // 把基线距离并入几何偏移，随元素变换一起烘焙（旋转时也能对齐）
      const baseLine = text.textDrawData.rows[0]?.y ?? 0;
      offsetX = toNumber(attrs.left) + toNumber(attrs.dx);
      offsetY = toNumber(attrs.top) + toNumber(attrs.dy) - baseLine;
      break;
    }

    case 'image': {
      const url = attrs['xlink:href'] || attrs.href;
      if (!url) return;
      ui = new Image({
        ...common,
        ...style,
        url,
        width: toNumber(attrs.width),
        height: toNumber(attrs.height),
      });
      offsetX = toNumber(attrs.left);
      offsetY = toNumber(attrs.top);
      break;
    }

    default:
      return;
  }

  // 变换烘焙：SVG 的 transform 作用于（x/y 定位后的）元素整体，
  // 即 matrix = transform ∘ translate(offset)，整体交给 Leafer setTransform 分解
  const base: TMat2D =
    (ctx.flatten ? attrs.transformMatrix : own.transformMatrix) ?? iMatrix;
  applyMatrix(
    ui,
    multiplyTransformMatrices(base, createTranslateMatrix(offsetX, offsetY)),
  );

  // 填充 / 描边（纯色 / 渐变）
  const getUserBox = (): IGradientContext['box'] => {
    const box = ui!.boxBounds;
    return {
      x: box.x + offsetX,
      y: box.y + offsetY,
      width: box.width,
      height: box.height,
    };
  };
  const fontSize =
    typeof attrs.fontSize === 'number' && attrs.fontSize > 0
      ? attrs.fontSize
      : DEFAULT_SVG_FONT_SIZE;

  const paints = mapPaintAttrs(attrs, (value, kind) => {
    const id = parsePaintReference(value);
    if (id === undefined) return undefined;
    const def = ctx.gradientDefs.get(id);
    if (!def) return undefined;
    return resolveGradient(def, {
      box: getUserBox(),
      fontSize,
    }) as IFill | IStroke | undefined;
  });

  if (ctx.fill !== undefined) {
    paints.fill = ctx.fill;
  } else if (tag === 'image' && !('fill' in attrs)) {
    // <image> 的 fill 无渲染效果（url 覆盖 fill），仅在显式指定时保留
    delete paints.fill;
  }
  Object.assign(ui, paints);

  return ui;
}

/**
 * 把变换矩阵烘焙到元素上。
 * 不显式设置 origin / around 时，Leafer 的变换原点为元素内部坐标 (0, 0)，
 * 与 SVG 元素用户空间原点一致，因此矩阵可无损映射。
 */
function applyMatrix(ui: UI, matrix: TMat2D): void {
  const [a, b, c, d, e, f] = matrix;
  const det = a * d - b * c;
  if (![a, b, c, d, e, f].every((v) => isFinite(v)) || det === 0) {
    // 退化矩阵（如 scale(0)）：分解会产生 NaN / Infinity，只保留平移
    if (e || f) {
      ui.x = e;
      ui.y = f;
    }
    return;
  }
  if (a === 1 && b === 0 && c === 0 && d === 1 && e === 0 && f === 0) return;
  ui.setTransform({ a, b, c, d, e, f });
}

const toNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && isFinite(value) ? value : fallback;

const toOptionalNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && isFinite(value) ? value : undefined;

/** rx ≠ ry 的圆角矩形（椭圆圆角）路径，坐标以矩形左上角为原点 */
function roundedRectPathString(
  width: number,
  height: number,
  rx: number,
  ry: number,
): string {
  return [
    `M ${rx} 0`,
    `L ${width - rx} 0`,
    `A ${rx} ${ry} 0 0 1 ${width} ${ry}`,
    `L ${width} ${height - ry}`,
    `A ${rx} ${ry} 0 0 1 ${width - rx} ${height}`,
    `L ${rx} ${height}`,
    `A ${rx} ${ry} 0 0 1 0 ${height - ry}`,
    `L 0 ${ry}`,
    `A ${rx} ${ry} 0 0 1 ${rx} 0`,
    'Z',
  ].join(' ');
}

export { parse };