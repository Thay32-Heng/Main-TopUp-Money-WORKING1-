import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Rocket,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  Gamepad2,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Server,
  Layers,
  Key,
  Check,
  Activity,
  Bot
} from 'lucide-react';
import SaaSNavbar from '../components/saas/Navbar';
import SaaSFooter from '../components/saas/Footer';

export default function SaaSCheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get('plan') || 'starter';

  const [siteName, setSiteName] = useState('My TopUp Store');
  const [slug, setSlug] = useState('my-topup-store');
  const [adminEmail, setAdminEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [topupApiKey, setTopupApiKey] = useState('');
  const [topupApiSecret, setTopupApiSecret] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(planParam);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  // Slug check states
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'available' | 'taken'>('idle');
  const [slugMessage, setSlugMessage] = useState('');

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-generate slug from store name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSiteName(val);
    const generated = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
    setSlug(generated);
  };

  // Real-time Slug Verification
  useEffect(() => {
    if (!slug || slug.length < 2) {
      setSlugStatus('idle');
      setSlugMessage('');
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const res = await fetch(`/api/sites/check-slug?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (data.available) {
          setSlugStatus('available');
          setSlugMessage('Store URL is available!');
        } else {
          setSlugStatus('taken');
          setSlugMessage(data.error || 'Slug is already taken');
        }
      } catch (err) {
        setSlugStatus('idle');
      } finally {
        setIsCheckingSlug(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || slugStatus === 'taken') return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName,
          slug,
          adminEmail,
          customerName: customerName || adminEmail.split('@')[0],
          topupApiKey,
          topupApiSecret,
          plan: selectedPlan,
        }),
      });

      const checkoutData = await res.json();
      if (!res.ok) {
        throw new Error(checkoutData.error || 'Checkout failed');
      }

      const orderId = checkoutData.order.id;
      navigate(`/order/${orderId}/provisioning`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong during checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const planPricing = {
    starter: { monthly: 0, yearly: 0, label: 'Starter Community', badge: 'FREE FOREVER' },
    pro: { monthly: 49, yearly: 39, label: 'Pro Merchant', badge: 'POPULAR' },
    enterprise: { monthly: 149, yearly: 119, label: 'Enterprise Platform', badge: 'SCALE' },
  };

  const currentPrice =
    planPricing[selectedPlan as keyof typeof planPricing] || planPricing.starter;
  const priceValue = billingInterval === 'monthly' ? currentPrice.monthly : currentPrice.yearly;

  return (
    <div className="min-h-screen bg-[#07070c] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      <SaaSNavbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Cloudflare Edge Provisioning</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Launch Your Game Top-Up Store
          </h1>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            Complete your setup in under 60 seconds. We automatically provision your isolated Cloudflare D1 database, Bakong KHQR checkout, and game top-up catalog.
          </p>
        </div>

        {errorMessage && (
          <div className="max-w-4xl mx-auto mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          {/* Left Column: Form Fields */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Store Configuration */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0e18] border border-white/10 shadow-xl space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Store Identity & Domain</h2>
                  <p className="text-xs text-slate-400">Choose your store name and live web slug</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Store Display Name</label>
                <div className="relative">
                  <Gamepad2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={siteName}
                    onChange={handleNameChange}
                    placeholder="e.g. Ahnajak Gaming Store"
                    className="w-full bg-[#161624] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Store Web Subpath (Slug)
                  </label>
                  {isCheckingSlug && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                      Checking availability...
                    </span>
                  )}
                  {!isCheckingSlug && slugStatus === 'available' && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Available
                    </span>
                  )}
                  {!isCheckingSlug && slugStatus === 'taken' && (
                    <span className="text-[11px] text-red-400 flex items-center gap-1 font-semibold">
                      <XCircle className="w-3 h-3" />
                      Taken
                    </span>
                  )}
                </div>

                <div className="flex rounded-xl overflow-hidden border border-white/10 focus-within:border-purple-500 bg-[#161624] transition-colors">
                  <span className="inline-flex items-center px-3 text-xs text-slate-400 bg-white/[0.03] border-r border-white/10 font-mono">
                    topuppanel.pages.dev/
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) =>
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, '')
                          .slice(0, 40)
                      )
                    }
                    placeholder="my-topup-store"
                    className="flex-1 bg-transparent px-3.5 py-3 text-white text-sm font-mono focus:outline-none"
                  />
                </div>
                {slugMessage && (
                  <p
                    className={`text-xs mt-1.5 ${
                      slugStatus === 'available' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {slugMessage}
                  </p>
                )}
              </div>
            </div>

            {/* Step 2: Administrator Credentials */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0e18] border border-white/10 shadow-xl space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Administrator Account</h2>
                  <p className="text-xs text-slate-400">Credentials to manage your store backend</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Owner Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Alex Seng"
                    className="w-full bg-[#161624] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Admin Email Address <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@mystore.com"
                    className="w-full bg-[#161624] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  A one-time secure initial password will be generated automatically and displayed upon provisioning completion.
                </span>
              </div>
            </div>

            {/* Step 3: Top-Up Supplier Configuration (Optional) */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0e18] border border-white/10 shadow-xl space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">G2Bulk Supplier Connection</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono">OPTIONAL</span>
                  </div>
                  <p className="text-xs text-slate-400">Connect automated wholesale top-up API keys</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">G2Bulk API Key</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={topupApiKey}
                      onChange={(e) => setTopupApiKey(e.target.value)}
                      placeholder="Optional: Enter your G2Bulk Partner Key"
                      className="w-full bg-[#161624] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">G2Bulk API Secret</label>
                  <input
                    type="password"
                    value={topupApiSecret}
                    onChange={(e) => setTopupApiSecret(e.target.value)}
                    placeholder="Optional: Enter your G2Bulk Partner Secret"
                    className="w-full bg-[#161624] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout Action */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0e18] border border-white/10 shadow-2xl space-y-6 sticky top-28">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">Order Summary</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                  {currentPrice.badge}
                </span>
              </div>

              {/* Plan Selection Radios */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-400">Select Subscription Tier</label>
                {(['starter', 'pro', 'enterprise'] as const).map((p) => {
                  const info = planPricing[p];
                  const isSelected = selectedPlan === p;
                  return (
                    <div
                      key={p}
                      onClick={() => setSelectedPlan(p)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-600/10 border-purple-500 shadow-md shadow-purple-500/10'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-purple-400 bg-purple-500' : 'border-slate-500'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{info.label}</div>
                          <div className="text-[11px] text-slate-400">
                            {p === 'starter' ? 'Unlimited free demo' : 'Production store deployment'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-white font-mono">
                          {info.monthly === 0 ? '$0' : `$${info.monthly}/mo`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Features Included List */}
              <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Cloudflare D1 Isolated SQLite Database</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bakong KHQR 0% Gateway & ABA PayWay</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Mobile Legends, PUBG & Free Fire Catalog</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Telegram Admin Alerts & Bot Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full Next-Gen Customer Storefront UI</span>
                </div>
              </div>

              {/* Total Price Display */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-semibold">Total Due Today</div>
                  <div className="text-2xl font-extrabold text-white font-mono">
                    ${priceValue.toFixed(2)} <span className="text-xs text-slate-400 font-normal">USD</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-emerald-400 font-semibold">
                  Zero Setup Fees
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || slugStatus === 'taken' || isCheckingSlug || !adminEmail}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Provisioning Store Infrastructure...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                    <span>Deploy & Launch Storefront Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-[11px] text-slate-500">
                By clicking deploy, your store instance will be provisioned on Cloudflare Pages and D1 Edge Network.
              </div>
            </div>
          </div>
        </form>
      </main>

      <SaaSFooter />
    </div>
  );
}
