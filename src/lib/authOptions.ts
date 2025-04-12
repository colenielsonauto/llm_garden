import { NextAuthOptions, User, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/lib/mongodb'; 
import { MongoClient } from 'mongodb'; 
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { trackEvent, getApiRequestDetails } from '@/lib/tracking'; 
import { NextApiRequest } from 'next'; 
import { NextRequest } from 'next/server'; // Needed for getRequestDetails type checking if used via req
import { ObjectId } from 'mongodb';

// Function to get the MongoClient promise for the adapter
const getClientPromise = (): Promise<MongoClient> => {
  return connectToDatabase().then(({ client }) => client);
};

// Define and export authOptions here
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req): Promise<User | null> { 
        // Use the specific helper for NextApiRequest
        // Note: Casting req might be needed if NextAuth passes a different type internally
        const { ipAddress, userAgent } = getApiRequestDetails(req as NextApiRequest); 
        
        if (!credentials?.email || !credentials?.password) {
            trackEvent({
                eventType: 'failedLogin',
                eventData: { reason: 'Missing credentials', email: credentials?.email },
                ipAddress,
                userAgent
            });
            return null;
        }
        
        const { db } = await connectToDatabase(); 
        const usersCollection = db.collection('users');
        
        const user = await usersCollection.findOne({ email: credentials.email });

        if (!user || !user.password) {
            trackEvent({
                eventType: 'failedLogin',
                eventData: { reason: 'User not found', email: credentials.email },
                ipAddress,
                userAgent
            });
            return null;
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) {
            trackEvent({
                userId: user._id, 
                eventType: 'failedLogin',
                eventData: { reason: 'Invalid password', email: credentials.email },
                ipAddress,
                userAgent
            });
            return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      }
    })
  ],
  adapter: MongoDBAdapter(getClientPromise(), { databaseName: 'gardendb'}), 
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  events: {
      async signIn({ user, account, isNewUser }) {
          trackEvent({
              userId: user.id,
              eventType: 'login',
              eventData: { method: account?.provider ?? 'credentials', isNewUser: !!isNewUser },
          });
          try {
              const { db } = await connectToDatabase();
              await db.collection('users').updateOne(
                  { _id: new ObjectId(user.id) }, 
                  { $set: { lastLoginAt: new Date(), lastActiveAt: new Date() } }
              );
          } catch (e) {
              console.error('[Auth Event Error] Failed to update lastLoginAt/lastActiveAt:', e);
          }
      },
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  }
}; 