export type TtsProvider = 'elevenlabs' | 'coqui' | 'browser';

export type TtsConfig = {
  provider: TtsProvider;
  signal?: AbortSignal;

  // ElevenLabs (browser direct; hackathon mode)
  elevenlabs?: {
    apiKey: string;
    voiceId: string;
    modelId?: string; // default: eleven_multilingual_v2
    endpointBase?: string; // default: https://api.elevenlabs.io/v1
  };

  // Coqui (self-host / proxy endpoint returning audio bytes)
  coqui?: {
    /**
     * POST { text, voice?, language? } → audio bytes (audio/wav or audio/mpeg)
     */
    endpoint: string;
    voice?: string;
    language?: string;
  };

  // Browser fallback
  browser?: {
    lang?: string; // BCP47
    rate?: number;
    pitch?: number;
    volume?: number;
    voiceNameIncludes?: string;
  };
};

export type TtsSpeakHandle = {
  stop: () => void;
  finished: Promise<void>;
};

function createAudioPlayerFromBlob(blob: Blob): TtsSpeakHandle {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.preload = 'auto';

  const finished = new Promise<void>((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('Audio playback failed'));
  }).finally(() => {
    URL.revokeObjectURL(url);
  });

  void audio.play();
  return {
    stop: () => {
      audio.pause();
      audio.currentTime = 0;
      URL.revokeObjectURL(url);
    },
    finished,
  };
}

function browserSpeak(text: string, cfg: NonNullable<TtsConfig['browser']> | undefined): TtsSpeakHandle {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  if (!synth) {
    return { stop: () => {}, finished: Promise.resolve() };
  }

  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (cfg?.lang) u.lang = cfg.lang;
  if (typeof cfg?.rate === 'number') u.rate = cfg.rate;
  if (typeof cfg?.pitch === 'number') u.pitch = cfg.pitch;
  if (typeof cfg?.volume === 'number') u.volume = cfg.volume;

  if (cfg?.voiceNameIncludes) {
    const pick = synth
      .getVoices()
      .find((v) => v.name.toLowerCase().includes(cfg.voiceNameIncludes!.toLowerCase()));
    if (pick) u.voice = pick;
  }

  const finished = new Promise<void>((resolve, reject) => {
    u.onend = () => resolve();
    u.onerror = () => reject(new Error('speechSynthesis error'));
  });

  synth.speak(u);
  return {
    stop: () => synth.cancel(),
    finished,
  };
}

export async function speakText(text: string, config: TtsConfig): Promise<TtsSpeakHandle> {
  const trimmed = text.trim();
  if (!trimmed) return { stop: () => {}, finished: Promise.resolve() };

  if (config.provider === 'elevenlabs') {
    const e = config.elevenlabs;
    if (!e?.apiKey || !e.voiceId) throw new Error('ElevenLabs not configured');
    const base = e.endpointBase || 'https://api.elevenlabs.io/v1';

    const res = await fetch(`${base}/text-to-speech/${encodeURIComponent(e.voiceId)}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': e.apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: trimmed,
        model_id: e.modelId || 'eleven_multilingual_v2',
        voice_settings: { stability: 0.45, similarity_boost: 0.85, style: 0.15, use_speaker_boost: true },
      }),
      signal: config.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`ElevenLabs TTS failed: ${res.status} ${body}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    return createAudioPlayerFromBlob(new Blob([arrayBuffer], { type: 'audio/mpeg' }));
  }

  if (config.provider === 'coqui') {
    const c = config.coqui;
    if (!c?.endpoint) throw new Error('Coqui not configured');
    const res = await fetch(c.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: trimmed, voice: c.voice, language: c.language }),
      signal: config.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Coqui TTS failed: ${res.status} ${body}`);
    }
    const contentType = res.headers.get('content-type') || 'audio/wav';
    const arrayBuffer = await res.arrayBuffer();
    return createAudioPlayerFromBlob(new Blob([arrayBuffer], { type: contentType }));
  }

  return browserSpeak(trimmed, config.browser);
}

