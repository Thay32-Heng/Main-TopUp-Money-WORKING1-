'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { LayoutDashboard, Users, ShoppingCart, DollarSign, Settings, TrendingUp, Activity } from 'lucide-react';

export default function DashboardPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-32 px-6 max-w-6xl mx-auto" ref={ref}>
      <div className="flex flex-col lg:flex-row items-center gap-16">
        
        <div className="flex-1 lg:pr-8">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">Everything You Need to Scale</h2>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-lg">
            From your first customer to your ten-thousandth. Real-time data, automated payouts, and fraud detection built-in.
          </p>
          <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-medium text-purple-300 hover:text-purple-200">
            Explore the Dashboard <TrendingUp className="w-4 h-4" />
          </button>
        </div>

        <motion.div 
          className="flex-[1.5] w-full"
          initial={{ opacity: 0, x: 40, rotateY: 10 }}
          animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : { opacity: 0, x: 40, rotateY: 10 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
          style={{ perspective: "1000px" }}
        >
          <div className="bg-[#13131f] rounded-2xl border border-white/10 shadow-[0_0_50px_-12px_rgba(139,92,246,0.2)] overflow-hidden relative">
            
            {/* Dashboard Header/Status Bar */}
            <div className="bg-[#0a0a0f] border-b border-white/5 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-slate-400 font-medium">
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded"><LayoutDashboard className="w-4 h-4"/> Dashboard</span>
                <span><ShoppingCart className="w-4 h-4 inline mr-2"/> Orders</span>
                <span><Users className="w-4 h-4 inline mr-2"/> Customers</span>
                <span><Settings className="w-4 h-4 inline mr-2"/> Settings</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                LIVE
              </div>
            </div>

            {/* Dashboard Body */}
            <div className="p-6 grid grid-cols-3 gap-4">
              <div className="col-span-1 bg-[#1a1a2e] rounded-xl p-4 border border-white/5">
                <div className="text-slate-400 text-xs mb-1 uppercase font-bold tracking-wider">Revenue (7d)</div>
                <div className="text-2xl font-bold font-mono">$1,240.50</div>
                <div className="text-emerald-400 text-xs mt-2 flex items-center gap-1"><Activity className="w-3 h-3"/> +14.2% from last week</div>
              </div>
              <div className="col-span-1 bg-[#1a1a2e] rounded-xl p-4 border border-white/5">
                <div className="text-slate-400 text-xs mb-1 uppercase font-bold tracking-wider">Total Orders</div>
                <div className="text-2xl font-bold font-mono">1,348</div>
                <div className="text-emerald-400 text-xs mt-2 flex items-center gap-1"><Activity className="w-3 h-3"/> +5.1% from last week</div>
              </div>
              <div className="col-span-1 bg-[#1a1a2e] rounded-xl p-4 border border-white/5">
                <div className="text-slate-400 text-xs mb-1 uppercase font-bold tracking-wider">Success Rate</div>
                <div className="text-2xl font-bold font-mono">98.5%</div>
                <div className="text-rose-400 text-xs mt-2 flex items-center gap-1">2 failed transactions</div>
              </div>

              {/* Chart Mock */}
              <div className="col-span-3 bg-[#1a1a2e] rounded-xl p-4 border border-white/5 h-40 relative flex items-end overflow-hidden mt-2">
                 <div className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider text-slate-400">Transaction Volume</div>
                 <svg className="w-full h-24" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M0,100 L0,80 Q10,70 20,60 T40,50 T60,20 T80,40 T100,10 L100,100 Z" fill="rgba(139, 92, 246, 0.1)" />
                    <path d="M0,80 Q10,70 20,60 T40,50 T60,20 T80,40 T100,10" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
                 </svg>
              </div>

              {/* Table Mock */}
              <div className="col-span-3 bg-[#1a1a2e] rounded-xl border border-white/5 mt-2">
                <div className="px-4 py-3 border-b border-white/5 flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wide">
                  <span>Recent Orders</span>
                  <span>Status</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { id: "ORD-9302", val: "$49.99", user: "Mobile Legends 1000💎", stat: "Success", color: "text-emerald-400" },
                    { id: "ORD-9301", val: "$9.99", user: "PUBGM 300UC", stat: "Success", color: "text-emerald-400" },
                    { id: "ORD-9300", val: "$14.50", user: "Valorant 1000VP", stat: "Pending", color: "text-amber-400" },
                  ].map((ord, i) => (
                    <div key={i} className="flex justify-between items-center text-sm font-mono pb-2 border-b border-white/5 last:border-0 last:pb-0">
                      <div>
                        <span className="text-white mr-4">{ord.id}</span>
                        <span className="text-slate-400 font-sans">{ord.user}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-white">{ord.val}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 ${ord.color}`}>{ord.stat}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#13131f] via-transparent to-transparent pointer-events-none" />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
