"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  DollarSign, CheckCircle2, Zap, ArrowRight, Menu, X,
  BarChart3, TrendingUp, Shield, Sparkles, Quote, ChevronRight,
  Flame, Star
} from "lucide-react";

/* ============================================ */
/* HOOKS                                        */
/* ============================================ */
function useScrollAnim() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("anim-show"); });
    }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });
    document.querySelectorAll(".anim-hidden,.anim-hidden-left,.anim-hidden-right,.anim-hidden-scale")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function useCountUp(target: number, dur = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let s = 0; const step = target / (dur / 16);
        const t = setInterval(() => { s += step; if (s >= target) { setCount(target); clearInterval(t); } else setCount(Math.floor(s)); }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, dur]);
  return { count, ref };
}

function useMouseTilt(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const parent = el.closest('section');
    if (!parent) return;
    const onMove = (e: MouseEvent) => {
      const r = parent.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      el.style.transform = `perspective(1000px) rotateY(${x * 4}deg) rotateX(${-y * 3}deg)`;
    };
    const onLeave = () => { el.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)'; };
    parent.addEventListener('mousemove', onMove);
    parent.addEventListener('mouseleave', onLeave);
    return () => { parent.removeEventListener('mousemove', onMove); parent.removeEventListener('mouseleave', onLeave); };
  }, [ref]);
}

