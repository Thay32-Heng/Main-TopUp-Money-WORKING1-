'use client';

import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Server,
  Database,
  Globe,
  Activity,
  CheckCircle2,
  XCircle,
  Loader2,
  DollarSign,
  Users,
  Shield,
  Trash2,
  RotateCcw,
  ExternalLink,
  Layers,
  Terminal,
  RefreshCw,
  Search,
} from 'lucide-react';

interface MetricData {
  totalSites: number;
  activeSites: number;
  provisioningSites: number;
  failedSites: number;
  totalRevenue: string;
  totalJobs: number;
  successfulJobs: number;
  successRate: number;
}

interface TenantSite {
  id: string;
  name: string;
  slug: string;
  status: 'PENDING' | 'PROVISIONING' | 'READY' | 'FAILED' | 'SUSPENDED';
  internalPort?: number;
  databaseName?: string;
  customer: {
    name?: string;
    email: string;
  };
  product?: {
    name: string;
    slug?: string;
  };
  domains: Array<{ hostname: string; isPrimary: boolean }>;
  latestJob?: {
    id: string;
    status: string;
    currentStep: string;
  };
  createdAt: string;
}

export default function MasterAdminDashboard() {
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [sites, setSites] = useState<TenantSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [metricsRes, sitesRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/sites'),
      ]);

      if (metricsRes.ok) {
        const m = await metricsRes.json();
        setMetrics(m.metrics);
      }

      if (sitesRes.ok) {
        const s = await sitesRes.json();
        setSites(s.sites || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm(`Are you sure you want to stop and delete site "${slug}"?`)) return;

    setActionLoading(slug);
    try {
      const res = await fetch(`/api/sites/${slug}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSites = sites.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/25">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-white">Ahnajak Master Control</span>
              <span className="text-xs text-purple-400 font-mono ml-2">SaaS Orchestrator</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <a
              href="/checkout"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition"
            >
              + Provision New Tenant
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Active Stores</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{metrics?.activeSites ?? 0}</span>
              <span className="text-xs text-slate-500">/ {metrics?.totalSites ?? 0} total</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Monthly Revenue</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">${metrics?.totalRevenue ?? '0.00'}</span>
              <span className="text-xs text-emerald-400 font-medium">USD</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Pipeline Success Rate</span>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{metrics?.successRate ?? 100}%</span>
              <span className="text-xs text-slate-500">{metrics?.successfulJobs ?? 0} jobs</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">In Provisioning</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{metrics?.provisioningSites ?? 0}</span>
              <span className="text-xs text-slate-500">active jobs</span>
            </div>
          </div>
        </div>

        {/* Tenant Table Section */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Managed Tenant Instances</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Isolated PostgreSQL databases, Docker containers, and Traefik reverse proxy routes
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tenants..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-xs text-white placeholder-slate-600 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Store / Customer</th>
                  <th className="px-5 py-3 font-semibold">Routing & URL</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Database</th>
                  <th className="px-5 py-3 font-semibold">Port</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-purple-400" />
                      <span className="block mt-2 text-xs">Loading tenant instances...</span>
                    </td>
                  </tr>
                ) : filteredSites.length > 0 ? (
                  filteredSites.map((s) => {
                    const isReady = s.status === 'READY';
                    const isFailed = s.status === 'FAILED';
                    const isProvisioning = s.status === 'PROVISIONING';

                    return (
                      <tr key={s.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-5 py-4">
                          <div className="font-bold text-white text-sm">{s.name}</div>
                          <div className="text-[11px] text-slate-400">{s.customer.email}</div>
                        </td>

                        <td className="px-5 py-4">
                          <a
                            href={`/${s.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 font-mono inline-flex items-center gap-1.5"
                          >
                            /{s.slug}
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </a>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              isReady
                                ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
                                : isFailed
                                ? 'bg-red-950/60 border-red-500/30 text-red-400'
                                : 'bg-purple-950/60 border-purple-500/30 text-purple-400 animate-pulse'
                            }`}
                          >
                            {isReady && <CheckCircle2 className="w-3 h-3" />}
                            {isFailed && <XCircle className="w-3 h-3" />}
                            {isProvisioning && <Loader2 className="w-3 h-3 animate-spin" />}
                            {s.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-mono text-slate-400 text-[11px]">
                          {s.databaseName || `tenant_${s.slug}`}
                        </td>

                        <td className="px-5 py-4 font-mono text-slate-400 text-[11px]">
                          {s.internalPort ? `:${s.internalPort}` : '—'}
                        </td>

                        <td className="px-5 py-4 text-right space-x-2">
                          {s.latestJob && (
                            <a
                              href={`/provisioning/${s.latestJob.id}`}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] inline-flex items-center gap-1"
                            >
                              <Terminal className="w-3 h-3 text-purple-400" />
                              Logs
                            </a>
                          )}

                          <button
                            onClick={() => handleDelete(s.slug)}
                            disabled={actionLoading === s.slug}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 text-[11px] inline-flex items-center transition disabled:opacity-50"
                            title="Delete Container & Site"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                      No tenant stores deployed yet. Click &quot;Provision New Tenant&quot; to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
