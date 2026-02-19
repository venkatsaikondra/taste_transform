import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/api',
  '/api/',
  '/api/users',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public assets and API routes
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow direct file requests (contains a dot) e.g., .js .css .png
  if (pathname.includes('.')) return NextResponse.next();

  // Check for presence of auth cookie `token`
  const token = req.cookies.get('token')?.value ?? null;
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/image|_next/static|favicon.ico).*)',
};
