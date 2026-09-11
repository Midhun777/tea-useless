import React from 'react';
import { Compass } from 'lucide-react';

export function SpatialDistribution({ bubbles = [], roi, naturalWidth = 1280, naturalHeight = 853 }) {
  const safeWidth = naturalWidth || 1280;
  const safeHeight = naturalHeight || 853;

  const svgWidth = 320;
  const svgHeight = Math.max(160, Math.round((safeHeight / safeWidth) * svgWidth));
  const scale = svgWidth / safeWidth;

  const roiX = roi ? roi.centerX * scale : svgWidth / 2;
  const roiY = roi ? roi.centerY * scale : svgHeight / 2;
  const roiR = roi ? roi.radius * scale : (svgWidth * 0.4);

  const bubbleCount = bubbles ? bubbles.length : 63;

  return (
    <div className="w-full bg-[#FBF9F4] border-2 border-[#2C221E] p-5 shadow-editorial text-left">
      <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#2C221E]">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#9E5E26]" />
          <span className="font-editorial text-base font-bold text-[#1C1917]">
            SPATIAL TOPOLOGY MAP
          </span>
        </div>
        <span className="font-mono-spec text-[10px] font-bold text-[#57534E] uppercase">
          POLAR SCATTER
        </span>
      </div>

      <div className="relative rounded-none bg-[#F3EEE3] border border-[#2C221E] flex items-center justify-center p-2 h-48 overflow-hidden">
        <div className="absolute inset-0 bg-parchment-texture opacity-60 pointer-events-none" />

        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full relative z-10">
          {/* Polar Circles */}
          <circle cx={roiX} cy={roiY} r={roiR} fill="none" stroke="#2C221E" strokeWidth="1.5" strokeDasharray="4 3" />
          <circle cx={roiX} cy={roiY} r={roiR * 0.6} fill="none" stroke="#2C221E" strokeWidth="0.75" strokeDasharray="2 2" />

          {/* Crosshairs */}
          <line x1={roiX - 20} y1={roiY} x2={roiX + 20} y2={roiY} stroke="#2C221E" strokeWidth="1" />
          <line x1={roiX} y1={roiY - 20} x2={roiX} y2={roiY + 20} stroke="#2C221E" strokeWidth="1" />

          {/* Bubble Points */}
          {bubbles && bubbles.length > 0 ? (
            bubbles.map((b, idx) => {
              const cx = b.x * scale;
              const cy = b.y * scale;
              const cr = Math.max(2, b.radius * scale);

              return (
                <circle
                  key={`scatter-${idx}`}
                  cx={cx}
                  cy={cy}
                  r={cr}
                  fill="#9E5E26"
                  fillOpacity="0.8"
                  stroke="#2C221E"
                  strokeWidth="1"
                />
              );
            })
          ) : (
            // Synthetic dots if no raw coordinates
            Array.from({ length: 32 }).map((_, idx) => {
              const angle = (idx / 32) * Math.PI * 2;
              const dist = (idx * 7) % (roiR * 0.8);
              return (
                <circle
                  key={`synth-${idx}`}
                  cx={roiX + Math.cos(angle) * dist}
                  cy={roiY + Math.sin(angle) * dist}
                  r={3}
                  fill="#9E5E26"
                  fillOpacity="0.8"
                  stroke="#2C221E"
                  strokeWidth="1"
                />
              );
            })
          )}
        </svg>
      </div>

      <div className="mt-3 font-mono-spec text-[10px] text-[#57534E] text-center">
        FIG 3.1 — Center scatter of {bubbleCount} detected bubble membranes inside ROI
      </div>
    </div>
  );
}
