import type { UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  advanceVoiceBooking,
  type BookingFlowState,
} from '@/lib/voice/bookingConversation';
import { transcribeAudio, type SttConfig } from '@/lib/voice/stt';
import { speakText, type TtsConfig, type TtsSpeakHandle } from '@/lib/voice/tts';

export type VoiceAgentStatus = 'idle' | 'listening' | 'processing' | 'speaking';

export type VoiceAgentIntent =
  | { type: 'emergency'; confidence: number; extracted?: Record<string, any> }
  | { type: 'appointment'; confidence: number; extracted?: Record<string, any> }
  | { type: 'medicine'; confidence: number; extracted?: Record<string, any> }
  | { type: 'student_query'; confidence: number; extracted?: Record<string, any> }
  | { type: 'general'; confidence: number; extracted?: Record<string, any> };

export type VoiceAgentActionResult = {
  intent: VoiceAgentIntent;
  assistantText: string;
  action?: { type: 'navigate'; path: string } | { type: 'simulated_api'; name: string; data?: any };
  raw?: any;
  /** Multi-turn appointment booking — cleared after confirm or cancel */
  nextBookingFlow?: BookingFlowState | null;
};

export type ClientGeoPayload = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export type VoiceAgentConfig = {
  role: UserRole | 'admin';
  preferredLanguage?: string; // passthrough to /api/ai-chat
  /** Browser GPS passed through to /api/ai-chat for localized NLP context */
  clientLocation?: ClientGeoPayload | null;
  stt: {
    config: Omit<SttConfig, 'signal'>;
    /**
     * When doing "near real-time", we repeatedly transcribe the last window.
     * Keep this small for speed (seconds).
     */
    partialWindowMs?: number;
  };
  tts: {
    enabled: boolean;
    configPrimary?: Omit<TtsConfig, 'signal'>; // elevenlabs/coqui/browser
    configFallbackBrowser?: Omit<TtsConfig, 'signal'>; // should be provider: 'browser'
  };
  /**
   * Use your existing LLM route. Must return { success, data: { content } }.
   */
  llmEndpoint?: string; // default: /api/ai-chat
  /**
   * Next.js router for navigation from voice agent actions.
   */
  router?: { push: (path: string) => void };
  /**
   * Optional navigation callback for action results (legacy).
   */
  onNavigate?: (path: string) => void;
};

export type VoiceAgentSession = {
  status: VoiceAgentStatus;
  partialTranscript: string;
  finalTranscript: string;
  lastAssistantText: string;
  lastIntent?: VoiceAgentIntent;
  error?: string;
};

const EMERGENCY = [
  'chest pain',
  'heart attack',
  "can't breathe",
  'can not breathe',
  'breathing problem',
  'unconscious',
  'collapsed',
  'stroke',
  'seizure',
  'heavy bleeding',
  'bleeding',
  'suicide',
  'kill myself',
  'self harm',
  'overdose',
  'ambulance',
  'emergency',
  'urgent',
  '108',
  '911',
];

const APPOINTMENT = ['appointment', 'book', 'schedule', 'visit', 'consult', 'token', 'slot', 'time', 'date'];
const MEDICINE = ['medicine', 'medication', 'tablet', 'pill', 'dose', 'dosage', 'prescription', 'side effect'];
const STUDENT = ['explain', 'teach', 'learn', 'study', 'anatomy', 'physiology', 'pharmacology', 'pathology'];

export function detectIntent(text: string, role: VoiceAgentConfig['role']): VoiceAgentIntent {
  const lower = text.toLowerCase();
  if (EMERGENCY.some((k) => lower.includes(k))) return { type: 'emergency', confidence: 0.95 };
  if (APPOINTMENT.some((k) => lower.includes(k))) return { type: 'appointment', confidence: 0.78 };
  if (MEDICINE.some((k) => lower.includes(k))) return { type: 'medicine', confidence: 0.72 };
  if (role === 'student' || role === 'professor') {
    if (STUDENT.some((k) => lower.includes(k))) return { type: 'student_query', confidence: 0.7 };
  }
  if (role === 'admin' && (lower.includes('reset') || lower.includes('clear') || lower.includes('disable'))) {
    return { type: 'general', confidence: 0.6, extracted: { adminHint: true } };
  }
  return { type: 'general', confidence: 0.5 };
}

