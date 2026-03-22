import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db-server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const db = await readDb();
    const userIndex = db.users.findIndex((u: any) => u.verificationToken === token);

    if (userIndex === -1) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // Activate user
    db.users[userIndex].status = 'active';
    delete db.users[userIndex].verificationToken;
    
    await writeDb(db);

    // Prepare redirect or simple success HTML
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?auth=login`;
    
    return new NextResponse(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #6d28d9;">Akun Terverifikasi!</h1>
        <p>Selamat! Akun LogFi Anda telah aktif.</p>
        <p>Silakan kembali ke aplikasi untuk masuk.</p>
        <a href="${loginUrl}" style="display: inline-block; margin-top: 20px; background: #6d28d9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Masuk Sekarang</a>
      </div>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    console.error("Verify Error", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
