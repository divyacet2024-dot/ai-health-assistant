import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/models';

export async function GET() {
  try {
    const col = await getCollection(COLLECTIONS.studyTasks);
    const tasks = await col.find().sort({ createdAt: 1 }).toArray();
    return NextResponse.json({ success: true, data: tasks });
  } catch {
    return NextResponse.json({ success: false, error: 'Database not available', data: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const col = await getCollection(COLLECTIONS.studyTasks);
    const body = await req.json();
    const doc = { ...body, completed: false, createdAt: new Date() };
    const result = await col.insertOne(doc);
    return NextResponse.json({ success: true, data: { ...doc, _id: result.insertedId } });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create task' }, { status: 200 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const col = await getCollection(COLLECTIONS.studyTasks);
    const body = await req.json();
    const { id, completed } = body;
    const { ObjectId } = await import('mongodb');
    await col.updateOne({ _id: new ObjectId(id) }, { $set: { completed } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update task' }, { status: 200 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const col = await getCollection(COLLECTIONS.studyTasks);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id) {
      const { ObjectId } = await import('mongodb');
      await col.deleteOne({ _id: new ObjectId(id) });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete task' }, { status: 200 });
  }
}
