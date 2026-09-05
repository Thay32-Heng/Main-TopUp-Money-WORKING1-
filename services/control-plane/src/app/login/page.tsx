'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Box, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Fake loading then redirect
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center">
            <Box className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold tracking-tight text-xl text-white">Ahnajak</span>
        </Link>
        
        <div className="bg-[#0f0f16] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400 text-sm mb-8">Sign in to your control plane to manage stores.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  defaultValue="admin@example.com"
                  className="w-full bg-[#1A1A24] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" 
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Password</label>
                <a href="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  defaultValue="password"
                  className="w-full bg-[#1A1A24] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" 
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black font-bold rounded-lg py-3 mt-4 flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account? <Link href="/checkout" className="text-purple-400 font-medium hover:text-purple-300 transition-colors">Start free trial</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
