import { NextRequest, NextResponse } from 'next/server';
import { MEDICINES } from '@/lib/mock-data';

// GET search medicines (uses in-memory data — could be moved to MongoDB)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';

  const filtered = query
    ? MEDICINES.filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.genericName.toLowerCase().includes(query.toLowerCase()) ||
          m.category.toLowerCase().includes(query.toLowerCase())
      )
    : MEDICINES;

  return NextResponse.json({ success: true, data: filtered });
}
