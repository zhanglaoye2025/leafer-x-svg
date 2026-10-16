/**
 * formate：各类 Leafer 元素 → SVG 元素。
 *
 * 结构映射：
 * - Group / Box / Frame → `<g>`（Box / Frame 的填充 / 圆角无 SVG 对应，降级记录）
 * - Rect（圆形圆角 / 直角）→ `<rect>`；椭圆圆角（cornerRadius 各角不同）→ `<path>`
 * - Ellipse → `<ellipse>`；扇环（startAngle / endAngle / innerRadius）→ `<path>`
 * - Line → `<polyline>`；Polygon（带点 / 正多边形）→ `<polygon>`
 * - Path → `<path>`
 * - Text → `<text>`
 * - Image → `<image>`
 * - 未知 / 不支持 → 降级为 `<path>`（getPath(true)）或舍弃
 */
import type { FormatContext, IFormatElement, IFormatHelper } from './typedefs';
import { elementPathD, fmt, note, normalizePoints, pointsAttr, transformAttr } from './util';
import { commonPaintAttrs } from './attrs';

type AnyUI = Record<string, any>;

/** 元素自身局部矩阵 → transform 属性 */
function selfTransform(ui: AnyUI, ctx: FormatContext): string | undefined {
  const t = ui.localTransform as { a: number; b: number; c: number; d: number; e: number; f: number } | undefined;
  if (!t) return undefined;
  return transformAttr(t, ctx.precision);
}

/** 合并 transform 与通用外观 */
function baseAttrs(ui: AnyUI, ctx: FormatContext): Record<string, string> {
  const attrs: Record<string, string> = {};
  const tr = selfTransform(ui, ctx);
  if (tr) attrs.transform = tr;
  Object.assign(attrs, commonPaintAttrs(ui, ctx));
  return attrs;
}

/** 尺寸有效性检查（SVG 元素需正数宽高） */
function positiveSize(width: number, height: number): boolean {
  return isFinite(width) && isFinite(height) && width > 0 && height > 0;
}

/** cornerRadius → [tl, tr, br, bl]（数字 / 4 元数组 / 字符串已由 Leafer 归一化） */
function cornerList(ui: AnyUI): [number, number, number, number] | undefined {
  const raw = ui.cornerRadius;
  if (raw == null) return undefined;
  if (typeof raw === 'number') {
    return raw > 0 ? [raw, raw, raw, raw] : undefined;
  }
  if (Array.isArray(raw)) {
    const list = raw.map((v: unknown) => (typeof v === 'number' ? v : 0)) as number[];
    while (list.length < 4) list.push(0);
    return [list[0], list[1], list[2], list[3]];
  }
  return undefined;
}

/**
 * 生成圆角矩形 Path（各角独立圆形半径）以 origin 为 (0,0)。
 * 用于 cornerRadius 各角不一致时的降级输出。
 */
function roundedRectPath(
  width: number,
  height: number,
  [tl, tr, br, bl]: [number, number, number, number],
  ctx: FormatContext,
): string {
  // 相邻角半径不得超过边长（与 SVG spec 的独立 clamp 一致）
  const clampPair = (a: number, b: number, size: number): [number, number] => {
    const sum = a + b;
    if (sum <= size || sum === 0) return [a, b];
    const k = size / sum;
    return [a * k, b * k];
  };
  [tl, tr] = clampPair(tl, tr, width);
  [br, bl] = clampPair(br, bl, width);
  [tl, bl] = clampPair(tl, bl, height);
  [tr, br] = clampPair(tr, br, height);

  const f = (n: number) => fmt(n, ctx.precision);
  const arc = (r: number, toX: number, toY: number) =>
    r > 0
      ? `A ${f(r)} ${f(r)} 0 0 1 ${f(toX)} ${f(toY)}`
      : `L ${f(toX)} ${f(toY)}`;

  return [
    `M ${f(tl)} 0`,
    `L ${f(width - tr)} 0`,
    arc(tr, width, tr),
    `L ${f(width)} ${f(height - br)}`,
    arc(br, width - br, height),
    `L ${f(bl)} ${f(height)}`,
    arc(bl, 0, height - bl),
    `L 0 ${f(tl)}`,
    arc(tl, tl, 0),
    'Z',
  ].join(' ');
}

