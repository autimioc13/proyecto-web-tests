/**
 * Consent Validation Utilities
 * Validates user consent before processing data
 * Compliant with GDPR, CCPA, and Habeas Data
 */

export interface UserConsent {
  userId: string;
  cookieConsent: 'necessary_only' | 'all';
  marketingConsent: boolean;
  analyticsConsent: boolean;
  functionalConsent: boolean;
  profilingConsent: boolean;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  consentedAt: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ConsentLevel {
  essential: boolean;
  marketing: boolean;
  analytics: boolean;
  functional: boolean;
}

/**
 * Get user's consent from localStorage or cookie
 */
export function getUserConsent(): Partial<UserConsent> | null {
  if (typeof window === 'undefined') return null;

  const consentString = localStorage.getItem('cookie_consent');
  if (!consentString) return null;

  try {
    return JSON.parse(consentString);
  } catch (e) {
    console.error('Failed to parse consent:', e);
    return null;
  }
}

/**
 * Check if consent is still valid (< 90 days old)
 */
export function isConsentValid(consent: Partial<UserConsent>): boolean {
  if (!consent.expiresAt) return false;

  const expiryDate = new Date(consent.expiresAt);
  const now = new Date();

  return now < expiryDate;
}

/**
 * Check if user has consented to a specific scope
 */
export function hasConsentFor(scope: 'marketing' | 'analytics' | 'profiling' | 'functional'): boolean {
  const consent = getUserConsent();
  if (!consent) return false;

  switch (scope) {
    case 'marketing':
      return consent.marketingConsent === true;
    case 'analytics':
      return consent.analyticsConsent === true;
    case 'profiling':
      return consent.profilingConsent === true;
    case 'functional':
      return consent.functionalConsent === true;
    default:
      return false;
  }
}

/**
 * Validate consent before processing data
 * Returns true only if consent exists, is valid, and covers the required scope
 */
export function validateConsentFor(
  scope: 'marketing' | 'analytics' | 'profiling' | 'functional'
): boolean {
  const consent = getUserConsent();

  if (!consent) {
    console.warn(`No consent found for scope: ${scope}`);
    return false;
  }

  if (!isConsentValid(consent)) {
    console.warn(`Consent expired for scope: ${scope}`);
    return false;
  }

  if (!hasConsentFor(scope)) {
    console.warn(`User did not consent to scope: ${scope}`);
    return false;
  }

  return true;
}

/**
 * Get user's current consent level for a processing activity
 */
export function getConsentLevel(): ConsentLevel {
  const consent = getUserConsent();

  return {
    essential: true, // Always true
    marketing: (consent?.marketingConsent || false) && isConsentValid(consent),
    analytics: (consent?.analyticsConsent || false) && isConsentValid(consent),
    functional: (consent?.functionalConsent || false) && isConsentValid(consent),
  };
}

/**
 * Save user's consent preferences
 * Used by CookieConsentBanner component
 */
export function saveUserConsent(
  userId: string,
  preferences: {
    marketing: boolean;
    analytics: boolean;
    functional: boolean;
    profiling: boolean;
  }
): void {
  if (typeof window === 'undefined') return;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

  const consent: UserConsent = {
    userId,
    cookieConsent: Object.values(preferences).some(v => v) ? 'all' : 'necessary_only',
    marketingConsent: preferences.marketing,
    analyticsConsent: preferences.analytics,
    functionalConsent: preferences.functional,
    profilingConsent: preferences.profiling,
    termsAccepted: true,
    privacyPolicyAccepted: true,
    consentedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    ipAddress: undefined, // Will be collected server-side
    userAgent: navigator.userAgent,
  };

  localStorage.setItem('cookie_consent', JSON.stringify(consent));
  localStorage.setItem('cookie_consent_time', now.toISOString());

  // Trigger custom event for other components to listen
  window.dispatchEvent(
    new CustomEvent('consent_updated', { detail: consent })
  );
}

/**
 * Revoke user's consent to a specific scope
 */
export function revokeConsentFor(scope: 'marketing' | 'analytics' | 'profiling'): void {
  const consent = getUserConsent();
  if (!consent) return;

  const updated = { ...consent };

  switch (scope) {
    case 'marketing':
      updated.marketingConsent = false;
      break;
    case 'analytics':
      updated.analyticsConsent = false;
      break;
    case 'profiling':
      updated.profilingConsent = false;
      break;
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('cookie_consent', JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent('consent_revoked', { detail: { scope } })
    );
  }
}

/**
 * Clear all consent (user deleted account or revoked everything)
 */
export function clearAllConsent(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cookie_consent');
    localStorage.removeItem('cookie_consent_time');
    document.cookie = 'cookie_consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    window.dispatchEvent(
      new CustomEvent('consent_cleared')
    );
  }
}

/**
 * Check if user respects "Do Not Track" (DNT) header
 */
export function shouldRespectDNT(): boolean {
  if (typeof window === 'undefined') return false;

  const dnt = navigator.doNotTrack ||
              (window as any).doNotTrack ||
              (navigator as any).msDoNotTrack;

  return dnt === '1' || dnt === 'yes';
}

/**
 * Get remaining days until consent expires
 */
export function getDaysUntilConsentExpires(): number | null {
  const consent = getUserConsent();
  if (!consent?.expiresAt) return null;

  const expiryDate = new Date(consent.expiresAt);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : null;
}