async function llmReply(opts: {
  endpoint: string;
  message: string;
  role: string;
  preferredLanguage?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  signal?: AbortSignal;
  location?: ClientGeoPayload | null;
  /** Mic path: short action-style answers from /api/ai-chat */
  voiceMode?: boolean;
}): Promise<string> {
  const res = await fetch(opts.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: opts.message,
      userRole: opts.role,
      history: opts.history || [],
      preferredLanguage: opts.preferredLanguage || 'en',
      voiceMode: opts.voiceMode === true,
      ...(opts.location
        ? {
            location: {
              latitude: opts.location.latitude,
              longitude: opts.location.longitude,
              ...(opts.location.accuracy != null ? { accuracy: opts.location.accuracy } : {}),
            },
          }
        : {}),
    }),
    signal: opts.signal,
  });
  const json = (await res.json().catch(() => ({}))) as any;
  const text = String(json?.data?.content || json?.data?.message || '').trim();
  return text || "I'm here. What would you like to do next?";
}

export async function handleEmergency(message: string): Promise<VoiceAgentActionResult> {
  const res = await fetch('/api/emergency', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'activate', patientCondition: 'default' }),
  }).then((r) => r.json().catch(() => null));

  const assistantText =
    `Emergency detected.\n\n` +
    `Call 108 now if this is real.\n\n` +
    `I activated emergency mode (simulation). ` +
    `Do you want first-aid steps for chest pain, breathing, bleeding, or unconsciousness?`;

  return {
    intent: { type: 'emergency', confidence: 0.95 },
    assistantText,
    action: { type: 'navigate', path: '/dashboard/emergency' },
    raw: res,
  };
}

export async function handleMedicine(message: string): Promise<VoiceAgentActionResult> {
  const q = encodeURIComponent(message.slice(0, 200));
  const res = await fetch(`/api/medicine?q=${q}&rich=1`).then((r) => r.json().catch(() => null));

  const medicines = Array.isArray(res?.data?.medicines) ? res.data.medicines.slice(0, 2) : [];
  const disclaimer = 'That’s general information only — your doctor or pharmacist should confirm what’s right for you.';

  let assistantText: string;
  if (medicines.length === 0) {
    assistantText =
      `I didn’t catch a clear match. Try the medicine name or your main symptom again. ${disclaimer}`;
  } else {
    const bits = medicines.map(
      (m: { name?: string; genericName?: string; usage?: string; dosage?: string }) => {
        const label = m.name ?? 'Medicine';
        const gen = m.genericName ? ` (${m.genericName})` : '';
        const use = (m.usage || '').trim() || 'common uses per our catalog';
        const dose = (m.dosage || '').trim();
        return dose
          ? `${label}${gen} is often used for ${use}. Typical dosing on the label: ${dose}.`
          : `${label}${gen} is often used for ${use}.`;
      }
    );
    assistantText = `${bits.join(' Next: ')} ${disclaimer}`;
  }

  return {
    intent: { type: 'medicine', confidence: 0.72 },
    assistantText,
    action: { type: 'navigate', path: '/dashboard/medicine' },
    raw: res,
  };
}

