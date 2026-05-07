/**
 * Voice STT/TTS locale map — defaults here; merged with `/voice-languages.json` at runtime.
 * Keeps Client Components free of MongoDB and lets clinics edit `public/voice-languages.json`.
 */

export type VoiceLanguageOverlay = {
  code: string;
  name?: string;
  nativeName?: string;
  flag?: string;
  webSpeechBcp47?: string;
  browserTtsBcp47?: string;
};

type VoiceRow = VoiceLanguageOverlay & { webSpeechBcp47: string; browserTtsBcp47: string };

const BUILTIN: Record<string, VoiceRow> = {
  auto: { code: 'auto', webSpeechBcp47: 'en-IN', browserTtsBcp47: 'en-IN' },
  en: { code: 'en', webSpeechBcp47: 'en-IN', browserTtsBcp47: 'en-IN' },
  hi: { code: 'hi', webSpeechBcp47: 'hi-IN', browserTtsBcp47: 'hi-IN' },
  kn: { code: 'kn', webSpeechBcp47: 'kn-IN', browserTtsBcp47: 'kn-IN' },
  te: { code: 'te', webSpeechBcp47: 'te-IN', browserTtsBcp47: 'te-IN' },
  ta: { code: 'ta', webSpeechBcp47: 'ta-IN', browserTtsBcp47: 'ta-IN' },
  ml: { code: 'ml', webSpeechBcp47: 'ml-IN', browserTtsBcp47: 'ml-IN' },
  mr: { code: 'mr', webSpeechBcp47: 'mr-IN', browserTtsBcp47: 'mr-IN' },
  gu: { code: 'gu', webSpeechBcp47: 'gu-IN', browserTtsBcp47: 'gu-IN' },
  bn: { code: 'bn', webSpeechBcp47: 'bn-IN', browserTtsBcp47: 'bn-IN' },
  pan: { code: 'pan', webSpeechBcp47: 'pa-IN', browserTtsBcp47: 'pa-IN' },
  ur: { code: 'ur', webSpeechBcp47: 'ur-IN', browserTtsBcp47: 'ur-IN' },
  hinglish: { code: 'hinglish', webSpeechBcp47: 'hi-IN', browserTtsBcp47: 'hi-IN' },
  tanglish: { code: 'tanglish', webSpeechBcp47: 'ta-IN', browserTtsBcp47: 'ta-IN' },
  kanglish: { code: 'kanglish', webSpeechBcp47: 'kn-IN', browserTtsBcp47: 'kn-IN' },
};

let merged: Record<string, VoiceRow> = { ...BUILTIN };

let loadPromise: Promise<void> | null = null;

export function getVoiceLocales(
  languageCode: string | undefined
): { webSpeech: string; browserTts: string } {
  const code = (languageCode || 'en').toLowerCase();
  const row = merged[code] || merged.en;
  return {
    webSpeech: row.webSpeechBcp47,
    browserTts: row.browserTtsBcp47,
  };
}

/** Light cleanup so TTS does not read markdown markers aloud */
export function stripVoiceOutputForSpeech(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

/** Fetch `/voice-languages.json` once and merge codes over builtins. Safe to call multiple times. */
export function ensureVoiceLanguagesLoaded(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const res = await fetch('/voice-languages.json', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as { languages?: VoiceLanguageOverlay[] };
      const list = data.languages;
      if (!Array.isArray(list)) return;

      const next: Record<string, VoiceRow> = { ...merged };
      for (const row of list) {
        if (!row?.code) continue;
        const key = String(row.code).toLowerCase();
        const base = BUILTIN[key] || BUILTIN.en;
        next[key] = {
          code: key,
          webSpeechBcp47: row.webSpeechBcp47 || base.webSpeechBcp47,
          browserTtsBcp47: row.browserTtsBcp47 || base.browserTtsBcp47,
          name: row.name ?? base.name,
          nativeName: row.nativeName ?? base.nativeName,
          flag: row.flag ?? base.flag,
        };
      }
      merged = next;
    } catch {
      /* keep builtins */
    }
  })();

  return loadPromise;
}
