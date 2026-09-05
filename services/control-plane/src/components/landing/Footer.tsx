'use client';
import { Box, Github, Twitter, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0f] pt-20 pb-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center">
                <Box className="w-3 h-3 text-white" />
              </div>
              <span className="font-extrabold tracking-tight text-lg text-white">Ahnajak</span>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              The fastest way to launch and scale automated game top-up stores in Southeast Asia.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-white uppercase tracking-wider text-xs">Product</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Changelog</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white uppercase tracking-wider text-xs">Resources</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">System Status</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-500">
            &copy; 2026 Ahnajak Systems. All rights reserved.
          </div>
          
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            System Status: 🟢 All Systems Operational
          </div>

          <div className="flex gap-4 text-slate-400">
            <a href="#" className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><Github className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><MessageCircle className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
