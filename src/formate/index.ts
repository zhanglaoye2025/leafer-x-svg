/**
 * formate：Leafer 对象 → SVG 字符串。
 *
 * 与 parse 相反方向的转换：把 LeaferUI 可视化对象（Group / Path / Rect / Ellipse /
 * Line / Polygon / Text / Image 等）序列化为 SVG 文本。
 *
 * - 无对应 SVG 语义的属性 / 图元按"降级处理"（几何近似为 path 等），
 *   降级不了的（如图片填充、阴影、锥形渐变、擦除等）直接舍弃，
 *   所有降级 / 舍弃都会记录到 `FormatResult.degrades`（并可选写入 SVG 注释）。
 * - 不影响 parse 流程：formate 只读 Leafer 对象，不修改任何解析代码路径。
 */
import type { UI } from 'leafer-ui';
import type {
  FormatContext,
  FormatOptions,
  IFormatDegrade,
  IFormatElement,
  IGradientDef,
  IUnknownElementContext,
} from './typedefs';
import { buildElement, buildGroup, isKnownTag, createHelper } from './elements';
import { note } from './util';
import { renderSvg } from './serialize';

export type {
  FormatOptions,
  IFormatDegrade,
  IFormatElement,
  IFormatHelper,
  IUnknownElementContext,
  IUnknownElementHandler,
} from './typedefs';

/** formate 的返回结果 */
export interface FormateResult {
  /** 生成的 SVG 字符串 */
  svg: string;
  /** 降级 / 舍弃记录 */
  degrades: IFormatDegrade[];
}

type AnyUI = Record<string, any>;

/**
 * 递归序列化一个 Leafer 元素（含子级）。
 * 返回数组：0 个 = 全部舍弃，1 个 = 正常输出，>1 个 = 元素本身被舍弃但子元素被提升到父级。
 */
function serializeNode(ui: AnyUI, ctx: FormatContext): IFormatElement[] {
  if (ctx.seen.has(ui)) return [];
  ctx.seen.add(ui);

  const tag = ui.__tag as string | undefined;
  const children = ((ui.children as AnyUI[]) ?? []).filter(Boolean);

  // ---- 未知 / 自定义类型：走 onUnknownElement 回调 ----
  if (!isKnownTag(tag)) {
    return serializeUnknown(ui, tag, children, ctx);
  }

  // ---- 已知容器 ----
  if (isGroupLike(ui)) {
    const el = buildGroup(ui, ctx);
    let count = 0;
    for (const child of children) {
      for (const childEl of serializeNode(child, ctx)) {
        el.children.push(childEl);
        count++;
      }
    }
    if (!count && children.length) {
      note(ctx, tag ?? 'Group', 'degrade', '容器内所有子元素均已舍弃，输出空 <g>', tag, ui.id);
    }
    return [el];
  }

  // ---- 已知叶子 ----
  const el = buildElement(ui, ctx);
  return el ? [el] : [];
}

/**
 * 未知 / 自定义类型元素的序列化：
 * - `onUnknownElement` 返回有效 `IFormatElement` → 采用为该元素输出，子元素递归后挂到其下
 * - 回调未提供 / 返回空 / 抛出异常 → 舍弃该元素，子元素递归后提升到父级
 */
function serializeUnknown(
  ui: AnyUI,
  tag: string | undefined,
  children: AnyUI[],
  ctx: FormatContext,
): IFormatElement[] {
  const handler = ctx.onUnknownElement;
  const label = tag ?? 'Unknown';

  // 调用外部回调（若提供）
  let custom: IFormatElement | undefined | null;
  let thrown = false;
  if (handler) {
    const cbCtx: IUnknownElementContext = {
      ui: ui as unknown as UI,
      tag: label,
      id: typeof ui.id === 'string' ? ui.id : undefined,
      hasChildren: children.length > 0,
      note: (action, detail) => note(ctx, label, action, detail, tag, ui.id),
      helper: createHelper(ctx),
    };
    try {
      custom = handler(cbCtx);
    } catch {
      thrown = true;
      note(ctx, label, 'skip', 'onUnknownElement 回调抛出异常，已舍弃', tag, ui.id);
      custom = undefined;
    }
  }

  // 回调返回有效元素 → 采用，子元素挂到返回元素下
  if (custom && typeof custom.tag === 'string' && custom.tag.trim()) {
    if (!Array.isArray(custom.children)) custom.children = [];
    for (const child of children) {
      for (const childEl of serializeNode(child, ctx)) {
        custom.children.push(childEl);
      }
    }
    return [custom];
  }

  // 回调未提供 / 返回空 → 舍弃该元素，但子元素走正常递归（提升到父级）
  // （回调抛异常时已在上方记录，不重复记录）
  if (!thrown) {
    note(
      ctx,
      label,
      'skip',
      handler
        ? 'onUnknownElement 返回空，已舍弃'
        : '未知类型且未提供 onUnknownElement 回调，已舍弃',
      tag,
      ui.id,
    );
  }

  const hoisted: IFormatElement[] = [];
  for (const child of children) {
    hoisted.push(...serializeNode(child, ctx));
  }
  return hoisted;
}

