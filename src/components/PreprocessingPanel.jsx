import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, Eye, Zap, Layers, RefreshCw, ChevronRight } from 'lucide-react';

const STAGE_KEYS = ['original', 'resized', 'grayscale', 'blurred', 'enhanced'];

export function PreprocessingPanel({ 
  pipelineResult, 
  config, 
  onConfigChange, 
  isProcessing 
}) {
  const [activeTab, setActiveTab] = useState('enhanced');

  if (!pipelineResult || !pipelineResult.stages) {
    return null;
  }

  const { stages, executionTimeMs } = pipelineResult;
  const activeStage = stages[activeTab] || stages.enhanced || stages.original;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto my-6 bg-slate-950/90 border border-slate-800 rounded-xl p-5 sm:p-6 backdrop-blur shadow-2xl font-mono-lab text-xs text-slate-300 relative overflow-hidden"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800/80 gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold tracking-wider text-slate-100 uppercase text-xs">
              PREPROCESSING PIPELINE INSPECTOR
            </h3>
            <p className="text-[10px] font-sans text-slate-500">
              Noise reduction & edge-preserving morphology stage
            </p>
          </div>
        </div>

        {/* Latency & Processing Status */}
        <div className="flex items-center space-x-3 text-[11px]">
          <div className="flex items-center space-x-1.5 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>LATENCY: <strong className="text-slate-200">{executionTimeMs || 0} ms</strong></span>
          </div>
          {isProcessing && (
            <span className="flex items-center space-x-1 text-cyan-400">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>UPDATING...</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Panel Content: Stage Inspector Tabs & Parameter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Stage Selector Tabs & Canvas Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          
          {/* Stage Tab Buttons */}
          <div className="flex items-center space-x-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800/80 overflow-x-auto">
            {STAGE_KEYS.map((key) => {
              const stage = stages[key];
              if (!stage) return null;
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`px-2.5 py-1.5 rounded text-[10px] font-semibold tracking-wider transition-all duration-150 whitespace-nowrap ${
                    isActive 
                      ? 'bg-cyan-500 text-slate-950 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {stage.name.split(' — ')[1] || stage.id.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Active Stage Preview Canvas Display */}
          <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center p-2 min-h-[300px] max-h-[380px]">
            {/* Alignment ticks */}
            <div className="absolute top-2 left-2 text-cyan-500/40 text-[10px] pointer-events-none">+</div>
            <div className="absolute top-2 right-2 text-cyan-500/40 text-[10px] pointer-events-none">+</div>

            <AnimatePresence mode="wait">
              <motion.img
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={activeStage.dataUrl}
                alt={`Stage preview: ${activeStage.name}`}
                className="max-h-[360px] w-auto max-w-full object-contain rounded border border-slate-800/60"
              />
            </AnimatePresence>

            {/* Stage Title Overlay */}
            <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800/80 px-2.5 py-1 rounded text-[10px] text-cyan-300">
              {activeStage.name}
            </div>
          </div>

          {/* Active Stage Matrix Telemetry Footer */}
          <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-900/40 p-2.5 rounded border border-slate-800/60 text-slate-400">
            <div>
              <span className="text-slate-500 uppercase block">RESOLUTION</span>
              <span className="text-slate-200 font-medium">{activeStage.telemetry?.width} × {activeStage.telemetry?.height}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase block">CHANNELS</span>
              <span className="text-slate-200 font-medium">{activeStage.telemetry?.channels}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase block">TYPE</span>
              <span className="text-slate-200 font-medium truncate block">{activeStage.telemetry?.type?.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Parameter Tuning Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-slate-200 font-bold tracking-wider text-[11px] uppercase border-b border-slate-800/80 pb-2">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>TUNING PARAMETERS</span>
            </div>

            {/* 1. Max Dimension Normalization */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <label className="text-slate-400">MAX DIMENSION</label>
                <span className="text-cyan-400 font-semibold">{config.maxDimension}px</span>
              </div>
              <input
                type="range"
                min="640"
                max="1920"
                step="80"
                value={config.maxDimension}
                onChange={(e) => onConfigChange({ maxDimension: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
              <span className="text-[9px] text-slate-500 block">Aspect-ratio preserved normalization</span>
            </div>

            {/* 2. Gaussian Blur Kernel Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <label className="text-slate-400">GAUSSIAN BLUR KERNEL</label>
                <span className="text-cyan-400 font-semibold">{config.blurKernelSize}×{config.blurKernelSize}</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[1, 3, 5, 7, 9].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => onConfigChange({ blurKernelSize: k })}
                    className={`py-1 rounded text-[10px] font-semibold border ${
                      config.blurKernelSize === k
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {k}×{k}
                  </button>
                ))}
              </div>
              <span className="text-[9px] text-slate-500 block">Reduces texture noise without erasing edges</span>
            </div>

            {/* 3. CLAHE Contrast Enhancement Toggle & Clip Limit */}
            <div className="space-y-2 pt-1 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold text-[11px]">ENABLE CLAHE CONTRAST</label>
                <input
                  type="checkbox"
                  checked={config.enableClahe}
                  onChange={(e) => onConfigChange({ enableClahe: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              {config.enableClahe && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px]">
                    <label className="text-slate-400">CLIP LIMIT</label>
                    <span className="text-cyan-400 font-semibold">{config.claheClipLimit}</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.5"
                    value={config.claheClipLimit}
                    onChange={(e) => onConfigChange({ claheClipLimit: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
                  />
                  <span className="text-[9px] text-slate-500 block">Adaptive histogram equalizing limit</span>
                </div>
              )}
            </div>

          </div>

          {/* Pipeline Flow Summary */}
          <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>PIPELINE SEQUENCE:</span>
            </div>
            <div className="flex items-center space-x-1 overflow-x-auto text-[9px] text-slate-400 pt-0.5">
              <span>RAW</span>
              <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
              <span>NORM</span>
              <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
              <span>GRAY</span>
              <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
              <span>BLUR</span>
              <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
              <span className="text-cyan-400 font-semibold">CLAHE</span>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
