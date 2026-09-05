import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'How does the Bakong KHQR payment processing work?',
    a: 'When a customer selects Bakong KHQR during checkout, our Cloudflare Edge function generates a standard EMVCo-compliant KHQR dynamic QR code with merchant metadata. When the customer scans and pays using any Cambodian banking app (ABA, Wing, ACLEDA, Sathapana, etc.), the webhook receives the payment notification in under 1 second, instantly confirming the order.'
  },
  {
    q: 'Is order fulfillment really automated with G2Bulk / SmileOne?',
    a: 'Yes! As soon as payment confirmation is received, our backend worker triggers an automated API dispatch to the connected game supplier (G2Bulk, Kesor, or SmileOne). In-game items (Diamonds, UC, Genesis Crystals) are credited directly to the player’s Game ID in 3 to 10 seconds without manual intervention.'
  },
  {
    q: 'How does the Cloudflare D1 isolated tenant database work?',
    a: 'Each merchant store is backed by an isolated Cloudflare D1 distributed SQLite database. This guarantees complete data isolation for customer records, profit margins, orders, and coupons, while leveraging Cloudflare’s global edge network for sub-10ms response times worldwide.'
  },
  {
    q: 'Can I connect my own custom domain to my storefront?',
    a: 'Yes! Pro and Whitelabel plans allow you to bind any custom domain (e.g., topupkh.com) with automated Cloudflare Universal SSL certificates, DDoS mitigation, and edge caching.'
  },
  {
    q: 'How does the 2-way Telegram bot integration work?',
    a: 'You can connect your Telegram Bot token in your dashboard settings. The bot serves two purposes: alerting you in real time whenever an order or payment is completed, and allowing your registered VIP customers to check balances, view package catalogs, and top up directly from Telegram.'
  },
  {
    q: 'What are the transaction fees on top-up payments?',
    a: 'We do not charge any transaction fee on Bakong KHQR or merchant wallet payments (0% platform fee). You keep 100% of your gross margins and profit markups.'
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 px-6 relative bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Everything You Need to Know
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4 leading-relaxed">
            Got questions about edge multi-tenancy, Bakong KHQR, or automated fulfillment?
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(i)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-white text-base sm:text-lg focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
