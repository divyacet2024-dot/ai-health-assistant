import { NextRequest, NextResponse } from 'next/server';
import { doctorBookingTool } from '@/lib/tools';

/** Voice shortcut: same booking logic as /api/ai-chat agent action */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = String(body.message ?? '');
    const patientName = body.patientName != null ? String(body.patientName) : undefined;
    const dateHint = body.dateHint != null ? String(body.dateHint) : undefined;
    const timeHint = body.timeHint != null ? String(body.timeHint) : undefined;
    const department = body.department != null ? String(body.department) : undefined;
    const doctorName = body.doctorName != null ? String(body.doctorName) : undefined;

    const result = await doctorBookingTool({
      userMessage: message,
      patientName,
      dateHint,
      timeHint,
      department,
      doctorName,
    });

    const d = result.data as {
      tokenNumber: number;
      department: string;
      doctorName: string;
      date: string;
      time: string;
      patientName?: string;
      persisted?: boolean;
    };

    const persistNote = d.persisted === false
      ? ' Saved on this device only — clinic system was offline.'
      : '';

    const named = d.patientName ? `${d.patientName}, ` : '';
    const assistantText =
      `${named}you’re booked with ${d.doctorName} in ${d.department}. ` +
      `Your visit is ${d.date} at ${d.time}. Queue token ${d.tokenNumber}.${persistNote}`;

    return NextResponse.json({
      success: result.success,
      data: { ...d, assistantText },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 200 }
    );
  }
}
