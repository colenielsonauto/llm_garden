import NextAuth from 'next-auth';
// Import the shared authOptions
import { authOptions } from '@/lib/authOptions';

// Initialize NextAuth with the shared options
const handler = NextAuth(authOptions);

// Export the handlers as required by Next.js API routes
export { handler as GET, handler as POST }; 