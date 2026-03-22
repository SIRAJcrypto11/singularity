import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export const DB_PATH = path.join(os.homedir(), '.logfi_db.json');

const DEFAULT_USER_DATA = {
  tasks: [],
  finance: {
    transactions: [],
    accounts: [
      { id: 'acc-main', name: 'Main Wallet', balance: 0, type: 'wallet', color: 'violet' }
    ],
    categories: [
      { id: 'cat-inc-1', name: 'Penjualan', type: 'income', color: 'emerald', keywords: ['penjualan','jual','sales'] },
      { id: 'cat-inc-2', name: 'Gaji', type: 'income', color: 'blue', keywords: ['gaji','salary','upah'] },
      { id: 'cat-inc-3', name: 'Pemasukan Lain', type: 'income', color: 'cyan', keywords: ['masuk','pemasukan','terima'] },
      { id: 'cat-exp-1', name: 'Makan', type: 'expense', color: 'rose', keywords: ['makan','makanan','food','sahur','buka'] },
      { id: 'cat-exp-2', name: 'Transport', type: 'expense', color: 'amber', keywords: ['transport','bensin','grab','gojek','ojek','parkir'] },
      { id: 'cat-exp-3', name: 'Belanja', type: 'expense', color: 'pink', keywords: ['beli','belanja','buat','bayar'] },
      { id: 'cat-exp-4', name: 'Tagihan', type: 'expense', color: 'orange', keywords: ['tagihan','listrik','wifi','token','pulsa','internet'] },
      { id: 'cat-exp-5', name: 'Hiburan', type: 'expense', color: 'violet', keywords: ['hiburan','nonton','game','langganan'] }
    ],
    debts: [],
    customLists: ['Personal', 'Work']
  },
  habits: [],
  dailyLogs: []
};

export async function readDb() {
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function writeDb(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

export async function ensureDb() {
  try {
    const exists = await fs.access(DB_PATH).then(() => true).catch(() => false);
    if (!exists) {
      const initialData = {
        users: [],
        userData: {},
        systemData: {
          announcements: [],
          auditLog: [],
          supportTickets: [],
          globalSettings: {
            appName: 'LogFi',
            maintenanceMode: false,
          }
        }
      };
      await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2));
    } else {
      // Migration: ensure new fields exist in old DB
      const db = await readDb();
      let needsWrite = false;
      
      if (!db.userData) {
        db.userData = {};
        needsWrite = true;
      }
      if (!db.systemData) {
        db.systemData = {
          announcements: [],
          auditLog: [],
          supportTickets: [],
          globalSettings: { appName: 'LogFi', maintenanceMode: false }
        };
        needsWrite = true;
      }

      // Migrate old shared data to first user if exists
      if (db.tasks || db.finance || db.habits) {
        const firstUser = db.users?.[0];
        if (firstUser && !db.userData[firstUser.id]) {
          db.userData[firstUser.id] = {
            tasks: db.tasks || [],
            finance: db.finance || DEFAULT_USER_DATA.finance,
            habits: db.habits || [],
            dailyLogs: db.dailyLogs || [],
          };
          delete db.tasks;
          delete db.finance;
          delete db.habits;
          delete db.dailyLogs;
          needsWrite = true;
        }
      }
      
      if (needsWrite) await writeDb(db);
    }
  } catch (err) {
    console.error("DB Init failed", err);
  }
}

/**
 * Get user-specific data. Creates default data if user has none.
 */
export async function getUserData(userId: string) {
  const db = await readDb();
  if (!db.userData) db.userData = {};
  
  if (!db.userData[userId]) {
    db.userData[userId] = JSON.parse(JSON.stringify(DEFAULT_USER_DATA));
    await writeDb(db);
  }
  
  const data = db.userData[userId];
  
  // Ensure all required fields exist
  if (!data.finance) data.finance = JSON.parse(JSON.stringify(DEFAULT_USER_DATA.finance));
  if (!data.finance.customLists) data.finance.customLists = ['Personal', 'Work'];
  if (!data.finance.categories || data.finance.categories.length === 0) {
    data.finance.categories = JSON.parse(JSON.stringify(DEFAULT_USER_DATA.finance.categories));
  }
  if (!data.habits) data.habits = [];
  if (!data.dailyLogs) data.dailyLogs = [];
  if (!data.tasks) data.tasks = [];
  
  return data;
}

/**
 * Write user-specific data back to DB.
 */
export async function writeUserData(userId: string, userData: any) {
  const db = await readDb();
  if (!db.userData) db.userData = {};
  db.userData[userId] = userData;
  await writeDb(db);
}

/**
 * Get all users' data (for admin views).
 */
export async function getAllUsersData() {
  const db = await readDb();
  return db.userData || {};
}

/**
 * Add entry to audit log.
 */
export async function addAuditLog(entry: { userId: string; action: string; details?: string }) {
  const db = await readDb();
  if (!db.systemData) db.systemData = { announcements: [], auditLog: [], supportTickets: [], globalSettings: {} };
  if (!db.systemData.auditLog) db.systemData.auditLog = [];
  db.systemData.auditLog.unshift({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  // Keep last 1000 entries
  if (db.systemData.auditLog.length > 1000) {
    db.systemData.auditLog = db.systemData.auditLog.slice(0, 1000);
  }
  await writeDb(db);
}
