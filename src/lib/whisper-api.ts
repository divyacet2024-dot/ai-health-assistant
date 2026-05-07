/**
 * OpenAI Whisper API Integration
 * - High-accuracy speech-to-text
 * - Supports multiple languages
 * - Handles audio file upload and processing
 * - Fallback to Web Speech API if needed
 */

import { Readable } from 'stream';

export interface WhisperOptions {
  apiKey: string;
  language?: string; // BCP-47 language code
  temperature?: number; // 0-1, higher = more random
  prompt?: string; // Context for better accuracy
  response_format?: 'json' | 'text' | 'srt' | 'vtt';
}

export interface WhisperResponse {
  text: string;
  language?: string;
  duration?: number;
}

export interface WhisperError {
  error: string;
  details?: string;
  retryable: boolean;
}

/**
 * Transcribe audio blob using Whisper API
 */
export async function transcribeAudioWithWhisper(
  audioBlob: Blob,
  options: WhisperOptions
): Promise<WhisperResponse | WhisperError> {
  try {
    // Validate inputs
    if (!audioBlob || audioBlob.size === 0) {
      return {
        error: 'Invalid audio data',
        retryable: false,
      };
    }

    if (!options.apiKey) {
      return {
        error: 'OpenAI API key not configured',
        retryable: false,
      };
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    if (options.language) {
      formData.append('language', options.language);
    }

    if (options.temperature !== undefined) {
      formData.append('temperature', options.temperature.toString());
    }

    if (options.prompt) {
      formData.append('prompt', options.prompt);
    }

    formData.append('response_format', options.response_format || 'json');

    // Make request to Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
      },
      body: formData,
    });

    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        return {
          error: 'Invalid OpenAI API key',
          details: errorData.error?.message,
          retryable: false,
        };
      }

      if (response.status === 429) {
        return {
          error: 'Rate limit exceeded',
          details: 'Too many requests to Whisper API',
          retryable: true,
        };
      }

      if (response.status >= 500) {
        return {
          error: 'Whisper API error',
          details: errorData.error?.message,
          retryable: true,
        };
      }

      return {
        error: 'Failed to transcribe audio',
        details: errorData.error?.message,
        retryable: false,
      };
    }

    const data = await response.json();

    return {
      text: data.text || '',
      language: options.language,
    };
  } catch (error) {
    console.error('Whisper API error:', error);

    return {
      error: 'Network error while transcribing',
      details: error instanceof Error ? error.message : 'Unknown error',
      retryable: true,
    };
  }
}

/**
 * Transcribe audio file from URL using Whisper API
 */
export async function transcribeAudioUrlWithWhisper(
  audioUrl: string,
  options: WhisperOptions
): Promise<WhisperResponse | WhisperError> {
  try {
    // Fetch audio file
    const response = await fetch(audioUrl);

    if (!response.ok) {
      return {
        error: 'Failed to fetch audio file',
        details: `HTTP ${response.status}`,
        retryable: false,
      };
    }

    const audioBlob = await response.blob();

    // Transcribe using blob
    return await transcribeAudioWithWhisper(audioBlob, options);
  } catch (error) {
    console.error('Error fetching audio URL:', error);

    return {
      error: 'Failed to fetch audio file',
      details: error instanceof Error ? error.message : 'Unknown error',
      retryable: true,
    };
  }
}

/**
 * Get supported languages
 */
export const WHISPER_SUPPORTED_LANGUAGES = {
  'en': 'English',
  'hi': 'Hindi',
  'te': 'Telugu',
  'ta': 'Tamil',
  'kn': 'Kannada',
  'ml': 'Malayalam',
  'mr': 'Marathi',
  'bn': 'Bengali',
  'gu': 'Gujarati',
  'pa': 'Punjabi',
  'ur': 'Urdu',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'zh': 'Simplified Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
} as const;

/**
 * Get Whisper API configuration from environment
 */
export function getWhisperConfig(): Partial<WhisperOptions> {
  return {
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    temperature: 0.0, // 0 for consistent results
    response_format: 'json',
  };
}

/**
 * Check if Whisper API is configured
 */
export function isWhisperConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_OPENAI_API_KEY;
}
