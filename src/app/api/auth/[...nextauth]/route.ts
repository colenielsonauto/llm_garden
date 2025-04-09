import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import clientPromise from '../../../../../lib/mongodb'; // Adjust path as needed
import { MongoDBAdapter } from "@auth/mongodb-adapter" // Use the adapter

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        const client = await clientPromise;
        const db = client.db(); // Use your default DB name if not specified in MONGO_URI
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email: credentials.email });

        if (!user) {
          console.log('No user found with email:', credentials.email);
          return null;
        }

        // Validate password
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          console.log('Invalid password for user:', credentials.email);
          return null;
        }

        console.log('Credentials valid for user:', credentials.email);
        // Return user object that NextAuth expects
        // Ensure _id is converted to string for the id field
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          // Add any other user properties you want in the session/token
        };
      }
    })
    // ...add more providers here if needed (e.g., Google, GitHub)
  ],
  adapter: MongoDBAdapter(clientPromise), // Add the adapter here
  session: {
    // Use JSON Web Tokens for session management
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login', // Redirect users to '/login' when authentication is required
    // error: '/auth/error', // Optional: Error code passed in query string as ?error=
    // signOut: '/auth/signout', // Optional: Redirect users here after sign out
    // verifyRequest: '/auth/verify-request', // Optional: Used for check email message
    // newUser: null // Optional: New users will be directed here first
  },
  // Optional callbacks for customizing behavior
  callbacks: {
    async jwt({ token, user }) {
      // Persist the user id and name to the token right after signin
      if (user) {
        token.id = user.id;
        token.name = user.name; // Add name if you need it in the session object
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from the token.
      if (session.user) {
         // Ensure session.user.id exists and is typed correctly if needed client-side
        (session.user as any).id = token.id;
        // If you added name to the jwt callback, you can add it here too
        session.user.name = token.name as string;
      }
      return session;
    },
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 