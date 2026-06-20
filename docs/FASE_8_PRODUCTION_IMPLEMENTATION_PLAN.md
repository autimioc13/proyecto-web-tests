# FASE 8: User Profiles & Autenticación - Production Implementation Plan

**Status:** PRODUCTION-READY SPECIFICATION
**Date:** 2026-06-03
**Target Date:** 2026-06-10
**Environment:** QuizLab Web Monetization Platform

---

## EXECUTIVE SUMMARY

This document specifies a complete, production-ready authentication and user profile system for QuizLab. The implementation includes:

- **Real Supabase Auth** with Google, GitHub, and Email/Password providers
- **User Profile Management** with complete data persistence
- **Database-Backed Cart** migration from localStorage
- **Order & Purchase History** tracking
- **Role-Based Access Control** (RBAC) for admin features
- **Protected Routes** with middleware
- **Session Management** with secure cookies
- **Profile Dashboard** for viewing purchases and downloading products

This is a REAL production system - not a POC. It includes security hardening, Row-Level Security (RLS) policies, email verification flows, password reset, and audit logging.

---

## ARCHITECTURE OVERVIEW

### Tech Stack
- **Auth:** Supabase Auth (OAuth 2.0 + JWT)
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Supabase JS Client + Prisma (for complementary data)
- **Session:** HTTP-only cookies (Supabase SSR)
- **Frontend:** Next.js 16 App Router with Server Components
- **State Management:** React Context (AuthContext, CartContext)

### High-Level Flow

```
User Registration/Login
  ↓
Supabase Auth (OAuth or Email/Password)
  ↓
JWT Token + HTTP-only Session Cookie
  ↓
Auth Callback → Create/Update User Profile in DB
  ↓
Store User ID in Session
  ↓
Redirect to Dashboard/Profile
  ↓
Access Protected Routes Based on Role
  ↓
View/Manage Cart, Orders, Profile
```

---

## DATABASE SCHEMA

### Phase 1: Supabase Auth Tables (Managed)
```
auth.users (managed by Supabase)
├── id (UUID, PK)
├── email (VARCHAR)
├── encrypted_password (VARCHAR, nullable)
├── email_confirmed_at (TIMESTAMP)
├── raw_app_meta_data (JSONB)
├── raw_user_meta_data (JSONB)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── last_sign_in_at (TIMESTAMP)
```

### Phase 2: Public User Profiles Table

**File:** `prisma/migrations/[timestamp]_add_user_profiles.sql`

```sql
-- Create public.users table (user profiles)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  provider VARCHAR(50), -- 'google', 'github', 'email'
  bio TEXT,
  phone VARCHAR(20),
  country VARCHAR(100),
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255) UNIQUE,
  verification_token_expires_at TIMESTAMP,
  password_reset_token VARCHAR(255) UNIQUE,
  password_reset_token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  last_login_at TIMESTAMP,
  
  CONSTRAINT valid_provider CHECK (provider IN ('google', 'github', 'email'))
);

-- Create index for email lookups
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_verification_token ON public.users(verification_token);
CREATE INDEX idx_users_password_reset_token ON public.users(password_reset_token);

-- RLS Policy: Users can only read their own profile
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles" ON public.users
  FOR ALL
  USING (auth.role() = 'service_role');
```

### Phase 3: User Roles Table (RBAC)

**File:** `prisma/migrations/[timestamp]_add_user_roles.sql`

```sql
-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'user', 'admin', 'moderator'
  assigned_at TIMESTAMP DEFAULT now(),
  assigned_by UUID REFERENCES public.users(id),
  
  CONSTRAINT valid_role CHECK (role IN ('user', 'admin', 'moderator')),
  UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- RLS Policies
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Service role can manage all roles" ON public.user_roles
  FOR ALL
  USING (auth.role() = 'service_role');
```

### Phase 4: Carts Table (Database-Backed)

**File:** `prisma/migrations/[timestamp]_add_database_carts.sql`

```sql
-- Create carts table
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]', -- [{productId, quantity, addedAt}]
  total_price BIGINT DEFAULT 0, -- in cents
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_carts_user_id ON public.carts(user_id);
CREATE INDEX idx_carts_updated_at ON public.carts(updated_at);

-- RLS Policy: Users can only access their own cart
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own cart" ON public.carts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own cart" ON public.carts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart" ON public.carts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all carts" ON public.carts
  FOR ALL
  USING (auth.role() = 'service_role');
```

### Phase 5: Orders Tables

**File:** `prisma/migrations/[timestamp]_add_orders.sql`

