import React from 'react';
import { motion } from 'framer-motion';
import { Target, Sliders, RefreshCw, Eye, Edit3, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function RoiInspectorPanel({ 
  roi, 
  maskDataUrl, 
  imgWidth, 
  imgHeight, 
  onRoiChange, 
  onResetAutoRoi 
}) {
  if (!roi || !imgWidth || !imgHeight) {
    return null;
  }

  const isManual = roi.method === 'manual';
  const isUncertain = roi.confidence < 0.55;

  const handleSliderChange = (field, value) => {
    onRoiChange({
      ...roi,
      [field]: parseInt(value, 10),
      method: 'manual',
      confidence: 1.0 // Manual user specification is explicitly set
    });
  };

  const applyPreset = (presetType) => {
    const minDim = Math.min(imgWidth, imgHeight);
    if (presetType === 'center_75') {
      onRoiChange({
        type: 'circle',
        centerX: Math.round(imgWidth / 2),
        centerY: Math.round(imgHeight / 2),
        radius: Math.round(minDim * 0.375),
        confidence: 1.0,
        method: 'manual'
      });
    } else if (presetType === 'full_95') {
      onRoiChange({
        type: 'circle',
        centerX: Math.round(imgWidth / 2),
        centerY: Math.round(imgHeight / 2),
        radius: Math.round(minDim * 0.475),
        confidence: 1.0,
        method: 'manual'
      });
    }
  };

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
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold tracking-wider text-slate-100 uppercase text-xs">
              TEA SURFACE ROI SELECTION
            </h3>
            <p className="text-[10px] font-sans text-slate-500">
              Region of Interest bounds for downstream bubble counting
            </p>
          </div>
        </div>

        {/* Mode & Confidence Badge */}
        <div className="flex items-center space-x-3 text-[11px]">
          <div className={`flex items-center space-x-1.5 px-3 py-1 rounded border font-semibold ${
            isManual 
              ? 'bg-amber-950/80 text-amber-300 border-amber-800' 
              : isUncertain
              ? 'bg-red-950/80 text-red-300 border-red-800'
              : 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
          }`}>
            {isManual ? (
              <>
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>MANUAL ROI</span>
              </>
            ) : isUncertain ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>AUTO UNCERTAIN ({Math.round(roi.confidence * 100)}%)</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>AUTO ROI ({Math.round(roi.confidence * 100)}%)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Controls & Binary Mask Thumbnail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Manual Controls & Presets (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
          
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="font-bold text-slate-200 uppercase text-[11px] flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>ROI BOUNDARY ADJUSTMENT</span>
            </span>
            {isManual && (
              <button
                type="button"
                onClick={onResetAutoRoi}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 underline"
              >
                <RefreshCw className="w-3 h-3" />
                <span>RE-RUN AUTO DETECT</span>
              </button>
            )}
          </div>

          {/* 1. Center X Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <label className="text-slate-400">CENTER X POSITION</label>
              <span className="text-cyan-400 font-semibold">{roi.centerX} px</span>
            </div>
            <input
              type="range"
              min="0"
              max={imgWidth}
              value={roi.centerX}
              onChange={(e) => handleSliderChange('centerX', e.target.value)}
              className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
            />
          </div>

          {/* 2. Center Y Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <label className="text-slate-400">CENTER Y POSITION</label>
              <span className="text-cyan-400 font-semibold">{roi.centerY} px</span>
            </div>
            <input
              type="range"
              min="0"
              max={imgHeight}
              value={roi.centerY}
              onChange={(e) => handleSliderChange('centerY', e.target.value)}
              className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
            />
          </div>

          {/* 3. Radius / Size Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <label className="text-slate-400">SURFACE RADIUS</label>
              <span className="text-cyan-400 font-semibold">{roi.radius} px</span>
            </div>
            <input
              type="range"
              min="30"
              max={Math.round(Math.min(imgWidth, imgHeight) / 2)}
              value={roi.radius}
              onChange={(e) => handleSliderChange('radius', e.target.value)}
              className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
            />
          </div>

          {/* Quick Presets */}
          <div className="pt-2 flex items-center space-x-2">
            <span className="text-[10px] text-slate-500 uppercase">PRESETS:</span>
            <button
              type="button"
              onClick={() => applyPreset('center_75')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[10px] text-slate-300 transition-colors"
            >
              CENTER CUP (75%)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('full_95')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[10px] text-slate-300 transition-colors"
            >
              FULL FRAME (95%)
            </button>
          </div>

        </div>

        {/* Right Column: Binary Mask & Heuristics (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
          <div>
            <div className="flex items-center space-x-1.5 text-slate-200 font-bold tracking-wider text-[11px] uppercase border-b border-slate-800/80 pb-2 mb-3">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>BINARY MASK PREVIEW (1 = PROCESS)</span>
            </div>

            {/* Mask Thumbnail */}
            <div className="relative rounded bg-slate-950 border border-slate-800 flex items-center justify-center p-1 overflow-hidden h-36">
              {maskDataUrl ? (
                <img 
                  src={maskDataUrl} 
                  alt="Binary ROI mask preview" 
                  className="h-full w-auto object-contain rounded border border-slate-800/80" 
                />
              ) : (
                <span className="text-slate-600 text-[10px]">GENERATING MASK...</span>
              )}
            </div>
          </div>

          {/* Heuristic Scores */}
          {roi.scoreDetails && (
            <div className="grid grid-cols-3 gap-2 text-[9px] bg-slate-950/60 p-2 rounded border border-slate-800/60 text-slate-400">
              <div>
                <span className="text-slate-500 block uppercase">SIZE FIT</span>
                <span className="text-slate-200 font-medium">{Math.round((roi.scoreDetails.sizeScore || 0) * 100)}%</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase">CENTER FIT</span>
                <span className="text-slate-200 font-medium">{Math.round((roi.scoreDetails.centerScore || 0) * 100)}%</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase">BOUNDS</span>
                <span className="text-slate-200 font-medium">{Math.round((roi.scoreDetails.boundaryScore || 0) * 100)}%</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
