import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

export function ZoomControls({ zoom, onZoomIn, onZoomOut, onResetZoom }) {
  return (
    <div className="flex items-center space-x-1 bg-slate-950/90 border border-slate-800 rounded-lg p-1 text-xs font-mono-lab backdrop-blur z-40">
      <button
        type="button"
        onClick={onZoomOut}
        disabled={zoom <= 0.8}
        className="p-1.5 text-slate-400 hover:text-slate-100 disabled:opacity-40 rounded hover:bg-slate-900 transition-colors"
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      <span className="px-2 text-[10px] text-cyan-400 font-semibold min-w-[42px] text-center select-none">
        {Math.round(zoom * 100)}%
      </span>

      <button
        type="button"
        onClick={onZoomIn}
        disabled={zoom >= 3.0}
        className="p-1.5 text-slate-400 hover:text-slate-100 disabled:opacity-40 rounded hover:bg-slate-900 transition-colors"
        title="Zoom In"
        aria-label="Zoom In"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={onResetZoom}
        className="p-1.5 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-900 transition-colors border-l border-slate-800 ml-1 pl-2"
        title="Reset Zoom & Pan"
        aria-label="Reset Zoom and Pan"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