function isGroupLike(ui: AnyUI): boolean {
  const tag = ui.__tag as string | undefined;
  return tag === 'Group' || tag === 'Box' || tag === 'Frame' || tag === 'Pen' || tag === 'Flow';
}

/** 计算内容包围盒（世界坐标），用于推导 viewBox */
function unionBounds(nodes: AnyUI[]): { x: number; y: number; width: number; height: number } | undefined {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let has = false;

  const visit = (ui: AnyUI) => {
    const b = (ui.worldRenderBounds ?? ui.worldBoxBounds) as
      | { x?: number; y?: number; width?: number; height?: number }
      | undefined;
    if (b && isFinite(b.x!) && isFinite(b.y!) && isFinite(b.width!) && isFinite(b.height!)) {
      minX = Math.min(minX, b.x!);
      minY = Math.min(minY, b.y!);
      maxX = Math.max(maxX, b.x! + b.width!);
      maxY = Math.max(maxY, b.y! + b.height!);
      has = true;
    }
    const children = ui.children;
    if (Array.isArray(children)) for (const c of children) c && visit(c as AnyUI);
  };
  for (const n of nodes) n && visit(n);
  return has ? { x: minX, y: minY, width: maxX - minX, height: maxY - minY } : undefined;
}

let idCounter = 0;

/**
 * 把 Leafer 对象序列化为 SVG 字符串。
 *
 * @param input 单个 Leafer 元素，或元素数组，或带 children 的 Group
 * @param options 序列化选项
 * @returns SVG 字符串与降级 / 舍弃记录
 */
export function formate(input: UI | UI[] | AnyUI, options: FormatOptions = {}): FormateResult {
  const precision = options.precision ?? 4;
  const pretty = options.pretty !== false;
  const includeReport = options.includeReport !== false;

  const inputs: AnyUI[] = Array.isArray(input)
    ? (input as AnyUI[]).filter(Boolean)
    : input
      ? [input as AnyUI]
      : [];

  const degrades: IFormatDegrade[] = [];
  const ctx: FormatContext = {
    precision,
    seen: new Set<object>(),
    degrades,
    nextId: () => `g${++idCounter}`,
    gradients: [] as IGradientDef[],
    onUnknownElement: options.onUnknownElement,
  };

  const roots: IFormatElement[] = [];
  for (const node of inputs) {
    if (!node) continue;
    roots.push(...serializeNode(node, ctx));
  }

  if (!roots.length) {
    note(ctx, 'formate', 'skip', '没有可序列化的有效元素');
  }

  // viewBox / width / height
  const bounds = unionBounds(inputs);
  let viewBox: [number, number, number, number];
  if (options.viewBox) {
    viewBox = options.viewBox;
  } else if (bounds && bounds.width > 0 && bounds.height > 0) {
    viewBox = [bounds.x, bounds.y, bounds.width, bounds.height];
  } else {
    viewBox = [0, 0, options.width ?? 100, options.height ?? 100];
    note(ctx, 'viewBox', 'degrade', '无法确定内容包围盒，viewBox 使用默认值');
  }

  const rootAttrs: Record<string, string> = {
    viewBox: viewBox.map((n) => String(Number(n.toFixed(precision)))).join(' '),
  };
  const width = options.width ?? viewBox[2];
  const height = options.height ?? viewBox[3];
  rootAttrs.width = String(Number(width.toFixed(precision)));
  rootAttrs.height = String(Number(height.toFixed(precision)));
  if (options.preserveAspectRatio) rootAttrs.preserveAspectRatio = options.preserveAspectRatio;

  const svg = renderSvg(roots, ctx.gradients, rootAttrs, ctx, pretty, includeReport);

  if (options.onDegrade) for (const d of degrades) options.onDegrade(d);

  return { svg, degrades };
}

export default formate;