function buildRect(ui: AnyUI, ctx: FormatContext): IFormatElement | undefined {
  const width = ui.width ?? 0;
  const height = ui.height ?? 0;
  if (!positiveSize(width, height)) {
    note(ctx, 'Rect', 'skip', `尺寸无效（${width}×${height}），已舍弃`, ui.__tag, ui.id);
    return undefined;
  }
  const attrs = baseAttrs(ui, ctx);
  const corners = cornerList(ui);

  if (corners) {
    const [tl, tr, br, bl] = corners;
    const same = tl === tr && tr === br && br === bl;
    if (!same) {
      // SVG 的 rx / ry 是每角椭圆半径；Leafer 圆角为圆形，各角不同时降级为带圆角路径
      note(ctx, 'Rect', 'degrade', `各角圆角不一致（${corners.join('/')}），已降级为带圆角 path`, ui.__tag, ui.id);
      attrs.d = roundedRectPath(width, height, [tl, tr, br, bl], ctx);
      return { tag: 'path', attrs, children: [] };
    }
    if (tl > 0) {
      attrs.rx = fmt(Math.min(tl, width / 2), ctx.precision);
      attrs.ry = fmt(Math.min(tl, height / 2), ctx.precision);
    }
    if (ui.cornerSmoothing != null && ui.cornerSmoothing !== 0) {
      note(ctx, 'cornerSmoothing', 'degrade', '圆角平滑（cornerSmoothing）SVG 无对应，已忽略', ui.__tag, ui.id);
    }
  }

  attrs.x = '0';
  attrs.y = '0';
  attrs.width = fmt(width, ctx.precision);
  attrs.height = fmt(height, ctx.precision);
  return { tag: 'rect', attrs, children: [] };
}

function buildEllipse(ui: AnyUI, ctx: FormatContext): IFormatElement | undefined {
  const width = ui.width ?? 0;
  const height = ui.height ?? 0;
  const rx = width / 2;
  const ry = height / 2;
  if (!positiveSize(width, height)) {
    note(ctx, 'Ellipse', 'skip', `尺寸无效（${width}×${height}），已舍弃`, ui.__tag, ui.id);
    return undefined;
  }
  const attrs = baseAttrs(ui, ctx);

  const start = typeof ui.startAngle === 'number' ? ui.startAngle : undefined;
  const end = typeof ui.endAngle === 'number' ? ui.endAngle : undefined;
  const inner = typeof ui.innerRadius === 'number' ? ui.innerRadius : undefined;
  const isFull =
    (start == null || start === 0) && (end == null || end === 0) && (inner == null || inner === 0);

  if (isFull) {
    attrs.cx = fmt(rx, ctx.precision);
    attrs.cy = fmt(ry, ctx.precision);
    attrs.rx = fmt(rx, ctx.precision);
    attrs.ry = fmt(ry, ctx.precision);
    return { tag: 'ellipse', attrs, children: [] };
  }

  // 扇环 / 圆弧：SVG 无对应，降级为 path
  note(
    ctx,
    'Ellipse',
    'degrade',
    `扇环 / 圆弧（startAngle=${start ?? 0}, endAngle=${end ?? 0}, innerRadius=${inner ?? 0}）已降级为 path`,
    ui.__tag,
    ui.id,
  );
  const d = elementPathD(ui, ctx, ctx.precision);
  if (d) {
    attrs.d = d;
    return { tag: 'path', attrs, children: [] };
  }
  return undefined;
}

function buildLine(ui: AnyUI, ctx: FormatContext): IFormatElement | undefined {
  const pts = normalizePoints(ui.points);
  const attrs = baseAttrs(ui, ctx);

  // toPoint 形式（无 points）或 curve 平滑：无法用 points 属性表达，降级为 path
  if (!pts || pts.length < 2 || ui.curve) {
    const d = elementPathD(ui, ctx, ctx.precision);
    if (!d) {
      note(ctx, 'Line', 'skip', '折线无有效点数据或路径数据，已舍弃', ui.__tag, ui.id);
      return undefined;
    }
    note(
      ctx,
      'Line',
      'degrade',
      ui.curve ? 'curve 平滑的折线已降级为 path' : 'toPoint 形式的折线已降级为 path',
      ui.__tag,
      ui.id,
    );
    attrs.d = d;
    return { tag: 'path', attrs, children: [] };
  }

  attrs.points = pointsAttr(pts, ctx.precision);
  if (ui.closed === true) {
    // Leafer 的 Line 带 closed 时闭合；SVG 中对应 <polygon>
    return { tag: 'polygon', attrs, children: [] };
  }
  return { tag: 'polyline', attrs, children: [] };
}

