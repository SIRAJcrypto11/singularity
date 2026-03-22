import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { ensureDb, readDb, writeDb } from '@/lib/db-server';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    await ensureDb();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const db = await readDb();
    const users = db.users || [];

    // Check if user exists
    if (users.find((u: any) => u.email === email)) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    const newUser = {
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      status: 'pending',
      verificationToken,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    await writeDb(db);

    // Send email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailErr) {
      console.error("Failed to send verification email", emailErr);
      // We still return success for user creation, but note the email failure in logs
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Account created. Please check your email for verification.' 
    });

  } catch (error) {
    console.error("Register Error", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
