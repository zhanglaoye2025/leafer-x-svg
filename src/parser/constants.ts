import type { TMat2D } from './typedefs';
// use this syntax so babel plugin see this import here
// import { version } from '../package.json';
const version = '1.0.0';

/**
   * 命中检测的拾取半径。
   * 解析出的每个元素会被设置为 hitRadius / 4，
   * 保证缩放后依然有合理的拾取容差。
   */
export const hitRadius = 20;
/**
 * 当 SVG 元素没有 data-c 属性时，
 * 为其生成的 originalId 所使用的前缀。
 */
export const otherPrefix = 'other-';

export const VERSION = version;
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() { }

export const halfPI = Math.PI / 2;
export const twoMathPi = Math.PI * 2;
export const PiBy180 = Math.PI / 180;

export const iMatrix = Object.freeze([1, 0, 0, 1, 0, 0]) as TMat2D;
export const DEFAULT_SVG_FONT_SIZE = 16;
export const ALIASING_LIMIT = 2;

/* "magic number" for bezier approximations of arcs (http://itc.ktu.lt/itc354/Riskus354.pdf) */
export const kRect = 1 - 0.5522847498;

export const CENTER = 'center';
export const LEFT = 'left';
export const TOP = 'top';
export const BOTTOM = 'bottom';
export const RIGHT = 'right';
export const NONE = 'none';

export const reNewline = /\r?\n/;

export const MOVING = 'moving';
export const SCALING = 'scaling';
export const ROTATING = 'rotating';
export const ROTATE = 'rotate';
export const SKEWING = 'skewing';
export const RESIZING = 'resizing';
export const MODIFY_POLY = 'modifyPoly';
export const MODIFY_PATH = 'modifyPath';
export const CHANGED = 'changed';
export const SCALE = 'scale';
export const SCALE_X = 'scaleX';
export const SCALE_Y = 'scaleY';
export const SKEW_X = 'skewX';
export const SKEW_Y = 'skewY';
export const FILL = 'fill';
export const STROKE = 'stroke';
export const MODIFIED = 'modified';
