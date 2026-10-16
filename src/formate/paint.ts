/**
 * formate：Leafer 的 fill / stroke（纯色 / 渐变）→ SVG 填充 / 描边属性与 `<defs>` 渐变定义。
 */
import type { FormatContext, IGradientDef, IGradientStopDef } from './typedefs';
import { colorParts, colorToCss, fmt, note, stopAttrs } from './util';

type AnyPaint = Record<string, any>;

const clamp01 = (v: number) => (isFinite(v) ? Math.max(0, Math.min(1, v)) : 0);

/** Leafer IAlign 方向 → objectBoundingBox 比例坐标（与 @leafer/core directionData 一致） */
const ALIGN_POINTS: Record<string, { x: number; y: number }> = {
  'top-left': { x: 0, y: 0 },
  topLeft: { x: 0, y: 0 },
  top: { x: 0.5, y: 0 },
  'top-right': { x: 1, y: 0 },
  topRight: { x: 1, y: 0 },
  right: { x: 1, y: 0.5 },
  'bottom-right': { x: 1, y: 1 },
  bottomRight: { x: 1, y: 1 },
  bottom: { x: 0.5, y: 1 },
  'bottom-left': { x: 0, y: 1 },
  bottomLeft: { x: 0, y: 1 },
  left: { x: 0, y: 0.5 },
  center: { x: 0.5, y: 0.5 },
};

const DEFAULT_POINT = { x: 0.5, y: 0.5 };

function resolvePoint(value: unknown, fallback: { x: number; y: number }): { x: number; y: number } {
  if (typeof value === 'string') return ALIGN_POINTS[value] ?? fallback;
  if (value && typeof value === 'object') {
    const p = value as { x?: number; y?: number };
    if (typeof p.x === 'number' && typeof p.y === 'number') return { x: p.x, y: p.y };
  }
  return fallback;
}

const isPxPoint = (value: unknown): boolean =>
  !!value && typeof value === 'object' && (value as { type?: string }).type === 'px';

/** Paint 数组 / 单个 Paint → 单个 Paint（SVG 仅支持单填充，多余层降级记录） */
function firstPaint(paint: unknown, ctx: FormatContext, at: string, tag?: string, id?: string): AnyPaint | undefined {
  if (Array.isArray(paint)) {
    if (!paint.length) return undefined;
    if (paint.length > 1) {
      note(ctx, at, 'degrade', `多重填充 / 描边（${paint.length} 层）仅保留第一层，其余舍弃`, tag, id);
    }
    return paint[0] as AnyPaint;
  }
  return paint as AnyPaint | undefined;
}

/**
 * 生成渐变 `<defs>` 定义并返回 `url(#id)`。
 * 返回 undefined 表示无法表达，由调用方降级（按无填充处理）。
 */
