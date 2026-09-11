import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sliders, RefreshCw, CircleDot, Zap, Filter, Eye, CheckCircle2, XCircle, Copy } from 'lucide-react';

export function BubbleTuningPanel({ 
  bubbleResult, 
  houghConfig, 
  filterConfig, 
  onHoughConfigChange, 
  onFilterConfigChange, 
  vizMode, 
  onVizModeChange, 
  onRescan, 
  isProcessing 
}) {
  const [activeTab, setActiveTab] = useState('hough'); // 'hough' | 'filter'

  if (!bubbleResult) return null;

  const { 
    rawCandidateCount = 0, 
    rejectedCandidateCount = 0, 
    duplicateCount = 0, 
    bubbleCount = 0, 
    processingTimeMs = 0 
  } = bubbleResult;

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
            <CircleDot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold tracking-wider text-slate-100 uppercase text-xs">
              BUBBLE CANDIDATE FILTERING & DEDUPLICATION (V2)
            </h3>
            <p className="text-[10px] font-sans text-slate-500">
              Heuristic feature validation, rejection logging & spatial NMS
            </p>
          </div>
        </div>

        {/* Latency Badge */}
        <div className="flex items-center space-x-2 text-[11px]">
          <div className="flex items-center space-x-1.5 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>TIME: <strong className="text-slate-200">{processingTimeMs} ms</strong></span>
          </div>
        </div>
      </div>

      {/* Metric Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 text-left">
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
          <span className="block text-[10px] text-slate-500 uppercase flex items-center space-x-1">
            <CircleDot className="w-3 h-3 text-purple-400" />
            <span>RAW HOUGH</span>
          </span>
          <span className="text-sm font-bold text-slate-100 block mt-1">
            {rawCandidateCount} <span className="text-[10px] font-normal text-slate-500">candidates</span>
          </span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
          <span className="block text-[10px] text-slate-500 uppercase flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
            <span>ACCEPTED BUBBLES</span>
          </span>
          <span className="text-sm font-bold text-cyan-400 block mt-1">
            {bubbleCount} <span className="text-[10px] font-normal text-slate-500">verified</span>
          </span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
          <span className="block text-[10px] text-slate-500 uppercase flex items-center space-x-1">
            <XCircle className="w-3 h-3 text-red-400" />
            <span>REJECTED</span>
          </span>
          <span className="text-sm font-bold text-red-300 block mt-1">
            {rejectedCandidateCount} <span className="text-[10px] font-normal text-slate-500">filtered</span>
          </span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
          <span className="block text-[10px] text-slate-500 uppercase flex items-center space-x-1">
            <Copy className="w-3 h-3 text-amber-400" />
            <span>DUPLICATES</span>
          </span>
          <span className="text-sm font-bold text-amber-300 block mt-1">
            {duplicateCount} <span className="text-[10px] font-normal text-slate-500">merged</span>
          </span>
        </div>
      </div>

      {/* Developer Visualization Mode Switcher */}
      <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 mb-5 overflow-x-auto">
        <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center space-x-1.5 px-2">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>VISUAL OVERLAY MODE:</span>
        </span>
        <div className="flex items-center space-x-1">
          {[
            { id: 'ACCEPTED', label: 'FINAL BUBBLES' },
            { id: 'RAW', label: 'RAW HOUGH' },
            { id: 'REJECTED', label: 'REJECTED' },
            { id: 'CONFIDENCE', label: 'CONFIDENCE MAP' }
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => onVizModeChange(mode.id)}
              className={`px-3 py-1 rounded text-[10px] font-semibold tracking-wider transition-all duration-150 whitespace-nowrap ${
                vizMode === mode.id 
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tuning Controls Sub-Panel (Hough vs Filter Thresholds) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('hough')}
              className={`px-3 py-1 rounded text-[11px] font-bold tracking-wider ${
                activeTab === 'hough' ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              HOUGH PARAMETERS
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('filter')}
              className={`px-3 py-1 rounded text-[11px] font-bold tracking-wider ${
                activeTab === 'filter' ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              FILTER THRESHOLDS
            </button>
          </div>

          <button
            type="button"
            onClick={onRescan}
            disabled={isProcessing}
            className="py-1.5 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 font-mono-lab font-bold rounded text-[11px] transition-all duration-200 shadow-sm flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'SCANNING...' : 'RE-SCAN BUBBLES'}</span>
          </button>
        </div>

        {/* Tab 1: Hough Parameters */}
        {activeTab === 'hough' && houghConfig && (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <label className="text-slate-400">MIN RADIUS</label>
                <span className="text-cyan-400 font-semibold">{houghConfig.minRadius}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={houghConfig.minRadius}
                onChange={(e) => onHoughConfigChange({ minRadius: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <label className="text-slate-400">MAX RADIUS</label>
                <span className="text-cyan-400 font-semibold">{houghConfig.maxRadius}px</span>
              </div>
              <input
                type="range"
                min="15"
                max="100"
                step="1"
                value={houghConfig.maxRadius}
                onChange={(e) => onHoughConfigChange({ maxRadius: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <label className="text-slate-400">MIN DISTANCE</label>
                <span className="text-cyan-400 font-semibold">{houghConfig.minDist}px</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                step="1"
                value={houghConfig.minDist}
                onChange={(e) => onHoughConfigChange({ minDist: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <label className="text-slate-400">PARAM1 (CANNY)</label>
                <span className="text-cyan-400 font-semibold">{houghConfig.param1}</span>
              </div>
              <input
                type="range"
                min="30"
                max="250"
                step="5"
                value={houghConfig.param1}
                onChange={(e) => onHoughConfigChange({ param1: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <label className="text-slate-400">PARAM2 (ACCUM)</label>
                <span className="text-cyan-400 font-semibold">{houghConfig.param2}</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={houghConfig.param2}
                onChange={(e) => onHoughConfigChange({ param2: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Filter Thresholds */}
        {activeTab === 'filter' && filterConfig && (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <label className="text-slate-400">MIN CONFIDENCE</label>
                <span className="text-cyan-400 font-semibold">{filterConfig.minimumConfidence}</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.90"
                step="0.05"
                value={filterConfig.minimumConfidence}
                onChange={(e) => onFilterConfigChange({ minimumConfidence: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <label className="text-slate-400">MIN CIRCULARITY</label>
                <span className="text-cyan-400 font-semibold">{filterConfig.minimumCircularity}</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.85"
                step="0.05"
                value={filterConfig.minimumCircularity}
                onChange={(e) => onFilterConfigChange({ minimumCircularity: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <label className="text-slate-400">MIN ROI COVERAGE</label>
                <span className="text-cyan-400 font-semibold">{Math.round(filterConfig.minimumROICoverage * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.40"
                max="0.95"
                step="0.05"
                value={filterConfig.minimumROICoverage}
                onChange={(e) => onFilterConfigChange({ minimumROICoverage: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <label className="text-slate-400">LOCAL CONTRAST</label>
                <span className="text-cyan-400 font-semibold">{filterConfig.minimumLocalContrast}</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="25.0"
                step="1.0"
                value={filterConfig.minimumLocalContrast}
                onChange={(e) => onFilterConfigChange({ minimumLocalContrast: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <label className="text-slate-400">NMS DUP FACTOR</label>
                <span className="text-cyan-400 font-semibold">{filterConfig.duplicateDistanceFactor}</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="1.20"
                step="0.05"
                value={filterConfig.duplicateDistanceFactor}
                onChange={(e) => onFilterConfigChange({ duplicateDistanceFactor: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
              />
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
}
