// ============================================
// LogFi — Permission Configuration
// Central source of truth for role/tier access
// ============================================

export type UserRole = 'owner' | 'admin_transaction' | 'admin_manager' | 'user';
export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  tier: SubscriptionTier;
  displayName?: string;
  status: 'pending' | 'active' | 'suspended' | 'banned';
  subscription: {
    tier: SubscriptionTier;
    startDate: string;
    endDate: string | null;
    autoRenew: boolean;
  };
  createdAt: string;
  lastLoginAt?: string;
  loginCount: number;
}

// Tier hierarchy (higher index = higher tier)
const TIER_HIERARCHY: SubscriptionTier[] = ['free', 'starter', 'pro', 'business', 'enterprise'];

export function hasTierAccess(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  return TIER_HIERARCHY.indexOf(userTier) >= TIER_HIERARCHY.indexOf(requiredTier);
}

export function hasRoleAccess(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  // Owner always has access to everything
  if (userRole === 'owner') return true;
  return allowedRoles.includes(userRole);
}

// ============================================
// FEATURE PERMISSIONS MAP
// ============================================

export interface FeaturePermission {
  roles: UserRole[];      // Which roles can access (owner always can)
  minTier?: SubscriptionTier; // Minimum tier for 'user' role
  label: string;
}

export const FEATURE_PERMISSIONS: Record<string, FeaturePermission> = {
  // User features (everyone)
  'dashboard':       { roles: ['owner', 'admin_transaction', 'admin_manager', 'user'], label: 'Dashboard' },
  'tasks':           { roles: ['owner', 'admin_transaction', 'admin_manager', 'user'], label: 'Task Sentinel' },
  'finance':         { roles: ['owner', 'admin_transaction', 'admin_manager', 'user'], label: 'Smart Ledger' },
  'daily-log':       { roles: ['owner', 'admin_transaction', 'admin_manager', 'user'], label: 'Daily Reflections' },
  'reports-basic':   { roles: ['owner', 'admin_transaction', 'admin_manager', 'user'], label: 'Laporan Dasar' },
  
  // Tier-gated features
  'habit-tracker':   { roles: ['owner', 'admin_transaction', 'admin_manager', 'user'], minTier: 'pro', label: 'Habit Engine' },
  'reports-export':  { roles: ['owner', 'admin_transaction', 'admin_manager', 'user'], minTier: 'starter', label: 'Export PDF/Excel' },
  'ai-parser-plus':  { roles: ['owner', 'admin_transaction', 'admin_manager', 'user'], minTier: 'business', label: 'AI Smart Parser+' },
  
  // Admin Transaction features
  'admin-all-tx':         { roles: ['owner', 'admin_transaction'], label: 'Semua Transaksi User' },
  'admin-approval':       { roles: ['owner', 'admin_transaction'], label: 'Approval Queue' },
  'admin-global-reports': { roles: ['owner', 'admin_transaction'], label: 'Laporan Global' },
  'admin-bulk-ops':       { roles: ['owner', 'admin_transaction'], label: 'Operasi Massal' },
  
  // Admin Manager features
  'admin-users':          { roles: ['owner', 'admin_manager'], label: 'Manajemen User' },
  'admin-subscriptions':  { roles: ['owner', 'admin_manager'], label: 'Langganan' },
  'admin-announcements':  { roles: ['owner', 'admin_manager'], label: 'Pengumuman' },
  'admin-support':        { roles: ['owner', 'admin_manager'], label: 'Support Tickets' },
  
  // Owner-only features
  'owner-settings':       { roles: ['owner'], label: 'System Settings' },
  'owner-roles':          { roles: ['owner'], label: 'Role Assignment' },
  'owner-database':       { roles: ['owner'], label: 'Database' },
  'owner-revenue':        { roles: ['owner'], label: 'Revenue Dashboard' },
  'owner-audit':          { roles: ['owner'], label: 'Audit Log' },
  'owner-broadcast':      { roles: ['owner'], label: 'Email Broadcast' },
};

// Check if a user can access a feature
export function canAccessFeature(
  role: UserRole,
  tier: SubscriptionTier,
  featureKey: string
): boolean {
  const perm = FEATURE_PERMISSIONS[featureKey];
  if (!perm) return false;
  
  // Owner bypass — always has access
  if (role === 'owner') return true;
  
  // Check role
  if (!perm.roles.includes(role)) return false;
  
  // Check tier (only applies to 'user' role)
  if (role === 'user' && perm.minTier) {
    return hasTierAccess(tier, perm.minTier);
  }
  
  return true;
}

// Check if a feature is locked specifically because of TIER (role has access)
export function isFeatureTierLocked(
  role: UserRole,
  tier: SubscriptionTier,
  featureKey: string
): boolean {
  const perm = FEATURE_PERMISSIONS[featureKey];
  if (!perm) return false;
  
  if (role === 'owner') return false;
  if (!perm.roles.includes(role)) return false; // Not a tier lock, it's a role lock
  
  if (role === 'user' && perm.minTier) {
    return !hasTierAccess(tier, perm.minTier);
  }
  return false;
}

// ============================================
// SIDEBAR MENU SECTIONS
// ============================================

export interface SidebarSection {
  id: string;
  label: string;
  color: string;
  items: SidebarItem[];
  requiredRoles: UserRole[]; // Which roles see this section
}

export interface SidebarItem {
  view: string;
  label: string;
  featureKey: string;
  icon: string; // lucide icon name
  color?: string;
  badgeKey?: string;
}

