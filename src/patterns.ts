/**
 * Pattern definitions and regular expressions
 */
import { esc } from './utils.js';

// Helper patterns
export const reBrOpen = /^[〈《「『｢（\[\(【〔〚〖〘❮❬❪❨<｛{❲❰]$/u;
export const reBrClose = /^[〉》」』｣）\]\)】〔〗〙〛❩❫❭❯❱❳❵｝}]$/u;
export const rePunctuation = /^[。、．…\.!！?？,，:：;；]+$/u;

// Hiragana patterns that combine with kanji (verb/adjective inflections)
export const reKanjiFollowedHiragana = /^[\p{Script=Hiragana}]+$/u;

export const reNumber = /^(?:[\d０-９]+(?:[\.,][\d０-９]+)*|[〇零一二三四五六七八九十百千億兆京]+)$/u;
export const reNumberSuffix = /^[万]$/u;

const UNITS_RAW = `
  px point pt pc dpi dppx
  mm cm m km μm nm センチメートル キロ メートル
  inch in ft yd mile knot ノット
  g kg t mg μg ℊ グラム キログラム トン
  l ml ℓ リットル
  s ms sec 秒 分 min h hr 時間
  Hz kHz MHz GHz
  A mA V kV W kW Wh kWh
  B KB MB GB TB KiB MiB GiB
  ¥ 円 ￥ $ ＄ € €‎ £ ₩ 元
  % ％ ‰ ‱ ㌫
  ° ℃ ℉ 度
  個 本 冊 枚 台 箱 匹 人 里 海里 畳 坪
`.trim().split(/\s+/);

const reUnit = new RegExp(
  `^(?:${UNITS_RAW.sort((a, b) => b.length - a.length).map(esc).join("|")})$`,
  "iu"
);

export const isNumber = (s: string): boolean => reNumber.test(s);
export const isNumberSuffix = (s: string): boolean => reNumberSuffix.test(s);
export const isUnit = (s: string): boolean => reUnit.test(s);

// Patterns that should be treated as independent words
const INDEPENDENT_WORDS = ["こと", "もの", "ため", "ところ", "わけ"];
export const reIndependentWord = new RegExp(`^(${INDEPENDENT_WORDS.join("|")})$`, "u");

// Master tokenization pattern - captures all characters while grouping similar types
export const master = new RegExp(
  [
    "&nbsp;",                                               // HTML entity
    "[\\s\\n]+",                                           // Whitespace (grouped)
    "[\\d０-９]+(?:[\\.,][\\d０-９]+)*",                      // Numbers with decimal points
    "[A-Za-z0-9]+(?:\\.[A-Za-z]{2,})?",                   // Latin alphanumeric + domains
    "[\\p{Script=Katakana}ー]+",                           // Katakana (grouped)
    "[\\p{Script=Hiragana}]+",                            // Hiragana (grouped)
    "[\\p{Script=Han}々〆ヵヶゝ]+",                         // Kanji (grouped)
    "[〈《「『｢（\\[\\(【〔〚〖〘❮❬❪❨<｛{❲❰〉》」』｣）\\]\\)】〕〗〙〛❩❫❭❯❱❳❵｝}]", // Brackets (single)
    "[。、．…\\.!！?？,，:：;；]+",                           // Punctuation (grouped)
    "[%％‰‱㌫]",                                           // Percentage symbols
    "[\\p{Emoji_Presentation}\\p{Emoji}\\u{1F000}-\\u{1F9FF}\\u{2600}-\\u{26FF}\\u{2700}-\\u{27BF}]", // Emoji
    "."                                                    // Fallback: any other character
  ].join("|"),
  "ug"
);
