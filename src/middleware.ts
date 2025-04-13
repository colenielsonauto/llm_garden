import { withAuth, NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
// Remove unused NextRequest import
// import type { NextRequest } from 'next/server';
// Remove tracking imports
// import { trackEvent, getRequestDetails, getUserIdFromSession } from '@/lib/tracking';

// Use withAuth to get session info within the middleware
export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(request: NextRequestWithAuth) {
    // console.log(request.nextUrl.pathname)
    // console.log(request.nextauth.token)

    const { pathname } = request.nextUrl;
    const token = request.nextauth.token;

    // If user is logged in and tries to access /login, redirect to /chat
    if (pathname.startsWith('/login') && token) {
      return NextResponse.redirect(new URL('/chat', request.url));
    }

    // --- Add other protected route logic here if needed --- 
    // Example: Protect a hypothetical /settings page
    // if (pathname.startsWith('/settings') && !token) {
    //   return NextResponse.redirect(new URL('/login?callbackUrl=' + pathname, request.url));
    // }

    // Allow the request to proceed for all other cases 
    // (including unauthenticated access to '/' and '/chat')
    return NextResponse.next(); 
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // This callback is used by `withAuth` to determine if the basic
        // authentication check passes. We return true to always run the middleware function,
        // allowing us to handle redirects and public pages within the function itself.
        return true; 
      },
    },
    // Specify login page if needed for default redirection (though handled in middleware now)
    // pages: {
    //   signIn: '/login',
    // }
  }
);

// This config handles which routes are protected by requiring authentication
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public image files if you have an /images folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)', // Keep existing matcher
    '/login', // Ensure /login is explicitly included if needed for the redirect logic
    // Add other specific routes here if the general matcher doesn't cover them
    // '/chat', // Included by the general matcher
  ],
}; 