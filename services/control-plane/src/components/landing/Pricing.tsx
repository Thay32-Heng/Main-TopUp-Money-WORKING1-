'use client';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [annual, setAnnual] = useState(true);

  const tiers = [
    {
      name: "Free",
      price: "0",
      desc: "Perfect for testing and small communities.",
      features: ["1 Store", "Subpath URL (ahnajak.io/stores/name)", "Community Support", "2.9% transaction fee"],
      cta: "Start Free",
      highlight: false
    },
    {
      name: "Pro",
      price: annual ? "29" : "39",
      period: "/mo",
      desc: "For growing businesses pushing volume.",
      features: ["Unlimited Stores", "Custom Domains", "Priority Support", "1.5% transaction fee", "Advanced Analytics"],
      cta: "Get Pro",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "Dedicated instances for high-volume whales.",
      features: ["Dedicated infrastructure", "SLA guarantee", "Custom integrations", "Dedicated account manager"],
      cta: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-24 px-6 max-w-6xl mx-auto" ref={ref}>
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Simple, transparent pricing</h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-8">Start for free, upgrade when you need to scale.</p>
        
        {/* Toggle */}
        <div className="inline-flex items-center gap-2 p-1 bg-white/5 rounded-full border border-white/10">
          <button 
            type="button"
            onClick={() => setAnnual(false)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${!annual ? 'bg-[#1a1a2e] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Monthly
          </button>
          <button 
            type="button"
            onClick={() => setAnnual(true)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${annual ? 'bg-[#1a1a2e] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Yearly <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded uppercase tracking-wider">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
        {tiers.map((tier, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            className={`relative rounded-2xl border p-8 flex flex-col h-full bg-[#13131f] transition-all duration-300 ${tier.highlight ? 'border-purple-500/50 shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)] md:-translate-y-4' : 'border-white/10 hover:border-white/20'}`}
          >
            {tier.highlight && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                Most Popular
              </div>
            )}
            
            <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
            <p className="text-sm text-slate-400 h-10">{tier.desc}</p>
            
            <div className="my-6">
              <span className="text-4xl font-extrabold">{tier.price !== "Custom" && "$"}{tier.price}</span>
              {tier.period && <span className="text-slate-400 font-medium">{tier.period}</span>}
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {tier.features.map((f, j) => (
                <li key={j} className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle2 className={`w-5 h-5 shrink-0 ${tier.highlight ? 'text-purple-400' : 'text-slate-500'}`} />
                  {f}
                </li>
              ))}
            </ul>

            <button className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${
              tier.highlight 
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)]' 
                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
            }`}>
              {tier.cta}
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
