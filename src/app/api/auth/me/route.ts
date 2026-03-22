import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { readDb } from '@/lib/db-server';

const JWT_SECRET = process.env.JWT_SECRET || 'singularity_v7_fallback_secret_key';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('cookie')
      ?.split('; ')
      .find(c => c.startsWith('auth_token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const db = await readDb();
    const user = db.users.find((u: any) => u.id === decoded.userId);

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: { id: user.id, email: user.email }
    });

  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
