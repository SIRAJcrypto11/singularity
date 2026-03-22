import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/app');
  const isLandingRoute = request.nextUrl.pathname === '/';

  // If trying to access protected route without token -> redirect to /auth
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // If accessing /auth WITH token -> redirect to /app
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  // If accessing / WITH token -> redirect to /app
  if (isLandingRoute && token) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/app/:path*', '/auth/:path*'],
};
