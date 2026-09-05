'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dices,
  CheckCircle2, 
  XCircle,
  Loader2,
  TerminalSquare
} from 'lucide-react';

export default function SandboxPreview() {
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [isDeploying, setIsDeploying] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg: string, delay = 0) => {
    setTimeout(() => {
      setLogs((prev) => [...prev, `[${new Date().toISOString().split('T')[1].substr(0,8)}] ${msg}`]);
    }, delay);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(val);
    
    if (val.length < 3) {
      setSlugStatus('idle');
      return;
    }

    setSlugStatus('checking');
    setTimeout(() => {
      setSlugStatus(val.includes('admin') ? 'taken' : 'available');
    }, 600);
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let p = '';
    for(let i=0; i<12; i++) p += chars[Math.floor(Math.random() * chars.length)];
    setPassword(p);
  };

  const handleDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    if (slugStatus !== 'available' || !storeName || !email || !password) return;
    
    setIsDeploying(true);
    setLogs([]);
    addLog(`Initializing sandbox environment for tenant '${slug}'...`);
    addLog(`Reserving namespace: 'ahnajak.io/stores/${slug}'`, 800);
    addLog(`Mounting isolated PostgreSQL schema...`, 1600);
    addLog(`Injecting KHQR and Bakong API credentials...`, 2400);
    addLog(`Running Prisma migrations...`, 3200);
    addLog(`Applying Traefik v3 routing rules...`, 4000);
    
    setTimeout(() => {
      addLog(`✅ STORE PROVISIONED SUCCESSFULLY: https://ahnajak.io/stores/${slug}`);
      setIsDeploying(false);
      triggerConfetti();
    }, 4800);
  };

  const triggerConfetti = () => {
    // We'd use canvas confetti here, simplified for this snippet
    // Could add react-canvas-confetti later
  };

  const getPwdStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length > 7) strength += 33;
    if (password.match(/[A-Z]/) && password.match(/[a-z]/)) strength += 33;
    if (password.match(/[^A-Za-z0-9]/)) strength += 34;
    return strength;
  };
  
  const strength = getPwdStrength();

  return (
    <section id="sandbox" className="w-full bg-[#0f172a] py-24 px-6 border-y border-white/5 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Interactive Sandbox</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Experience the automated provisioning pipeline in real-time. This is a simulated environment—no actual infrastructure is billed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* LEFT: FORM */}
          <div className="bg-[#13131f]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_-10px_rgba(139,92,246,0.15)] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] uppercase font-bold tracking-widest text-purple-400">
                Sandbox Mode
              </span>
            </div>

            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TerminalSquare className="text-purple-400 w-5 h-5" /> Let's build your store
            </h3>

            <form onSubmit={handleDeploy} className="space-y-5 flex-1 flex flex-col">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Store Name</label>
                <input 
                  type="text" 
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  placeholder="My Premium Game Store"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-white placeholder-slate-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Store URL (Slug)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-sm text-slate-500 select-none">ahnajak.io/stores/</span>
                  <input 
                    type="text" 
                    value={slug}
                    onChange={handleSlugChange}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-[135px] pr-10 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono text-white placeholder-slate-600"
                    placeholder="my-store"
                    required
                  />
                  <div className="absolute right-3 flex items-center">
                    {slugStatus === 'checking' && <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />}
                    {slugStatus === 'available' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {slugStatus === 'taken' && <XCircle className="w-4 h-4 text-rose-400" />}
                  </div>
                </div>
                <AnimatePresence>
                  {slugStatus === 'taken' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="text-xs text-rose-400 mt-2 font-medium">
                      This slug is already taken. Try another.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Admin Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-white placeholder-slate-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex justify-between">
                  Initial Password
                  <button type="button" onClick={generatePassword} className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    <Dices className="w-3 h-3" /> Generate
                  </button>
                </label>
                <input 
                  type="text" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-white font-mono placeholder-slate-600"
                  placeholder="••••••••••••"
                  required
                />
                {password && (
                  <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden flex">
                    <div className="h-full rounded-full transition-all duration-300" style={{
                      width: `${strength}%`,
                      backgroundColor: strength < 50 ? '#f87171' : strength < 90 ? '#fbbf24' : '#34d399'
                    }} />
                  </div>
                )}
              </div>

              <div className="mt-auto pt-6 flex-1 flex flex-col justify-end">
                <button 
                  type="submit"
                  disabled={isDeploying || slugStatus !== 'available' || !storeName || !email || !password}
                  className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl shadow-[0_4px_20px_-5px_rgba(139,92,246,0.4)] transition-all hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeploying ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Provisioning Infrastructure...</>
                  ) : (
                    "Deploy Sandbox Store →"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: TERMINAL */}
          <div className={`bg-[#0a0a0f] rounded-2xl border transition-colors duration-500 ${logs.some(l => l.includes('SUCCESSFULLY')) ? 'border-emerald-500/50 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]' : 'border-white/10 shadow-xl'} flex flex-col overflow-hidden`}>
            <div className="bg-[#13131f] border-b border-white/5 px-4 py-3 flex items-center">
              <div className="flex gap-2 mr-4">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="text-[11px] font-mono text-slate-500 mx-auto -ml-8">worker-01 ~ provision-logs</div>
            </div>
            <div 
              ref={terminalRef}
              className="p-6 font-mono text-xs text-slate-300 flex-1 overflow-y-auto leading-relaxed"
            >
              {logs.length === 0 ? (
                <div className="text-slate-600 italic">Waiting for deployment trigger...</div>
              ) : (
                logs.map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`mb-1 ${log.includes('SUCCESS') ? 'text-emerald-400 font-bold mt-4' : 'text-slate-300'}`}
                  >
                    {log}
                  </motion.div>
                ))
              )}
              {isDeploying && (
                <div className="flex items-center gap-2 text-purple-400 mt-2">
                  <span className="w-2 h-4 bg-purple-400 animate-pulse"></span>
                </div>
              )}
            </div>
            
            <div className="p-3 bg-blue-500/10 border-t border-blue-500/20 text-center text-xs text-blue-300 font-medium">
              🔬 This is a sandbox — no actual resources are billed to you.
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