```sql
-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  total_price BIGINT NOT NULL, -- in cents
  payment_method VARCHAR(50), -- 'stripe', 'paypal', 'mock'
  payment_intent_id VARCHAR(255), -- Stripe PI ID
  shipping_address JSONB,
  billing_address JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_orders_payment_intent_id ON public.orders(payment_intent_id);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL,
  product_title VARCHAR(255) NOT NULL,
  product_category VARCHAR(100),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price BIGINT NOT NULL, -- in cents
  subtotal BIGINT NOT NULL, -- quantity * unit_price
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- RLS Policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders" ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own order items" ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role manages all orders" ON public.orders
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role manages all order items" ON public.order_items
  FOR ALL
  USING (auth.role() = 'service_role');
```

### Phase 6: Purchases Table (Product Download Tracking)

**File:** `prisma/migrations/[timestamp]_add_purchases.sql`

```sql
-- Create purchases table (tracks downloadable products)
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  product_id VARCHAR(255) NOT NULL,
  product_title VARCHAR(255) NOT NULL,
  download_url TEXT, -- S3 or similar
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP,
  expires_at TIMESTAMP, -- NULL = never expires
  license_key VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(order_id, product_id)
);

CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_purchases_product_id ON public.purchases(product_id);
CREATE INDEX idx_purchases_created_at ON public.purchases(created_at);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own purchases" ON public.purchases
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own purchases" ON public.purchases
  FOR UPDATE
  USING (auth.uid() = user_id);
```

### Phase 7: Audit Log Table

**File:** `prisma/migrations/[timestamp]_add_auth_audit_logs.sql`

```sql
-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  action VARCHAR(100) NOT NULL, -- 'login', 'logout', 'profile_update', 'order_created', etc.
  resource_type VARCHAR(100), -- 'user', 'order', 'cart', etc.
  resource_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(50), -- 'success', 'failed'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Audit logs are read-only for regular users
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all audit logs" ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Service role manages all audit logs" ON public.audit_logs
  FOR ALL
  USING (auth.role() = 'service_role');
```

---

## IMPLEMENTATION TASKS (15-20 Tasks)

### TASK 1: Update TypeScript Types for Auth

**File:** `src/lib/supabase/types.ts`

Add comprehensive type definitions:

```typescript
// User profile types
export type UserProfile = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  provider: 'google' | 'github' | 'email' | null;
  bio: string | null;
  phone: string | null;
  country: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

export type UserRole = 'user' | 'admin' | 'moderator';

export type UserWithRoles = UserProfile & {
  roles: UserRole[];
};

export type CartItemDB = {
  productId: string;
  quantity: number;
  addedAt: string;
};

export type CartDB = {
  id: string;
  userId: string;
  items: CartItemDB[];
  totalPrice: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: string;
  userId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  totalPrice: number;
  paymentMethod: string | null;
  paymentIntentId: string | null;
  shippingAddress: Record<string, any> | null;
  billingAddress: Record<string, any> | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  productCategory: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
};

export type Purchase = {
  id: string;
  orderId: string;
  userId: string;
  productId: string;
  productTitle: string;
  downloadUrl: string | null;
  downloadCount: number;
  lastDownloadedAt: string | null;
  expiresAt: string | null;
  licenseKey: string;
  createdAt: string;
};

export type AuthSession = {
  user: UserProfile;
  roles: UserRole[];
  token: string;
  expiresAt: number;
};
```

**Testing:**
- [ ] Type compilation passes with `npm run build`
- [ ] All types match database schema
- [ ] No `any` type usage in exported types

---

### TASK 2: Create AuthContext Provider

