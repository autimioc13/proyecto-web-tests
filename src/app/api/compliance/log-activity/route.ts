import { NextRequest, NextResponse } from 'next/server';
import { createActivityLog } from '@/lib/db/activityLog';
import { getUserActivityLogs } from '@/lib/db/activityLog';

/**
 * POST /api/compliance/log-activity
 *
 * Immutable activity logging for audit trail
 * Persists user activities to database for GDPR/CCPA compliance
 */

interface LogActivityRequest {
  userId: string;
  activityType: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  consentLevel?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LogActivityRequest;

    // Validate required fields
    if (!body.userId || !body.activityType) {
      return NextResponse.json(
        { error: 'userId and activityType are required' },
        { status: 400 }
      );
    }

    // Get IP from headers if not provided
    const ipAddress = body.ipAddress ||
                     request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    const userAgent = body.userAgent ||
                     request.headers.get('user-agent') ||
                     'unknown';

    // Create activity log in database
    const activityLog = await createActivityLog({
      userId: body.userId,
      activityType: body.activityType,
      resource: body.resource,
      resourceId: body.resourceId,
      details: body.details || {},
      ipAddress,
      userAgent,
      consentLevel: body.consentLevel,
    });

    return NextResponse.json({
      success: true,
      message: 'Activity logged',
      activityId: activityLog.id,
      timestamp: activityLog.timestamp,
    });

  } catch (error) {
    console.error('Error in log-activity:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compliance/log-activity?userId=...&limit=...&offset=...
 *
 * Retrieve activity logs for a user with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100');
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');

    const activities = await getUserActivityLogs(userId, limit, offset);

    return NextResponse.json({
      success: true,
      data: activities.data,
      total: activities.total,
      hasMore: activities.hasMore,
    });

  } catch (error) {
    console.error('Error fetching activities:', error);

    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
