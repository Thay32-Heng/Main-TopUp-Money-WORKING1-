'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Server,
  Database,
  Globe,
  Activity,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Gamepad2,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface ProvisionLogEntry {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  step: string;
  message: string;
  createdAt: string;
}

interface OrderStatusData {
  order: {
    id: string;
    status: string;
    total: number;
    currency: string;
    createdAt: string;
  };
  customer: {
    id: string;
    email: string;
    name: string;
  };
  site: {
    id: string;
    name: string;
    slug: string;
    status: 'PENDING' | 'PROVISIONING' | 'READY' | 'FAILED' | 'SUSPENDED';
    internalPort?: number;
    databaseName?: string;
    publicUrl: string;
    adminUrl: string;
  } | null;
  provisioning: {
    jobId: string | null;
    status: 'QUEUED' | 'PROVISIONING' | 'READY' | 'FAILED';
    currentStep: string;
    retryCount: number;
    errorMessage?: string;
    logs: ProvisionLogEntry[];
    adminCredentials?: {
      email: string;
      password?: string;
    };
  };
}

const PIPELINE_STEPS = [
  {
    id: 'STEP_DATABASE',
    label: 'Database Allocation',
    description: 'PostgreSQL database creation & dedicated user role',
    icon: Database,
  },
  {
    id: 'STEP_MIGRATE_AND_SEED',
    label: 'Schema Migration & Seeding',
    description: 'Applying tables, views, and initial admin account',
    icon: ShieldCheck,
  },
  {
    id: 'STEP_DOCKER_DEPLOY',
    label: 'App Container Launch',
    description: 'Docker container instantiation & network binding',
    icon: Server,
  },
  {
    id: 'STEP_ROUTING',
    label: 'Route Configuration',
    description: 'Traefik v3 dynamic file provider reverse proxy rules',
    icon: Globe,
  },
  {
    id: 'STEP_HEALTH_CHECK',
    label: 'Health Check Verification',
    description: 'Live HTTP probe polling for 200 OK status',
    icon: Activity,
  },
];

