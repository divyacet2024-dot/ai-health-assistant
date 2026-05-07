/**
 * Unified Voice Service
 * Combines Web Speech API, Whisper, and Gemini with intelligent fallback
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEnhancedSpeechRecognition } from '@/hooks/use-enhanced-speech-recognition';
import { transcribeAudioWithWhisper, getWhisperConfig, isWhisperConfigured } from '@/lib/whisper-api';
import { getGeminiClient, isGeminiConfigured } from '@/lib/gemini-api-enhanced';
import type { UserRole } from '@/lib/types';

export interface VoiceServiceConfig {
  language?: string;
  role: UserRole;
  useWhisper?: boolean;
  voiceOutputEnabled?: boolean;
}

export interface VoiceServiceState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
  response: string;
  error?: string;
  confidence: number;
}

export type VoiceServiceStatus =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error';

/**
 * Unified Voice Service Hook
 * Manages all voice AI interactions
 */
export function useVoiceService(config: VoiceServiceConfig) {
  const { language = 'en-IN', role, useWhisper: enableWhisper = true, voiceOutputEnabled = true } = config;

  const [state, setState] = useState<VoiceServiceState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    transcript: '',
    interimTranscript: '',
    response: '',
    error: undefined,
    confidence: 0,
  });

  const [status, setStatus] = useState<VoiceServiceStatus>('idle');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const geminiClientRef = useRef<ReturnType<typeof getGeminiClient> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize Gemini client
  useEffect(() => {
    if (isGeminiConfigured()) {
      try {
        geminiClientRef.current = getGeminiClient();
      } catch (error) {
        console.error('Failed to initialize Gemini client:', error);
      }
    }
  }, []);

  // Initialize Web Speech Recognition
  const speechRecognition = useEnhancedSpeechRecognition({
    lang: language,
    continuous: false,
    interimResults: true,
    maxAlternatives: 1,
    maxRetries: 3,
    onStart: () => {
      setState((prev) => ({
        ...prev,
        isListening: true,
        error: undefined,
      }));
      setStatus('listening');
    },
    onStop: () => {
      setState((prev) => ({
        ...prev,
        isListening: false,
      }));
    },
    onResult: (transcript, isFinal) => {
      if (isFinal) {
        setState((prev) => ({
          ...prev,
          transcript: prev.transcript + ' ' + transcript,
          interimTranscript: '',
        }));
      } else {
        setState((prev) => ({
          ...prev,
          interimTranscript: transcript,
        }));
      }
    },
    onError: (error) => {
      setState((prev) => ({
        ...prev,
        error,
        isListening: false,
      }));
      setStatus('error');
    },
    onConfidenceChange: (confidence) => {
      setState((prev) => ({
        ...prev,
        confidence,
      }));
    },
  });

  // Setup MediaRecorder for Whisper
  const setupMediaRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Find supported MIME type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ];

      let selectedMimeType = 'audio/webm';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      return true;
    } catch (error) {
      console.error('Error setting up media recorder:', error);
      setState((prev) => ({
        ...prev,
        error: 'Microphone access denied. Please enable microphone permissions.',
      }));
      return false;
    }
  }, []);

  // Start voice capture
  const startListening = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      response: '',
      error: undefined,
    }));

    if (enableWhisper && isWhisperConfigured()) {
      // Use Whisper (record audio)
      const success = await setupMediaRecorder();
      if (!success) return;

      chunksRef.current = [];

      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.start();
        setState((prev) => ({
          ...prev,
          isListening: true,
        }));
        setStatus('listening');
      }
    } else {
      // Fallback to Web Speech API
      speechRecognition.startListening();
    }
  }, [enableWhisper, setupMediaRecorder, speechRecognition]);

  // Stop voice capture
  const stopListening = useCallback(async () => {
    if (enableWhisper && isWhisperConfigured() && mediaRecorderRef.current) {
      // Stop recording and transcribe with Whisper
      return new Promise<void>((resolve) => {
        const mediaRecorder = mediaRecorderRef.current;
        if (!mediaRecorder) {
          resolve();
          return;
        }

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          chunksRef.current = [];

          // Cleanup stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }

          setState((prev) => ({
            ...prev,
            isListening: false,
            isProcessing: true,
          }));
          setStatus('processing');

          // Transcribe with Whisper
          const whisperConfig = getWhisperConfig();
          const result = await transcribeAudioWithWhisper(audioBlob, {
            ...whisperConfig,
            language,
          } as any);

          if ('error' in result) {
            setState((prev) => ({
              ...prev,
              error: result.error,
              isProcessing: false,
            }));
            setStatus('error');
          } else {
            setState((prev) => ({
              ...prev,
              transcript: result.text,
              isProcessing: false,
            }));
            // Process with Gemini
            await processWithGemini(result.text);
          }

          resolve();
        };

        mediaRecorder.stop();
      });
    } else {
      // Web Speech API
      speechRecognition.stopListening();

      // Process with Gemini if transcript exists
      if (state.transcript) {
        await processWithGemini(state.transcript);
      }
    }
  }, [enableWhisper, state.transcript]);

  // Process transcript with Gemini
  const processWithGemini = useCallback(
    async (text: string) => {
      if (!text || !geminiClientRef.current) {
        return;
      }

      setState((prev) => ({
        ...prev,
        isProcessing: true,
      }));
      setStatus('processing');

      abortControllerRef.current = new AbortController();

      try {
        const response = await geminiClientRef.current.chat(text);

        if (response.error) {
          setState((prev) => ({
            ...prev,
            error: response.error,
            isProcessing: false,
          }));
          setStatus('error');
        } else {
          setState((prev) => ({
            ...prev,
            response: response.text,
            isProcessing: false,
          }));

          // Speak response if enabled
          if (voiceOutputEnabled && 'speechSynthesis' in window) {
            speakResponse(response.text);
          } else {
            setStatus('idle');
          }
        }
      } catch (error) {
        console.error('Error processing with Gemini:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to process response. Please try again.',
          isProcessing: false,
        }));
        setStatus('error');
      }
    },
    [voiceOutputEnabled]
  );

  // Text-to-Speech
  const speakResponse = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      setStatus('idle');
      return;
    }

    setState((prev) => ({
      ...prev,
      isSpeaking: true,
    }));
    setStatus('speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use language-appropriate voice
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = language.split('-')[0];
    const matchingVoice = voices.find((v) => v.lang.startsWith(langPrefix));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      setState((prev) => ({
        ...prev,
        isSpeaking: false,
      }));
      setStatus('idle');
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setState((prev) => ({
        ...prev,
        isSpeaking: false,
        error: 'Failed to play audio response',
      }));
      setStatus('error');
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [language]);

  // Stop speech
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setState((prev) => ({
        ...prev,
        isSpeaking: false,
      }));
      setStatus('idle');
    }
  }, []);

  // Retry on error
  const retry = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: undefined,
    }));
    startListening();
  }, [startListening]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    state,
    status,

    // Controls
    startListening,
    stopListening,
    speakResponse,
    stopSpeaking,
    retry,

    // Metadata
    isSupported: speechRecognition.isSupported,
    hasWhisper: isWhisperConfigured(),
    hasGemini: isGeminiConfigured(),
  };
}
