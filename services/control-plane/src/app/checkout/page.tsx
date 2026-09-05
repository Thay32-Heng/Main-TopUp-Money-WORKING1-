'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
} from 'lucide-react';

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planParam = searchParams?.get('plan') || 'starter';

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
      // 1. Create Checkout / Order
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
        }),
      });

      const checkoutData = await res.json();
      if (!res.ok) {
        throw new Error(checkoutData.error || 'Checkout failed');
      }

      const orderId = checkoutData.order.id;

      // 2. Redirect immediately to Live Provisioning Dashboard
      router.push(`/order/${orderId}/provisioning`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Something went wrong during checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/25">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white">Ahnajak TopUp SaaS</span>
          </a>

          <a
            href="/"
            className="text-xs text-slate-400 hover:text-white transition"
          >
            ← Back to Storefront
          </a>
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">
            Launch Your TopUp Store
          </h1>
          <p className="text-slate-400 text-sm">
            Customize your branding, URL, and provider settings. Your dedicated store provisions in under 30 seconds.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Plan Selection */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              1. Choose SaaS Plan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'starter', name: 'Starter', price: '$29/mo', desc: 'Single tenant store' },
                { id: 'pro', name: 'Pro Business', price: '$79/mo', desc: 'Custom domain & auto-fulfill' },
                { id: 'enterprise', name: 'Enterprise', price: '$199/mo', desc: 'Multi-cluster high volume' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                    selectedPlan === p.id
                      ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{p.name}</span>
                      {selectedPlan === p.id && <Check className="w-4 h-4 text-purple-400" />}
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">{p.desc}</span>
                  </div>
                  <span className="text-sm font-bold text-purple-400 mt-3">{p.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Store Branding & URL */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" />
              2. Store Identity & Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Store Display Name
                </label>
                <input
                  type="text"
                  required
                  value={siteName}
                  onChange={handleNameChange}
                  placeholder="e.g. Diamond Kings Topup"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-sm text-white placeholder-slate-600 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Subpath / Slug Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="e.g. diamond-kings"
                    className={`w-full pl-3.5 pr-9 py-2.5 rounded-xl bg-slate-950 border text-sm text-white placeholder-slate-600 focus:outline-none font-mono transition ${
                      slugStatus === 'available'
                        ? 'border-emerald-500/60 focus:border-emerald-500'
                        : slugStatus === 'taken'
                        ? 'border-red-500/60 focus:border-red-500'
                        : 'border-slate-800 focus:border-purple-500'
                    }`}
                  />
                  <div className="absolute right-3 top-3 text-slate-500">
                    {isCheckingSlug && <Loader2 className="w-4 h-4 animate-spin text-purple-400" />}
                    {!isCheckingSlug && slugStatus === 'available' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    {!isCheckingSlug && slugStatus === 'taken' && (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
                {slugMessage && (
                  <p
                    className={`text-[11px] mt-1 ${
                      slugStatus === 'available' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {slugMessage}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Admin Account Credentials */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              3. Store Administrator Account
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Owner Full Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-sm text-white placeholder-slate-600 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Admin Login Email *
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-sm text-white placeholder-slate-600 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Provider Top-Up API Keys (Optional) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" />
              4. Top-Up Provider Integration (Optional)
            </h2>
            <p className="text-xs text-slate-400">
              You can provide G2Bulk / Provider API keys now or configure them inside your store admin panel later.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Provider API Key / UID
                </label>
                <input
                  type="text"
                  value={topupApiKey}
                  onChange={(e) => setTopupApiKey(e.target.value)}
                  placeholder="e.g. G2B_KEY_..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-sm text-white placeholder-slate-600 focus:outline-none font-mono transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Provider API Secret
                </label>
                <input
                  type="password"
                  value={topupApiSecret}
                  onChange={(e) => setTopupApiSecret(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-sm text-white placeholder-slate-600 focus:outline-none font-mono transition"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting || slugStatus === 'taken' || !adminEmail}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-purple-600/30 flex items-center justify-center gap-3 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Order & Enqueueing Provisioning...</span>
              </>
            ) : (
              <>
                <span>Complete Checkout & Auto-Provision Store</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading checkout...</div>}>
      <CheckoutForm />
    </Suspense>
  );
}
