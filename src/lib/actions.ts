import axios from 'axios';

const API_PATH = '/api/data';

// --- TASK ACTIONS ---
export const getTasks = async () => {
  const res = await axios.get(API_PATH);
  return res.data.tasks;
};

export const addTask = async (data: any) => {
  const newTask = {
    id: Date.now(),
    ...data,
    status: 'pending',
    createdAt: new Date(),
    subtasks: data.subtasks || [],
    listCategory: data.listCategory || 'Personal',
    tags: data.tags || []
  };
  return await axios.post(API_PATH, { type: 'TASK', data: newTask });
};

export const updateTask = async (taskId: number, updates: any) => {
  return await axios.post(API_PATH, { type: 'UPDATE_TASK', data: { id: taskId, ...updates } });
};

export const deleteTask = async (taskId: number) => {
  return await axios.post(API_PATH, { type: 'DELETE_TASK', data: { id: taskId } });
};

// --- ELITE FINANCE ACTIONS ---

export const getFinanceData = async () => {
  const res = await axios.get(API_PATH);
  return res.data.finance;
};

export const addTransaction = async (data: { 
  amount: number; 
  category: string; 
  type?: 'income' | 'expense'; 
  mode?: 'personal' | 'business'; 
  note?: string; 
  date: string;
  accountId: string;
}) => {
  const newTx = {
    id: Date.now(),
    ...data,
    createdAt: new Date()
  };
  return await axios.post(API_PATH, { type: 'FINANCE', data: newTx });
};

export const transferFunds = async (data: {
  amount: number;
  accountId: string; // From
  toAccountId: string; // To
  note?: string;
  date: string;
}) => {
  return await axios.post(API_PATH, { 
    type: 'TRANSFER', 
    data: { ...data, id: Date.now(), createdAt: new Date() } 
  });
};

export const addAccount = async (data: {
  name: string;
  type: 'bank' | 'wallet' | 'cash';
  balance: number;
  color: string;
}) => {
  const newAcc = {
    id: `acc-${Date.now()}`,
    ...data
  };
  return await axios.post(API_PATH, { type: 'ACCOUNT_ADD', data: newAcc });
};

export const updateAccount = async (accountId: string, updates: any) => {
  return await axios.post(API_PATH, { type: 'ACCOUNT_UPDATE', data: { id: accountId, ...updates } });
};

export const deleteAccount = async (accountId: string) => {
  return await axios.post(API_PATH, { type: 'ACCOUNT_DELETE', data: { id: accountId } });
};

// --- CATEGORY ACTIONS ---
export const addCategory = async (data: {
  name: string;
  type: 'income' | 'expense';
  color: string;
  keywords: string[];
}) => {
  const newCat = { id: `cat-${Date.now()}`, ...data };
  return await axios.post(API_PATH, { type: 'CATEGORY_ADD', data: newCat });
};

export const updateCategory = async (catId: string, updates: any) => {
  return await axios.post(API_PATH, { type: 'CATEGORY_UPDATE', data: { id: catId, ...updates } });
};

export const deleteCategory = async (catId: string) => {
  return await axios.post(API_PATH, { type: 'CATEGORY_DELETE', data: { id: catId } });
};

// --- BEHAVIORAL ANALYTICS (V9) ---
export const addHabit = async (data: {
  title: string;
  color: string;
}) => {
  const newHabit = {
    id: `hb-${Date.now()}`,
    ...data,
    completions: [],
    createdAt: new Date()
  };
  return await axios.post(API_PATH, { type: 'HABIT', data: newHabit });
};

export const updateHabit = async (habitId: string, updates: any) => {
  return await axios.post(API_PATH, { type: 'UPDATE_HABIT', data: { id: habitId, ...updates } });
};

export const deleteHabit = async (habitId: string) => {
  return await axios.post(API_PATH, { type: 'DELETE_HABIT', data: { id: habitId } });
};

export const addDailyLog = async (data: {
  date: string; // ISO date YYYY-MM-DD
  mood?: number;
  note?: string;
  focusMinutes?: number;
}) => {
  return await axios.post(API_PATH, { type: 'DAILY_LOG', data });
};
