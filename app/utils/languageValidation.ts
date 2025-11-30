// Utility to validate that text contains only allowed characters:
// - English letters (A-Z, a-z)
// - Numbers
// - Common punctuation and symbols
// - Whitespace
// - Emojis and most symbols (by allowing everything outside common CJK/Hangul ranges)

// Regular expression covering common CJK Unified Ideographs, Hangul, Hiragana, Katakana, and related blocks.
// If any of these characters appear, we treat the text as invalid for this forum.
const disallowedScriptRegex = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF\u2E80-\u2EFF\u3000-\u303F\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/;

/**
 * Returns true if the given text is considered valid English-only content
 * (plus numbers, punctuation, whitespace, and emojis), and false if any
 * Korean, Japanese, Chinese, or related characters are detected.
 */
export function isEnglishOnlyText(text: string): boolean {
  if (!text) return true; // empty is fine
  return !disallowedScriptRegex.test(text);
}
