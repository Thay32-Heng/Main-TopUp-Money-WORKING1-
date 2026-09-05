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
  Boxes,
} from 'lucide-react';

interface ProvisionLog {
  id: string;
  step: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  timestamp: string;
}

interface SiteData {
  id: string;
  name: string;
  slug: string;
  status: 'PENDING' | 'PROVISIONING' | 'READY' | 'FAILED' | 'SUSPENDED';
  internalPort?: number;
  customer?: {
    name?: string;
    email: string;
  };
  domains?: Array<{ hostname: string; isPrimary: boolean }>;
}

interface ProvisionData {
  id: string;
  siteId: string;
  status: 'QUEUED' | 'PROVISIONING' | 'READY' | 'FAILED';
  currentStep?: string;
  errorMessage?: string;
  logs: ProvisionLog[];
}

const STEPS = [
  { id: 'STEP_VALIDATE', label: 'Order & Customer Validation', icon: ShieldCheck },
  { id: 'STEP_DATABASE', label: 'Isolated Database Provisioning', icon: Database },
  { id: 'STEP_MIGRATE_AND_SEED', label: 'Schema Migration & Admin Seeding', icon: Server },
  { id: 'STEP_DOCKER_DEPLOY', label: 'Container Instance Deployment', icon: Boxes },
  { id: 'STEP_ROUTING', label: 'Traefik Dynamic Routing Setup', icon: Globe },
  { id: 'STEP_HEALTH_CHECK', label: 'Healthz Readiness Probes', icon: Activity },
  { id: 'STEP_FINALIZE', label: 'Storefront Online & Ready', icon: Sparkles },
];