function buildPolygon(ui: AnyUI, ctx: FormatContext): IFormatElement | undefined {
  const pts = normalizePoints(ui.points);
  const attrs = baseAttrs(ui, ctx);
  if (!pts || pts.length < 3 || ui.curve) {
    // 正多边形 / 无 points / curve 平滑：用路径表达
    const d = elementPathD(ui, ctx, ctx.precision);
    if (d) {
      note(
        ctx,
        'Polygon',
        'degrade',
        ui.curve ? 'curve 平滑的多边形已降级为 path' : '正多边形（sides / 无 points）已降级为 path',
        ui.__tag,
        ui.id,
      );
      attrs.d = d;
      return { tag: 'path', attrs, children: [] };
    }
    note(ctx, 'Polygon', 'skip', '多边形点数不足且无路径数据，已舍弃', ui.__tag, ui.id);
    return undefined;
  }
  attrs.points = pointsAttr(pts, ctx.precision);
  if (ui.closed === false) {
    return { tag: 'polyline', attrs, children: [] };
  }
  return { tag: 'polygon', attrs, children: [] };
}

function buildPath(ui: AnyUI, ctx: FormatContext): IFormatElement | undefined {
  const d = elementPathD(ui, ctx, ctx.precision);
  if (!d || !d.trim()) {
    note(ctx, 'Path', 'skip', '路径数据为空，已舍弃', ui.__tag, ui.id);
    return undefined;
  }
  const attrs = baseAttrs(ui, ctx);
  attrs.d = d;
  return { tag: 'path', attrs, children: [] };
}

function buildText(ui: AnyUI, ctx: FormatContext): IFormatElement | undefined {
  const attrs = baseAttrs(ui, ctx);
  const raw = ui.text == null ? '' : String(ui.text);
  if (!raw) {
    note(ctx, 'Text', 'skip', '文本内容为空，已舍弃', ui.__tag, ui.id);
    return undefined;
  }

  // 字体
  const fontSize = typeof ui.fontSize === 'number' && ui.fontSize > 0 ? ui.fontSize : 12;
  attrs['font-size'] = fmt(fontSize, ctx.precision);
  const family = ui.fontFamily;
  if (typeof family === 'string' && family && family !== 'caption') {
    attrs['font-family'] = family;
  }
  const weight = ui.fontWeight;
  if (weight != null && String(weight).toLowerCase() !== 'normal') {
    attrs['font-weight'] = String(weight);
  }
  if (ui.italic === true) attrs['font-style'] = 'italic';

  // 字距
  if (typeof ui.letterSpacing === 'number' && ui.letterSpacing !== 0) {
    attrs['letter-spacing'] = fmt(ui.letterSpacing, ctx.precision);
  }

  // 装饰
  const deco = ui.textDecoration;
  if (deco != null) {
    const t = typeof deco === 'string' ? deco : (deco as { type?: string }).type;
    const map: Record<string, string> = {
      under: 'underline',
      delete: 'line-through',
      'under-delete': 'underline line-through',
    };
    const v = map[t ?? ''];
    if (v) attrs['text-decoration'] = v;
  }

  if (ui.textCase != null && ui.textCase !== 'none') {
    note(ctx, 'textCase', 'degrade', `文字大小写（${ui.textCase}）SVG 无直接对应，已忽略`, ui.__tag, ui.id);
  }
  if (ui.lineHeight != null) {
    note(ctx, 'lineHeight', 'degrade', '行高 SVG 文本无对应属性，已忽略（行距由各行 y 坐标表达）', ui.__tag, ui.id);
  }

  // 行数据：Leafer 的 textDrawData.rows 已给出每行起点（x 已含 textAlign 对齐、y 为基线，
  // 均为元素局部坐标）。SVG <text> 的 (x,y) 正是字母基线起点，故直接对齐到 row.x / row.y，
  // 无需再做 text-anchor / boxWidth 换算。
  const drawData = ui.textDrawData as
    | { rows?: Array<{ x?: number; y: number; text?: string }> }
    | undefined;
  const rows = drawData?.rows?.length ? drawData.rows : [{ x: 0, y: 0, text: raw }];

  attrs.x = fmt(rows[0].x ?? 0, ctx.precision);
  attrs.y = fmt(rows[0].y, ctx.precision);

  // 多行 → 每行一个 tspan（绝对 x / y，行距与对齐由 Leafer 排版结果决定）
  if (rows.length > 1) {
    const children: IFormatElement[] = rows.slice(1).map((row) => ({
      tag: 'tspan',
      attrs: {
        x: fmt(row.x ?? 0, ctx.precision),
        y: fmt(row.y, ctx.precision),
      },
      text: row.text ?? '',
      children: [],
    }));
    return { tag: 'text', attrs, text: rows[0].text ?? raw, children };
  }

  return { tag: 'text', attrs, text: rows[0].text ?? raw, children: [] };
}

