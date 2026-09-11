import React from 'react';
import { motion } from 'framer-motion';
import { Target, AlertTriangle, ShieldCheck, Edit3 } from 'lucide-react';

export function RoiOverlay({ roi, naturalWidth, naturalHeight, containerWidth, containerHeight }) {
  if (!roi || !naturalWidth || !naturalHeight || !containerWidth || !containerHeight) {
    return null;
  }

  // Calculate scaling factors between original matrix dimensions and DOM container
  const scaleX = containerWidth / naturalWidth;
  const scaleY = containerHeight / naturalHeight;

  const scaledX = roi.centerX * scaleX;
  const scaledY = roi.centerY * scaleY;
  const scaledRadius = roi.radius * ((scaleX + scaleY) / 2);

  const isManual = roi.method === 'manual';
  const isUncertain = roi.confidence < 0.55;

  const strokeColor = isManual 
    ? 'rgba(245, 158, 11, 0.9)' // Amber for manual
    : isUncertain 
    ? 'rgba(239, 68, 68, 0.9)'  // Red for low confidence
    : 'rgba(34, 211, 238, 0.9)'; // Cyan for high confidence auto

  const badgeBg = isManual 
    ? 'bg-amber-950/90 text-amber-300 border-amber-800' 
    : isUncertain
    ? 'bg-red-950/90 text-red-300 border-red-800'
    : 'bg-cyan-950/90 text-cyan-300 border-cyan-800';

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      <svg className="w-full h-full">
        {/* Outer Darkened Mask Ring for ROI highlighting */}
        <defs>
          <mask id="roi-clip-mask">
            <rect width="100%" height="100%" fill="white" />
            <circle cx={scaledX} cy={scaledY} r={scaledRadius} fill="black" />
          </mask>
        </defs>

        {/* Semi-transparent dimming outside ROI */}
        <rect 
          width="100%" 
          height="100%" 
          fill="rgba(2, 6, 23, 0.45)" 
          mask="url(#roi-clip-mask)" 
        />

        {/* ROI Outer Boundary Ring */}
        <circle
          cx={scaledX}
          cy={scaledY}
          r={scaledRadius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeDasharray={isManual ? '6,6' : 'none'}
          className="transition-all duration-200"
        />

        {/* Reticle Target Crosshairs */}
        <line x1={scaledX - 12} y1={scaledY} x2={scaledX + 12} y2={scaledY} stroke={strokeColor} strokeWidth="1.5" />
        <line x1={scaledX} y1={scaledY - 12} x2={scaledX} y2={scaledY + 12} stroke={strokeColor} strokeWidth="1.5" />
        <circle cx={scaledX} cy={scaledY} r="3" fill={strokeColor} />

        {/* Cardinal orientation ticks */}
        <circle cx={scaledX - scaledRadius} cy={scaledY} r="3" fill={strokeColor} />
        <circle cx={scaledX + scaledRadius} cy={scaledY} r="3" fill={strokeColor} />
        <circle cx={scaledX} cy={scaledY - scaledRadius} r="3" fill={strokeColor} />
        <circle cx={scaledX} cy={scaledY + scaledRadius} r="3" fill={strokeColor} />
      </svg>

      {/* Mode & Confidence Telemetry Badge Overlay */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ left: `${scaledX}px`, top: `${Math.max(16, scaledY - scaledRadius - 28)}px` }}
        className={`absolute -translate-x-1/2 px-2.5 py-1 rounded-full border text-[10px] font-mono-lab font-semibold tracking-wider flex items-center space-x-1.5 shadow-lg backdrop-blur ${badgeBg}`}
      >
        {isManual ? (
          <Edit3 className="w-3 h-3 text-amber-400" />
        ) : isUncertain ? (
          <AlertTriangle className="w-3 h-3 text-red-400" />
        ) : (
          <ShieldCheck className="w-3 h-3 text-cyan-400" />
        )}
        <span>
          {isManual ? 'MANUAL ROI' : `AUTO ROI (${Math.round(roi.confidence * 100)}%)`}
        </span>
      </motion.div>
    </div>
  );
}
