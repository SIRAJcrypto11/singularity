import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { readDb, writeDb, addAuditLog } from '@/lib/db-server';
import { createAuthToken } from '@/lib/auth-utils';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const db = await readDb();
    const user = db.users.find((u: any) => u.email === email);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.status === 'pending') {
      return NextResponse.json({ error: 'Please verify your email before logging in.' }, { status: 403 });
    }

    if (user.status === 'suspended' || user.status === 'banned') {
      return NextResponse.json({ error: 'Your account has been suspended. Contact support.' }, { status: 403 });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Update login metadata
    user.lastLoginAt = new Date().toISOString();
    user.loginCount = (user.loginCount || 0) + 1;
    await writeDb(db);

    // Create JWT with role and tier
    const token = createAuthToken({
      id: user.id,
      email: user.email,
      role: user.role || 'user',
      tier: user.tier || 'free',
    });

    // Audit log
    await addAuditLog({
      userId: user.id,
      action: 'USER_LOGIN',
      details: `${email} logged in`,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName || email.split('@')[0],
        role: user.role || 'user',
        tier: user.tier || 'free',
        subscription: user.subscription || { tier: 'free', startDate: user.createdAt, endDate: null, autoRenew: false },
      }
    });

    // Set cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (error) {
    console.error("Login Error", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
