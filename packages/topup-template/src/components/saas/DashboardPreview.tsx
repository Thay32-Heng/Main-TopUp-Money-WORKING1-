import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Zap,
  Activity,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const mockRecentOrders = [
  {
    id: 'ORD-88219',
    game: 'Mobile Legends',
    item: '86 Diamonds',
    customer: 'chann_roth@gmail.com',
    amount: '$1.12',
    profit: '+$0.18',
    status: 'COMPLETED',
    gateway: 'KHQR',
    time: '24s ago'
  },
  {
    id: 'ORD-88218',
    game: 'PUBG Mobile',
    item: '660 UC',
    customer: 'vireak.gamer@t.me',
    amount: '$8.90',
    profit: '+$1.25',
    status: 'COMPLETED',
    gateway: 'ABA PAY',
    time: '1m ago'
  },
  {
    id: 'ORD-88217',
    game: 'Free Fire',
    item: '720 Diamonds',
    customer: 'sokha_ff99@t.me',
    amount: '$5.80',
    profit: '+$0.82',
    status: 'COMPLETED',
    gateway: 'KHQR',
    time: '3m ago'
  },
  {
    id: 'ORD-88216',
    game: 'Genshin Impact',
    item: 'Blessing Welkin',
    customer: 'dara_impact@yahoo.com',
    amount: '$4.99',
    profit: '+$0.70',
    status: 'COMPLETED',
    gateway: 'WING',
    time: '5m ago'
  }
];

export default function DashboardPreview() {
  const [timeRange, setTimeRange] = useState('today');

  return (
    <section id="architecture" className="py-24 px-6 relative bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Activity className="w-3.5 h-3.5" />
            <span>CENTRALIZED MERCHANT CONTROL PLANE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Real-Time Analytics & Order Flow
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4 leading-relaxed">
            Monitor sales velocity, live KHQR payment settlements, automated G2Bulk supplier API dispatches, and net profit margins in real time.
          </p>
        </div>

        {/* Dashboard Frame Container */}
        <div className="bg-[#0e0e18] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Top Bar Navigation of Dashboard */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/10 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Merchant Analytics</span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    LIVE D1 FEED
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Store: <span className="text-slate-200 font-semibold">lucky-topup.topuppanel.pages.dev</span></p>
              </div>
            </div>

            {/* Time Toggle */}
            <div className="flex items-center gap-1 bg-[#141422] p-1 rounded-xl border border-white/10 self-start md:self-auto text-xs font-semibold">
              {['today', '7d', '30d', 'all'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-3 py-1.5 rounded-lg uppercase transition-all ${
                    timeRange === t
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Key Metric Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Total GMV Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="my-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">$4,892.40</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +28.4% from yesterday
                </div>
              </div>
              <span className="text-[11px] text-slate-500">100% Settled via Bakong</span>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Net Profit Generated</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <div className="my-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">$684.90</div>
                <div className="text-xs text-purple-400 flex items-center gap-1 mt-1 font-semibold">
                  <ArrowUpRight className="w-3.5 h-3.5" /> 14.0% average margin
                </div>
              </div>
              <span className="text-[11px] text-slate-500">Auto-allocated to balance</span>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Fulfilled Top-ups</span>
                <ShoppingCart className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="my-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">1,142</div>
                <div className="text-xs text-cyan-400 flex items-center gap-1 mt-1 font-semibold">
                  <Zap className="w-3.5 h-3.5" /> 99.8% auto-success
                </div>
              </div>
              <span className="text-[11px] text-slate-500">Avg delivery speed: 3.8s</span>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Active VIP Resellers</span>
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <div className="my-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">186</div>
                <div className="text-xs text-amber-400 flex items-center gap-1 mt-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Telegram bot linked
                </div>
              </div>
              <span className="text-[11px] text-slate-500">High-volume wholesale</span>
            </div>
          </div>

          {/* Live Orders Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Live Transaction Stream</span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">Polling every 2s</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/5">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] text-slate-400 uppercase font-mono text-[11px] border-b border-white/5">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Game & Package</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Gateway</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Net Profit</th>
                    <th className="py-3 px-4">Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {mockRecentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors font-mono">
                      <td className="py-3 px-4 font-bold text-purple-300">{order.id}</td>
                      <td className="py-3 px-4 text-white font-sans font-semibold">
                        {order.game} - <span className="text-slate-400 text-xs font-mono">{order.item}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{order.customer}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300 text-[10px]">
                          {order.gateway}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{order.amount}</td>
                      <td className="py-3 px-4 font-bold text-emerald-400">{order.profit}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>INSTANT</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
