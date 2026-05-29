/**
 * Activity Logger
 * Logs all user activities for compliance auditing (GDPR Art. 32)
 * Creates immutable audit trail
 */

export type ActivityType =
  | 'login'
  | 'logout'
  | 'view_test'
  | 'complete_test'
  | 'start_purchase'
  | 'complete_purchase'
  | 'download_ebook'
  | 'view_results'
  | 'share_result'
  | 'update_profile'
  | 'request_data_export'
  | 'request_account_deletion'
  | 'update_preferences'
  | 'consent_given'
  | 'consent_withdrawn'
  | 'security_event'
  | 'admin_action';

export interface ActivityLog {
  id: string;
  userId: string;
  activityType: ActivityType;
  resource: string; // what was accessed (test_slug, page, etc)
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  consentLevel?: string; // what consent they had
  country?: string; // derived from IP
}

/**
 * Log activity client-side (will be sent to server)
 */
export async function logActivity(
  userId: string,
  activityType: ActivityType,
  resource: string,
  details?: Record<string, any>
): Promise<boolean> {
  try {
    // Don't log if no userId (anonymous user)
    if (!userId) return false;

    const response = await fetch('/api/compliance/log-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        activityType,
        resource,
        details,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to log activity:', error);
    return false;
  }
}

/**
 * Log security-related event
 */
export async function logSecurityEvent(
  userId: string,
  eventType: string,
  severity: 'low' | 'medium' | 'high',
  details?: Record<string, any>
): Promise<boolean> {
  return logActivity(
    userId,
    'security_event',
    eventType,
    { severity, ...details }
  );
}

/**
 * Log admin action (DPA Art. 32 - records of processing)
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  targetUserId?: string,
  details?: Record<string, any>
): Promise<boolean> {
  return logActivity(
    adminId,
    'admin_action',
    action,
    { targetUserId, ...details }
  );
}

/**
 * Create audit trail for consent changes
 */
export async function logConsentChange(
  userId: string,
  changeType: 'given' | 'withdrawn',
  scope: string,
  previousState?: Record<string, any>,
  newState?: Record<string, any>
): Promise<boolean> {
  return logActivity(
    userId,
    changeType === 'given' ? 'consent_given' : 'consent_withdrawn',
    scope,
    { previousState, newState }
  );
}

/**
 * Helper to get current IP and User-Agent (client-side detection)
 */
export async function getClientMetadata(): Promise<{
  userAgent: string;
  language: string;
  timezone: string;
}> {
  return {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    language: typeof navigator !== 'undefined' ? navigator.language : '',
    timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : '',
  };
}
