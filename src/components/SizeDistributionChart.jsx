import React from 'react';

export function SizeDistributionChart({ distribution = [] }) {
  if (!distribution || distribution.length === 0) {
    return (
      <div className="p-4 text-center text-[10px] text-slate-500 font-mono-lab">
        NO BUBBLE SIZE DISTRIBUTION DATA AVAILABLE
      </div>
    );
  }

  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 font-mono-lab text-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <span className="font-bold text-slate-200 uppercase text-[11px]">
          BUBBLE SIZE DISTRIBUTION (HISTOGRAM)
        </span>
        <span className="text-[10px] text-slate-500">RADIUS BINS</span>
      </div>

      {/* SVG / Bar Chart Representation */}
      <div className="space-y-2.5">
        {distribution.map((bin, idx) => {
          const percentage = Math.round((bin.count / maxCount) * 100);

          return (
            <div key={bin.range || idx} className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{bin.range}</span>
                <span className="font-semibold text-slate-200">{bin.count} bubbles</span>
              </div>

              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80 flex">
                <div
                  style={{ width: `${percentage}%` }}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full h-full transition-all duration-300 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
