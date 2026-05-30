import { prisma } from '@/lib/db/client';
import { DeletionRequest } from '@prisma/client';
import { generateSecureToken } from '@/lib/compliance/encryption';
import { createActivityLog } from '@/lib/db/activityLog';

export interface CreateDeletionRequestInput {
  email: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface DeletionRequestResponse {
  id: string;
  email: string;
  confirmationToken: string;
  tokenExpiresAt: Date;
  status: string;
  createdAt: Date;
}

/**
 * Create a new deletion request (GDPR Art. 17 - Right to be Forgotten)
 * Generates confirmation token valid for 48 hours
 */
export async function createDeletionRequest(
  input: CreateDeletionRequestInput
): Promise<DeletionRequestResponse> {
  try {
    // Check if deletion request already exists for this email
    const existing = await prisma.deletionRequest.findUnique({
      where: { email: input.email },
    });

    if (existing && existing.status === 'pending') {
      throw new Error('A deletion request already exists for this email');
    }

    // Generate confirmation token (valid 48 hours)
    const confirmationToken = generateSecureToken(32);
    const tokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const request = await prisma.deletionRequest.create({
      data: {
        email: input.email,
        confirmationToken,
        tokenExpiresAt,
        status: 'pending',
      },
    });

    // Log audit trail for GDPR compliance
    await createActivityLog({
      userId: 'system',
      activityType: 'request_account_deletion',
      resource: 'deletion_request',
      resourceId: request.id,
      details: { email: request.email },
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    console.log(`✓ Deletion request created for ${input.email}, expires: ${tokenExpiresAt}`);

    return {
      id: request.id,
      email: request.email,
      confirmationToken: request.confirmationToken || '',
      tokenExpiresAt: request.tokenExpiresAt || new Date(),
      status: request.status,
      createdAt: request.createdAt,
    };
  } catch (error) {
    console.error('Failed to create deletion request:', error);
    throw error;
  }
}

/**
 * Verify deletion token and confirm the deletion request
 */
export async function confirmDeletionRequest(token: string): Promise<DeletionRequest | null> {
  try {
    // Find request by token
    const request = await prisma.deletionRequest.findUnique({
      where: { confirmationToken: token },
    });

    if (!request) {
      throw new Error('Invalid deletion token');
    }

    // Check if token is expired
    if (request.tokenExpiresAt && new Date() > request.tokenExpiresAt) {
      throw new Error('Deletion token has expired');
    }

    // Check if already confirmed
    if (request.confirmed) {
      throw new Error('This deletion request is already confirmed');
    }

    // Mark as confirmed
    const confirmed = await prisma.deletionRequest.update({
      where: { id: request.id },
      data: {
        confirmed: true,
        confirmedAt: new Date(),
        status: 'confirmed',
      },
    });

    // Log audit trail for GDPR compliance
    await createActivityLog({
      userId: 'system',
      activityType: 'confirm_account_deletion',
      resource: 'deletion_request',
      resourceId: confirmed.id,
      details: { email: confirmed.email, confirmedAt: confirmed.confirmedAt },
    });

    console.log(`✓ Deletion confirmed for ${confirmed.email}`);
    return confirmed;
  } catch (error) {
    console.error('Failed to confirm deletion request:', error);
    throw error;
  }
}

/**
 * Mark deletion as completed (after user data is actually deleted)
 */
export async function completeDeletion(requestId: string): Promise<DeletionRequest | null> {
  try {
    // Fetch the request first to validate state
    const request = await prisma.deletionRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Deletion request not found');
    }

    // Validate state: must be confirmed before completion
    if (request.status !== 'confirmed') {
      throw new Error('Deletion must be confirmed before completion');
    }

    const completed = await prisma.deletionRequest.update({
      where: { id: requestId },
      data: {
        status: 'completed',
        deletedAt: new Date(),
      },
    });

    // Log audit trail for GDPR compliance
    await createActivityLog({
      userId: 'system',
      activityType: 'complete_account_deletion',
      resource: 'deletion_request',
      resourceId: completed.id,
      details: { email: completed.email, deletedAt: completed.deletedAt },
    });

    console.log(`✓ Deletion completed for ${completed.email}`);
    return completed;
  } catch (error) {
    console.error('Failed to complete deletion:', error);
    throw error;
  }
}

/**
 * Get deletion request by ID
 */
export async function getDeletionRequest(requestId: string): Promise<DeletionRequest | null> {
  try {
    const request = await prisma.deletionRequest.findUnique({
      where: { id: requestId },
    });

    return request;
  } catch (error) {
    console.error('Failed to fetch deletion request:', error);
    throw error;
  }
}

/**
 * Get deletion request by email
 */
export async function getDeletionRequestByEmail(email: string): Promise<DeletionRequest | null> {
  try {
    const request = await prisma.deletionRequest.findUnique({
      where: { email },
    });

    return request;
  } catch (error) {
    console.error('Failed to fetch deletion request by email:', error);
    throw error;
  }
}

/**
 * Get pending deletion requests (for admin review)
 */
export async function getPendingDeletionRequests(
  limit: number = 100,
  offset: number = 0
): Promise<{ data: DeletionRequest[]; total: number; hasMore: boolean }> {
  try {
    const [data, total] = await Promise.all([
      prisma.deletionRequest.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.deletionRequest.count({
        where: { status: 'pending' },
      }),
    ]);

    return {
      data,
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    console.error('Failed to fetch pending deletion requests:', error);
    throw error;
  }
}

/**
 * Cancel a deletion request (user changed mind)
 */
export async function cancelDeletionRequest(requestId: string): Promise<DeletionRequest | null> {
  try {
    const request = await prisma.deletionRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Deletion request not found');
    }

    if (request.status !== 'pending' && request.status !== 'confirmed') {
      throw new Error('Cannot cancel a completed deletion request');
    }

    const cancelled = await prisma.deletionRequest.update({
      where: { id: requestId },
      data: {
        status: 'cancelled',
      },
    });

    // Log audit trail for GDPR compliance
    await createActivityLog({
      userId: 'system',
      activityType: 'cancel_account_deletion',
      resource: 'deletion_request',
      resourceId: cancelled.id,
      details: { email: cancelled.email },
    });

    console.log(`✓ Deletion cancelled for ${cancelled.email}`);
    return cancelled;
  } catch (error) {
    console.error('Failed to cancel deletion request:', error);
    throw error;
  }
}

/**
 * Clean up expired deletion requests (older than 30 days)
 * Ensures requests outside both the retention window AND confirmation window are removed
 */
export async function cleanupExpiredDeletionRequests(): Promise<number> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await prisma.deletionRequest.deleteMany({
      where: {
        AND: [
          { status: 'pending' },
          { createdAt: { lt: thirtyDaysAgo } },
          { tokenExpiresAt: { lt: new Date() } }, // Ensure token has expired (no 48h window)
        ],
      },
    });

    console.log(`✓ Cleaned up ${result.count} expired deletion requests`);
    return result.count;
  } catch (error) {
    console.error('Failed to cleanup expired deletion requests:', error);
    throw error;
  }
}
