import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { ensureDb, readDb, writeDb, addAuditLog } from '@/lib/db-server';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    await ensureDb();
    const { email, password, displayName } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
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
    
    // First user = owner, rest = user with free tier
    const isFirstUser = users.length === 0;
    
    const newUser = {
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      displayName: displayName || email.split('@')[0],
      status: 'pending' as const,
      verificationToken,
      
      // RBAC fields
      role: isFirstUser ? 'owner' : 'user' as const,
      tier: isFirstUser ? 'enterprise' : 'free' as const,
      
      // Subscription
      subscription: {
        tier: isFirstUser ? 'enterprise' : 'free',
        startDate: new Date().toISOString(),
        endDate: null,
        autoRenew: false,
      },
      
      // Metadata
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      loginCount: 0,
    };

    if (!db.users) db.users = [];
    db.users.push(newUser);
    await writeDb(db);

    // Audit log
    await addAuditLog({
      userId: newUser.id,
      action: 'USER_REGISTERED',
      details: `${email} registered as ${newUser.role} (${newUser.tier})`,
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailErr) {
      console.error("Failed to send verification email", emailErr);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Account created. Please check your email for verification.',
      isOwner: isFirstUser,
    });

  } catch (error) {
    console.error("Register Error", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
