'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Settings2, Zap, Rocket } from 'lucide-react';

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      icon: Settings2,
      num: "01",
      title: "Configure",
      desc: "Set your store name, connect payment gateways, and choose your template."
    },
    {
      icon: Zap,
      num: "02",
      title: "Deploy",
      desc: "We provision isolated database, SSL certificate, and CDN edge config automatically."
    },
    {
      icon: Rocket,
      num: "03",
      title: "Sell",
      desc: "Start accepting KHQR, Bakong, and G2Bulk payments instantly. Funds settle to your account."
    }
  ];

  return (
    <section className="py-32 px-6 max-w-6xl mx-auto relative" ref={ref}>
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">From zero to live in 3 steps</h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">No DevOps, no manual database setup, no complex proxy routing.</p>
      </div>

      <div className="relative">
        {/* Connecting line (Desktop) */}
        <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-px bg-white/10 z-0">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-cyan-400 w-full"
            initial={{ scaleX: 0, originX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative z-10">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: i * 0.4 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="relative mb-8">
                <div className="absolute -inset-4 text-7xl font-black text-white/[0.02] -z-10 group-hover:text-purple-500/10 transition-colors pointer-events-none select-none">
                  {step.num}
                </div>
                <div className="w-20 h-20 rounded-full bg-[#0a0a0f] border-2 border-white/10 flex items-center justify-center group-hover:border-purple-500/50 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all bg-clip-padding">
                  <step.icon className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed max-w-xs">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
