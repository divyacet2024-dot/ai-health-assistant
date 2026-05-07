export type SttProvider = 'groq' | 'openai' | 'custom';

export type SttResult = {
  text: string;
  confidence?: number;
  language?: string;
  provider: SttProvider;
  ms?: number;
};

export type WhisperCompatConfig = {
  /**
   * Example:
   * - OpenAI: https://api.openai.com/v1/audio/transcriptions
   * - Groq:   https://api.groq.com/openai/v1/audio/transcriptions
   */
  endpoint: string;
  apiKey: string;
  model?: string; // default: whisper-1
};

export type SttConfig = {
  /**
   * IMPORTANT: This runs in the browser (hackathon mode).
   * Keys must be NEXT_PUBLIC_* if you use env.
   */
  whisper?: WhisperCompatConfig;
  /**
   * Custom proxy endpoint returning { text }.
   * If set, this is used first.
   */
  proxyEndpoint?: string;
  /**
   * Whisper "language" hint, e.g. "en", "hi", "te"
   */
  language?: string;
  /**
   * Optional prompt to bias transcription.
   */
  prompt?: string;
  /**
   * Abort signal for cancellation.
   */
  signal?: AbortSignal;
};

function nowMs() {
  if (typeof performance !== 'undefined' && performance.now) return performance.now();
  return Date.now();
}

function guessMimeFromBlob(blob: Blob): string {
  return blob.type || 'audio/webm';
}

export async function transcribeAudio(blob: Blob, config: SttConfig): Promise<SttResult> {
  const started = nowMs();

  if (config.proxyEndpoint) {
    const form = new FormData();
    form.append('file', blob, `audio.${guessMimeFromBlob(blob).includes('webm') ? 'webm' : 'wav'}`);
    if (config.language) form.append('language', config.language);
    if (config.prompt) form.append('prompt', config.prompt);
    const res = await fetch(config.proxyEndpoint, {
      method: 'POST',
      body: form,
      signal: config.signal,
    });
    if (!res.ok) throw new Error(`STT proxy failed: ${res.status}`);
    const json = (await res.json()) as any;
    const text = String(json?.text || json?.data?.text || json?.transcript || '').trim();
    return { text, provider: 'custom', ms: Math.round(nowMs() - started) };
  }

  if (!config.whisper?.endpoint || !config.whisper?.apiKey) {
    throw new Error('STT not configured (missing whisper endpoint/apiKey)');
  }

  const provider: SttProvider = config.whisper.endpoint.includes('groq.com') ? 'groq' : 'openai';
  const form = new FormData();
  form.append('file', blob, `audio.${guessMimeFromBlob(blob).includes('webm') ? 'webm' : 'wav'}`);
  form.append('model', config.whisper.model || 'whisper-1');
  if (config.language) form.append('language', config.language);
  if (config.prompt) form.append('prompt', config.prompt);
  // request JSON for compatible endpoints
  form.append('response_format', 'json');

  const res = await fetch(config.whisper.endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.whisper.apiKey}`,
    },
    body: form,
    signal: config.signal,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Whisper STT failed: ${res.status} ${body}`);
  }

  const json = (await res.json()) as any;
  const text = String(json?.text || '').trim();
  const language = typeof json?.language === 'string' ? json.language : undefined;
  return { text, language, provider, ms: Math.round(nowMs() - started) };
}

