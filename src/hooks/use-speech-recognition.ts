import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

/**
 * Speech recognition error types:
 * - no-speech: No voice detected (NON-ERROR, auto-retry)
 * - network: Network issue (auto-retry after delay)
 * - not-allowed: Permission denied (STOP — user must fix)
 * - service-not-allowed: Service unavailable (STOP)
 * - aborted: User cancelled
 * - bad-grammar: Speech unclear (retry)
 * - language-not-supported: Language not supported
 */

export interface UseSpeechRecognitionReturn {
  /** Whether microphone is currently listening */
  isListening: boolean;
  /** The recognized speech text (final) */
  transcript: string;
  /** The interim recognized speech text (partial) */
  interimTranscript: string;
  /** Whether browser supports speech recognition */
  isSupported: boolean;
  /** Error message (only for real errors, not no-speech) */
  error: string | null;
  /** Start listening */
  startListening: () => void;
  /** Stop listening */
  stopListening: () => void;
  /** Clear transcript */
  resetTranscript: () => void;
  /** Toggle listening state */
  toggleListening: () => void;
}

interface Options {
  /** Language code (BCP 47) e.g. 'en-US', 'kn-IN', 'hi-IN' */
  lang?: string;
  /** Continuous mode — keep listening after result */
  continuous?: boolean;
  /** Use interim results for real-time feedback */
  interimResults?: boolean;
  /** Max alternative results */
  maxAlternatives?: number;
  /** Delay before retry after 'no-speech' (ms) */
  retryDelayNoSpeech?: number;
  /** Delay before retry after 'network' (ms) */
  retryDelayNetwork?: number;
  /** Max consecutive retries for no-speech before giving up */
  maxNoSpeechRetries?: number;
  /** Whether to auto-restart after silence (continuous mode) */
  autoRestartOnSilence?: boolean;
  /** Delay before auto-restart (ms) */
  autoRestartDelay?: number;
  /** Callback when speech is recognized (final result) */
  onResult?: (transcript: string) => void;
  /** Callback when interim speech is recognized (partial result) */
  onInterimResult?: (transcript: string) => void;
  /** Callback when a real error occurs (not no-speech) */
  onError?: (error: string) => void;
  /** Callback when listening starts */
  onStart?: () => void;
  /** Callback when listening stops */
  onStop?: () => void;
}

