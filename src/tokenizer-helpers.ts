/**
 * Tokenizer helper functions
 */
import { findLongestParticle } from './particles.js';
import { reBrClose } from './patterns.js';

// Curried token combiner helper
export const createTokenCombiner = (tokens: string[]) => {
  return (startIndex: number) => {
    let index = startIndex;
    let current = tokens[index];
    
    const hasNext = () => index + 1 < tokens.length;
    const peek = () => hasNext() ? tokens[index + 1] : undefined;
    
    const combine = () => {
      if (hasNext()) {
        current += tokens[++index];
      }
      return { current, index };
    };
    
    const combineIf = (condition: boolean) => {
      if (hasNext() && condition) {
        return combine();
      }
      return { current, index };
    };
    
    const combineWhile = (predicate: (next: string) => boolean) => {
      while (hasNext() && peek() && predicate(peek()!)) {
        combine();
      }
      return { current, index };
    };
    
    return {
      hasNext,
      peek,
      combine,
      combineIf,
      combineWhile,
      get value() { return current; },
      get pos() { return index; }
    };
  };
};

// Split long hiragana strings by particles (using tree structure)
export const splitHiraganaByParticles = (token: string): string[] => {
  if (!/^[\p{Script=Hiragana}]+$/u.test(token) || token.length <= 2) {
    return [token];
  }

  const subTokens: string[] = [];
  let lastIdx = 0;
  
  for (let j = 0; j < token.length; j++) {
    const particle = findLongestParticle(token, j);
    if (particle) {
      // Skip standalone "ya" as it might be part of a verb
      if (particle === "ya" && j < token.length - 1) {
        continue;
      }
      
      // Skip "demo" when followed by "nai"-type patterns (combine later)
      if (particle === "でも" && j + particle.length < token.length) {
        const remaining = token.substring(j + particle.length);
        if (/^(ない|なく|なかっ|なけれ)/.test(remaining)) {
          continue;
        }
      }
      
      if (j > lastIdx) {
        subTokens.push(token.substring(lastIdx, j) + particle);
      } else if (subTokens.length > 0) {
        subTokens[subTokens.length - 1] += particle;
      } else {
        subTokens.push(particle);
      }
      lastIdx = j + particle.length;
      j = lastIdx - 1;
    }
  }
  
  if (lastIdx < token.length) {
    subTokens.push(token.substring(lastIdx));
  }
  
  return subTokens;
};

// Special combination patterns (handling after brackets, etc.)
export const shouldSkipParticleCombination = (currentToken: string, nextParticle: string): boolean => {
  // Skip "demo" after brackets (to be processed separately as "demo nai")
  if (reBrClose.test(currentToken.slice(-1)) && nextParticle === "でも") {
    return true;
  }
  return false;
};