function gradientRef(
  paint: AnyPaint,
  ctx: FormatContext,
  kind: 'fill' | 'stroke',
  tag?: string,
  id?: string,
): string | undefined {
  const type: string = paint.type;
  const opacity = typeof paint.opacity === 'number' ? paint.opacity : 1;

  const stopsRaw = Array.isArray(paint.stops) ? paint.stops : [];
  const stops: IGradientStopDef[] = stopsRaw
    .map((s: any): IGradientStopDef => {
      const attrs =
        s && typeof s === 'object'
          ? stopAttrs(s.color, opacity)
          : stopAttrs(s, opacity);
      return { offset: clamp01(s && typeof s === 'object' ? s.offset ?? 0 : 0), attrs };
    })
    .sort((a, b) => a.offset - b.offset);

  if (!stops.length) {
    note(ctx, kind, 'degrade', '渐变无有效 stop，按无填充处理', tag, id);
    return undefined;
  }

  const gid = ctx.nextId();
  const def: IGradientDef = {
    id: gid,
    tag: type === 'radial' ? 'radialGradient' : 'linearGradient',
    attrs: { id: gid, gradientUnits: 'objectBoundingBox' },
    stops,
  };

  if (isPxPoint(paint.from) || isPxPoint(paint.to)) {
    note(ctx, kind, 'degrade', '渐变控制点为像素单位（userSpaceOnUse），已近似按包围盒比例输出', tag, id);
  }

  if (type === 'radial') {
    const from = resolvePoint(paint.from, DEFAULT_POINT);
    const to = resolvePoint(paint.to, { x: 0.5, y: 1 });
    const r = Math.hypot(to.x - from.x, to.y - from.y) || 0.5;
    def.attrs.cx = fmt(from.x, ctx.precision);
    def.attrs.cy = fmt(from.y, ctx.precision);
    def.attrs.r = fmt(r, ctx.precision);
    if (typeof paint.stretch === 'number' && Math.abs(paint.stretch - 1) > 1e-6) {
      note(
        ctx,
        kind,
        'degrade',
        `径向渐变 stretch=${paint.stretch}（椭圆渐变）无法用 SVG 圆形渐变表达，已按圆形输出`,
        tag,
        id,
      );
    }
    ctx.gradients.push(def);
    return `url(#${gid})`;
  }

  if (type === 'angular') {
    note(ctx, kind, 'degrade', '锥形渐变（angular）SVG 无对应，已降级为线性渐变', tag, id);
    def.tag = 'linearGradient';
  }

  const from = resolvePoint(paint.from, { x: 0, y: 0.5 });
  const to = resolvePoint(paint.to, { x: 1, y: 0.5 });
  def.attrs.x1 = fmt(from.x, ctx.precision);
  def.attrs.y1 = fmt(from.y, ctx.precision);
  def.attrs.x2 = fmt(to.x, ctx.precision);
  def.attrs.y2 = fmt(to.y, ctx.precision);
  if (typeof paint.rotation === 'number' && paint.rotation !== 0) {
    note(ctx, kind, 'degrade', `渐变 rotation=${paint.rotation} 无法映射到 SVG 渐变，已忽略`, tag, id);
  }
  ctx.gradients.push(def);
  return `url(#${gid})`;
}

/**
 * fill / stroke → SVG 属性。
 *
 * - 纯色：`fill="rgb(...)"`，透明度并入 `fill-opacity`（<1 时）
 * - 渐变：生成 `<defs>` 并以 `url(#id)` 引用
 * - 图片 / 图案填充：SVG 需 `<pattern>`，暂无法表达 → 舍弃并记录
 */
export function paintAttrs(
  paint: unknown,
  kind: 'fill' | 'stroke',
  ctx: FormatContext,
  tag?: string,
  id?: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (paint == null) return out;

  const single = firstPaint(paint, ctx, kind, tag, id);
  if (single == null) return out;

  // 纯色（字符串 或 { type:'solid', color, opacity }）
  if (typeof single === 'string' || single.type === 'solid' || single.type == null) {
    const color = typeof single === 'string' ? single : single.color;
    const opacity = typeof single === 'object' && typeof single.opacity === 'number' ? single.opacity : 1;
    const parts = colorParts(color);
    if (!parts) {
      if (typeof color === 'string') {
        out[kind] = color; // 无法解析的颜色原样透传
      } else {
        note(ctx, kind, 'degrade', '无法识别的颜色，已舍弃', tag, id);
      }
      return out;
    }
    out[kind] = colorToCss({ ...parts, a: 1 });
    const alpha = clamp01(parts.a * opacity);
    if (alpha < 1) out[`${kind}-opacity`] = fmt(alpha, 3);
    return out;
  }

  // 渐变
  if (single.type === 'linear' || single.type === 'radial' || single.type === 'angular') {
    const ref = gradientRef(single, ctx, kind, tag, id);
    if (ref) out[kind] = ref;
    else if (kind === 'fill') out[kind] = 'none';
    return out;
  }

  // 图片 / 视频 / 图案填充
  if (single.type === 'image' || single.type === 'film' || single.type === 'video') {
    note(ctx, kind, 'degrade', `图片 / 图案填充（${single.type}）需 SVG <pattern> 表达，已舍弃`, tag, id);
    if (kind === 'fill') out[kind] = 'none';
    return out;
  }

  note(ctx, kind, 'degrade', `未知填充类型 ${String(single.type)}，已舍弃`, tag, id);
  if (kind === 'fill') out[kind] = 'none';
  return out;
}
