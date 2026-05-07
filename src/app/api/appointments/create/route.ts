import { NextRequest, NextResponse } from 'next/server';
import UnifiedDB from '@/lib/unified-db';

/**
 * POST /api/appointments/create
 * Create a new appointment using PostgreSQL
 */
export async function POST(request: NextRequest) {
  try {
    const { doctorId, departmentId, date, time, reason } = await request.json();

    // Get user ID from auth header (implement your auth middleware)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const appointment = await UnifiedDB.createAppointment({
      userId,
      doctorId,
      departmentId,
      date: new Date(date),
      time,
      reason,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment created successfully',
        data: appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Appointment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/appointments?userId=xxxxx
 * Get appointments for a user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const appointments = await UnifiedDB.getAppointmentsByUser(userId);

    return NextResponse.json(
      {
        success: true,
        data: appointments,
        count: appointments.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
