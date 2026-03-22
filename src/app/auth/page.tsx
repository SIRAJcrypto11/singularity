"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, RefreshCw } from "lucide-react";
import axios from "axios";

export default function RootEntry() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data.authenticated) {
          router.replace('/app');
        } else {
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");
    const email = (e.target as any).email.value;
    const password = (e.target as any).password.value;

    try {
      if (authMode === 'login') {
        await axios.post('/api/auth/login', { email, password });
        router.push('/app');
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#050506]">
        <RefreshCw className="animate-spin text-violet-500" />
      </div>
    );
  }

  // The landing page handles its own view via /landing route,
  // but if they come to /, we show the Auth Overlay.
  // We can add a "Back to Website" button.
  return (
    <div className="h-screen bg-[#050506] relative overflow-hidden flex items-center justify-center">
      {/* Background decorations matching landing page */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz48L3N2Zz4=')] opacity-50 block" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050506] via-transparent to-[#050506]" />
      
      <div className="relative z-10 w-full max-w-md p-4">
        <div className="text-center mb-8">
          <button 
            onClick={() => router.push('/')}
            className="text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors tracking-widest"
          >
            ← Kembali ke Website
          </button>
        </div>

        <div className="w-full rounded-3xl border border-white/10 bg-[#09090a]/80 backdrop-blur-xl p-8 space-y-8 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-violet-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Bot className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-black tracking-tighter text-white">
              Log<span className="text-violet-500">Fi</span>
            </h2>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
              {authMode === 'login' ? 'Masuk ke Sistem' : 'Buat Akun Gratis'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <input 
                name="email" 
                type="email" 
                required 
                placeholder="Email Address"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-bold focus:ring-2 focus:ring-violet-500 transition-all outline-none"
              />
            </div>
            <div className="space-y-1">
              <input 
                name="password" 
                type="password" 
                required 
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-bold focus:ring-2 focus:ring-violet-500 transition-all outline-none"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black uppercase text-center tracking-widest">
                {authError}
              </div>
            )}

            {authSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase text-center tracking-widest">
                {authSuccess}
              </div>
            )}

            <button 
              type="submit" 
              disabled={authLoading}
              className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-2"
            >
              {authLoading ? <RefreshCw className="animate-spin" size={16} /> : (authMode === 'login' ? 'Sign In' : 'Register')}
            </button>
          </form>

          <div className="text-center pt-4">
            <button 
              type="button"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-violet-500 transition-colors"
            >
              {authMode === 'login' ? "Belum punya akun? Daftar" : "Sudah punya akun? Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
