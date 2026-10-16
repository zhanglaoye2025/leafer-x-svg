/**
 * formate（Leafer 对象 → SVG）内部工具：数值格式化、矩阵 / 点 / 路径 / 颜色转换。
 */
import type { FormatContext, IFormatDegrade } from './typedefs';
import { Color } from '../parser/color/Color';

/** 记录一条降级 / 舍弃信息 */
export function note(
  ctx: FormatContext,
  at: string,
  action: IFormatDegrade['action'],
  detail: string,
  tag?: string,
  id?: string,
): void {
  ctx.degrades.push({ at, action, detail, tag, id });
}

/** 数值 → 字符串（保留 precision 位小数并去掉多余的 0） */
export function fmt(value: number, precision: number): string {
  if (!isFinite(value)) return '0';
  let s = Number(value).toFixed(precision);
  if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s === '-0' ? '0' : s;
}

const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;

export interface IMatrixLike {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

/** 矩阵 → SVG `transform` 属性值；单位矩阵返回 undefined */
export function transformAttr(m: IMatrixLike, precision: number): string | undefined {
  const { a, b, c, d, e, f } = m;
  if (
    near(a, 1) && near(b, 0) && near(c, 0) &&
    near(d, 1) && near(e, 0) && near(f, 0)
  ) {
    return undefined;
  }
  // 纯平移 → translate（可读性更好）
  if (near(b, 0) && near(c, 0) && near(a, 1) && near(d, 1)) {
    return `translate(${fmt(e, precision)},${fmt(f, precision)})`;
  }
  return `matrix(${fmt(a, precision)} ${fmt(b, precision)} ${fmt(c, precision)} ${fmt(d, precision)} ${fmt(e, precision)} ${fmt(f, precision)})`;
}

/** 单位矩阵判定 */
export function isIdentity(m: IMatrixLike): boolean {
  return (
    near(m.a, 1) && near(m.b, 0) && near(m.c, 0) &&
    near(m.d, 1) && near(m.e, 0) && near(m.f, 0)
  );
}

export interface IPoint {
  x: number;
  y: number;
}

/**
 * Leafer `points`（number[] 平铺 或 [x,y][] 或 IPointData[]）→ {x,y}[]。
 * 返回 undefined 表示没有可用点数据。
 */
export function normalizePoints(points: unknown): IPoint[] | undefined {
  if (!points || !Array.isArray(points) || !points.length) return undefined;
  if (typeof points[0] === 'number') {
    const out: IPoint[] = [];
    const arr = points as number[];
    for (let i = 0; i + 1 < arr.length; i += 2) {
      out.push({ x: arr[i], y: arr[i + 1] });
    }
    return out.length ? out : undefined;
  }
  const out: IPoint[] = [];
  for (const p of points as unknown[]) {
    if (Array.isArray(p) && p.length >= 2 && typeof p[0] === 'number' && typeof p[1] === 'number') {
      out.push({ x: p[0], y: p[1] });
    } else if (p && typeof p === 'object') {
      const o = p as { x?: number; y?: number };
      if (typeof o.x === 'number' && typeof o.y === 'number') out.push({ x: o.x, y: o.y });
    }
  }
  return out.length ? out : undefined;
}

/** 点数组 → SVG `points` 属性值 */
export function pointsAttr(points: IPoint[], precision: number): string {
  return points.map((p) => `${fmt(p.x, precision)},${fmt(p.y, precision)}`).join(' ');
}

/** 路径命令码（Leafer PathCommandMap：M=1 L=2 C=5 Q=7 Z=11） */
const enum Cmd {
  M = 1,
  L = 2,
  C = 5,
  Q = 7,
  Z = 11,
}

/**
 * Leafer 路径命令数组（IPathCommandData）→ SVG `d` 字符串。
 * 仅处理画布标准命令 M / L / C / Q / Z（`getPath(true)` 已把圆弧 / 圆角矩形折算为曲线）。
 * 遇到无法识别的命令或非数值坐标会停下并在 ctx 中记录降级。
 */
export function pathDataToD(data: number[], ctx: FormatContext, precision: number): string {
  const out: string[] = [];
  let i = 0;
  const n = data.length;
  const num = (v: unknown): number | undefined => {
    return typeof v === 'number' && isFinite(v) ? v : undefined;
  };
  const seq = (start: number, count: number): boolean => {
    for (let k = start; k < start + count; k++) if (num(data[k]) === undefined) return false;
    return true;
  };
  while (i < n) {
    const cmd = data[i];
    switch (cmd) {
      case Cmd.M:
        if (!seq(i + 1, 2)) return out.join(' ');
        out.push(`M ${fmt(data[i + 1], precision)} ${fmt(data[i + 2], precision)}`);
        i += 3;
        break;
      case Cmd.L:
        if (!seq(i + 1, 2)) return out.join(' ');
        out.push(`L ${fmt(data[i + 1], precision)} ${fmt(data[i + 2], precision)}`);
        i += 3;
        break;
      case Cmd.C:
        if (!seq(i + 1, 6)) return out.join(' ');
        out.push(
          `C ${fmt(data[i + 1], precision)} ${fmt(data[i + 2], precision)} ${fmt(data[i + 3], precision)} ${fmt(data[i + 4], precision)} ${fmt(data[i + 5], precision)} ${fmt(data[i + 6], precision)}`,
        );
        i += 7;
        break;
      case Cmd.Q:
        if (!seq(i + 1, 4)) return out.join(' ');
        out.push(
          `Q ${fmt(data[i + 1], precision)} ${fmt(data[i + 2], precision)} ${fmt(data[i + 3], precision)} ${fmt(data[i + 4], precision)}`,
        );
        i += 5;
        break;
      case Cmd.Z:
        out.push('Z');
        i += 1;
        break;
      default:
        note(ctx, 'path', 'degrade', `无法识别的路径命令码 ${cmd}，其后部分被截断`);
        return out.join(' ');
    }
  }
  return out.join(' ');
}

/**
 * 提取元素的 SVG `d` 字符串。
 *
 * 优先使用 Path 的原始字符串路径（无损、与 SVG `d` 语法一致）；
 * 否则调用 `getPath(true)` 取曲线化的路径命令数组（Leafer 会把圆弧 / 椭圆等
 * 折算为标准的 M/L/C/Q/Z），再转成 SVG `d`。
 *
 * 注意：不能直接读 `ui.path` 的命令数组——那是画布命令（含 R、21~28 等非 SVG 标准码），
 * 语义无法可靠反解，必须走 `getPath(true)` 的曲线模式。
 */
export function elementPathD(
  ui: { path?: unknown; getPath?: (curve?: boolean) => number[] },
  ctx: FormatContext,
  precision: number,
): string | undefined {
  const raw = ui.path;
  if (typeof raw === 'string' && raw.trim()) return raw.trim();

  let data: number[] | undefined;
  if (typeof ui.getPath === 'function') {
    try {
      data = ui.getPath(true);
    } catch {
      data = undefined;
    }
  }
  if (!data || !data.length) return undefined;
  return pathDataToD(data, ctx, precision);
}

// ---- 颜色 ----

function round255(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

interface IRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** 颜色（字符串 或 {r,g,b,a}）→ RGBA 分量；无法识别返回 undefined */
export function colorParts(color: unknown): IRGBA | undefined {
  if (typeof color === 'string') {
    const c = new Color(color);
    if (c.isUnrecognised) return undefined;
    const [r, g, b, a] = c.getSource();
    return { r, g, b, a };
  }
  if (color && typeof color === 'object') {
    const o = color as { r?: number; g?: number; b?: number; a?: number };
    if (typeof o.r === 'number' && typeof o.g === 'number' && typeof o.b === 'number') {
      return { r: o.r, g: o.g, b: o.b, a: typeof o.a === 'number' ? o.a : 1 };
    }
  }
  return undefined;
}

/** 颜色 → CSS 字符串（透明度折算进 rgba） */
export function colorToCss(color: unknown, alphaScale = 1): string {
  if (typeof color === 'string') {
    const parts = colorParts(color);
    if (!parts) return color; // 无法识别时原样透传
    const a = parts.a * alphaScale;
    return a >= 1
      ? `rgb(${round255(parts.r)},${round255(parts.g)},${round255(parts.b)})`
      : `rgba(${round255(parts.r)},${round255(parts.g)},${round255(parts.b)},${fmt(a, 3)})`;
  }
  const parts = colorParts(color);
  if (!parts) return '';
  const a = parts.a * alphaScale;
  return a >= 1
    ? `rgb(${round255(parts.r)},${round255(parts.g)},${round255(parts.b)})`
    : `rgba(${round255(parts.r)},${round255(parts.g)},${round255(parts.b)},${fmt(a, 3)})`;
}

/** 颜色 → `stop-color` + `stop-opacity`（SVG 规范里颜色与透明度分开表达） */
export function stopAttrs(color: unknown, alphaScale = 1): Record<string, string> {
  const parts = colorParts(color);
  if (!parts) {
    return { 'stop-color': typeof color === 'string' ? color : '#000000' };
  }
  const a = parts.a * alphaScale;
  const attrs: Record<string, string> = {
    'stop-color': `rgb(${round255(parts.r)},${round255(parts.g)},${round255(parts.b)})`,
  };
  if (a < 1) attrs['stop-opacity'] = fmt(a, 3);
  return attrs;
}

/** XML 文本转义 */
export function escapeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** XML 属性值转义 */
export function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
