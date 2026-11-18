'use client';

import React from 'react';
import { RefreshCcw, Sparkles, MessageSquareDashed, Share2 } from 'lucide-react';
import { Button } from './ui/button';

interface EmptyStateCardProps {
  onRefresh?: () => void;
  isLoading?: boolean;
  onCopyLink?: () => void;
  isEndState?: boolean;
}

export function EmptyStateCard({
  onRefresh,
  isLoading = false,
  onCopyLink,
  isEndState = false,
}: EmptyStateCardProps) {
  return (
    <div className="relative w-full max-w-[300px] sm:max-w-[320px] md:max-w-[310px] lg:max-w-[320px] mx-auto select-none my-1">
      {/* Outer Floating Shadow */}
      <div className="absolute inset-0 bg-amber-500/10 blur-xl rounded-[24px] pointer-events-none" />

      {/* Main Playing Card: Rich Creamy Blue with Solid Black Border */}
      <div className="relative z-10 w-full h-[380px] sm:h-[400px] md:h-[350px] lg:h-[370px] rounded-[22px] bg-gradient-to-b from-[#e3f2fd] via-[#bbdefb] to-[#90caf9] border-[2.5px] border-black p-4 sm:p-5 shadow-[0_12px_32px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden">
        
        {/* Lined Notebook Stationery Paper Texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.25] bg-[linear-gradient(to_bottom,transparent_27px,rgba(0,0,0,0.12)_28px)] [background-size:100%_28px]" 
          aria-hidden="true" 
        />

        {/* Vintage Paper Fiber Noise */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:10px_10px]" 
          aria-hidden="true" 
        />

        {/* Elegant Inset Border Line for Note Feel */}
        <div 
          className="absolute inset-2.5 rounded-[18px] border border-black/15 pointer-events-none" 
          aria-hidden="true" 
        />

        {/* TOP SECTION: Clean Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-black text-amber-300 text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isEndState ? 'End of Feed' : 'Inbox Empty'}</span>
          </span>

          <span className="text-[10px] font-black text-black/70 uppercase tracking-widest bg-black/10 px-2 py-0.5 rounded-full border border-black/15">
            Royal Note
          </span>
        </div>

        {/* CENTER SECTION: Stylish Empty / End Message Content */}
        <div className="relative z-10 my-auto py-3 px-2 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-black/10 border border-black/20 flex items-center justify-center text-black shadow-inner">
            <MessageSquareDashed className="w-6 h-6 stroke-[2]" />
          </div>

          <div className="w-10 h-0.5 bg-black/30 rounded-full" />

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight font-serif">
              {isEndState ? 'No More Messages!' : 'No Messages Yet!'}
            </h3>
            <p className="text-xs sm:text-[13px] font-bold text-black/75 max-w-[240px] leading-relaxed mx-auto italic">
              {isEndState
                ? 'You have scrolled through all your secret drops. Please refresh or check back later!'
                : 'Share your secret board link with friends on Instagram, WhatsApp, or Twitter to receive anonymous drops!'}
            </p>
          </div>

          <div className="w-10 h-0.5 bg-black/30 rounded-full" />
        </div>

        {/* BOTTOM SECTION: Interactive Actions Inside Card */}
        <div className="relative z-10 flex items-center justify-between gap-2 pt-2 border-t border-black/15">
          {onRefresh && (
            <Button
              onClick={onRefresh}
              disabled={isLoading}
              size="sm"
              className="bg-black hover:bg-neutral-900 text-white font-black text-xs px-3.5 h-8 rounded-xl shadow border-0 transition hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer flex-1"
            >
              <RefreshCcw className={`w-3.5 h-3.5 text-amber-300 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Refreshing...' : 'Please Refresh'}</span>
            </Button>
          )}

          {onCopyLink && (
            <Button
              onClick={onCopyLink}
              size="sm"
              variant="outline"
              className="bg-white/80 hover:bg-white text-black border-black/30 hover:border-black font-black text-xs px-3 h-8 rounded-xl shadow-sm transition hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Copy secret link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
