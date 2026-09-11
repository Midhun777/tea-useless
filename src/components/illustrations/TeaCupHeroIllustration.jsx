import React, { useState } from 'react';
import { TargetPin, RadialCompassGrid, MagnificationLoupe } from './ScientificAnnotations';

/**
 * Editorial Scientific Field-Guide Tea Cup Centerpiece Illustration
 */
export function TeaCupHeroIllustration({ onAnalyzeClick }) {
  const [activeBubble, setActiveBubble] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  // Pre-calculated editorial bubbles for the hero centerpiece
  const heroBubbles = [
    { id: '021', x: 250, y: 190, r: 18, d: '3.4 mm', label: 'BUBBLE 021', state: 'STABLE' },
    { id: '022', x: 210, y: 240, r: 12, d: '2.1 mm', label: 'BUBBLE 022', state: 'DENSE' },
    { id: '023', x: 310, y: 220, r: 24, d: '4.8 mm', label: 'PRIMARY DOME', state: 'CLUSTER' },
    { id: '024', x: 280, y: 290, r: 14, d: '2.6 mm', label: 'BUBBLE 024', state: 'FINE' },
    { id: '025', x: 170, y: 280, r: 16, d: '3.0 mm', label: 'BUBBLE 025', state: 'STABLE' },
    { id: '026', x: 330, y: 320, r: 10, d: '1.8 mm', label: 'MICRO FOAM', state: 'FOAM' },
    { id: '027', x: 220, y: 340, r: 20, d: '3.9 mm', label: 'BUBBLE 027', state: 'MENISCUS' },
    { id: '028', x: 370, y: 260, r: 15, d: '2.8 mm', label: 'BUBBLE 028', state: 'OUTER' },
    { id: '029', x: 160, y: 210, r: 11, d: '2.0 mm', label: 'BUBBLE 029', state: 'RIM' },
    { id: '030', x: 260, y: 380, r: 13, d: '2.4 mm', label: 'BUBBLE 030', state: 'DENSE' },
    { id: '031', x: 350, y: 200, r: 9,  d: '1.5 mm', label: 'MICRO FOAM', state: 'FINE' },
    { id: '032', x: 190, y: 170, r: 15, d: '2.9 mm', label: 'BUBBLE 032', state: 'STABLE' },
  ];

  return (
    <div 
      className="relative w-full max-w-2xl mx-auto my-4 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Editorial Plate Header Tag */}
      <div className="absolute -top-3 left-4 z-20 bg-[#FBF9F4] border border-[#2C221E] px-3 py-1 shadow-editorial-sm flex items-center gap-3">
        <span className="font-mono-spec text-[10px] font-bold tracking-widest text-[#1C1917] uppercase">
          PLATE IV — SPECIMEN NO. 8409
        </span>
        <span className="h-3 w-px bg-[#2C221E]/30"></span>
        <span className="font-mono-spec text-[10px] font-bold text-[#9E5E26] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-pulse"></span>
          SURFACE SCAN ACTIVE
        </span>
      </div>

      {/* Main SVG Container */}
      <div className="relative bg-[#FBF8F3] border-2 border-[#2C221E] p-6 shadow-editorial overflow-hidden">
        {/* Background Editorial Grid */}
        <div className="absolute inset-0 bg-parchment-texture opacity-60 pointer-events-none"></div>

        {/* SVG Illustration Artwork */}
        <svg 
          viewBox="0 0 520 520" 
          className="w-full h-auto relative z-10 filter drop-shadow-sm"
        >
          <defs>
            {/* Liquid Tea Gradient */}
            <radialGradient id="teaLiquidGrad" cx="45%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#D4A359" />
              <stop offset="40%" stopColor="#C57B36" />
              <stop offset="80%" stopColor="#9E5E26" />
              <stop offset="100%" stopColor="#5C3413" />
            </radialGradient>

            {/* Ceramic Rim Gradient */}
            <linearGradient id="ceramicRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5F0E6" />
              <stop offset="50%" stopColor="#E6DDD0" />
              <stop offset="100%" stopColor="#D4C8B5" />
            </linearGradient>

            {/* Bubble Shine Gradient */}
            <radialGradient id="bubbleShine" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#FFF8ED" stopOpacity="0.4" />
              <stop offset="90%" stopColor="#9E5E26" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#2C221E" stopOpacity="0.3" />
            </radialGradient>
          </defs>

          {/* Polar Grid Backdrop */}
          <RadialCompassGrid size={520} />

          {/* Outer Ceramic Saucer Contour Line */}
          <circle cx="260" cy="260" r="248" fill="#F3EEE3" stroke="#2C221E" strokeWidth="2" />
          <circle cx="260" cy="260" r="240" fill="none" stroke="#2C221E" strokeWidth="1" strokeDasharray="3 3" />

          {/* Tea Bowl Outer Wall */}
          <circle cx="260" cy="260" r="215" fill="url(#ceramicRimGrad)" stroke="#2C221E" strokeWidth="2.5" />
          
          {/* Inner Bowl Shadow / Meniscus Line */}
          <circle cx="260" cy="260" r="195" fill="none" stroke="#2C221E" strokeWidth="1.5" strokeDasharray="6 3" />

          {/* Tea Liquid Matrix */}
          <circle cx="260" cy="260" r="190" fill="url(#teaLiquidGrad)" stroke="#2C221E" strokeWidth="2" />

          {/* Subtle Tea Ripples */}
          <ellipse cx="260" cy="260" rx="150" ry="148" fill="none" stroke="#F5F0E6" strokeWidth="1" strokeOpacity="0.25" />
          <ellipse cx="260" cy="260" rx="110" ry="108" fill="none" stroke="#F5F0E6" strokeWidth="1" strokeOpacity="0.2" />

          {/* Floating Tea Leaves / Dust Particles */}
          <path d="M 140 180 Q 150 170 155 185 Q 145 195 140 180 Z" fill="#3A230F" stroke="#1C1917" strokeWidth="0.75" />
          <path d="M 370 340 Q 380 330 385 345 Q 375 355 370 340 Z" fill="#3A230F" stroke="#1C1917" strokeWidth="0.75" />

          {/* Render Vector Bubbles */}
          {heroBubbles.map((b, idx) => {
            const isSelected = activeBubble === idx;
            return (
              <g 
                key={b.id} 
                className="cursor-pointer transition-transform duration-200"
                onClick={() => setActiveBubble(idx)}
              >
                {/* Bubble Outer Shadow & Ring */}
                <circle 
                  cx={b.x} 
                  cy={b.y} 
                  r={b.r} 
                  fill="url(#bubbleShine)" 
                  stroke={isSelected ? "#0284C7" : "#2C221E"} 
                  strokeWidth={isSelected ? "2.5" : "1.5"} 
                />

                {/* Inner Highlight Crescent */}
                <circle 
                  cx={b.x - b.r * 0.3} 
                  cy={b.y - b.r * 0.3} 
                  r={b.r * 0.35} 
                  fill="#FFFFFF" 
                  fillOpacity="0.7" 
                />

                {/* Vector Selection Ring */}
                {isSelected && (
                  <circle 
                    cx={b.x} 
                    cy={b.y} 
                    r={b.r + 6} 
                    fill="none" 
                    stroke="#0284C7" 
                    strokeWidth="1.5" 
                    strokeDasharray="3 3"
                    className="animate-spin"
                    style={{ animationDuration: '10s' }}
                  />
                )}
              </g>
            );
          })}

          {/* Radar Scanning Line Animation Overlay */}
          <g className="origin-center animate-radar pointer-events-none" style={{ transformOrigin: '260px 260px' }}>
            <line x1="260" y1="260" x2="450" y2="260" stroke="#0284C7" strokeWidth="1.5" strokeOpacity="0.7" />
            <path d="M 260 260 L 450 260 A 190 190 0 0 0 424 125 Z" fill="#0284C7" fillOpacity="0.1" />
          </g>

          {/* Scientific Callout Leaders on Selected Bubble */}
          {heroBubbles[activeBubble] && (
            <g transform={`translate(${heroBubbles[activeBubble].x}, ${heroBubbles[activeBubble].y})`}>
              <line x1="0" y1="0" x2="40" y2="-40" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="2 2" />
              <circle cx="40" cy="-40" r="3" fill="#0284C7" />
              
              {/* Floating Scientific Annotation Box */}
              <g transform="translate(42, -62)">
                <rect x="0" y="0" width="135" height="36" fill="#FBF9F4" stroke="#2C221E" strokeWidth="1.5" rx="1" />
                <text x="8" y="14" fontSize="9" fontFamily="Space Mono" fontWeight="bold" fill="#0284C7">
                  {heroBubbles[activeBubble].label}
                </text>
                <text x="8" y="27" fontSize="10" fontFamily="Space Mono" fontWeight="bold" fill="#1C1917">
                  ∅ {heroBubbles[activeBubble].d} • DETECTED
                </text>
              </g>
            </g>
          )}

          {/* Corner Ticks & Measurement Scales */}
          <path d="M 30 50 L 30 30 L 50 30" fill="none" stroke="#2C221E" strokeWidth="2" />
          <path d="M 470 50 L 470 30 L 450 30" fill="none" stroke="#2C221E" strokeWidth="2" />
          <path d="M 30 470 L 30 490 L 50 490" fill="none" stroke="#2C221E" strokeWidth="2" />
          <path d="M 470 470 L 470 490 L 450 490" fill="none" stroke="#2C221E" strokeWidth="2" />

          {/* Scale Ruler Bar */}
          <g transform="translate(30, 480)">
            <line x1="0" y1="0" x2="60" y2="0" stroke="#2C221E" strokeWidth="2" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="#2C221E" strokeWidth="1.5" />
            <line x1="30" y1="-3" x2="30" y2="3" stroke="#2C221E" strokeWidth="1" />
            <line x1="60" y1="-4" x2="60" y2="4" stroke="#2C221E" strokeWidth="1.5" />
            <text x="30" y="-8" fontSize="8" fontFamily="Space Mono" textAnchor="middle" fill="#2C221E">10 mm SCALE</text>
          </g>
        </svg>

        {/* Floating Magnification Loupe Overlay (Bottom Right) */}
        <div className="absolute bottom-6 right-6 z-20 hidden sm:block">
          <MagnificationLoupe 
            zoom={4} 
            label="MEMBRANE INSPECTION" 
          />
        </div>

        {/* Floating Telemetry Stamp (Bottom Left) */}
        <div className="absolute bottom-6 left-6 z-20 hidden md:block bg-[#FBF9F4] border border-[#2C221E] p-2.5 shadow-editorial-sm max-w-[170px]">
          <div className="font-mono-spec text-[9px] text-[#57534E] uppercase tracking-wider mb-1 font-bold">
            SPECIMEN TELEMETRY
          </div>
          <div className="font-mono-spec text-[10px] text-[#1C1917] space-y-0.5">
            <p>SURFACE: <span className="font-bold text-[#9E5E26]">84.2 cm²</span></p>
            <p>FLUID TEMP: <span className="font-bold text-[#1C1917]">78.5 °C</span></p>
            <p>VISCOSITY: <span className="font-bold text-[#1C1917]">1.04 cP</span></p>
          </div>
        </div>
      </div>

      {/* Editorial Caption Bar */}
      <div className="mt-3 flex flex-wrap items-center justify-between px-2 text-xs font-mono-spec text-[#57534E]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#6B7A44]"></span>
          <span>FIG 1.0 — TOP-DOWN TEA SURFACE MATRIX</span>
        </div>
        <span className="italic text-[#9E5E26]">Click bubbles on tea surface to inspect metrics</span>
      </div>
    </div>
  );
}
