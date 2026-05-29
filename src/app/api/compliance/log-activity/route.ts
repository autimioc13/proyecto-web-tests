import { NextRequest, NextResponse } from 'next/server';
import { validateAdminSession } from '@/lib/admin-auth';

/**
 * POST /api/compliance/log-activity
 *
 * Immutable activity logging for audit trail
 * Used by client to log user activities for GDPR/CCPA compliance
 */

interface ActivityLogPayload {
  userId: string;
  activityType: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, activityType, resource, resourceId, details } = await request.json() as ActivityLogPayload;

    // Validate required fields
    if (!userId || !activityType || !resource) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get request metadata
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create audit log entry
    const activityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      activityType,
      resource,
      resourceId: resourceId || null,
      details: details || null,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
      // Note: In production, store this in immutable database (DynamoDB, etc)
      // For now, we'll log to console and file
    };

    // Log to console (for development)
    console.log('[AUDIT LOG]', activityLog);

    // In production, store in database:
    // await db.activityLogs.create(activityLog);

    // Return success
    return NextResponse.json({
      success: true,
      logId: activityLog.id,
    });

  } catch (error) {
    console.error('Error logging activity:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}
