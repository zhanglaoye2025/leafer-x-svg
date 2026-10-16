import { formate } from './formate';
import { parse } from './parser';


export type {
  FormateResult,
  FormatOptions,
  IFormatDegrade,
  IFormatElement,
  IFormatHelper,
  IUnknownElementContext,
  IUnknownElementHandler,
} from './formate';

export { formate };
export { parse };

export default {
  parse,
  formate,
};
