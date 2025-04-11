export { default } from "next-auth/middleware"

// This configuration specifies which routes the middleware should run on.
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
     * - /api/chat (Allow chat API, remove if it should be protected)
     * - / (Allow root path, adjust if needed)
     */
    '/((?!api/auth/|login|terms|privacy|_next/static|_next/image|favicon.ico|api/chat|$).*)',
  ],
} 