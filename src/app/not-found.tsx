'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Home, Compass, ArrowLeft, Ghost, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TornPaperBackground = dynamic(() => import('@/components/TornPaperBackground'), {
  ssr: false,
});

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0b0b0e] text-neutral-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-amber-400 selection:text-black">
      {/* Torn Paper Ambient Background */}
      <TornPaperBackground />

      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-gradient-to-tr from-amber-500/10 via-yellow-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      <main className="w-full max-w-lg mx-auto text-center space-y-6 relative z-10 px-4">
        
        {/* Floating Animated Badge & Crown */}
        <div className="relative inline-block mx-auto mb-2">
          {/* Outer Pulse Ring */}
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 opacity-25 blur-lg animate-pulse" />
          
          {/* Floating Ghost Icon Card */}
          <div className="relative p-5 rounded-3xl bg-[#141419]/90 border border-amber-500/40 shadow-2xl backdrop-blur-xl animate-bounce duration-1000">
            <Ghost className="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
            <Crown className="w-5 h-5 text-yellow-300 absolute -top-2.5 -right-2.5 -rotate-12 animate-pulse" />
          </div>
        </div>

        {/* 404 Glitch & Gradient Number */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-black tracking-widest uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Mystery Lost in the Void</span>
          </div>

          <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-500/40 font-serif drop-shadow-2xl">
            404
          </h1>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-serif">
            Page Vanished Without a Trace
          </h2>
          
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed pt-1">
            The secret scroll or user profile you are searching for might have expired, moved, or never existed in this realm.
          </p>
        </div>

        {/* Interactive Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/" className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold px-6 py-5 rounded-xl shadow-xl shadow-amber-500/10 border-0 text-sm transition hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Button>
          </Link>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-[#141419]/80 hover:bg-[#1f1f28] border-neutral-800 hover:border-amber-500/40 text-neutral-200 hover:text-white font-bold px-6 py-5 rounded-xl text-sm transition hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Open Dashboard</span>
            </Button>
          </Link>
        </div>

        {/* Footer Whisper */}
        <div className="pt-6 border-t border-neutral-800/60">
          <p className="text-[11px] text-neutral-500 font-semibold tracking-wide">
            Tip: Double check the username or link URL.
          </p>
        </div>

      </main>
    </div>
  );
}
