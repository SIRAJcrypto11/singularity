import { NextResponse } from 'next/server';
import { getUserFromRequest, getFullUser } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    const jwtUser = getUserFromRequest(req);

    if (!jwtUser) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Get fresh user data from DB (role/tier might have changed)
    const user = await getFullUser(jwtUser.userId);

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    if (user.status === 'suspended' || user.status === 'banned') {
      return NextResponse.json({ authenticated: false, error: 'Account suspended' }, { status: 403 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        role: user.role || 'user',
        tier: user.tier || 'free',
        subscription: user.subscription || { tier: 'free', startDate: user.createdAt, endDate: null, autoRenew: false },
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount || 0,
      }
    });

  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
