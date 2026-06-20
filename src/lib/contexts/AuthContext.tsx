'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContextType, UserProfile, LoginCredentials, SignupData, UserRole } from '@/types/auth';
import { createClient } from '@/lib/supabase/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Browser SSR client: stores the session in cookies so the server/proxy can
// read it (prevents the "redirect back to login" loop on protected routes).
const supabase = createClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth on mount
  useEffect(() => {
    let mounted = true;

    // Map a DB users row (+ role) into our camelCase UserProfile.
    const mapProfile = (data: any, sessionUser: any, role?: string): UserProfile => ({
      id: data?.id ?? sessionUser.id,
      userId: data?.id ?? sessionUser.id,
      firstName:
        data?.first_name ?? sessionUser.user_metadata?.first_name ??
        sessionUser.user_metadata?.name?.split(' ')?.[0] ?? '',
      lastName: data?.last_name ?? sessionUser.user_metadata?.last_name ?? '',
      email: data?.email ?? sessionUser.email ?? '',
      avatar: data?.avatar_url ?? sessionUser.user_metadata?.avatar_url ?? null,
      bio: data?.bio ?? null,
      role: (role ?? 'user') as UserRole,
      isEmailVerified: data?.is_email_verified ?? !!sessionUser.email_confirmed_at,
      isActive: data?.is_active ?? true,
      createdAt: new Date(data?.created_at ?? sessionUser.created_at ?? Date.now()),
      updatedAt: new Date(data?.updated_at ?? data?.created_at ?? Date.now()),
      lastLoginAt: data?.last_login_at ? new Date(data.last_login_at) : null,
    });

    // Fetch the user's profile. Never awaited *inside* onAuthStateChange (avoids
    // the @supabase/ssr auth-lock deadlock). On failure we keep the user logged
    // in with a minimal profile derived from the session, instead of logging
    // them out.
    const fetchUserProfile = async (sessionUser: any) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*, user_roles!user_id(role)')
          .eq('id', sessionUser.id)
          .single();

        if (error) throw error;

        const roles = (data as any)?.user_roles;
        const role = Array.isArray(roles) ? roles[0]?.role : roles?.role;
        if (mounted) {
          setUser(mapProfile(data, sessionUser, role));
          setError(null);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        // Session is valid — keep the user signed in with a fallback profile.
        if (mounted) setUser(mapProfile(null, sessionUser));
      }
    };

    // Initial session check
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        if (session?.user) {
          fetchUserProfile(session.user).finally(() => {
            if (mounted) setLoading(false);
          });
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Auth init error:', err);
        if (mounted) setLoading(false);
      });

    // Listen for auth changes. Keep this callback synchronous and defer any
    // Supabase calls with setTimeout(0) so the auth lock is released first.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setTimeout(() => {
          if (mounted) fetchUserProfile(session.user);
        }, 0);
      } else if (mounted) {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      // User will be set by onAuthStateChange listener
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    try {
      setError(null);
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.displayName || `${data.firstName} ${data.lastName}`,
            first_name: data.firstName,
            last_name: data.lastName,
            provider: 'email',
          },
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=/dashboard`,
        },
      });

      if (error) throw error;

      // Trigger auto-creates the user profile and cart.
      // If Supabase has "Confirm email" enabled, no session is returned and the
      // user must verify their email before logging in.
      return { needsEmailConfirmation: !signUpData.session };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google login failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const loginWithGithub = useCallback(async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'GitHub login failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const signupWithGoogle = loginWithGoogle; // Same flow
  const signupWithGithub = loginWithGithub; // Same flow

  const resetPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/reset-password`,
      });
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    try {
      setError(null);
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUser({ ...user, ...data });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profile update failed';
      setError(message);
      throw new Error(message);
    }
  }, [user]);

  const getCurrentUser = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data } = await supabase
        .from('users')
        .select('*, user_roles!user_id(role)')
        .eq('id', session.user.id)
        .single();

      return data as UserProfile;
    } catch (err) {
      console.error('Get current user error:', err);
      return null;
    }
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        login,
        signup,
        logout,
        loginWithGoogle,
        loginWithGithub,
        signupWithGoogle,
        signupWithGithub,
        resetPassword,
        updateProfile,
        getCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
