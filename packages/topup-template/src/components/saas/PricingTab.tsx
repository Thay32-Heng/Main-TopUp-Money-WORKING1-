import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Zap, Shield, Crown } from 'lucide-react';

const plans = [
  {
    name: 'Starter Merchant',
    badge: 'FREE TRIAL',
    description: 'Perfect for new game top-up shops testing automated KHQR payments.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '1 Isolated Cloudflare D1 Storefront',
      'yourname.topuppanel.pages.dev Subdomain',
      'Bakong KHQR 0% Transaction Fees',
      'G2Bulk / SmileOne Auto-Fulfillment',
      'Up to $2,000 Monthly GMV',
      'Standard Community Support'
    ],
    highlight: false,
    cta: 'Start Free Store',
    ctaLink: '/checkout?plan=starter'
  },
  {
    name: 'Pro Merchant',
    badge: 'MOST POPULAR',
    description: 'For growing sellers who need Telegram Bot sync, custom domains, and VIP tiers.',
    monthlyPrice: 29,
    yearlyPrice: 24,
    features: [
      'Everything in Starter, plus:',
      'Custom Branded Domain (yourbrand.com)',
      '2-Way Telegram Bot (Admin & Customer)',
      'VIP Reseller Tier Margins & Coupons',
      'Unlimited Monthly GMV Volume',
      'Automated Telegram Payment Webhooks',
      'Priority 24/7 Discord & Telegram Support'
    ],
    highlight: true,
    cta: 'Launch Pro Store',
    ctaLink: '/checkout?plan=pro'
  },
  {
    name: 'Whitelabel Agency',
    badge: 'SCALE & RESELL',
    description: 'Deploy unlimited top-up stores under your own master agency platform.',
    monthlyPrice: 99,
    yearlyPrice: 79,
    features: [
      'Deploy up to 20 Custom Tenant Storefronts',
      'Full Whitelabel & Custom Brand Identity',
      'Multi-supplier fallback (G2Bulk + Kesor + SmileOne)',
      'Custom API & Webhook Dispatch Access',
      'Dedicated Account Manager & Fast-track KYC',
      'Custom Payment Gateway Integrations'
    ],
    highlight: false,
    cta: 'Launch Enterprise Store',
    ctaLink: '/checkout?plan=enterprise'
  }
];

export default function PricingTab() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <section id="pricing" className="py-24 px-6 relative bg-gradient-to-b from-[#0a0a0f] via-[#0d0d16] to-[#0a0a0f]">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Crown className="w-3.5 h-3.5" />
            <span>TRANSPARENT SAAS PRICING</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Predictable Plans for Every Merchant
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4 leading-relaxed">
            Zero hidden transaction fees on Bakong KHQR payments. Keep 100% of your top-up margins.
          </p>

          {/* Billing Switch */}
          <div className="inline-flex items-center gap-3 p-1.5 bg-[#141422] border border-white/10 rounded-full mt-8">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Yearly Billing</span>
              <span className="bg-emerald-400 text-black text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, i) => {
            const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <div
                key={i}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-[#18182c] to-[#10101e] border-2 border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.25)] lg:-translate-y-3'
                    : 'bg-[#10101a] border border-white/10 hover:border-white/20'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                    </div>
                    {!plan.highlight && (
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-white/5 text-slate-400 border border-white/10 font-bold uppercase">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="my-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono">${price}</span>
                      <span className="text-slate-400 text-sm font-medium">/ month</span>
                    </div>
                    {billingCycle === 'yearly' && price > 0 && (
                      <span className="text-[11px] text-emerald-400 font-medium">Billed annually (${price * 12}/yr)</span>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Included Features</div>
                    {plan.features.map((feat, fi) => (
                      <div key={fi} className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                  <Link
                    to={plan.ctaLink}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/10 hover:bg-white/15 text-white'
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
