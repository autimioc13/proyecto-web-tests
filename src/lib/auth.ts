/**
 * Role detection and authentication utilities for QuizLab
 * Provides admin role checking for sidebar and access control
 */

/**
 * Check if current user is admin
 * For MVP, use simple environment variable check
 * In production, check against user session/database
 */
export function isAdmin(): boolean {
  // Server-side: check env
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_ADMIN_MODE === 'true';
  }

  // Client-side: check localStorage (for testing)
  if (process.env.NODE_ENV === 'development') {
    const adminMode = localStorage.getItem('admin-mode');
    if (adminMode === 'true') return true;
  }

  // Default: false (not admin)
  return false;
}

/**
 * Set admin mode (development only)
 * Used for testing admin features without production credentials
 */
export function setAdminMode(enabled: boolean): void {
  if (process.env.NODE_ENV === 'development') {
    localStorage.setItem('admin-mode', enabled ? 'true' : 'false');
    window.location.reload();
  }
}

/**
 * Get current admin status
 * Safe to call on both server and client
 */
export function getAdminStatus(): boolean {
  return isAdmin();
}
