import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

/**
 * Next.js 16 Proxy: composes next-intl locale routing with optimistic Supabase
 * auth checks.
 *  - next-intl handles locale detection/prefixing (es = no prefix, en/pt prefixed).
 *  - Private areas redirect unauthenticated users to the localized /auth/login.
 *  - Logged-in users hitting auth pages go to the dashboard.
 *  - /api, /auth/callback and /auth/signout are excluded (locale-agnostic).
 */

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/account',
  '/cart',
  '/checkout',
  '/admin',
];
const AUTH_PAGES = ['/auth/login', '/auth/signup'];

/** Remove a leading locale segment (e.g. /en/dashboard -> /dashboard). */
function stripLocale(pathname: string): string {
  const segments = pathname.split('/');
  if (routing.locales.includes(segments[1] as (typeof routing.locales)[number])) {
    const rest = '/' + segments.slice(2).join('/');
    return rest.length > 1 ? rest.replace(/\/$/, '') : '/';
  }
  return pathname;
}

/** Build a path that keeps the current locale (as-needed: default has no prefix). */
function localizedPath(request: NextRequest, targetPath: string): string {
  const seg = request.nextUrl.pathname.split('/')[1];
  const locale = routing.locales.includes(seg as (typeof routing.locales)[number])
    ? seg
    : routing.defaultLocale;
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  return `${prefix}${targetPath}`;
}

function matches(path: string, prefixes: string[]): boolean {
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  // 1) Locale routing first
  const response = intlMiddleware(request);

  // 2) Supabase auth — read request cookies, refresh onto the intl response
  const supabase = createServerClient(
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = stripLocale(request.nextUrl.pathname);

  // Unauthenticated user trying to reach a private area -> localized login
  if (!user && matches(path, PROTECTED_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = localizedPath(request, '/auth/login');
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  // Authenticated user on an auth page -> dashboard
  if (user && matches(path, AUTH_PAGES)) {
    const url = request.nextUrl.clone();
    url.pathname = localizedPath(request, '/dashboard');
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Run on all pages except API, the locale-agnostic auth route handlers,
  // Next internals and static files.
  matcher: ['/((?!api|auth/callback|auth/signout|_next|.*\\..*).*)'],
};
