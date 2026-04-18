import { NextResponse } from 'next/server';
import { LAB_REPORTS } from '@/lib/mock-data';

// GET lab reports (uses in-memory mock data — expandable to MongoDB)
export async function GET() {
  return NextResponse.json({ success: true, data: LAB_REPORTS });
}
