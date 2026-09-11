import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Eye, FileSpreadsheet } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'IMAGE ACQUISITION',
    desc: 'Capture a clear, top-down tea surface photograph.',
    icon: Camera
  },
  {
    step: '02',
    title: 'BUBBLE DETECTION',
    desc: 'Computer vision will identify visible surface bubbles.',
    icon: Eye
  },
  {
    step: '03',
    title: 'SCIENTIFICALLY USELESS RESULTS',
    desc: 'Receive an unnecessarily detailed bubble report.',
    icon: FileSpreadsheet
  }
];

export function TechnicalInfo() {
  return (
    <section className="w-full max-w-4xl mx-auto my-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STEPS.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 text-left relative overflow-hidden group hover:border-slate-700 transition-colors duration-200"
            >
              {/* Step number badge */}
              <div className="flex items-center justify-between font-mono-lab text-xs mb-3">
                <span className="text-cyan-400 font-semibold">{item.step} —</span>
                <Icon className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors duration-200" />
              </div>

              {/* Title */}
              <h3 className="text-xs font-bold font-mono-lab text-slate-200 tracking-wider uppercase mb-1.5">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {item.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
