import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Plus,
  ArrowUpRight,
  TrendingUp,
  Settings,
  Bot
} from 'lucide-react';
import SaaSNavbar from '../components/saas/Navbar';
import SaaSFooter from '../components/saas/Footer';

interface MetricData {
  totalSites: number;
  activeSites: number;
  provisioningSites: number;
  failedSites: number;
  totalRevenue: string;
  totalJobs: number;
  successfulJobs: number;
  successRate: number;
  edgeEngine?: string;
}

interface TenantSite {
  id: string;
  name: string;
  slug: string;
  status: 'PENDING' | 'PROVISIONING' | 'READY' | 'FAILED' | 'SUSPENDED';
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

export default function MasterAdminPage() {
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
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm(`Are you sure you want to stop and delete tenant store "${slug}"?`)) return;

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
      (s.customer?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#07070c] text-slate-100 font-sans flex flex-col selection:bg-purple-500 selection:text-white">
      <SaaSNavbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>CLOUD CONTROL PLANE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Master SaaS Orchestrator
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Live multi-tenant fleet management across Cloudflare Pages & D1 edge nodes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Fleet</span>
            </button>
            <Link
              to="/checkout"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Provision New Store</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-8">
          <div className="p-6 rounded-2xl bg-[#0e0e18] border border-white/10 flex flex-col justify-between shadow-xl">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
              <span>Total Tenant Stores</span>
              <Globe className="w-4 h-4 text-purple-400" />
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-white font-mono">
                {metrics?.totalSites ?? sites.length}
              </div>
              <div className="text-xs text-emerald-400 flex items-center gap-1 font-semibold mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> {metrics?.activeSites ?? sites.length} Active in Production
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">100% Edge Isolated D1</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e0e18] border border-white/10 flex flex-col justify-between shadow-xl">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
              <span>Platform Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-white font-mono">
                {metrics?.totalRevenue || '$14,920.00'}
              </div>
              <div className="text-xs text-emerald-400 flex items-center gap-1 font-semibold mt-1">
                <TrendingUp className="w-3.5 h-3.5" /> Zero NBC transaction fee
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">Direct Bakong KHQR settlement</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e0e18] border border-white/10 flex flex-col justify-between shadow-xl">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
              <span>Provisioning Pipeline</span>
              <Server className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-white font-mono">
                {metrics?.successRate || 100}%
              </div>
              <div className="text-xs text-cyan-400 flex items-center gap-1 font-semibold mt-1">
                <Activity className="w-3.5 h-3.5" /> 7-stage automated pipeline
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">Avg time: 4.2s per tenant</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e0e18] border border-white/10 flex flex-col justify-between shadow-xl">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
              <span>Edge Performance</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-white font-mono">4ms</div>
              <div className="text-xs text-amber-400 flex items-center gap-1 font-semibold mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 300+ Edge Data Centers
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">Cloudflare Pages & D1 Global</div>
          </div>
        </div>

        {/* Tenant Stores Fleet Management Table */}
        <div className="bg-[#0e0e18] border border-white/10 rounded-2xl overflow-hidden shadow-2xl space-y-4">
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                <span>Active Tenant Stores</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage, inspect, and route traffic to tenant store instances
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search store name, slug, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#161624] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-xs focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/[0.02] border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-mono">
                <tr>
                  <th className="px-6 py-3.5">Store & Domain</th>
                  <th className="px-6 py-3.5">Owner / Admin</th>
                  <th className="px-6 py-3.5">D1 Database Scope</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Created</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSites.length > 0 ? (
                  filteredSites.map((site) => {
                    const isDeleting = actionLoading === site.slug;
                    return (
                      <tr key={site.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white text-sm">{site.name}</div>
                          <div className="text-purple-300 font-mono text-[11px] mt-0.5 flex items-center gap-1">
                            <span>topuppanel.pages.dev/{site.slug}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono">
                          <div className="text-white">{site.customer?.name || 'Admin'}</div>
                          <div className="text-slate-400 text-[11px]">{site.customer?.email || 'admin@store.com'}</div>
                        </td>

                        <td className="px-6 py-4 font-mono text-[11px] text-cyan-300">
                          {site.databaseName || `d1_${site.slug.replace(/-/g, '_')}`}
                        </td>

                        <td className="px-6 py-4">
                          {site.status === 'READY' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[11px] font-bold border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              READY
                            </span>
                          )}
                          {site.status === 'PROVISIONING' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 font-mono text-[11px] font-bold border border-purple-500/20">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              PROVISIONING
                            </span>
                          )}
                          {site.status === 'FAILED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 font-mono text-[11px] font-bold border border-red-500/20">
                              <XCircle className="w-3 h-3" />
                              FAILED
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-slate-400 text-[11px]">
                          {site.createdAt ? new Date(site.createdAt).toLocaleDateString() : 'Today'}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              to="/store"
                              className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                              title="Open Customer Storefront"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              to="/admin"
                              className="p-2 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors"
                              title="Open Store Admin"
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(site.slug)}
                              disabled={isDeleting}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50"
                              title="Delete Tenant Store"
                            >
                              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <Gamepad2 className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                      <div>No tenant stores found matching "{searchTerm}"</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <SaaSFooter />
    </div>
  );
}
