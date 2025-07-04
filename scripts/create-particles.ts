/**
 * Particle data generation script
 * This script generates optimized particle data structures to improve runtime performance
 */
import type { ParticleNode, ParticleTuple } from '../src/types.js';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ES modules compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 漢字プレースホルダー（動詞・名詞など任意の漢字列を表す）
const KANJI_PLACEHOLDER = "*";

// 階層的な助詞パターン定義
export const PARTICLE_PATTERNS = {
  // 基本助詞
  BASIC: ["は", "が", "を", "に", "へ", "と", "で", "の", "も", "や", "か", "ね", "よ", "ぞ", "ぜ", "さ", "わ", "なの"],
  
  // から系
  FROM: ["から", "からも", "からは", "からこそ", "からして", "からには", "からといって"],
  
  // まで系
  UNTIL: ["まで", "までも", "までは", "までに", "までして", "までが"],
  
  // より系
  COMPARISON: ["より", "よりも", "よりは", "よりか"],
  
  // で系
  WITH: [
    "で",
    "では", "ではない", "ではないか", "ではなかろう", "ではなかろうか", "ではなく", "ではなくて", "ではあるが",
    "でも", "でもって", "でもなお", "でもある", "でもあり",
    "でして", "でした", "でしたら", "でさえ", "でさえも"
  ],
  
  // に系
  TO: [
    "に",
    "には", "にて", "にして", "にしても", "にしては", "にしろ", "にせよ",
    "に*て", "に*",      // について、につき など
    "にあって", "にあたり", "にあたって",
    "において", "における",
    "に*", "に*て", "に*ては", "に*と", "に*ば",  // による、によって、によっては、によると、によれば など
    "に*し", "に*して", "に*する",  // に対し、に対して、に対する、に関し、に関して、に関する など
    "にかかわらず", "にもかかわらず", "に*わらず", "にも*わらず",  // に関わらず、にも関わらず
    "にとって", "にとっては", "にとっても",
    "にいたるまで", "にいたって", "にいたっては"
  ],
  
  // を系
  OBJECT: [
    "を",
    "を*って", "を*る",  // をめぐって、を巡って、をめぐる
    "を*じて", "を*して", "を*じ", "を*し",  // を通じて、を通して など
    "をはじめ", "を*め", "を*として", "を*めとして",  // を始め、を始めとして
    "をもって", "をもってして", "をもってしても",
    "を*に", "を*にして", "を*として"  // を前に、を前にして、を契機に、を契機として
  ],
  
  // と系
  WITH_QUOTE: [
    "と",
    "とは", "とか", "とも", "として", "としては", "としても", "としての", "とした",
    "とかも", "とかは", "とかで", "とかの",
    "ともに", "とともに", "と*に",  // と共に
    "ともかく", "ともあれ", "ともあろう",
    "といえども", "と*えど", "といえば", "というと", "というか",  // と言えど
    "といったら", "といったところで", "といった",
    "とはいえ", "とはいいながら", "とはいうものの",
    "となると", "となれば", "となって", "となっては",
    "ところで", "ところが", "ところへ", "ところに"
  ],
  
  // か系（疑問・選択）
  QUESTION: [
    "か",
    "かと*えば", "かと*うと", "かというと", "かといえば", "かといって",  // かと思えば、かと思うと
    "かどうか", "かしら", "かな", "かも", "かもしれない",
    "かのように", "かのような", "かのごとく", "かのごとき"
  ],
  
  // その他の複合助詞
  COMPOUND: [
    // ばかり系
    "ばかり", "ばかりで", "ばかりだ", "ばかりか", "ばかりに", "ばかりでなく", "ばかりでは",
    
    // だけ系
    "だけ", "だけは", "だけに", "だけしか", "だけでなく", "だけでは", "だけど", "だけども",
    
    // ほど系
    "ほど", "ほどに", "ほどの", "ほどでは", "ほどでも",
    
    // ながら系
    "ながら", "ながらも", "ながらに", "ながらにして",
    
    // もの系
    "もの", "ものの", "ものを", "ものだ", "ものか", "ものなら", "ものだから",
    
    // のに系
    "のに", "のには", "のにも",
    
    // ても系
    "ても", "てもなお", "てもまだ", "てもいい", "てもよい",
    
    // など系
    "など", "などは", "なども", "などか", "などという", "などと", "などで", "などに",
    
    // やら系
    "やら", "やらか", "やらなんやら", "やらで",
    
    // 限定・強調系
    "くらい", "ぐらい", "しか", "さえ", "さえも", "さえは", "こそ", "すら", "だに",
    
    // 口語系
    "なんて", "なんか", "けれども", "けれど", "けど", "けども", "けどもさ",
    "だって", "だの", "って", "ったって", "ってば",
    "じゃ", "じゃあ", "じゃね", "じゃん", "じゃない", "じゃないか",
    
    // 接続系
    "つつ", "つつも", "つつある",
    "さては", "ついては", "あるいは", "または", "もしくは", "ないし", "ないしは"
  ]
};

