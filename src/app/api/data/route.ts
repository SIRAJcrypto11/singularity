import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Safely persist DB in the user's home directory (e.g. C:\Users\Username\.singularity_v7_db.json)
const DB_PATH = path.join(os.homedir(), '.singularity_v7_db.json');

async function ensureDb() {
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
            { id: 'cat-inc-1', name: 'Penjualan', type: 'income', color: 'emerald' },
            { id: 'cat-inc-2', name: 'Gaji', type: 'income', color: 'blue' },
            { id: 'cat-exp-1', name: 'Makan', type: 'expense', color: 'rose' },
            { id: 'cat-exp-2', name: 'Transport', type: 'expense', color: 'amber' }
          ],
          debts: [],
          customLists: ['Personal', 'Work']
        },
        habits: [],
        dailyLogs: []
      };
      await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2));
    }
  } catch (err) {
    console.error("DB Init failed", err);
  }
}

export async function GET() {
  await ensureDb();
  const data = await fs.readFile(DB_PATH, 'utf-8');
  let parsed = JSON.parse(data);
  if (Array.isArray(parsed.finance)) {
    parsed.finance = {
      transactions: parsed.finance,
      accounts: [{ id: 'acc-main', name: 'Main Wallet', balance: 0, type: 'wallet', color: 'violet' }],
      categories: [], debts: [], customLists: ['Personal', 'Work']
    };
    await fs.writeFile(DB_PATH, JSON.stringify(parsed, null, 2));
  }
  if (!parsed.finance.customLists) parsed.finance.customLists = ['Personal', 'Work'];
  if (!parsed.finance.categories || parsed.finance.categories.length === 0) {
    parsed.finance.categories = [
      { id: 'cat-inc-1', name: 'Penjualan', type: 'income', color: 'emerald', keywords: ['penjualan','jual','sales'] },
      { id: 'cat-inc-2', name: 'Gaji', type: 'income', color: 'blue', keywords: ['gaji','salary','upah'] },
      { id: 'cat-inc-3', name: 'Pemasukan Lain', type: 'income', color: 'cyan', keywords: ['masuk','pemasukan','terima'] },
      { id: 'cat-exp-1', name: 'Makan', type: 'expense', color: 'rose', keywords: ['makan','makanan','food','sahur','buka'] },
      { id: 'cat-exp-2', name: 'Transport', type: 'expense', color: 'amber', keywords: ['transport','bensin','grab','gojek','ojek','parkir'] },
      { id: 'cat-exp-3', name: 'Belanja', type: 'expense', color: 'pink', keywords: ['beli','belanja','buat','bayar'] },
      { id: 'cat-exp-4', name: 'Tagihan', type: 'expense', color: 'orange', keywords: ['tagihan','listrik','wifi','token','pulsa','internet'] },
      { id: 'cat-exp-5', name: 'Hiburan', type: 'expense', color: 'violet', keywords: ['hiburan','nonton','game','langganan'] }
    ];
    await fs.writeFile(DB_PATH, JSON.stringify(parsed, null, 2));
  }
  if (!parsed.habits) parsed.habits = [];
  if (!parsed.dailyLogs) parsed.dailyLogs = [];
  return NextResponse.json(parsed);
}

