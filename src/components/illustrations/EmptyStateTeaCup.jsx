import React from 'react';

/**
 * Editorial Empty State Tea Cup Linework Illustration
 */
export function EmptyStateTeaCup() {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center select-none">
      {/* SVG Linework Tea Cup */}
      <svg 
        viewBox="0 0 240 180" 
        className="w-48 h-36 mb-4 filter drop-shadow-sm transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="emptyTeaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D4A359" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#9E5E26" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Steam Curlicues */}
        <path 
          d="M 90 35 Q 85 20 95 10 Q 105 0 95 -10" 
          fill="none" 
          stroke="#9E5E26" 
          strokeWidth="1.5" 
          strokeLinecap="round"
          className="animate-pulse"
          style={{ animationDuration: '3s' }}
        />
        <path 
          d="M 120 40 Q 125 25 115 15 Q 105 5 120 -5" 
          fill="none" 
          stroke="#9E5E26" 
          strokeWidth="1.5" 
          strokeLinecap="round"
          className="animate-pulse"
          style={{ animationDuration: '4s', animationDelay: '0.5s' }}
        />
        <path 
          d="M 150 35 Q 145 20 155 10" 
          fill="none" 
          stroke="#9E5E26" 
          strokeWidth="1.5" 
          strokeLinecap="round"
          className="animate-pulse"
          style={{ animationDuration: '3.5s', animationDelay: '1s' }}
        />

        {/* Cup Saucer */}
        <ellipse cx="120" cy="155" rx="90" ry="12" fill="#F3EEE3" stroke="#2C221E" strokeWidth="2" />
        <ellipse cx="120" cy="155" rx="75" ry="8" fill="none" stroke="#2C221E" strokeWidth="1" strokeDasharray="3 3" />

        {/* Cup Body Outer Contour */}
        <path 
          d="M 50 65 L 60 135 Q 120 160 180 135 L 190 65 Z" 
          fill="#FBF9F4" 
          stroke="#2C221E" 
          strokeWidth="2.5" 
        />

        {/* Cup Handle */}
        <path 
          d="M 188 75 C 220 75 220 120 183 125" 
          fill="none" 
          stroke="#2C221E" 
          strokeWidth="2.5" 
        />

        {/* Cup Opening Rim Ellipse */}
        <ellipse cx="120" cy="65" rx="70" ry="18" fill="#E6DDD0" stroke="#2C221E" strokeWidth="2" />

        {/* Liquid Surface inside Cup */}
        <ellipse cx="120" cy="68" rx="64" ry="14" fill="url(#emptyTeaGrad)" stroke="#2C221E" strokeWidth="1.5" />

        {/* Illustrated Floating Bubbles on Liquid Surface */}
        <g stroke="#2C221E" strokeWidth="1.5" fill="#FBF9F4" fillOpacity="0.9">
          <circle cx="100" cy="66" r="6" />
          <circle cx="114" cy="65" r="8" />
          <circle cx="128" cy="67" r="5" />
          <circle cx="140" cy="69" r="7" />
          <circle cx="90"  cy="68" r="4" />
          
          {/* Bubble highlights */}
          <circle cx="112" cy="63" r="2" fill="#FFFFFF" stroke="none" />
          <circle cx="138" cy="67" r="1.5" fill="#FFFFFF" stroke="none" />
        </g>

        {/* Measurement Callout Ticks */}
        <line x1="30" y1="65" x2="42" y2="65" stroke="#2C221E" strokeWidth="1.5" />
        <line x1="30" y1="100" x2="45" y2="100" stroke="#2C221E" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="30" y1="135" x2="52" y2="135" stroke="#2C221E" strokeWidth="1.5" />
        <text x="22" y="103" fontSize="8" fontFamily="Space Mono" textAnchor="end" fill="#57534E">VOL. α</text>
      </svg>

      {/* Subtle Invitation Text */}
      <h3 className="font-editorial text-2xl font-bold text-[#1C1917] mb-1">
        Give us some tea to investigate.
      </h3>
      <p className="font-mono-spec text-xs text-[#57534E] max-w-sm">
        Drop your tea photo, specimen scan, or bubble snapshot below for scientific analysis.
      </p>
    </div>
  );
}
