/**
 * Particle handling functions (particles)
 * Contains both base functions and convenient wrapper functions
 */
import type { ParticleNode, ParticleTuple } from './types.js';
import { PARTICLE_TREE_DATA, particleStarters } from './particle-data.js';

// Kanji placeholder (represents arbitrary kanji sequences like verbs/nouns)
const KANJI_PLACEHOLDER = "*";

// Deserialize from tuple format to ParticleNode (compressed version: 0/1 → boolean)
const deserializeParticleNode = (tuple: ParticleTuple): ParticleNode => {
  const [value, isTerminalNum, childrenRecord] = tuple;
  
  const node: ParticleNode = {
    value,
    isTerminal: Boolean(isTerminalNum), // Convert 0/1 to boolean
    children: new Map()
  };
  
  for (const [key, childTuple] of Object.entries(childrenRecord)) {
    node.children.set(key, deserializeParticleNode(childTuple));
  }
  
  return node;
};

// Function to initialize particle tree
export const createParticleTree = (treeData: ParticleTuple): ParticleNode => {
  return deserializeParticleNode(treeData);
};

// Initialize tree from pre-generated data
const particleTree = createParticleTree(PARTICLE_TREE_DATA);

// Check if string is a particle (tree-based)
const isParticleWithTree = (particleTree: ParticleNode, s: string): boolean => {
  let current = particleTree;
  const chars = Array.from(s);
  
  for (const char of chars) {
    if (!current.children.has(char)) {
      return false;
    }
    current = current.children.get(char)!;
  }
  
  return current.isTerminal;
};

// Find longest particle match with kanji placeholder support
const findLongestParticleWithTree = (particleTree: ParticleNode, text: string, start: number): string | null => {
  let current = particleTree;
  let longestMatch: string | null = null;
  let currentMatch = "";
  let i = start;
  
  while (i < text.length) {
    const char = text[i];
    let advanced = false;
    
    // Try normal character match
    if (current.children.has(char)) {
      current = current.children.get(char)!;
      currentMatch += char;
      i++;
      advanced = true;
      
      if (current.isTerminal) {
        longestMatch = currentMatch;
      }
    }
    
    // Try kanji placeholder match
    if (!advanced && current.children.has(KANJI_PLACEHOLDER)) {
      // Skip while kanji continues
      const kanjiStart = i;
      while (i < text.length && /[\p{Script=Han}々〆ヵヶゝ]/u.test(text[i])) {
        i++;
      }
      
      // Match as placeholder only if kanji was found
      if (i > kanjiStart) {
        current = current.children.get(KANJI_PLACEHOLDER)!;
        currentMatch += text.substring(kanjiStart, i);
        advanced = true;
        
        if (current.isTerminal) {
          longestMatch = currentMatch;
        }
      }
    }
    
    // If neither matched, terminate
    if (!advanced) {
      break;
    }
  }
  
  return longestMatch;
};

// Fast direct 0/1 check function (direct access with tuple format)
export const isParticleFast = (s: string): boolean => {
  let current = PARTICLE_TREE_DATA;
  const chars = Array.from(s);
  
  for (const char of chars) {
    const children = current[2]; // children object
    if (!(char in children)) {
      return false;
    }
    current = children[char];
  }
  
  return Boolean(current[1]); // isTerminal (0/1 → boolean)
};

