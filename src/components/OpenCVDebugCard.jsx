import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, CheckCircle2, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

export function OpenCVDebugCard({ status, telemetry, error, onRetry }) {
  const getStatusBadge = () => {
    switch (status) {
      case 'READY':
        return (
          <span className="inline-flex items-center space-x-1.5 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>READY</span>
          </span>
        );
      case 'LOADING':
        return (
          <span className="inline-flex items-center space-x-1.5 text-amber-400 font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>INITIALIZING ENGINE...</span>
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center space-x-1.5 text-red-400 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>FAILED</span>
          </span>
        );
      default:
        return <span className="text-slate-500">IDLE</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto my-4 bg-slate-950/90 border border-slate-800 rounded-xl p-5 font-mono-lab text-xs shadow-lg relative overflow-hidden"
    >
      {/* Background Reticle Pattern */}
      <div className="absolute top-0 right-0 p-3 opacity-10 text-cyan-400 select-none pointer-events-none">
        <Cpu className="w-24 h-24" />
      </div>

      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2 text-slate-300">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="font-bold tracking-wider uppercase text-slate-200">OPENCV.JS DIAGNOSTICS</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-[11px] bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            STATUS: {getStatusBadge()}
          </div>
          {status === 'ERROR' && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-2.5 py-1 bg-red-900/40 hover:bg-red-900/70 text-red-200 border border-red-800 rounded text-[11px] flex items-center space-x-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3 text-red-300" />
              <span>RETRY</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-950/50 border border-red-800/80 rounded flex items-center justify-between gap-3 text-red-300">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3 py-1 bg-red-900/60 hover:bg-red-800/80 text-red-100 rounded text-xs font-semibold shrink-0 transition-colors"
            >
              RELOAD OPENCV ENGINE
            </button>
          )}
        </div>
      )}

      {/* Matrix Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
        <div className="bg-slate-900/60 p-3 rounded border border-slate-800/80">
          <span className="block text-[10px] text-slate-500 uppercase">IMAGE MATRIX</span>
          <span className="font-semibold text-slate-200 block mt-1">
            {telemetry ? `${telemetry.width} × ${telemetry.height}` : 'NO MATRIX'}
          </span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded border border-slate-800/80">
          <span className="block text-[10px] text-slate-500 uppercase">CHANNELS</span>
          <span className="font-semibold text-slate-200 block mt-1">
            {telemetry ? `${telemetry.channels} (RGBA)` : '—'}
          </span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded border border-slate-800/80">
          <span className="block text-[10px] text-slate-500 uppercase">MATRIX TYPE</span>
          <span className="font-semibold text-slate-200 block mt-1 truncate" title={telemetry?.type}>
            {telemetry ? telemetry.type.split(' ')[0] : '—'}
          </span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded border border-slate-800/80">
          <span className="block text-[10px] text-slate-500 uppercase">WASM MEMORY</span>
          <span className="font-semibold text-emerald-400 block mt-1">
            {telemetry ? 'SAFE (RELEASED)' : 'IDLE'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
