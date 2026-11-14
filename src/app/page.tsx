'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import PaperTearScrollScene from '@/components/PaperTearScrollScene';
import { Crown, Lock, Shield, MessageSquare, ArrowRight, EyeOff, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sampleMessages = [
  {
    author: 'Anonymous #408',
    content: "Honestly, your work ethic inspires me every single day. Keep doing what you do!",
    time: '12m ago',
  },
  {
    author: 'Secret Friend',
    content: "I've been wanting to tell you this for a while — you have an incredible presence.",
    time: '2h ago',
  },
  {
    author: 'Unknown Teammate',
    content: "That problem you solved yesterday saved everyone hours of work. Respect!",
    time: '1d ago',
  },
];

export default function Home() {
  const pinSectionRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (!pinSectionRef.current) return;

    const st = ScrollTrigger.create({
      trigger: pinSectionRef.current,
      start: 'top top',
      end: '+=160%',
      scrub: 0.3,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });

    return () => {
      st.kill();
    };
  }, []);

  // Compute exact drop physics proportional to paper tear progress (0 to 1)
  // Each word has its exact window to drop smoothly as paper opens
  const getWordStyle = (dropStart: number, dropEnd: number) => {
    const rawT = (scrollProgress - dropStart) / (dropEnd - dropStart);
    const t = Math.min(1, Math.max(0, rawT));
    // Smooth easeOutCubic curve
    const easeT = 1 - Math.pow(1 - t, 3);
    const y = -50 * (1 - easeT);
    const opacity = easeT;
    const scale = 0.85 + 0.15 * easeT;

    return {
      transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
      opacity: opacity,
      transition: 'none',
    };
  };

  return (
    <div className="min-h-screen bg-[#070709] text-neutral-100 font-sans selection:bg-amber-400 selection:text-black relative overflow-x-hidden">
      {/* Constant Fixed Luxury Navbar */}
      <Navbar />

      {/* =========================================================================
          PINNED HERO SECTION: REALISTIC 3D PAPER TEAR SCROLL REVEAL (THREE.JS + GSAP)
          ========================================================================= */}
      <section
        ref={pinSectionRef}
        className="relative w-full h-screen overflow-hidden flex flex-col justify-center items-center"
      >
        {/* 3D Paper Tearing Canvas Overlay with Tearing Sound */}
        <PaperTearScrollScene containerRef={pinSectionRef} />

        {/* Website Content Revealed from Behind the Tearing Golden Paper */}
        <div className="relative z-0 max-w-4xl mx-auto px-4 md:px-12 text-center space-y-6 pt-12">
          
          {/* Royal Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#141418]/90 text-amber-300 border border-amber-500/30 shadow-2xl backdrop-blur-md">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>The Premier Anonymous Messaging Experience</span>
          </div>

          {/* Heading with REAL-TIME SCROLL SYNCHRONIZED 1-BY-1 DROP */}
          <div className="py-2">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-none text-white drop-shadow-2xl">
              {/* Line 1: Unfiltered [Bubble] Truth */}
              <div className="font-serif italic font-black flex items-center justify-center gap-3 sm:gap-4 md:gap-5 flex-wrap">
                <span
                  style={getWordStyle(0.02, 0.22)}
                  className="text-amber-400 relative inline-flex items-baseline will-change-transform"
                >
                  {/* White 'U' with Royal Crown tilted on top */}
                  <span className="relative inline-block text-white mr-0.5">
                    <Crown className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-amber-400 fill-amber-400 absolute -top-5 sm:-top-7 md:-top-8 left-1/2 -translate-x-1/2 -rotate-12 drop-shadow-[0_2px_10px_rgba(251,191,36,0.6)]" />
                    U
                  </span>
                  <span>nfiltered</span>
                </span>

                {/* 3D Yellow Message Bubble in the middle */}
                <span
                  style={getWordStyle(0.20, 0.40)}
                  className="inline-flex items-center justify-center mx-1 align-middle will-change-transform"
                >
                  <img
                    src="/yellow-chat-bubble.svg"
                    alt="Chat Bubble"
                    className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain drop-shadow-[0_4px_16px_rgba(250,204,21,0.5)] transform -rotate-6 hover:rotate-6 hover:scale-110 transition-all duration-300"
                  />
                </span>

                <span
                  style={getWordStyle(0.38, 0.58)}
                  className="text-neutral-100 will-change-transform"
                >
                  Truth !!
                </span>
              </div>

              {/* Line 2: Complete Anonymity */}
              <div className="font-sans uppercase font-extrabold tracking-wider mt-3 flex items-center justify-center gap-3 sm:gap-4 flex-wrap text-white">
                <span
                  style={getWordStyle(0.55, 0.75)}
                  className="will-change-transform"
                >
                  Complete
                </span>
                <span
                  style={getWordStyle(0.72, 0.95)}
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-4 py-1 rounded-2xl shadow-2xl font-black will-change-transform"
                >
                  Anonymity.
                </span>
              </div>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="mt-4 text-base md:text-xl text-neutral-300 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow">
            Create your personal link, share it anywhere, and receive candid feedback, secrets, and confessions with 100% sender privacy.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold px-8 py-6 text-base rounded-2xl shadow-2xl transition-all hover:scale-105 border-0">
                Claim Your Link <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/sign-in" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-[#101015]/80 backdrop-blur-md hover:bg-black text-white hover:text-amber-300 border border-amber-500/40 hover:border-amber-400 font-bold px-8 py-6 text-base rounded-2xl transition-all shadow-lg"
              >
                Sign In to Dashboard
              </Button>
            </Link>
          </div>

          {/* Scroll Down Prompt Indicator */}
          <div className="pt-8 flex flex-col items-center justify-center gap-1.5 text-xs text-amber-400/90 font-bold uppercase tracking-widest animate-bounce pointer-events-none">
            <span>Scroll to Tear Open</span>
            <ChevronDown className="w-4 h-4 text-amber-400" />
          </div>
        </div>
      </section>

      {/* =========================================================================
          REVEALED SECTIONS BELOW (EXPERIENCE & FEATURES)
          ========================================================================= */}
      <section className="relative z-20 py-20 px-4 md:px-12 max-w-5xl mx-auto space-y-20">
        
        {/* Live Message Showcase */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-8">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Real Experiences</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {sampleMessages.map((msg, index) => (
              <div
                key={index}
                className="relative rounded-2xl bg-[#0f0f14]/90 backdrop-blur-md text-white p-6 shadow-2xl transition-all duration-300 group hover:-translate-y-1.5 border border-[#2b2512] hover:border-amber-500/70"
              >
                {/* Gold glowing bar on card */}
                <div className="absolute left-0 top-6 bottom-6 w-1.5 bg-gradient-to-b from-amber-400 to-yellow-600 rounded-r-full" />

                <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-3">
                  <span className="flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                    {msg.author}
                  </span>
                  <span className="text-neutral-500 font-normal">{msg.time}</span>
                </div>
                <p className="text-neutral-200 text-sm leading-relaxed font-medium min-h-[60px]">
                  "{msg.content}"
                </p>
                <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Encrypted</span>
                  <span className="text-amber-400 font-bold">Delivered</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features & Security */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-[#0f0f14]/90 backdrop-blur-md text-white border border-[#252010] space-y-2 shadow-xl">
            <Lock className="w-6 h-6 text-amber-400 mb-2" />
            <h3 className="font-bold text-amber-400 text-sm">End-to-End Anonymous</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">No tracking, no IP logging for senders. Unadulterated candid answers.</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#0f0f14]/90 backdrop-blur-md text-white border border-[#252010] space-y-2 shadow-xl">
            <Crown className="w-6 h-6 text-amber-400 mb-2" />
            <h3 className="font-bold text-amber-400 text-sm">Personal Dashboard</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">Toggle message acceptance on and off anytime with a single click.</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#0f0f14]/90 backdrop-blur-md text-white border border-[#252010] space-y-2 shadow-xl">
            <Shield className="w-6 h-6 text-amber-400 mb-2" />
            <h3 className="font-bold text-amber-400 text-sm">Curated AI Suggestions</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">Instant smart conversation starters tailored for quick engagement.</p>
          </div>
        </div>

      </section>

      {/* Royal Footer */}
      <footer className="text-center py-8 bg-[#050507] text-neutral-500 text-xs border-t border-[#1f1b10] flex flex-col items-center gap-2 relative z-20">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
          <Crown className="w-4 h-4 text-amber-400" /> True Feedback
        </div>
        <p>© {new Date().getFullYear()} True Feedback. Realistic 3D Golden Paper Tear Scroll Experience.</p>
      </footer>
    </div>
  );
}
