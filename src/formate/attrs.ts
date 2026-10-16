/**
 * formate：Leafer 通用外观属性（描边样式 / 透明度 / 可见性 / 混合模式 / 特效）→ SVG 呈现属性。
 */
import type { FormatContext } from './typedefs';
import { fmt, note } from './util';
import { paintAttrs } from './paint';

type AnyUI = Record<string, any>;

const capMap: Record<string, string> = {
  none: 'butt',
  butt: 'butt',
  round: 'round',
  square: 'square',
};

const joinMap: Record<string, string> = {
  miter: 'miter',
  bevel: 'bevel',
  round: 'round',
};

const alignMap: Record<string, string> = {
  left: 'start',
  center: 'middle',
  right: 'end',
};

/**
 * 描边样式属性。
 * SVG 仅支持居中描边（无 strokeAlign），非 center 时降级记录。
 * 非 1 的 strokeWidth 由元素自身几何决定，这里只映射样式字段。
 */
export function strokeStyleAttrs(ui: AnyUI, ctx: FormatContext): Record<string, string> {
  const out: Record<string, string> = {};

  const width = ui.strokeWidth;
  if (typeof width === 'number') {
    if (Array.isArray(ui.strokeWidths) && ui.strokeWidths.length > 1) {
      note(ctx, 'strokeWidth', 'degrade', `多段线宽（${ui.strokeWidths.join('/')}）SVG 仅支持单一 stroke-width，已取 ${width}`, ui.__tag, ui.id);
    }
    out['stroke-width'] = fmt(width, ctx.precision);
  }

  const align = ui.strokeAlign;
  if (align && align !== 'center') {
    note(ctx, 'strokeAlign', 'degrade', `描边对齐 ${align} SVG 仅支持居中描边，已按 center 输出（视觉会有偏差）`, ui.__tag, ui.id);
  }

  const cap = ui.strokeCap;
  if (cap && capMap[cap] && capMap[cap] !== 'butt') out['stroke-linecap'] = capMap[cap];

  const join = ui.strokeJoin;
  if (join && joinMap[join] && joinMap[join] !== 'miter') out['stroke-linejoin'] = joinMap[join];

  const miter = ui.miterLimit;
  if (typeof miter === 'number' && miter !== 4) out['stroke-miterlimit'] = fmt(miter, ctx.precision);

  const dash = ui.dashPattern;
  if (Array.isArray(dash) && dash.length) {
    out['stroke-dasharray'] = dash.map((n: number) => fmt(n, ctx.precision)).join(' ');
    if (typeof ui.dashOffset === 'number' && ui.dashOffset !== 0) {
      out['stroke-dashoffset'] = fmt(ui.dashOffset, ctx.precision);
    }
  }

  if (ui.strokeScaleFixed === true) out['vector-effect'] = 'non-scaling-stroke';

  return out;
}

/**
 * 元素级通用外观：fill / stroke 颜色、描边样式、fill-rule、opacity、可见性、混合模式、特效。
 */
export function commonPaintAttrs(ui: AnyUI, ctx: FormatContext): Record<string, string> {
  const out: Record<string, string> = {};
  const tag = ui.__tag as string | undefined;
  const id = ui.id as string | undefined;

  // fill / stroke（<image> 的 fill 由 href 表达，SVG 中 <image> 的 fill 无渲染效果）
  const fill = ui.fill;
  if (tag === 'Image' && fill != null && !isImageFill(fill)) {
    note(ctx, 'fill', 'degrade', '<image> 的 fill 在 SVG 中无渲染效果，已舍弃', tag, id);
  } else if (tag !== 'Image' && fill !== undefined) {
    Object.assign(out, paintAttrs(fill, 'fill', ctx, tag, id));
  }
  if (ui.stroke != null) {
    Object.assign(out, paintAttrs(ui.stroke, 'stroke', ctx, tag, id));
  }

  // SVG 的 fill 默认是黑色，而 Leafer 默认不填充。
  // 对可填充图元（除容器 / <image>），未显式给出 fill 时补 fill="none"，
  // 避免无填充图形在 SVG 中被渲染成黑色。
  const FILL_DEFAULT_NONE = new Set(['Rect', 'Ellipse', 'Path', 'Line', 'Polygon', 'Star', 'Text']);
  if (tag && FILL_DEFAULT_NONE.has(tag) && out.fill === undefined) {
    out.fill = 'none';
  }

  // 描边样式
  if (ui.stroke != null) Object.assign(out, strokeStyleAttrs(ui, ctx));

  // fill-rule
  if (ui.windingRule === 'evenodd') out['fill-rule'] = 'evenodd';

  // 透明度
  if (typeof ui.opacity === 'number' && ui.opacity < 1) {
    out.opacity = fmt(ui.opacity, ctx.precision);
  }

  // 可见性：SVG 用 display:none 表达隐藏
  if (ui.visible === false || ui.visible === 0) out.display = 'none';

  // 混合模式 → mix-blend-mode（SVG2 / CSS），部分渲染器不支持时自然忽略
  const blend = ui.blendMode;
  if (blend && blend !== 'normal' && blend !== 'pass-through') {
    out['mix-blend-mode'] = String(blend);
  }

  // 特效：SVG 无直接对应，降级记录（不输出）
  if (ui.shadow != null || ui.innerShadow != null) {
    note(ctx, 'shadow', 'degrade', '阴影特效 SVG 需 filter/mask 表达，已忽略', tag, id);
  }
  if (ui.blur != null || ui.backgroundBlur != null) {
    note(ctx, 'blur', 'degrade', '模糊特效 SVG 需 filter 表达，已忽略', tag, id);
  }
  if (ui.grayscale != null) {
    note(ctx, 'grayscale', 'degrade', '灰度特效 SVG 需 filter 表达，已忽略', tag, id);
  }
  if (ui.filter != null) {
    note(ctx, 'filter', 'degrade', '滤镜 SVG 无对应，已忽略', tag, id);
  }

  return out;
}

const isImageFill = (fill: unknown): boolean =>
  !!fill && typeof fill === 'object' && !Array.isArray(fill) &&
  ((fill as { type?: string }).type === 'image' ||
    (fill as { type?: string }).type === 'film' ||
    (fill as { type?: string }).type === 'video');

export { alignMap };