/** Leafer 图片填充模式 → SVG preserveAspectRatio */
const IMAGE_MODE_PRESERVE: Record<string, string> = {
  stretch: 'none',
  normal: 'none',
  cover: 'xMidYMid slice',
  fit: 'xMidYMid meet',
};

function buildImage(ui: AnyUI, ctx: FormatContext): IFormatElement | undefined {
  const width = ui.width ?? 0;
  const height = ui.height ?? 0;
  const attrs = baseAttrs(ui, ctx);

  // url 优先，其次 image fill 里的 url
  let url: string | undefined = typeof ui.url === 'string' ? ui.url : undefined;
  let mode: string | undefined;
  if (!url) {
    const fill = ui.fill;
    const single = Array.isArray(fill) ? fill[0] : fill;
    if (single && typeof single === 'object' && typeof (single as { url?: string }).url === 'string') {
      url = (single as { url: string }).url;
      mode = (single as { mode?: string }).mode;
    }
  }
  if (!url) {
    note(ctx, 'Image', 'skip', '图片地址为空，已舍弃', ui.__tag, ui.id);
    return undefined;
  }
  attrs.href = url;
  // <image> 的 fill 在 SVG 中无渲染效果（href 覆盖 fill），清除 fill 相关属性
  // （helper.buildImage 被外部用于自定义 __tag 元素时，commonPaintAttrs 可能误输出 fill）
  delete attrs.fill;
  delete attrs['fill-opacity'];
  delete attrs['fill-rule'];
  if (width > 0 && height > 0) {
    attrs.width = fmt(width, ctx.precision);
    attrs.height = fmt(height, ctx.precision);
    attrs.x = '0';
    attrs.y = '0';
    const preserve = (mode && IMAGE_MODE_PRESERVE[mode]) || 'none';
    attrs.preserveAspectRatio = preserve;
    if (mode === 'repeat' || mode === 'brush' || mode === 'clip') {
      note(ctx, 'image', 'degrade', `图片填充模式 ${mode} SVG <image> 无对应，已按拉伸输出`, ui.__tag, ui.id);
    }
  }
  return { tag: 'image', attrs, children: [] };
}

/** 容器（Group / Box / Frame）→ `<g>`；子元素由调用方填充 */
export function buildGroup(ui: AnyUI, ctx: FormatContext): IFormatElement {
  const attrs = baseAttrs(ui, ctx);
  const tag = ui.__tag as string | undefined;
  if (tag !== 'Group') {
    // Box / Frame / Pen 等容器带填充 / 圆角，SVG 的 <g> 无渲染外观
    if (ui.fill != null || ui.stroke != null || ui.cornerRadius != null) {
      note(ctx, tag ?? 'Group', 'degrade', `容器 ${tag} 的填充 / 描边 / 圆角 SVG <g> 无对应，已忽略`, tag, ui.id);
      delete attrs.fill;
      delete attrs.stroke;
      delete attrs['fill-opacity'];
      delete attrs['stroke-opacity'];
      delete attrs['stroke-width'];
      delete attrs['stroke-linecap'];
      delete attrs['stroke-linejoin'];
      delete attrs['stroke-miterlimit'];
      delete attrs['stroke-dasharray'];
      delete attrs['stroke-dashoffset'];
      delete attrs['vector-effect'];
      delete attrs['fill-rule'];
    }
    if (ui.overflow != null && ui.overflow !== 'show') {
      note(ctx, 'overflow', 'degrade', `容器裁剪（overflow=${ui.overflow}）SVG 需 clipPath 表达，已忽略`, tag, ui.id);
    }
    if (ui.mask != null && ui.mask !== false) {
      note(ctx, 'mask', 'degrade', '遮罩 SVG 需 mask 表达，已忽略', tag, ui.id);
    }
    if (ui.eraser != null && ui.eraser !== false) {
      note(ctx, 'eraser', 'degrade', '擦除 SVG 无对应，已忽略', tag, ui.id);
    }
  }
  return { tag: 'g', attrs, children: [] };
}

