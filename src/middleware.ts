export { default } from "next-auth/middleware"

// This configuration specifies which routes the middleware should run on.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth/signup (allow signup API requests)
     * - api/auth/ [...nextauth] (allow next-auth routes)
     * - login (allow access to the login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth/signup|api/auth|login|_next/static|_next/image|favicon.ico).*)',
  ],
} 