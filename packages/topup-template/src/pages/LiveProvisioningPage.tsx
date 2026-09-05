import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Box
} from 'lucide-react';
import SaaSNavbar from '../components/saas/Navbar';
import SaaSFooter from '../components/saas/Footer';

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
    label: 'Database Scope & Schema',
    description: 'Cloudflare D1 isolated SQLite tenant scope creation',
    icon: Database,
  },
  {
    id: 'STEP_MIGRATE_AND_SEED',
    label: 'Catalog & Admin Seeding',
    description: 'Applying tables, games catalog, and admin credentials',
    icon: ShieldCheck,
  },
  {
    id: 'STEP_DOCKER_DEPLOY',
    label: 'Edge Worker Runtime',
    description: 'Deploying serverless distribution tag v2.4-edge',
    icon: Server,
  },
  {
    id: 'STEP_ROUTING',
    label: 'Dynamic Route Ingress',
    description: 'Configuring edge dynamic reverse proxy & API bindings',
    icon: Globe,
  },
  {
    id: 'STEP_HEALTH_CHECK',
    label: 'Readiness & Health Probe',
    description: 'Live HTTP edge probe polling for 200 OK status',
    icon: Activity,
  },
];

export default function LiveProvisioningPage() {
  const params = useParams();
  const navigate = useNavigate();
  const orderId = params.orderId || params.jobId || '';

  const [data, setData] = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const logContainerRef = useRef<HTMLDivElement>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        // Fallback to direct job endpoint
        const jobRes = await fetch(`/api/provision/${orderId}`);
        if (jobRes.ok) {
          const jobJson = await jobRes.json();
          setData({
            order: { id: orderId, status: 'PAID', total: 0, currency: 'USD', createdAt: new Date().toISOString() },
            customer: { id: '', email: jobJson.site?.adminEmail || '', name: 'Merchant Admin' },
            site: jobJson.site,
            provisioning: {
              jobId: jobJson.job.id,
              status: jobJson.job.status,
              currentStep: jobJson.job.currentStep,
              retryCount: 0,
              logs: jobJson.logs,
              adminCredentials: {
                email: jobJson.site?.adminEmail || '',
                password: jobJson.site?.adminInitialPassword || '',
              }
            }
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch provisioning status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2500);
    return () => clearInterval(interval);
  }, [orderId]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [data?.provisioning?.logs]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRetry = async () => {
    if (!data?.provisioning?.jobId) return;
    setIsRetrying(true);
    try {
      await fetch(`/api/provision/${data.provisioning.jobId}/retry`, { method: 'POST' });
      await fetchStatus();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  const isCompleted = data?.provisioning?.status === 'READY' || data?.site?.status === 'READY';
  const isFailed = data?.provisioning?.status === 'FAILED' || data?.site?.status === 'FAILED';

  const getStepStatus = (stepId: string) => {
    if (isCompleted) return 'complete';
    if (isFailed && data?.provisioning?.currentStep === stepId) return 'failed';

    const stepOrder = PIPELINE_STEPS.map((s) => s.id);
    const currentIndex = stepOrder.indexOf(data?.provisioning?.currentStep || '');
    const thisIndex = stepOrder.indexOf(stepId);

    if (thisIndex < currentIndex) return 'complete';
    if (thisIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-[#07070c] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      <SaaSNavbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Header Status Bar */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0e18] border border-white/10 shadow-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {data?.site?.name || 'Provisioning Store Infrastructure'}
              </h1>
              {isCompleted && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Live & Ready
                </span>
              )}
              {isFailed && (
                <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  Failed
                </span>
              )}
              {!isCompleted && !isFailed && (
                <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Provisioning
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Order ID: <span className="text-purple-300">{orderId}</span> • Target: <span className="text-cyan-300">topuppanel.pages.dev/{data?.site?.slug || 'store'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isFailed && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>Retry Pipeline</span>
              </button>
            )}
            {isCompleted && (
              <div className="flex items-center gap-3">
                <Link
                  to="/store"
                  className="px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 font-bold text-xs flex items-center gap-2 transition-all"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Open Storefront</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <Link
                  to="/admin"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Control Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Two Columns: Pipeline Steps & Logs/Credentials */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Visual Pipeline Tracker */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[#0e0e18] border border-white/10 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span>Provisioning Pipeline</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">5 Stages</span>
              </div>

              <div className="space-y-4">
                {PIPELINE_STEPS.map((step, idx) => {
                  const status = getStepStatus(step.id);
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                        status === 'complete'
                          ? 'bg-emerald-500/[0.03] border-emerald-500/20'
                          : status === 'active'
                          ? 'bg-purple-600/10 border-purple-500 shadow-md shadow-purple-500/10'
                          : status === 'failed'
                          ? 'bg-red-500/10 border-red-500/40'
                          : 'bg-white/[0.01] border-white/5 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          status === 'complete'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : status === 'active'
                            ? 'bg-purple-500 text-white'
                            : status === 'failed'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-white/5 text-slate-500'
                        }`}
                      >
                        {status === 'complete' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : status === 'active' ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : status === 'failed' ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white truncate">{step.label}</h4>
                          <span
                            className={`text-[10px] font-mono font-bold uppercase ${
                              status === 'complete'
                                ? 'text-emerald-400'
                                : status === 'active'
                                ? 'text-purple-300 animate-pulse'
                                : status === 'failed'
                                ? 'text-red-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* One-Time Admin Credentials Box */}
            {isCompleted && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-[#0e0e18] border border-purple-500/30 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                    <Lock className="w-4 h-4 text-purple-400" />
                    <span>One-Time Administrator Credentials</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 font-mono font-bold">
                    STORE OWNER
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Admin Email</div>
                      <div className="text-white font-mono font-bold mt-0.5">
                        {data?.provisioning?.adminCredentials?.email || data?.customer?.email || 'admin@store.com'}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleCopy(
                          data?.provisioning?.adminCredentials?.email || data?.customer?.email || '',
                          'email'
                        )
                      }
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedKey === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-3 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between">
                    <div className="flex-1 mr-2">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Initial Password</div>
                      <div className="text-white font-mono font-bold mt-0.5">
                        {showPassword
                          ? data?.provisioning?.adminCredentials?.password || 'Ahnajak_Admin2026!'
                          : '••••••••••••••••'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            data?.provisioning?.adminCredentials?.password || 'Ahnajak_Admin2026!',
                            'pwd'
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedKey === 'pwd' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-purple-300/80 leading-relaxed">
                  Save these credentials securely. You can update your password at any time from the store admin settings panel.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Terminal Log Stream */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="rounded-2xl bg-[#090910] border border-white/10 shadow-2xl flex flex-col flex-1 overflow-hidden min-h-[500px]">
              {/* Terminal Titlebar */}
              <div className="px-4 py-3 bg-[#11111d] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 ml-2 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    edge-provisioning-stream.log
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>D1 Worker Engine</span>
                </div>
              </div>

              {/* Terminal Body */}
              <div
                ref={logContainerRef}
                className="flex-1 p-4 sm:p-6 font-mono text-xs overflow-y-auto space-y-2.5 leading-relaxed"
                style={{ maxHeight: '550px' }}
              >
                <div className="text-slate-500 pb-2 border-b border-white/5">
                  [SYSTEM] Initializing Cloudflare Pages Edge worker runtime...
                </div>

                {data?.provisioning?.logs && data.provisioning.logs.length > 0 ? (
                  data.provisioning.logs.map((log) => {
                    const isError = log.level === 'ERROR';
                    const isWarn = log.level === 'WARN';

                    return (
                      <div
                        key={log.id}
                        className={`flex items-start gap-2.5 transition-opacity ${
                          isError ? 'text-red-400' : isWarn ? 'text-yellow-400' : 'text-slate-300'
                        }`}
                      >
                        <span className="text-slate-600 shrink-0 select-none">
                          {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : '00:00:00'}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded shrink-0 font-bold ${
                            isError
                              ? 'bg-red-500/20 text-red-300'
                              : isWarn
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-white/10 text-purple-300'
                          }`}
                        >
                          {log.step}
                        </span>
                        <span className="flex-1 break-words">{log.message}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center gap-2 text-slate-500 italic py-8 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span>Waiting for edge worker stream output...</span>
                  </div>
                )}

                {isCompleted && (
                  <div className="pt-4 border-t border-white/10 text-emerald-400 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ Storefront successfully provisioned and live on Cloudflare Edge!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <SaaSFooter />
    </div>
  );
}
