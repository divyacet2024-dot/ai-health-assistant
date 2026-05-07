import { NextRequest, NextResponse } from 'next/server';
import { isGeminiConfigured } from '@/lib/gemini-api-enhanced';
import { isWhisperConfigured } from '@/lib/whisper-api';

/**
 * GET /api/voice/status
 * Check voice API status
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      status: 'ok',
      apis: {
        webSpeech: 'browser-native',
        whisper: isWhisperConfigured() ? 'configured' : 'not-configured',
        gemini: isGeminiConfigured() ? 'configured' : 'not-configured',
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
