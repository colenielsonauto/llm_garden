import { NextResponse } from 'next/server';
// Remove unused NextRequest import
// import type { NextRequest } from 'next/server';
import { withAuth, NextRequestWithAuth } from 'next-auth/middleware';
// Remove tracking imports
// import { trackEvent, getRequestDetails, getUserIdFromSession } from '@/lib/tracking';

// Use withAuth to get session info within the middleware
export default withAuth(
  async function middleware() {
    // Remove tracking logic
    // const { pathname } = request.nextUrl;
    // const session = request.nextauth?.token; 
    // const userId = session?.id as string | null; 
    // const { ipAddress, userAgent } = getRequestDetails(request);
    // 
    // if (!pathname.startsWith('/_next') && !pathname.startsWith('/favicon.ico') && !pathname.startsWith('/api')) {
    //    trackEvent({
    //      userId,
    //      eventType: 'page_view',
    //      eventData: { path: pathname },
    //      ipAddress,
    //      userAgent,
    //    });
    // }

    // Just continue with the request/response - auth handled by withAuth & config
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Run middleware always, protection via config
    },
    // pages: { signIn: '/login' } // Default redirect handled
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