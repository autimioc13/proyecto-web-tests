import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy (formerly Middleware).
 *
 * Optimistic auth checks only (per Next.js guidance — real authorization is
 * enforced in the API routes / server components):
 *  - Private areas redirect unauthenticated users to /auth/login.
 *  - Logged-in users hitting the auth pages are sent to /dashboard.
 *  - The home page and public quizzes/tests stay public (SEO + ads).
 *
 * Uses the canonical Supabase SSR cookie pattern so the session is read and
 * refreshed correctly on each request.
 */

// Areas that require an authenticated session
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/account',
  '/cart',
  '/checkout',
  '/admin',
];

// Auth pages a logged-in user shouldn't see
const AUTH_PAGES = ['/auth/login', '/auth/signup'];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Unauthenticated user trying to reach a private area -> login
  if (!user && isProtected(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated user on an auth page -> dashboard
  if (user && AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Run on all routes except API, Next internals and static assets.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)',
  ],
};
