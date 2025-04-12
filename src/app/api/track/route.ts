import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Use exported options
import { trackEvent, getRequestDetails, getUserIdFromSession } from '@/lib/tracking';
import { Session } from 'next-auth'; // Import Session type

/**
 * API route to handle tracking events sent from the frontend.
 */
export async function POST(req: NextRequest) {
  try {
    // Get session on the server-side to securely get the user ID
    const session: Session | null = await getServerSession(authOptions);
    const userId = getUserIdFromSession(session);

    // Get request details (IP, UserAgent)
    const requestDetails = getRequestDetails(req);

    // Get event data from the request body
    const { eventType, eventData } = await req.json();

    if (!eventType) {
      return NextResponse.json({ message: 'Missing eventType' }, { status: 400 });
    }

    // Call the actual tracking function
    await trackEvent({
      userId,
      eventType,
      eventData,
      ...requestDetails
    });

    // Respond with success (fire-and-forget on frontend, but good practice to respond)
    return NextResponse.json({ message: 'Event tracked' }, { status: 200 });

  } catch (error) {
    console.error('[API Track Error] Failed to handle tracking request:', error);
    // Don't track errors from the tracking endpoint itself to avoid loops
    return NextResponse.json({ message: 'Failed to track event' }, { status: 500 });
  }
} 