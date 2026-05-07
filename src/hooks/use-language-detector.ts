import { useState, useEffect, useCallback, useMemo } from 'react';
import { detectLanguage, detectScript, normalizeText, LanguageCode, LANGUAGES } from '@/lib/languages';

/**
 * Hook: Detect language from text input
 */
export function useLanguageDetector(text: string) {
  const normalized = normalizeText(text);
  
  const script = useMemo(() => detectScript(text), [text]);
  
  const isMixed = useMemo(() => {
    const hasLatin = /[a-zA-Z]/.test(text);
    const hasNativeScript = /[^\x00-\x7F]/.test(text);
    return hasLatin && hasNativeScript;
  }, [text]);

  const { detectedLanguage, confidence } = useMemo(() => {
    if (normalized.length < 3) {
      return { detectedLanguage: 'en' as LanguageCode, confidence: 0.5 };
    }

    const lang = detectLanguage(normalized);
    const words = normalized.split(' ').length;
    const baseConfidence = Math.min(words / 5, 1);
    
    return {
      detectedLanguage: lang,
      confidence: lang === 'en' ? 0.8 : baseConfidence,
    };
  }, [normalized]);

  return { detectedLanguage, confidence, script, isMixed };
}

/**
 * Hook: Manage user's language preference (persisted)
 */
export function useUserLanguage() {
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>('auto');
  const [detectedLanguage, setDetectedLanguage] = useState<LanguageCode>('en');

  useEffect(() => {
    const saved = localStorage.getItem('userLanguage') as LanguageCode;
    if (saved && Object.keys(LANGUAGES).includes(saved as string)) {
      setPreferredLanguage(saved);
    }
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setPreferredLanguage(lang);
    localStorage.setItem('userLanguage', lang);
  }, []);

  const effectiveLanguage = useMemo(() => {
    return preferredLanguage === 'auto' ? detectedLanguage : preferredLanguage;
  }, [preferredLanguage, detectedLanguage]);

  return {
    preferredLanguage,
    detectedLanguage,
    effectiveLanguage,
    setLanguage,
    isAuto: preferredLanguage === 'auto',
  };
}
