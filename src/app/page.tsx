"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Bot, Calendar, Plus, CheckCircle2, LayoutDashboard, MoreVertical, Trash2, X,
  ChevronRight, ChevronDown, Hash, Clock, Layers, CheckCircle, Circle, Sun, Moon,
  CalendarDays, ListTodo, TrendingUp, TrendingDown, Wallet, ArrowUpRight,
  ArrowDownRight, BarChart3, Receipt, Landmark, RefreshCw, FileText, DollarSign,
  Zap, Users, ArrowRightLeft, Download, Tag, Edit3
} from "lucide-react";
import {
  getTasks, getFinanceData, addTask, addTransaction,
  updateTask, deleteTask, transferFunds, addAccount, deleteAccount,
  addCategory, deleteCategory, addHabit, updateHabit, deleteHabit, addDailyLog
} from "@/lib/actions";
import { smartParse } from "@/lib/parser";
import {
  exportIncomeStatementPDF, exportJournalPDF,
  exportJournalExcel, exportIncomeStatementExcel
} from "@/lib/exportUtils";

function cn(...classes: (string | false | undefined | null)[]) { return classes.filter(Boolean).join(' '); }

export default function LogFiApp() {
  const [theme, setTheme] = useState("dark");
  const [view, setView] = useState("dashboard");
  const [taskFilter, setTaskFilter] = useState("my-day");
  const [selectedList, setSelectedList] = useState("All");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [finance, setFinance] = useState<any>({ transactions: [], accounts: [], categories: [], debts: [], customLists: ['Personal','Work'] });
  const [habits, setHabits] = useState<any[]>([]);
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login'|'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showAddList, setShowAddList] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [reportTab, setReportTab] = useState("income");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newAccName, setNewAccName] = useState("");
  const [newAccType, setNewAccType] = useState("wallet");
  const [newAccBalance, setNewAccBalance] = useState("");
  const [tfFrom, setTfFrom] = useState("");
  const [tfTo, setTfTo] = useState("");
  const [tfAmount, setTfAmount] = useState("");
  const [newListName, setNewListName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState<'income'|'expense'>('expense');
  const [newCatKeywords, setNewCatKeywords] = useState("");

  const fetchData = useCallback(async () => {
    const res = await axios.get('/api/data');
    const { tasks: t, finance: f, habits: h, dailyLogs: l } = res.data;
    setTasks(t || []);
    setFinance(f || { transactions: [], accounts: [], categories: [], debts: [], customLists: ['Personal','Work'] });
    setHabits(h || []);
    setDailyLogs(l || []);
  }, []);
  
  useEffect(() => { 
    const checkAuth = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data.authenticated) {
          setUser(res.data.user);
          fetchData(); 
        }
      } catch (e) {
        setUser(null);
      } finally {
        setIsDataLoaded(true);
      }
    };
    checkAuth();
    const savedTheme = localStorage.getItem('logfi-theme');
    if (savedTheme) setTheme(savedTheme);
  }, [fetchData]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");
    const email = (e.target as any).email.value;
    const password = (e.target as any).password.value;

    try {
      if (authMode === 'login') {
        const res = await axios.post('/api/auth/login', { email, password });
        setUser(res.data.user);
        fetchData();
      } else {
        const res = await axios.post('/api/auth/register', { email, password });
        setAuthSuccess(res.data.message);
      }
    } catch (err: any) {
      setAuthError(err.response?.data?.error || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    // For now, just clear state. In production, clear the cookie via API.
    setUser(null);
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('logfi-theme', next);
  };

  const isDark = theme === "dark";
  const tc = {
    bg: isDark ? "bg-[#070708]" : "bg-white",
    side: isDark ? "bg-zinc-950/30" : "bg-[#F8F9FA]",
    border: isDark ? "border-white/5" : "border-[#DADCE0]",
    text: isDark ? "text-zinc-200" : "text-[#202124]",
    textMuted: isDark ? "text-zinc-500" : "text-zinc-600",
    header: isDark ? "bg-[#050506]/80 backdrop-blur-xl" : "bg-white/90 backdrop-blur-md",
    panel: isDark ? "bg-[#09090a]" : "bg-white border-l border-[#DADCE0]",
    input: isDark ? "bg-zinc-900" : "bg-[#F8F9FA] border border-[#DADCE0]",
    card: isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-zinc-200 shadow-sm",
    activeNav: isDark ? "bg-violet-600/20 text-white" : "bg-violet-50 text-violet-700",
    ghostText: isDark ? "text-zinc-700" : "text-zinc-400"
  };

  const accounts = finance.accounts || [];
  const categories = finance.categories || [];
  const transactions = finance.transactions || [];
  const customLists = finance.customLists || ['Personal','Work'];
  const totalBalance = accounts.reduce((a: number, c: any) => a + c.balance, 0);
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasksList = tasks.filter(t => t.status === 'completed');
  const period = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const filteredTasks = useMemo(() => {
    let list = tasks;
    if (taskFilter === "my-day") list = list.filter(t => t.status === 'pending' && (t.dueDate === todayStr || !t.dueDate));
    else if (taskFilter === "next-7") { const d7 = new Date(); d7.setDate(d7.getDate()+7); list = list.filter(t => { if(t.status==='completed') return false; if(!t.dueDate) return true; return new Date(t.dueDate) <= d7; }); }
    else if (taskFilter === "completed") list = completedTasksList;
    if (selectedList !== "All" && taskFilter !== "completed") list = list.filter(t => t.listCategory === selectedList);
    return list;
  }, [tasks, taskFilter, selectedList, todayStr, completedTasksList]);

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const filtered = transactions.filter((t: any) => { const d = new Date(t.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const lastMonth = transactions.filter((t: any) => { const d = new Date(t.date); return d.getMonth() === (now.getMonth() === 0 ? 11 : now.getMonth() - 1) && d.getFullYear() === (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()); });
    
    const currInc = filtered.filter((t: any) => t.type === 'income').reduce((a: number, c: any) => a + c.amount, 0);
    const currExp = filtered.filter((t: any) => t.type === 'expense').reduce((a: number, c: any) => a + c.amount, 0);
    const lastInc = lastMonth.filter((t: any) => t.type === 'income').reduce((a: number, c: any) => a + c.amount, 0);
    const lastExp = lastMonth.filter((t: any) => t.type === 'expense').reduce((a: number, c: any) => a + c.amount, 0);

    const getDelta = (curr: number, prev: number) => { if (prev === 0) return curr > 0 ? 100 : 0; return Math.round(((curr - prev) / prev) * 100); };

    return {
      income: currInc,
      expense: currExp,
      count: filtered.length,
      incomeDelta: getDelta(currInc, lastInc),
      expenseDelta: getDelta(currExp, lastExp)
    };
  }, [transactions]);

  const trendingData = useMemo(() => {
    try {
      const days = 30;
      const result = [];
      const now = new Date();
      const txs = transactions || [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayTxs = txs.filter((t: any) => t.date === dateStr);
        result.push({
          date: dateStr,
          income: dayTxs.filter((t: any) => t.type === 'income').reduce((a: any, c: any) => a + c.amount, 0),
          expense: dayTxs.filter((t: any) => t.type === 'expense').reduce((a: any, c: any) => a + c.amount, 0)
        });
      }
      return result;
    } catch (e) {
      console.error("Trending data calculation failed", e);
      return Array(30).fill({ date: '', income: 0, expense: 0 });
    }
  }, [transactions]);

  const categoryBreakdown = useMemo(() => {
    const groups: any = {};
    transactions.forEach((t: any) => {
      if (!groups[t.category]) groups[t.category] = { name: t.category, total: 0, type: t.type, color: 'violet' };
      groups[t.category].total += t.amount;
    });
    return Object.values(groups).sort((a:any,b:any) => b.total - a.total);
  }, [transactions]);

  const fmt = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); if (!input.trim()) return;
    const intents = smartParse(input, categories);
    if (intents.length > 0) {
      for (const i of intents) {
        if (i.type === "FINANCE") await addTransaction({ ...i.data, accountId: i.data.accountId || accounts[0]?.id || 'acc-main', date: i.data.date || todayStr });
        else if (i.type === "TASK") await addTask({ ...i.data, listCategory: i.data.listCategory || (selectedList==='All'?'Personal':selectedList) });
        else if (i.type === "TRANSFER") await transferFunds(i.data);
      }
      setStatus(`✓ ${intents.length} operasi berhasil`); setInput(""); await fetchData(); setTimeout(() => setStatus(""), 4000);
    }
  };
  const handleInlineAddTask = async () => { if(!newTaskTitle.trim()) return; await addTask({title:newTaskTitle,listCategory:selectedList==='All'?'Personal':selectedList,priority:'medium'}); setNewTaskTitle(""); setShowAddTask(false); await fetchData(); };
  const handleToggleTask = async (t: any) => { await updateTask(t.id,{status:t.status==='completed'?'pending':'completed'}); if(selectedTask?.id===t.id) setSelectedTask(null); await fetchData(); };
  const handleUpdateTaskDetail = async (u: any) => { if(!selectedTask) return; await updateTask(selectedTask.id,u); setSelectedTask({...selectedTask,...u}); await fetchData(); };
  const handleAddAccount = async () => { if(!newAccName.trim()) return; await addAccount({name:newAccName,type:newAccType as any,balance:parseFloat(newAccBalance)||0,color:['violet','emerald','amber','rose','blue','cyan'][Math.floor(Math.random()*6)]}); setNewAccName(""); setNewAccBalance(""); setShowAddAccount(false); await fetchData(); };
  const handleTransfer = async () => { if(!tfFrom||!tfTo||!tfAmount||tfFrom===tfTo) return; await transferFunds({accountId:tfFrom,toAccountId:tfTo,amount:parseFloat(tfAmount),date:todayStr}); setTfFrom(""); setTfTo(""); setTfAmount(""); setShowTransfer(false); await fetchData(); };
  const handleAddList = async () => { if(!newListName.trim()) return; await fetch('/api/data',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'LIST_ADD',data:{name:newListName}})}); setNewListName(""); setShowAddList(false); await fetchData(); };
  const handleAddCategory = async () => { if(!newCatName.trim()) return; await addCategory({name:newCatName,type:newCatType,color:['emerald','rose','amber','blue','violet','pink','cyan','orange'][Math.floor(Math.random()*8)],keywords:newCatKeywords.split(',').map(k=>k.trim()).filter(k=>k)}); setNewCatName(""); setNewCatKeywords(""); setShowAddCategory(false); await fetchData(); };
  
  // HABIT HANDLERS
  const handleToggleHabit = async (habit: any) => {
    const completedToday = habit.completions?.includes(todayStr);
    let newCompletions = [...(habit.completions || [])];
    if (completedToday) newCompletions = newCompletions.filter(d => d !== todayStr);
    else newCompletions.push(todayStr);
    await updateHabit(habit.id, { completions: newCompletions });
    await fetchData();
  };
  const handleAddHabit = async (title: string) => { if(!title.trim()) return; await addHabit({ title, color: ['violet','emerald','amber','rose','blue','cyan'][Math.floor(Math.random()*6)] }); await fetchData(); };
  const handleLogDaily = async (log: any) => { await addDailyLog({ date: todayStr, ...log }); await fetchData(); };

  const goTask = (f: string) => { setView("tasks"); setTaskFilter(f); setSelectedTask(null); };

  if (!isDataLoaded) return <div className={cn("h-screen flex items-center justify-center", isDark ? "bg-[#070708]" : "bg-white")}><RefreshCw className="animate-spin text-violet-500"/></div>;

  return (
    <div className={cn("flex h-screen font-sans overflow-hidden transition-colors duration-300", tc.bg, tc.text)}>
      {!user && (
        <AuthOverlay 
          mode={authMode} 
          setMode={setAuthMode} 
          onSubmit={handleAuth} 
          loading={authLoading} 
          error={authError} 
          success={authSuccess}
          isDark={isDark}
          tc={tc}
        />
      )}
      {/* SIDEBAR */}
      <aside className={cn("w-72 border-r flex flex-col pt-7 pb-5 shrink-0 transition-all", tc.border, tc.side)}>
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-xl border border-white/10"><Bot size={22} className="text-white"/></div>
          <div><h1 className={cn("text-lg font-black tracking-tighter leading-none", isDark?"text-white":"text-black")}>Log<span className="text-violet-500">Fi</span></h1><p className="text-[9px] text-violet-400 font-bold uppercase tracking-[0.2em] mt-0.5">Daily Assistant</p></div>
        </div>
        <div className="flex-1 px-3 space-y-6 overflow-y-auto">
          <nav className="space-y-0.5"><SB active={view==="dashboard"} onClick={()=>{setView("dashboard");setSelectedTask(null);}} icon={<LayoutDashboard size={17}/>} label="Dashboard" tc={tc}/></nav>
          <div className="space-y-2">
            <p className={cn("px-3 text-[9px] font-black uppercase tracking-[0.2em] border-l-2 border-violet-500/40 ml-0.5", tc.textMuted)}>Task Sentinel</p>
            <nav className="space-y-0.5">
              <SB active={view==="tasks"&&taskFilter==="my-day"} onClick={()=>goTask("my-day")} icon={<Sun size={17}/>} label="My Day" badge={pendingTasks.filter(t=>!t.dueDate||t.dueDate===todayStr).length} tc={tc}/>
              <SB active={view==="tasks"&&taskFilter==="next-7"} onClick={()=>goTask("next-7")} icon={<CalendarDays size={17}/>} label="Next 7 Days" tc={tc}/>
              <SB active={view==="tasks"&&taskFilter==="all"} onClick={()=>goTask("all")} icon={<ListTodo size={17}/>} label="All Tasks" badge={pendingTasks.length} tc={tc}/>
              <SB active={view==="tasks"&&taskFilter==="completed"} onClick={()=>goTask("completed")} icon={<CheckCircle2 size={17}/>} label="Completed" badge={completedTasksList.length} tc={tc}/>
              <SB active={view==="habits"} onClick={()=>{setView("habits");setSelectedTask(null);}} icon={<Zap size={17}/>} label="Habit Tracker" color="text-amber-400" badge={habits.length} tc={tc}/>
            </nav>
            <div className="pt-1 px-1 space-y-0.5">
              {customLists.map((l:string)=><button key={l} onClick={()=>{setView("tasks");setTaskFilter("all");setSelectedList(l);setSelectedTask(null);}} className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all",selectedList===l&&view==="tasks"?tc.activeNav:(isDark?"text-zinc-600 hover:text-zinc-400":"text-zinc-400 hover:text-zinc-600"))}><div className={cn("w-1.5 h-1.5 rounded-full",l==='Personal'?'bg-violet-500':l==='Work'?'bg-emerald-500':'bg-amber-500')}/>{l}</button>)}
              <button onClick={()=>setShowAddList(true)} className={cn("w-full flex items-center gap-2.5 px-3 py-2 transition-colors", tc.textMuted, "hover:text-violet-400")}><Plus size={13}/><span className="text-[10px] font-bold">New List</span></button>
            </div>
          </div>
          <div className="space-y-2">
            <p className={cn("px-3 text-[9px] font-black uppercase tracking-[0.2em] border-l-2 border-emerald-500/40 ml-0.5", tc.textMuted)}>The Vault (ERP)</p>
            <nav className="space-y-0.5">
              <SB active={view==="fin-dash"} onClick={()=>{setView("fin-dash");setSelectedTask(null);}} icon={<BarChart3 size={17}/>} label="Dashboard" color="text-emerald-400" tc={tc}/>
              <SB active={view==="fin-journal"} onClick={()=>{setView("fin-journal");setSelectedTask(null);}} icon={<Receipt size={17}/>} label="Pencatatan" tc={tc}/>
              <SB active={view==="fin-accounts"} onClick={()=>{setView("fin-accounts");setSelectedTask(null);}} icon={<Landmark size={17}/>} label="Rekening" tc={tc}/>
              <SB active={view==="fin-categories"} onClick={()=>{setView("fin-categories");setSelectedTask(null);}} icon={<Tag size={17}/>} label="Kategori" badge={categories.length} tc={tc}/>
              <SB active={view==="fin-reports"} onClick={()=>{setView("fin-reports");setSelectedTask(null);}} icon={<FileText size={17}/>} label="Laporan" tc={tc}/>
              <SB active={view==="fin-debts"} onClick={()=>{setView("fin-debts");setSelectedTask(null);}} icon={<Users size={17}/>} label="Piutang & Hutang" tc={tc}/>
            </nav>
          </div>
        </div>
        <div className={cn("px-5 pt-3 border-t mt-auto space-y-3", tc.border)}>
          <div className="flex items-center justify-between gap-2 px-1">
            <p className={cn("text-[9px] font-black uppercase tracking-widest", tc.textMuted)}>Misi Mode</p>
            <button 
              onClick={toggleTheme} 
              className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-[10px] font-black uppercase tracking-tighter shadow-sm", isDark?"bg-violet-600/10 border-violet-500/20 text-amber-300 hover:bg-violet-600/20":"bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100")}
            >
              {isDark ? <><Sun size={12}/> Light</> : <><Moon size={12}/> Dark</>}
            </button>
          </div>
          <div className={cn("p-2.5 border rounded-xl flex flex-col gap-3", isDark?"bg-white/[0.02] border-white/5":"bg-white border-zinc-200 shadow-sm")}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-violet-600/20 flex items-center justify-center text-[9px] font-bold text-violet-400 border border-violet-500/20">
                {user?.email?.[0].toUpperCase() || "S"}
              </div>
              <p className={cn("text-[10px] font-black truncate flex-1", isDark?"text-white":"text-black")}>
                {user?.email || "Guest Sentinel"}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[9px] font-black uppercase tracking-tighter rounded-lg border border-rose-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className={cn("flex-1 flex flex-col relative h-full transition-colors duration-300", isDark?"bg-[#050506]":"bg-white")}>
        <header className={cn("h-16 border-b flex items-center justify-between px-10 shrink-0 z-40 transition-all", tc.header, tc.border)}>
          <h2 className={cn("text-lg font-black uppercase tracking-tighter", isDark?"text-white":"text-black")}>
            {view==='dashboard'?'Strategic Overview':view==='tasks'?`Task: ${taskFilter.replace(/-/g,' ')}`:'The Vault'}
          </h2>
          <div className="flex items-center gap-5">
            <div className="text-right"><p className={cn("text-[9px] font-black uppercase tracking-widest", tc.textMuted)}>Capital</p><p className={cn("text-base font-black tracking-tighter", isDark?"text-white":"text-black")}>{fmt(totalBalance)}</p></div>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchData} 
                className={cn("w-9 h-9 rounded-lg border flex items-center justify-center transition-all shadow-sm", isDark?"bg-white/5 border-white/10 text-zinc-500 hover:text-white":"bg-white border-zinc-200 text-zinc-500 hover:text-black")}
              >
                <RefreshCw size={17}/>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <ContentView
            view={view} taskFilter={taskFilter} filteredTasks={filteredTasks}
            pendingTasks={pendingTasks} completedTasksList={completedTasksList}
            showAddTask={showAddTask} setShowAddTask={setShowAddTask}
            newTaskTitle={newTaskTitle} setNewTaskTitle={setNewTaskTitle}
            handleInlineAddTask={handleInlineAddTask} handleToggleTask={handleToggleTask}
            setSelectedTask={setSelectedTask} setView={setView}
            showCompleted={showCompleted} setShowCompleted={setShowCompleted}
            monthlyStats={monthlyStats} categoryBreakdown={categoryBreakdown}
            trendingData={trendingData}
            finance={finance} accounts={accounts} transactions={transactions} totalBalance={totalBalance}
            fmt={fmt} tc={tc} isDark={isDark} goTask={(v:string)=>setView(v)}
            setShowAddAccount={setShowAddAccount} setShowTransfer={setShowTransfer}
            setShowAddCategory={setShowAddCategory} fetchData={fetchData}
            reportTab={reportTab} setReportTab={setReportTab} period={period}
            selectedTask={selectedTask} handleUpdateTaskDetail={handleUpdateTaskDetail}
            categories={categories} habits={habits} handleToggleHabit={handleToggleHabit}
            handleAddHabit={handleAddHabit} dailyLogs={dailyLogs} handleLogDaily={handleLogDaily}
            todayStr={todayStr}
          />
        </div>

        {/* INPUT BAR */}
        <div className="h-24 flex items-center justify-center px-8 shrink-0 z-50">
          <div className="w-full max-w-3xl relative">
            {status && <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 rounded-full"><p className="text-[10px] font-black text-emerald-400">{status}</p></div>}
            <form onSubmit={handleSubmit} className={cn("border rounded-2xl p-2.5 flex items-center gap-3 shadow-xl focus-within:ring-2 focus-within:ring-violet-500/40 transition-all", isDark?"bg-zinc-900 border-white/10":"bg-white border-zinc-200")}>
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-violet-400 border shrink-0", isDark?"bg-zinc-950 border-white/5":"bg-zinc-50 border-zinc-200")}><Bot size={20}/></div>
              <input type="text" value={input} onChange={e=>setInput(e.target.value)} placeholder="Ketik: 'Beli Makan 50rb' atau 'Meeting jam 10'" className={cn("flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold p-1.5", isDark?"text-white placeholder:text-zinc-700":"text-black placeholder:text-zinc-300")}/>
              <button type="submit" className={cn("h-10 px-6 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5", isDark?"bg-white text-black hover:bg-zinc-200":"bg-black text-white hover:bg-zinc-800")}>Execute <ChevronRight size={14}/></button>
            </form>
          </div>
        </div>

        {/* TASK DETAIL PANEL */}
        {selectedTask && view==='tasks' && (
          <aside className={cn("fixed right-0 top-0 h-full w-[440px] border-l z-[100] flex flex-col shadow-2xl animate-in slide-in-from-right", isDark?"bg-[#09090a] border-white/10":"bg-white border-zinc-200")}>
            <div className={cn("h-14 border-b flex items-center justify-between px-5 shrink-0", tc.border)}>
              <button onClick={()=>setSelectedTask(null)} className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", isDark?"hover:bg-white/5 text-zinc-500 hover:text-white":"hover:bg-zinc-100 text-zinc-400 hover:text-black")}><X size={18}/></button>
              <button onClick={()=>{deleteTask(selectedTask.id);setSelectedTask(null);fetchData();}} className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", isDark?"hover:bg-rose-500/10 text-zinc-700 hover:text-rose-500":"hover:bg-rose-50 text-zinc-400 hover:text-rose-600")}><Trash2 size={16}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <textarea value={selectedTask.title} onChange={e=>handleUpdateTaskDetail({title:e.target.value})} className={cn("w-full bg-transparent border-none text-xl font-black tracking-tighter resize-none p-0 focus:ring-0 focus:outline-none", isDark?"text-white":"text-black")} rows={2}/>
              <div className="grid grid-cols-2 gap-3">
                <AttrBox label="Tanggal" icon={<Calendar size={11} className="text-violet-400"/>} isDark={isDark}><input type="date" value={selectedTask.dueDate||''} onChange={e=>handleUpdateTaskDetail({dueDate:e.target.value})} className={cn("w-full bg-transparent border-none text-xs font-black focus:ring-0 p-0 cursor-pointer", isDark?"text-white":"text-black")}/></AttrBox>
                <AttrBox label="Waktu" icon={<Clock size={11} className="text-violet-400"/>} isDark={isDark}><input type="time" value={selectedTask.dueTime||''} onChange={e=>handleUpdateTaskDetail({dueTime:e.target.value})} className={cn("w-full bg-transparent border-none text-xs font-black focus:ring-0 p-0 cursor-pointer", isDark?"text-white":"text-black")}/></AttrBox>
                <AttrBox label="Prioritas" isDark={isDark}><select value={selectedTask.priority||'medium'} onChange={e=>handleUpdateTaskDetail({priority:e.target.value})} className={cn("w-full bg-transparent border-none text-xs font-black focus:ring-0 p-0 cursor-pointer", isDark?"text-white":"text-black")}><option value="low" className={isDark?"bg-zinc-900":"bg-white"}>Low</option><option value="medium" className={isDark?"bg-zinc-900":"bg-white"}>Medium</option><option value="high" className={isDark?"bg-zinc-900":"bg-white"}>High</option></select></AttrBox>
                <AttrBox label="List" isDark={isDark}><select value={selectedTask.listCategory||'Personal'} onChange={e=>handleUpdateTaskDetail({listCategory:e.target.value})} className={cn("w-full bg-transparent border-none text-xs font-black focus:ring-0 p-0 cursor-pointer", isDark?"text-white":"text-black")}>{customLists.map((l:string)=><option key={l} value={l} className={isDark?"bg-zinc-900":"bg-white"}>{l}</option>)}</select></AttrBox>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center"><p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Sub-tugas</p><span className="text-[9px] font-black text-violet-400">{selectedTask.subtasks?.filter((s:any)=>s.completed).length||0}/{selectedTask.subtasks?.length||0}</span></div>
                {selectedTask.subtasks?.map((sub:any,idx:number)=>(
                  <div key={idx} className="flex items-center gap-2.5 group">
                    <button onClick={()=>{const ns=[...selectedTask.subtasks];ns[idx].completed=!ns[idx].completed;handleUpdateTaskDetail({subtasks:ns});}} className={cn("w-4 h-4 rounded border shrink-0 flex items-center justify-center",sub.completed?'bg-violet-600 border-violet-600':(isDark?'border-zinc-800':'border-zinc-200'))}>{sub.completed&&<CheckCircle size={10} className="text-white"/>}</button>
                    <input value={sub.title} onChange={e=>{const ns=[...selectedTask.subtasks];ns[idx].title=e.target.value;handleUpdateTaskDetail({subtasks:ns});}} className={cn("flex-1 bg-transparent border-none text-xs font-bold focus:ring-0 focus:outline-none p-0",sub.completed?'text-zinc-600 line-through':isDark?'text-zinc-300':'text-zinc-700')}/>
                    <button onClick={()=>{const ns=selectedTask.subtasks.filter((_:any,i:number)=>i!==idx);handleUpdateTaskDetail({subtasks:ns});}} className={cn("opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-colors", tc.textMuted)}><Trash2 size={12}/></button>
                  </div>
                ))}
                <button onClick={()=>{const ns=[...(selectedTask.subtasks||[]),{title:'',completed:false}];handleUpdateTaskDetail({subtasks:ns});}} className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-[10px] font-bold"><Plus size={12}/>Tambah Sub-tugas</button>
              </div>
              <div className="space-y-2"><p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Catatan</p><textarea value={selectedTask.notes||''} onChange={e=>handleUpdateTaskDetail({notes:e.target.value})} placeholder="Tulis catatan..." className={cn("w-full h-28 border rounded-xl p-4 text-xs focus:ring-2 focus:ring-violet-500/20 resize-none focus:outline-none", isDark?"bg-white/[0.02] border-white/5 text-zinc-400":"bg-zinc-50 border-zinc-200 text-zinc-600")}/></div>
            </div>
          </aside>
        )}

        {/* MODALS */}
        {showAddAccount && <Modal onClose={()=>setShowAddAccount(false)} title="Tambah Rekening" isDark={isDark}>
          <input value={newAccName} onChange={e=>setNewAccName(e.target.value)} placeholder="Nama Rekening" className={cn("w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/50 focus:outline-none", isDark?"bg-zinc-800 border-white/10 text-white":"bg-white border-zinc-200 text-black")}/>
          <select value={newAccType} onChange={e=>setNewAccType(e.target.value)} className={cn("w-full border rounded-lg px-3 py-2.5 text-sm", isDark?"bg-zinc-800 border-white/10 text-white":"bg-white border-zinc-200 text-black")}><option value="wallet">E-Wallet</option><option value="bank">Bank</option><option value="cash">Cash</option></select>
          <input type="number" value={newAccBalance} onChange={e=>setNewAccBalance(e.target.value)} placeholder="Saldo Awal" className={cn("w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/50 focus:outline-none", isDark?"bg-zinc-800 border-white/10 text-white":"bg-white border-zinc-200 text-black")}/>
          <button onClick={handleAddAccount} className="w-full py-2.5 bg-emerald-600 rounded-lg text-sm font-black text-white hover:bg-emerald-500 transition-colors">Simpan</button>
        </Modal>}
        {showTransfer && <Modal onClose={()=>setShowTransfer(false)} title="Transfer Antar Rekening" isDark={isDark}>
          <select value={tfFrom} onChange={e=>setTfFrom(e.target.value)} className={cn("w-full border rounded-lg px-3 py-2.5 text-sm", isDark?"bg-zinc-800 border-white/10 text-white":"bg-white border-zinc-200 text-black")}><option value="">Dari Rekening...</option>{accounts.map((a:any)=><option key={a.id} value={a.id}>{a.name}</option>)}</select>
          <select value={tfTo} onChange={e=>setTfTo(e.target.value)} className={cn("w-full border rounded-lg px-3 py-2.5 text-sm", isDark?"bg-zinc-800 border-white/10 text-white":"bg-white border-zinc-200 text-black")}><option value="">Ke Rekening...</option>{accounts.map((a:any)=><option key={a.id} value={a.id}>{a.name}</option>)}</select>
          <input type="number" value={tfAmount} onChange={e=>setTfAmount(e.target.value)} placeholder="Jumlah Transfer" className={cn("w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/50 focus:outline-none", isDark?"bg-zinc-800 border-white/10 text-white":"bg-white border-zinc-200 text-black")}/>
          <button onClick={handleTransfer} className="w-full py-2.5 bg-violet-600 rounded-lg text-sm font-black text-white hover:bg-violet-500 transition-colors">Transfer</button>
        </Modal>}
        {showAddList && <Modal onClose={()=>setShowAddList(false)} title="Buat List Baru" isDark={isDark}>
          <input autoFocus value={newListName} onChange={e=>setNewListName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')handleAddList();}} placeholder="Nama List" className={cn("w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/50 focus:outline-none", isDark?"bg-zinc-800 border-white/10 text-white":"bg-white border-zinc-200 text-black")}/>
          <button onClick={handleAddList} className="w-full py-2.5 bg-violet-600 rounded-lg text-sm font-black text-white hover:bg-violet-500 transition-colors">Buat</button>
        </Modal>}
        {showAddCategory && <Modal onClose={()=>setShowAddCategory(false)} title="Tambah Kategori" isDark={isDark}>
          <input autoFocus value={newCatName} onChange={e=>setNewCatName(e.target.value)} placeholder="Nama Kategori (mis: Makan)" className={cn("w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/50 focus:outline-none", isDark?"bg-zinc-800 border-white/10 text-white":"bg-white border-zinc-200 text-black")}/>
          <select value={newCatType} onChange={e=>setNewCatType(e.target.value as any)} className={cn("w-full border rounded-lg px-3 py-2.5 text-sm", isDark?"bg-zinc-800 border-white/10 text-white":"bg-white border-zinc-200 text-black")}><option value="expense">Pengeluaran</option><option value="income">Pemasukan</option></select>
          <input value={newCatKeywords} onChange={e=>setNewCatKeywords(e.target.value)} placeholder="Keywords (pisahkan koma: makan,makanan,food)" className={cn("w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/50 focus:outline-none", isDark?"bg-zinc-800 border-white/10 text-white":"bg-white border-zinc-200 text-black")}/>
          <p className="text-[10px] text-zinc-600">Keywords membantu AI mengenali kategori ini secara otomatis</p>
          <button onClick={handleAddCategory} className="w-full py-2.5 bg-emerald-600 rounded-lg text-sm font-black text-white hover:bg-emerald-500 transition-colors">Simpan Kategori</button>
        </Modal>}
      </main>
    </div>
  );
}

// ===================== SAAS VISUAL ENGINE (SVG) =====================
function SaaSChartArea({ data, isDark, tc }: any) {
  if (!data || data.length < 2) return <div className="h-64 flex items-center justify-center text-zinc-500">Bukan cukup data untuk tren</div>;
  const w = 800, h = 240, pad = 40;
  const maxI = Math.max(...data.map((d: any) => d.income), 1000);
  const maxE = Math.max(...data.map((d: any) => d.expense), 1000);
  const max = Math.max(maxI, maxE, 1);

  const getPoints = (key: string) => data.map((d: any, i: number) => {
    const x = pad + (i * (w - pad * 2)) / (data.length - 1);
    const y = h - pad - (d[key] / max) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  const pointsInc = getPoints('income');
  const pointsExp = getPoints('expense');

  return (
    <div className="w-full h-full relative group">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible drop-shadow-2xl">
        <defs>
          <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/><stop offset="100%" stopColor="#10b981" stopOpacity="0"/></linearGradient>
          <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" stopOpacity="0.1"/><stop offset="100%" stopColor="#f43f5e" stopOpacity="0"/></linearGradient>
        </defs>
        {/* GRID */}
        {[0, 0.25, 0.5, 0.75, 1].map(v => (
          <line key={v} x1={pad} y1={pad + v * (h - pad * 2)} x2={w - pad} y2={pad + v * (h - pad * 2)} stroke={isDark ? "white" : "black"} strokeOpacity="0.03" strokeWidth="1"/>
        ))}
        {/* AREAS */}
        <polygon points={`${pad},${h - pad} ${pointsInc} ${w - pad},${h - pad}`} fill="url(#gInc)"/>
        <polygon points={`${pad},${h - pad} ${pointsExp} ${w - pad},${h - pad}`} fill="url(#gExp)"/>
        {/* LINES */}
        <polyline points={pointsInc} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"/>
        <polyline points={pointsExp} fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4" className="opacity-60"/>
        {/* BORDER */}
        <line x1={pad} y1={h-pad} x2={w-pad} y2={h-pad} stroke={isDark?"white":"black"} strokeOpacity="0.1" strokeWidth="1"/>
      </svg>
    </div>
  );
}

function SaaSChartDonut({ data, isDark, tc }: any) {
  if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-zinc-500">Asset distribution empty</div>;
  const total = data.reduce((a: number, c: any) => a + c.total, 0);
  let acc = 0;
  const colors = ["#8b5cf6", "#10b981", "#3b82f6", "#f59e0b", "#f43f5e", "#06b6d4"];

  return (
    <div className="flex items-center gap-8">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {data.map((c: any, i: number) => {
            const p = (c.total / total) * 100;
            const offset = acc;
            acc += p;
            return <circle key={i} cx="50" cy="50" r="40" fill="none" stroke={colors[i % colors.length]} strokeWidth="12" strokeDasharray={`${p} ${100 - p}`} strokeDashoffset={-offset} className="transition-all duration-1000 hover:stroke-width-[15] cursor-pointer"/>;
          })}
          <circle cx="50" cy="50" r="30" fill={isDark ? "#0c0c0e" : "white"}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className={cn("text-[9px] font-black uppercase tracking-widest", tc.textMuted)}>Total</p>
          <p className={cn("text-xs font-black", isDark?"text-white":"text-black")}>{Math.round(total / 1000)}K</p>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {data.slice(0, 5).map((c: any, i: number) => (
          <div key={i} className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}/>
              <span className={cn("font-bold truncate max-w-[80px]", tc.textMuted)}>{c.name}</span>
            </div>
            <span className={cn("font-black", isDark?"text-white":"text-black")}>{Math.round((c.total / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===================== BEHAVIORAL ANALYTICS V9 =====================
function ActivityHeatmap({ tasks, finance, habits, isDark, tc }: any) {
  const days = 364; // 52 weeks
  const now = new Date();
  const txs = finance?.transactions || [];
  
  // Calculate activity score per day
  const activity: any = {};
  const dates = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const s = d.toISOString().split('T')[0];
    dates.push(s);
    let score = 0;
    score += (tasks || []).filter((t: any) => t.completedAt?.startsWith(s)).length * 2;
    score += txs.filter((t: any) => t.date === s).length;
    (habits || []).forEach((h: any) => { if (h.completions?.includes(s)) score += 3; });
    activity[s] = score;
  }

  const getColor = (s: number) => {
    if (s === 0) return isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)";
    if (s < 3) return "#10b98133";
    if (s < 6) return "#10b98166";
    if (s < 10) return "#10b981aa";
    return "#10b981ff";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={cn("text-[10px] font-black uppercase tracking-widest", tc.textMuted)}>Momentum 365 Hari</h3>
        <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-tighter">
          <span className={tc.textMuted}>Less</span>
          {[0, 3, 6, 10].map(s => <div key={s} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: getColor(s) }}/>)}
          <span className={tc.textMuted}>More</span>
        </div>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="inline-grid grid-flow-col grid-rows-7 gap-1">
          {dates.map((d, i) => (
            <div key={i} className="w-3 h-3 rounded-sm transition-all hover:ring-2 hover:ring-violet-500/50 cursor-help" style={{ backgroundColor: getColor(activity[d]) }} title={`${d}: ${activity[d]} activity units`}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function HabitCard({ habit, onToggle, tc, isDark, todayStr }: any) {
  const isCompleted = habit.completions?.includes(todayStr);
  const streak = useMemo(() => {
    let s = 0;
    let d = new Date();
    while (true) {
      const ds = d.toISOString().split('T')[0];
      if (habit.completions?.includes(ds)) s++;
      else if (ds !== todayStr) break;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }, [habit.completions, todayStr]);

  return (
    <div className={cn(tc.card, "rounded-2xl p-4 flex items-center justify-between group transition-all hover:border-violet-500/30")}>
      <div className="flex items-center gap-3">
        <button onClick={() => onToggle(habit)} className={cn("w-10 h-10 rounded-xl border flex items-center justify-center transition-all", isCompleted ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" : cn(isDark?"bg-white/5 border-white/5":"bg-zinc-50 border-zinc-200", "text-zinc-500"))}>
          {isCompleted ? <CheckCircle size={20}/> : <Circle size={20}/>}
        </button>
        <div>
          <h4 className={cn("text-sm font-black tracking-tight", isDark?"text-white":"text-black")}>{habit.title}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-black text-rose-400 flex items-center gap-1"><Zap size={10} fill="currentColor"/> {streak} HARI</span>
            <div className="flex gap-0.5">
              {[6,5,4,3,2,1,0].map(i => {
                const d = new Date(); d.setDate(d.getDate()-i); const s = d.toISOString().split('T')[0];
                return <div key={i} className={cn("w-1.5 h-1.5 rounded-full", habit.completions?.includes(s) ? "bg-emerald-500" : isDark?"bg-white/5":"bg-zinc-100")}/>;
              })}
            </div>
          </div>
        </div>
      </div>
      <button className={cn("w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all", isDark?"hover:bg-white/5":"hover:bg-zinc-100")}><MoreVertical size={14} className={tc.textMuted}/></button>
    </div>
  );
}

function HabitTrackerView({ habits, handleToggleHabit, handleAddHabit, todayStr, tc, isDark }: any) {
  const [newHabit, setNewHabit] = useState("");
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div><h1 className={cn("text-3xl font-black tracking-tighter", isDark?"text-white":"text-black")}>Behavioral Pulse</h1><p className={cn("text-xs font-bold mt-1", tc.textMuted)}>Consistency is the key to growth.</p></div>
        <div className="flex gap-2">
          <input value={newHabit} onChange={e=>setNewHabit(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){handleAddHabit(newHabit);setNewHabit("");}}} placeholder="Write new habit..." className={cn("bg-transparent border rounded-lg px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-violet-500/50 focus:outline-none", tc.border)}/>
          <button onClick={()=>{handleAddHabit(newHabit);setNewHabit("");}} className="px-4 py-2 bg-violet-600 rounded-lg text-xs font-black text-white hover:bg-violet-500 shadow-lg">Add Habit</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {habits.map((h: any) => <HabitCard key={h.id} habit={h} onToggle={handleToggleHabit} todayStr={todayStr} tc={tc} isDark={isDark}/>)}
        {habits.length === 0 && <div className={cn(tc.card, "col-span-2 rounded-2xl p-12 text-center border-dashed border-2")}><p className={tc.textMuted}>Mulai perjalanan habit baru Anda hari ini.</p></div>}
      </div>
    </div>
  );
}

function PulseCard({ dailyLogs, handleLogDaily, tc, isDark, todayStr }: any) {
  const logs = dailyLogs || [];
  const todayLog = logs.find((l: any) => l.date === todayStr) || { mood: 5, note: "" };
  return (
    <div className={cn(tc.card, "rounded-2xl p-6 space-y-5")}>
      <h3 className={cn("text-[10px] font-black uppercase tracking-widest", tc.textMuted)}>Today's Pulse</h3>
      <div className="flex justify-between items-center px-2">
        {[1,2,3,4,5,6,7,8,9,10].map(m => (
          <button key={m} onClick={() => handleLogDaily({ mood: m })} className={cn("w-7 h-7 rounded-lg text-[10px] font-black transition-all", todayLog.mood === m ? "bg-violet-600 text-white shadow-lg" : isDark?"bg-white/5 text-zinc-600 hover:text-white":"bg-zinc-50 text-zinc-400 hover:text-black")}>{m}</button>
        ))}
      </div>
      <textarea value={todayLog.note} onChange={e => handleLogDaily({ note: e.target.value })} placeholder="Any reflections for today?" className={cn("w-full h-20 bg-transparent border rounded-xl p-3 text-xs focus:ring-2 focus:outline-none resize-none", tc.border, isDark?"text-white placeholder:text-zinc-700":"text-black placeholder:text-zinc-300")}/>
    </div>
  );
}

// ===================== CONTENT VIEW (DETERMINISTIC SWITCH) =====================
function ContentView(props: any) {
  const { view, taskFilter, filteredTasks, pendingTasks, completedTasksList, showAddTask, setShowAddTask, newTaskTitle, setNewTaskTitle, handleInlineAddTask, handleToggleTask, setSelectedTask, setView, showCompleted, setShowCompleted, monthlyStats, categoryBreakdown, accounts, transactions, totalBalance, fmt, setShowAddAccount, setShowTransfer, reportTab, setReportTab, period, selectedTask } = props;

  switch(view) {
    case 'dashboard': return <DashboardView {...props}/>;
    case 'tasks': return <TasksView {...props}/>;
    case 'habits': return <HabitTrackerView {...props}/>;
    case 'fin-dash': return <FinDashView {...props}/>;
    case 'fin-journal': return <FinJournalView {...props}/>;
    case 'fin-accounts': return <FinAccountsView {...props}/>;
    case 'fin-categories': return <FinCategoriesView {...props}/>;
    case 'fin-reports': return <FinReportsView {...props}/>;
    case 'fin-debts': return <FinDebtsView {...props}/>;
    default: return <DashboardView {...props}/>;
  }
}

function DashboardView({ monthlyStats, tasks = [], finance, trendingData, categoryBreakdown, fmt, tc, isDark, goTask, dailyLogs, handleLogDaily, todayStr, habits, handleToggleHabit }: any) {
  const accounts = finance?.accounts || [];
  const totalBalance = accounts.reduce((a: number, c: any) => a + c.balance, 0);
  const pendingTasks = (tasks || []).filter((t: any) => t.status === 'pending');

  const MiniSpark = ({ data = [], color }: any) => {
    if (!data || data.length < 2) return <div className="w-10 h-4"/>;
    const max = Math.max(...data, 1);
    const pts = data.map((v: any, i: number) => {
      const x = (i * 40) / (data.length - 1);
      const y = 15 - (v / max) * 15;
      return `${isNaN(x)?0:x},${isNaN(y)?0:y}`;
    }).join(" ");
    return <svg viewBox="0 0 40 15" className="w-10 h-4 opacity-50"><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
  };  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={cn("text-3xl font-black tracking-tighter", isDark ? "text-white" : "text-black")}>Strategic Overview</h1>
            <p className={cn("text-[10px] font-bold uppercase tracking-[0.2em] mt-1", tc.textMuted)}>Intelligence Hub • {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className={cn("px-4 py-2 rounded-xl border flex items-center gap-3", tc.card)}>
            <p className={cn("text-[10px] font-black uppercase tracking-widest", tc.textMuted)}>Health Score</p>
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/><span className={cn("text-sm font-black text-emerald-400")}>94%</span></div>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { l: 'Revenue', v: fmt(monthlyStats.income), d: monthlyStats.incomeDelta, i: <TrendingUp size={16}/>, c: 'text-emerald-400', s: trendingData.map((d:any)=>d.income) },
            { l: 'Expense', v: fmt(monthlyStats.expense), d: monthlyStats.expenseDelta, i: <TrendingDown size={16}/>, c: 'text-rose-400', s: trendingData.map((d:any)=>d.expense) },
            { l: 'Capital', v: fmt(totalBalance), d: 4, i: <Wallet size={16}/>, c: 'text-violet-400', s: [2,5,3,8,4,10] },
            { l: 'Tasks', v: pendingTasks.length.toString(), d: -12, i: <CheckCircle2 size={16}/>, c: 'text-amber-400', s: [5,4,6,3,2,1] },
          ].map((m, i) => (
            <div key={i} className={cn(tc.card, "rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-sm group hover:border-violet-500/30 transition-all")}>
              <div className="flex items-center justify-between">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", isDark ? "bg-zinc-950 border-white/5" : "bg-zinc-50 border-zinc-200")}>
                  <div className={m.c}>{m.i}</div>
                </div>
                <MiniSpark data={m.s} color={m.c.replace('text-', '#').replace('400', '500')}/>
              </div>
              <div>
                <p className={cn("text-[9px] font-black uppercase tracking-widest", tc.textMuted)}>{m.l}</p>
                <h4 className={cn("text-lg font-black tracking-tighter", isDark ? "text-white" : "text-black")}>{m.v}</h4>
              </div>
              <div className={cn("flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter", m.d >= 0 ? "text-emerald-400" : "text-rose-400")}>
                {m.d >= 0 ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                {Math.abs(m.d)}% <span className={tc.textMuted}>vs last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN CHARTS SECTION */}
        <div className="grid grid-cols-10 gap-6">
          <div className={cn(tc.card, "col-span-7 rounded-2xl p-6 space-y-6 shadow-sm min-h-[320px]")}>
            <div className="flex items-center justify-between">
              <h3 className={cn("text-xs font-black uppercase tracking-widest", isDark ? "text-white" : "text-black")}>Revenue Performance</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"/><span className={cn("text-[9px] font-bold uppercase", tc.textMuted)}>Income</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"/><span className={cn("text-[9px] font-bold uppercase", tc.textMuted)}>Expense</span></div>
              </div>
            </div>
            <SaaSChartArea data={trendingData} isDark={isDark} tc={tc}/>
          </div>
          <div className={cn(tc.card, "col-span-3 rounded-2xl p-6 space-y-6 shadow-sm min-h-[320px]")}>
            <h3 className={cn("text-xs font-black uppercase tracking-widest", isDark ? "text-white" : "text-black")}>Asset Distribution</h3>
            <SaaSChartDonut data={categoryBreakdown.filter((c:any)=>c.type==='expense')} tc={tc} isDark={isDark}/>
            <div className="pt-4 border-t border-white/5 space-y-3">
              <p className={cn("text-[9px] font-black uppercase tracking-widest", tc.textMuted)}>Recent Accounts</p>
              <div className="space-y-2">
                {accounts.slice(0, 3).map((a: any) => (
                  <div key={a.id} className="flex justify-between items-center text-xs">
                    <span className={cn("font-bold truncate max-w-[100px]", isDark ? "text-white" : "text-black")}>{a.name}</span>
                    <span className={tc.textMuted}>{fmt(a.balance)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ANALYTICS SECTION */}
        <div className="grid grid-cols-10 gap-6">
          <div className={cn(tc.card, "col-span-7 rounded-2xl p-6 shadow-sm overflow-hidden min-h-[160px]")}>
            <ActivityHeatmap tasks={tasks} finance={finance} habits={habits} tc={tc} isDark={isDark}/>
          </div>
          <div className="col-span-3">
            <PulseCard dailyLogs={dailyLogs} handleLogDaily={handleLogDaily} tc={tc} isDark={isDark} todayStr={todayStr}/>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-2 gap-6">
          <div className={cn(tc.card, "rounded-2xl p-6 space-y-4 shadow-sm")}>
            <div className="flex items-center justify-between">
              <h3 className={cn("text-xs font-black uppercase tracking-widest", isDark ? "text-white" : "text-black")}>Tugas Prioritas</h3>
              <button onClick={() => goTask('all')} className={cn("text-[9px] font-black uppercase tracking-widest underline decoration-violet-500/50", tc.textMuted)}>Lihat Semua</button>
            </div>
            <div className="space-y-3">
              {pendingTasks.slice(0, 4).map((t: any) => (
                <div key={t.id} className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all hover:bg-white/[0.02]", isDark ? "bg-white/[0.01] border-white/5" : "bg-zinc-50 border-zinc-100")}>
                  <div className="w-4 h-4 rounded border border-violet-500/30 flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-violet-500 opacity-0 group-hover:opacity-100"/></div>
                  <p className={cn("text-sm font-bold truncate", isDark ? "text-white" : "text-black")}>{t.title}</p>
                  <div className={cn("ml-auto px-2 py-0.5 rounded text-[8px] font-black uppercase", isDark ? "bg-violet-500/10 text-violet-400" : "bg-violet-50 text-violet-700")}>{t.listCategory}</div>
                </div>
              ))}
              {pendingTasks.length === 0 && <p className={cn("text-xs py-4 text-center", tc.ghostText)}>Tidak ada tugas prioritas</p>}
            </div>
          </div>
          <div className={cn(tc.card, "rounded-2xl p-6 space-y-4 shadow-sm")}>
            <h3 className={cn("text-xs font-black uppercase tracking-widest", isDark ? "text-white" : "text-black")}>Analisis Pengeluaran</h3>
            <div className="space-y-3">
              {categoryBreakdown.filter((c:any) => c.type === 'expense').slice(0, 5).map((c: any, i: number) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                    <span className={tc.textMuted}>{c.name}</span>
                    <span className={isDark ? "text-white" : "text-black"}>{fmt(c.total)}</span>
                  </div>
                  <div className={cn("h-1 rounded-full overflow-hidden", isDark ? "bg-white/5" : "bg-zinc-100")}>
                    <div className="h-full bg-rose-500" style={{ width: `${Math.min(100, (c.total / Math.max(1, monthlyStats.expense)) * 100)}%` }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TasksView({ taskFilter, filteredTasks, showAddTask, setShowAddTask, newTaskTitle, setNewTaskTitle, handleInlineAddTask, handleToggleTask, setSelectedTask, showCompleted, setShowCompleted, completedTasksList, tc, isDark }: any) {
  return <div className="max-w-3xl mx-auto space-y-6">
    <div className="flex items-center justify-between"><h1 className={cn("text-3xl font-black tracking-tighter uppercase", isDark?"text-white":"text-black")}>{taskFilter==='completed'?'Completed':taskFilter.replace(/-/g,' ')}</h1><button onClick={()=>setShowAddTask(true)} className="px-4 py-2 bg-violet-600 rounded-lg text-xs font-black text-white shadow-lg flex items-center gap-1.5 hover:bg-violet-500 transition-all"><Plus size={14}/>Tambah</button></div>
    {showAddTask && <div className={cn("border rounded-xl p-3 flex items-center gap-3 transition-all", tc.card)}><Circle size={18} className={cn("shrink-0", tc.ghostText)}/><input autoFocus value={newTaskTitle} onChange={(e:any)=>setNewTaskTitle(e.target.value)} onKeyDown={(e:any)=>{if(e.key==='Enter')handleInlineAddTask();if(e.key==='Escape'){setShowAddTask(false);setNewTaskTitle("");}}} placeholder="Ketik judul tugas, tekan Enter..." className={cn("flex-1 bg-transparent border-none text-sm font-bold focus:ring-0 focus:outline-none p-0", isDark?"text-white placeholder:text-zinc-700":"text-black placeholder:text-zinc-300")}/><button onClick={handleInlineAddTask} className="px-3 py-1.5 bg-violet-600 rounded text-[10px] font-black text-white hover:bg-violet-700 transition-all">Save</button><button onClick={()=>{setShowAddTask(false);setNewTaskTitle("");}} className={cn("hover:text-violet-500 transition-colors", tc.textMuted)}><X size={14}/></button></div>}
    <div className="space-y-2">{filteredTasks.filter((t:any)=>t.status==='pending').map((t:any)=><TR key={t.id} task={t} onToggle={()=>handleToggleTask(t)} onClick={()=>setSelectedTask(t)} tc={tc} isDark={isDark}/>)}</div>
    {taskFilter!=='completed'&&completedTasksList.length>0&&<div className="pt-4"><button onClick={()=>setShowCompleted(!showCompleted)} className={cn("flex items-center gap-1.5 mb-3 transition-colors", tc.textMuted, "hover:text-violet-400")}><ChevronDown size={14} className={cn("transition-transform",!showCompleted&&"-rotate-90")}/><span className="text-xs font-black uppercase tracking-widest">Completed ({completedTasksList.length})</span></button>{showCompleted&&<div className="space-y-1.5">{completedTasksList.slice(0,10).map((t:any)=><TR key={t.id} task={t} onToggle={()=>handleToggleTask(t)} onClick={()=>setSelectedTask(t)} tc={tc} isDark={isDark}/>)}</div>}</div>}
  </div>;
}

function FinDashView(props: any) {
  return <DashboardView {...props}/>;
}

function FinJournalView({ transactions, fmt, period, tc, isDark }: any) {
  return <div className="max-w-5xl mx-auto space-y-6">
    <div className="flex items-center justify-between"><h1 className={cn("text-3xl font-black tracking-tighter", isDark?"text-white":"text-black")}>Riwayat Transaksi</h1><div className="flex gap-2">
      <button onClick={()=>exportJournalExcel(transactions,period)} className="px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-xs font-black text-emerald-400 flex items-center gap-1.5 hover:bg-emerald-600/30 transition-colors"><Download size={14}/>Excel</button>
      <button onClick={()=>exportJournalPDF(transactions,period)} className="px-4 py-2 bg-violet-600/20 border border-violet-500/30 rounded-lg text-xs font-black text-violet-400 flex items-center gap-1.5 hover:bg-violet-600/30 transition-colors"><Download size={14}/>PDF</button>
    </div></div>
    <div className={cn(tc.card, "rounded-2xl overflow-hidden shadow-sm")}><table className="w-full text-left"><thead className={cn("border-b", isDark?"bg-white/5 border-white/5":"bg-[#F8F9FA] border-[#DADCE0]")}><tr><th className={cn("px-6 py-4 text-[10px] font-black uppercase tracking-widest", tc.textMuted)}>Tanggal</th><th className={cn("px-6 py-4 text-[10px] font-black uppercase tracking-widest", tc.textMuted)}>Kategori</th><th className={cn("px-6 py-4 text-[10px] font-black uppercase tracking-widest", tc.textMuted)}>Deskripsi</th><th className={cn("px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right", tc.textMuted)}>Jumlah</th></tr></thead><tbody className={cn("divide-y", tc.border)}>
      {transactions.map((tx:any)=><tr key={tx.id} className="hover:bg-white/[0.02] transition-colors"><td className={cn("px-6 py-3 text-xs", tc.textMuted)}>{new Date(tx.date).toLocaleDateString('id-ID')}</td><td className="px-6 py-3"><span className={cn("px-2.5 py-0.5 rounded text-[9px] font-black uppercase",tx.type==='income'?'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20':'bg-rose-500/10 text-rose-400 border border-rose-500/20')}>{tx.category}</span></td><td className={cn("px-6 py-3 text-sm font-bold", isDark?"text-white":"text-black")}>{tx.note||tx.category}</td><td className={cn("px-6 py-3 text-sm font-black text-right",tx.type==='income'?'text-emerald-400':'text-rose-400')}>{tx.type==='income'?'+':'-'}{fmt(tx.amount)}</td></tr>)}
      {transactions.length===0&&<tr><td colSpan={4} className={cn("px-6 py-10 text-center text-sm", tc.textMuted)}>Belum ada transaksi</td></tr>}
    </tbody></table></div>
  </div>;
}

function FinAccountsView({ accounts, transactions, totalBalance, fmt, setShowAddAccount, setShowTransfer, tc, isDark }: any) {
  return <div className="max-w-5xl mx-auto space-y-6">
    <div className="flex items-center justify-between"><h1 className={cn("text-3xl font-black tracking-tighter", isDark?"text-white":"text-black")}>Manajemen Rekening</h1><div className="flex gap-2">
      <button onClick={()=>setShowTransfer(true)} className={cn("px-4 py-2 border rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all", isDark?"bg-white/5 border-white/10 hover:bg-white/10":"bg-[#F8F9FA] border-[#DADCE0] hover:bg-zinc-100")}><ArrowRightLeft size={14}/>Transfer</button>
      <button onClick={()=>setShowAddAccount(true)} className="px-4 py-2 bg-emerald-600 rounded-lg text-xs font-black text-white flex items-center gap-1.5 shadow-lg"><Plus size={14}/>Tambah</button>
    </div></div>
    <div className="bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-500/20 rounded-2xl p-6 text-center"><p className={cn("text-xs mb-1", tc.textMuted)}>Total Saldo</p><p className={cn("text-3xl font-black tracking-tighter", isDark?"text-white":"text-black")}>{fmt(totalBalance)}</p><p className={cn("text-xs mt-1", tc.ghostText)}>{accounts.length} rekening</p></div>
    <div className="grid grid-cols-3 gap-4">{accounts.map((acc:any)=>{const at=transactions.filter((t:any)=>t.accountId===acc.id);const ai=at.filter((t:any)=>t.type==='income').reduce((a:number,c:any)=>a+c.amount,0);const ao=at.filter((t:any)=>t.type==='expense').reduce((a:number,c:any)=>a+c.amount,0);return <div key={acc.id} className={cn(tc.card, "rounded-2xl p-5 space-y-3 hover:border-violet-500/30 transition-all group shadow-sm")}><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-violet-600/20 flex items-center justify-center"><Wallet size={16} className="text-violet-400"/></div><div><p className={cn("text-sm font-black", isDark?"text-white":"text-black")}>{acc.name}</p><p className={cn("text-[9px] capitalize", tc.textMuted)}>{acc.type}</p></div></div><p className={cn("text-xl font-black tracking-tighter", isDark?"text-white":"text-black")}>{fmt(acc.balance)}</p><div className="grid grid-cols-2 gap-2"><div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2.5 text-center"><p className="text-[8px] text-emerald-500 font-bold">Masuk</p><p className="text-xs font-black text-emerald-400">{fmt(ai)}</p></div><div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-2.5 text-center"><p className="text-[8px] text-rose-500 font-bold">Keluar</p><p className="text-xs font-black text-rose-400">{fmt(ao)}</p></div></div><p className={cn("text-[9px]", tc.ghostText)}>{at.length} transaksi</p></div>;})}</div>
  </div>;
}

function FinCategoriesView({ categories, fmt, setShowAddCategory, fetchData, tc, isDark }: any) {
  const incomeCategories = categories.filter((c:any) => c.type === 'income');
  const expenseCategories = categories.filter((c:any) => c.type === 'expense');
  return <div className="max-w-5xl mx-auto space-y-6">
    <div className="flex items-center justify-between">
      <h1 className={cn("text-3xl font-black tracking-tighter", isDark?"text-white":"text-black")}>Manajemen Kategori</h1>
      <button onClick={()=>setShowAddCategory(true)} className="px-4 py-2 bg-emerald-600 rounded-lg text-xs font-black text-white flex items-center gap-1.5 shadow-lg"><Plus size={14}/>Tambah Kategori</button>
    </div>
    <div className="bg-gradient-to-r from-emerald-600/10 to-blue-600/10 border border-emerald-500/20 rounded-2xl p-5 text-center shadow-sm">
      <p className={cn("text-xs mb-1", tc.textMuted)}>AI akan otomatis menggunakan kategori ini saat mengkategorikan transaksi</p>
      <p className={cn("text-sm font-black", isDark?"text-white":"text-black")}>{categories.length} kategori aktif ({incomeCategories.length} pemasukan, {expenseCategories.length} pengeluaran)</p>
    </div>

    {/* Income Categories */}
    <div className="space-y-3">
      <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><TrendingUp size={14}/>Kategori Pemasukan</h3>
      <div className="grid grid-cols-3 gap-3">
        {incomeCategories.map((cat:any)=>(
          <div key={cat.id} className={cn(tc.card, "rounded-xl p-4 space-y-2 group hover:border-emerald-500/30 transition-all shadow-sm")}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500"/>
                <span className={cn("text-sm font-black", isDark?"text-white":"text-black")}>{cat.name}</span>
              </div>
              <button onClick={async()=>{await deleteCategory(cat.id);await fetchData();}} className={cn("opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all", tc.textMuted)}><Trash2 size={14}/></button>
            </div>
            <span className="inline-block px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase rounded">Pemasukan</span>
            {cat.keywords?.length > 0 && <div className="flex flex-wrap gap-1">{cat.keywords.map((kw:string,i:number)=><span key={i} className={cn("px-1.5 py-0.5 text-[8px] font-bold rounded", isDark?"bg-white/5 text-zinc-500":"bg-zinc-100 text-zinc-400")}>{kw}</span>)}</div>}
          </div>
        ))}
        {incomeCategories.length===0 && <p className={cn("text-xs col-span-3", tc.ghostText)}>Belum ada kategori pemasukan</p>}
      </div>
    </div>

    {/* Expense Categories */}
    <div className="space-y-3">
      <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-2"><TrendingDown size={14}/>Kategori Pengeluaran</h3>
      <div className="grid grid-cols-3 gap-3">
        {expenseCategories.map((cat:any)=>(
          <div key={cat.id} className={cn(tc.card, "rounded-xl p-4 space-y-2 group hover:border-rose-500/30 transition-all shadow-sm")}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-rose-500"/>
                <span className={cn("text-sm font-black", isDark?"text-white":"text-black")}>{cat.name}</span>
              </div>
              <button onClick={async()=>{await deleteCategory(cat.id);await fetchData();}} className={cn("opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all", tc.textMuted)}><Trash2 size={14}/></button>
            </div>
            <span className="inline-block px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[8px] font-black uppercase rounded">Pengeluaran</span>
            {cat.keywords?.length > 0 && <div className="flex flex-wrap gap-1">{cat.keywords.map((kw:string,i:number)=><span key={i} className={cn("px-1.5 py-0.5 text-[8px] font-bold rounded", isDark?"bg-white/5 text-zinc-500":"bg-zinc-100 text-zinc-400")}>{kw}</span>)}</div>}
          </div>
        ))}
        {expenseCategories.length===0 && <p className={cn("text-xs col-span-3", tc.ghostText)}>Belum ada kategori pengeluaran</p>}
      </div>
    </div>
  </div>;
}

function FinReportsView({ monthlyStats, categoryBreakdown, fmt, reportTab, setReportTab, period, tc, isDark }: any) {
  return <div className="max-w-4xl mx-auto space-y-6">
    <div className="flex items-center justify-between"><h1 className={cn("text-3xl font-black tracking-tighter", isDark?"text-white":"text-black")}>Laporan Keuangan</h1><div className="flex gap-2">
      <button onClick={()=>exportIncomeStatementExcel(monthlyStats.income,monthlyStats.expense,categoryBreakdown,period)} className="px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-xs font-black text-emerald-400 flex items-center gap-1.5 hover:bg-emerald-600/30"><Download size={14}/>Excel</button>
      <button onClick={()=>exportIncomeStatementPDF(monthlyStats.income,monthlyStats.expense,categoryBreakdown,period)} className="px-4 py-2 bg-violet-600/20 border border-violet-500/30 rounded-lg text-xs font-black text-violet-400 flex items-center gap-1.5 hover:bg-violet-600/30"><Download size={14}/>PDF</button>
    </div></div>
    <div className={cn("flex gap-1.5 p-1 rounded-xl border transition-all", isDark?"bg-zinc-900/30 border-white/5":"bg-zinc-50 border-zinc-200")}>{[{id:'income',l:'Laba Rugi'},{id:'category',l:'Kategori'},{id:'monthly',l:'Bulanan'}].map(t=><button key={t.id} onClick={()=>setReportTab(t.id)} className={cn("px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",reportTab===t.id?'bg-violet-600 text-white shadow-lg':'text-zinc-400 hover:text-black')}>{t.l}</button>)}</div>
    {reportTab==='income'&&<div className={cn(tc.card, "rounded-2xl p-8 space-y-8 shadow-sm")}>
      <h2 className={cn("text-base font-black uppercase tracking-widest border-b pb-3", tc.border, isDark?"text-white":"text-black")}>Income Statement</h2>
      <div className="space-y-3"><p className={cn("text-[10px] font-black uppercase tracking-widest", tc.textMuted)}>Pendapatan</p>{categoryBreakdown.filter((c:any)=>c.type==='income').map((c:any,i:number)=><div key={i} className="flex justify-between px-3"><span className={cn("text-sm", tc.textMuted)}>{c.name}</span><span className={cn("text-sm font-black", isDark?"text-white":"text-black")}>{fmt(c.total)}</span></div>)}<div className={cn("flex justify-between px-3 pt-2 border-t", tc.border)}><span className={cn("text-sm font-black transition-colors", isDark?"text-white":"text-black")}>Total Pendapatan</span><span className="text-sm font-black text-emerald-400">{fmt(monthlyStats.income)}</span></div></div>
      <div className="space-y-3"><p className={cn("text-[10px] font-black uppercase tracking-widest", tc.textMuted)}>Pengeluaran</p>{categoryBreakdown.filter((c:any)=>c.type==='expense').map((c:any,i:number)=><div key={i} className="flex justify-between px-3"><span className={cn("text-sm", tc.textMuted)}>{c.name}</span><span className={cn("text-sm font-black", isDark?"text-white":"text-black")}>{fmt(c.total)}</span></div>)}<div className={cn("flex justify-between px-3 pt-2 border-t", tc.border)}><span className={cn("text-sm font-black transition-colors", isDark?"text-white":"text-black")}>Total Pengeluaran</span><span className="text-sm font-black text-rose-400">{fmt(monthlyStats.expense)}</span></div></div>
      <div className={cn("flex justify-between items-center pt-4 border-t-2 border-dashed", isDark?"border-white/10":"border-zinc-200")}><div><p className={cn("text-[10px] font-black uppercase tracking-widest", tc.textMuted)}>Laba Bersih</p><p className={cn("text-3xl font-black tracking-tighter mt-1", isDark?"text-white":"text-black")}>{fmt(monthlyStats.income-monthlyStats.expense)}</p></div></div>
    </div>}
    {reportTab==='category'&&<div className={cn(tc.card, "rounded-2xl overflow-hidden shadow-sm")}><table className="w-full text-left"><thead className={cn(isDark?"bg-white/5":"bg-[#F8F9FA]")}><tr><th className={cn("px-6 py-4 text-[10px] font-black uppercase", tc.textMuted)}>Kategori</th><th className={cn("px-6 py-4 text-[10px] font-black uppercase", tc.textMuted)}>Tipe</th><th className={cn("px-6 py-4 text-[10px] font-black uppercase text-center", tc.textMuted)}>Jumlah Tx</th><th className={cn("px-6 py-4 text-[10px] font-black uppercase text-right", tc.textMuted)}>Total</th></tr></thead><tbody className={cn("divide-y", tc.border)}>{categoryBreakdown.map((c:any,i:number)=><tr key={i} className="hover:bg-white/[0.02]"><td className={cn("px-6 py-3 text-sm font-bold", isDark?"text-white":"text-black")}>{c.name}</td><td className="px-6 py-3"><span className={cn("px-2.5 py-0.5 rounded text-[9px] font-black uppercase",c.type==='income'?'bg-emerald-500/10 text-emerald-400':'bg-rose-500/10 text-rose-400')}>{c.type==='income'?'Masuk':'Keluar'}</span></td><td className={cn("px-6 py-3 text-sm font-bold text-center", tc.textMuted)}>{c.count}</td><td className={cn("px-6 py-3 text-sm font-black text-right",c.type==='income'?'text-emerald-400':'text-rose-400')}>{fmt(c.total)}</td></tr>)}</tbody></table></div>}
    {reportTab==='monthly'&&<div className={cn(tc.card, "rounded-2xl p-8 space-y-4 shadow-sm")}><h3 className={cn("text-xs font-black uppercase tracking-widest", isDark?"text-white":"text-black")}>Ringkasan Bulan Ini</h3><div className="grid grid-cols-3 gap-4"><div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5 text-center"><p className={cn("text-xs mb-1", tc.textMuted)}>Total Masuk</p><p className="text-xl font-black text-emerald-400">{fmt(monthlyStats.income)}</p></div><div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-5 text-center"><p className={cn("text-xs mb-1", tc.textMuted)}>Total Keluar</p><p className="text-xl font-black text-rose-400">{fmt(monthlyStats.expense)}</p></div><div className="bg-violet-500/5 border border-violet-500/10 rounded-xl p-5 text-center"><p className={cn("text-xs mb-1", tc.textMuted)}>Saldo</p><p className="text-xl font-black text-violet-400">{fmt(monthlyStats.income-monthlyStats.expense)}</p></div></div></div>}
  </div>;
}

function FinDebtsView({ tc, isDark }: any) {
  return <div className="max-w-3xl mx-auto space-y-6"><h1 className={cn("text-3xl font-black tracking-tighter", isDark?"text-white":"text-black")}>Piutang & Hutang</h1><div className={cn(tc.card, "rounded-2xl p-8 text-center space-y-3 shadow-sm")}><Users size={40} className={cn("mx-auto", tc.ghostText)}/><p className={cn("text-sm", tc.text)}>Fitur piutang dan hutang siap digunakan.</p><p className={cn("text-xs", tc.textMuted)}>Gunakan perintah: "Hutang Budi 500rb" atau "Piutang Andi 1jt"</p></div></div>;
}

// ===================== TINY COMPONENTS =====================
function SB({active,onClick,icon,label,color,badge,tc,isDark}:any){return<button onClick={onClick} className={cn("w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group",active?tc.activeNav:cn(tc.textMuted, isDark?"hover:bg-white/5 hover:text-white":"hover:bg-zinc-100 hover:text-black"))}><div className="flex items-center gap-2.5"><span className={cn(active?'text-violet-400':'text-zinc-400',color)}>{icon}</span><span className="text-[11px] font-bold">{label}</span></div>{badge!==undefined&&badge>0&&<span className="text-[9px] font-black bg-violet-600 text-white px-1.5 py-0.5 rounded-full">{badge}</span>}</button>;}

function TR({task,onToggle,onClick,tc,isDark}:any){return<div onClick={onClick} className={cn("group border rounded-xl p-3.5 hover:border-violet-500/30 transition-all flex items-center justify-between cursor-pointer", tc.card)}><div className="flex items-center gap-3"><button onClick={(e:any)=>{e.stopPropagation();onToggle();}} className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",task.status==='completed'?'bg-violet-600 border-violet-600 text-white':cn(tc.border, "text-transparent hover:border-violet-500/50"))}><CheckCircle size={14}/></button><div><h4 className={cn("text-sm font-bold transition-all",task.status==='completed'?tc.textMuted:isDark?"text-zinc-200":"text-black",task.status==='completed'&&'line-through')}>{task.title}</h4><div className="flex items-center gap-2 mt-0.5 flex-wrap"><span className="text-[8px] font-bold text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">{task.listCategory}</span>{task.dueTime&&<span className={cn("text-[8px] flex items-center gap-0.5", tc.textMuted)}><Clock size={9}/>{task.dueTime}</span>}{task.subtasks?.length>0&&<span className={cn("text-[8px] flex items-center gap-0.5", tc.textMuted)}><Layers size={9}/>{task.subtasks.length}</span>}{task.priority==='high'&&<span className="text-[8px] font-bold text-rose-400">● High</span>}</div></div></div></div>;}

function AttrBox({label,icon,children,isDark}:any){return<div className={cn("border rounded-xl p-3.5 space-y-1.5", isDark?"bg-white/[0.02] border-white/5":"bg-zinc-50 border-zinc-200")}><p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">{icon}{label}</p>{children}</div>;}

function Modal({onClose,title,children,isDark}:any){return<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center" onClick={onClose}><div onClick={(e:any)=>e.stopPropagation()} className={cn("border rounded-2xl p-6 w-[380px] space-y-4 shadow-2xl animate-in zoom-in-95", isDark?"bg-zinc-900 border-white/10":"bg-white border-zinc-200")}><div className="flex justify-between items-center"><h3 className={cn("text-base font-black uppercase tracking-tight", isDark?"text-white":"text-black")}>{title}</h3><button onClick={onClose} className="text-zinc-500 hover:text-black transition-colors"><X size={18}/></button></div>{children}</div></div>;}

function AuthOverlay({ mode, setMode, onSubmit, loading, error, success, isDark, tc }: any) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60">
      <div className={cn("w-full max-w-md rounded-3xl border p-8 space-y-8 shadow-2xl transition-all", tc.card)}>
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-violet-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Bot className="text-white" size={32} />
          </div>
          <h2 className={cn("text-2xl font-black tracking-tighter", isDark ? "text-white" : "text-black")}>
            Log<span className="text-violet-500">Fi</span>
          </h2>
          <p className={tc.textMuted + " text-xs font-bold uppercase tracking-widest"}>
            {mode === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun LogFi Gratis'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Email Address</label>
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="name@company.com"
              className={cn("w-full px-4 py-3 rounded-xl border text-sm font-bold focus:ring-2 focus:ring-violet-500 transition-all outline-none", 
                isDark ? "bg-white/5 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-black")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">Secure Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              placeholder="••••••••"
              className={cn("w-full px-4 py-3 rounded-xl border text-sm font-bold focus:ring-2 focus:ring-violet-500 transition-all outline-none", 
                isDark ? "bg-white/5 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-black")}
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black uppercase text-center tracking-widest">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase text-center tracking-widest">
              {success}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : (mode === 'login' ? 'Unlock Access' : 'Create Account')}
          </button>
        </form>

        <div className="text-center pt-4">
          <button 
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", tc.textMuted, "hover:text-violet-500")}
          >
            {mode === 'login' ? "Don't have access? Request Invitation" : "Already an Elite? Secure Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
