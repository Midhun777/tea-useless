import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CircleDot, AlertTriangle, ShieldCheck, Activity, Target } from 'lucide-react';

export function BubbleInspectionPanel({ selectedBubble, onClose }) {
  if (!selectedBubble) return null;

  const isRejected = !!selectedBubble.reason;
  const confidence = selectedBubble.confidence || 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.25 }}
        className="w-full sm:w-80 bg-slate-950/95 border border-slate-800 rounded-xl p-5 font-mono-lab text-xs shadow-2xl backdrop-blur relative overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 rounded flex items-center justify-center ${
              isRejected ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
            }`}>
              <CircleDot className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-100 uppercase text-xs tracking-wider">
              BUBBLE AUTOPSY
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-200 rounded hover:bg-slate-900 transition-colors"
            aria-label="Close inspection panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bubble Identification Badge */}
        <div className={`p-3 rounded-lg border mb-4 ${
          isRejected 
            ? 'bg-red-950/40 border-red-900/60 text-red-300' 
            : 'bg-slate-900/80 border-slate-800 text-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">
              {isRejected ? `REJECTED CANDIDATE #${selectedBubble.id}` : `BUBBLE SPECIMEN #${selectedBubble.id}`}
            </span>
            {isRejected ? (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            )}
          </div>
          {isRejected && (
            <div className="mt-1 text-[11px] text-red-400 font-semibold">
              Rejection Reason: <span className="uppercase">{selectedBubble.reason}</span>
            </div>
          )}
        </div>

        {/* Real Candidate Technical Metrics Grid */}
        <div className="space-y-2.5 text-[11px]">
          <div className="flex justify-between p-2 bg-slate-900/40 rounded border border-slate-800/60">
            <span className="text-slate-400">Position (X, Y)</span>
            <span className="font-semibold text-slate-200">
              x: {selectedBubble.x}, y: {selectedBubble.y}
            </span>
          </div>

          <div className="flex justify-between p-2 bg-slate-900/40 rounded border border-slate-800/60">
            <span className="text-slate-400">Radius</span>
            <span className="font-semibold text-slate-200">{selectedBubble.radius} px</span>
          </div>

          <div className="flex justify-between p-2 bg-slate-900/40 rounded border border-slate-800/60">
            <span className="text-slate-400">Surface Area</span>
            <span className="font-semibold text-slate-200">
              {selectedBubble.area ? `${selectedBubble.area} px²` : `${Math.round(Math.PI * selectedBubble.radius * selectedBubble.radius)} px²`}
            </span>
          </div>

          {selectedBubble.circularity !== undefined && (
            <div className="flex justify-between p-2 bg-slate-900/40 rounded border border-slate-800/60">
              <span className="text-slate-400">Circularity (4πA/P²)</span>
              <span className="font-semibold text-slate-200">{selectedBubble.circularity}</span>
            </div>
          )}

          {selectedBubble.localContrast !== undefined && (
            <div className="flex justify-between p-2 bg-slate-900/40 rounded border border-slate-800/60">
              <span className="text-slate-400">Local Delta Contrast</span>
              <span className="font-semibold text-slate-200">{selectedBubble.localContrast}</span>
            </div>
          )}

          {selectedBubble.roiCoverage !== undefined && (
            <div className="flex justify-between p-2 bg-slate-900/40 rounded border border-slate-800/60">
              <span className="text-slate-400">ROI Coverage</span>
              <span className="font-semibold text-slate-200">{Math.round(selectedBubble.roiCoverage * 100)}%</span>
            </div>
          )}

          <div className="flex justify-between p-2 bg-slate-900/40 rounded border border-slate-800/60">
            <span className="text-slate-400">Heuristic Confidence</span>
            <span className={`font-semibold ${
              confidence >= 0.75 ? 'text-cyan-400' : confidence >= 0.55 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {confidence.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between p-2 bg-slate-900/40 rounded border border-slate-800/60">
            <span className="text-slate-400">Detection Method</span>
            <span className="font-semibold text-slate-200 uppercase">{selectedBubble.detectionMethod || 'Hough'}</span>
          </div>
        </div>

        {/* Dismiss Button */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded text-xs font-semibold transition-colors"
          >
            DESELECT CANDIDATE
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
