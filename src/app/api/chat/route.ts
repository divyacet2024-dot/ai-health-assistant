import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/models';

export async function GET(req: NextRequest) {
  try {
    const col = await getCollection(COLLECTIONS.chatMessages);
    const { searchParams } = new URL(req.url);
    const userRole = searchParams.get('userRole') || 'patient';
    const sessionId = searchParams.get('sessionId') || 'default';

    const messages = await col.find({ userRole, sessionId }).sort({ timestamp: 1 }).toArray();
    return NextResponse.json({ success: true, data: messages });
  } catch {
    return NextResponse.json({ success: false, error: 'Database not available', data: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const col = await getCollection(COLLECTIONS.chatMessages);
    const body = await req.json();
    const doc = { ...body, timestamp: new Date() };
    const result = await col.insertOne(doc);
    return NextResponse.json({ success: true, data: { ...doc, _id: result.insertedId } });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to save message' }, { status: 200 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const col = await getCollection(COLLECTIONS.chatMessages);
    const { searchParams } = new URL(req.url);
    const userRole = searchParams.get('userRole') || 'patient';
    const sessionId = searchParams.get('sessionId') || 'default';

    await col.deleteMany({ userRole, sessionId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to clear chat' }, { status: 200 });
  }
}
