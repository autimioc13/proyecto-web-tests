import { prisma } from '@/lib/db/client';
import { ConsentLog } from '@prisma/client';
import { createActivityLog } from '@/lib/db/activityLog';

export interface CreateConsentLogInput {
  userId: string;
  consentType: 'privacy_policy' | 'cookies' | 'marketing' | 'analytics';
  accepted: boolean;
  version: string; // e.g., '1.0', '2.1'
  ipAddress?: string;
  userAgent?: string;
}

export interface ConsentLogsResponse {
  data: ConsentLog[];
  total: number;
  hasMore: boolean;
}

/**
 * Log user consent decision (GDPR Article 7 - Consent)
 */
export async function createConsentLog(
  input: CreateConsentLogInput
): Promise<ConsentLog> {
  try {
    const log = await prisma.consentLog.create({
      data: {
        userId: input.userId,
        consentType: input.consentType,
        accepted: input.accepted,
        version: input.version,
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
        timestamp: new Date(),
      },
    });

    // Add GDPR audit trail
    await createActivityLog({
      userId: input.userId,
      activityType: input.accepted ? 'consent_given' : 'consent_withdrawn',
      resource: 'consent',
      resourceId: log.id,
      details: {
        consentType: input.consentType,
        version: input.version,
        accepted: input.accepted,
      },
    });

    console.log(
      `✓ Consent logged: ${input.consentType} = ${input.accepted} for user ${input.userId}`
    );
    return log;
  } catch (error) {
    console.error('Failed to create consent log:', error);
    throw new Error('Consent logging failed');
  }
}

/**
 * Get all consent logs for a user
 */
export async function getUserConsentLogs(
  userId: string,
  limit: number = 100,
  offset: number = 0
): Promise<ConsentLogsResponse> {
  try {
    const [data, total] = await Promise.all([
      prisma.consentLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.consentLog.count({
        where: { userId },
      }),
    ]);

    return {
      data,
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    console.error('Failed to fetch user consent logs:', error);
    throw new Error('Failed to retrieve consent logs');
  }
}

/**
 * Get latest consent status for each type for a user
 */
export async function getUserLatestConsents(
  userId: string
): Promise<Record<string, ConsentLog | null>> {
  try {
    const logs = await prisma.consentLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });

    const latestByType: Record<string, ConsentLog | null> = {
      privacy_policy: null,
      cookies: null,
      marketing: null,
      analytics: null,
    };

    // Group by type, keep only first (latest) of each
    for (const log of logs) {
      if (!latestByType[log.consentType]) {
        latestByType[log.consentType] = log;
      }
    }

    return latestByType;
  } catch (error) {
    console.error('Failed to fetch latest consent status:', error);
    throw new Error('Failed to retrieve consent status');
  }
}

/**
 * Get consent logs by type for analytics/compliance
 */
export async function getConsentLogsByType(
  consentType: string,
  limit: number = 100,
  offset: number = 0
): Promise<ConsentLogsResponse> {
  try {
    const validTypes = ['privacy_policy', 'cookies', 'marketing', 'analytics'];
    if (!validTypes.includes(consentType)) {
      throw new Error(
        `Invalid consent type: ${consentType}. Must be one of: ${validTypes.join(', ')}`
      );
    }

    const [data, total] = await Promise.all([
      prisma.consentLog.findMany({
        where: { consentType },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.consentLog.count({
        where: { consentType },
      }),
    ]);

    return {
      data,
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    console.error(`Failed to fetch ${consentType} consent logs:`, error);
    throw new Error(`Failed to retrieve ${consentType} consent logs`);
  }
}

/**
 * Get consent statistics for compliance reporting
 */
export async function getConsentStatistics(
  startDate: Date,
  endDate: Date
): Promise<Record<string, { accepted: number; rejected: number; total: number }>> {
  try {
    if (startDate >= endDate) {
      throw new Error('Invalid date range: startDate must be before endDate');
    }
    if ((endDate.getTime() - startDate.getTime()) > 365 * 24 * 60 * 60 * 1000) {
      throw new Error('Date range exceeds 1 year limit for performance');
    }

    const types = ['privacy_policy', 'cookies', 'marketing', 'analytics'];

    const stats: Record<string, { accepted: number; rejected: number; total: number }> = {};

    for (const type of types) {
      const [accepted, rejected] = await Promise.all([
        prisma.consentLog.count({
          where: {
            consentType: type,
            accepted: true,
            timestamp: { gte: startDate, lte: endDate },
          },
        }),
        prisma.consentLog.count({
          where: {
            consentType: type,
            accepted: false,
            timestamp: { gte: startDate, lte: endDate },
          },
        }),
      ]);

      stats[type] = {
        accepted,
        rejected,
        total: accepted + rejected,
      };
    }

    return stats;
  } catch (error) {
    console.error('Failed to generate consent statistics:', error);
    throw new Error('Consent statistics generation failed');
  }
}

/**
 * Check if user has given consent for a specific type
 */
export async function hasUserConsented(
  userId: string,
  consentType: string
): Promise<boolean> {
  try {
    const validTypes = ['privacy_policy', 'cookies', 'marketing', 'analytics'];
    if (!validTypes.includes(consentType)) {
      throw new Error(
        `Invalid consent type: ${consentType}. Must be one of: ${validTypes.join(', ')}`
      );
    }

    const latest = await prisma.consentLog.findFirst({
      where: {
        userId,
        consentType,
      },
      orderBy: { timestamp: 'desc' },
    });

    return latest?.accepted || false;
  } catch (error) {
    console.error(`Failed to check consent status for ${consentType}:`, error);
    throw new Error('Consent check failed');
  }
}

/**
 * Get consent logs with version changes (for policy update tracking)
 * Note: Returns all version change logs, not distinct user-version combinations.
 * For distinct records per user per version, use application-level filtering.
 */
export async function getConsentVersionChanges(
  consentType: string,
  limit: number = 100,
  offset: number = 0
): Promise<ConsentLogsResponse> {
  try {
    const [data, total] = await Promise.all([
      prisma.consentLog.findMany({
        where: { consentType },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.consentLog.count({
        where: { consentType },
      }),
    ]);

    return {
      data,
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    console.error('Failed to fetch consent version changes:', error);
    throw new Error('Failed to retrieve consent version changes');
  }
}

/**
 * Delete consent logs for deleted user (GDPR right to be forgotten)
 */
export async function deleteUserConsentLogs(userId: string): Promise<number> {
  try {
    const result = await prisma.consentLog.deleteMany({
      where: { userId },
    });

    console.log(`✓ Deleted ${result.count} consent logs for user ${userId}`);
    return result.count;
  } catch (error) {
    console.error('Failed to delete user consent logs:', error);
    throw new Error('Consent log deletion failed');
  }
}
