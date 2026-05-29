// Sistema de autenticación para Admin
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';
const SESSION_KEY = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas

export function getAdminPassword(): string {
  return ADMIN_PASSWORD;
}

export function isValidPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function createAdminSession(): string {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const expiresAt = Date.now() + SESSION_DURATION;
  return `${token}:${expiresAt}`;
}

export function validateAdminSession(session: string): boolean {
  if (!session) return false;
  const [token, expiresAt] = session.split(':');
  return Date.now() < parseInt(expiresAt);
}
