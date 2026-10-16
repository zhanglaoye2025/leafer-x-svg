/**
 * formate：把序列化的 SVG 元素树 + 渐变定义 + 降级报告渲染为 SVG 字符串。
 */
import type { FormatContext, IFormatElement, IFormatDegrade, IGradientDef } from './typedefs';
import { escapeAttr, escapeText, fmt } from './util';

function renderAttrs(attrs: Record<string, string>): string {
  return Object.entries(attrs)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => ` ${k}="${escapeAttr(v)}"`)
    .join('');
}

function renderElement(el: IFormatElement, ctx: FormatContext, indent: number, pretty: boolean): string {
  const pad = pretty ? '  '.repeat(indent) : '';
  const nl = pretty ? '\n' : '';
  const attrs = renderAttrs(el.attrs);
  const open = `${pad}<${el.tag}${attrs}`;

  const text = el.text != null && el.text !== '' ? escapeText(el.text) : '';
  if (!el.children.length) {
    return text ? `${open}>${text}</${el.tag}>${nl}` : `${open}/>${nl}`;
  }
  // 文本 + tspan 子级：文字内容与 tspan 内联在同一行
  if (text) {
    const inner = el.children.map((c) => renderElement(c, ctx, 0, false)).join('');
    return `${open}>${text}${inner}</${el.tag}>${nl}`;
  }
  const inner = el.children.map((c) => renderElement(c, ctx, indent + 1, pretty)).join('');
  return `${open}>${nl}${inner}${pad}</${el.tag}>${nl}`;
}

function renderGradient(def: IGradientDef, ctx: FormatContext, indent: number, pretty: boolean): string {
  const pad = pretty ? '  '.repeat(indent) : '';
  const padStop = pretty ? '  '.repeat(indent + 1) : '';
  const nl = pretty ? '\n' : '';
  const attrs = renderAttrs(def.attrs);
  const stops = def.stops
    .map((s) => `${padStop}<stop offset="${fmt(s.offset, ctx.precision)}"${renderAttrs(s.attrs)}/>`)
    .join(nl);
  return `${pad}<${def.tag}${attrs}>${nl}${stops}${nl}${pad}</${def.tag}>${nl}`;
}

function renderReport(degrades: IFormatDegrade[], pretty: boolean): string {
  if (!degrades.length) return '';
  const nl = pretty ? '\n' : '';
  const lines = degrades.map((d) => {
    const where = [d.tag, d.id].filter(Boolean).join('#');
    const label = d.action === 'skip' ? '舍弃' : '降级';
    return `  ${label} [${d.at}]${where ? ` <${where}>` : ''}: ${d.detail}`;
  });
  return `<!--${nl}  leafer-x-svg formate 降级 / 舍弃报告${nl}${lines.join(nl)}${nl}-->${nl}`;
}

/**
 * 渲染完整 SVG 文档。
 * @param root 顶层元素数组
 * @param defs 渐变定义
 * @param rootAttrs 根 `<svg>` 属性（width/height/viewBox/preserveAspectRatio）
 */
export function renderSvg(
  root: IFormatElement[],
  defs: IGradientDef[],
  rootAttrs: Record<string, string>,
  ctx: FormatContext,
  pretty: boolean,
  includeReport: boolean,
): string {
  const nl = pretty ? '\n' : '';
  const parts: string[] = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg"${renderAttrs(rootAttrs)}>${nl}`);

  if (includeReport) {
    const report = renderReport(ctx.degrades, pretty);
    if (report) parts.push(report);
  }

  if (defs.length) {
    const pad = pretty ? '  ' : '';
    parts.push(`${pad}<defs>${nl}`);
    for (const d of defs) parts.push(renderGradient(d, ctx, 2, pretty));
    parts.push(`${pad}</defs>${nl}`);
  }

  for (const el of root) parts.push(renderElement(el, ctx, 1, pretty));

  parts.push(`</svg>`);
  return parts.join('');
}
