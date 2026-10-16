/**
 * Leafer 对象 → SVG 字符串（formate）的类型定义与运行时上下文。
 */
import type { UI } from 'leafer-ui';

/** 降级 / 舍弃记录的条目 */
export interface IFormatDegrade {
  /** 发生位置：元素类型或属性名，如 `Rect`、`fill` */
  at: string;
  /** Leafer 元素的 __tag */
  tag?: string;
  /** Leafer 元素的 id（若有） */
  id?: string;
  /** 处理方式 */
  action: 'degrade' | 'skip';
  /** 具体说明 */
  detail: string;
}

export interface FormatOptions {
  /**
   * 根 `<svg>` 的 width / height。
   * 不提供时自动取内容包围盒（含描边），原点归零后输出 viewBox。
   */
  width?: number;
  height?: number;
  /** 根 `<svg>` 的 viewBox [minX, minY, width, height]。不提供时按内容包围盒推导 */
  viewBox?: [number, number, number, number];
  /** 根 `<svg>` 的 preserveAspectRatio，默认 `xMidYMid meet` */
  preserveAspectRatio?: string;
  /** 小数保留位数，默认 4（与解析层 toFixed 精度一致） */
  precision?: number;
  /** 是否格式化输出（缩进换行），默认 true */
  pretty?: boolean;
  /** 是否输出降级 / 舍弃记录（写到 SVG 注释里），默认 true */
  includeReport?: boolean;
  /** 收集降级 / 舍弃记录（includeReport 为 false 时也可用它获取记录） */
  onDegrade?: (item: IFormatDegrade) => void;
  /**
   * 未知 / 自定义类型元素（`__tag` 无法识别）的外部处理回调。
   * - 回调返回 `IFormatElement` → 采用为该元素的 SVG 输出，
   *   其 `children` 不为空时子元素走正常递归流程并挂到返回元素下
   * - 回调为空（未提供）或返回空（`undefined` / `null` / 无有效 `tag`）→ 舍弃该元素，
   *   其 `children` 不为空时子元素仍走正常递归流程（提升到父级输出）
   */
  onUnknownElement?: IUnknownElementHandler;
}

/** 递归序列化时的内部上下文 */
export interface FormatContext {
  precision: number;
  seen: Set<object>;
  degrades: IFormatDegrade[];
  /** 自增 id 生成器，用于渐变 `<defs>` 的引用 id */
  nextId: () => string;
  /** 渐变定义收集（元素 id → `<linearGradient>` / `<radialGradient>` 属性与 stop） */
  gradients: IGradientDef[];
  /** 未知 / 自定义类型元素的外部处理回调 */
  onUnknownElement?: IUnknownElementHandler;
}

export interface IGradientStopDef {
  offset: number;
  /** `<stop>` 的完整属性（含 stop-color / stop-opacity） */
  attrs: Record<string, string>;
}

/**
 * 内置图元构建器集合，供 `onUnknownElement` 回调复用。
 * 每个方法对应一个内置图元构建逻辑（与 formate 内部一致的降级 / 属性映射），
 * 外部可直接调用生成 `IFormatElement`。
 */
export interface IFormatHelper {
  /** 构建 `<rect>` / 圆角降级 `<path>` */
  buildRect(ui: UI): IFormatElement | undefined;
  /** 构建 `<ellipse>` / 扇环降级 `<path>` */
  buildEllipse(ui: UI): IFormatElement | undefined;
  /** 构建 `<polyline>` / `<polygon>` / 降级 `<path>` */
  buildLine(ui: UI): IFormatElement | undefined;
  /** 构建 `<polygon>` / `<polyline>` / 降级 `<path>` */
  buildPolygon(ui: UI): IFormatElement | undefined;
  /** 构建 `<path>` */
  buildPath(ui: UI): IFormatElement | undefined;
  /** 构建 `<text>` / 多行 `<tspan>` */
  buildText(ui: UI): IFormatElement | undefined;
  /** 构建 `<image>` */
  buildImage(ui: UI): IFormatElement | undefined;
  /** 构建容器 `<g>`（在 `onUnknownElement` 中返回时，子元素由 formate 递归后自动挂载） */
  buildGroup(ui: UI): IFormatElement;
  /** 未知 / 无 SVG 对应的图元降级为 `<path>`（getPath(true)） */
  buildFallbackPath(ui: UI, label?: string): IFormatElement | undefined;
}

/** 传给 `onUnknownElement` 回调的元素上下文（供外部自行处理） */
export interface IUnknownElementContext {
  /** 元素的 Leafer 对象（只读参考，可读取自定义属性） */
  ui: UI;
  /** Leafer 元素的 `__tag`（无法识别的类型名） */
  tag: string;
  /** Leafer 元素的 `id`（若有） */
  id?: string;
  /** 是否有未处理的子元素（不为空时子元素会走正常递归流程） */
  hasChildren: boolean;
  /**
   * 记录降级 / 舍弃信息（写入 `FormateResult.degrades`）。
   * 外部处理时可借此补充说明。
   */
  note: (action: 'degrade' | 'skip', detail: string) => void;
  /** 内置图元构建器集合，外部可复用生成 `IFormatElement` */
  helper: IFormatHelper;
}

/**
 * 未知 / 自定义类型元素的处理回调。
 * 返回 `IFormatElement` 则采用；返回空（`undefined` / `null` / 无有效 `tag`）则舍弃该元素。
 */
export type IUnknownElementHandler = (
  ctx: IUnknownElementContext,
) => IFormatElement | undefined | null;

export interface IGradientDef {
  id: string;
  tag: 'linearGradient' | 'radialGradient';
  attrs: Record<string, string>;
  stops: IGradientStopDef[];
}

/** 序列化出的一个 SVG 元素 */
export interface IFormatElement {
  tag: string;
  attrs: Record<string, string>;
  /** 文本内容（`<text>` 用） */
  text?: string;
  children: IFormatElement[];
}

/** 单个元素的序列化结果：元素本身 + 是否需要整体跳过 */
export interface IElementResult {
  element?: IFormatElement;
  skip?: boolean;
}

export type { UI };
