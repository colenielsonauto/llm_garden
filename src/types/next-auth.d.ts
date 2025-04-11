import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// Augment the JWT type
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string; 
    // Add other token properties if needed, e.g., name
    name?: string | null;
  }
}

// Augment the Session type
declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
    } & DefaultSession["user"]; // Merge with default user properties (name, email, image)
  }

  // Optional: Augment the User type if needed for the authorize callback
  // interface User extends DefaultUser {
  //   // Add any custom fields returned by authorize callback beyond id, name, email, image
  // }
} 