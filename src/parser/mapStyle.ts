/**
 * SVG 解析属性（fabric 风格命名）→ LeaferUI 属性的映射。
 *
 * 解析层（parser/）输出的属性名沿用 fabric 的 camelCase 命名（如 strokeDashArray、charSpacing），
 * 本模块负责把它们翻译成 LeaferUI 真实支持的属性（dashPattern、letterSpacing…），
 * 避免无效的 fabric 命名被直接泄漏进 Leafer 对象。
 */
import type {
  IFill,
  IFontWeight,
  IStroke,
  IStrokeCap,
  IStrokeJoin,
  ITextDecoration,
  IWindingRule,
} from 'leafer-ui';
import { parsePaintReference } from './gradient';
import { toFixed } from './util/misc/toFixed';

const capMap: Record<string, IStrokeCap> = {
  butt: 'none',
  round: 'round',
  square: 'square',
};

const joinMap: Record<string, IStrokeJoin> = {
  miter: 'miter',
  bevel: 'bevel',
  round: 'round',
};

const isNone = (value: unknown) =>
  value === '' || value === 'none' || value === 'transparent';

/**
 * 映射 SVG 的填充 / 描边颜色（含渐变引用）为 LeaferUI 的 fill / stroke。
 *
 * - SVG 的 `fill` 默认值是黑色、`stroke` 默认值是无描边，与浏览器行为保持一致
 * - `fill="none"` 映射为 `fill: null`（Leafer 中 fill 为假值时不填充）
 * - 纯色的 `fill-opacity` / `stroke-opacity` 已由解析层合并进 rgba，此处不再重复处理
 * - `url(#gradient)` 通过 `resolvePaint` 回调解析为 Paint 对象，无法解析时按无填充处理
 */
export function mapPaintAttrs(
  attrs: Record<string, any>,
  resolvePaint: (
    value: string,
    kind: 'fill' | 'stroke',
  ) => IFill | IStroke | undefined,
): Record<string, any> {
  const out: Record<string, any> = {};
  const fillOpacity = typeof attrs.fillOpacity === 'number' ? attrs.fillOpacity : 1;
  const strokeOpacity = typeof attrs.strokeOpacity === 'number' ? attrs.strokeOpacity : 1;

  const rawFill = attrs.fill ?? 'black';
  if (typeof rawFill === 'string') {
    if (isNone(rawFill)) {
      out.fill = null;
    } else if (parsePaintReference(rawFill)) {
      const paint = resolvePaint(rawFill, 'fill');
      out.fill = paint === undefined ? null : applyPaintOpacity(paint, fillOpacity);
    } else {
      // 纯色：透明度已在解析层合并，直接透传
      out.fill = rawFill;
    }
  } else if (rawFill != null) {
    out.fill = applyPaintOpacity(rawFill, fillOpacity);
  }

  const rawStroke = attrs.stroke;
  if (typeof rawStroke === 'string') {
    if (!isNone(rawStroke)) {
      if (parsePaintReference(rawStroke)) {
        const paint = resolvePaint(rawStroke, 'stroke');
        if (paint !== undefined) out.stroke = applyPaintOpacity(paint, strokeOpacity);
      } else {
        out.stroke = rawStroke;
      }
      if (out.stroke != null) {
        // SVG 的描边沿路径居中展开，Leafer 对闭合图形默认内描边，需显式对齐
        out.strokeAlign = 'center';
      }
    }
  } else if (rawStroke != null) {
    out.stroke = applyPaintOpacity(rawStroke, strokeOpacity);
    out.strokeAlign = 'center';
  }

  return out;
}

/** 渐变 / 图案 Paint 通过 opacity 字段叠加 *-opacity；纯色已在解析层合并 */
const applyPaintOpacity = (paint: IFill | IStroke, alpha: number) => {
  if (typeof paint === 'string' || alpha >= 1) return paint;
  return { ...paint, opacity: ((paint as any).opacity ?? 1) * alpha } as IFill;
};

/**
 * 映射 SVG 的样式属性（不含 fill / stroke 颜色）为 LeaferUI 属性。
 * 几何 / 变换属性（x、y、transform…）以及 opacity / visible 由 index.ts 统一处理
 * （层级模式下它们由父级 Group 承担，避免与 Group 上的值重复叠加）。
 *
 * @param isText 是否为 `<text>` 元素：字体相关属性只对文本生效，避免泄漏到图形元素
 */