export default function LiveProvisioningPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.jobId as string;

  const [site, setSite] = useState<SiteData | null>(null);
  const [provisioning, setProvisioning] = useState<ProvisionData | null>(null);
  const [logs, setLogs] = useState<ProvisionLog[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Polling Job Status
  useEffect(() => {
    if (!jobId) return;

    let isMounted = true;
    let timer: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/provision/${jobId}`);
        if (!res.ok) throw new Error('Failed to fetch status');
        const data = await res.json();

        if (isMounted && data.success) {
          setSite(data.site);
          setProvisioning(data.provisioning);
          setLogs(data.provisioning.logs || []);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    fetchStatus();

    timer = setInterval(() => {
      fetchStatus();
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [jobId]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRetry = async () => {
    if (!jobId) return;
    setIsRetrying(true);
    try {
      const res = await fetch(`/api/provision/${jobId}/retry`, {
        method: 'POST',
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  const isReady = site?.status === 'READY' || provisioning?.status === 'READY';
  const isFailed = site?.status === 'FAILED' || provisioning?.status === 'FAILED';
  const isProvisioning = !isReady && !isFailed;

  const currentStepId = provisioning?.currentStep || 'STEP_VALIDATE';
  const activeIndex = STEPS.findIndex((s) => s.id === currentStepId);

  // Derive tenant store URL
  const publicStoreUrl = site?.slug
    ? typeof window !== 'undefined'
      ? `${window.location.origin}/${site.slug}`
      : `/${site.slug}`
    : '#';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/25">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-white">Ahnajak SaaS</span>
              <span className="text-xs text-purple-400 font-mono ml-2">Job: #{jobId?.slice(0, 8)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                isReady
                  ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400'
                  : isFailed
                  ? 'bg-red-950/80 border-red-500/30 text-red-400'
                  : 'bg-purple-950/80 border-purple-500/30 text-purple-400'
              }`}
            >
              {isProvisioning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isReady && <CheckCircle2 className="w-3.5 h-3.5" />}
              {isFailed && <XCircle className="w-3.5 h-3.5" />}
              {isReady ? 'STORE READY' : isFailed ? 'PROVISIONING FAILED' : 'PROVISIONING IN PROGRESS'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Celebration / Success Card */}
        {isReady && (
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles className="w-48 h-48 text-emerald-400" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Store Provisioning Complete
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  🎉 Your TopUp Store &quot;{site?.name}&quot; Is Live!
                </h2>
                <p className="text-slate-300 text-sm">
                  Your isolated database, Docker container, and Traefik routing pipeline have been successfully deployed.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={publicStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition"
                >
                  Open Live Storefront
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={`${publicStoreUrl}/admin`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 flex items-center gap-2 transition"
                >
                  Store Admin Panel
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80">
              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/60">
                <span className="text-xs text-slate-400">Storefront URL</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-sm text-emerald-400 truncate max-w-[200px]">{publicStoreUrl}</span>
                  <button
                    onClick={() => copyToClipboard(publicStoreUrl, 'url')}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                  >
                    {copiedField === 'url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/60">
                <span className="text-xs text-slate-400">Admin Email</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-sm text-white truncate max-w-[200px]">{site?.customer?.email || 'admin@example.com'}</span>
                  <button
                    onClick={() => copyToClipboard(site?.customer?.email || '', 'email')}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                  >
                    {copiedField === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/60">
                <span className="text-xs text-slate-400">Default Password</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-sm text-white">{showPassword ? 'Admin@123456' : '••••••••••••'}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard('Admin@123456', 'password')}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                    >
                      {copiedField === 'password' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Failure Alert State */}
        {isFailed && (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Provisioning Pipeline Failed</h3>
                <p className="text-sm text-red-300/80 mt-1">
                  {provisioning?.errorMessage || 'An error occurred during container deployment or health checks.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs flex items-center gap-2 transition disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              Retry Pipeline
            </button>
          </div>
        )}

        {/* 2-Column Layout: Progress Steps & Terminal Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Step Progress Bar (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-400" />
                Pipeline Orchestration Steps
              </h3>
              <p className="text-xs text-slate-400 mt-1">Automated multi-stage container deployment sequence</p>
            </div>

            <div className="space-y-3">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = isReady || idx < activeIndex;
                const isCurrent = !isReady && !isFailed && idx === activeIndex;
                const isStepFailed = isFailed && idx === activeIndex;

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition ${
                      isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/20 text-slate-200'
                        : isCurrent
                        ? 'bg-purple-950/40 border-purple-500/40 text-white shadow-lg shadow-purple-500/10'
                        : isStepFailed
                        ? 'bg-red-950/30 border-red-500/30 text-red-200'
                        : 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60'
                    }`}
                  >
                    <div
                      className={`mt-0.5 p-2 rounded-lg ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : isCurrent
                          ? 'bg-purple-500/20 text-purple-400 animate-pulse'
                          : isStepFailed
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                      {isCurrent && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isStepFailed && <XCircle className="w-4 h-4" />}
                      {!isCompleted && !isCurrent && !isStepFailed && <Icon className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">{step.label}</span>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : isCurrent
                              ? 'bg-purple-500/20 text-purple-300 font-bold animate-pulse'
                              : isStepFailed
                              ? 'bg-red-500/20 text-red-400'
                              : 'text-slate-600'
                          }`}
                        >
                          {isCompleted ? 'Done' : isCurrent ? 'Running...' : isStepFailed ? 'Error' : 'Queued'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{step.id}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Live Terminal Log Console (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[580px]">
            {/* Terminal Header */}
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex items-center gap-1.5 ml-2 text-slate-400 text-xs font-mono">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  <span>provision-worker.log</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] text-slate-400 font-mono">Live Stream</span>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-4 bg-slate-950/95 font-mono text-xs overflow-y-auto space-y-2">
              <div className="text-slate-500 pb-2 border-b border-slate-900">
                [SYSTEM] Connected to BullMQ worker stream for job {jobId}
              </div>

              {logs.length > 0 ? (
                logs.map((log) => {
                  const isError = log.level === 'ERROR';
                  const isWarn = log.level === 'WARN';

                  return (
                    <div
                      key={log.id}
                      className={`flex items-start gap-2 leading-relaxed ${
                        isError
                          ? 'text-red-400 bg-red-950/20 p-1.5 rounded border border-red-500/20'
                          : isWarn
                          ? 'text-amber-300'
                          : 'text-slate-300'
                      }`}
                    >
                      <span className="text-slate-600 select-none text-[10px] shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                          isError
                            ? 'bg-red-500/20 text-red-400'
                            : isWarn
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-purple-950/60 text-purple-400 border border-purple-800/40'
                        }`}
                      >
                        {log.step}
                      </span>
                      <span className="break-all whitespace-pre-wrap">{log.message}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-500 italic text-center py-16">
                  Waiting for worker pipeline to emit execution logs...
                </div>
              )}

              {isProvisioning && (
                <div className="flex items-center gap-2 text-purple-400 pt-2 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-[11px]">Processing step: {currentStepId}...</span>
                </div>
              )}

              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
