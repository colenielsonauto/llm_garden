import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest } from 'next/server'; // Keep this for App Router API routes
import { NextApiRequest } from 'next'; // Import this for Pages Router / certain callbacks
import { Session } from 'next-auth'; // Import Session type

const EVENTS_COLLECTION = 'events'; // Collection name

interface EventData {
  [key: string]: any; // Allow flexible data structure
}

export interface EventInput {
  userId?: string | ObjectId | null;
  eventType: string;
  eventData?: EventData;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Tracks an event by inserting it into the MongoDB events collection.
 */
export async function trackEvent(event: EventInput): Promise<void> {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(EVENTS_COLLECTION);

    const eventDocument = {
      ...event,
      timestamp: new Date(), // Add server-side timestamp
    };

    // Convert userId to ObjectId if it's a string that looks like one
    if (typeof eventDocument.userId === 'string' && ObjectId.isValid(eventDocument.userId)) {
      try {
          eventDocument.userId = new ObjectId(eventDocument.userId);
      } catch (e) {
          console.warn(`Failed to convert userId string to ObjectId: ${eventDocument.userId}`, e);
          // Proceed with the string ID if conversion fails
      }
    }

    const result = await collection.insertOne(eventDocument);
    // console.log('Event tracked:', result.insertedId);

  } catch (error) {
    console.error('[trackEvent Error] Failed to track event:', error, 'Event Details:', event);
    // Decide if you want to re-throw or just log the error
    // Depending on importance, you might want tracking failures not to break main flows
  }
}

/**
 * Helper function to extract common request details for tracking from NextRequest (API Routes, Middleware).
 */
export function getRequestDetails(req: NextRequest): {
  ipAddress: string | null;
  userAgent: string | null;
} {
  // Use x-forwarded-for header primarily
  const ipAddress = req.headers.get('x-forwarded-for') ?? null;
  const userAgent = req.headers.get('user-agent') ?? null;
  return { ipAddress, userAgent };
}

/**
 * Helper function to extract common request details for tracking from NextApiRequest (Older Pages API, some callbacks).
 */
export function getApiRequestDetails(req: NextApiRequest): {
  ipAddress: string | null;
  userAgent: string | null;
} {
  const ipAddress = (req.headers['x-forwarded-for'] as string | undefined) ?? null;
  const userAgent = (req.headers['user-agent'] as string | undefined) ?? null;
  return { ipAddress, userAgent };
}

/**
 * Helper function to get the user ID from the NextAuth session.
 */
export function getUserIdFromSession(session: Session | null): string | null {
  // Adjust based on how user ID is stored in your session (check next-auth.d.ts augmentation)
  return session?.user?.id ?? null;
} 