// Fast longest match search (tuple direct access)
export const findLongestParticleFast = (text: string, start: number): string | null => {
  let current = PARTICLE_TREE_DATA;
  let longestMatch: string | null = null;
  let currentMatch = "";
  let i = start;
  
  while (i < text.length) {
    const char = text[i];
    let advanced = false;
    const children = current[2]; // children object
    
    // Try normal character match
    if (char in children) {
      current = children[char];
      currentMatch += char;
      i++;
      advanced = true;
      
      if (current[1]) { // isTerminal check (0/1)
        longestMatch = currentMatch;
      }
    }
    
    // Try kanji placeholder match
    if (!advanced && KANJI_PLACEHOLDER in children) {
      // Skip while kanji continues
      const kanjiStart = i;
      while (i < text.length && /[\p{Script=Han}々〆ヵヶゝ]/u.test(text[i])) {
        i++;
      }
      
      // Match as placeholder only if kanji was found
      if (i > kanjiStart) {
        current = children[KANJI_PLACEHOLDER];
        currentMatch += text.substring(kanjiStart, i);
        advanced = true;
        
        if (current[1]) { // isTerminal check (0/1)
          longestMatch = currentMatch;
        }
      }
    }
    
    // If neither matched, terminate
    if (!advanced) {
      break;
    }
  }
  
  return longestMatch;
};

// Get possible continuation patterns after particles from tree
const getParticleContinuationsWithTree = (particleTree: ParticleNode, particle: string): string[] => {
  const continuations: string[] = [];
  
  // Traverse tree to collect possible continuation patterns from this particle
  function collectContinuations(node: ParticleNode, prefix: string) {
    if (node.isTerminal && prefix.length > 0) {
      continuations.push(prefix);
    }
    for (const [char, child] of node.children) {
      collectContinuations(child, prefix + char);
    }
  }
  
  // Find the position of the specified particle
  let current = particleTree;
  for (const char of particle) {
    if (!current.children.has(char)) {
      return continuations;
    }
    current = current.children.get(char)!;
  }
  
  // Collect possible continuation patterns from that position
  collectContinuations(current, "");
  
  return continuations;
};

// Debug: Function to visualize tree structure
const showParticleTreeInternal = (particleTree: ParticleNode, prefix: string = "", isLast: boolean = true, depth: number = 0): void => {
  if (depth === 0) {
    console.log("Particle tree structure (Trie):")
    console.log("※ '*' represents placeholder for arbitrary kanji sequences (verbs, nouns, etc.)");
  }
  
  if (particleTree.value) {
    const marker = isLast ? "└── " : "├── ";
    const terminal = particleTree.isTerminal ? " ✓" : "";
    const displayValue = particleTree.value === KANJI_PLACEHOLDER ? "[Kanji]" : particleTree.value;
    console.log(prefix + marker + displayValue + terminal);
  }
  
  const children = Array.from(particleTree.children.entries());
  children.forEach(([char, child], index) => {
    const isLastChild = index === children.length - 1;
    const extension = particleTree.value ? (isLast ? "    " : "│   ") : "";
    showParticleTreeInternal(child, prefix + extension, isLastChild, depth + 1);
  });
};

// Debug: Display particle patterns starting with specific character
const showParticlesStartingWithInternal = (particleTree: ParticleNode, char: string): void => {
  const node = particleTree.children.get(char);
  if (!node) {
    console.log(`No particle patterns starting with "${char}"`);
    return;
  }
  
  console.log(`Particle patterns starting with "${char}":`);
  
  function collectPatterns(node: ParticleNode, prefix: string): string[] {
    const patterns: string[] = [];
    if (node.isTerminal) {
      patterns.push(prefix);
    }
    for (const [childChar, child] of node.children) {
      patterns.push(...collectPatterns(child, prefix + childChar));
    }
    return patterns;
  }
  
  const patterns = collectPatterns(node, char);
  patterns.forEach(p => console.log(`  ${p}`));
};

// 便利な関数（ツリーを自動で渡す）
export const isParticle = (s: string): boolean => isParticleWithTree(particleTree, s);
export const findLongestParticle = (text: string, start: number): string | null => findLongestParticleWithTree(particleTree, text, start);
export const getParticleContinuations = (particle: string): string[] => getParticleContinuationsWithTree(particleTree, particle);
export const showParticleTree = (): void => showParticleTreeInternal(particleTree);
export const showParticlesStartingWith = (char: string): void => showParticlesStartingWithInternal(particleTree, char);

// 助詞の開始文字セット
export { particleStarters };
