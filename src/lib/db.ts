import Dexie, { type Table } from 'dexie';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  dueTime?: string;
  createdAt: Date;
  // Any.do Style Features
  notes?: string;
  subtasks?: SubTask[];
  listCategory?: string; // e.g. "Personal", "Work"
  tags?: string[];
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'bank' | 'wallet' | 'cash';
  color: string;
  icon?: string;
}

export interface FinanceCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface Debt {
  id: string;
  contactName: string;
  amount: number;
  type: 'receivable' | 'payable'; // receivable = orang hutang kita, payable = kita hutang orang
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface Transaction {
  id?: number;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  note?: string;
  mode: 'personal' | 'business';
  accountId: string; // ID rekening asal
  toAccountId?: string; // ID rekening tujuan (hanya untuk transfer)
  date: string;
  createdAt: Date;
}

export class AppDatabase extends Dexie {
  tasks!: Table<Task>;
  finance!: Table<Transaction>;
  accounts!: Table<Account>;
  categories!: Table<FinanceCategory>;
  debts!: Table<Debt>;

  constructor() {
    super('SingularityDB');
    this.version(4).stores({
      tasks: '++id, title, status, priority, dueDate, dueTime, createdAt, listCategory',
      finance: '++id, category, amount, type, mode, date, createdAt, accountId',
      accounts: 'id, name, type',
      categories: 'id, name, type',
      debts: 'id, contactName, type, status'
    });
  }
}

export const db = new AppDatabase();
