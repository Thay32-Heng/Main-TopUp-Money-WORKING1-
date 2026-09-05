'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: "How long does it take to launch my store?",
    a: "Under 5 minutes. You just sign up, choose a subdomain, and your dedicated database and storefront are instantly provisioned."
  },
  {
    q: "Do I need technical skills?",
    a: "None. Ahnajak is fully hosted. We handle the servers, the database, security, and updates. You just configure your products and prices in the dashboard."
  },
  {
    q: "Can I connect my own Telegram bot?",
    a: "Yes. In the Growth plan and above, you can paste your Telegram Bot Token and we automatically wire it up to your specific storefront."
  },
  {
    q: "How do automated fulfillments work?",
    a: "You can map specific products to external APIs (like Moonton for Mobile Legends). When a customer buys and the KHQR payment clears, our worker automatically triggers the API to send the diamonds."
  },
  {
    q: "Is my data isolated from other stores?",
    a: "Yes. We use a multi-tenant architecture where every store gets its own Postgres schema. Your customer data and orders are completely isolated."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-6 bg-gradient-to-b from-[#0a0a0f] to-[#0F0F16]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="border border-white/10 bg-white/5 rounded-2xl overflow-hidden transition-all duration-300"
            >
              <button
                className="w-full px-6 py-6 text-left flex justify-between items-center focus:outline-none"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-medium text-lg text-white">{faq.q}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === i ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-slate-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
