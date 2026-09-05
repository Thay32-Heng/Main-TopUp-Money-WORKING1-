'use client';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const plans = [
  {
    name: "Starter",
    description: "Perfect for new top-up businesses just getting started.",
    priceMonthly: 49,
    priceYearly: 39,
    features: [
      "Custom Subdomain (store.kesor.cam)",
      "Up to 1,000 monthly orders",
      "Manual fulfillment worker portal",
      "Basic KHQR integration",
      "Community Support"
    ],
    cta: "Start Free Trial",
    highlight: false
  },
  {
    name: "Growth",
    description: "For scaling businesses that need automation and custom branding.",
    priceMonthly: 99,
    priceYearly: 79,
    features: [
      "Custom Domain (yourstore.com)",
      "Up to 10,000 monthly orders",
      "Telegram Bot Integration",
      "Automated provider APIs (Moonton, etc.)",
      "Priority Email Support"
    ],
    cta: "Start Free Trial",
    highlight: true
  },
  {
    name: "Enterprise",
    description: "High-volume operations requiring dedicated infrastructure.",
    priceMonthly: 299,
    priceYearly: 249,
    features: [
      "Unlimited monthly orders",
      "Dedicated database cluster",
      "Custom API integrations",
      "VIP Tiered Pricing for customers",
      "24/7 Phone Support"
    ],
    cta: "Contact Sales",
    highlight: false
  }
];

export default function PricingTab() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Simple, transparent pricing</h2>
          
          <div className="inline-flex items-center p-1 bg-white/5 rounded-full border border-white/10 mt-4">
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${!isAnnual ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${isAnnual ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setIsAnnual(true)}
            >
              Annually <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded ml-1">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`relative p-8 rounded-3xl border ${
                plan.highlight 
                  ? 'border-purple-500 bg-gradient-to-b from-purple-900/20 to-[#0F0F16] shadow-2xl shadow-purple-900/20' 
                  : 'border-white/10 bg-[#0F0F16]'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-slate-400 mb-6 h-10">{plan.description}</p>
              
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">
                  ${isAnnual ? plan.priceYearly : plan.priceMonthly}
                </span>
                <span className="text-slate-500">/mo</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link 
                href={plan.highlight ? '/login' : '#'}
                className={`block w-full text-center py-3 rounded-xl font-bold transition-transform hover:scale-105 ${
                  plan.highlight 
                    ? 'bg-white text-black' 
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
