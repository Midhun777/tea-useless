import React from 'react';
import { Eye, Layers, Tag, Target, CircleDot, XCircle } from 'lucide-react';

export function VisualizationControls({
  vizMode,
  onVizModeChange,
  showRoi,
  onToggleRoi,
  showLabels,
  onToggleLabels
}) {
  return (
    <div className="flex flex-wrap items-center justify-between bg-slate-950/90 border border-slate-800 rounded-lg p-2 gap-2 text-xs font-mono-lab backdrop-blur">
      {/* Layer View Mode Toggles */}
      <div className="flex items-center space-x-1 overflow-x-auto">
        <span className="text-[10px] text-slate-500 uppercase px-2 flex items-center space-x-1">
          <Layers className="w-3 h-3 text-cyan-400" />
          <span>LAYER:</span>
        </span>

        <button
          type="button"
          onClick={() => onVizModeChange('ACCEPTED')}
          className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
            vizMode === 'ACCEPTED'
              ? 'bg-cyan-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          FINAL BUBBLES
        </button>

        <button
          type="button"
          onClick={() => onVizModeChange('RAW')}
          className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
            vizMode === 'RAW'
              ? 'bg-purple-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          RAW HOUGH
        </button>

        <button
          type="button"
          onClick={() => onVizModeChange('REJECTED')}
          className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
            vizMode === 'REJECTED'
              ? 'bg-red-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          REJECTED
        </button>
      </div>

      {/* Feature Visibility Switches */}
      <div className="flex items-center space-x-2 text-[10px]">
        <button
          type="button"
          onClick={onToggleRoi}
          className={`px-2 py-1 rounded border flex items-center space-x-1 transition-colors ${
            showRoi
              ? 'bg-slate-900 text-cyan-400 border-cyan-500/50'
              : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
          }`}
        >
          <Target className="w-3 h-3" />
          <span>ROI RING</span>
        </button>

        <button
          type="button"
          onClick={onToggleLabels}
          className={`px-2 py-1 rounded border flex items-center space-x-1 transition-colors ${
            showLabels
              ? 'bg-slate-900 text-cyan-400 border-cyan-500/50'
              : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
          }`}
        >
          <Tag className="w-3 h-3" />
          <span>LABELS</span>
        </button>
      </div>
    </div>
  );
}