**File:** `src/lib/contexts/AuthContext.tsx`

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { UserProfile, UserRole, UserWithRoles } from '@/lib/supabase/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  roles: UserRole[];
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      if (profileData) {
        setProfile({
          id: profileData.id,
          email: profileData.email,
          fullName: profileData.full_name,
          avatarUrl: profileData.avatar_url,
          provider: profileData.provider,
          bio: profileData.bio,
          phone: profileData.phone,
          country: profileData.country,
          isVerified: profileData.is_verified,
          createdAt: profileData.created_at,
          updatedAt: profileData.updated_at,
          lastLoginAt: profileData.last_login_at,
        });
      }

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) throw rolesError;

      const userRoles = rolesData?.map((r) => r.role as UserRole) || ['user'];
      setRoles(userRoles);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [supabase]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user || null);

        if (user?.id) {
          await fetchUserProfile(user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser?.id) {
          await fetchUserProfile(currentUser.id);
        } else {
          setProfile(null);
          setRoles([]);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  const refreshUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  }, [supabase, fetchUserProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setRoles([]);
  }, [supabase]);

  const value: AuthContextType = {
    user,
    profile,
    roles,
    loading,
    isAdmin: roles.includes('admin'),
    isAuthenticated: !!user,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

**Testing:**
- [ ] Auth context initializes correctly
- [ ] User profile loads on login
- [ ] Roles are fetched and available
- [ ] `useAuth` hook works in components
- [ ] Logout clears all state

---

### TASK 3: Create AuthProvider Component

**File:** `src/components/providers/AuthProvider.tsx`

```typescript
'use client';

import { AuthProvider as ContextProvider } from '@/lib/contexts/AuthContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <ContextProvider>{children}</ContextProvider>;
}
```

---

### TASK 4: Create Protected Route Layout Middleware

**File:** `src/middleware.ts` (NEW)

```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client for server-side auth checks
  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get user session
  const { data: { user } } = await supabase.auth.getUser();

  // Protect /admin/* routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login?next=/admin', request.url));
    }

    // Check admin role in database
    try {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (!roles?.some((r) => r.role === 'admin')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect /dashboard, /profile, /checkout
  const protectedPaths = ['/dashboard', '/profile', '/checkout'];
  if (protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/auth/login?next=${request.nextUrl.pathname}`, request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/checkout/:path*',
  ],
};
```

**Testing:**
- [ ] Unauthenticated users redirected to /auth/login
- [ ] Auth redirect includes `next` parameter
- [ ] /admin/* requires admin role
- [ ] Regular users cannot access /admin

---

### TASK 5: Update Auth Callback to Create User Profile

**File:** `src/app/auth/callback/route.ts`

```typescript
import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = await createServerClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Get the authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (!userError && user) {
        // Create or update user profile
        const userMetadata = user.user_metadata || {};
        
        const { error: upsertError } = await supabase
          .from('users')
          .upsert(
            {
              id: user.id,
              email: user.email || '',
              full_name: userMetadata.full_name || null,
              avatar_url: userMetadata.avatar_url || null,
              provider: user.app_metadata?.provider || 'email',
              is_verified: !!user.email_confirmed_at,
              last_login_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );

        if (!upsertError) {
          // Ensure user has default 'user' role
          const { data: existingRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);

          if (!existingRoles?.length) {
            await supabase
              .from('user_roles')
              .insert({
                user_id: user.id,
                role: 'user',
                assigned_at: new Date().toISOString(),
              });
          }

          // Log auth event
          await supabase
            .from('audit_logs')
            .insert({
              user_id: user.id,
              action: 'login',
              resource_type: 'user',
              resource_id: user.id,
              ip_address: request.ip,
              user_agent: request.headers.get('user-agent'),
              status: 'success',
            });

          return NextResponse.redirect(new URL(next, request.url));
        }
      }
    }
  }

  // Return error
  return NextResponse.redirect(new URL('/auth/login?error=auth_failed', request.url));
}
```

**Testing:**
- [ ] User profile created after OAuth login
- [ ] Default 'user' role assigned
- [ ] Login audit logged
- [ ] Redirect to `next` parameter works

---

### TASK 6: Create Login Page with Email/Password Option

**File:** `src/app/auth/login/login-content.tsx` (UPDATE)

Update existing file to add email/password support:

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { Mail, Code, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const next = searchParams.get('next') || '/dashboard';
  
  const [tab, setTab] = useState<'oauth' | 'email'>('oauth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    });
    if (error) {
      setMessage('Error: ' + error.message);
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    });
    if (error) {
      setMessage('Error: ' + error.message);
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignup) {
        // Sign up with email
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}`,
            data: {
              full_name: email.split('@')[0],
            },
          },
        });

        if (error) {
          setMessage('Error: ' + error.message);
        } else {
          setMessage('Check your email to confirm signup!');
          setEmail('');
          setPassword('');
        }
      } else {
        // Sign in with email
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage('Error: ' + error.message);
        } else {
          router.push(next);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg p-8 border border-slate-700">
        <h1 className="text-3xl font-bold text-white mb-2">🧪 QuizLab</h1>
        <p className="text-slate-400 mb-8">Descubre quién eres realmente</p>

        {error === 'auth_failed' && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded text-red-400 text-sm">
            Error en autenticación. Intenta de nuevo.
          </div>
        )}

        {message && (
          <div className={`mb-6 p-4 rounded text-sm border ${
            message.includes('Error')
              ? 'bg-red-900/30 border-red-700 text-red-400'
              : 'bg-green-900/30 border-green-700 text-green-400'
          }`}>
            {message}
          </div>
        )}

        <div className="flex gap-2 mb-6 border-b border-slate-700">
          <button
            onClick={() => { setTab('oauth'); setMessage(''); }}
            className={`flex-1 py-2 text-sm font-semibold transition border-b-2 ${
              tab === 'oauth'
                ? 'text-purple-400 border-purple-400'
                : 'text-slate-400 border-transparent'
            }`}
          >
            OAuth
          </button>
          <button
            onClick={() => { setTab('email'); setMessage(''); }}
            className={`flex-1 py-2 text-sm font-semibold transition border-b-2 ${
              tab === 'email'
                ? 'text-purple-400 border-purple-400'
                : 'text-slate-400 border-transparent'
            }`}
          >
            Email
          </button>
        </div>

        {tab === 'oauth' ? (
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-lg transition disabled:opacity-50"
            >
              <Mail size={20} />
              Continuar con Google
            </button>

            <button
              onClick={handleGithubLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              <Code size={20} />
              Continuar con GitHub
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Email</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Procesando...' : isSignup ? 'Registrarse' : 'Iniciar Sesión'}
            </button>

            <button
              type="button"
              onClick={() => { setIsSignup(!isSignup); setMessage(''); }}
              className="w-full text-sm text-slate-400 hover:text-slate-300 transition"
            >
              {isSignup ? 'Ya tengo cuenta' : '¿No tienes cuenta? Regístrate'}
            </button>
          </form>
        )}

        <p className="text-xs text-slate-500 text-center mt-8">
          Al continuar, aceptas nuestros términos y privacidad
        </p>
      </div>
    </div>
  );
}
```

**Testing:**
- [ ] OAuth login redirects correctly
- [ ] Email/password signup creates account
- [ ] Email/password login works
- [ ] Password visibility toggle works
- [ ] Error messages display correctly

---

### TASK 7: Create Signup Page

**File:** `src/app/auth/signup/page.tsx` (NEW)

```typescript
'use client';