export async function POST(req: Request) {
  try {
    await ensureDb();
    const payload = await req.json();
    const currentData = JSON.parse(await fs.readFile(DB_PATH, 'utf-8'));
    if (Array.isArray(currentData.finance)) {
      currentData.finance = { transactions: currentData.finance, accounts: [], categories: [], debts: [], customLists: ['Personal', 'Work'] };
    }
    if (!currentData.finance.customLists) currentData.finance.customLists = ['Personal', 'Work'];

    const { type, data } = payload;

    switch (type) {
      // TASK OPS
      case 'TASK': currentData.tasks.unshift(data); break;
      case 'UPDATE_TASK': {
        const i = currentData.tasks.findIndex((t: any) => t.id === data.id);
        if (i !== -1) currentData.tasks[i] = { ...currentData.tasks[i], ...data };
        break;
      }
      case 'DELETE_TASK':
        currentData.tasks = currentData.tasks.filter((t: any) => t.id !== data.id);
        break;

      // FINANCE OPS
      case 'FINANCE':
        currentData.finance.transactions.unshift(data);
        { const a = currentData.finance.accounts.find((x: any) => x.id === data.accountId);
          if (a) { if (data.type === 'income') a.balance += data.amount; else if (data.type === 'expense') a.balance -= data.amount; }
        }
        break;
      case 'TRANSFER': {
        const from = currentData.finance.accounts.find((a: any) => a.id === data.accountId);
        const to = currentData.finance.accounts.find((a: any) => a.id === data.toAccountId);
        if (from && to) { from.balance -= data.amount; to.balance += data.amount;
          currentData.finance.transactions.unshift({ ...data, type: 'transfer', category: 'Transfer', createdAt: new Date() });
        }
        break;
      }

      // ACCOUNT OPS
      case 'ACCOUNT_ADD': currentData.finance.accounts.push(data); break;
      case 'ACCOUNT_UPDATE': {
        const ai = currentData.finance.accounts.findIndex((a: any) => a.id === data.id);
        if (ai !== -1) currentData.finance.accounts[ai] = { ...currentData.finance.accounts[ai], ...data };
        break;
      }
      case 'ACCOUNT_DELETE':
        currentData.finance.accounts = currentData.finance.accounts.filter((a: any) => a.id !== data.id);
        break;

      // DEBT OPS
      case 'DEBT_ADD': currentData.finance.debts.push(data); break;
      case 'DEBT_UPDATE': {
        const di = currentData.finance.debts.findIndex((d: any) => d.id === data.id);
        if (di !== -1) currentData.finance.debts[di] = { ...currentData.finance.debts[di], ...data };
        break;
      }

      // LIST OPS
      case 'LIST_ADD':
        if (!currentData.finance.customLists.includes(data.name)) currentData.finance.customLists.push(data.name);
        break;
      case 'LIST_DELETE':
        currentData.finance.customLists = currentData.finance.customLists.filter((l: string) => l !== data.name);
        break;

      // CATEGORY OPS
      case 'CATEGORY_ADD':
        if (!currentData.finance.categories) currentData.finance.categories = [];
        currentData.finance.categories.push(data);
        break;
      case 'CATEGORY_UPDATE': {
        const ci = currentData.finance.categories.findIndex((c: any) => c.id === data.id);
        if (ci !== -1) currentData.finance.categories[ci] = { ...currentData.finance.categories[ci], ...data };
        break;
      }
      case 'CATEGORY_DELETE':
        currentData.finance.categories = currentData.finance.categories.filter((c: any) => c.id !== data.id);
        break;

      // HABIT OPS
      case 'HABIT':
        if (!currentData.habits) currentData.habits = [];
        currentData.habits.unshift(data);
        break;
      case 'UPDATE_HABIT': {
        const hi = currentData.habits.findIndex((h: any) => h.id === data.id);
        if (hi !== -1) currentData.habits[hi] = { ...currentData.habits[hi], ...data };
        break;
      }
      case 'DELETE_HABIT':
        currentData.habits = currentData.habits.filter((h: any) => h.id !== data.id);
        break;
      
      // DAILY LOG (Mood/Reflection)
      case 'DAILY_LOG':
        if (!currentData.dailyLogs) currentData.dailyLogs = [];
        const lid = currentData.dailyLogs.findIndex((l: any) => l.date === data.date);
        if (lid !== -1) currentData.dailyLogs[lid] = { ...currentData.dailyLogs[lid], ...data };
        else currentData.dailyLogs.unshift(data);
        break;
    }

    await fs.writeFile(DB_PATH, JSON.stringify(currentData, null, 2));
    return NextResponse.json({ success: true, data: currentData });
  } catch (error) {
    console.error("POST Error", error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
