"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { UserRole } from '@/lib/types';
import {
  VoiceAgent,
  type VoiceAgentStatus,
  type ClientGeoPayload,
} from '@/lib/voice/voiceAgent';
import type { BookingFlowState } from '@/lib/voice/bookingConversation';
import { getSession } from '@/lib/auth';
import {
  ensureVoiceLanguagesLoaded,
  getVoiceLocales,
  stripVoiceOutputForSpeech,
} from '@/lib/voice-language-registry';

function resolvePatientLabel(explicit?: string | null): string | undefined {
  const trimmed = explicit?.trim();
  if (trimmed) return trimmed;
  if (typeof window === 'undefined') return undefined;
  return getSession()?.name?.trim() || undefined;
}

/** After this much quiet time with something spoken, auto-send (browser Web Speech only). */
const WEB_SPEECH_SILENCE_MS = 2000;

/** After partial transcript stops changing this long, stop recording and send (Whisper / MediaRecorder). */
const WHISPER_SILENCE_MS = 2600;

function getHasWhisperStt(): boolean {
  const groq = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  const openai = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  return Boolean(groq || openai);
}

type UseVoiceAgentParams = {
  role: UserRole;
  preferredLanguage?: string;
  voiceOutputEnabled?: boolean;
  /** GPS from browser — improves NLP / localized answers on the server */
  clientLocation?: ClientGeoPayload | null;
  /** Overrides logged-in session name on appointment records */
  patientName?: string;
  router?: { push: (path: string) => void };
  onUserText?: (text: string) => void;
  onAssistantText?: (text: string) => void;
};

type VoiceAgentUIState = {
  status: VoiceAgentStatus;
  listening: boolean;
  processing: boolean;
  speaking: boolean;
  transcript: string;
  interimTranscript: string;
  error?: string;
};

function pickSupportedMimeType(): string {
  if (typeof window === 'undefined') {
    return 'audio/webm';
  }
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ];
  const MR = (window as any).MediaRecorder;
  if (!MR?.isTypeSupported) return 'audio/webm';
  for (const t of candidates) if (MR.isTypeSupported(t)) return t;
  return 'audio/webm';
}