/* ============================================ */
/* MAIN PAGE                                    */
/* ============================================ */
export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mockupRef = useRef<HTMLDivElement>(null);
  useScrollAnim();
  useMouseTilt(mockupRef);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 font-[family-name:var(--font-inter)] bg-dot-grid noise-overlay">
      <ScrollProgress />

      {/* ===== ANIMATED BACKGROUND ORBS ===== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full bg-violet-600/[0.06] blur-[150px]" style={{animation:'orbDrift1 20s ease-in-out infinite'}}/>
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-600/[0.04] blur-[120px]" style={{animation:'orbDrift2 25s ease-in-out infinite'}}/>
        <div className="absolute top-[50%] left-[40%] w-[400px] h-[400px] rounded-full bg-emerald-500/[0.03] blur-[100px]" style={{animation:'orbDrift3 30s ease-in-out infinite'}}/>
      </div>

      {/* ===== NAVBAR ===== */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? "bg-black/60 backdrop-blur-2xl border-b border-white/[0.06] shadow-lg shadow-black/20" : "bg-transparent border-b border-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <a href="/landing" className="flex items-center gap-0.5 group">
            <span className="text-2xl font-[900] tracking-[-0.05em] text-white transition-all group-hover:text-violet-300">Log</span>
            <span className="text-2xl font-[900] tracking-[-0.05em] text-violet-500 transition-all group-hover:text-violet-400">Fi</span>
          </a>
          <div className="hidden md:flex items-center gap-10">
            {[["#features","Fitur"],["#how-it-works","Cara Kerja"],["#pricing","Harga"],["#testimonials","Testimoni"]].map(([href,label])=>(
              <a key={href} href={href} className="text-[10px] font-[800] uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors link-underline">{label}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <a href="/" className="text-[10px] font-[800] uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">Masuk</a>
            {/* Separated CTA icon (Nuraform-style) */}
            <a href="/" className="flex items-center gap-0 group">
              <span className="bg-violet-600 group-hover:bg-violet-500 text-white text-[9px] font-[900] uppercase tracking-[0.15em] px-6 py-3 rounded-l-full transition-all btn-shimmer">
                Mulai Gratis
              </span>
              <span className="bg-violet-500 group-hover:bg-violet-400 text-white w-10 h-10 rounded-full flex items-center justify-center -ml-2 shadow-lg shadow-violet-500/30 transition-all group-hover:-translate-y-0.5">
                <ArrowRight size={14} strokeWidth={3}/>
              </span>
            </a>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-zinc-400 hover:text-white p-2">
            {mobileMenu ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-black/90 backdrop-blur-2xl border-t border-white/5 px-6 py-6 space-y-4">
            {[["#features","Fitur"],["#how-it-works","Cara Kerja"],["#pricing","Harga"],["#testimonials","Testimoni"]].map(([href,label])=>(
              <a key={href} href={href} onClick={()=>setMobileMenu(false)} className="block text-sm font-bold text-zinc-300 hover:text-white">{label}</a>
            ))}
            <a href="/" className="block w-full text-center bg-violet-600 text-white text-sm font-[900] py-3 rounded-xl mt-4">Mulai Gratis →</a>
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 lg:gap-10 items-center relative z-10">
          <div className="space-y-8">
            <div className="anim-hidden">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/[0.07] text-[8px] font-[900] uppercase tracking-[0.25em] text-violet-300">
                <Sparkles size={11}/> Gratis Selamanya · Tanpa Kartu Kredit
              </span>
            </div>

            {/* Word-by-word reveal headline */}
            <h1>
              <span className="block text-[clamp(2.8rem,5.5vw,5rem)] font-[900] tracking-[-0.05em] leading-[1.02]">
                {"Log your money.".split(" ").map((w, i) => (
                  <span key={i} className="word-reveal inline-block mr-[0.25em] text-white" style={{ animationDelay: `${300 + i * 100}ms` }}>{w}</span>
                ))}
              </span>
              <span className="block text-[clamp(2.8rem,5.5vw,5rem)] font-[900] tracking-[-0.05em] leading-[1.02] mt-1">
                {"Own your life.".split(" ").map((w, i) => (
                  <span key={i} className="word-reveal inline-block mr-[0.25em] text-shimmer" style={{ animationDelay: `${700 + i * 100}ms` }}>{w}</span>
                ))}
              </span>
            </h1>

            <p className="anim-hidden anim-delay-3 text-[15px] text-zinc-400 max-w-[460px] leading-[1.7]">
              Catat keuangan, kelola tugas, lacak kebiasaan — semua dalam satu dashboard. 
              Setiap aksi = data. Setiap data = keputusan lebih baik.
            </p>

            <div className="anim-hidden anim-delay-4 flex flex-wrap items-center gap-4">
              {/* Separated CTA icon */}
              <a href="/" className="flex items-center gap-0 group">
                <span className="bg-violet-600 group-hover:bg-violet-500 text-white text-[10px] font-[900] uppercase tracking-[0.15em] px-8 py-4 rounded-l-2xl transition-all btn-shimmer animate-cta-pulse">
                  Mulai Gratis
                </span>
                <span className="bg-violet-500 group-hover:bg-violet-400 text-white w-14 h-14 rounded-full flex items-center justify-center -ml-3 shadow-xl shadow-violet-500/30 transition-all group-hover:-translate-y-1 group-hover:scale-105 border-2 border-violet-400/20">
                  <ArrowRight size={18} strokeWidth={3}/>
                </span>
              </a>
              <a href="#showcase" className="flex items-center gap-2.5 border border-white/10 hover:border-violet-500/30 text-zinc-400 hover:text-white px-7 py-4 rounded-2xl font-bold text-sm transition-all group">
                <span className="w-6 h-6 rounded-full border-2 border-zinc-600 group-hover:border-violet-500 flex items-center justify-center transition-colors"><ChevronRight size={12}/></span>
                Lihat Demo
              </a>
            </div>

            <p className="anim-hidden anim-delay-5 text-[10px] text-zinc-600 flex items-center gap-2">
              <Shield size={11} className="text-emerald-500"/> Gratis selamanya · Tanpa kartu kredit · Setup 2 menit
            </p>
          </div>

          {/* 3D Tilting Dashboard Mockup */}
          <div className="relative z-10">
            {/* Ambient glow behind mockup */}
            <div className="absolute inset-0 bg-violet-600/[0.06] blur-[80px] scale-[1.3] rounded-full pointer-events-none"/>
            <div ref={mockupRef} className="relative transition-transform duration-150 ease-out" style={{transformStyle:'preserve-3d'}}>
              <div className="bg-[#111113] border border-white/[0.06] rounded-2xl shadow-2xl shadow-violet-500/[0.08] overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"/>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"/>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"/>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-[9px] text-zinc-600 bg-white/[0.03] px-4 py-1 rounded-md border border-white/5">🔒 logfi.app/dashboard</span>
                  </div>
                </div>
                {/* Dashboard content */}
                <div className="p-5 space-y-4 min-h-[320px]">
                  <div className="grid grid-cols-4 gap-2.5">
                    {[
                      {l:"Saldo",v:"Rp 12.5jt",c:"text-emerald-400",ic:<DollarSign size={13}/>},
                      {l:"Pemasukan",v:"Rp 8.2jt",c:"text-blue-400",ic:<TrendingUp size={13}/>},
                      {l:"Pengeluaran",v:"Rp 3.1jt",c:"text-rose-400",ic:<BarChart3 size={13}/>},
                      {l:"Streak",v:"21 Hari",c:"text-amber-400",ic:<Flame size={13}/>},
                    ].map((s,i) => (
                      <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5 text-center">
                        <div className={`${s.c} mx-auto mb-1`}>{s.ic}</div>
                        <p className="text-[8px] text-zinc-600 font-[800] uppercase">{s.l}</p>
                        <p className={`text-[11px] font-[900] ${s.c} font-[family-name:var(--font-mono)]`}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
                    <p className="text-[8px] font-[900] uppercase tracking-widest text-zinc-600 mb-2">Tren 30 Hari</p>
                    <svg viewBox="0 0 360 70" className="w-full h-14">
                      <defs>
                        <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25"/><stop offset="100%" stopColor="#8B5CF6" stopOpacity="0"/></linearGradient>
                      </defs>
                      <path d="M0,55 Q60,45 90,30 T180,22 T270,35 T360,12" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round"/>
                      <path d="M0,55 Q60,45 90,30 T180,22 T270,35 T360,12 L360,70 L0,70 Z" fill="url(#hg)"/>
                    </svg>
                  </div>
                  <div className="flex gap-[3px] flex-wrap">
                    {Array.from({length:56}).map((_,i) => (
                      <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${[0,3,7,12,20,25,31,40,48,52].includes(i)?'bg-emerald-500/60':[1,5,9,15,22,29,35,42,50].includes(i)?'bg-emerald-500/30':'bg-white/[0.03]'}`}/>
                    ))}
                  </div>
                </div>
              </div>
              {/* Multiple floating badges */}
              <div className="absolute -top-4 -right-4 animate-pop-in" style={{animationDelay:'1.2s',opacity:0}}>
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-2 rounded-xl text-[9px] font-[900] shadow-lg backdrop-blur-md flex items-center gap-1.5">
                  <CheckCircle2 size={12}/> Pengeluaran Terlacak!
                </div>
              </div>
              <div className="absolute -bottom-3 -left-3 animate-pop-in" style={{animationDelay:'1.8s',opacity:0}}>
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3.5 py-2 rounded-xl text-[9px] font-[900] shadow-lg backdrop-blur-md flex items-center gap-1.5">
                  <Flame size={12}/> Streak: 21 Hari 🔥
                </div>
              </div>
              <div className="absolute top-1/3 -left-6 animate-pop-in" style={{animationDelay:'2.2s',opacity:0}}>
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3.5 py-2 rounded-xl text-[9px] font-[900] shadow-lg backdrop-blur-md flex items-center gap-1.5">
                  <TrendingUp size={12}/> +Rp 5.000.000
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DIVIDER ===== */}
      <div className="section-glow-divider"/>

      {/* ===== PROBLEM STATEMENT ===== */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="anim-hidden text-[clamp(1.8rem,3.8vw,3rem)] font-[900] tracking-[-0.03em] leading-[1.12]">
            Kamu tidak butuh aplikasi keuangan <span className="text-violet-400">lagi</span>. 
            Kamu butuh sistem yang <span className="text-shimmer">benar-benar bekerja</span>.
          </h2>
          <p className="anim-hidden anim-delay-1 text-zinc-500 max-w-lg mx-auto leading-relaxed text-[15px]">
            Sudah coba spreadsheet. Sudah coba apps. Yang hilang: satu tempat yang menunjukkan progres nyata dan mendorong keputusan lebih baik.
          </p>
        </div>
      </section>

      <div className="section-glow-divider"/>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <span className="anim-hidden inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-[8px] font-[900] uppercase tracking-[0.25em] text-violet-400">
              <Zap size={10}/> Semua Yang Kamu Butuhkan
            </span>
            <h2 className="anim-hidden anim-delay-1 text-3xl md:text-[2.5rem] font-[900] tracking-[-0.03em]">
              Satu Dashboard. <span className="text-violet-400">Kontrol Penuh.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon:<DollarSign size={22}/>, grad:"from-emerald-500 to-emerald-700", title:"Smart Ledger", desc:"Ketik 'makan siang 35rb', AI langsung kategorikan. Zero effort, 100% akurat.", feats:["Auto-categorize","Multi-akun","Transfer tracking","Laporan instan"], d:"" },
              { icon:<CheckCircle2 size={22}/>, grad:"from-blue-500 to-indigo-700", title:"Task Sentinel", desc:"Kelola tugas harian dengan prioritas, sub-task, dan pengingat. Produktivitas tanpa noise.", feats:["My Day / Next 7","Sub-tasks","Custom lists","Priority levels"], d:"anim-delay-2" },
              { icon:<Zap size={22}/>, grad:"from-amber-500 to-orange-700", title:"Habit Engine", desc:"Bangun konsistensi dengan streak tracking dan heatmap aktivitas 365 hari.", feats:["Streak tracking","Activity heatmap","Daily mood","Refleksi harian"], d:"anim-delay-4" },
            ].map((c,i) => (
              <div key={i} className={`anim-hidden ${c.d} card-glow bg-white/[0.015] border border-white/[0.04] rounded-2xl p-8 space-y-5 hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-500/[0.05] transition-all duration-500 group`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.grad} flex items-center justify-center shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                  {c.icon}
                </div>
                <h3 className="text-[11px] font-[900] uppercase tracking-[0.2em] text-white">{c.title}</h3>
                <p className="text-[13px] text-zinc-400 leading-relaxed">{c.desc}</p>
                <ul className="space-y-2 pt-2 border-t border-white/[0.04]">
                  {c.feats.map((f,j) => (
                    <li key={j} className="flex items-center gap-2 text-[11px] text-zinc-500 font-[600]">
                      <CheckCircle2 size={11} className="text-violet-500/70 shrink-0"/> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-glow-divider"/>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto space-y-36">
          <div className="text-center space-y-4">
            <h2 className="anim-hidden text-3xl md:text-[2.5rem] font-[900] tracking-[-0.03em]">
              Cara <span className="text-shimmer">Kerjanya</span>
            </h2>
            <p className="anim-hidden anim-delay-1 text-zinc-500 text-[15px]">Tiga langkah. Tanpa belajar. Langsung jalan.</p>
          </div>

          {/* Step 01 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="anim-hidden-left space-y-5">
              <span className="text-[100px] font-[900] text-violet-500/[0.07] leading-none block select-none">01</span>
              <h3 className="text-[1.6rem] font-[900] tracking-[-0.02em] -mt-16">Ketik. LogFi <span className="text-violet-400">mengerti</span>.</h3>
              <p className="text-zinc-400 leading-relaxed text-[15px]">
                Cukup ketik &ldquo;gaji 5jt&rdquo; atau &ldquo;beli pulsa 50rb&rdquo;. AI kami langsung mengenali kategori, jumlah, dan jenis transaksi secara otomatis.
              </p>
            </div>
            <div className="anim-hidden-right anim-delay-2">
              <div className="bg-[#111113] border border-white/[0.04] rounded-2xl p-6 card-glow">
                <p className="text-[8px] font-[900] uppercase tracking-[0.2em] text-zinc-600 mb-4">LogFi Command Bar</p>
                <div className="bg-white/[0.03] border border-white/5 rounded-xl px-5 py-4 flex items-center gap-3">
                  <Sparkles size={15} className="text-violet-500 shrink-0"/>
                  <span className="typewriter-text text-[13px] text-white font-bold">makan siang 35rb, transport 15rb</span>
                </div>
                <div className="mt-4 space-y-2">
                  {[{t:"Makan → Rp 35.000"},{t:"Transport → Rp 15.000"}].map((r,i) => (
                    <div key={i} className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-4 py-2.5">
                      <span className="text-[10px] font-bold text-emerald-400">✓ {r.t}</span>
                      <span className="text-[7px] bg-rose-500/10 px-2 py-0.5 rounded text-rose-400 font-[800] uppercase tracking-wider">Expense</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 02 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="anim-hidden-left order-2 lg:order-1">
              <div className="bg-[#111113] border border-white/[0.04] rounded-2xl p-6 card-glow">
                <p className="text-[8px] font-[900] uppercase tracking-[0.2em] text-zinc-600 mb-4">Saldo Rekening</p>
                <div className="space-y-2.5">
                  {[{n:"Bank BCA",b:"Rp 8.200.000",c:"bg-blue-500"},{n:"GoPay",b:"Rp 1.350.000",c:"bg-emerald-500"},{n:"Cash",b:"Rp 500.000",c:"bg-amber-500"}].map((a,i) => (
                    <div key={i} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 group/item hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center gap-3"><div className={`w-3 h-3 rounded-full ${a.c}`}/><span className="text-xs font-bold text-zinc-300">{a.n}</span></div>
                      <span className="text-xs font-[900] text-white font-[family-name:var(--font-mono)]">{a.b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="anim-hidden-right space-y-5 order-1 lg:order-2">
              <span className="text-[100px] font-[900] text-violet-500/[0.07] leading-none block select-none">02</span>
              <h3 className="text-[1.6rem] font-[900] tracking-[-0.02em] -mt-16">Langsung tercatat. <span className="text-violet-400">Tanpa form</span>.</h3>
              <p className="text-zinc-400 leading-relaxed text-[15px]">Semua transaksi langsung masuk ke akun dan kategori yang tepat. Saldo otomatis terupdate secara real-time.</p>
            </div>
          </div>

          {/* Step 03 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="anim-hidden-left space-y-5">
              <span className="text-[100px] font-[900] text-violet-500/[0.07] leading-none block select-none">03</span>
              <h3 className="text-[1.6rem] font-[900] tracking-[-0.02em] -mt-16">Lihat data. <span className="text-violet-400">Ambil keputusan</span>.</h3>
              <p className="text-zinc-400 leading-relaxed text-[15px]">Dashboard real-time menunjukkan tren pendapatan, pengeluaran, dan kesehatan keuangan secara visual.</p>
            </div>
            <div className="anim-hidden-right anim-delay-2">
              <div className="bg-[#111113] border border-white/[0.04] rounded-2xl p-6 card-glow">
                <p className="text-[8px] font-[900] uppercase tracking-[0.2em] text-zinc-600 mb-4">Laporan Keuangan</p>
                <svg viewBox="0 0 360 110" className="w-full">
                  <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2"/><stop offset="100%" stopColor="#8B5CF6" stopOpacity="0"/></linearGradient></defs>
                  <path d="M0,90 C40,80 60,55 100,45 S160,60 200,35 S260,30 300,22 S340,25 360,18" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M0,90 C40,80 60,55 100,45 S160,60 200,35 S260,30 300,22 S340,25 360,18 L360,110 L0,110 Z" fill="url(#cg)"/>
                  <path d="M0,88 C50,92 100,78 150,73 S230,82 280,68 S340,73 360,65" fill="none" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4,4"/>
                  <circle cx="300" cy="22" r="5" fill="#8B5CF6" opacity="0.8"/><circle cx="300" cy="22" r="8" fill="#8B5CF6" opacity="0.15"/>
                </svg>
                <div className="flex items-center gap-6 mt-3">
                  <span className="flex items-center gap-1.5 text-[9px] font-bold text-violet-400"><span className="w-2 h-2 bg-violet-500 rounded-full"/>Pemasukan</span>
                  <span className="flex items-center gap-1.5 text-[9px] font-bold text-rose-400"><span className="w-2 h-2 bg-rose-500 rounded-full"/>Pengeluaran</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-glow-divider"/>

      {/* ===== APP SHOWCASE ===== */}
      <section id="showcase" className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto text-center space-y-14">
          <h2 className="anim-hidden text-3xl md:text-[2.5rem] font-[900] tracking-[-0.03em]">
            Lihat Betapa <span className="text-shimmer">Sederhananya</span>
          </h2>
          <div className="anim-hidden-scale anim-delay-1 rounded-2xl border border-white/[0.04] shadow-2xl shadow-violet-500/[0.06] overflow-hidden card-glow">
            <div className="bg-[#111113] p-1">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"/><span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"/><span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"/>
                </div>
                <div className="flex-1 text-center"><span className="text-[9px] text-zinc-600 bg-white/[0.03] px-6 py-1 rounded-md border border-white/5">🔒 logfi.app/dashboard</span></div>
              </div>
              <div className="p-6 space-y-4 bg-[#0A0A0B]">
                <div className="grid grid-cols-4 gap-3">
                  {[{l:"Pemasukan",v:"Rp 8.2jt"},{l:"Pengeluaran",v:"Rp 3.1jt"},{l:"Saldo Bersih",v:"Rp 5.1jt"},{l:"Tasks",v:"12"}].map((x,i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
                      <p className="text-[7px] font-[900] uppercase text-zinc-600 tracking-wider">{x.l}</p>
                      <p className="text-lg font-[900] text-white mt-1 font-[family-name:var(--font-mono)]">{x.v}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-4 h-40">
                    <p className="text-[7px] font-[900] uppercase text-zinc-600 mb-2 tracking-wider">Tren Keuangan</p>
                    <svg viewBox="0 0 400 100" className="w-full h-28">
                      <path d="M0,80 Q50,60 100,50 T200,30 T300,45 T400,20" fill="none" stroke="#8B5CF6" strokeWidth="2"/>
                      <path d="M0,85 Q50,80 100,75 T200,65 T300,70 T400,55" fill="none" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="3,3"/>
                    </svg>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 h-40">
                    <p className="text-[7px] font-[900] uppercase text-zinc-600 mb-2 tracking-wider">Kategori</p>
                    <div className="space-y-2 mt-3">
                      {[{n:"Makan",p:"35%",c:"bg-rose-500"},{n:"Transport",p:"20%",c:"bg-amber-500"},{n:"Belanja",p:"25%",c:"bg-violet-500"},{n:"Gaji",p:"100%",c:"bg-emerald-500"}].map((c,i)=>(
                        <div key={i} className="space-y-0.5">
                          <div className="flex justify-between"><span className="text-[7px] text-zinc-500">{c.n}</span><span className="text-[7px] text-zinc-600 font-bold">{c.p}</span></div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className={`h-full ${c.c} rounded-full`} style={{width:c.p}}/></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="anim-hidden anim-delay-3 max-w-xl mx-auto flex items-start gap-4 text-left bg-white/[0.015] border border-white/[0.04] rounded-2xl p-6 card-glow">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-[900] text-sm shrink-0 border border-white/10">SN</div>
            <div>
              <p className="text-[13px] text-zinc-400 leading-relaxed italic">&ldquo;Saya buat LogFi karena mencatat keuangan di spreadsheet terasa seperti PR. Saya ingin melihat progres, bukan hanya membacanya.&rdquo;</p>
              <p className="text-[9px] font-[900] uppercase tracking-[0.2em] text-violet-400 mt-3">Siraj Nur Ihrom — Creator</p>
            </div>
          </div>
        </div>
      </section>

      <div className="section-glow-divider"/>

      {/* ===== STATS & TESTIMONIALS ===== */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="grid grid-cols-3 gap-5">
            <StatCard target={500} suffix="+" label="Pengguna Aktif"/>
            <StatCard target={10000} suffix="+" label="Transaksi Tercatat"/>
            <StatCard target={99} suffix="%" label="Uptime Server"/>
          </div>
          <div className="space-y-6 overflow-hidden">
            <h3 className="anim-hidden text-2xl font-[900] tracking-[-0.02em] text-center">Apa Kata <span className="text-violet-400">Pengguna</span></h3>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0A0A0B] to-transparent z-10 pointer-events-none"/>
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0A0A0B] to-transparent z-10 pointer-events-none"/>
              <div className="flex gap-4 animate-scroll-left" style={{width:"max-content"}}>
                {[...testimonials,...testimonials].map((t,i)=><TestimonialCard key={i} {...t}/>)}
              </div>
            </div>
            <div className="relative mt-3">
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0A0A0B] to-transparent z-10 pointer-events-none"/>
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0A0A0B] to-transparent z-10 pointer-events-none"/>
              <div className="flex gap-4 animate-scroll-right" style={{width:"max-content"}}>
                {[...testimonials2,...testimonials2].map((t,i)=><TestimonialCard key={i} {...t}/>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-glow-divider"/>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="anim-hidden text-3xl md:text-[2.5rem] font-[900] tracking-[-0.03em]">Harga <span className="text-shimmer">Transparan</span></h2>
            <p className="anim-hidden anim-delay-1 text-zinc-500 text-[15px]">Mulai gratis. Upgrade kapan saja.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="anim-hidden card-glow bg-white/[0.015] border border-white/[0.04] rounded-2xl p-8 space-y-6 hover:-translate-y-1 transition-all duration-500">
              <div>
                <h3 className="text-[10px] font-[900] uppercase tracking-[0.2em] text-zinc-500">Free</h3>
                <p className="text-4xl font-[900] text-white mt-2 font-[family-name:var(--font-mono)]">Rp 0</p>
                <p className="text-xs text-zinc-600 mt-1">Gratis selamanya</p>
              </div>
              <ul className="space-y-3">
                {["Pencatatan keuangan unlimited","Task manager penuh","3 Rekening","Laporan dasar","Heatmap aktivitas"].map((f,i)=>(
                  <li key={i} className="flex items-center gap-2.5 text-[13px] text-zinc-400"><CheckCircle2 size={13} className="text-emerald-500/70 shrink-0"/>{f}</li>
                ))}
              </ul>
              <a href="/" className="block w-full text-center border border-white/10 hover:border-violet-500/30 text-zinc-300 hover:text-white py-4 rounded-xl font-[900] text-[10px] uppercase tracking-[0.15em] transition-all">Mulai Gratis</a>
            </div>
            {/* Pro */}
            <div className="anim-hidden anim-delay-2 relative bg-gradient-to-b from-violet-600/[0.06] to-transparent border border-violet-500/20 rounded-2xl p-8 space-y-6 hover:-translate-y-2 hover:border-violet-500/40 transition-all duration-500 shadow-xl shadow-violet-500/[0.05]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-violet-600 text-white text-[7px] font-[900] uppercase tracking-[0.2em] px-5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-violet-500/30"><Zap size={9}/> Most Popular</span>
              </div>
              <div>
                <h3 className="text-[10px] font-[900] uppercase tracking-[0.2em] text-violet-400">Pro</h3>
                <p className="text-4xl font-[900] text-white mt-2 font-[family-name:var(--font-mono)]">Rp 49<span className="text-lg">.000</span></p>
                <p className="text-xs text-zinc-500 mt-1">per bulan</p>
              </div>
              <ul className="space-y-3">
                {["Semua fitur Free","Rekening unlimited","Laporan lanjutan (PDF/Excel)","AI Smart Parser+","Habit Tracker penuh","Email report mingguan","Priority support","Early access fitur baru"].map((f,i)=>(
                  <li key={i} className="flex items-center gap-2.5 text-[13px] text-zinc-300"><CheckCircle2 size={13} className="text-violet-500 shrink-0"/>{f}</li>
                ))}
              </ul>
              <a href="/" className="block w-full text-center bg-violet-600 hover:bg-violet-500 text-white py-4 rounded-xl font-[900] text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-violet-500/20 transition-all hover:-translate-y-0.5 btn-shimmer">Upgrade ke Pro →</a>
            </div>
          </div>
        </div>
      </section>

      <div className="section-glow-divider"/>

      {/* ===== FINAL CTA ===== */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-violet-600/[0.04] via-transparent to-transparent pointer-events-none"/>
        <div className="max-w-3xl mx-auto text-center space-y-10 relative z-10">
          <h2 className="anim-hidden text-3xl md:text-5xl font-[900] tracking-[-0.04em] leading-tight">
            Mulai catat. <span className="text-shimmer">Mulai berkembang.</span>
          </h2>
          <p className="anim-hidden anim-delay-1 text-zinc-500 text-[15px]">Gratis selamanya. Setup dalam 2 menit. Tanpa kartu kredit.</p>
          
          <div className="anim-hidden anim-delay-2 flex items-center justify-center gap-8 md:gap-14">
            {[{s:"01",l:"Buat Akun"},{s:"02",l:"Ketik Transaksi"},{s:"03",l:"Lihat Dashboard"}].map((x,i)=>(
              <div key={i} className="flex flex-col items-center gap-2.5">
                <div className="w-14 h-14 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-sm font-[900]">{x.s}</div>
                <span className="text-[8px] font-[800] uppercase tracking-[0.2em] text-zinc-500">{x.l}</span>
              </div>
            ))}
          </div>

          <a href="/" className="anim-hidden anim-delay-3 inline-flex items-center gap-0 group">
            <span className="bg-violet-600 group-hover:bg-violet-500 text-white text-[10px] font-[900] uppercase tracking-[0.15em] px-10 py-5 rounded-l-2xl transition-all btn-shimmer animate-cta-pulse">
              Mulai Gratis Sekarang
            </span>
            <span className="bg-violet-500 group-hover:bg-violet-400 text-white w-16 h-16 rounded-full flex items-center justify-center -ml-3 shadow-xl shadow-violet-500/30 transition-all group-hover:-translate-y-1 group-hover:scale-110 border-2 border-violet-400/20">
              <ArrowRight size={20} strokeWidth={3}/>
            </span>
          </a>
          <p className="anim-hidden anim-delay-4 text-[10px] text-zinc-600 flex items-center justify-center gap-2">
            <Shield size={11} className="text-emerald-500"/> Tanpa kartu kredit · Gratis selamanya · 500+ pengguna aktif
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/[0.04] py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-0.5">
              <span className="text-2xl font-[900] tracking-[-0.05em] text-white">Log</span>
              <span className="text-2xl font-[900] tracking-[-0.05em] text-violet-500">Fi</span>
            </div>
            <p className="text-[9px] font-[800] uppercase tracking-[0.2em] text-zinc-600">Log your money. Own your life.</p>
            <p className="text-[10px] text-zinc-700">© 2026 SNISHOP.ID</p>
          </div>
          {[
            {h:"Produk",ls:["Fitur","Cara Kerja","Harga","Roadmap"]},
            {h:"Legal",ls:["Terms of Use","Privacy Policy","Cookie Policy"]},
            {h:"Sosial",ls:["Instagram","Twitter / X","GitHub","Email"]},
          ].map((col,i)=>(
            <div key={i}>
              <p className="text-[8px] font-[900] uppercase tracking-[0.25em] text-zinc-500 mb-4">{col.h}</p>
              <ul className="space-y-2.5">
                {col.ls.map((l,j)=><li key={j}><a href="#" className="text-[13px] text-zinc-500 hover:text-violet-400 transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-zinc-700">All rights reserved. Built with ❤️ by SNISHOP.ID</p>
          <div className="flex gap-4">
            <a href="#" className="text-[10px] text-zinc-600 hover:text-violet-400 transition-colors">Terms</a>
            <a href="#" className="text-[10px] text-zinc-600 hover:text-violet-400 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============================================ */
/* SUBCOMPONENTS                                */
/* ============================================ */
function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const h = () => { const t = document.documentElement.scrollHeight - window.innerHeight; setP(t > 0 ? (window.scrollY / t) * 100 : 0); };
    window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h);
  }, []);
  return <div className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-violet-600 to-blue-500 z-[200] transition-all duration-100" style={{ width: `${p}%` }}/>;
}

function StatCard({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(target);
  return (
    <div ref={ref} className="anim-hidden card-glow bg-white/[0.015] border border-white/[0.04] rounded-2xl p-8 text-center hover:-translate-y-1 transition-all duration-500">
      <p className="text-3xl md:text-4xl font-[900] text-white font-[family-name:var(--font-mono)]">{count.toLocaleString()}{suffix}</p>
      <p className="text-[9px] font-[900] uppercase tracking-[0.2em] text-zinc-500 mt-2">{label}</p>
    </div>
  );
}

function TestimonialCard({ text, name, role }: { text: string; name: string; role: string }) {
  return (
    <div className="w-[300px] shrink-0 bg-white/[0.015] border border-white/[0.04] rounded-xl p-5 space-y-3 hover:border-violet-500/20 transition-all group">
      <div className="flex gap-0.5 mb-1">{Array.from({length:5}).map((_,i)=><Star key={i} size={10} className="text-amber-400 fill-amber-400"/>)}</div>
      <p className="text-[12px] text-zinc-400 leading-relaxed">{text}</p>
      <div className="flex items-center gap-2.5 pt-3 border-t border-white/[0.04]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600/30 to-indigo-700/30 border border-white/5 flex items-center justify-center text-[9px] font-[900] text-violet-300">{name[0]}</div>
        <div>
          <p className="text-[10px] font-[800] text-zinc-300">{name}</p>
          <p className="text-[8px] text-zinc-600">{role}</p>
        </div>
      </div>
    </div>
  );
}

/* ============================================ */
/* DATA                                         */
/* ============================================ */
const testimonials = [
  { text: "LogFi mengubah cara saya memandang keuangan. Sekarang saya bisa lihat ke mana uang saya pergi dengan jelas.", name: "Andi Pratama", role: "Freelancer" },
  { text: "Pencatatan keuangan yang dulunya memakan waktu 30 menit, sekarang cukup 30 detik.", name: "Sari Dewi", role: "Small Business Owner" },
  { text: "Saya suka fitur habit tracker-nya. Membuat saya lebih konsisten dalam menabung setiap hari.", name: "Budi Santoso", role: "Karyawan Swasta" },
  { text: "Dashboard-nya cantik banget! Terasa premium tapi gratis. Recommended banget.", name: "Maya Putri", role: "Content Creator" },
  { text: "Dari semua app finance yang pernah saya coba, LogFi yang paling intuitif dan cepat.", name: "Rizki Fajar", role: "Mahasiswa" },
];
const testimonials2 = [
  { text: "AI parser-nya gila sih. Tinggal ketik 'makan 50rb' langsung tercatat. No hassle.", name: "Dina Rahayu", role: "Digital Marketer" },
  { text: "Fitur laporannya sangat membantu untuk tracking bisnis kecil saya.", name: "Hendra", role: "UMKM Owner" },
  { text: "Finally, satu tempat untuk tasks dan keuangan. Game changer buat produktivitas.", name: "Lina Kusuma", role: "Project Manager" },
  { text: "Setup cuma 2 menit, langsung bisa pakai. Simpel dan powerful.", name: "Agus Setiawan", role: "Software Engineer" },
  { text: "Setelah pakai LogFi 3 bulan, pengeluaran saya turun 20%. Data is power!", name: "Fitri Amalia", role: "Guru" },
];
