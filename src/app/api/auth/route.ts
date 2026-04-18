import { NextRequest, NextResponse } from 'next/server';

// Auth API routes - these work with localStorage on the client side
// In production, these would connect to MongoDB for user persistence

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'register':
        // In production: save to MongoDB
        return NextResponse.json({ success: true, message: 'Registration handled client-side with localStorage. Connect MongoDB for production persistence.' });

      case 'login':
        // In production: verify against MongoDB
        return NextResponse.json({ success: true, message: 'Login handled client-side with localStorage. Connect MongoDB for production persistence.' });

      case 'logout':
        return NextResponse.json({ success: true, message: 'Logged out.' });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 200 });
  }
}

// GET: Check auth status
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Auth is handled client-side. In production, implement JWT/session verification here.',
    endpoints: {
      'POST /api/auth': {
        actions: ['register', 'login', 'logout'],
        note: 'Currently using localStorage. Connect MongoDB for persistence.',
      },
    },
  });
}
