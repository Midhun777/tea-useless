import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart2, ShieldCheck, Ruler, Scale, ArrowUpRight, Compass } from 'lucide-react';
import { SizeDistributionChart } from './SizeDistributionChart';

export function ScientificMetricsPanel({ statistics, onCalibrationChange }) {
  const [showCalibration, setShowCalibration] = useState(false);
  const [pxPerMmInput, setPxPerMmInput] = useState('10.0');

  if (!statistics) return null;

  const {
    count = 0,
    radius = {},
    area = {},
    density = {},
    coveragePercent = 0,
    confidence = {},
    sizeDistribution = [],
    nearestNeighbour = null,
    spatial = {},
    calibration = {}
  } = statistics;

  const handleApplyCalibration = () => {
    const val = parseFloat(pxPerMmInput);
    if (!isNaN(val) && val > 0 && onCalibrationChange) {
      onCalibrationChange({
        enabled: true,
        pixelsPerMillimeter: val
      });
    }
  };

  const handleDisableCalibration = () => {
    if (onCalibrationChange) {
      onCalibrationChange({
        enabled: false,
        pixelsPerMillimeter: null
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
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold tracking-wider text-slate-100 uppercase text-xs">
              SCIENTIFIC METRICS & MORPHOLOGY
            </h3>
            <p className="text-[10px] font-sans text-slate-500">
              Quantitative surface bubble density, radius distribution & spatial metrics
            </p>
          </div>
        </div>

        {/* Physical Scale Calibration Toggle */}
        <button
          type="button"
          onClick={() => setShowCalibration(!showCalibration)}
          className={`px-3 py-1.5 rounded border text-[10px] font-semibold flex items-center space-x-1.5 transition-colors ${
            calibration?.enabled
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>{calibration?.enabled ? `CALIBRATED (${calibration.pixelsPerMillimeter} px/mm)` : 'CALIBRATE SCALE'}</span>
        </button>
      </div>

      {/* Optional Physical Scale Calibration Drawer */}
      {showCalibration && (
        <div className="mb-5 p-3.5 bg-slate-900/80 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-200 uppercase">PHYSICAL SCALE CALIBRATION (PX / MM)</span>
            <span className="text-[10px] text-slate-500">Converts pixel measurements to millimeters</span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={pxPerMmInput}
              onChange={(e) => setPxPerMmInput(e.target.value)}
              placeholder="e.g. 10.0"
              className="px-3 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs w-32 focus:outline-none focus:border-cyan-500 font-mono-lab"
            />
            <button
              type="button"
              onClick={handleApplyCalibration}
              className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-xs transition-colors"
            >
              APPLY SCALE
            </button>
            {calibration?.enabled && (
              <button
                type="button"
                onClick={handleDisableCalibration}
                className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-800 rounded text-xs transition-colors"
              >
                RESET TO PIXELS
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 text-left">
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
          <span className="block text-[9px] text-slate-500 uppercase">BUBBLE COUNT</span>
          <span className="text-base font-bold text-cyan-400 block mt-1">{count}</span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
          <span className="block text-[9px] text-slate-500 uppercase">AVG RADIUS</span>
          <span className="text-base font-bold text-slate-100 block mt-1">
            {radius.mean || 0} <span className="text-[10px] font-normal text-slate-500">{radius.unit || 'px'}</span>
          </span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
          <span className="block text-[9px] text-slate-500 uppercase">SURFACE COVERAGE</span>
          <span className="text-base font-bold text-slate-100 block mt-1">{coveragePercent}%</span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
          <span className="block text-[9px] text-slate-500 uppercase">BUBBLE DENSITY</span>
          <span className="text-base font-bold text-slate-100 block mt-1">
            {density.value || 0} <span className="text-[9px] font-normal text-slate-500 block">/ 100k px²</span>
          </span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
          <span className="block text-[9px] text-slate-500 uppercase">NEAREST NEIGHBOUR</span>
          <span className="text-base font-bold text-slate-100 block mt-1">
            {nearestNeighbour ? `${nearestNeighbour.mean} ${nearestNeighbour.unit}` : 'N/A (< 2)'}
          </span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
          <span className="block text-[9px] text-slate-500 uppercase">MEAN CONFIDENCE</span>
          <span className="text-base font-bold text-emerald-400 block mt-1">{confidence.mean || 0}</span>
        </div>
      </div>

      {/* Detailed Technical Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Size Distribution Histogram */}
        <SizeDistributionChart distribution={sizeDistribution} />

        {/* Spatial & Radius Dispersion Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-left font-mono-lab">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="font-bold text-slate-200 uppercase text-[11px] flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>SPATIAL & RADIUS DISPERSION</span>
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Radius Range (Min – Max):</span>
              <span className="font-medium text-slate-200">{radius.min} – {radius.max} {radius.unit}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Radius Median & StdDev:</span>
              <span className="font-medium text-slate-200">{radius.median} {radius.unit} (± {radius.standardDeviation})</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Total Bubble Area:</span>
              <span className="font-medium text-slate-200">{area.total} {area.unit}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Spatial Center of Mass (X, Y):</span>
              <span className="font-medium text-slate-200">({spatial.centerX}, {spatial.centerY})</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-400">Spatial Spread (σX, σY):</span>
              <span className="font-medium text-slate-200">± {spatial.spreadX} px, ± {spatial.spreadY} px</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
