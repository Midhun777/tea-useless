import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Terminal } from 'lucide-react';

export function TechnicalAnalysis({ telemetry, roi, bubbleResult }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!telemetry || !bubbleResult) return null;

  const {
    rawCandidateCount = 0,
    rejectedCandidateCount = 0,
    duplicateCount = 0,
    bubbleCount = 0,
    processingTimeMs = 0
  } = bubbleResult;

  const roiMethod = roi ? (roi.method === 'automatic' || roi.method === 'AUTO' ? 'Automatic' : 'Manual') : 'Automatic';
  const roiConfidence = roi ? (roi.confidence !== undefined ? roi.confidence.toFixed(2) : '1.00') : '0.00';

  return (
    <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl font-mono-lab text-xs overflow-hidden backdrop-blur shadow-lg">
      {/* Collapsible Header Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-900/60 transition-colors text-left focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
      >
        <div className="flex items-center space-x-2 text-slate-200 font-bold uppercase text-xs">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>TECHNICAL ANALYSIS</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
          <span>{isOpen ? 'HIDE DETAILS' : 'SHOW DETAILS'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Collapsible Diagnostics Grid */}
      {isOpen && (
        <div className="p-4 pt-0 border-t border-slate-800/80 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
              <span className="block text-[9px] text-slate-500 uppercase font-semibold">Image</span>
              <span className="font-semibold text-slate-200 block mt-1">
                {telemetry.width} × {telemetry.height}
              </span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
              <span className="block text-[9px] text-slate-500 uppercase font-semibold">ROI</span>
              <span className="font-semibold text-cyan-400 block mt-1">
                {roiMethod}
              </span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
              <span className="block text-[9px] text-slate-500 uppercase font-semibold">ROI confidence</span>
              <span className="font-semibold text-slate-200 block mt-1">
                {roiConfidence}
              </span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
              <span className="block text-[9px] text-slate-500 uppercase font-semibold">Raw candidates</span>
              <span className="font-semibold text-purple-300 block mt-1">
                {rawCandidateCount}
              </span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
              <span className="block text-[9px] text-slate-500 uppercase font-semibold">Rejected</span>
              <span className="font-semibold text-red-400 block mt-1">
                {rejectedCandidateCount}
              </span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
              <span className="block text-[9px] text-slate-500 uppercase font-semibold">Duplicates</span>
              <span className="font-semibold text-amber-400 block mt-1">
                {duplicateCount}
              </span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
              <span className="block text-[9px] text-slate-500 uppercase font-semibold">Final bubbles</span>
              <span className="font-bold text-cyan-400 block mt-1">
                {bubbleCount}
              </span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
              <span className="block text-[9px] text-slate-500 uppercase font-semibold">Detection time</span>
              <span className="font-semibold text-amber-300 block mt-1">
                {processingTimeMs} ms
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
