import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import clientPromise from '../../../../../lib/mongodb'; // Corrected relative path

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing name, email, or password' }, { status: 400 });
    }

    // TODO: Add email format validation
    // TODO: Add more robust password validation

    const client = await clientPromise;
    const db = client.db(); // Use default DB
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists with this email' }, { status: 409 });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    if (!result.insertedId) {
        throw new Error('Failed to create user.');
    }

    // Return success response (don't send back password hash)
    const newUser = {
      _id: result.insertedId,
      name,
      email,
      createdAt: new Date(),
    };

    return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 201 });

  } catch (error) {
    console.error('Signup API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// Optional: Add a handler for other methods if needed, or Next.js will automatically return 405
export async function GET() {
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}
// Add similar handlers for PUT, DELETE, etc. if you expect them 