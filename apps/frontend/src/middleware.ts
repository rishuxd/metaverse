import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/login', '/signup'];

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/space'];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Get token from cookie (we'll set this on login)
  const token = request.cookies.get('token')?.value;

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const redirectUrl = new URL('/login', request.url);
    // Preserve the original URL to redirect back after login
    redirectUrl.searchParams.set('redirect', pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''));
    return NextResponse.redirect(redirectUrl);
  }

  // If logged in and trying to access login/signup, redirect to dashboard
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which routes should trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
