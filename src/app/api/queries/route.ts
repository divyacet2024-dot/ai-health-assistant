import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/models';

export async function GET() {
  try {
    const col = await getCollection(COLLECTIONS.studentQueries);
    const queries = await col.find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: queries });
  } catch {
    return NextResponse.json({ success: false, error: 'Database not available', data: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const col = await getCollection(COLLECTIONS.studentQueries);
    const body = await req.json();
    const doc = { ...body, status: 'pending', createdAt: new Date() };
    const result = await col.insertOne(doc);
    return NextResponse.json({ success: true, data: { ...doc, _id: result.insertedId } });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create query' }, { status: 200 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const col = await getCollection(COLLECTIONS.studentQueries);
    const body = await req.json();
    const { id, answer } = body;
    const { ObjectId } = await import('mongodb');
    await col.updateOne({ _id: new ObjectId(id) }, { $set: { answer, status: 'answered' } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to answer query' }, { status: 200 });
  }
}
