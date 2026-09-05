'use client';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: "Do I need coding skills to launch a store?",
    a: "No. Ahnajak is fully no-code. Fill out the form, click deploy, and your isolated game store is live in roughly 30 seconds."
  },
  {
    q: "Can I use my own custom domain name?",
    a: "Yes, on Pro and Enterprise plans. We automatically provision and renew SSL certificates via Let's Encrypt using Traefik v3."
  },
  {
    q: "How does the payment integration actually work?",
    a: "We provide native webhooks for KHQR, Bakong, and G2Bulk APIs out-of-the-box. When a customer pays, our BullMQ workers verify the transaction and auto-fulfill the game ID top-up instantly."
  },
  {
    q: "Is my tenant data secure?",
    a: "Absolutely. Every store runs in an isolated PostgreSQL schema wrapper with strict row-level security. We never commingle your customer data with other tenants."
  },
  {
    q: "Can I export my data if I leave?",
    a: "Yes. Full database exports (SQL dumps) and API access are available on all paid plans. You own your customer metrics."
  }
];

export default function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-24 px-6 md:px-0 bg-[#0f172a]/30" ref={ref}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`border rounded-xl bg-[#13131f] transition-all duration-300 overflow-hidden ${
                  isOpen ? 'border-purple-500/50 block shadow-[0_0_30px_rgba(139,92,246,0.1)]' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div 
                  className={`w-1 h-full absolute left-0 top-0 transition-colors ${isOpen ? 'bg-purple-500' : 'bg-transparent'}`} 
                />
                <button 
                  className="w-full relative px-6 py-5 text-left font-semibold text-lg flex justify-between items-center bg-transparent focus:outline-none"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                >
                  {faq.q}
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 text-slate-400 ${isOpen ? 'rotate-180 text-purple-400' : ''}`} />
                </button>
                <motion.div 
                  initial={false}
                  animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="px-6 pb-5 text-slate-400 text-sm leading-relaxed"
                >
                  <p>{faq.a}</p>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
}
