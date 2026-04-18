import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/models';

export async function GET() {
  try {
    const col = await getCollection(COLLECTIONS.payments);
    const payments = await col.find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: payments });
  } catch {
    return NextResponse.json({ success: false, error: 'Database not available', data: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const col = await getCollection(COLLECTIONS.payments);
    const counterCol = await getCollection(COLLECTIONS.tokenCounters);
    const body = await req.json();

    const counter = await counterCol.findOneAndUpdate(
      { name: 'payment_token' },
      { $inc: { value: 1 } },
      { upsert: true, returnDocument: 'after' }
    );

    const tokenNumber = counter?.value ?? 1;
    const doc = { ...body, tokenNumber, status: 'paid', createdAt: new Date() };
    const result = await col.insertOne(doc);

    return NextResponse.json({ success: true, data: { ...doc, _id: result.insertedId } });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to process payment' }, { status: 200 });
  }
}
