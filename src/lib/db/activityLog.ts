import { prisma } from '@/lib/db/client';
import { ActivityLog } from '@prisma/client';

export interface CreateActivityLogInput {
  userId: string;
  activityType: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  consentLevel?: string;
}

/**
 * Paginated response format for activity log queries
 */
export interface PaginatedActivityLogsResponse {
  data: ActivityLog[];
  total: number;
  hasMore: boolean;
}

/**
 * Create a new activity log entry (audit trail)
 */
export async function createActivityLog(
  input: CreateActivityLogInput
): Promise<{ id: string; timestamp: Date }> {
  try {
    const log = await prisma.activityLog.create({
      data: {
        userId: input.userId,
        activityType: input.activityType,
        resource: input.resource || null,
        resourceId: input.resourceId || null,
        details: input.details || {},
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
        consentLevel: input.consentLevel || null,
        timestamp: new Date(),
      },
      select: {
        id: true,
        timestamp: true,
      },
    });

    console.log(`✓ Activity logged: ${input.activityType} for user ${input.userId}`);
    return log;
  } catch (error) {
    console.error('Failed to create activity log:', error);
    throw new Error('Activity logging failed');
  }
}

/**
 * Get all activity logs for a user with pagination metadata
 */
export async function getUserActivityLogs(
  userId: string,
  limit: number = 100,
  offset: number = 0
): Promise<PaginatedActivityLogsResponse> {
  try {
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.activityLog.count({
        where: { userId },
      }),
    ]);

    const hasMore = offset + limit < total;

    return {
      data: logs,
      total,
      hasMore,
    };
  } catch (error) {
    console.error('Failed to fetch user activity logs:', error);
    throw new Error('Failed to retrieve activity logs');
  }
}

/**
 * Get activity logs by activity type with pagination metadata
 */
export async function getActivityLogsByType(
  activityType: string,
  limit: number = 100,
  offset: number = 0
): Promise<PaginatedActivityLogsResponse> {
  try {
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { activityType },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.activityLog.count({
        where: { activityType },
      }),
    ]);

    const hasMore = offset + limit < total;

    return {
      data: logs,
      total,
      hasMore,
    };
  } catch (error) {
    console.error(`Failed to fetch activity logs for type ${activityType}:`, error);
    throw new Error(`Failed to retrieve ${activityType} logs`);
  }
}

/**
 * Count activities for a user within a date range
 */
export async function countUserActivities(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  try {
    const count = await prisma.activityLog.count({
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return count;
  } catch (error) {
    console.error('Failed to count user activities:', error);
    throw new Error('Activity count failed');
  }
}

/**
 * Get activity logs for compliance report with flexible pagination
 */
export async function getComplianceActivityReport(
  startDate: Date,
  endDate: Date,
  limit: number = 100,
  offset: number = 0
): Promise<PaginatedActivityLogsResponse> {
  try {
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.activityLog.count({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ]);

    const hasMore = offset + limit < total;

    return {
      data: logs,
      total,
      hasMore,
    };
  } catch (error) {
    console.error('Failed to generate compliance report:', error);
    throw new Error('Compliance report generation failed');
  }
}

/**
 * Clear activity logs for deleted user (after account deletion is confirmed)
 * Part of "Right to be Forgotten"
 */
export async function deleteUserActivityLogs(userId: string): Promise<number> {
  try {
    const result = await prisma.activityLog.deleteMany({
      where: { userId },
    });

    console.log(`✓ Deleted ${result.count} activity logs for user ${userId}`);
    return result.count;
  } catch (error) {
    console.error('Failed to delete user activity logs:', error);
    throw new Error('Activity log deletion failed');
  }
}
