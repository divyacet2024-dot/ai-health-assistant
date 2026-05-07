import { NextRequest, NextResponse } from 'next/server';
import UnifiedDB from '@/lib/unified-db';

/**
 * GET /api/chat/history?userId=xxxxx&limit=50
 * Get chat history from MongoDB
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const limit = request.nextUrl.searchParams.get('limit') || '50';

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const chatHistory = await UnifiedDB.getChatHistory(userId, parseInt(limit));

    return NextResponse.json(
      {
        success: true,
        data: chatHistory,
        count: chatHistory.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/history
 * Save a chat message to MongoDB
 */
export async function POST(request: NextRequest) {
  try {
    const { message, role, conversationId } = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!message || !role) {
      return NextResponse.json(
        { error: 'Message and role are required' },
        { status: 400 }
      );
    }

    const result = await UnifiedDB.saveChatHistory({
      userId,
      message,
      role,
      conversationId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Chat message saved',
        id: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving chat message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}