// 助詞ツリーのルート
const particleTree: ParticleNode = {
  value: "",
  isTerminal: false,
  children: new Map()
};

// ツリーに助詞パターンを追加（漢字プレースホルダー対応版）
const addToTree = (patterns: string[]) => {
  for (const pattern of patterns) {
    let current = particleTree;
    let i = 0;
    
    while (i < pattern.length) {
      let char: string;
      let nodeKey: string;
      
      // プレースホルダーチェック
      if (pattern[i] === KANJI_PLACEHOLDER) {
        char = KANJI_PLACEHOLDER;
        nodeKey = KANJI_PLACEHOLDER;
        i++;
      } else {
        char = pattern[i];
        nodeKey = char;
        i++;
      }
      
      if (!current.children.has(nodeKey)) {
        current.children.set(nodeKey, {
          value: char,
          isTerminal: false,
          children: new Map()
        });
      }
      current = current.children.get(nodeKey)!;
      
      // 最後の文字なら終端フラグを立てる
      if (i === pattern.length) {
        current.isTerminal = true;
      }
    }
  }
};

// すべてのパターンをツリーに追加
for (const patterns of Object.values(PARTICLE_PATTERNS)) {
  addToTree(patterns);
}

// ParticleNodeを再帰tuple形式に変換（圧縮版：boolean → 0/1）
const serializeParticleNode = (node: ParticleNode): ParticleTuple => {
  const children: Record<string, ParticleTuple> = {};
  
  for (const [key, child] of node.children.entries()) {
    children[key] = serializeParticleNode(child);
  }
  
  return [node.value, node.isTerminal ? 1 : 0, children];
};

// 助詞の開始文字を取得
const particleStarters = Array.from(particleTree.children.keys());

// 生成されたデータを出力
const generateParticleData = () => {
  const serializedTree = serializeParticleNode(particleTree);
  
  const code = `/**
 * Pre-generated particle data for improved performance
 * This file is auto-generated by scripts/create-particles.ts
 * Do not edit manually - run the script to regenerate
 */

import type { ParticleTuple } from './types.js';

// 事前生成された助詞ツリー
export const PARTICLE_TREE_DATA: ParticleTuple = ${JSON.stringify(serializedTree, null, 2)};

// 助詞の開始文字セット
export const particleStarters = new Set<string>(${JSON.stringify(particleStarters)});
`;

  return code;
};

// メイン処理
const particleCode = generateParticleData();
const outputPath = resolve(__dirname, '../src/particle-data.ts');

writeFileSync(outputPath, particleCode, 'utf8');
console.log(`Generated particle data: ${outputPath}`);
console.log(`Particle starters: ${particleStarters.length} characters`);
console.log(`Total patterns: ${Object.values(PARTICLE_PATTERNS).flat().length}`);
