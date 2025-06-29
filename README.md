# mikanjs-v2

日本語テキストを適切な位置で改行可能にする JavaScript ライブラリです。

## デモ

[https://trkbt10.github.io/mikanjs-v2/](https://trkbt10.github.io/mikanjs-v2/) でライブデモを試すことができます。

## インストール

```bash
npm install mikanjs-v2
```

## 使い方

### 基本的な使い方

```javascript
import { tokenize, toHTML } from 'mikanjs-v2';

// テキストをトークンに分割
const tokens = tokenize("常に最新、最高のモバイル。Androidを開発した同じチームから。");
console.log(tokens);
// => ["常に", "最新、", "最高の", "モバイル。", "Androidを", "開発した", "同じ", "チームから。"]

// HTMLとして出力
const html = toHTML("常に最新、最高のモバイル。Androidを開発した同じチームから。");
console.log(html);
// => <span style="display:inline-block" role="presentation">常に</span><span style="display:inline-block" role="presentation">最新、</span>...
```

### オプション設定

```javascript
const html = toHTML("私は好きにした。君たちも好きにしろ。", {
  className: "wbr",           // CSSクラス名
  style: "font-weight:bold",  // 追加のスタイル
  aria: false                 // aria属性の有無（デフォルト: true）
});
```

## React での使用例

```jsx
import React from 'react';
import { toHTML } from 'mikanjs-v2';

function MyComponent() {
  const text = "やりたいことのそばにいる";
  const html = toHTML(text, { className: "japanese-text" });
  
  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  );
}
```

## HTML での使用例

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { toHTML } from 'https://unpkg.com/mikanjs-v2@2.0.0/dist/index.es.js';
    
    document.addEventListener('DOMContentLoaded', () => {
      const text = "桜の花の落ちるスピード。秒速5センチメートル";
      const html = toHTML(text);
      document.getElementById('japanese-text').innerHTML = html;
    });
  </script>
</head>
<body>
  <div id="japanese-text"></div>
</body>
</html>
```

## API

### `tokenize(text: string): string[]`

日本語テキストを適切な改行位置でトークンに分割します。

- **text**: 分割するテキスト
- **戻り値**: 分割されたトークンの配列

### `toHTML(text: string, options?: SegmentOptions): string`

テキストを改行可能な HTML に変換します。

- **text**: 変換するテキスト
- **options**: オプション設定
  - `className?: string` - 各spanに適用するCSSクラス名
  - `style?: string` - 追加のCSSスタイル
  - `aria?: boolean` - aria属性の有無（デフォルト: true）
- **戻り値**: HTML文字列

## 機能

- 助詞、動詞活用、数値と単位の組み合わせを考慮した自然な分割
- 括弧内テキストの適切な処理
- 数値、単位、記号の正確な処理
- 絵文字や多言語テキストの保持
- 高速な処理のための事前生成された助詞データ

## ライセンス

UNLICENSED
