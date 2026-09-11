import React from 'react';
import { motion } from 'framer-motion';

export function BubbleTooltip({ bubble, position }) {
  if (!bubble || !position) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={{ left: `${position.x + 12}px`, top: `${position.y - 12}px` }}
      className="absolute z-50 pointer-events-none bg-slate-950/95 border border-slate-700/90 rounded-lg p-2.5 shadow-2xl font-mono-lab text-[11px] text-slate-200 min-w-[140px] backdrop-blur"
    >
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
        <span className="font-bold text-cyan-400">
          {bubble.reason ? `REJECTED #${bubble.id || 'C'}` : `BUBBLE #${bubble.id}`}
        </span>
        <span className="text-[10px] text-slate-500 uppercase">{bubble.detectionMethod || 'Hough'}</span>
      </div>

      <div className="space-y-1 text-[10px]">
        <div className="flex justify-between">
          <span className="text-slate-400">Radius:</span>
          <span className="font-semibold text-slate-200">{bubble.radius} px</span>
        </div>

        {bubble.circularity !== undefined && (
          <div className="flex justify-between">
            <span className="text-slate-400">Circularity:</span>
            <span className="font-semibold text-slate-200">{bubble.circularity}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-slate-400">Confidence:</span>
          <span className={`font-semibold ${
            (bubble.confidence || 0) >= 0.75 ? 'text-cyan-400' : (bubble.confidence || 0) >= 0.55 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {(bubble.confidence || 0).toFixed(2)}
          </span>
        </div>

        {bubble.reason && (
          <div className="flex justify-between pt-1 border-t border-slate-800 text-red-400 font-semibold">
            <span>Reason:</span>
            <span>{bubble.reason}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