import { Suspense } from 'react';
import LoginContent from '../login/login-content';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <LoginContent />
    </Suspense>
  );
}
```

---

### TASK 8: Create User Profile Page

**File:** `src/app/profile/page.tsx` (UPDATE)

```typescript
'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { User, Mail, LogOut, Download, Calendar, Package } from 'lucide-react';
import { Purchase } from '@/lib/supabase/types';

export default function ProfilePage() {
  const { user, profile, logout, loading } = useAuth();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(profile?.fullName || '');
  const supabase = createClient();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    const fetchPurchases = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('purchases')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setPurchases(data);
        }
      }
      setLoadingPurchases(false);
    };

    if (user?.id) {
      fetchPurchases();
    }
  }, [user, loading]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleUpdateProfile = async () => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('users')
      .update({ full_name: newName })
      .eq('id', user.id);

    if (!error) {
      setEditingName(false);
    }
  };

  const handleDownloadProduct = async (purchase: Purchase) => {
    if (!purchase.download_url) return;

    // Update download count
    await supabase
      .from('purchases')
      .update({
        download_count: purchase.download_count + 1,
        last_downloaded_at: new Date().toISOString(),
      })
      .eq('id', purchase.id);

    // Trigger download
    window.open(purchase.download_url, '_blank');
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-slate-400">Cargando...</div>
    </div>;
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profile.fullName || 'Usuario'}</h1>
                <p className="text-slate-400 flex items-center gap-2 mt-1">
                  <Mail size={16} />
                  {profile.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>

          {/* Edit Name */}
          <div className="border-t border-slate-700 pt-6">
            <label className="block text-sm text-slate-400 mb-2">Nombre Completo</label>
            {editingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-white">{profile.fullName || 'No especificado'}</span>
                <button
                  onClick={() => { setNewName(profile.fullName || ''); setEditingName(true); }}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Editar
                </button>
              </div>
            )}
          </div>

          {/* Account Info */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700">
            <div>
              <p className="text-sm text-slate-400 mb-1">Verificado</p>
              <p className="font-semibold">
                {profile.isVerified ? '✓ Sí' : '✗ No'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Miembro desde</p>
              <p className="font-semibold">
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Purchases/Downloads */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Package size={24} />
              Mis Descargas
            </h2>
          </div>

          {loadingPurchases ? (
            <div className="p-6 text-center text-slate-400">Cargando compras...</div>
          ) : purchases.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              <p>No tienes productos descargables aún</p>
              <a
                href="/store"
                className="inline-block mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
              >
                Ver Tienda
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Producto</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Comprado</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Descargas</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      className="border-b border-slate-700 hover:bg-slate-700/50 transition"
                    >
                      <td className="px-6 py-4 font-semibold">{purchase.productTitle}</td>
                      <td className="px-6 py-4 text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(purchase.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {purchase.downloadCount}x
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDownloadProduct(purchase)}
                          disabled={!purchase.download_url}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download size={16} />
                          Descargar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Testing:**
- [ ] Profile page loads user data
- [ ] Logout works and clears auth
- [ ] Name editing updates profile
- [ ] Purchases display correctly
- [ ] Download link works
- [ ] Unauthenticated redirect works

---

### TASK 9: Migrate CartContext to Database

**File:** `src/lib/contexts/CartContext.tsx` (UPDATE)

Update CartContext to use database when user is authenticated:

```typescript
// After CartContext is created, add this useEffect to sync with DB:

useEffect(() => {
  if (isHydrated && user?.id) {
    // Sync to database
    syncCartToDatabase();
  }
}, [cart, isHydrated, user?.id]);

const syncCartToDatabase = async () => {
  if (!user?.id || !isHydrated) return;

  try {
    const cartData = {
      user_id: user.id,
      items: cart.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        addedAt: item.addedAt.toISOString(),
      })),
      total_price: cart.totalPrice,
      item_count: cart.itemCount,
    };

    await supabase
      .from('carts')
      .upsert(cartData, { onConflict: 'user_id' });
  } catch (error) {
    console.error('Error syncing cart to database:', error);
  }
};

// Load cart from database on auth
useEffect(() => {
  if (user?.id && isHydrated) {
    loadCartFromDatabase();
  }
}, [user?.id]);

const loadCartFromDatabase = async () => {
  if (!user?.id) return;

  try {
    const { data, error } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      const cart: Cart = {
        items: data.items.map((item: any) => ({
          product: { /* reconstruct from cache or fetch */ },
          quantity: item.quantity,
          addedAt: new Date(item.addedAt),
        })),
        totalPrice: data.total_price,
        itemCount: data.item_count,
        lastUpdated: new Date(data.updated_at),
      };
      setCart(cart);
    }
  } catch (error) {
    console.error('Error loading cart from database:', error);
  }
};
```

**Testing:**
- [ ] Cart syncs to database when user logs in
- [ ] Cart persists across sessions
- [ ] Unauthenticated users still use localStorage
- [ ] Cart updates immediately after product operations

---

### TASK 10: Create Order Management API

**File:** `src/app/api/orders/create/route.ts` (NEW)

```typescript
import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, total_price, payment_method } = body;

    if (!items?.length) {
      return NextResponse.json(
        { error: 'No items in order' },
        { status: 400 }
      );
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_price,
        payment_method,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      product_title: item.productTitle,
      product_category: item.category,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.quantity * item.unitPrice,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Log audit
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'order_created',
        resource_type: 'order',
        resource_id: order.id,
        new_values: { total_price, item_count: items.length },
        ip_address: request.ip,
        user_agent: request.headers.get('user-agent'),
        status: 'success',
      });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
```

**Testing:**
- [ ] Order creation requires authentication
- [ ] Order items created correctly
- [ ] Audit log records order creation
- [ ] Validation prevents empty orders

---

### TASK 11: Create Admin Dashboard Protected Route

**File:** `src/app/admin/dashboard/page.tsx` (NEW)

```typescript
'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, ShoppingCart, TrendingUp, ActivityLog } from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentActivity: [],
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
      return;
    }

    const fetchStats = async () => {
      try {
        // Count users
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        // Count orders
        const { count: orderCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed');

        // Get total revenue
        const { data: orders, error } = await supabase
          .from('orders')
          .select('total_price')
          .eq('status', 'completed');

        const totalRevenue = orders?.reduce((sum, o) => sum + o.total_price, 0) || 0;

        // Get recent activity
        const { data: activity } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        setStats({
          totalUsers: userCount || 0,
          totalOrders: orderCount || 0,
          totalRevenue: totalRevenue / 100, // Convert from cents
          recentActivity: activity || [],
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user && isAdmin) {
      fetchStats();
    }
  }, [user, isAdmin, loading]);

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-slate-400">Cargando...</div>
    </div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-12">Panel Administrativo</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-slate-400 text-sm">Usuarios</span>
            </div>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <ShoppingCart className="w-5 h-5 text-purple-400" />
              <span className="text-slate-400 text-sm">Órdenes</span>
            </div>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-slate-400 text-sm">Ingresos</span>
            </div>
            <div className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <ActivityLog className="w-5 h-5 text-orange-400" />
              <span className="text-slate-400 text-sm">Actividad</span>
            </div>
            <div className="text-3xl font-bold">{stats.recentActivity.length}</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold">Actividad Reciente</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Acción</th>
                  <th className="px-6 py-3 text-left font-semibold">Usuario</th>
                  <th className="px-6 py-3 text-left font-semibold">Recurso</th>
                  <th className="px-6 py-3 text-left font-semibold">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivity.map((log: any) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-700 hover:bg-slate-700/50 transition"
                  >
                    <td className="px-6 py-4 font-semibold">{log.action}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {log.user_id?.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-slate-400">{log.resource_type}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Testing:**
- [ ] Only admins can access
- [ ] Stats load correctly
- [ ] Activity logs display
- [ ] Pagination works (if needed)

---

### TASK 12: Create Database Migration Script

**File:** `prisma/migrations/[timestamp]_initial_auth_schema.sql`

Create complete migration file with all tables and RLS policies from SCHEMA section above.

**Testing:**
- [ ] Migration runs without errors: `npx prisma migrate deploy`
- [ ] All tables created
- [ ] RLS policies enabled
- [ ] Indexes created

---

### TASK 13: Add Protected Routes Wrapper Layout

**File:** `src/app/(protected)/layout.tsx` (NEW)

```typescript
'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}
```

Move protected pages into `src/app/(protected)/`:
- `/profile` → `/src/app/(protected)/profile/page.tsx`
- `/dashboard` → `/src/app/(protected)/dashboard/page.tsx`

**Testing:**
- [ ] Unauthenticated users redirected
- [ ] Authenticated users see content
- [ ] Loading state shows

---

### TASK 14: Create Email Verification Flow (Optional but Recommended)

**File:** `src/app/auth/verify-email/page.tsx` (NEW)

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token inválido o expirado');
      return;
    }

    const verifyEmail = async () => {
      try {
        // Update user verification status in DB
        const { error } = await supabase
          .from('users')
          .update({ is_verified: true })
          .eq('verification_token', token);

        if (error) throw error;

        setStatus('success');
        setMessage('Email verificado exitosamente!');
        setTimeout(() => router.push('/dashboard'), 3000);
      } catch (error) {
        setStatus('error');
        setMessage('Error verificando email');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
        <div className="flex justify-center mb-4">
          {status === 'loading' && <Mail className="w-12 h-12 text-slate-400" />}
          {status === 'success' && (
            <CheckCircle className="w-12 h-12 text-green-400" />
          )}
          {status === 'error' && (
            <AlertCircle className="w-12 h-12 text-red-400" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Verificación de Email</h1>
        <p className="text-slate-400">{message}</p>

        {status !== 'loading' && (
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            Continuar
          </button>
        )}
      </div>
    </div>
  );
}
```

**Testing:**
- [ ] Valid token marks email as verified
- [ ] Invalid token shows error
- [ ] Success redirects to dashboard

---

### TASK 15: Create Password Reset Flow (Production Essential)

**File:** `src/app/auth/reset-password/page.tsx` (NEW)

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setMessage('Contraseña actualizada exitosamente');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err) {
      setError('Error actualizando contraseña');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
          <p className="text-red-400">Token inválido o expirado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg p-8 border border-slate-700">
        <h1 className="text-3xl font-bold text-white mb-2">Restablecer Contraseña</h1>
        <p className="text-slate-400 mb-8">Ingresa tu nueva contraseña</p>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded text-green-400 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Nueva Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Confirmar Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Restablecer Contraseña'}
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-6">
          <a href="/auth/login" className="text-purple-400 hover:text-purple-300">
            Volver al login
          </a>
        </p>
      </div>
    </div>
  );
}
```

**Testing:**
- [ ] Password validation works
- [ ] Matching passwords required
- [ ] Minimum length enforced
- [ ] Success message shows
- [ ] Redirect to login works

---

### TASK 16: Environment Variables Documentation

**File:** `.env.example` (UPDATE)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=postgresql://...

# Auth Callbacks
NEXT_PUBLIC_AUTH_CALLBACK_URL=http://localhost:3000/auth/callback
NEXT_PUBLIC_AUTH_BASE_URL=http://localhost:3000

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@quizlab.com

# Payment (Optional for Task 20)
STRIPE_PUBLIC_KEY=your_stripe_pk
STRIPE_SECRET_KEY=your_stripe_sk
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Admin
ADMIN_EMAIL=your_admin_email@example.com
```

