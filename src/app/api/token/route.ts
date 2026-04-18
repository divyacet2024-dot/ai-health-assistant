import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/models';

export async function POST() {
  try {
    const col = await getCollection(COLLECTIONS.tokenCounters);
    const counter = await col.findOneAndUpdate(
      { name: 'global_token' },
      { $inc: { value: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    return NextResponse.json({ success: true, token: counter?.value ?? 1 });
  } catch {
    return NextResponse.json({ success: true, token: Math.floor(Math.random() * 100) + 1 });
  }
}
