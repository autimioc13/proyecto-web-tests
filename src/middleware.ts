import { type NextRequest, NextResponse } from 'next/server';

/**
 * Middleware for protecting admin and other sensitive routes
 * Validates authentication before allowing access
 */
export async function middleware(request: NextRequest) {
  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Get session from cookies (Supabase sets auth token here)
    const token = request.cookies.get('sb-auth-token')?.value;

    if (!token) {
      // No authentication token found, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Token exists - Supabase session middleware will validate it
    // Additional role-based checks happen client-side via AuthContext
  }

  // Allow protected checkout/cart/profile routes with auth checks
  if (
    request.nextUrl.pathname.startsWith('/checkout') ||
    request.nextUrl.pathname.startsWith('/cart') ||
    request.nextUrl.pathname.startsWith('/profile')
  ) {
    const token = request.cookies.get('sb-auth-token')?.value;

    if (!token) {
      // No session, redirect to login with return URL
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

/**
 * Matcher configuration
 * Specifies which routes should be protected by this middleware
 */
export const config = {
  matcher: [
    '/admin/:path*',
    '/checkout/:path*',
    '/cart/:path*',
    '/profile/:path*',
  ],
};
