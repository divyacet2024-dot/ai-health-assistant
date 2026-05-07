import { NextRequest, NextResponse } from 'next/server';
import UnifiedDB from '@/lib/unified-db';

/**
 * GET /api/health/check
 * Check the health of all database connections
 */
export async function GET(request: NextRequest) {
  try {
    const health = await UnifiedDB.checkDatabaseHealth();
    const allHealthy = health.firestore && health.postgresql && health.mongodb;

    return NextResponse.json(
      {
        status: allHealthy ? 'healthy' : 'degraded',
        databases: {
          firestore: health.firestore ? '✅ Online' : '❌ Offline',
          postgresql: health.postgresql ? '✅ Online' : '❌ Offline',
          mongodb: health.mongodb ? '✅ Online' : '❌ Offline',
        },
        timestamp: new Date().toISOString(),
      },
      { status: allHealthy ? 200 : 503 }
    );
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
