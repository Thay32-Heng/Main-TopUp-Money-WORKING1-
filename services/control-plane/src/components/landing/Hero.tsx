'use client';
import { Bot, Zap, Globe, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Terminal from './Terminal';
import MockMetrics from './MockMetrics';

const mockLogs = [
  "[INFO] Received provision request for 'luckytopup'",
  "[INFO] ==> Allocating Postgres database (tenant-db)...",
  "[SUCCESS] Postgres database created successfully (schema: tenant_luckytopup)",
  "[INFO] ==> Configuring Docker container topup-template:1.0.0...",
  "[INFO] ==> Generating Traefik routing rules (Path: /luckytopup)",
  "[SUCCESS] Routing online and SSL configured via Traefik",
  "[INFO] ==> Starting container 'tenant-luckytopup-app'...",
  "✔ Container started successfully",
  "✔ Running Prisma migrations targeting tenant DB...",
  "[SUCCESS] Storefront 'luckytopup' is LIVE and operational."
];

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm border-purple-500/30 text-slate-300 mb-8 backdrop-blur-sm">
          <Zap className="w-4 h-4 text-purple-400" />
          Multi-Tenant Gaming Topup SaaS Engine
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-white leading-tight">
          Launch Your Top-Up Game <br className="hidden md:block" />
          Store in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Seconds</span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Fully automated SaaS provisioning with instant database isolation, native KHQR/Bakong 
          gateways, and automatic G2Bulk API fulfillment.
        </p>

        <MockMetrics />

        <div className="mt-20 grid md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto text-left">
          {/* Form Side */}
          <div className="bg-[#0F0F16] rounded-2xl border border-white/10 p-8 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-t-2xl"></div>
            <div className="flex items-center gap-2 mb-6">
               <Zap className="w-5 h-5 text-purple-400" />
               <h3 className="text-xl font-bold text-white">Configure & Provision Store</h3>
            </div>
            <p className="text-sm text-slate-400 mb-8">Enter your store details below to start the automated provisioning pipeline.</p>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-2 block uppercase tracking-wider">Store Name</label>
                <input type="text" className="w-full bg-[#1A1A24] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" value="Lucky Topup" readOnly />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Store URL Path / Slug</label>
                  <span className="text-[10px] text-slate-500">Subpath identifier</span>
                </div>
                <div className="flex bg-[#1A1A24] border border-rose-500/50 rounded-lg overflow-hidden">
                  <span className="px-4 py-3 bg-white/5 text-slate-500 border-r border-white/5">localhost/</span>
                  <input type="text" className="w-full bg-transparent px-4 py-3 text-white focus:outline-none" value="luckytopup" readOnly />
                  <span className="px-3 flex items-center justify-center text-rose-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                  </span>
                </div>
                <p className="text-[10px] text-rose-500 mt-1">The store slug "luckytopup" is already taken.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-2 block uppercase tracking-wider">Owner Admin Email</label>
                <input type="email" className="w-full bg-[#1A1A24] border border-white/10 rounded-lg px-4 py-3 text-slate-400 focus:outline-none focus:border-purple-500" value="admin@luckytopup.com" readOnly />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Initial Admin Password</label>
                  <button className="text-[10px] text-purple-400 flex items-center gap-1 hover:text-purple-300"><Zap className="w-3 h-3" /> Generate</button>
                </div>
                <div className="flex bg-[#1A1A24] border border-white/10 rounded-lg overflow-hidden">
                  <input type="password" className="w-full bg-transparent px-4 py-3 text-white focus:outline-none" value="••••••••••••" readOnly />
                  <span className="px-3 flex items-center justify-center text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="text-slate-500">Target Deployment URL:</span>
                <span className="font-mono text-purple-300">http://localhost/luckytopup</span>
              </div>

              <Link href="/checkout" className="w-full py-4 rounded-lg font-bold bg-[#3B2D71] text-[#A697E3] flex justify-center items-center gap-2 mt-4 hover:bg-[#4B3B8A] transition-colors border border-[#52448A]">
                Deploy Free Store <ChevronRight className="w-4 h-4" />
              </Link>

            </div>
          </div>

          {/* Terminal / Status Side */}
          <div className="flex flex-col gap-6">
            {/* Features summary blocks */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#0F0F16] border border-white/10 rounded-xl p-4 flex gap-4">
                <div className="w-10 h-10 rounded bg-[#1A1A24] border border-white/5 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Subpath & Custom Domain Routing</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">Served under yourdomain.com/&lt;slug&gt; via dynamic Traefik v3 proxy.</p>
                </div>
              </div>
              <div className="bg-[#0F0F16] border border-white/10 rounded-xl p-4 flex gap-4">
                <div className="w-10 h-10 rounded bg-[#1A1A24] border border-white/5 flex items-center justify-center shrink-0">
                  <div className="w-4 h-4 bg-transparent border-2 border-emerald-400 rounded-sm"></div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Dedicated Database Segregation</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">Automatic creation of isolated PostgreSQL/MySQL tenant database.</p>
                </div>
              </div>
              <div className="bg-[#0F0F16] border border-white/10 rounded-xl p-4 flex gap-4">
                <div className="w-10 h-10 rounded bg-[#1A1A24] border border-white/5 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Payment Gateways & Auto-Fulfillment</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">Ikhode Bakong, KHQRcc, and G2Bulk API automated order fulfillment ready.</p>
                </div>
              </div>
            </div>

            {/* Simulated terminal output */}
            <Terminal lines={mockLogs} typingSpeed={30} className="h-48 md:flex-1" />
          </div>
        </div>

      </div>
    </section>
  );
}