export function useVoiceAgent(params: UseVoiceAgentParams) {
  const hasWhisperStt = useMemo(() => getHasWhisperStt(), []);

  useEffect(() => {
    void ensureVoiceLanguagesLoaded();
  }, []);

  const [ui, setUi] = useState<VoiceAgentUIState>({
    status: 'idle',
    listening: false,
    processing: false,
    speaking: false,
    transcript: '',
    interimTranscript: '',
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const partialTimerRef = useRef<number | null>(null);
  const historyRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  /** Multi-turn voice booking (symptom → confirm → book) */
  const bookingFlowRef = useRef<BookingFlowState | null>(null);
  const partialWindowMs = 3800;

  const webSpeechRef = useRef<any>(null);
  const webSpeechManualStopRef = useRef(false);
  const webSpeechFatalRef = useRef(false);
  const webSpeechFinalBufferRef = useRef('');
  const webSpeechInterimRef = useRef('');
  const webSpeechNoSpeechRetriesRef = useRef(0);
  const webSpeechRestartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const webSpeechSilenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** False after silence-submit or teardown — prevents endless listen/restart loop. */
  const webSpeechSessionActiveRef = useRef(false);

  const whisperSilenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const whisperLastPartialRef = useRef('');

  const clearWhisperSilenceTimer = useCallback(() => {
    if (whisperSilenceTimerRef.current) {
      clearTimeout(whisperSilenceTimerRef.current);
      whisperSilenceTimerRef.current = null;
    }
  }, []);

  const clearWebSpeechRestart = useCallback(() => {
    if (webSpeechRestartTimerRef.current) {
      clearTimeout(webSpeechRestartTimerRef.current);
      webSpeechRestartTimerRef.current = null;
    }
  }, []);

  const clearWebSpeechSilenceTimer = useCallback(() => {
    if (webSpeechSilenceTimerRef.current) {
      clearTimeout(webSpeechSilenceTimerRef.current);
      webSpeechSilenceTimerRef.current = null;
    }
  }, []);

  const agent = useMemo(() => {
    const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';
    const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
    const endpoint =
      process.env.NEXT_PUBLIC_WHISPER_ENDPOINT ||
      (groqKey ? 'https://api.groq.com/openai/v1/audio/transcriptions' : 'https://api.openai.com/v1/audio/transcriptions');

    const apiKey = groqKey || openaiKey;

    const elevenKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '';
    const elevenVoice = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    const { browserTts } = getVoiceLocales(params.preferredLanguage);

     return new VoiceAgent({
      role: params.role,
      preferredLanguage: params.preferredLanguage,
      clientLocation: params.clientLocation ?? null,
      router: params.router,
      onNavigate: params.router?.push,
      stt: {
        config: {
          whisper: apiKey ? { endpoint, apiKey, model: 'whisper-1' } : undefined,
        },
        partialWindowMs,
      },
      tts: {
        enabled: params.voiceOutputEnabled !== false,
        configPrimary: elevenKey
          ? {
              provider: 'elevenlabs',
              elevenlabs: { apiKey: elevenKey, voiceId: elevenVoice },
            }
          : {
              provider: 'browser',
              browser: {
                lang: browserTts,
                rate: 0.96,
                pitch: 1.02,
                volume: 0.92,
              },
            },
        configFallbackBrowser: {
          provider: 'browser',
          browser: {
            lang: browserTts,
            rate: 0.96,
            pitch: 1.02,
            volume: 0.92,
          },
        },
      },
      llmEndpoint: '/api/ai-chat',
    });
  }, [
    params.role,
    params.preferredLanguage,
    params.voiceOutputEnabled,
    params.clientLocation,
    partialWindowMs,
  ]);

  const processUserUtterance = useCallback(
    async (userText: string) => {
      const trimmed = userText.trim();
      setUi((s) => ({ ...s, transcript: trimmed, interimTranscript: '' }));
      if (!trimmed) {
        setUi((s) => ({ ...s, processing: false, status: 'idle' }));
        return;
      }

      try {
        params.onUserText?.(trimmed);
        historyRef.current = [...historyRef.current, { role: 'user' as const, content: trimmed }].slice(-12);

        const result = await agent.runTurn({
          userText: trimmed,
          history: historyRef.current,
          bookingFlow: bookingFlowRef.current,
          patientName: resolvePatientLabel(params.patientName),
          voiceMode: true,
        });
        bookingFlowRef.current = result.nextBookingFlow ?? null;
        historyRef.current = [...historyRef.current, { role: 'assistant' as const, content: result.assistantText }].slice(-12);

        agent.maybeNavigate(result);
        params.onAssistantText?.(result.assistantText);

        setUi((s) => ({ ...s, processing: false, speaking: true, status: 'speaking' }));
        await agent.speak(stripVoiceOutputForSpeech(result.assistantText));
        setUi((s) => ({ ...s, speaking: false, status: 'idle' }));
      } catch (e: any) {
        setUi((s) => ({
          ...s,
          processing: false,
          speaking: false,
          status: 'idle',
          error: e?.message || 'Voice error',
        }));
      }
    },
    [agent, params.onAssistantText, params.onUserText, params.patientName]
  );

  const processUserUtteranceRef = useRef(processUserUtterance);
  processUserUtteranceRef.current = processUserUtterance;

  const stopListeningRef = useRef<() => Promise<void>>(async () => {});

  const stopMedia = useCallback(() => {
    try {
      mediaRecorderRef.current?.stop();
    } catch {
      // ignore
    }
    mediaRecorderRef.current = null;
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) t.stop();
    }
    streamRef.current = null;
  }, []);

  const stopPartialLoop = useCallback(() => {
    if (partialTimerRef.current && typeof window !== 'undefined') {
      window.clearInterval(partialTimerRef.current);
      partialTimerRef.current = null;
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    agent.stopSpeaking();
    setUi((s) => ({
      ...s,
      speaking: false,
      status: s.listening ? 'listening' : s.processing ? 'processing' : 'idle',
    }));
  }, [agent]);

  const stopListening = useCallback(async () => {
    clearWhisperSilenceTimer();

    if (!hasWhisperStt) {
      clearWebSpeechSilenceTimer();
      clearWebSpeechRestart();
      const rec = webSpeechRef.current;
      if (!rec) {
        setUi((s) => ({ ...s, listening: false, status: s.processing ? 'processing' : 'idle' }));
        return;
      }
      webSpeechManualStopRef.current = true;
      try {
        rec.stop();
      } catch {
        setUi((s) => ({ ...s, listening: false, processing: false, status: 'idle' }));
      }
      return;
    }

    stopPartialLoop();

    const mr = mediaRecorderRef.current;
    if (!mr) {
      stopMedia();
      setUi((s) => ({ ...s, listening: false, status: s.processing ? 'processing' : 'idle' }));
      return;
    }

    try {
      if (mr.state === 'recording') {
        mr.requestData();
      }
    } catch {
      // ignore
    }

    await new Promise<void>((resolve) => {
      const onStop = () => resolve();
      mr.addEventListener('stop', onStop, { once: true });
      try {
        mr.stop();
      } catch {
        resolve();
      }
    });

    stopMedia();

    const finalBlob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
    chunksRef.current = [];

    setUi((s) => ({ ...s, listening: false, processing: true, status: 'processing' }));

    try {
      if (!finalBlob.size) {
        setUi((s) => ({ ...s, processing: false, status: 'idle', error: 'No audio captured. Speak closer to the mic and try again.' }));
        return;
      }
      const text = await agent.sttTranscribe(finalBlob);
      await processUserUtterance(text);
    } catch (e: any) {
      const msg = e?.message || 'Voice error';
      if (msg.includes('not configured') || msg.includes('missing whisper')) {
        setUi((s) => ({
          ...s,
          processing: false,
          status: 'idle',
          error: 'Speech-to-text is not configured. Add NEXT_PUBLIC_GROQ_API_KEY or NEXT_PUBLIC_OPENAI_API_KEY, or use Chrome/Edge with the built-in mic.',
        }));
      } else {
        setUi((s) => ({ ...s, processing: false, speaking: false, status: 'idle', error: msg }));
      }
    }
  }, [agent, clearWebSpeechRestart, clearWebSpeechSilenceTimer, clearWhisperSilenceTimer, hasWhisperStt, processUserUtterance, stopMedia, stopPartialLoop]);

  stopListeningRef.current = stopListening;

  const startListening = useCallback(async () => {
    if (typeof window === 'undefined') {
      console.warn('[VoiceAgent] Cannot start: server environment');
      return;
    }

    if (!hasWhisperStt) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition || !webSpeechRef.current) {
        setUi((s) => ({
          ...s,
          error:
            'Voice input needs either API keys (Groq/OpenAI Whisper) or a browser with Web Speech (Chrome, Edge, Safari).',
        }));
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setUi((s) => ({ ...s, error: 'Microphone not supported in this browser' }));
        return;
      }

      agent.interruptAll();
      clearWebSpeechRestart();
      clearWebSpeechSilenceTimer();
      webSpeechFatalRef.current = false;
      webSpeechManualStopRef.current = false;
      webSpeechFinalBufferRef.current = '';
      webSpeechInterimRef.current = '';
      webSpeechNoSpeechRetriesRef.current = 0;
      webSpeechSessionActiveRef.current = false;

      setUi((s) => ({
        ...s,
        error: undefined,
        transcript: '',
        interimTranscript: '',
        listening: true,
        processing: false,
        speaking: false,
        status: 'listening',
      }));

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        stream.getTracks().forEach((t) => t.stop());
      } catch (err: any) {
        console.error('[VoiceAgent] Microphone permission denied:', err?.message);
        setUi((s) => ({
          ...s,
          listening: false,
          status: 'idle',
          error: 'Microphone access denied. Please allow microphone access and try again.',
        }));
        return;
      }

      webSpeechSessionActiveRef.current = true;

      const rec = webSpeechRef.current;
      rec.lang = getVoiceLocales(params.preferredLanguage).webSpeech;
      try {
        rec.start();
      } catch (e: any) {
        console.error('[VoiceAgent] Web Speech start failed:', e);
        webSpeechSessionActiveRef.current = false;
        setUi((s) => ({
          ...s,
          listening: false,
          status: 'idle',
          error: 'Could not start speech recognition. Try again or use another browser.',
        }));
      }
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      console.warn('[VoiceAgent] getUserMedia not supported');
      setUi((s) => ({ ...s, error: 'Microphone not supported in this browser' }));
      return;
    }

    agent.interruptAll();
    stopPartialLoop();
    stopMedia();
    clearWhisperSilenceTimer();
    whisperLastPartialRef.current = '';

    setUi((s) => ({
      ...s,
      error: undefined,
      transcript: '',
      interimTranscript: '',
      listening: true,
      processing: false,
      speaking: false,
      status: 'listening',
    }));

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err: any) {
      console.error('[VoiceAgent] Microphone permission denied:', err.message);
      setUi((s) => ({
        ...s,
        listening: false,
        status: 'idle',
        error: 'Microphone access denied. Please allow microphone access and try again.',
      }));
      return;
    }

    streamRef.current = stream;

    const mimeType = pickSupportedMimeType();
    let mr: MediaRecorder;
    try {
      mr = new MediaRecorder(stream, { mimeType });
    } catch (e) {
      console.error('[VoiceAgent] Failed to create MediaRecorder:', e);
      stream.getTracks().forEach((track) => track.stop());
      setUi((s) => ({ ...s, listening: false, status: 'idle', error: 'Could not initialize audio recording' }));
      return;
    }
    mediaRecorderRef.current = mr;
    chunksRef.current = [];

    mr.addEventListener('dataavailable', (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    });

    partialTimerRef.current = window.setInterval(async () => {
      if (!mediaRecorderRef.current) return;
      if (chunksRef.current.length < 2) return;

      const approxChunkMs = 500;
      const need = Math.max(2, Math.ceil(partialWindowMs / approxChunkMs));
      const tail = chunksRef.current.slice(-need);
      const blob = new Blob(tail, { type: mr.mimeType || 'audio/webm' });

      try {
        const text = await agent.sttTranscribe(blob);
        const trimmed = text.trim();
        if (trimmed && trimmed !== whisperLastPartialRef.current) {
          whisperLastPartialRef.current = trimmed;
          clearWhisperSilenceTimer();
          whisperSilenceTimerRef.current = setTimeout(() => {
            void stopListeningRef.current();
          }, WHISPER_SILENCE_MS);
        }
        setUi((s) => (s.listening ? { ...s, interimTranscript: text } : s));
      } catch {
        // ignore partial failures
      }
    }, 1400);

    try {
      mr.start(500);
    } catch (e) {
      console.error('[VoiceAgent] Failed to start MediaRecorder:', e);
      stopMedia();
      setUi((s) => ({ ...s, listening: false, status: 'idle', error: 'Could not start recording' }));
    }
  }, [
    agent,
    clearWebSpeechRestart,
    clearWebSpeechSilenceTimer,
    hasWhisperStt,
    params.preferredLanguage,
    partialWindowMs,
    stopMedia,
    stopPartialLoop,
    clearWhisperSilenceTimer,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined' || hasWhisperStt) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      webSpeechRef.current = null;
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = getVoiceLocales(params.preferredLanguage).webSpeech;

    const scheduleSilenceSubmit = () => {
      clearWebSpeechSilenceTimer();
      if (!webSpeechSessionActiveRef.current) return;
      const preview = [webSpeechFinalBufferRef.current, webSpeechInterimRef.current].filter(Boolean).join(' ').trim();
      if (!preview) return;

      webSpeechSilenceTimerRef.current = setTimeout(() => {
        if (!webSpeechSessionActiveRef.current) return;
        const text = [webSpeechFinalBufferRef.current, webSpeechInterimRef.current].filter(Boolean).join(' ').trim();
        if (!text.trim()) return;

        webSpeechSessionActiveRef.current = false;
        clearWebSpeechSilenceTimer();
        clearWebSpeechRestart();

        webSpeechFinalBufferRef.current = '';
        webSpeechInterimRef.current = '';

        setUi((s) => ({
          ...s,
          listening: false,
          processing: true,
          interimTranscript: '',
          status: 'processing',
        }));

        try {
          webSpeechRef.current?.stop();
        } catch {
          /* ignore */
        }

        void processUserUtteranceRef.current(text);
      }, WEB_SPEECH_SILENCE_MS);
    };

    recognition.onstart = () => {
      webSpeechNoSpeechRetriesRef.current = 0;
      setUi((s) => ({ ...s, interimTranscript: '' }));
    };

    recognition.onresult = (event: any) => {
      let finalPiece = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const t = result[0]?.transcript ?? '';
        if (result.isFinal) {
          finalPiece += t;
        } else {
          interim += t;
        }
      }
      if (finalPiece.trim()) {
        const prev = webSpeechFinalBufferRef.current;
        webSpeechFinalBufferRef.current = prev ? `${prev} ${finalPiece.trim()}` : finalPiece.trim();
      }
      webSpeechInterimRef.current = interim.trim();
      const live = [webSpeechFinalBufferRef.current, webSpeechInterimRef.current].filter(Boolean).join(' ').trim();
      setUi((s) => (s.listening ? { ...s, interimTranscript: live } : s));
      scheduleSilenceSubmit();
    };

    recognition.onerror = (event: any) => {
      const err = event.error as string;
      if (err === 'no-speech') {
        webSpeechNoSpeechRetriesRef.current += 1;
        if (
          webSpeechSessionActiveRef.current &&
          webSpeechNoSpeechRetriesRef.current <= 5 &&
          !webSpeechFatalRef.current
        ) {
          clearWebSpeechRestart();
          webSpeechRestartTimerRef.current = setTimeout(() => {
            try {
              if (
                webSpeechRef.current &&
                !webSpeechManualStopRef.current &&
                webSpeechSessionActiveRef.current
              ) {
                webSpeechRef.current.start();
              }
            } catch {
              /* already running */
            }
          }, 400);
        }
        return;
      }
      if (err === 'not-allowed' || err === 'service-not-allowed' || err === 'audio-capture') {
        webSpeechFatalRef.current = true;
        setUi((s) => ({
          ...s,
          listening: false,
          status: 'idle',
          error:
            err === 'not-allowed'
              ? 'Microphone or speech recognition was blocked. Allow access in browser settings.'
              : 'Speech recognition is unavailable. Try Chrome/Edge or check permissions.',
        }));
      }
    };

    recognition.onend = () => {
      if (webSpeechFatalRef.current) return;

      if (!webSpeechSessionActiveRef.current) {
        return;
      }

      if (webSpeechManualStopRef.current) {
        webSpeechManualStopRef.current = false;
        webSpeechSessionActiveRef.current = false;
        clearWebSpeechSilenceTimer();
        const finals = webSpeechFinalBufferRef.current.trim();
        const interim = webSpeechInterimRef.current.trim();
        const combined = [finals, interim].filter(Boolean).join(' ').trim();
        webSpeechFinalBufferRef.current = '';
        webSpeechInterimRef.current = '';
        setUi((s) => ({ ...s, listening: false, processing: true, status: 'processing' }));
        void processUserUtteranceRef.current(combined);
        return;
      }

      clearWebSpeechRestart();
      webSpeechRestartTimerRef.current = setTimeout(() => {
        try {
          if (
            webSpeechRef.current &&
            webSpeechSessionActiveRef.current &&
            !webSpeechManualStopRef.current &&
            !webSpeechFatalRef.current
          ) {
            webSpeechRef.current.start();
          }
        } catch {
          /* ignore */
        }
      }, 120);
    };

    webSpeechRef.current = recognition;

    return () => {
      clearWebSpeechRestart();
      clearWebSpeechSilenceTimer();
      webSpeechSessionActiveRef.current = false;
      webSpeechManualStopRef.current = true;
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
      webSpeechRef.current = null;
    };
  }, [clearWebSpeechRestart, clearWebSpeechSilenceTimer, hasWhisperStt, params.preferredLanguage]);

  const toggleListening = useCallback(() => {
    setUi((s) => {
      if (s.listening) {
        void stopListening();
        return s;
      }
      void startListening();
      return s;
    });
  }, [startListening, stopListening]);

  const submitText = useCallback(
    async (text: string) => {
      const userText = text.trim();
      if (!userText) return;
      agent.interruptAll();
      setUi((s) => ({ ...s, error: undefined, processing: true, speaking: false, status: 'processing' }));

      try {
        params.onUserText?.(userText);
        historyRef.current = [...historyRef.current, { role: 'user' as const, content: userText }].slice(-12);
        const result = await agent.runTurn({
          userText,
          history: historyRef.current,
          bookingFlow: bookingFlowRef.current,
          patientName: resolvePatientLabel(params.patientName),
          voiceMode: false,
        });
        bookingFlowRef.current = result.nextBookingFlow ?? null;
        historyRef.current = [...historyRef.current, { role: 'assistant' as const, content: result.assistantText }].slice(-12);

        agent.maybeNavigate(result);
        params.onAssistantText?.(result.assistantText);
        setUi((s) => ({ ...s, processing: false, speaking: true, status: 'speaking' }));
        await agent.speak(stripVoiceOutputForSpeech(result.assistantText));
        setUi((s) => ({ ...s, speaking: false, status: 'idle' }));
      } catch (e: any) {
        setUi((s) => ({
          ...s,
          processing: false,
          speaking: false,
          status: 'idle',
          error: e?.message || 'Voice error',
        }));
      }
    },
    [agent, params.onAssistantText, params.onUserText, params.patientName]
  );

  useEffect(() => {
    return () => {
      stopPartialLoop();
      stopMedia();
      clearWebSpeechRestart();
      clearWebSpeechSilenceTimer();
      clearWhisperSilenceTimer();
      agent.interruptAll();
    };
  }, [agent, clearWebSpeechRestart, clearWebSpeechSilenceTimer, clearWhisperSilenceTimer, stopMedia, stopPartialLoop]);

  const clientSupported =
    typeof window !== 'undefined' &&
    !!navigator?.mediaDevices?.getUserMedia &&
    (hasWhisperStt
      ? typeof MediaRecorder !== 'undefined'
      : !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));

  return {
    ...ui,
    startListening,
    stopListening,
    toggleListening,
    stopSpeaking,
    submitText,
    isSupported: clientSupported,
  };
}
