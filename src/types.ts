/**
 * Type definitions for mikan.js
 */

export interface SegmentOptions {
  className?: string;
  style?: string;
  aria?: boolean;
}

export interface ParticleNode {
  value: string;           // このノードの文字列
  isTerminal: boolean;     // ここで終了可能か
  children: Map<string, ParticleNode>;  // 子ノード
}

// 再帰tuple形式の型定義（圧縮版）
// [value, isTerminal, children] という形式
// isTerminalは0(false) | 1(true)で圧縮
export type ParticleTuple = [
  string,     // value
  0 | 1,      // isTerminal (0=false, 1=true)
  Record<string, ParticleTuple>  // children (再帰的なtupleのRecord)
];
