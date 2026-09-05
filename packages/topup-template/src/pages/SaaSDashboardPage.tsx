import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  DollarSign,
  ShoppingCart,
  Users,
  Settings,
  Bot,
  Zap,
  Layers,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  ExternalLink,
  Plus,
  RefreshCw,
  QrCode,
  Key,
  Gamepad2,
  Box
} from 'lucide-react';
import SaaSNavbar from '../components/saas/Navbar';
import SaaSFooter from '../components/saas/Footer';

export default function SaaSDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'gateways' | 'telegram' | 'suppliers'>('overview');
  const [markupPct, setMarkupPct] = useState(12);
  const [botToken, setBotToken] = useState('682949102:AAH9f291Kkd_9192kds-1');
  const [botEnabled, setBotEnabled] = useState(true);

  return (
    <div className="min-h-screen bg-[#07070c] text-white selection:bg-purple-500 selection:text-white">
      <SaaSNavbar />

      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Activity className="w-3.5 h-3.5" />
              <span>TENANT STORE MANAGEMENT</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Merchant Control Center
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Store URL: <span className="text-purple-300 font-mono">mystore.topuppanel.pages.dev</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/store"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-sm font-bold transition-all"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>View Customer Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold shadow-lg shadow-purple-500/25 transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>Store Database Admin</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto py-6 border-b border-white/5">
          {[
            { id: 'overview', label: 'Overview & Metrics', icon: Activity },
            { id: 'pricing', label: 'Profit Margins & Tiers', icon: TrendingUp },
            { id: 'gateways', label: 'Bakong KHQR & PayWays', icon: QrCode },
            { id: 'telegram', label: 'Telegram Bot Sync', icon: Bot },
            { id: 'suppliers', label: 'G2Bulk API Connectors', icon: Zap }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8 mt-8">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-2xl bg-[#0f0f18] border border-white/10 flex flex-col justify-between shadow-xl">
                <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
                  <span>Gross Sales (Bakong)</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="my-3">
                  <div className="text-3xl font-extrabold text-white font-mono">$12,480.50</div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1 font-semibold mt-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +18.2% vs last week
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">0% platform commission fee</div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0f0f18] border border-white/10 flex flex-col justify-between shadow-xl">
                <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
                  <span>Net Profit (Markup)</span>
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                <div className="my-3">
                  <div className="text-3xl font-extrabold text-white font-mono">$1,684.90</div>
                  <div className="text-xs text-purple-400 flex items-center gap-1 font-semibold mt-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> 13.5% avg margin realized
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">Direct merchant retention</div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0f0f18] border border-white/10 flex flex-col justify-between shadow-xl">
                <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
                  <span>Completed Top-Ups</span>
                  <ShoppingCart className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="my-3">
                  <div className="text-3xl font-extrabold text-white font-mono">2,841</div>
                  <div className="text-xs text-cyan-400 flex items-center gap-1 font-semibold mt-1">
                    <Zap className="w-3.5 h-3.5" /> 99.9% automated delivery
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">Avg API dispatch: 3.4s</div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0f0f18] border border-white/10 flex flex-col justify-between shadow-xl">
                <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
                  <span>Active VIP Customers</span>
                  <Users className="w-4 h-4 text-amber-400" />
                </div>
                <div className="my-3">
                  <div className="text-3xl font-extrabold text-white font-mono">412</div>
                  <div className="text-xs text-amber-400 flex items-center gap-1 font-semibold mt-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Telegram bot linked
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">Reseller volume growing</div>
              </div>
            </div>

            {/* Quick Actions & Store Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#0f0f18] border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Automated Supplier Health</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">G2Bulk Production API</div>
                      <div className="text-[10px] text-slate-400">api.kesor.cam</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold text-[10px]">
                      ONLINE (18ms)
                    </span>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Cloudflare D1 SQLite Binding</div>
                      <div className="text-[10px] text-slate-400">DB_TENANT_DEMO</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold text-[10px]">
                      READY (4ms)
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0f0f18] border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span>Bakong KHQR Webhook Gateway</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time EMVCo KHQR listener active at <code className="text-purple-300 font-mono">/api/payments/ikhode-bakong</code>. Zero transaction fee enabled.
                </p>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Connected with NBC Bakong Open Banking</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0f0f18] border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>Telegram Alerts & VIP Bot</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Instant admin push notification sent to your Telegram chat whenever an order is successfully fulfilled.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('telegram')}
                  className="w-full py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 font-bold text-xs hover:bg-purple-600/30 transition-all"
                >
                  Configure Telegram Webhook →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Pricing & Margins */}
        {activeTab === 'pricing' && (
          <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 mt-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Global Profit Markup Engine</h3>
              <p className="text-xs text-slate-400">
                Set dynamic percentage profit margins on top of G2Bulk supplier base costs.
              </p>
            </div>

            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl space-y-4 max-w-xl">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-300">Default Catalog Markup</span>
                <span className="text-purple-400 font-mono font-bold text-lg">+{markupPct}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                value={markupPct}
                onChange={(e) => setMarkupPct(Number(e.target.value))}
                className="w-full h-2 bg-[#1c1c2e] rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>5% (Competitive)</span>
                <span>12% (Standard)</span>
                <span>35% (High Margin)</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Gateways */}
        {activeTab === 'gateways' && (
          <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 mt-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Payment Gateways & KHQR Settings</h3>
              <p className="text-xs text-slate-400">
                Configure your merchant Bakong ID, ABA PayWay API keys, and auto-settlement bank accounts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Bakong KHQR (0% Fee)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs">ACTIVE</span>
                </div>
                <div className="text-xs text-slate-400">
                  Receiver Account: <span className="text-white font-mono">merchant_kesor@aba</span>
                </div>
              </div>

              <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Customer Preloaded Wallet</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs">ACTIVE</span>
                </div>
                <div className="text-xs text-slate-400">
                  Allow users to deposit funds and top up with 1-click balance checkout.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Telegram */}
        {activeTab === 'telegram' && (
          <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 mt-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Telegram Bot Sync & Alerts</h3>
              <p className="text-xs text-slate-400">
                Connect your Telegram bot token to enable live admin alerts and customer telegram top-up ordering.
              </p>
            </div>

            <div className="space-y-4 max-w-xl">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Telegram Bot API Token</label>
                <input
                  type="text"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-between text-xs">
                <span className="text-purple-300">Telegram Bot Webhook Status</span>
                <span className="font-mono text-emerald-400 font-bold">CONNECTED (@AhnajakTopupBot)</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Suppliers */}
        {activeTab === 'suppliers' && (
          <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 mt-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">G2Bulk / SmileOne API Connectors</h3>
              <p className="text-xs text-slate-400">
                Manage automated fulfillment vendor endpoints, API keys, and balance monitoring.
              </p>
            </div>

            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-sm">G2Bulk Wholesale Fulfillment API</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">Endpoint: https://api.kesor.cam/api/g2bulk</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold">
                CONNECTED
              </span>
            </div>
          </div>
        )}
      </main>

      <SaaSFooter />
    </div>
  );
}
