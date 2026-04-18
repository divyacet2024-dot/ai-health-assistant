import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/models';

// GET all appointments
export async function GET() {
  try {
    const col = await getCollection(COLLECTIONS.appointments);
    const appointments = await col.find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: appointments });
  } catch {
    return NextResponse.json({ success: false, error: 'Database not available', data: [] }, { status: 200 });
  }
}

// POST create new appointment
export async function POST(req: NextRequest) {
  try {
    const col = await getCollection(COLLECTIONS.appointments);
    const counterCol = await getCollection(COLLECTIONS.tokenCounters);
    const body = await req.json();

    const counter = await counterCol.findOneAndUpdate(
      { name: 'appointment_token' },
      { $inc: { value: 1 } },
      { upsert: true, returnDocument: 'after' }
    );

    const tokenNumber = counter?.value ?? 1;
    const doc = { ...body, tokenNumber, status: 'scheduled', createdAt: new Date() };
    const result = await col.insertOne(doc);

    return NextResponse.json({ success: true, data: { ...doc, _id: result.insertedId } });
  } catch {
    return NextResponse.json({ success: false, error: 'Database not available' }, { status: 200 });
  }
}

// PUT update appointment status
export async function PUT(req: NextRequest) {
  try {
    const col = await getCollection(COLLECTIONS.appointments);
    const body = await req.json();
    const { id, status } = body;
    const { ObjectId } = await import('mongodb');

    await col.updateOne({ _id: new ObjectId(id) }, { $set: { status } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Database not available' }, { status: 200 });
  }
}
