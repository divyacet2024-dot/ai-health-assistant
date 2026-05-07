import { NextRequest, NextResponse } from 'next/server';
import UnifiedDB from '@/lib/unified-db';
import { DailyHealthLog } from '@/lib/health-types';

/**
 * POST /api/health/save-log
 * Save health log to Firestore
 */
export async function POST(request: NextRequest) {
  try {
    const healthLog: DailyHealthLog = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await UnifiedDB.saveHealthLog(healthLog);

    return NextResponse.json(
      {
        success: true,
        message: 'Health log saved successfully',
        date: healthLog.date,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving health log:', error);
    return NextResponse.json(
      { error: 'Failed to save health log' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/health/logs?userId=xxxxx&startDate=2024-01-01&endDate=2024-12-31
 * Get health logs for a date range
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const startDate = request.nextUrl.searchParams.get('startDate');
    const endDate = request.nextUrl.searchParams.get('endDate');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const logs = await UnifiedDB.getHealthLogs(startDate || undefined, endDate || undefined);

    return NextResponse.json(
      {
        success: true,
        data: logs,
        count: logs.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching health logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health logs' },
      { status: 500 }
    );
  }
}