export const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    id: 'tasks',
    label: 'Task Sentinel',
    color: 'violet',
    requiredRoles: ['owner', 'admin_transaction', 'admin_manager', 'user'],
    items: [
      { view: 'tasks:my-day', label: 'My Day', featureKey: 'tasks', icon: 'Sun', badgeKey: 'myDayCount' },
      { view: 'tasks:next-7', label: 'Next 7 Days', featureKey: 'tasks', icon: 'CalendarDays' },
      { view: 'tasks:all', label: 'All Tasks', featureKey: 'tasks', icon: 'ListTodo', badgeKey: 'pendingCount' },
      { view: 'tasks:completed', label: 'Completed', featureKey: 'tasks', icon: 'CheckCircle2', badgeKey: 'completedCount' },
      { view: 'habits', label: 'Habit Tracker', featureKey: 'habit-tracker', icon: 'Zap', color: 'text-amber-400', badgeKey: 'habitCount' },
    ],
  },
  {
    id: 'vault',
    label: 'The Vault (ERP)',
    color: 'emerald',
    requiredRoles: ['owner', 'admin_transaction', 'admin_manager', 'user'],
    items: [
      { view: 'fin-dash', label: 'Dashboard', featureKey: 'finance', icon: 'BarChart3', color: 'text-emerald-400' },
      { view: 'fin-journal', label: 'Pencatatan', featureKey: 'finance', icon: 'Receipt' },
      { view: 'fin-accounts', label: 'Rekening', featureKey: 'finance', icon: 'Landmark' },
      { view: 'fin-categories', label: 'Kategori', featureKey: 'finance', icon: 'Tag', badgeKey: 'categoryCount' },
      { view: 'fin-reports', label: 'Laporan', featureKey: 'reports-basic', icon: 'FileText' },
      { view: 'fin-debts', label: 'Piutang & Hutang', featureKey: 'finance', icon: 'Users' },
    ],
  },
  {
    id: 'admin-tx',
    label: 'Admin Transaksi',
    color: 'amber',
    requiredRoles: ['owner', 'admin_transaction'],
    items: [
      { view: 'admin-all-tx', label: 'Semua Transaksi', featureKey: 'admin-all-tx', icon: 'Receipt', color: 'text-amber-400' },
      { view: 'admin-approval', label: 'Approval Queue', featureKey: 'admin-approval', icon: 'CheckCircle2' },
      { view: 'admin-global-reports', label: 'Laporan Global', featureKey: 'admin-global-reports', icon: 'BarChart3' },
      { view: 'admin-bulk-ops', label: 'Operasi Massal', featureKey: 'admin-bulk-ops', icon: 'Layers' },
    ],
  },
  {
    id: 'admin-mgr',
    label: 'Admin Manager',
    color: 'blue',
    requiredRoles: ['owner', 'admin_manager'],
    items: [
      { view: 'admin-users', label: 'Manajemen User', featureKey: 'admin-users', icon: 'Users', color: 'text-blue-400' },
      { view: 'admin-subscriptions', label: 'Langganan', featureKey: 'admin-subscriptions', icon: 'DollarSign' },
      { view: 'admin-announcements', label: 'Pengumuman', featureKey: 'admin-announcements', icon: 'FileText' },
      { view: 'admin-support', label: 'Support Tickets', featureKey: 'admin-support', icon: 'Hash' },
    ],
  },
  {
    id: 'owner',
    label: 'Owner',
    color: 'rose',
    requiredRoles: ['owner'],
    items: [
      { view: 'owner-settings', label: 'System Settings', featureKey: 'owner-settings', icon: 'Hash', color: 'text-rose-400' },
      { view: 'owner-roles', label: 'Role Assignment', featureKey: 'owner-roles', icon: 'Users' },
      { view: 'owner-database', label: 'Database', featureKey: 'owner-database', icon: 'Landmark' },
      { view: 'owner-revenue', label: 'Revenue', featureKey: 'owner-revenue', icon: 'DollarSign' },
      { view: 'owner-audit', label: 'Audit Log', featureKey: 'owner-audit', icon: 'FileText' },
      { view: 'owner-broadcast', label: 'Email Broadcast', featureKey: 'owner-broadcast', icon: 'Zap' },
    ],
  },
];

// Get tier display info
export const TIER_INFO: Record<SubscriptionTier, { label: string; color: string; price: string }> = {
  free:       { label: 'Free', color: 'zinc', price: 'Rp 0' },
  starter:    { label: 'Starter', color: 'blue', price: 'Rp 29.000/bln' },
  pro:        { label: 'Pro', color: 'violet', price: 'Rp 49.000/bln' },
  business:   { label: 'Business', color: 'emerald', price: 'Rp 99.000/bln' },
  enterprise: { label: 'Enterprise', color: 'amber', price: 'Rp 199.000/bln' },
};

// Get role display info
export const ROLE_INFO: Record<UserRole, { label: string; color: string }> = {
  owner:             { label: 'Owner', color: 'rose' },
  admin_transaction: { label: 'Admin Transaksi', color: 'amber' },
  admin_manager:     { label: 'Admin Manager', color: 'blue' },
  user:              { label: 'User', color: 'zinc' },
};

// Account limits by tier
export const TIER_LIMITS: Record<SubscriptionTier, { maxAccounts: number; maxTxPerMonth: number; }> = {
  free:       { maxAccounts: 3, maxTxPerMonth: 100 },
  starter:    { maxAccounts: 5, maxTxPerMonth: 500 },
  pro:        { maxAccounts: 10, maxTxPerMonth: 999999 },
  business:   { maxAccounts: 999999, maxTxPerMonth: 999999 },
  enterprise: { maxAccounts: 999999, maxTxPerMonth: 999999 },
};
