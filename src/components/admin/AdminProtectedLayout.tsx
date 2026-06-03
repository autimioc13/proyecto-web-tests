'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';

interface AdminProtectedLayoutProps {
  children: React.ReactNode;
}

/**
 * AdminProtectedLayout
 * Client-side route protection for admin pages
 * Verifies user is authenticated and has admin role
 * Redirects non-admins to home and unauthenticated users to login
 */
export function AdminProtectedLayout({
  children,
}: AdminProtectedLayoutProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Track if component is mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) {
      return;
    }

    // User is not authenticated
    if (!user) {
      router.push('/auth/login?redirect=/admin');
      return;
    }

    // User is authenticated but not admin
    if (!isAdmin) {
      router.push('/');
      return;
    }

    // User is admin - allow access
  }, [user, loading, isAdmin, router, mounted]);

  // Show loading state while verifying authentication and role
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader
            size={40}
            className="text-white/60 animate-spin mx-auto mb-4"
          />
          <p className="text-white/60">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // User is not admin - will be redirected, return empty for now
  if (!isAdmin) {
    return null;
  }

  // User is authenticated and is admin - render children
  return children;
}

export default AdminProtectedLayout;