**Testing:**
- [ ] All vars documented
- [ ] Types specified
- [ ] Example format correct

---

### TASK 17: Create Checkout Page (Foundation)

**File:** `src/app/(protected)/checkout/page.tsx` (NEW)

```typescript
'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useCart } from '@/lib/contexts/CartContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { user, profile } = useAuth();
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const supabase = createClient();

  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCheckout = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    try {
      // Create order
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map((item) => ({
            productId: item.product.id,
            productTitle: item.product.title,
            category: item.product.category,
            quantity: item.quantity,
            unitPrice: item.product.price,
          })),
          total_price: cart.totalPrice,
          payment_method: paymentMethod,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();

      // In production, integrate Stripe or PayPal here
      // For now, simulate successful payment
      await supabase
        .from('orders')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', order.id);

      // Create purchases for downloads
      const purchases = cart.items.map((item) => ({
        order_id: order.id,
        user_id: user.id,
        product_id: item.product.id,
        product_title: item.product.title,
        license_key: `LIC-${order.id}-${item.product.id}`,
      }));

      await supabase
        .from('purchases')
        .insert(purchases);

      setSuccess(true);
      clearCart();
      setTimeout(() => router.push('/profile'), 3000);
    } catch (err) {
      setError('Error processing order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-12">Checkout</h1>

        {cart.items.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
            <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">Tu carrito está vacío</p>
            <a
              href="/store"
              className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded transition"
            >
              Volver a la Tienda
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
                <h2 className="text-2xl font-bold mb-4">Resumen de Pedido</h2>
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex justify-between items-center py-2 border-b border-slate-700"
                    >
                      <div>
                        <p className="font-semibold">{item.product.title}</p>
                        <p className="text-sm text-slate-400">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ${((item.product.price * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-2xl font-bold mb-4">Método de Pago</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>Tarjeta de Crédito (Stripe)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>PayPal</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Totals & Checkout */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 sticky top-6">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>${(cart.totalPrice / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Impuesto (0%)</span>
                    <span>$0.00</span>
                  </div>
                  <div className="border-t border-slate-700 pt-4 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${(cart.totalPrice / 100).toFixed(2)}</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle size={16} />
                    Orden creada exitosamente
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading || success}
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Procesando...' : 'Proceder al Pago'}
                </button>

                <p className="text-xs text-slate-500 text-center mt-4">
                  Tus datos están protegidos
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Testing:**
- [ ] Cart items display correctly
- [ ] Totals calculate correctly
- [ ] Order creation works
- [ ] Success redirect works
- [ ] Protected route redirects unauthenticated users

---

### TASK 18: Add UserProvider to Root Layout

**File:** `src/app/layout.tsx` (UPDATE)

Add AuthProvider to root layout:

```typescript
import { AuthProvider } from '@/components/providers/AuthProvider';
import { CartProvider } from '@/lib/contexts/CartContext';
import { SoundProvider } from '@/components/providers/SoundProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <CartProvider>
            <SoundProvider>
              {children}
            </SoundProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Testing:**
