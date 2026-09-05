'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Globe, Database, CreditCard, Activity, LineChart, Code2 } from 'lucide-react';

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Globe,
      title: "Subpath & Custom Domain",
      desc: "Serve under yourdomain.com/<slug> or connect your own domain via automatic Traefik v3 proxy.",
      tech: "Traefik v3"
    },
    {
      icon: Database,
      title: "Dedicated Database Isolation",
      desc: "Every tenant gets isolated PostgreSQL schema. Your data never touches another store's tables.",
      tech: "PostgreSQL 16"
    },
    {
      icon: CreditCard,
      title: "Native Payment Gateways",
      desc: "KHQR, Bakong, and G2Bulk APIs pre-integrated. Auto-fulfillment webhooks included out of box.",
      tech: "KHQR Ready"
    },
    {
      icon: Activity,
      title: "Zero-Downtime Provisioning",
      desc: "Asynchronous BullMQ workers with health checks, auto-retry, and automated circuit breakers.",
      tech: "BullMQ / Redis 7"
    },
    {
      icon: LineChart,
      title: "Real-time Analytics",
      desc: "Track revenue, top-up volume, and customer retention from your admin dashboard in real-time.",
      tech: "Next.js 14"
    },
    {
      icon: Code2,
      title: "API-First Architecture",
      desc: "Full REST API with native webhook support. Build custom integrations in minutes.",
      tech: "Dockerode API"
    }
  ];

  return (
    <section id="features" className="py-24 px-6 bg-[#0f172a]/50" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Enterprise-grade infrastructure</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">We abstract away the hard parts so you can focus on selling games and building your community.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((ft, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group p-8 rounded-2xl bg-[#13131f] border border-white/5 hover:border-purple-500/30 hover:-translate-y-1 hover:bg-[#1a1a2e] transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] group-hover:bg-purple-500/20 transition-colors" />
              
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <ft.icon className="w-6 h-6 text-purple-400" />
              </div>
              
              <h3 className="text-lg font-bold mb-3">{ft.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">{ft.desc}</p>
              
              <div className="absolute bottom-6 left-8">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 bg-white/5 border border-white/10 rounded text-slate-300">
                  {ft.tech}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