export async function handleStudentQuery(message: string): Promise<VoiceAgentActionResult> {
  // Store query (simulated DB/API action)
  const payload = {
    studentName: 'Voice Student',
    subject: 'General',
    question: message,
    date: new Date().toISOString().slice(0, 10),
  };
  const res = await fetch('/api/queries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((r) => r.json().catch(() => null));

  const assistantText = `Saved your question. I can explain it now, step by step. What level: beginner, exam-focused, or deep?`;

  return {
    intent: { type: 'student_query', confidence: 0.7 },
    assistantText,
    action: { type: 'simulated_api', name: 'student_query_saved', data: res },
    raw: res,
  };
}

export class VoiceAgent {
  private cfg: VoiceAgentConfig;
  private ttsHandle: TtsSpeakHandle | null = null;
  private llmAbort: AbortController | null = null;
  private sttAbort: AbortController | null = null;
  private ttsAbort: AbortController | null = null;

  constructor(config: VoiceAgentConfig) {
    this.cfg = config;
  }

  stopSpeaking() {
    this.ttsAbort?.abort();
    this.ttsAbort = null;
    this.ttsHandle?.stop();
    this.ttsHandle = null;
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  }

  interruptAll() {
    this.stopSpeaking();
    this.llmAbort?.abort();
    this.llmAbort = null;
    this.sttAbort?.abort();
    this.sttAbort = null;
  }

  async sttTranscribe(blob: Blob, opts?: { language?: string; prompt?: string }): Promise<string> {
    this.sttAbort?.abort();
    this.sttAbort = new AbortController();
    const res = await transcribeAudio(blob, {
      ...this.cfg.stt.config,
      language: opts?.language ?? this.cfg.stt.config.language,
      prompt: opts?.prompt ?? this.cfg.stt.config.prompt,
      signal: this.sttAbort.signal,
    });
    return res.text;
  }

  async runTurn(params: {
    userText: string;
    history: Array<{ role: 'user' | 'assistant'; content: string }>;
    bookingFlow?: BookingFlowState | null;
    /** Session / profile name for appointments */
    patientName?: string;
    /** true when speaking through the mic — server returns short, action-first replies */
    voiceMode?: boolean;
  }): Promise<VoiceAgentActionResult> {
    const intent = detectIntent(params.userText, this.cfg.role);

    if (intent.type === 'emergency') {
      return { ...await handleEmergency(params.userText), nextBookingFlow: null };
    }

    const booking = await advanceVoiceBooking({
      userText: params.userText,
      history: params.history,
      priorState: params.bookingFlow ?? null,
      patientName: params.patientName,
    });

    if (booking.handled) {
      return {
        intent: { type: 'appointment', confidence: 0.88 },
        assistantText: booking.assistantText,
        action: booking.navigatePath
          ? { type: 'navigate', path: booking.navigatePath }
          : undefined,
        raw: booking.raw,
        nextBookingFlow: booking.nextState ?? null,
      };
    }

    if (intent.type === 'medicine') {
      const r = await handleMedicine(params.userText);
      return { ...r, nextBookingFlow: params.bookingFlow ?? null };
    }
    if (intent.type === 'student_query') {
      const r = await handleStudentQuery(params.userText);
      return { ...r, nextBookingFlow: params.bookingFlow ?? null };
    }

    this.llmAbort?.abort();
    this.llmAbort = new AbortController();
    const assistantText = await llmReply({
      endpoint: this.cfg.llmEndpoint || '/api/ai-chat',
      message: params.userText,
      role: String(this.cfg.role),
      preferredLanguage: this.cfg.preferredLanguage,
      history: params.history,
      signal: this.llmAbort.signal,
      location: this.cfg.clientLocation ?? null,
      voiceMode: params.voiceMode === true,
    });

    return { intent, assistantText, nextBookingFlow: params.bookingFlow ?? null };
  }

  async speak(text: string): Promise<void> {
    if (!this.cfg.tts.enabled) return;
    this.stopSpeaking();
    this.ttsAbort?.abort();
    this.ttsAbort = new AbortController();

    const primary = this.cfg.tts.configPrimary;
    const fallback = this.cfg.tts.configFallbackBrowser;

    try {
      if (!primary) throw new Error('No primary TTS configured');
      this.ttsHandle = await speakText(text, { ...primary, signal: this.ttsAbort.signal } as TtsConfig);
      await this.ttsHandle.finished;
      return;
    } catch {
      if (fallback) {
        this.ttsHandle = await speakText(text, { ...fallback, signal: this.ttsAbort.signal } as TtsConfig);
        await this.ttsHandle.finished;
      }
    } finally {
      this.ttsHandle = null;
    }
  }

  maybeNavigate(result: VoiceAgentActionResult) {
    if (result.action?.type === 'navigate') {
      if (this.cfg.router) {
        this.cfg.router.push(result.action.path);
      } else if (this.cfg.onNavigate) {
        this.cfg.onNavigate(result.action.path);
      }
    }
  }
}

