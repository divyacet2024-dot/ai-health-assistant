/**
 * Enhanced Web Speech Recognition Hook
 * - Better browser compatibility
 * - Improved error handling with retries
 * - Support for multiple languages
 * - Real-time feedback with interim results
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  error: string | null;
  confidence: number;
  isFinal: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  toggleListening: () => void;
  retryListening: () => void;
}

interface Options {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  retryDelayMs?: number;
  maxRetries?: number;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onStop?: () => void;
  onConfidenceChange?: (confidence: number) => void;
}

export function useEnhancedSpeechRecognition(
  options: Options = {}
): UseSpeechRecognitionReturn {
  const {
    lang = 'en-IN',
    continuous = false,
    interimResults = true,
    maxAlternatives = 1,
    retryDelayMs = 1000,
    maxRetries = 3,
    onResult,
    onError,
    onStart,
    onStop,
    onConfidenceChange,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [isFinal, setIsFinal] = useState(false);

  const recognitionRef = useRef<any>(null);
  const retryCountRef = useRef(0);
  const isManuallyStoppedRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    // Configuration
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = maxAlternatives;
    recognition.lang = lang;

    // Event: Speech recognition started
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      retryCountRef.current = 0;
      isManuallyStoppedRef.current = false;
      onStart?.();
    };

    // Event: Interim results (partial transcript)
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      let bestConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const conf = event.results[i][0].confidence || 0;

        if (event.results[i].isFinal) {
          final += transcript + ' ';
          bestConfidence = Math.max(bestConfidence, conf);
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
      }

      if (final) {
        setTranscript((prev) => prev + final);
        setInterimTranscript('');
        setIsFinal(true);
        onResult?.(final.trim(), true);
      } else if (interim) {
        onResult?.(interim, false);
      }

      if (bestConfidence > 0) {
        setConfidence(bestConfidence);
        onConfidenceChange?.(bestConfidence);
      }
    };

    // Event: Error handling
    recognition.onerror = (event: any) => {
      const errorType = event.error;
      let errorMessage = 'Speech recognition error';

      switch (errorType) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          // Auto-retry for no-speech
          if (retryCountRef.current < maxRetries && !isManuallyStoppedRef.current) {
            retryCountRef.current++;
            retryTimeoutRef.current = setTimeout(() => {
              if (!isManuallyStoppedRef.current) {
                recognition.start();
              }
            }, retryDelayMs);
            return;
          }
          break;

        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          if (retryCountRef.current < maxRetries && !isManuallyStoppedRef.current) {
            retryCountRef.current++;
            retryTimeoutRef.current = setTimeout(() => {
              if (!isManuallyStoppedRef.current) {
                recognition.start();
              }
            }, retryDelayMs * 2);
            return;
          }
          break;

        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please enable microphone access.';
          break;

        case 'service-not-allowed':
          errorMessage = 'Speech recognition service not available.';
          break;

        case 'bad-grammar':
          errorMessage = 'Speech not recognized. Please try again.';
          break;

        case 'aborted':
          errorMessage = 'Speech recognition cancelled.';
          break;

        default:
          errorMessage = `Error: ${errorType}`;
      }

      setError(errorMessage);
      setIsListening(false);
      onError?.(errorMessage);
    };

    // Event: Speech recognition ended
    recognition.onend = () => {
      setIsListening(false);
      onStop?.();

      // Auto-restart if in continuous mode and not manually stopped
      if (continuous && !isManuallyStoppedRef.current && !error) {
        retryTimeoutRef.current = setTimeout(() => {
          if (!isManuallyStoppedRef.current) {
            recognition.start();
          }
        }, 500);
      }
    };

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (recognition) {
        recognition.abort();
      }
    };
  }, [continuous, interimResults, maxAlternatives, lang, maxRetries, retryDelayMs, error, onStart, onStop, onResult, onError, onConfidenceChange]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;

    isManuallyStoppedRef.current = false;
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    retryCountRef.current = 0;

    try {
      recognitionRef.current.start();
    } catch (err: any) {
      if (err.message && err.message.includes('already started')) {
        // Already listening
        return;
      }
      console.error('Error starting speech recognition:', err);
    }
  }, [isSupported]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    isManuallyStoppedRef.current = true;
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error('Error stopping speech recognition:', err);
    }
  }, []);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setConfidence(0);
    setIsFinal(false);
    setError(null);
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Retry listening
  const retryListening = useCallback(() => {
    resetTranscript();
    retryCountRef.current = 0;
    startListening();
  }, [resetTranscript, startListening]);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    confidence,
    isFinal,
    startListening,
    stopListening,
    resetTranscript,
    toggleListening,
    retryListening,
  };
}
