import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, ScanLine, FileCode, CheckCircle2 } from 'lucide-react';

export function UploaderPlaceholder() {
  return (
    <div className="relative w-full max-w-3xl mx-auto my-8">
      {/* Corner crosshairs / Scientific alignment reticles */}
      <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-500/60 pointer-events-none" />
      <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500/60 pointer-events-none" />
      <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500/60 pointer-events-none" />
      <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-500/60 pointer-events-none" />

      {/* Main Container Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-8 sm:p-12 text-center relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300"
      >
        {/* Background grid texture */}
        <div className="absolute inset-0 bg-lab-grid opacity-30 pointer-events-none" />

        {/* Specimen Header Badge */}
        <div className="inline-flex items-center space-x-2 bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-full text-xs font-mono-lab text-slate-400 mb-6">
          <ScanLine className="w-3.5 h-3.5 text-cyan-400" />
          <span>SPECIMEN INPUT STAGE</span>
        </div>

        {/* Drag & Drop Target Area */}
        <div className="border-2 border-dashed border-slate-800 group-hover:border-cyan-500/40 rounded-lg p-8 sm:p-10 transition-colors duration-300 bg-slate-950/40 flex flex-col items-center justify-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all duration-300 shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
              Upload Tea Sample Image
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans leading-relaxed">
              Drag and drop high-resolution tea beverage image for automated surface bubble morphology analysis.
            </p>
          </div>

          <div className="pt-2">
            <button 
              type="button" 
              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-lab rounded border border-slate-700 hover:border-slate-600 transition-colors duration-200 cursor-not-allowed opacity-90"
              disabled
            >
              <span>SELECT FILE (DISABLED IN PREVIEW)</span>
            </button>
          </div>
        </div>

        {/* Operational Specs Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-left text-[11px] font-mono-lab text-slate-500">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3 h-3 text-slate-600" />
            <span>FORMAT: PNG, JPG, WEBP</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3 h-3 text-slate-600" />
            <span>MAX DIMENSION: 4096px</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3 h-3 text-slate-600" />
            <span>OPTICS: BUBBLE COUNTER</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
