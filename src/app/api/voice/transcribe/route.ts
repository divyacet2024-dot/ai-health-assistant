import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudioWithWhisper, getWhisperConfig } from '@/lib/whisper-api';

/**
 * POST /api/voice/transcribe
 * Transcribe audio using Whisper API
 */
export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData();
    const audioBlob = (formData.get('audio') || formData.get('file')) as Blob;
    const language = (formData.get('language') as string) || 'en-IN';

    if (!audioBlob || (audioBlob as Blob).size === 0) {
      return NextResponse.json(
        { error: 'No audio provided' },
        { status: 400 }
      );
    }

    // Get Whisper config
    const whisperConfig = getWhisperConfig();
    if (!whisperConfig.apiKey) {
      return NextResponse.json(
        { error: 'Whisper API not configured' },
        { status: 500 }
      );
    }

    // Transcribe
    const result = await transcribeAudioWithWhisper(audioBlob, {
      ...whisperConfig,
      language,
    } as any);

    if ('error' in result) {
      return NextResponse.json(
        {
          error: result.error,
          details: result.details,
          retryable: result.retryable,
        },
        { status: result.retryable ? 503 : 400 }
      );
    }

    return NextResponse.json(
      {
        text: result.text,
        language: result.language,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      {
        error: 'Failed to transcribe audio',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
