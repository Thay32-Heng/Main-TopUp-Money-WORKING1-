'use client';
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Box, Play, UserCircle } from 'lucide-react';

export default function Navbar() {
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 50], [0, 0.7]);
  const borderOpacity = useTransform(scrollY, [0, 50], [0, 0.1]);
  const blur = useTransform(scrollY, [0, 50], [0, 16]);
  
  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center px-6"
      style={{
        backgroundColor: useTransform(bgOpacity, v => `rgba(10, 10, 15, ${v})`),
        borderBottom: useTransform(borderOpacity, v => `1px solid rgba(255, 255, 255, ${v})`),
        backdropFilter: useTransform(blur, v => `blur(${v}px)`),
        WebkitBackdropFilter: useTransform(blur, v => `blur(${v}px)`),
      }}
    >
      <div className="flex-1 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
          <Box className="w-4 h-4 text-white" />
        </div>
        <span className="font-extrabold tracking-tight text-xl text-white">Ahnajak</span>
        <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest font-semibold text-gray-400">
          SaaS Control Plane
        </span>
      </div>

      <nav className="hidden md:flex flex-1 justify-center gap-8 text-sm font-medium text-gray-300">
        <a href="#features" className="hover:text-white transition-colors relative group">
          Features
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300" />
        </a>
        <a href="#pricing" className="hover:text-white transition-colors relative group">
          Pricing
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300" />
        </a>
        <a href="#docs" className="hover:text-white transition-colors relative group">
          Docs
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300" />
        </a>
      </nav>

      <div className="flex-1 flex justify-end items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          ⚡ 1,247 Stores Provisioned
        </div>
        <button className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white px-4 py-2 border border-white/10 rounded-full hover:bg-white/5 transition-all">
          <Play className="w-4 h-4" /> Demo
        </button>
        <button className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2 bg-purple-600 rounded-full hover:bg-purple-500 transition-all shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)]">
          <UserCircle className="w-4 h-4" /> Sign In
        </button>
      </div>
    </motion.header>
  );
}
