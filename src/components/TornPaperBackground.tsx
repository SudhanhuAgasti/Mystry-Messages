'use client';

import React from 'react';

/**
 * TornPaperBackground
 * - Fixed Fullscreen Canvas (`fixed inset-0`) that covers the entire page during scroll
 * - Responsive: Works beautifully on mobile, tablet, and widescreen desktop
 * - Double-sided torn paper on desktop, streamlined edge on mobile
 * - Anti-zoom / touch-manipulation protected
 * - Lightweight SVG filters for deckle paper texture and deep realistic drop shadows
 */
export default function TornPaperBackground() {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none select-none z-0 bg-[#0c0c0e]">
      {/* SVG Filters for Deckle Edges & Authentic Paper Grain */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="paper-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="4"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.28 0"
              result="coloredNoise"
            />
            <feComposite in="SourceGraphic" in2="coloredNoise" operator="over" />
          </filter>

          <filter id="torn-edge-top" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04 0.08"
              numOctaves="4"
              result="rough"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="rough"
              scale="15"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          <filter id="torn-edge-side" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05 0.06"
              numOctaves="5"
              result="roughEdge"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="roughEdge"
              scale="18"
              xChannelSelector="G"
              yChannelSelector="B"
            />
          </filter>
        </defs>
      </svg>

      {/* Deep Matte Black Base with soft vignette */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#060608] via-[#0b0b0e] to-[#111116]" />

      {/* ===================== LEFT SIDE TORN PAPER (DESKTOP) ===================== */}
      <div
        className="hidden md:block absolute top-0 bottom-0 left-0 w-[22vw] lg:w-[18vw] h-full"
        style={{
          filter: 'url(#torn-edge-side) drop-shadow(18px 0px 30px rgba(0,0,0,0.9))',
        }}
      >
        {/* Inner exposed golden layer underneath the tear */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background: 'linear-gradient(135deg, #e5a720 0%, #d89614 40%, #b97d09 75%, #6e4802 100%)',
            clipPath: 'polygon(0% 0%, 95% 0%, 75% 35%, 88% 65%, 65% 100%, 0% 100%)',
            boxShadow: 'inset -20px 20px 50px rgba(0,0,0,0.6)',
          }}
        />

        {/* Top torn golden sheet */}
        <div
          className="absolute inset-0 w-full h-full relative"
          style={{
            background: 'linear-gradient(145deg, #d39a1c 0%, #caa43b 35%, #b88514 65%, #9e700a 100%)',
            clipPath: 'polygon(0% 0%, 82% 0%, 60% 40%, 74% 70%, 52% 100%, 0% 100%)',
          }}
        >
          <div
            className="absolute inset-0 opacity-40 mix-blend-multiply"
            style={{ filter: 'url(#paper-grain)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/35" />
          <div
            className="absolute inset-0 border-r-[2.5px] border-[#fae29c]/60 pointer-events-none"
            style={{
              clipPath: 'polygon(0% 0%, 82% 0%, 60% 40%, 74% 70%, 52% 100%, 0% 100%)',
            }}
          />
        </div>
      </div>

      {/* ===================== RIGHT SIDE TORN PAPER ===================== */}

      {/* Inner Exposed Smooth Golden Layer in lower-right */}
      <div
        className="absolute bottom-0 right-0 w-[45vw] md:w-[32vw] lg:w-[26vw] h-[85vh]"
        style={{
          clipPath: 'polygon(100% 0%, 100% 100%, 25% 100%, 70% 35%)',
          background: 'linear-gradient(135deg, #e5a720 0%, #d89614 35%, #b97d09 70%, #6e4802 100%)',
          boxShadow: 'inset 25px 25px 60px rgba(0, 0, 0, 0.65)',
        }}
      />

      {/* Lower Right Torn Paper */}
      <div
        className="absolute bottom-0 right-0 w-[50vw] md:w-[38vw] lg:w-[30vw] h-[95vh]"
        style={{
          filter: 'url(#torn-edge-side) drop-shadow(-18px -10px 30px rgba(0,0,0,0.85))',
        }}
      >
        <div
          className="w-full h-full relative"
          style={{
            background: 'linear-gradient(145deg, #d39a1c 0%, #caa43b 30%, #b88514 60%, #9e700a 100%)',
            clipPath: 'polygon(100% 0%, 100% 100%, 22% 100%, 48% 68%, 56% 38%, 68% 0%)',
          }}
        >
          <div
            className="absolute inset-0 opacity-40 mix-blend-multiply"
            style={{ filter: 'url(#paper-grain)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/45" />
          <div
            className="absolute inset-0 border-l-[3px] border-[#fae29c]/60 pointer-events-none"
            style={{
              clipPath: 'polygon(100% 0%, 100% 100%, 22% 100%, 48% 68%, 56% 38%, 68% 0%)',
            }}
          />
        </div>
      </div>

      {/* Top-Diagonal Heavy Torn Sheet */}
      <div
        className="absolute -top-10 right-0 w-[85vw] sm:w-[75vw] md:w-[48vw] lg:w-[40vw] h-[60vh]"
        style={{
          filter: 'url(#torn-edge-top) drop-shadow(-20px 25px 35px rgba(0,0,0,0.92))',
        }}
      >
        <div
          className="w-full h-full relative"
          style={{
            background: 'linear-gradient(135deg, #d49b1e 0%, #c9931b 45%, #b48113 75%, #8f6407 100%)',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 75% 90%, 52% 44%, 0% 15%)',
          }}
        >
          <div
            className="absolute inset-0 opacity-45 mix-blend-multiply"
            style={{ filter: 'url(#paper-grain)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/50" />
        </div>
      </div>

      {/* Center Atmospheric Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
    </div>
  );
}
