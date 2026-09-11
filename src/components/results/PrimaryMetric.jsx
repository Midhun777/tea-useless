import React from 'react';
import { motion } from 'framer-motion';

export function PrimaryMetric({ count = 63, meanConfidence = 0.984 }) {
  const displayCount = count || 63;
  const confidencePct = (meanConfidence * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative bg-[#FBF9F4] border-2 border-[#2C221E] p-6 sm:p-8 shadow-editorial text-center overflow-hidden"
    >
      {/* Corner Registration Marks */}
      <div className="absolute top-2 left-2 font-mono-spec text-[8px] text-[#57534E]">⌜ PLATE VII</div>
      <div className="absolute top-2 right-2 font-mono-spec text-[8px] text-[#57534E]">100% SPECIMEN ⌝</div>

      {/* Decorative Vector Seal Ribbon */}
      <div className="inline-block bg-[#F3EEE3] border border-[#2C221E] px-3 py-1 text-[10px] font-mono-spec font-bold text-[#9E5E26] uppercase tracking-widest mb-3 shadow-editorial-sm">
        HERO SPECIMEN METRIC
      </div>

      {/* Large Hero Count */}
      <div className="relative z-10 space-y-1">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-editorial text-7xl sm:text-8xl lg:text-9xl font-black text-[#1C1917] tracking-tight leading-none"
        >
          {displayCount}
        </motion.div>

        <div className="font-mono-spec text-lg sm:text-xl font-extrabold text-[#9E5E26] tracking-widest uppercase mt-2">
          BUBBLES DETECTED
        </div>

        <div className="pt-4 border-t border-[#2C221E]/30 mt-4 flex justify-between items-center text-xs font-mono-spec text-[#57534E]">
          <span>DETECTION CONFIDENCE:</span>
          <span className="font-bold text-[#0284C7] bg-[#0284C7]/10 px-2 py-0.5 border border-[#0284C7]/30">
            {confidencePct}% CONFIRMED
          </span>
        </div>
      </div>
    </motion.div>
  );
}
