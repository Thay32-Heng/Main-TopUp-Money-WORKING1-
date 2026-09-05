'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Box, LogIn, ChevronRight } from 'lucide-react';
import Hero from '@/components/landing/Hero';
import FeatureGrid from '@/components/landing/FeatureGrid';
import PricingTab from '@/components/landing/PricingTab';
import FAQSection from '@/components/landing/FAQSection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 font-sans selection:bg-purple-500/30">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Box className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Ahnajak
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300 ml-2 uppercase tracking-wider">Beta</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="text-slate-400 hover:text-white transition-colors">FAQ</a>
            <a href="/docs" className="text-slate-400 hover:text-white transition-colors">Docs</a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/login"
              className="group flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-sm font-meidum px-5 py-2.5 rounded-full transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              Get Started <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <Hero />
        <FeatureGrid />
        
        {/* CTA Interstitial */}
        <section className="py-24 px-6 border-y border-white/5 bg-gradient-to-b from-[#0a0a0f] to-purple-900/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">
              Stop fighting generic e-commerce platforms.
            </h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Ahnajak is purpose-built for game top-up stores. Setup takes minutes, not weeks.
            </p>
            <Link 
              href="/login"
              className="inline-flex items-center gap-2 bg-white text-black text-base font-bold px-8 py-4 rounded-full transition-transform hover:scale-105"
            >
              Launch Your Store Now
            </Link>
          </div>
        </section>

        <PricingTab />
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
}
