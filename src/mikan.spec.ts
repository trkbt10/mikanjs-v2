import { tokenize, toHTML } from "./index.ts";

function tagToArray(text: string = ""): string[] {
  return text.split(/<.*?>(.*?)<\/.*?>/g).filter((word) => word);
}

test("basic text splitting and HTML generation", () => {
  const source = "常に最新、最高のモバイル。Androidを開発した同じチームから。";
  const expected = ["常に", "最新、", "最高の", "モバイル。", "Androidを", "開発した", "同じ", "チームから。"];

  const queue = tokenize(source);
  const result = toHTML(source);

  expect(queue).toEqual(expected);
  expect(tagToArray(result)).toEqual(expected);
  expect(result.indexOf('<span style="display:inline-block" role="presentation">')).toBeGreaterThan(-1);
});

test("custom options with className, style, and role", () => {
  const source = "私は好きにした。君たちも好きにしろ。";
  const result = toHTML(source, { className: "wbr", style: "font-weight:bold", aria: false });
  expect(result.indexOf('class="wbr"')).toBeGreaterThan(-1);
  expect(result.indexOf('style="display:inline-block;font-weight:bold"')).toBeGreaterThan(-1);
  expect(result.indexOf('role=')).toBe(-1);
});

test("custom options with empty attributes", () => {
  const source = "え、蒲田に！？";
  const result = toHTML(source, { className: "", style: "", aria: false });
  expect(result.indexOf('class=')).toBe(-1);
  expect(result.indexOf('style="display:inline-block"')).toBeGreaterThan(-1);
  expect(result.indexOf('role=')).toBe(-1);
});

test("split function with specific text", () => {
  const source = "原稿と防災服を用意してくれ";
  const expected = ["原稿と", "防災服を", "用意してくれ"];
  const result = tokenize(source);
  expect(result).toEqual(expected);
});

test("numbers only", () => {
  const source = "1192";
  const expected = ["1192"];
  const result = tokenize(source);
  expect(result).toEqual(expected);
});

test("Japanese text with particles", () => {
  const source = "やりたいことのそばにいる";
  const expected = ["やりたいことの", "そばに", "いる"];
  const result = tokenize(source);
  expect(result).toEqual(expected);
});

test("text with library name", () => {
  const source = "このtoHTMLtoHTML.jsというライブラリは、スマートな文字区切りを可能にします。";
  const expected = ["この", "toHTMLtoHTML.jsと", "いう", "ライブラリは、", "スマートな", "文字区切りを", "可能にします。"];
  const result = tokenize(source);
  expect(result).toEqual(expected);
});

test("question with options", () => {
  const source = "テンプレートを使用しますか、それとも空白の調査から始めますか？";
  const expected = ["テンプレートを", "使用しますか、", "それとも", "空白の", "調査から", "始めますか？"];
  const result = tokenize(source);
  expect(result).toEqual(expected);
});

test("quoted text", () => {
  const source = "「あれ」でもない、「これ」でもない。";
  const expected = ["「あれ」", "でもない、", "「これ」", "でもない。"];
  const result = tokenize(source);
  expect(result).toEqual(expected);
});

test("half-width spaces", () => {
  const source = "半角スペース 対応";
  const expected = ["半角", "スペース", " ", "対応"];
  const result = tokenize(source);
  expect(result).toEqual(expected);
});

test("empty string", () => {
  const source = "";
  const expected = [""];
  const result = tokenize(source);
  expect(result).toEqual(expected);
});

test("newline character", () => {
  const source = "\n";
  const expected = ["\n"];
  const result = tokenize(source);
  expect(result).toEqual(expected);
});

test("single space", () => {
  const source = " ";
  const expected = [" "];
  const result = tokenize(source);
  expect(result).toEqual(expected);
});

// Tests from numbers-and-units-test.js
test("speed reference with units", () => {
  const source = "桜の花の落ちるスピード。秒速5センチメートル";
  const expected = [
    "桜の",
    "花の",
    "落ちる",
    "スピード。",
    "秒速",
    "5センチメートル"
  ];

  const queue = tokenize(source);
  const result = toHTML(source);

  expect(queue).toEqual(expected);
  expect(result.indexOf('<span style="display:inline-block" role="presentation">')).toBeGreaterThan(-1);
});

test("percentage with spaces", () => {
  const source = "ページの読み込みが 50%加速";
  const expected = ["ページの", "読み", "込みが", " ", "50%", "加速"];
  const result = tokenize(source);
  expect(result).toEqual(expected);
});

