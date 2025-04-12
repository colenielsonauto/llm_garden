import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth, NextRequestWithAuth } from 'next-auth/middleware';
import { trackEvent, getRequestDetails, getUserIdFromSession } from '@/lib/tracking';

// Use withAuth to get session info within the middleware
export default withAuth(
  async function middleware(request: NextRequestWithAuth) {
    const { pathname } = request.nextUrl;
    const session = request.nextauth?.token; // Access token which contains user id based on our callbacks
    const userId = session?.id as string | null; // Extract userId from token
    const { ipAddress, userAgent } = getRequestDetails(request);

    // Track page view
    // Avoid tracking static files, image optimization, etc.
    if (!pathname.startsWith('/_next') && !pathname.startsWith('/favicon.ico') && !pathname.startsWith('/api')) {
       trackEvent({
         userId,
         eventType: 'page_view',
         eventData: { path: pathname },
         ipAddress,
         userAgent,
       });
    }

    // Continue with the request/response
    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true to always run middleware, protection is handled by config matcher
      authorized: () => true,
    },
    // Redirect to login if token is missing, matching default behavior
    // pages: { 
    //   signIn: '/login' 
    // }
  }
);

// This config handles which routes are protected by requiring authentication
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - /api/auth/ (ANY auth API routes including callbacks)
     * - /login (the login page)
     * - /terms (the terms page)
     * - /privacy (the privacy policy page)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - favicon.ico (favicon file)
     * // Removed /api/chat and / from exclusion - protection should apply
     */
    '/((?!api/auth/|login|terms|privacy|_next/static|_next/image|favicon.ico).*)', 
  ],
}; 