export default function LiveProvisioningPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [data, setData] = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const logContainerRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error('Failed to fetch status');
      const json: OrderStatusData = await res.json();
      setData(json);
      setLoading(false);
    } catch (err) {
      console.error('Polling error:', err);
    }
  };

  // Setup 2.5s Polling Interval
  useEffect(() => {
    fetchStatus();

    pollIntervalRef.current = setInterval(() => {
      fetchStatus();
    }, 2500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [orderId]);

  // Auto-scroll terminal logs to bottom on new logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [data?.provisioning?.logs]);

  // Stop polling if status is final
  useEffect(() => {
    const status = data?.site?.status || data?.provisioning?.status;
    if (status === 'READY' || status === 'FAILED') {
      // Keep slow refresh or stop
    }
  }, [data?.site?.status, data?.provisioning?.status]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRetry = async () => {
    if (!data?.site?.id) return;
    setIsRetrying(true);
    try {
      await fetch('/api/provision/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: data.site.id, orderId }),
      });
      await fetchStatus();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
        <p className="text-sm">Connecting to SaaS Control Plane...</p>
      </div>
    );
  }

  const site = data?.site;
  const provisioning = data?.provisioning;
  const isAwaitingPayment = data?.order?.status === 'AWAITING_PAYMENT';
  const isReady = site?.status === 'READY' || provisioning?.status === 'READY';
  const isFailed = site?.status === 'FAILED' || provisioning?.status === 'FAILED';
  const isProvisioning = !isReady && !isFailed && !isAwaitingPayment;

  // Determine active step index
  const hasStarted = Boolean(provisioning?.jobId) && !isAwaitingPayment;
  const currentStepId = provisioning?.currentStep || 'STEP_VALIDATE';
  const currentStepIndex = PIPELINE_STEPS.findIndex((s) => s.id === currentStepId);
  const activeIndex = isReady
    ? PIPELINE_STEPS.length
    : !hasStarted
    ? -1
    : currentStepIndex >= 0
    ? currentStepIndex
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[150px] transition-all duration-1000 ${
            isReady
              ? 'bg-emerald-600/15'
              : isFailed
              ? 'bg-rose-600/15'
              : 'bg-purple-600/15'
          }`}
        />
      </div>

      {/* Top Navbar */}
      <nav className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            onClick={() => router.push('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Ahnajak SaaS <span className="text-purple-400 font-semibold">Control Plane</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isReady
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : isFailed
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
              }`}
            >
              {isReady && <CheckCircle2 className="w-3.5 h-3.5" />}
              {isFailed && <XCircle className="w-3.5 h-3.5" />}
              {isProvisioning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {site?.status || 'PROVISIONING'}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {site?.name || 'Topup Store'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-xs">
                /{site?.slug}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Order ID: <span className="font-mono text-slate-300">{orderId}</span> • Owner: <span className="text-slate-300">{data?.customer?.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <span className="text-slate-500 block">Target Ingress Route</span>
              <span className="font-mono text-purple-300 font-semibold">{site?.publicUrl || `http://localhost/${site?.slug}`}</span>
            </div>
          </div>
        </div>

        {/* Success Banner (Celebration State) */}
        {isReady && (
          <div className="mb-8 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-emerald-950/60 p-6 sm:p-8 backdrop-blur shadow-2xl shadow-emerald-950/30 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    🎉 Your Topup Store is Live & Ready!
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-300/80 mt-1">
                    Auto-provisioning completed successfully. Container, isolated database, and reverse proxy routing are active.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <a
                  href={site?.publicUrl || `http://localhost/${site?.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
                >
                  Visit Storefront
                  <ExternalLink className="w-4 h-4" />
                </a>

                <a
                  href={site?.adminUrl || `http://localhost/${site?.slug}/admin`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition"
                >
                  Store Admin Login
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* One-Time Admin Credentials Card */}
            <div className="mt-6 pt-6 border-t border-emerald-500/20 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <span className="text-slate-400 block font-medium mb-1">Store Administrator Email</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-white font-semibold">
                    {provisioning?.adminCredentials?.email || data?.customer?.email}
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
                        provisioning?.adminCredentials?.email || data?.customer?.email || '',
                        'admin-email'
                      )
                    }
                    className="p-1 rounded text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'admin-email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <span className="text-slate-400 block font-medium mb-1">Generated Initial Password</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-emerald-300 font-semibold">
                    {showPassword
                      ? provisioning?.adminCredentials?.password || '••••••••••••'
                      : '••••••••••••'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    {provisioning?.adminCredentials?.password && (
                      <button
                        onClick={() =>
                          handleCopy(provisioning.adminCredentials!.password!, 'admin-pass')
                        }
                        className="p-1 rounded text-slate-400 hover:text-white"
                      >
                        {copiedKey === 'admin-pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Awaiting Payment / Provisioning Pending State */}
        {isAwaitingPayment && (
          <div className="mb-8 rounded-2xl border border-amber-500/40 bg-amber-950/30 p-6 backdrop-blur shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Payment & Provisioning Pending</h3>
                  <p className="text-xs text-amber-300/80 mt-1">
                    Order is awaiting payment confirmation to trigger automatic database and container provisioning.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-600/30 flex items-center gap-2 transition disabled:opacity-50"
              >
                {isRetrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Launch Provisioning Now
              </button>
            </div>
          </div>
        )}

        {/* Failure Alert State */}
        {isFailed && (
          <div className="mb-8 rounded-2xl border border-rose-500/40 bg-rose-950/30 p-6 backdrop-blur shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Provisioning Pipeline Failed</h3>
                  <p className="text-xs text-rose-300/80 mt-1">
                    {provisioning?.errorMessage || 'An error occurred during container deployment or health checks.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition disabled:opacity-50"
              >
                {isRetrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                Retry Provisioning
              </button>
            </div>
          </div>
        )}

        {/* 2-Column Dashboard: Visual Step Tracker (Left) & Terminal Window (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Visual Step Tracker (Left 5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                Pipeline Step Progress
              </h3>

              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
                {PIPELINE_STEPS.map((step, idx) => {
                  const isCompleted = isReady || idx < activeIndex;
                  const isCurrent = !isReady && !isFailed && idx === activeIndex;
                  const isStepFailed = isFailed && idx === activeIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.id} className="relative flex items-start gap-4">
                      {/* Step Indicator Dot */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border z-10 transition-all duration-300 ${
                          isCompleted
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/30'
                            : isCurrent
                            ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/40 ring-4 ring-purple-500/20 animate-pulse'
                            : isStepFailed
                            ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/30'
                            : 'bg-slate-950 text-slate-600 border-slate-800'
                        }`}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        {isCurrent && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {isStepFailed && <XCircle className="w-3.5 h-3.5" />}
                        {!isCompleted && !isCurrent && !isStepFailed && (
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        )}
                      </div>

                      {/* Step Text Details */}
                      <div className="pt-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold transition ${
                              isCompleted
                                ? 'text-emerald-400'
                                : isCurrent
                                ? 'text-purple-300'
                                : isStepFailed
                                ? 'text-rose-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {step.label}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[10px] font-semibold animate-pulse">
                              In Progress
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Real-time Streaming Terminal (Right 7 Cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden font-mono text-xs">
              {/* Terminal Window Header */}
              <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-slate-400 text-[11px] flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    provision.worker.ts — Live Logs
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isProvisioning && (
                    <span className="flex items-center gap-1 text-[10px] text-purple-400 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                      Live Stream
                    </span>
                  )}
                  <button
                    onClick={() => {
                      const allLogs = provisioning?.logs
                        ?.map((l) => `[${l.createdAt}] [${l.level}] ${l.message}`)
                        .join('\n');
                      handleCopy(allLogs || '', 'all-logs');
                    }}
                    className="p-1 rounded text-slate-400 hover:text-white"
                    title="Copy Logs"
                  >
                    {copiedKey === 'all-logs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Log Output Console */}
              <div
                ref={logContainerRef}
                className="p-4 h-[420px] overflow-y-auto space-y-2.5 bg-slate-950 text-slate-300 select-text leading-relaxed"
              >
                <div className="text-slate-600 text-[11px] border-b border-slate-900 pb-2">
                  [SaaS Provisioner v1.0.0 initialized • Listening on BullMQ queue: provisioning-queue]
                </div>

                {provisioning?.logs && provisioning.logs.length > 0 ? (
                  provisioning.logs.map((log) => {
                    const isError = log.level === 'ERROR';
                    const isWarn = log.level === 'WARN';
                    return (
                      <div key={log.id} className="flex items-start gap-2.5">
                        <span className="text-slate-600 text-[10px] shrink-0 pt-0.5">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                        <span
                          className={`px-1 rounded text-[10px] font-bold shrink-0 ${
                            isError
                              ? 'bg-rose-500/20 text-rose-400'
                              : isWarn
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-cyan-500/10 text-cyan-400'
                          }`}
                        >
                          {log.step || log.level}
                        </span>
                        <span
                          className={`break-all ${
                            isError
                              ? 'text-rose-300 font-medium'
                              : isWarn
                              ? 'text-amber-300'
                              : 'text-slate-300'
                          }`}
                        >
                          {log.message}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-slate-500 italic text-center py-12">
                    Waiting for worker pipeline to emit execution logs...
                  </div>
                )}

                {isProvisioning && (
                  <div className="flex items-center gap-2 text-purple-400 pt-2 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-[11px]">Processing step: {currentStepId}...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
