import { useCallback, useEffect, useRef, useState } from 'react';
import type { TtsConfig, TtsSpeakHandle } from '@/lib/voice/tts';

/**
 * Browser TTS Hook - Production ready for Chrome/Firefox/Safari
 * Auto-selects regional voices (Hindi, Kannada, English-IN)
 * Minimal, reliable, with cancel support
 */
export interface UseTtsReturn {
  /** Is currently speaking */
  isSpeaking: boolean;
  /** Available voices filtered by language */
  voices: SpeechSynthesisVoice[];
  /** Selected voice name */
  selectedVoice: string | null;
  /** Speak text with optional lang override */
  speak: (text: string, lang?: string) => Promise<void>;
  /** Stop current speech */
  stop: () => void;
  /** Supported in this browser */
  isSupported: boolean;
}

export function useTts(): UseTtsReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    // 🔒 SSR Guard: Only run on client side
    if (typeof window === 'undefined') return;

    synthRef.current = window.speechSynthesis;
    const synth = synthRef.current;

    const loadVoices = () => {
      const allVoices = synth.getVoices();
      console.log('[TTS] Loaded voices:', allVoices.length);
      
      // Filter regional voices by lang priority
      const regionalVoices = allVoices.filter(voice => 
        ['en-IN', 'hi-IN', 'kn-IN'].some(lang => 
          voice.lang === lang || voice.lang.startsWith(lang.split('-')[0])
        )
      );
      
      console.log('[TTS] Regional voices found:', regionalVoices.map(v => `${v.name} (${v.lang})`));
      setVoices(regionalVoices);
      
      // Auto-select best voice
      const preferredOrder = ['hi-IN', 'kn-IN', 'en-IN'];
      for (const lang of preferredOrder) {
        const voice = regionalVoices.find(v => v.lang === lang);
        if (voice) {
          setSelectedVoice(voice.name);
          break;
        }
      }
    };

    // Load voices (Chrome loads async)
    loadVoices();
    const id = setInterval(loadVoices, 100);
    return () => clearInterval(id);
  }, []);

  // Speak function with lang detection & voice selection
  const speak = useCallback(async (text: string, langOverride?: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const synth = synthRef.current;
    if (!synth || !voices.length) {
      console.warn('[TTS] SpeechSynthesis not ready');
      return;
    }

    // Stop previous speech
    synth.cancel();
    
    // Determine language (override or auto)
    const lang = langOverride || 'en-IN';
    console.log(`[TTS] Speaking "${trimmed.substring(0, 50)}..." in ${lang}`);

    // Find best voice for language
    const voice = voices.find(v => 
      v.lang === lang || 
      v.lang.startsWith(lang.split('-')[0]) ||
      v.name.toLowerCase().includes(lang.split('-')[0])
    ) || voices[0];

    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = lang;
    utterance.rate = 0.95;      // Natural speed
    utterance.pitch = 1.0;       // Normal pitch
    utterance.volume = 0.9;     // Clear but not loud
    utterance.voice = voice;

    // Events for state management
    utterance.onstart = () => {
      setIsSpeaking(true);
      console.log(`[TTS] Started: ${voice.name}`);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      console.log('[TTS] Finished');
    };
    
    utterance.onerror = (e) => {
      setIsSpeaking(false);
      console.error('[TTS] Error:', e.error);
    };

    currentUtteranceRef.current = utterance;
    synth.speak(utterance);

    // Wait for completion
    await new Promise<void>((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = () => reject(new Error('TTS failed'));
    });
  }, [voices]);

  // Stop current speech
  const stop = useCallback(() => {
    const synth = synthRef.current;
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
      console.log('[TTS] Stopped');
    }
  }, []);

  return {
    isSpeaking,
    voices,
    selectedVoice,
    speak,
    stop,
    isSupported: typeof window !== 'undefined' && !!window.speechSynthesis,
  };
}
