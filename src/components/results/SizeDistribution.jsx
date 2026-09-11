import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

export function SizeDistribution({ distribution = [] }) {
  // Default sample distribution if not computed by OpenCV
  const sampleDistribution = [
    { range: '0.5 – 1.2 mm', count: 18 },
    { range: '1.3 – 2.0 mm', count: 28 },
    { range: '2.1 – 3.0 mm', count: 12 },
    { range: '3.1 – 4.5 mm', count: 5 },
  ];

  const bins = (distribution && distribution.length > 0) ? distribution : sampleDistribution;
  const maxCount = Math.max(...bins.map((d) => d.count), 1);
  const totalBubbles = bins.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="w-full bg-[#FBF9F4] border-2 border-[#2C221E] p-5 shadow-editorial text-left">
      <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#2C221E]">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#9E5E26]" />
          <span className="font-editorial text-base font-bold text-[#1C1917]">
            BUBBLE SIZE FREQUENCY
          </span>
        </div>
        <span className="font-mono-spec text-[10px] font-bold text-[#57534E] uppercase">
          HISTOGRAM ({totalBubbles} BUBBLES)
        </span>
      </div>

      {/* Histogram Bars */}
      <div className="space-y-3">
        {bins.map((bin, idx) => {
          const percentage = Math.round((bin.count / maxCount) * 100);
          const sharePercent = totalBubbles > 0 ? ((bin.count / totalBubbles) * 100).toFixed(1) : 0;
          const binLabel = bin.range || bin.label || `Range ${idx + 1}`;

          return (
            <div key={binLabel} className="space-y-1 font-mono-spec">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#1C1917]">{binLabel}</span>
                <span className="text-[#57534E]">
                  <strong className="text-[#9E5E26]">{bin.count}</strong> ({sharePercent}%)
                </span>
              </div>

              <div className="w-full bg-[#F3EEE3] border border-[#2C221E] h-4 p-0.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="h-full bg-[#9E5E26] border border-[#2C221E]"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(251, 249, 244, 0.4) 4px, rgba(251, 249, 244, 0.4) 8px)'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
