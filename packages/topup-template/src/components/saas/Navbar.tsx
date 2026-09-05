import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, ChevronRight, Gamepad2, LayoutDashboard, Shield, Menu, X, Sparkles } from 'lucide-react';

export default function SaaSNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/10 py-3 shadow-2xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
            <Box className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-xl text-white group-hover:text-purple-300 transition-colors">
              Ahnajak <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">SaaS</span>
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider ml-1">
            v2.0
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-7 text-sm font-medium">
          <a href="#features" className="text-slate-300 hover:text-white transition-colors">
            Features
          </a>
          <a href="#architecture" className="text-slate-300 hover:text-white transition-colors">
            Architecture
          </a>
          <a href="#sandbox" className="text-slate-300 hover:text-white transition-colors">
            Store Creator
          </a>
          <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">
            Pricing
          </a>
          <a href="#faq" className="text-slate-300 hover:text-white transition-colors">
            FAQ
          </a>
          <div className="h-4 w-px bg-white/10" />
          <Link
            to="/store"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all font-semibold"
          >
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <span>🎮 Demo Store</span>
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-slate-300 hover:text-purple-300 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-purple-400" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin"
            className="flex items-center gap-1.5 text-slate-300 hover:text-purple-300 transition-colors"
          >
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Admin</span>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/auth"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2"
          >
            Sign In
          </Link>
          <Link
            to="/checkout"
            className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Launch Store</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="lg:hidden flex items-center gap-3">
          <Link
            to="/store"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Store</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/store"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-2 text-cyan-300 text-sm font-bold"
            >
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
              <span>🎮 Live Store Demo</span>
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-2 text-purple-300 text-sm font-bold"
            >
              <LayoutDashboard className="w-4 h-4 text-purple-400" />
              <span>Dashboard</span>
            </Link>
          </div>
          <div className="flex flex-col space-y-3 pt-2 text-sm font-medium border-t border-white/5">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white py-1"
            >
              Features
            </a>
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white py-1"
            >
              Architecture
            </a>
            <a
              href="#sandbox"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white py-1"
            >
              Interactive Store Creator
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white py-1"
            >
              Pricing Plans
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white py-1"
            >
              FAQ
            </a>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white py-1"
            >
              Admin Portal
            </Link>
          </div>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              to="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg border border-white/10 text-white font-medium text-sm"
            >
              Sign In
            </Link>
            <a
              href="#sandbox"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm"
            >
              ⚡ Launch Your Store
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