export function mapStyleAttrs(
  attrs: Record<string, any>,
  isText = false,
): Record<string, any> {
  const out: Record<string, any> = {};

  // ---- 描边样式 ----
  if (typeof attrs.strokeWidth === 'number') out.strokeWidth = attrs.strokeWidth;
  if (Array.isArray(attrs.strokeDashArray)) {
    const pattern = attrs.strokeDashArray.filter(
      (n: unknown) => typeof n === 'number' && isFinite(n),
    );
    // SVG: 虚线数组为奇数个值时复制一遍
    if (pattern.length && pattern.length % 2 === 1) pattern.push(...pattern);
    if (pattern.length) out.dashPattern = pattern;
  }
  if (typeof attrs.strokeDashOffset === 'number' && attrs.strokeDashOffset !== 0) {
    out.dashOffset = attrs.strokeDashOffset;
  }
  if (attrs.strokeLineCap && capMap[attrs.strokeLineCap]) {
    out.strokeCap = capMap[attrs.strokeLineCap];
  }
  if (attrs.strokeLineJoin && joinMap[attrs.strokeLineJoin]) {
    out.strokeJoin = joinMap[attrs.strokeLineJoin];
  }
  if (typeof attrs.strokeMiterLimit === 'number') out.miterLimit = attrs.strokeMiterLimit;
  // vector-effect: non-scaling-stroke（解析为 strokeUniform）→ 线宽不随缩放变化
  if (attrs.strokeUniform === true) out.strokeScaleFixed = true;
  // fill-rule → windingRule
  if (attrs.fillRule === 'evenodd' || attrs.fillRule === 'nonzero') {
    out.windingRule = attrs.fillRule as IWindingRule;
  }

  // ---- 文本样式（仅 <text>）----
  if (isText) {
    if (typeof attrs.fontSize === 'number' && attrs.fontSize > 0) out.fontSize = attrs.fontSize;
    if (typeof attrs.fontFamily === 'string' && attrs.fontFamily) out.fontFamily = attrs.fontFamily;
    const fontWeight = mapFontWeight(attrs.fontWeight);
    if (fontWeight != null) out.fontWeight = fontWeight;
    if (attrs.fontStyle === 'italic') out.italic = true;
    if (typeof attrs.charSpacing === 'number' && attrs.charSpacing !== 0) {
      // fabric 的 charSpacing 是 1/1000 em 单位，Leafer 的 letterSpacing 是 px
      out.letterSpacing = toFixed((attrs.charSpacing / 1000) * (attrs.fontSize || 16), 2);
    }
    const decoration = mapTextDecoration(attrs.textDecoration);
    if (decoration) out.textDecoration = decoration;
  }

  return out;
}

/** SVG font-weight（关键字或数字）→ Leafer 的 IFontWeight */
export function mapFontWeight(value: unknown): IFontWeight | undefined {
  if (value == null) return undefined;
  const text = String(value).trim().toLowerCase();
  if (!text) return undefined;
  if (text === 'normal') return 400;
  const numeric = parseInt(text, 10);
  if (!isNaN(numeric)) {
    return Math.min(900, Math.max(100, Math.round(numeric / 100) * 100)) as IFontWeight;
  }
  const map: Record<string, IFontWeight> = {
    bold: 700,
    bolder: 700,
    lighter: 300,
    thin: 100,
    hairline: 100,
    'extra-light': 200,
    'ultra-light': 200,
    light: 300,
    medium: 500,
    'semi-bold': 600,
    demibold: 600,
    'extra-bold': 800,
    'ultra-bold': 800,
    black: 900,
    heavy: 900,
  };
  return map[text];
}

/**
 * SVG text-decoration → Leafer 的 ITextDecoration。
 * 注意：Leafer 不支持 overline（上划线），含 overline 的装饰会被忽略。
 */
export function mapTextDecoration(value: unknown): ITextDecoration | undefined {
  if (!value) return undefined;
  const text = String(value).toLowerCase();
  if (text.includes('none')) return 'none';
  const under = text.includes('underline');
  const strike = text.includes('line-through');
  if (under && strike) return 'under-delete';
  if (strike) return 'delete';
  if (under) return 'under';
  return undefined;
}
