import crypto from 'crypto';

// Get keys from environment (base64-encoded)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const ENCRYPTION_IV = process.env.ENCRYPTION_IV || '';

if (!ENCRYPTION_KEY || !ENCRYPTION_IV) {
  throw new Error('Missing encryption keys in environment variables');
}

// Decode base64 keys to buffers
const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'base64');
const ivBuffer = Buffer.from(ENCRYPTION_IV, 'base64');

export interface EncryptedData {
  encrypted: string; // hex-encoded
  authTag: string;   // hex-encoded
  iv: string;        // hex-encoded
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * GCM mode provides both encryption and authentication
 */
export function encryptData(plaintext: string): EncryptedData {
  try {
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, ivBuffer);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return {
      encrypted,
      authTag,
      iv: ivBuffer.toString('hex'),
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data using AES-256-GCM
 * Verifies authentication tag to ensure data integrity
 */
export function decryptData(encryptedData: EncryptedData): string {
  try {
    const ivBuffer = Buffer.from(encryptedData.iv, 'hex');
    const authTagBuffer = Buffer.from(encryptedData.authTag, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data - may be corrupted or tampered');
  }
}

/**
 * Encrypt a JSON object
 * Useful for encrypting user profile data
 */
export function encryptJSON<T extends Record<string, any>>(data: T): EncryptedData {
  const jsonString = JSON.stringify(data);
  return encryptData(jsonString);
}

/**
 * Decrypt a JSON object
 * Returns parsed object
 */
export function decryptJSON<T extends Record<string, any>>(
  encryptedData: EncryptedData
): T {
  const jsonString = decryptData(encryptedData);
  return JSON.parse(jsonString);
}

/**
 * Hash data one-way (for comparison, not decryption)
 * Used for tokens, identifiers where we don't need to recover original
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate secure random token
 * For deletion requests, consent verification, etc.
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Constant-time string comparison
 * Prevents timing attacks on token verification
 */
export function secureCompare(a: string, b: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(a),
    Buffer.from(b)
  );
}
