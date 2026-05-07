import { NextRequest, NextResponse } from 'next/server';
import UnifiedDB from '@/lib/unified-db';

/**
 * POST /api/payments/create
 * Create a payment in PostgreSQL
 */
export async function POST(request: NextRequest) {
  try {
    const { amount, method, notes } = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!amount || !method) {
      return NextResponse.json(
        { error: 'Amount and payment method are required' },
        { status: 400 }
      );
    }

    const validMethods = ['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH'];
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }

    const payment = await UnifiedDB.createPayment({
      userId,
      amount: parseFloat(amount),
      method,
      notes,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Payment created successfully',
        data: payment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments?userId=xxxxx
 * Get payment history for a user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payments = await UnifiedDB.getPaymentsByUser(userId);

    return NextResponse.json(
      {
        success: true,
        data: payments,
        count: payments.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
