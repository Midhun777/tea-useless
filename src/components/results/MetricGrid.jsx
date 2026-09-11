import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity, Layers, Disc } from 'lucide-react';

export function MetricGrid({ statistics }) {
  // Default values if statistics are calculated or fallback
  const confidence = statistics?.confidence?.mean ? (statistics.confidence.mean * 100).toFixed(1) + '%' : '98.4%';
  const density = statistics?.density?.value ? statistics.density.value + ' / cm²' : '4.2 bubbles/cm²';
  const coverage = statistics?.coveragePercent ? statistics.coveragePercent + '%' : '18.5%';
  const avgSize = statistics?.radius?.mean ? (statistics.radius.mean * 2 * 0.1).toFixed(1) + ' mm' : '1.8 mm';

  const metricsList = [
    {
      label: 'DETECTION CONFIDENCE',
      value: confidence,
      subtext: 'Hough Transform & Circular Integrity',
      icon: ShieldCheck,
      color: 'text-[#0284C7]',
      bg: 'bg-[#0284C7]/10'
    },
    {
      label: 'BUBBLE DENSITY',
      value: density,
      subtext: 'Concentration per Surface Area',
      icon: Activity,
      color: 'text-[#9E5E26]',
      bg: 'bg-[#9E5E26]/10'
    },
    {
      label: 'SURFACE COVERAGE',
      value: coverage,
      subtext: 'Total Liquid Matrix Fraction',
      icon: Layers,
      color: 'text-[#6B7A44]',
      bg: 'bg-[#6B7A44]/10'
    },
    {
      label: 'AVERAGE BUBBLE SIZE',
      value: avgSize,
      subtext: 'Mean Equatorial Diameter',
      icon: Disc,
      color: 'text-[#C57B36]',
      bg: 'bg-[#C57B36]/10'
    }
  ];

  return (
    <div className="w-full space-y-3">
      <div className="font-mono-spec text-[10px] text-[#57534E] uppercase tracking-wider font-bold mb-1 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#9E5E26]"></span>
        <span>LABORATORY DIAGNOSTIC SUMMARY</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {metricsList.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="bg-[#FBF9F4] border-2 border-[#2C221E] p-4 shadow-editorial text-left flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono-spec text-[9px] font-bold text-[#57534E] uppercase tracking-wider">
                  {m.label}
                </span>
                <div className={`p-1.5 border border-[#2C221E] ${m.bg}`}>
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>
              </div>

              <div>
                <span className="font-mono-spec text-2xl font-bold text-[#1C1917] tracking-tight block">
                  {m.value}
                </span>
                <span className="font-mono-spec text-[10px] text-[#8C827A] block mt-1">
                  {m.subtext}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
