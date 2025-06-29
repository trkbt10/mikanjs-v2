/**
 * HTML wrapper functionality
 */
import type { SegmentOptions } from './types.js';
import { tokenize } from './tokenizer.js';

export const toHTML = (txt: string, opt: SegmentOptions = {}): string => {
  const baseStyle = "display:inline-block";
  const attr =
    ` style="${baseStyle}${opt.style ? ";" + opt.style : ""}"` +
    (opt.aria ?? true ? ` role="presentation"` : "") +
    (opt.className ? ` class="${opt.className}"` : "");

  return tokenize(txt).map(t => `<span${attr}>${t}</span>`).join("");
};
