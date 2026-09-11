import React from 'react';
import { FileText, Clock, Target, Ruler } from 'lucide-react';

export function ScanMetadata({ file, telemetry, roi, calibration, timestamp }) {
  const formattedTime = timestamp 
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 font-mono-lab text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center space-x-2">
        <FileText className="w-4 h-4 text-cyan-400" />
        <span className="text-slate-200 font-semibold truncate max-w-[200px]" title={file?.name}>
          {file?.name || 'TEA_SPECIMEN.JPG'}
        </span>
      </div>

      <div className="flex flex-wrap items-center space-x-4 text-[11px] text-slate-400">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>TIME: <strong className="text-slate-300">{formattedTime}</strong></span>
        </div>

        <div className="flex items-center space-x-1">
          <Target className="w-3 h-3 text-slate-500" />
          <span>ROI: <strong className="text-cyan-400 uppercase">{roi?.method || 'AUTO'}</strong></span>
        </div>

        <div className="flex items-center space-x-1">
          <Ruler className="w-3 h-3 text-slate-500" />
          <span>SCALE: <strong className="text-slate-300">{calibration?.enabled ? `${calibration.pixelsPerMillimeter} px/mm` : 'UNCALIBRATED'}</strong></span>
        </div>
      </div>
    </div>
  );
}