- [ ] Layout compiles
- [ ] Auth context available throughout app
- [ ] No hydration mismatches

---

### TASK 19: Create Database Seeding Script (Admin Setup)

**File:** `scripts/seed-admin.ts` (NEW)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  try {
    // Create admin user via Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (authError) throw authError;

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: adminEmail,
        full_name: 'Administrator',
        is_verified: true,
      });

    if (profileError) throw profileError;

    // Assign admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: 'admin',
      });

    if (roleError) throw roleError;

    console.log('Admin user created successfully');
    console.log(`Email: ${adminEmail}`);
    console.log('Password: (provided via ENV)');
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
```

**Testing:**
- [ ] Script runs: `npx ts-node scripts/seed-admin.ts`
- [ ] Admin user created in Supabase Auth
- [ ] User profile created
- [ ] Admin role assigned

---

### TASK 20: Payment Integration (Stripe - Production)

**File:** `src/app/api/payment/create-intent/route.ts` (NEW)

```typescript
import { createServerClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, amount } = body;

    // Create or retrieve Stripe customer
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    const customer = await stripe.customers.create({
      email: user.email,
      name: profile?.full_name || 'Customer',
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'usd',
      customer: customer.id,
      metadata: {
        orderId,
        userId: user.id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
```

**Testing:**
- [ ] Stripe account configured
- [ ] API keys set in .env
- [ ] Payment intent created
- [ ] Client secret returned
- [ ] Order linked to payment

---

## TESTING STRATEGY

### Unit Testing
```bash
# Test auth context
npm run test -- src/lib/contexts/AuthContext.test.tsx

# Test cart context
npm run test -- src/lib/contexts/CartContext.test.tsx
```

### Integration Testing
```bash
# Test auth flow
npm run test -- src/app/auth/__tests__/auth-flow.test.ts

# Test order creation
npm run test -- src/app/api/orders/__tests__/create.test.ts
```

### E2E Testing (Playwright)
```bash
# Test complete user journey
npx playwright test tests/e2e/user-journey.spec.ts
```

### Manual Testing Checklist

**Authentication:**
- [ ] Signup with email
- [ ] Login with email
- [ ] Google OAuth
- [ ] GitHub OAuth
- [ ] Logout
- [ ] Session persists on refresh
- [ ] Protected routes redirect to login

**User Profile:**
- [ ] View profile page
- [ ] Edit full name
- [ ] View account creation date
- [ ] See verification status

**Cart & Checkout:**
- [ ] Add product to cart
- [ ] Remove product from cart
- [ ] Update quantity
- [ ] Cart persists after logout/login
- [ ] Checkout creates order
- [ ] Order appears in profile

**Admin:**
- [ ] Access admin dashboard (with admin role)
- [ ] View user stats
- [ ] View order list
- [ ] View activity logs
- [ ] Non-admin cannot access

---

## DEPLOYMENT CHECKLIST

### Pre-Production
- [ ] All database migrations applied: `npx prisma migrate deploy`
- [ ] Supabase RLS policies enabled and tested
- [ ] Environment variables set in hosting platform
- [ ] Email service (SendGrid) configured
- [ ] Payment provider (Stripe) set up
- [ ] Admin account created via seed script
- [ ] SSL certificates configured
- [ ] CORS settings in Supabase Auth

### Supabase Configuration
1. Go to Supabase Dashboard
2. Enable Supabase Auth with:
   - Google OAuth (get credentials from Google Cloud)
   - GitHub OAuth (get credentials from GitHub)
   - Email/Password
3. Configure redirect URLs:
   ```
   http://localhost:3000/auth/callback (dev)
   https://yourdomain.com/auth/callback (prod)
   ```
4. Enable Row Level Security on all tables
5. Set up email templates for verification

### Production Deployment
```bash
# Build
npm run build

# Test build
npm run start

# Deploy to hosting (Vercel/Netlify)
# Ensure environment variables are set
# Run database migrations
# Seed admin account
# Test auth flow in production
```

### Monitoring
- [ ] Error logging (Sentry or similar)
- [ ] Auth failure alerts
- [ ] Payment failure alerts
- [ ] Database backup strategy
- [ ] Log retention policy

---

## SECURITY BEST PRACTICES

1. **Passwords:** Never log, always hash (Supabase handles this)
2. **Sessions:** Use HTTP-only cookies, never localStorage for auth tokens
3. **RLS:** Every table has RLS policies, service role for backend operations only
4. **CORS:** Whitelist only your domain
5. **Rate Limiting:** Implement on auth endpoints (consider Supabase Auth rate limits)
6. **Secrets:** Use environment variables, never commit `.env` files
7. **Audit Logging:** Log all auth and payment events
8. **Data Encryption:** Use TLS for all data in transit
9. **Password Resets:** 15-minute expiration on tokens
10. **Email Verification:** Required for email/password signups

---

## ROLLBACK PROCEDURES

If issues occur:

```bash
# Rollback to previous migration
npx prisma migrate resolve --rolled-back [migration_name]

# Revert deployment
# (Use your hosting platform's rollback feature)

# Clear auth sessions if compromised
# (Manual Supabase dashboard action)
```

---

## SUCCESS CRITERIA

Phase 8 is complete when:

1. Users can signup/login with Google, GitHub, and Email
2. User profiles visible and editable
3. Cart persists per user in database
4. Orders create and complete successfully
5. Users see purchase history and download links
6. Admin dashboard shows statistics
7. All protected routes require authentication
8. Role-based access control works
9. Email verification flow operational
10. Password reset flow operational
11. Audit logging tracks all auth events
12. No sensitive data in logs
13. All RLS policies active and tested
14. Production deployment successful
15. Zero auth-related security issues

---

## TIMELINE

**Week 1:**
- Tasks 1-7: Core auth setup
- Task 12: Database migrations
- Task 18: Layout updates

**Week 2:**
- Tasks 8-11: User profiles & orders
- Task 13-14: Protected routes & verification
- Task 19: Admin setup

**Week 3:**
- Task 15: Password reset
- Task 17: Checkout
- Task 20: Payment integration
- Testing & deployment

**Total:** 3 weeks for production-ready system

---

## REFERENCES

- Supabase Auth: https://supabase.com/docs/guides/auth
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
- Next.js Middleware: https://nextjs.org/docs/advanced-features/middleware
- Stripe Integration: https://stripe.com/docs/payments/quickstart

---

**Version:** 1.0
**Status:** PRODUCTION-READY
**Last Updated:** 2026-06-03
