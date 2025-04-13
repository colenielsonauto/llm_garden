import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/lib/mongodb';
// Import tracking utilities
import { trackEvent, getRequestDetails } from '@/lib/tracking';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  // Get request details early for tracking
  const requestDetails = getRequestDetails(req);
  let userId: ObjectId | null = null; // To store the new user ID for tracking

  try {
    // Destructure new fields from request body
    const { firstName, lastName, birthday, email, password } = await req.json();

    // Update validation
    if (!firstName || !lastName || !birthday || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 }); // Conflict
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user with all fields
    const result = await usersCollection.insertOne({
      firstName,
      lastName,
      email,
      birthday, // Store birthday (consider converting to Date object if needed)
      password: hashedPassword,
      createdAt: new Date(), // Add createdAt timestamp
      // Initialize other fields if necessary
      lastLoginAt: null,
      lastActiveAt: null,
      // Keep 'name' for compatibility with NextAuth User type default, or adjust type augmentation
      name: `${firstName} ${lastName}` 
    });

    userId = result.insertedId; // Capture the inserted ID

    // Track successful signup with more data if desired
    trackEvent({
        userId: userId,
        eventType: 'signup',
        eventData: { email }, // Keep email for tracking
        ...requestDetails
    });

    return NextResponse.json({ message: 'User created successfully', userId: result.insertedId }, { status: 201 });

  } catch (error) {
    console.error('[Signup API Error]:', error);
    // Track signup error
    trackEvent({
        // userId will be null here as signup failed before or during insert
        eventType: 'error',
        eventData: {
            errorType: 'SignupAPIError',
            message: error instanceof Error ? error.message : 'Unknown signup error',
            stack: error instanceof Error ? error.stack : undefined,
        },
        ...requestDetails
    });
    return NextResponse.json({ message: 'Internal server error during signup' }, { status: 500 });
  }
}

// Optional: Add a handler for other methods if needed, or Next.js will automatically return 405
export async function GET() {
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}
// Add similar handlers for PUT, DELETE, etc. if you expect them 