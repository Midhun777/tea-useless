import React from 'react';
import { motion } from 'framer-motion';

export function BubbleOverlay({ 
  bubbleResult, 
  vizMode = 'ACCEPTED', 
  naturalWidth, 
  naturalHeight, 
  containerWidth, 
  containerHeight 
}) {
  if (!bubbleResult || !naturalWidth || !naturalHeight || !containerWidth || !containerHeight) {
    return null;
  }

  const { acceptedBubbles = [], rawCandidates = [], rejectedCandidates = [] } = bubbleResult;

  // Select candidates list based on active visualization mode
  let targetList = acceptedBubbles;
  if (vizMode === 'RAW') {
    targetList = rawCandidates;
  } else if (vizMode === 'REJECTED') {
    targetList = rejectedCandidates;
  } else if (vizMode === 'CONFIDENCE') {
    targetList = [...acceptedBubbles, ...rejectedCandidates];
  }

  if (targetList.length === 0) {
    return null;
  }

  // Calculate scale factors
  const scaleX = containerWidth / naturalWidth;
  const scaleY = containerHeight / naturalHeight;
  const avgScale = (scaleX + scaleY) / 2;

  // Helper to determine circle stroke color based on mode and candidate properties
  const getCandidateColor = (b) => {
    if (vizMode === 'REJECTED') {
      if (b.reason === 'duplicate') return 'rgba(245, 158, 11, 0.8)'; // Amber for duplicates
      if (b.reason === 'outside-roi') return 'rgba(239, 68, 68, 0.8)'; // Red for outside ROI
      return 'rgba(156, 163, 175, 0.7)'; // Gray for other rejections
    }

    if (vizMode === 'RAW') {
      return 'rgba(168, 85, 247, 0.8)'; // Purple for raw Hough
    }

    if (vizMode === 'CONFIDENCE') {
      const conf = b.confidence || 0.5;
      if (conf >= 0.75) return 'rgba(34, 211, 238, 0.9)';   // High = Cyan
      if (conf >= 0.55) return 'rgba(245, 158, 11, 0.9)';   // Med = Amber
      return 'rgba(239, 68, 68, 0.8)';                     // Low = Red
    }

    // Default ACCEPTED mode (Cyan)
    return 'rgba(34, 211, 238, 0.9)';
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      <svg className="w-full h-full">
        {targetList.map((b, idx) => {
          const domX = b.x * scaleX;
          const domY = b.y * scaleY;
          const domR = Math.max(3, (b.radius || 5) * avgScale);
          const color = getCandidateColor(b);

          return (
            <g key={`${b.id || idx}-${b.x}-${b.y}`} className="group">
              {/* Candidate Boundary Circle */}
              <circle
                cx={domX}
                cy={domY}
                r={domR}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeDasharray={vizMode === 'REJECTED' ? '4,4' : 'none'}
                className="drop-shadow-[0_0_3px_rgba(0,0,0,0.5)]"
              />

              {/* Center Dot */}
              <circle
                cx={domX}
                cy={domY}
                r="1.5"
                fill={color}
              />

              {/* Tag Label */}
              {domR >= 5 && (
                <text
                  x={domX + domR + 3}
                  y={domY + 3}
                  fill={color}
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="600"
                  className="select-none opacity-95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                >
                  {vizMode === 'REJECTED' 
                    ? `[${b.reason || 'rej'}]` 
                    : vizMode === 'CONFIDENCE'
                    ? `${Math.round((b.confidence || 0) * 100)}%`
                    : `#${b.id}`}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
