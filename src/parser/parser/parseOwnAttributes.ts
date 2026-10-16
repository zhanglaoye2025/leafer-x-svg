import { DEFAULT_SVG_FONT_SIZE } from '../constants';
import { getGlobalStylesForElement } from './getGlobalStylesForElement';
import { normalizeAttr } from './normalizeAttr';
import { normalizeValue } from './normalizeValue';
import { parseStyleAttribute } from './parseStyleAttribute';
import type { CSSRules } from './typedefs';

/**
 * 只解析元素自身的属性，不向上递归继承父级 <g>。
 *
 * 与 parseAttributes 的区别：parseAttributes 会把父级的属性合并进来（SVG 的样式继承语义），
 * 而 transform / opacity / visible 这类属性在非扁平模式下由 Leafer 的父子层级天然继承，
 * 需要"仅自身"的值，否则会与父级 Group 上的值叠加两次。
 */
export function parseOwnAttributes(
  element: HTMLElement | SVGElement | null,
  attributes: string[],
  cssRules?: CSSRules,
): Record<string, any> {
  if (!element) {
    return {};
  }

  const ownAttributes: Record<string, string> = {
    ...attributes.reduce<Record<string, string>>((memo, attr) => {
      const value = element.getAttribute(attr);
      if (value) {
        memo[attr] = value;
      }
      return memo;
    }, {}),
    ...getGlobalStylesForElement(element, cssRules),
    ...parseStyleAttribute(element),
  };

  const normalized: Record<string, any> = {};
  for (const attr in ownAttributes) {
    const normalizedAttr = normalizeAttr(attr);
    normalized[normalizedAttr] = normalizeValue(
      normalizedAttr,
      ownAttributes[attr],
      {},
      DEFAULT_SVG_FONT_SIZE,
    );
  }
  return normalized;
}
