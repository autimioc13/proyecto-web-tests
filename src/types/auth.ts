// src/types/auth.ts

/**
 * User role enumeration
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

/**
 * Authentication provider
 */
export type AuthProvider = 'email' | 'google' | 'github';

/**
 * User authentication state
 */
export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  provider: AuthProvider;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User profile with additional information
 */
export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Signup data
 */
export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName?: string;
}

/**
 * Session data
 */
export interface Session {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

/**
 * Auth context type
 */
export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<{ needsEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
  signupWithGoogle: () => Promise<void>;
  signupWithGithub: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  getCurrentUser: () => Promise<UserProfile | null>;
}

/**
 * API response types
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserProfile;
  accessToken?: string;
  refreshToken?: string;
}

/**
 * Error types
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_EMAIL = 'INVALID_EMAIL',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NETWORK_ERROR = 'NETWORK_ERROR',
}
