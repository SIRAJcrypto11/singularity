// ============================================
// LogFi — Server-Side Auth Utilities
// Extracts user from JWT, enforces roles
// ============================================

import jwt from 'jsonwebtoken';
import { readDb } from './db-server';
import type { UserRole, SubscriptionTier } from './permissions';

const JWT_SECRET = process.env.JWT_SECRET || 'singularity_v7_fallback_secret_key';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  tier: SubscriptionTier;
}

/**
 * Extract and verify user from the auth_token cookie.
 * Returns null if not authenticated.
 */
export function getUserFromRequest(req: Request): JWTPayload | null {
  try {
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) return null;

    const token = cookieHeader
      .split('; ')
      .find(c => c.startsWith('auth_token='))
      ?.split('=')[1];

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Get full user record from DB by userId.
 */
export async function getFullUser(userId: string) {
  const db = await readDb();
  return db.users.find((u: any) => u.id === userId) || null;
}

/**
 * Require a specific role. Returns error response or null if authorized.
 */
export function requireRole(
  user: JWTPayload | null,
  allowedRoles: UserRole[]
): { authorized: false; error: string } | { authorized: true } {
  if (!user) {
    return { authorized: false, error: 'Not authenticated' };
  }
  // Owner always has access
  if (user.role === 'owner') {
    return { authorized: true };
  }
  if (!allowedRoles.includes(user.role)) {
    return { authorized: false, error: 'Insufficient permissions' };
  }
  return { authorized: true };
}

/**
 * Create a JWT token with role and tier info.
 */
export function createAuthToken(user: {
  id: string;
  email: string;
  role: UserRole;
  tier: SubscriptionTier;
}): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      tier: user.tier,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
