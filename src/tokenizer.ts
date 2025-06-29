/**
 * Core tokenization functionality
 */
import { isNumber, isNumberSuffix, isUnit } from './patterns.js';
import { isParticle, particleStarters } from './particles.js';
import { 
  master, 
  reBrOpen, 
  reBrClose, 
  rePunctuation, 
  reKanjiFollowedHiragana, 
  reIndependentWord 
} from './patterns.js';
import { 
  createTokenCombiner, 
  splitHiraganaByParticles, 
  shouldSkipParticleCombination 
} from './tokenizer-helpers.js';

export const tokenize = (text: string): string[] => {
  if (!text) return [""];
  const raw = [...text.matchAll(master)].map(m => m[0]);

  // Split long hiragana strings by particles
  const processedRaw: string[] = [];
  for (const token of raw) {
    processedRaw.push(...splitHiraganaByParticles(token));
  }

  const out: string[] = [];
  const combiner = createTokenCombiner(processedRaw);
  
  let i = 0;
  while (i < processedRaw.length) {
    const tc = combiner(i);

    // Kanji + hiragana combination (verbs, adjectives, etc.)
    if (/^[\p{Script=Han}々〆ヵヶゝ]+$/u.test(tc.value) && tc.peek() && reKanjiFollowedHiragana.test(tc.peek()!)) {
      while (tc.peek() && reKanjiFollowedHiragana.test(tc.peek()!)) {
        // Stop at independent words (koto, mono, etc.)
        if (reIndependentWord.test(tc.peek()!)) break;
        // Stop at particle starters (except inflection endings)
        if (particleStarters.has(tc.peek()!) && tc.peek()!.length > 1) break;
        
        tc.combine();
        
        // If punctuation comes, combine and end
        if (tc.peek() && rePunctuation.test(tc.peek()!)) {
          tc.combine();
          break;
        }
      }
    }
    
    // Specific katakana + hiragana combination
    tc.combineIf(/^[\p{Script=Katakana}ー]+$/u.test(tc.value) && tc.peek() === "な");
    
    // Number + unit
    if (isNumber(tc.value) && tc.peek()) {
      if (isUnit(tc.peek()!) || isNumberSuffix(tc.peek()!)) {
        tc.combine();
        // Also combine punctuation after units
        tc.combineIf(tc.peek() ? rePunctuation.test(tc.peek()!) : false);
        // Also combine following hiragana
        tc.combineIf(tc.peek() ? /^[\p{Script=Hiragana}]+$/u.test(tc.peek()!) : false);
      }
    }
    
    // Parentheses combination
    if (reBrOpen.test(tc.value)) {
      tc.combineWhile(next => !reBrClose.test(next));
      tc.combineIf(true); // Combine closing parentheses
      
      // No special processing after parentheses (handled by particle combination)
    }
    
    // Particle combination
    if (tc.peek() && isParticle(tc.peek()!) && !isParticle(tc.value)) {
      // Check for special combination patterns
      if (!shouldSkipParticleCombination(tc.value, tc.peek()!)) {
        tc.combine();
      }
    }
    
    // Compound particle continuation pattern combination (special patterns like "demo nai")
    if (tc.value === "でも" && tc.peek() && /^(ない|なく|なかっ|なけれ)/.test(tc.peek()!)) {
      tc.combine();
      // Also combine following punctuation
      tc.combineIf(tc.peek() ? rePunctuation.test(tc.peek()!) : false);
    }
    
    // Punctuation combination
    tc.combineIf(tc.peek() ? rePunctuation.test(tc.peek()!) && !rePunctuation.test(tc.value) : false);
    
    out.push(tc.value);
    i = tc.pos + 1;
  }
  return out;
};
