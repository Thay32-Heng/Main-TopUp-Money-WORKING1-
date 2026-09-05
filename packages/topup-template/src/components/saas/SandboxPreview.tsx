import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Gamepad2,
  QrCode,
  Zap,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Palette,
  CreditCard,
  Layers,
  ExternalLink
} from 'lucide-react';

export default function SandboxPreview() {
  const [storeName, setStoreName] = useState('PixelPay Topup');
  const [selectedTheme, setSelectedTheme] = useState('cyberpunk');
  const [selectedGateways, setSelectedGateways] = useState<string[]>(['bakong', 'aba', 'usdt']);
  const [selectedGames, setSelectedGames] = useState<string[]>([
    'mobile-legends',
    'pubg-mobile',
    'free-fire',
    'genshin-impact',
    'honor-of-kings'
  ]);
  const [supplierMode, setSupplierMode] = useState('g2bulk-auto');
  const [marginPct, setMarginPct] = useState(12);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);

  const toggleGateway = (id: string) => {
    if (selectedGateways.includes(id)) {
      if (selectedGateways.length > 1) {
        setSelectedGateways(selectedGateways.filter((g) => g !== id));
      }
    } else {
      setSelectedGateways([...selectedGateways, id]);
    }
  };

  const toggleGame = (id: string) => {
    if (selectedGames.includes(id)) {
      if (selectedGames.length > 1) {
        setSelectedGames(selectedGames.filter((g) => g !== id));
      }
    } else {
      setSelectedGames([...selectedGames, id]);
    }
  };

  const handleSimulateDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    setDeployed(false);

    setTimeout(() => {
      setIsDeploying(false);
      setDeployed(true);
    }, 1800);
  };

  const storeSlug = storeName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 20) || 'mystore';

  return (
    <section id="sandbox" className="py-24 px-6 relative bg-gradient-to-b from-[#0a0a0f] via-[#0e0e18] to-[#0a0a0f] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTERACTIVE STORE CONFIGURATOR</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Design & Provision Your Store
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4 leading-relaxed">
            Customize branding, configure payment channels, select supported game catalogs, and test instant Cloudflare edge deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-6 bg-[#12121c] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 font-bold text-lg text-white">
                <Palette className="w-5 h-5 text-purple-400" />
                <span>Store Specifications</span>
              </div>
              <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                Step 1 of 3
              </span>
            </div>

            {/* Store Name & Slug */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Storefront Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-[#181826] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="e.g. Khmer Diamond Express"
              />
              <div className="text-xs text-slate-400 flex items-center gap-1 font-mono pt-1">
                <span>Subdomain:</span>
                <span className="text-cyan-400 font-bold">{storeSlug}.topuppanel.pages.dev</span>
              </div>
            </div>

            {/* Theme / Visual Style */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Color Aesthetic</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'cyberpunk', name: 'Cyber Neon', color: 'from-purple-500 to-cyan-500' },
                  { id: 'gold', name: 'Royal Gold', color: 'from-amber-500 to-yellow-300' },
                  { id: 'emerald', name: 'Emerald Edge', color: 'from-emerald-500 to-teal-400' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTheme(t.id)}
                    className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-2 transition-all ${
                      selectedTheme === t.id
                        ? 'bg-white/10 border-white text-white shadow-lg'
                        : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${t.color}`} />
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Gateways */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Payment Gateways (0% Fee)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'bakong', name: 'Bakong KHQR', badge: '0% Fee' },
                  { id: 'aba', name: 'ABA PayWay', badge: 'Direct' },
                  { id: 'wing', name: 'Wing Money', badge: 'Instant' },
                  { id: 'acleda', name: 'ACLEDA QR', badge: 'Instant' },
                  { id: 'usdt', name: 'USDT (TRC-20)', badge: 'Crypto' },
                  { id: 'wallet', name: 'User Wallet Balance', badge: 'Preload' }
                ].map((gw) => {
                  const active = selectedGateways.includes(gw.id);
                  return (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => toggleGateway(gw.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                        active
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                          : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{gw.name}</span>
                        {active && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <span className="text-[10px] text-slate-400">{gw.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Supported Games */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Enabled Game Catalogs</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'mobile-legends', name: 'Mobile Legends' },
                  { id: 'pubg-mobile', name: 'PUBG Mobile' },
                  { id: 'free-fire', name: 'Free Fire' },
                  { id: 'genshin-impact', name: 'Genshin Impact' },
                  { id: 'honor-of-kings', name: 'Honor of Kings' },
                  { id: 'roblox', name: 'Roblox' },
                  { id: 'valorant', name: 'Valorant' }
                ].map((game) => {
                  const active = selectedGames.includes(game.id);
                  return (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => toggleGame(game.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        active
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                          : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {game.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Margin Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Target Profit Margin Markup</span>
                <span className="text-cyan-400 font-mono font-bold">+{marginPct}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={marginPct}
                onChange={(e) => setMarginPct(Number(e.target.value))}
                className="w-full h-2 bg-[#1c1c2e] rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>5% (Volume)</span>
                <span>15% (Recommended)</span>
                <span>30% (High Margin)</span>
              </div>
            </div>

            {/* Deploy Action Button */}
            <button
              type="button"
              disabled={isDeploying}
              onClick={handleSimulateDeploy}
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 text-sm transition-all"
            >
              {isDeploying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Configuring Isolated D1 Tenant & Edge Routing...</span>
                </>
              ) : deployed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Store Deployed Successfully!</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Deploy Tenant Storefront</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Live Mockup Viewport */}
          <div className="lg:col-span-6 bg-[#0a0a10] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            {/* Browser frame mockup header */}
            <div className="bg-[#141420] border border-white/10 rounded-2xl p-3 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="bg-[#0b0b12] border border-white/10 px-4 py-1 rounded-full text-xs font-mono text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>https://{storeSlug}.topuppanel.pages.dev</span>
              </div>
              <Link to="/store" className="text-slate-400 hover:text-white transition-colors">
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            {/* Store Preview Area */}
            <div className="bg-[#12121e] border border-white/10 rounded-2xl p-6 space-y-6">
              {/* Store Brand Banner */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-md">
                    {storeName.charAt(0) || 'T'}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{storeName || 'My Game Topup'}</h4>
                    <p className="text-xs text-slate-400">Official Automated Topup Partner</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Auto-Fulfillment Online
                </span>
              </div>

              {/* Selected Catalogs List */}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Catalog Display ({selectedGames.length} Active Games)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {selectedGames.slice(0, 4).map((gid) => (
                    <div
                      key={gid}
                      className="p-3 bg-white/[0.03] border border-white/5 rounded-xl flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600/40 to-indigo-600/40 flex items-center justify-center shrink-0">
                        <Gamepad2 className="w-4 h-4 text-purple-300" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-white truncate capitalize">
                          {gid.replace(/-/g, ' ')}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono">
                          From $0.99 (+{marginPct}% margin)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Bar Preview */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">
                  Connected Payment Webhooks
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedGateways.map((g) => (
                    <span
                      key={g}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 uppercase"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Live Top-up CTA preview */}
              <Link
                to="/store"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>🎮 Test Customer Top-Up Flow (Live Demo)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Bottom info banner */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>Cloudflare D1 SQLite & Edge Functions</span>
              <span className="font-mono text-emerald-400">Status: Operational</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
