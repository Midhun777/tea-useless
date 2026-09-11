import React from 'react';

/**
 * Editorial Scientific SVG Reticle / Target Pin
 */
export function TargetPin({ x, y, id, diameter, active = false, label = "" }) {
  return (
    <g transform={`translate(${x}, ${y})`} className="transition-all duration-300">
      {/* Outer pulsing ring if active */}
      {active && (
        <circle
          r="16"
          fill="none"
          stroke="#0284C7"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          className="animate-spin"
          style={{ animationDuration: '6s' }}
        />
      )}
      
      {/* Target Crosshair */}
      <circle r="8" fill="none" stroke={active ? "#0284C7" : "#2C221E"} strokeWidth="1.5" />
      <circle r="2" fill={active ? "#0284C7" : "#9E5E26"} />
      <line x1="-12" y1="0" x2="-8" y2="0" stroke={active ? "#0284C7" : "#2C221E"} strokeWidth="1.5" />
      <line x1="8" y1="0" x2="12" y2="0" stroke={active ? "#0284C7" : "#2C221E"} strokeWidth="1.5" />
      <line x1="0" y1="-12" x2="0" y2="-8" stroke={active ? "#0284C7" : "#2C221E"} strokeWidth="1.5" />
      <line x1="0" y1="8" x2="0" y2="12" stroke={active ? "#0284C7" : "#2C221E"} strokeWidth="1.5" />

      {/* Leader line and tag */}
      {label && (
        <g transform="translate(12, -12)">
          <path d="M 0 0 L 12 -12 L 50 -12" fill="none" stroke="#2C221E" strokeWidth="1" strokeDasharray="2 2" />
          <rect x="52" y="-22" width="76" height="18" fill="#FBF9F4" stroke="#2C221E" strokeWidth="1" rx="2" />
          <text x="56" y="-9" fontSize="9" fontFamily="Space Mono" fontWeight="bold" fill="#1C1917">
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

/**
 * Editorial Compass / Polar Grid Ring
 */
export function RadialCompassGrid({ size = 400 }) {
  const center = size / 2;
  return (
    <g className="pointer-events-none opacity-40">
      {/* Outer concentric rings */}
      <circle cx={center} cy={center} r={center * 0.9} fill="none" stroke="#2C221E" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx={center} cy={center} r={center * 0.6} fill="none" stroke="#2C221E" strokeWidth="0.75" strokeDasharray="2 2" />
      <circle cx={center} cy={center} r={center * 0.3} fill="none" stroke="#2C221E" strokeWidth="0.75" />

      {/* Radial Rays */}
      <line x1={center} y1="10" x2={center} y2={size - 10} stroke="#2C221E" strokeWidth="0.75" strokeDasharray="3 3" />
      <line x1="10" y1={center} x2={size - 10} y2={center} stroke="#2C221E" strokeWidth="0.75" strokeDasharray="3 3" />

      {/* Cardinal Ticks */}
      <text x={center} y="24" fontSize="10" fontFamily="Space Mono" fill="#2C221E" textAnchor="middle">N 0.0°</text>
      <text x={size - 24} y={center + 3} fontSize="10" fontFamily="Space Mono" fill="#2C221E" textAnchor="end">E 90.0°</text>
      <text x={center} y={size - 14} fontSize="10" fontFamily="Space Mono" fill="#2C221E" textAnchor="middle">S 180.0°</text>
      <text x="24" y={center + 3} fontSize="10" fontFamily="Space Mono" fill="#2C221E" textAnchor="start">W 270.0°</text>
    </g>
  );
}

/**
 * Magnification Circle Callout SVG
 */
export function MagnificationLoupe({ x = 0, y = 0, zoom = 3, label = "SURFACE TENSION LOUPE" }) {
  return (
    <div className="bg-[#FBF9F4] border-2 border-[#2C221E] p-3 shadow-editorial rounded-none max-w-xs">
      <div className="flex items-center justify-between border-b border-[#2C221E] pb-1.5 mb-2">
        <span className="font-mono-spec text-[10px] font-bold text-[#1C1917] tracking-wider uppercase flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#0284C7] inline-block animate-pulse"></span>
          {label}
        </span>
        <span className="font-mono-spec text-[10px] text-[#9E5E26] font-bold">{zoom}x MAG</span>
      </div>
      <div className="relative w-full h-32 bg-[#F3EEE3] border border-[#2C221E] flex items-center justify-center overflow-hidden">
        {/* Loupe Grid Overlay */}
        <svg className="absolute inset-0 w-full h-full">
          <pattern id="loupe-grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#2C221E" strokeWidth="0.5" strokeOpacity="0.2" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#loupe-grid)" />
          
          {/* Zoomed bubble vectors */}
          <circle cx="50%" cy="50%" r="34" fill="none" stroke="#9E5E26" strokeWidth="2" strokeDasharray="4 2" />
          <circle cx="50%" cy="50%" r="30" fill="none" stroke="#2C221E" strokeWidth="1.5" />
          <circle cx="42%" cy="40%" r="8" fill="white" fillOpacity="0.6" />
          
          {/* Force Vectors */}
          <line x1="50%" y1="50%" x2="78%" y2="50%" stroke="#0284C7" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <text x="62%" y="45%" fontSize="9" fontFamily="Space Mono" fill="#0284C7" fontWeight="bold">γ = 72.8 mN/m</text>

          {/* Crosshair Center */}
          <line x1="50%" y1="20%" x2="50%" y2="80%" stroke="#2C221E" strokeWidth="0.75" strokeDasharray="2 2" />
          <line x1="20%" y1="50%" x2="80%" y2="50%" stroke="#2C221E" strokeWidth="0.75" strokeDasharray="2 2" />
        </svg>
      </div>
      <div className="mt-2 flex justify-between items-center text-[10px] font-mono-spec text-[#57534E]">
        <span>MEMBRANE CURVATURE</span>
        <span className="font-bold text-[#1C1917]">κ = 1.12 mm⁻¹</span>
      </div>
    </div>
  );
}
