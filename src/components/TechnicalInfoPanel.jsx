import React from 'react';
import { Cpu, Activity, Zap, CheckCircle2, Target, CircleDot, Copy, XCircle } from 'lucide-react';

export function TechnicalInfoPanel({ telemetry, roi, bubbleResult }) {
  if (!telemetry || !bubbleResult) return null;

  const {
    rawCandidateCount = 0,
    rejectedCandidateCount = 0,
    duplicateCount = 0,
    bubbleCount = 0,
    processingTimeMs = 0
  } = bubbleResult;

  return (
    <div className="w-full max-w-4xl mx-auto my-4 bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono-lab text-xs backdrop-blur">
      <div className="flex items-center space-x-2 text-slate-300 font-bold uppercase tracking-wider text-[11px] pb-3 mb-3 border-b border-slate-800/80">
        <Activity className="w-4 h-4 text-cyan-400" />
        <span>SPECIMEN ANALYSIS SUMMARY DIAGNOSTICS</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-left">
        <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
          <span className="block text-[9px] text-slate-500 uppercase">IMAGE RESOLUTION</span>
          <span className="font-semibold text-slate-200 block mt-0.5">
            {telemetry.width} × {telemetry.height}
          </span>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
          <span className="block text-[9px] text-slate-500 uppercase">ROI MODE</span>
          <span className="font-semibold text-cyan-400 block mt-0.5 uppercase">
            {roi ? `${roi.method} (${Math.round((roi.confidence || 0) * 100)}%)` : 'NONE'}
          </span>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
          <span className="block text-[9px] text-slate-500 uppercase">RAW CANDIDATES</span>
          <span className="font-semibold text-purple-300 block mt-0.5">
            {rawCandidateCount}
          </span>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
          <span className="block text-[9px] text-slate-500 uppercase">REJECTED</span>
          <span className="font-semibold text-red-400 block mt-0.5">
            {rejectedCandidateCount}
          </span>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
          <span className="block text-[9px] text-slate-500 uppercase">DUPLICATES</span>
          <span className="font-semibold text-amber-400 block mt-0.5">
            {duplicateCount}
          </span>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
          <span className="block text-[9px] text-slate-500 uppercase">FINAL BUBBLES</span>
          <span className="font-bold text-cyan-400 block mt-0.5">
            {bubbleCount}
          </span>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
          <span className="block text-[9px] text-slate-500 uppercase">LATENCY</span>
          <span className="font-semibold text-amber-300 block mt-0.5">
            {processingTimeMs} ms
          </span>
        </div>
      </div>
    </div>
  );
}
