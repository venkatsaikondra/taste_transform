/*import { NextResponse } from 'next/server';
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

*/
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. More precise path matching
const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/api',
  '/favicon.ico',
  '/robots.txt',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 2. Immediate Bypass for Static Assets & Internal Next.js paths
  // This prevents the middleware from blocking images like your fridge video or thinking icon
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/Animations') || // Path for your fridge video
    pathname.includes('.') || 
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // 3. Allow Public Pages
  const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path));
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 4. Robust Token Check
  // We check for the token; if it's missing on a private route, we redirect.
  const token = req.cookies.get('token')?.value;

  if (!token) {
    // Prevent infinite redirect loops if the user is already on /login
    if (pathname !== '/login') {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// 5. Improved Matcher
// This ensures the middleware ignores static files entirely for better performance
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (handled inside middleware)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - All image/video extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)',
  ],
};