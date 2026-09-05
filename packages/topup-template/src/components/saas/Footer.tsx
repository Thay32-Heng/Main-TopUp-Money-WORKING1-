import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Send, ShieldCheck, Heart, Sparkles, Gamepad2, ArrowUpRight } from 'lucide-react';

export default function SaaSFooter() {
  return (
    <footer className="bg-[#07070b] border-t border-white/10 pt-16 pb-12 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
        {/* Brand Description */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Box className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold tracking-tight text-xl text-white">
              Ahnajak <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">SaaS</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
              v2.0
            </span>
          </Link>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            The next-generation serverless multi-tenant game top-up platform on Cloudflare Edge. Instant D1 database provisioning, zero-fee Bakong KHQR checkout, and G2Bulk automated fulfillment.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Cloudflare Edge Network: All 300+ PoPs Operational</span>
          </div>
        </div>

        {/* Column 1: Platform */}
        <div className="space-y-3 text-sm">
          <div className="font-bold text-white uppercase tracking-wider text-xs">Platform</div>
          <ul className="space-y-2 text-slate-400">
            <li>
              <Link to="/store" className="hover:text-purple-300 transition-colors flex items-center gap-1">
                <span>🎮 Live Demo Store</span>
              </Link>
            </li>
            <li>
              <a href="#sandbox" className="hover:text-purple-300 transition-colors">
                Store Creator Sandbox
              </a>
            </li>
            <li>
              <a href="#features" className="hover:text-purple-300 transition-colors">
                Edge D1 Database
              </a>
            </li>
            <li>
              <a href="#architecture" className="hover:text-purple-300 transition-colors">
                Live Transaction Stream
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-purple-300 transition-colors">
                Pricing Plans
              </a>
            </li>
          </ul>
        </div>

        {/* Column 2: Solutions */}
        <div className="space-y-3 text-sm">
          <div className="font-bold text-white uppercase tracking-wider text-xs">Solutions</div>
          <ul className="space-y-2 text-slate-400">
            <li>
              <Link to="/topup/mobile-legends" className="hover:text-purple-300 transition-colors">
                Mobile Legends Topup
              </Link>
            </li>
            <li>
              <Link to="/topup/pubg-mobile" className="hover:text-purple-300 transition-colors">
                PUBG Mobile UC
              </Link>
            </li>
            <li>
              <Link to="/topup/free-fire" className="hover:text-purple-300 transition-colors">
                Free Fire Diamonds
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-purple-300 transition-colors">
                Merchant Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-purple-300 transition-colors">
                SuperAdmin Center
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Connect & Community */}
        <div className="space-y-3 text-sm">
          <div className="font-bold text-white uppercase tracking-wider text-xs">Community & Help</div>
          <ul className="space-y-2 text-slate-400">
            <li>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-purple-300 transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                <span>Telegram Support</span>
                <ArrowUpRight className="w-3 h-3 text-slate-500" />
              </a>
            </li>
            <li>
              <Link to="/auth" className="hover:text-purple-300 transition-colors">
                Merchant Sign In
              </Link>
            </li>
            <li>
              <a href="#faq" className="hover:text-purple-300 transition-colors">
                FAQ & Knowledgebase
              </a>
            </li>
            <li>
              <span className="text-slate-500 text-xs">Bakong KHQR 0% Gateway</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="max-w-7xl mx-auto mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          © {new Date().getFullYear()} Ahnajak SaaS Platform. Powered by Cloudflare Pages & D1.
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          <span>•</span>
          <span className="hover:text-slate-400 cursor-pointer">Security Audited</span>
        </div>
      </div>
    </footer>
  );
}