test("distance with large numbers", () => {
  const source = "赤道を抜け、嵐を抜け、氷を割り、日本から1万4000キロ";
  const expected = [
    "赤道を",
    "抜け、",
    "嵐を",
    "抜け、",
    "氷を",
    "割り、",
    "日本から",
    "1万", "4000キロ",
  ];

  const queue = tokenize(source);
  const result = toHTML(source);

  expect(queue).toEqual(expected);
  expect(result.indexOf('<span style="display:inline-block" role="presentation">')).toBeGreaterThan(-1);
});

test("classic story title", () => {
  const source = "母をたずねて三千里";
  const expected = [
    "母をたずねて",
    "三千里",
  ];

  const queue = tokenize(source);
  const result = toHTML(source);

  expect(queue).toEqual(expected);
  expect(result.indexOf('<span style="display:inline-block" role="presentation">')).toBeGreaterThan(-1);
});

test("aviation navigation data", () => {
  const source = "ヘディング190、高度32000、速度720ノット、なお南下中";
  const expected = [
    "ヘディング",
    "190、",
    "高度",
    "32000、",
    "速度",
    "720ノット、なお",
    "南下中",
  ];

  const queue = tokenize(source);
  const result = toHTML(source);

  expect(queue).toEqual(expected);
  expect(result.indexOf('<span style="display:inline-block" role="presentation">')).toBeGreaterThan(-1);
});

test("text with slash character - should preserve all characters", () => {
  const source = "日本語/英語の切り替えができます";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
  expect(result.indexOf('<span style="display:inline-block" role="presentation">')).toBeGreaterThan(-1);
});

test("file path with slashes - should preserve all characters", () => {
  const source = "パス: src/components/Button.tsx";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("URL with slashes - should preserve all characters", () => {
  const source = "詳細は https://example.com/docs を参照してください";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("text with regex special characters - should preserve all characters", () => {
  const source = "検索パターン: *.txt + 正規表現 ^ $ | () [] {}";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("mathematical expressions with special chars - should preserve all characters", () => {
  const source = "数式: (a + b) * c^2 = result";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("email addresses with special chars - should preserve all characters", () => {
  const source = "メール: user@example.com と user+tag@domain.co.jp";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("text with parentheses and brackets - should preserve all characters", () => {
  const source = "参考文献[1]と(注釈)を含む文章{重要}";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("wildcard patterns - should preserve all characters", () => {
  const source = "ファイル検索: *.js | *.ts ? 見つかりました";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("emoji and special characters - should preserve all characters", () => {
  const source = "今日は良い天気ですね 🌞 とても暖かいです";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("currency and math symbols - should preserve all characters", () => {
  const source = "価格: €100 ≈ ¥15,000 💰";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("copyright and arrows - should preserve all characters", () => {
  const source = "GitHub © 2024 → 新機能追加 ⭐";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("greek letters and infinity - should preserve all characters", () => {
  const source = "数学: α + β = γ ∞";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("complex emoticons - should preserve all characters", () => {
  const source = "顔文字: (^_^) ಠ_ಠ ¯_(ツ)_/¯";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("directional arrows - should preserve all characters", () => {
  const source = "矢印: ← → ↑ ↓ ↔ ⇄";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("thai language mixed with japanese - should preserve all characters", () => {
  const source = "タイ語: สวัสดีครับ 日本語と混在テスト ขอบคุณมากครับ";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("russian language mixed with japanese - should preserve all characters", () => {
  const source = "ロシア語: Привет мир! 日本語と一緒に Спасибо большое";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("french language mixed with japanese - should preserve all characters", () => {
  const source = "フランス語: Bonjour le monde! 日本とフランス Merci beaucoup";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("arabic language mixed with japanese - should preserve all characters", () => {
  const source = "アラビア語: مرحبا بالعالم 日本語テキスト شكرا جزيلا";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("korean language mixed with japanese - should preserve all characters", () => {
  const source = "韓国語: 안녕하세요 세계! 日本語との混合 감사합니다";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("hindi language mixed with japanese - should preserve all characters", () => {
  const source = "ヒンディー語: नमस्ते दुनिया! 日本語テスト धन्यवाद";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("chinese traditional mixed with japanese - should preserve all characters", () => {
  const source = "繁体字中国語: 你好世界！日本語と繁體中文 謝謝";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});

test("mixed multilingual with emojis - should preserve all characters", () => {
  const source = "🌍 Hello สวัสดี مرحبا 안녕 Bonjour Привет こんにちは 🎌";
  
  const queue = tokenize(source);
  const result = toHTML(source);
  
  // Test that joining tokenized result equals original
  expect(queue.join('')).toEqual(source);
  expect(tagToArray(result).join('')).toEqual(source);
});
