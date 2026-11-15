import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0b0b0e] flex flex-col items-center justify-center relative selection:bg-amber-400 selection:text-black">
      <div className="relative z-10 flex flex-col items-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-black/60 border border-amber-500/30 flex items-center justify-center shadow-2xl backdrop-blur-md">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-sm font-black uppercase tracking-widest text-amber-300">
            Mystery Messages
          </p>
          <p className="text-xs text-neutral-400 font-medium">
            Loading experience...
          </p>
        </div>
      </div>
    </div>
  );
}
