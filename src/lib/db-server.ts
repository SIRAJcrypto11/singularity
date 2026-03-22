import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export const DB_PATH = path.join(os.homedir(), '.singularity_v7_db.json');

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
        dailyLogs: [],
        users: []
      };
      await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2));
    }
  } catch (err) {
    console.error("DB Init failed", err);
  }
}
