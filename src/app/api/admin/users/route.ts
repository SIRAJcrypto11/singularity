import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-utils';
import { readDb, writeDb, addAuditLog } from '@/lib/db-server';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only Owner and Admin Manager can view all users
    if (user.role !== 'owner' && user.role !== 'admin_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q')?.toLowerCase() || '';

    const db = await readDb();

    // Transform db.users map into an array, stripping sensitive data like passwords
    let allUsers = Object.values(db.users || {}).map((u: any) => {
      const { password, ...safeUser } = u;
      return safeUser;
    });

    if (search) {
      allUsers = allUsers.filter(u => 
        u.email.toLowerCase().includes(search) || 
        (u.displayName && u.displayName.toLowerCase().includes(search))
      );
    }

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getUserFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, role, tier, status } = await request.json();
    
    const db = await readDb();
    
    if (!userId || !db.users || !db.users[userId]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const targetUser = db.users[userId];
    let updates: string[] = [];

    // 1. Role Update (Only Owner)
    if (role && role !== targetUser.role) {
      if (admin.role !== 'owner') {
        return NextResponse.json({ error: 'Only owners can change roles' }, { status: 403 });
      }
      // Prevent owner from demoting themselves if they are the last owner (Optional protective mechanism)
      const ownerCount = Object.values(db.users || {}).filter((u: any) => u.role === 'owner').length;
      if (targetUser.role === 'owner' && ownerCount <= 1 && role !== 'owner') {
        return NextResponse.json({ error: 'Cannot demote the last owner' }, { status: 400 });
      }

      targetUser.role = role;
      updates.push(`Role changed to ${role}`);
    }

    // 2. Tier/Subscription Update (Owner or Admin Manager)
    if (tier && tier !== targetUser.tier) {
      if (admin.role !== 'owner' && admin.role !== 'admin_manager') {
        return NextResponse.json({ error: 'Forbidden to change subscriptions' }, { status: 403 });
      }
      targetUser.tier = tier;
      updates.push(`Tier upgraded to ${tier}`);
    }

    // 3. Status Update (Owner or Admin Manager)
    if (status && status !== targetUser.status) {
      if (admin.role !== 'owner' && admin.role !== 'admin_manager') {
        return NextResponse.json({ error: 'Forbidden to change account status' }, { status: 403 });
      }
      targetUser.status = status;
      updates.push(`Status changed to ${status}`);
    }

    if (updates.length > 0) {
      db.users[userId] = targetUser;
      await writeDb(db);
      await addAuditLog({
        userId: (admin as any).userId || (admin as any).email,
        action: 'user_updated',
        details: JSON.stringify({ targetId: targetUser.id, updates })
      });
    }

    const { password, ...safeUser } = targetUser;
    return NextResponse.json(safeUser);

  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
