import { NextResponse } from 'next/server';
import { addAuditLog } from '@/lib/db-server';
import { getUserFromRequest } from '@/lib/auth-utils';

export async function POST(req: Request) {
  try {
    const jwtUser = getUserFromRequest(req);
    
    if (jwtUser) {
      await addAuditLog({
        userId: jwtUser.userId,
        action: 'USER_LOGOUT',
        details: `${jwtUser.email} logged out`,
      });
    }

    const response = NextResponse.json({ success: true });
    
    // Clear auth cookie
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout Error", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
