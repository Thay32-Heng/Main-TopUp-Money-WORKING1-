import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Zap, Globe, ChevronRight, Gamepad2, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import Terminal from './Terminal';
import MockMetrics from './MockMetrics';

const mockLogs = [
  "[INFO] Received provision request for 'store-demo'",
  "[INFO] ==> Allocating Cloudflare D1 isolated tenant database...",
  "[SUCCESS] D1 SQLite database allocated (binding: DB_TENANT_DEMO)",
  "[INFO] ==> Applying database schema (22 tables, games catalog, packages)...",
  "[SUCCESS] Schema migration complete in 84ms",
  "[INFO] ==> Configuring Bakong KHQR & ABA Pay gateway routes...",
  "[SUCCESS] Payment webhooks active: /api/payments/ikhode-bakong",
  "[INFO] ==> Binding G2Bulk auto-fulfillment API connectors...",
  "[SUCCESS] Edge Storefront 'store-demo.topuppanel.pages.dev' is LIVE and operational."
];

export default function Hero() {
  const [storeName, setStoreName] = useState('MyGameTopup');
  const [storeSlug, setStoreSlug] = useState('my-gametopup');
  const [provisioning, setProvisioning] = useState(false);
  const [provisionDone, setProvisionDone] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStoreName(val);
    setStoreSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 24)
    );
  };

  const handleQuickProvision = (e: React.FormEvent) => {
    e.preventDefault();
    if (provisioning) return;
    setProvisioning(true);
    setProvisionDone(false);

    setTimeout(() => {
      setProvisioning(false);
      setProvisionDone(true);
    }, 2000);
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 px-6 overflow-hidden">
      {/* Background Neon Blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Tag */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-cyan-500/10 border border-purple-500/20 text-purple-300 text-xs md:text-sm font-semibold backdrop-blur-md shadow-lg shadow-purple-500/10">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span>Cloudflare Edge Multi-Tenant Game Top-Up Engine</span>
            <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            Launch Automated Game Top-Up Stores{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">
              in 60 Seconds
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The complete multi-tenant platform for Southeast Asian game top-up merchants. Instant Cloudflare D1 databases, Bakong KHQR checkout, and G2Bulk auto-fulfillment.
          </p>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link
              to="/store"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-base px-8 py-4 rounded-full transition-all shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] hover:scale-105"
            >
              <Gamepad2 className="w-5 h-5" />
              <span>🎮 Explore Live Demo Store</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#sandbox"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-base px-8 py-4 rounded-full transition-all backdrop-blur-sm hover:scale-105"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Provision Your Own Store</span>
            </a>
          </div>
        </div>

        {/* Interactive Console / Provisioning Showcase Box */}
        <div className="max-w-6xl mx-auto mt-12 bg-[#0d0d16] border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left: Interactive Configurator */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Instant Store Builder</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Create Your Storefront
                </h3>
                <p className="text-xs md:text-sm text-slate-400">
                  Select a store name to preview instant database setup and DNS routing.
                </p>
              </div>

              <form onSubmit={handleQuickProvision} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Store Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={handleNameChange}
                    className="w-full bg-[#161622] border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="e.g. Lucky Game Topup"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Store URL</label>
                  <div className="flex items-center bg-[#161622] border border-white/15 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-400 font-mono">
                    <span className="text-purple-400 font-bold">{storeSlug || 'store'}</span>
                    <span className="text-slate-500">.topuppanel.pages.dev</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={provisioning}
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {provisioning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Allocating Edge D1 Schema...</span>
                    </>
                  ) : provisionDone ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Store Provisioned! Launch Store →</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>⚡ Simulate Instant Provisioning</span>
                    </>
                  )}
                </button>

                {provisionDone && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                    <span>Store ready: <strong className="font-mono">{storeSlug}.topuppanel.pages.dev</strong></span>
                    <Link to="/store" className="underline font-bold text-white ml-2">
                      Open Store
                    </Link>
                  </div>
                )}
              </form>

              {/* Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-300 font-medium">Bakong KHQR 0% Fee</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5">
                  <Bot className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-xs text-slate-300 font-medium">Telegram Bot Sync</span>
                </div>
              </div>
            </div>

            {/* Right: Live Simulated Terminal Logs */}
            <div className="lg:col-span-7 flex flex-col">
              <Terminal lines={mockLogs} typingSpeed={30} className="h-72 lg:h-full min-h-[300px]" />
            </div>
          </div>
        </div>

        {/* Global Live Counters / Metrics */}
        <MockMetrics />
      </div>
    </section>
  );
}
