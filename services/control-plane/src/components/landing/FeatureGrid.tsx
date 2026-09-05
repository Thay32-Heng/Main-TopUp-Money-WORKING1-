'use client';
import { Smartphone, Bot, Shield, Zap, Globe, Coins } from 'lucide-react';

const coreFeatures = [
  {
    icon: <Globe className="w-6 h-6 text-cyan-400" />,
    title: "Instant Storefront",
    description: "Get a beautiful, mobile-optimized top-up store running on your own domain in minutes."
  },
  {
    icon: <Bot className="w-6 h-6 text-purple-400" />,
    title: "Telegram Bot Native",
    description: "Fully synchronized Telegram bot where customers can check prices, order, and track status."
  },
  {
    icon: <Smartphone className="w-6 h-6 text-emerald-400" />,
    title: "KHQR Payments",
    description: "Integrated Bakong KHQR payments for frictionless checkout directly from local mobile banking apps."
  }
];

const technicalFeatures = [
  {
    title: "Multi-Tenant Architecture",
    description: "True database-level isolation. You get your own dedicated Postgres schema for complete data privacy."
  },
  {
    title: "Automated Fulfillment Engine",
    description: "Connect to major game providers or manual workers. Configurable routing per product."
  },
  {
    title: "Custom Pricing Rules",
    description: "Set margins, daily discounts, and tiered VIP pricing for your best customers."
  }
];

export default function FeatureGrid() {
  return (
    <section id="features" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white tracking-tight text-balance">
            Everything you need to <br className="hidden md:block"/> automate your top-up business.
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Focus on marketing and growing your brand. We handle the storefront, the bots, and the payments infrastructure.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {coreFeatures.map((f, i) => (
            <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
              <p className="text-slate-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        {/* Technical Deep Dive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative h-[400px] rounded-2xl overflow-hidden border border-white/10 bg-[#0F0F16]">
            {/* Abstract illustration of architecture */}
            <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-6 w-full px-12">
               <div className="w-full flex justify-between items-center text-slate-500 text-sm font-mono border-b border-white/10 pb-2">
                 <span>Client</span>
                 <span>API</span>
                 <span>Worker</span>
               </div>
               <div className="w-full flex justify-center gap-8 relative pb-8">
                 <div className="w-16 h-16 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center relative z-10"><Globe className="text-purple-400 w-6 h-6"/></div>
                 <div className="w-full h-px bg-gradient-to-r from-purple-500/50 to-transparent absolute top-8 -z-0"></div>
                 <div className="w-16 h-16 rounded-xl border border-white/20 bg-white/5 flex items-center justify-center backdrop-blur-sm z-10"><Shield className="text-white w-6 h-6"/></div>
                 <div className="w-full h-px bg-gradient-to-r from-transparent to-cyan-500/50 absolute top-8 -z-0"></div>
                 <div className="w-16 h-16 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center relative z-10"><Coins className="text-cyan-400 w-6 h-6"/></div>
               </div>
            </div>
          </div>
          
          <div className="order-1 md:order-2">
             <h3 className="text-3xl font-bold text-white mb-8">Enterprise-grade infrastructure for solo founders.</h3>
             <div className="space-y-8">
                {technicalFeatures.map((tf, i) => (
                  <div key={i} className="flex gap-4">
                     <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">
                        {i + 1}
                     </div>
                     <div>
                        <h4 className="text-lg font-bold text-white mb-2">{tf.title}</h4>
                        <p className="text-slate-400">{tf.description}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

      </div>
    </section>
  );
}
