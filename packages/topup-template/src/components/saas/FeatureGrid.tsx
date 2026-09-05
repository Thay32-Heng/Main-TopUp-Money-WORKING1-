import React from 'react';
import {
  Database,
  QrCode,
  Bot,
  Zap,
  ShieldCheck,
  Sliders,
  Globe2,
  Layers,
  TrendingUp,
  Lock
} from 'lucide-react';

const features = [
  {
    icon: <Database className="w-6 h-6 text-purple-400" />,
    title: "Isolated Cloudflare D1 Tenants",
    description: "Every merchant gets a dedicated, distributed SQLite D1 database instance with sub-10ms global edge latency and zero cross-tenant contamination.",
    tag: "EDGE ARCHITECTURE"
  },
  {
    icon: <QrCode className="w-6 h-6 text-emerald-400" />,
    title: "Bakong KHQR & ABA Pay",
    description: "Direct zero-fee KHQR QR code generation with instant webhook confirmation. Supports all 50+ Cambodian member banks and deep links.",
    tag: "0% PAYMENT FEE"
  },
  {
    icon: <Zap className="w-6 h-6 text-amber-400" />,
    title: "Automated G2Bulk Fulfillment",
    description: "Orders trigger instant background API dispatch to G2Bulk / SmileOne suppliers. Player items are delivered within 5 seconds of payment verification.",
    tag: "AUTO-DISPATCH"
  },
  {
    icon: <Bot className="w-6 h-6 text-cyan-400" />,
    title: "Telegram Bot Integration",
    description: "Real-time admin notification stream and user top-up bot. Process transactions, check balances, and receive payment alerts straight in Telegram.",
    tag: "2-WAY TELEGRAM"
  },
  {
    icon: <Sliders className="w-6 h-6 text-rose-400" />,
    title: "Smart Profit Margins & VIP Tiers",
    description: "Dynamically mark up supplier prices with percentage or fixed margins. Create Member, VIP, and Reseller tier pricing for high-volume buyers.",
    tag: "REVENUE ENGINE"
  },
  {
    icon: <Globe2 className="w-6 h-6 text-blue-400" />,
    title: "Custom Subdomains & SSL",
    description: "Launch on yourname.topuppanel.pages.dev or connect custom branded domains with automated Cloudflare SSL certificates and DDoS protection.",
    tag: "WHITE-LABEL"
  }
];

export default function FeatureGrid() {
  return (
    <section id="features" className="py-24 px-6 relative bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>ENTERPRISE-GRADE CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Built for High-Volume Top-Up Operations
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4 leading-relaxed">
            Everything you need to operate an automated, reliable digital game currency marketplace without maintaining server infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group p-8 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/10 hover:border-purple-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/20 group-hover:border-purple-500/40 transition-all">
                    {feature.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-400 group-hover:text-purple-300 group-hover:border-purple-500/30 transition-colors">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-semibold text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Explore feature docs</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
