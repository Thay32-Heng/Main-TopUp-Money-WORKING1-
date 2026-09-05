import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Sparkles, ArrowRight, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';

const featuredGames = [
  {
    id: 'mobile-legends',
    name: 'Mobile Legends: Bang Bang',
    slug: 'mobile-legends',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60',
    popularPackage: '86 Diamonds - $1.00',
    badge: 'HOT 🔥',
    gradient: 'from-blue-600 to-indigo-900',
    instantDelivery: true,
  },
  {
    id: 'pubg-mobile',
    name: 'PUBG Mobile',
    slug: 'pubg-mobile',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=60',
    popularPackage: '60 UC - $0.99',
    badge: 'POPULAR ⭐',
    gradient: 'from-amber-600 to-orange-900',
    instantDelivery: true,
  },
  {
    id: 'free-fire',
    name: 'Free Fire',
    slug: 'free-fire',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=60',
    popularPackage: '100 Diamonds - $0.99',
    badge: 'INSTANT ⚡',
    gradient: 'from-rose-600 to-red-900',
    instantDelivery: true,
  },
];

export default function StoreShowcase() {
  return (
    <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-[#0a0a0f] via-[#0d0d16] to-[#0a0a0f]">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>LIVE TENANT STORE ENGINE DEMO</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Pre-Configured with Top SEA Games
            </h2>
            <p className="text-slate-400 max-w-xl text-base md:text-lg mt-3">
              Every provisioned storefront comes pre-loaded with verified game catalogs, automated UID verification, and instant Bakong KHQR QR-pay.
            </p>
          </div>

          <Link
            to="/store"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all self-start md:self-auto group"
          >
            <span>Launch Full Demo Store</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Featured Game Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredGames.map((game) => (
            <div
              key={game.id}
              className="group relative bg-[#12121c] border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_35px_rgba(6,182,212,0.2)] flex flex-col"
            >
              {/* Game Cover Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12121c] via-transparent to-black/40" />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-md text-[11px] font-bold text-amber-300">
                  {game.badge}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {game.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Instant Delivery
                    </span>
                    <span>•</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> KHQR Pay
                    </span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 mb-6">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Starting From</div>
                    <div className="text-base font-extrabold text-white font-mono">{game.popularPackage}</div>
                  </div>
                </div>

                <Link
                  to={`/topup/${game.slug}`}
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all border border-white/10 hover:border-transparent group-hover:shadow-md"
                >
                  <span>Test Top-up Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Storefront Feature Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-cyan-900/30 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Full Tenant Customization</h4>
              <p className="text-xs md:text-sm text-slate-300">
                Custom banners, custom package icons, VIP tier markups, Telegram bot webhooks, and automatic KHQR settlements.
              </p>
            </div>
          </div>
          <Link
            to="/store"
            className="whitespace-nowrap px-5 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-slate-200 transition-colors"
          >
            Explore All Games →
          </Link>
        </div>
      </div>
    </section>
  );
}