/** formate 能识别的 Leafer 元素类型（`__tag`） */
const KNOWN_TAGS = new Set([
  'Rect',
  'Ellipse',
  'Line',
  'Polygon',
  'Star',
  'Path',
  'Text',
  'Image',
  'Group',
  'Box',
  'Frame',
  'Pen',
  'Flow',
]);

/**
 * 判断 Leafer 元素的 `__tag` 是否为可识别的内置类型。
 * 无法识别（如用户自定义类型）时返回 false，交由 `onUnknownElement` 回调处理。
 */
export function isKnownTag(tag: string | undefined): boolean {
  return tag != null && KNOWN_TAGS.has(tag);
}

/** 按 Leafer 元素类型构造 SVG 元素；返回 undefined 表示整体舍弃 */
export function buildElement(ui: AnyUI, ctx: FormatContext): IFormatElement | undefined {
  const tag = ui.__tag as string | undefined;

  switch (tag) {
    case 'Rect':
      return buildRect(ui, ctx);
    case 'Ellipse':
      return buildEllipse(ui, ctx);
    case 'Line':
      return buildLine(ui, ctx);
    case 'Polygon':
    case 'Star':
      return tag === 'Star' ? buildFallbackPath(ui, ctx, 'Star') : buildPolygon(ui, ctx);
    case 'Path':
      return buildPath(ui, ctx);
    case 'Text':
      return buildText(ui, ctx);
    case 'Image':
      return buildImage(ui, ctx);
    case 'Group':
    case 'Box':
    case 'Frame':
    case 'Pen':
    case 'Flow':
      return buildGroup(ui, ctx);
    default:
      // 未知类型由 serializeNode 通过 onUnknownElement 回调处理，不应走到这里
      return undefined;
  }
}

/** 未知 / 原生 SVG 无对应的图元：降级为 path（getPath(true)） */
function buildFallbackPath(ui: AnyUI, ctx: FormatContext, label: string): IFormatElement | undefined {
  const d = elementPathD(ui, ctx, ctx.precision);
  if (!d || !d.trim()) {
    note(ctx, label, 'skip', `无法获取路径数据，已舍弃`, ui.__tag, ui.id);
    return undefined;
  }
  note(ctx, label, 'degrade', `SVG 无对应图元，已降级为 path`, ui.__tag, ui.id);
  const attrs = baseAttrs(ui, ctx);
  attrs.d = d;
  return { tag: 'path', attrs, children: [] };
}

/**
 * 创建绑定到当前序列化上下文的 `IFormatHelper`，
 * 供 `onUnknownElement` 回调复用内置图元构建器。
 */
export function createHelper(ctx: FormatContext): IFormatHelper {
  return {
    buildRect: (ui: AnyUI) => buildRect(ui, ctx),
    buildEllipse: (ui: AnyUI) => buildEllipse(ui, ctx),
    buildLine: (ui: AnyUI) => buildLine(ui, ctx),
    buildPolygon: (ui: AnyUI) => buildPolygon(ui, ctx),
    buildPath: (ui: AnyUI) => buildPath(ui, ctx),
    buildText: (ui: AnyUI) => buildText(ui, ctx),
    buildImage: (ui: AnyUI) => buildImage(ui, ctx),
    buildGroup: (ui: AnyUI) => buildGroup(ui, ctx),
    buildFallbackPath: (ui: AnyUI, label?: string) =>
      buildFallbackPath(ui, ctx, label ?? (ui.__tag as string | undefined) ?? 'Unknown'),
  };
}

export {
  buildRect,
  buildEllipse,
  buildLine,
  buildPolygon,
  buildPath,
  buildText,
  buildImage,
  buildFallbackPath,
  selfTransform,
};
