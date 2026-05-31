import { NextRequest, NextResponse } from 'next/server';
import { createActivityLog } from '@/lib/db/activityLog';

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
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    // Parse and validate pagination parameters
    let limit = 100;
    let offset = 0;

    const limitParam = request.nextUrl.searchParams.get('limit');
    const offsetParam = request.nextUrl.searchParams.get('offset');

    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 500) {
        return NextResponse.json(
          { error: 'limit debe ser un número entre 1 y 500' },
          { status: 400 }
        );
      }
      limit = parsedLimit;
    }

    if (offsetParam) {
      const parsedOffset = parseInt(offsetParam, 10);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return NextResponse.json(
          { error: 'offset debe ser un número no negativo' },
          { status: 400 }
        );
      }
      offset = parsedOffset;
    }

    // Import at runtime to avoid build-time database init
    const { getUserActivityLogs } = await import('@/lib/db/activityLog');

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
      { error: 'Error al obtener actividades' },
      { status: 500 }
    );
  }
}
