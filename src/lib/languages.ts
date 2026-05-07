/**
 * Language codes and metadata for supported Indian languages
 */

export type LanguageCode = keyof typeof LANGUAGES;

export const LANGUAGES = {
  auto: { code: 'auto', name: 'Auto Detect', nativeName: 'ऑटो डिटेक्ट', flag: '🌐', script: 'latin' },
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', script: 'latin' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', script: 'devanagari' },
  kn: { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', script: 'kannada' },
  te: { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', script: 'telugu' },
  ta: { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', script: 'tamil' },
  ml: { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', script: 'malayalam' },
  mr: { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', script: 'devanagari' },
  gu: { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', script: 'gujarati' },
  bn: { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', script: 'bengali' },
  pan: { code: 'pan', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', script: 'gurmukhi' },
  ur: { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳', script: 'urdu' },
  hinglish: { code: 'hinglish', name: 'Hinglish', nativeName: 'हिंग्लिश', flag: '🇮🇳', script: 'mixed' },
  tanglish: { code: 'tanglish', name: 'Tanglish', nativeName: 'தமிழ্হிங்க்லிஷ்', flag: '🇮🇳', script: 'mixed' },
  kanglish: { code: 'kanglish', name: 'Kanglish', nativeName: 'ಕನ್ನಡೇSCIPE', flag: '🇮🇳', script: 'mixed' },
} as const;

/**
 * Word indicators for heuristic language detection
 */
export const LANGUAGE_INDICATORS: Record<LanguageCode, string[]> = {
  auto: [],
  en: ['the', 'is', 'are', 'what', 'how', 'why', 'where', 'when', 'have', 'has', 'had', 'will', 'would', 'should'],
  hi: ['hai', 'hain', 'ka', 'ki', 'ke', 'mera', 'teraa', 'kya', 'kaise', 'kyun', 'main', 'hum', 'aap', 'nahi', 'hai', 'ko', 'se', 'mein', 'ho', 'raha', 'kara', 'karo', 'karna', 'padhe', 'likhe'],
  kn: ['idu', 'neenu', 'naanu', 'yaaru', 'hege', 'yaake', 'sari', 'illa', 'howda', 'munde', 'nooru', 'tu', 'tgu', 'nimm', 'nimma', 'nana', 'nanna', 'anga', 'inga', 'yahge', 'sariyagi', 'bangara', 'jathre', 'sambandha', 'karya', 'vishaya'],
  te: ['nenu', 'nuvu', 'em chestundi', 'ela', 'ledu', 'sare', 'bagundi', 'pelli', 'vadhalu', 'eemely', 'mega', 'cheppu', 'tinali', 'tinnadi', 'vaaru', 'vallu', 'emiti', 'enduku', 'eppudu'],
  ta: ['naan', 'nee', 'enna', 'eppadi', 'yeppadi', 'solla', 'panna', 'irukku', 'ennada', 'sollunga', 'pannunga', 'epdi', 'yenna', 'enna', 'ennaa', 'sappa', 'pom', 'irukke'],
  ml: ['njan', 'nin', 'enne', 'enth', 'alla', 'ariyam', 'shari', 'pokum', 'kanum', 'ith', 'pottan', 'nokko', 'paray', 'nadakku'],
  mr: ['mi', 'tu', 'aahe', 'kasa', 'kay', 'aamhi', 'tumhi', 'nahi', 'kity', 'shambhar', 'kaay', 'raha', 'ahe', 'ahet', 'mhanje'],
  gu: ['hu', 'tu', 'chhe', 'kaise', 'shu', 'ame', 'tame', 'nathi', 'chho', 'chhe', 'thai', 'karo', 'karva', 'dava', 'piyu'],
  bn: ['ami', 'tumi', 'kemon', 'kichu', 'hocche', 'bhalo', 'na', 'ache', 'jante', 'chai', 'koro', 'dekhbo', 'bhalo', 'khabar'],
  pan: ['main', 'tu', 'ek', 'kida', 'kive', 'assan', 'tussi', 'nahi', 'kehar', 'chal', 'karo', 'dekh', 'sun'],
  ur: ['main', 'tum', 'kya', 'hai', 'kidar', 'kese', 'ham', 'nahi', 'aap', 'koi', 'kaisa', 'kahan'],
  hinglish: ['mere', 'pass', 'hai', 'kya', 'stuff', 'time', 'problem', 'help', 'need', 'kar', 'karo', 'karna', 'raha', 'ho', 'ho raha', 'mein'],
  tanglish: ['enn', 'pa', 'da', 'machi', 'vera', 'semma', 'sollu', 'pannu', 'epdi', 'yenna', 'sapdhu', 'pom'],
  kanglish: ['nimm', 'nana', 'nimma', 'sari', 'ili', 'howda', 'munde', 'tiffin', 'coffee', 'boss', 'mast', 'togu', 'madi'],
};

/**
 * Script Unicode ranges for detection
 */
export const SCRIPT_RANGES: Record<string, [number, number][]> = {
  devanagari: [[0x0900, 0x097F]],
  kannada: [[0x0C80, 0x0CFF]],
  telugu: [[0x0C00, 0x0C7F]],
  tamil: [[0x0B80, 0x0BFF]],
  malayalam: [[0x0D00, 0x0D7F]],
  gujarati: [[0x0A80, 0x0AFF]],
  bengali: [[0x0980, 0x09FF]],
  gurmukhi: [[0x0A00, 0x0A7F]],
  urdu: [[0x0600, 0x06FF]],
  latin: [[0x0000, 0x007F]],
};

/**
 * Get language display name
 */
export function getLanguageName(code: LanguageCode): string {
  return LANGUAGES[code]?.name || code;
}

/**
 * Get native language name
 */
export function getNativeName(code: LanguageCode): string {
  return LANGUAGES[code]?.nativeName || code;
}

/**
 * Get language flag emoji
 */
export function getFlag(code: LanguageCode): string {
  return LANGUAGES[code]?.flag || '🌐';
}

/**
 * Check if language is an Indian language
 */
export function isIndianLanguage(code: LanguageCode): boolean {
  const indianLangs: LanguageCode[] = ['hi', 'kn', 'te', 'ta', 'ml', 'mr', 'gu', 'bn', 'pan', 'ur'];
  return indianLangs.includes(code);
}

/**
 * Get Indian languages only
 */
export const INDIAN_LANGUAGES = Object.values(LANGUAGES).filter(lang => 
  isIndianLanguage(lang.code as LanguageCode)
);

/**
 * Normalize text: lowercase, strip punctuation, trim
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detect script from text using Unicode ranges
 */
export function detectScript(text: string): string {
  const ranges = SCRIPT_RANGES;
  
  for (const [script, intervals] of Object.entries(ranges)) {
    for (const char of text) {
      const code = char.charCodeAt(0);
      for (const [start, end] of intervals) {
        if (code >= start && code <= end) {
          return script;
        }
      }
    }
  }
  
  return 'latin';
}

/**
 * Heuristic language detection based on word frequency
 */
export function detectLanguage(text: string): LanguageCode {
  const normalized = normalizeText(text);
  
  if (normalized.length < 3) {
    return 'en';
  }

  const scores: Record<LanguageCode, number> = {} as any;
  
  for (const [lang, words] of Object.entries(LANGUAGE_INDICATORS)) {
    if (lang === 'auto') continue;
    scores[lang as LanguageCode] = 0;
    for (const word of words) {
      if (normalized.includes(word)) {
        scores[lang as LanguageCode] += 1;
      }
    }
  }

  // Mixed language detection
  if (scores.en > 0 && scores.hi > 0) return 'hinglish';
  if (scores.en > 0 && scores.ta > 0) return 'tanglish';
  if (scores.en > 0 && scores.kn > 0) return 'kanglish';

  // Find max
  let maxLang: LanguageCode = 'en';
  let maxScore = 0;
  
  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxLang = lang as LanguageCode;
    }
  }

  // Threshold: at least 2 indicators for non-English
  if (maxScore < 2 && maxLang !== 'en') {
    return 'en';
  }

  return maxLang;
}