export function useSpeechRecognition(options: Options = {}): UseSpeechRecognitionReturn {
  const {
    lang = 'en-IN',  // Default India English. Use: 'hi-IN', 'kn-IN', 'te-IN'
    continuous = true,
    interimResults = true,
    maxAlternatives = 1,
    retryDelayNoSpeech = 500,
    retryDelayNetwork = 2000,
    maxNoSpeechRetries = 5,
    autoRestartOnSilence = true,
    autoRestartDelay = 100,
    onResult,
    onInterimResult,
    onError,
    onStart,
    onStop,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const noSpeechRetryCountRef = useRef(0);
  const isFatalErrorRef = useRef(false);
  const isStoppedManuallyRef = useRef(false);
  const activeTranscriptsRef = useRef<string[]>([]);

  // Clear pending restart timeout
  const clearRestartTimeout = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, []);

  // Reset retry counter
  const resetRetryCount = useCallback(() => {
    noSpeechRetryCountRef.current = 0;
  }, []);

  // Process final transcript
  const processFinalTranscript = useCallback((text: string) => {
    if (!text.trim()) return;
    
    setTranscript(prev => {
      const newTranscript = prev ? `${prev} ${text.trim()}` : text.trim();
      onResult?.(text.trim());
      return newTranscript;
    });
    resetRetryCount();
  }, [onResult, resetRetryCount]);

   // Initialize recognition once on mount
   useEffect(() => {
     // 🔒 SSR Guard: Only initialize on client side
     if (typeof window === 'undefined') {
       console.log('[STT] Skipped initialization: server environment');
       return;
     }

     const SpeechRecognition = (
       (window as any).SpeechRecognition || 
       (window as any).webkitSpeechRecognition
     );

     if (!SpeechRecognition) {
       setIsSupported(false);
       console.warn('[STT] SpeechRecognition not supported');
       return;
     }

     console.log('[STT] ✅ SpeechRecognition supported with lang:', lang);
     setIsSupported(true);
     recognitionRef.current = new SpeechRecognition();

    const recognition = recognitionRef.current;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;
    recognition.maxAlternatives = maxAlternatives;

    // Handle start event
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setInterimTranscript('');
      isFatalErrorRef.current = false;
      isStoppedManuallyRef.current = false;
      activeTranscriptsRef.current = [];
      onStart?.();
    };

    // Handle speech result
    recognition.onresult = (event: any) => {
      let final = '';
      let interim = '';

      // Collect results from the event resultIndex to end
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;
        
        if (result.isFinal) {
          final += transcriptText + ' ';
        } else {
          interim += transcriptText;
        }
      }

      // Update interim transcript for real-time feedback
      if (interim) {
        setInterimTranscript(interim);
        onInterimResult?.(interim);
      }

      // Process final transcript
      if (final) {
        const trimmedFinal = final.trim();
        if (trimmedFinal) {
          processFinalTranscript(trimmedFinal);
        }
      }
    };

    // Handle speech end
    recognition.onend = () => {
      // Only update if not manually stopped
      if (!isStoppedManuallyRef.current) {
        setIsListening(false);
        onStop?.();
      }

      // Auto-restart for continuous listening
      if (
        continuous && 
        !isFatalErrorRef.current && 
        !isStoppedManuallyRef.current &&
        autoRestartOnSilence
      ) {
        clearRestartTimeout();
        restartTimeoutRef.current = setTimeout(() => {
          try {
            if (recognitionRef.current) {
              recognitionRef.current.start();
            }
          } catch (e) {
            console.error('Failed to auto-restart recognition:', e);
          }
        }, autoRestartDelay);
      }
    };

    // Handle errors
    recognition.onerror = (event: any) => {
      const errorType = event.error;
      console.log('[SpeechRecognition] Error:', errorType);

      const fatalErrors = ['not-allowed', 'service-not-allowed', 'aborted'];
      const isFatal = fatalErrors.includes(errorType);

      if (isFatal) {
        isFatalErrorRef.current = true;
      }

      // Handle no-speech (not a real error)
      if (errorType === 'no-speech') {
        noSpeechRetryCountRef.current++;

        if (noSpeechRetryCountRef.current <= maxNoSpeechRetries) {
          console.log(
            `[SpeechRecognition] No speech detected (attempt ${noSpeechRetryCountRef.current}/${maxNoSpeechRetries}), retrying...`
          );

          clearRestartTimeout();
          restartTimeoutRef.current = setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              console.error('[SpeechRecognition] Failed to restart after no-speech:', e);
            }
          }, retryDelayNoSpeech);
        } else {
          console.log('[SpeechRecognition] Max no-speech retries reached');
          setError('No speech detected. Please try speaking again.');
          onError?.('no-speech');
          noSpeechRetryCountRef.current = 0;
        }
        return;
      }

      // Handle network errors (auto-retry with backoff)
      if (errorType === 'network') {
        console.warn('[SpeechRecognition] Network error, retrying...');
        clearRestartTimeout();
        restartTimeoutRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.error('[SpeechRecognition] Failed to restart after network error:', e);
          }
        }, retryDelayNetwork);
        return;
      }

      // Handle fatal errors (permission denied, service not allowed, etc.)
      if (isFatal) {
        setIsListening(false);
        const userMessage = getFriendlyMessage(errorType);
        setError(userMessage);
        onError?.(errorType);
        onStop?.();
        return;
      }

      // Handle other errors (language-not-supported, bad-grammar, etc.)
      console.log('[SpeechRecognition] Non-fatal error, will retry');
      if (continuous && !isFatalErrorRef.current) {
        clearRestartTimeout();
        restartTimeoutRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.error('[SpeechRecognition] Failed to restart after error:', e);
          }
        }, 1000);
      }
    };

    // Cleanup on unmount
    return () => {
      clearRestartTimeout();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore stop errors on cleanup
        }
      }
    };
  }, [
    lang,
    continuous,
    interimResults,
    maxAlternatives,
    retryDelayNoSpeech,
    retryDelayNetwork,
    maxNoSpeechRetries,
    autoRestartOnSilence,
    autoRestartDelay,
    onResult,
    onInterimResult,
    onError,
    onStart,
    onStop,
    clearRestartTimeout,
    resetRetryCount,
    processFinalTranscript,
  ]);

   // Start listening
   const startListening = useCallback(async () => {
     // 🔒 SSR Guard: Only run on client side
     if (typeof window === 'undefined') {
       console.warn('[SpeechRecognition] Cannot start: server environment');
       return;
     }

     // 🔒 Browser API Guard: Check navigator.mediaDevices exists before using getUserMedia
     if (!navigator.mediaDevices?.getUserMedia) {
       console.warn('[SpeechRecognition] getUserMedia not supported');
       setError('Microphone access is not supported in this browser.');
       onError?.('not-supported');
       return;
     }

     if (!isSupported || !recognitionRef.current) {
       console.warn('[SpeechRecognition] Cannot start: not supported');
       return;
     }

     if (isListening) {
       console.log('[SpeechRecognition] Already listening');
       return;
     }

     // 🔒 CRITICAL: Force microphone permission before starting
     // This is required for browsers like Safari and Firefox
     let stream: MediaStream;
     try {
       stream = await navigator.mediaDevices.getUserMedia({
         audio: {
           echoCancellation: true,
           noiseSuppression: true,
           autoGainControl: true
         }
       });
       
       // Stop the temporary stream immediately (the recognition API will create its own)
       stream.getTracks().forEach(track => track.stop());
     } catch (err: any) {
       console.error('[SpeechRecognition] Microphone permission denied:', err.message);
       setError('Microphone access denied. Please allow microphone access and try again.');
       onError?.('not-allowed');
       return;
     }

     clearRestartTimeout();
     resetRetryCount();
     setError(null);
     setTranscript('');
     setInterimTranscript('');
     isStoppedManuallyRef.current = false;

     try {
       recognitionRef.current.start();
     } catch (e: any) {
       console.error('[SpeechRecognition] Failed to start:', e.message);
       setError('Could not start microphone. Please check permissions.');
       onError?.('start-error');
     }
   }, [
     isSupported,
     isListening,
     clearRestartTimeout,
     resetRetryCount,
     onError,
   ]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    isStoppedManuallyRef.current = true;
    clearRestartTimeout();
    resetRetryCount();

    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.error('[SpeechRecognition] Error stopping:', e);
    }
    
    setIsListening(false);
    onStop?.();
  }, [
    clearRestartTimeout,
    resetRetryCount,
    onStop,
  ]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Clear transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Generate a hook value that's memoized for stability
  return useMemo(
    () => ({
      isListening,
      transcript,
      interimTranscript,
      isSupported,
      error,
      startListening,
      stopListening,
      resetTranscript,
      toggleListening,
    }),
    [
      isListening,
      transcript,
      interimTranscript,
      isSupported,
      error,
      startListening,
      stopListening,
      resetTranscript,
      toggleListening,
    ]
  );
}

/**
 * Friendly error messages for end users
 */
function getFriendlyMessage(errorCode: string): string {
  switch (errorCode) {
    case 'not-allowed':
      return 'Microphone access was denied. Please allow microphone access in your browser settings and refresh the page.';
    case 'service-not-allowed':
      return 'Speech service is not available. Please check your browser permissions or try a different browser.';
    case 'aborted':
      return 'Speech recognition was cancelled.';
    case 'bad-grammar':
      return 'Speech could not be understood. Please try speaking more clearly.';
    case 'language-not-supported':
      return 'This language is not supported by your browser. Try switching to English.';
    case 'no-speech':
      return 'No speech detected. Please try speaking again.';
    case 'audio-capture':
      return 'Could not access microphone. Please check if your microphone is connected.';
    default:
      return `Speech recognition error (${errorCode}). Please try again.`;
  }
}
