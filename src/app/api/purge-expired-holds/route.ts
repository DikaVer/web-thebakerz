/**
 * @fileoverview API route handling POST and GET /api/purge-expired-holds.
 *
 * POST purges expired rescue-deal inventory holds and cancels their associated Stripe
 * payment intents; it is intended for scheduled (cron) invocation and requires a bearer
 * token matching NEXT_PRIVATE_SECRET_BEARER. GET is a simple health check that confirms
 * the endpoint is active.
 */
import { NextRequest, NextResponse } from 'next/server';
import { purgeExpiredHolds } from '@/lib/utils/helper/inventory-holds';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from an authorized source (e.g., cron job)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await purgeExpiredHolds();
    
    return NextResponse.json(
      { 
        success: result.success, 
        deletedCount: result.deletedCount,
        cancelledPayments: result.cancelledPayments,
        message: `Successfully purged ${result.deletedCount} expired holds and cancelled ${result.cancelledPayments} payment intents`
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('purge-expired-holds', 'Error in purge endpoint:', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json(
    { message: 'Purge expired holds endpoint is active' },
    { status: 200 }
  );
} 