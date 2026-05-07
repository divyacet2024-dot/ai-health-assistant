import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, isGeminiConfigured } from '@/lib/gemini-api-enhanced';

/**
 * POST /api/voice/process
 * Process voice input through Gemini API with retry logic
 */
export async function POST(request: NextRequest) {
  try {
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: 'Gemini API not configured' },
        { status: 500 }
      );
    }

    const { message, context, role } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get Gemini client
    const client = getGeminiClient({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
      model: 'gemini-pro',
      temperature: 0.7,
      maxOutputTokens: 1024,
    });

    // Process message
    const response = await client.sendMessage(message, context);

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: 503 } // Service unavailable - retryable
      );
    }

    return NextResponse.json(
      {
        text: response.text,
        finishReason: response.finishReason,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Voice processing error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process voice input',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
