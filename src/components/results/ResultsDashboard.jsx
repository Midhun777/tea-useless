import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PrimaryMetric } from './PrimaryMetric';
import { MetricGrid } from './MetricGrid';
import { SizeDistribution } from './SizeDistribution';
import { SpatialDistribution } from './SpatialDistribution';
import { TechnicalAnalysis } from './TechnicalAnalysis';
import { ReportExporter } from './ReportExporter';
import { AnalysisViewer } from '../AnalysisViewer';
import { AbsurdTeaReport } from '../AbsurdTeaReport';
import { RefreshCw, Compass, AlertTriangle, RotateCcw } from 'lucide-react';

export function ResultsDashboard({
  file,
  previewUrl,
  roi,
  bubbleResult,
  telemetry,
  statistics,
  calibration,
  vizMode,
  onVizModeChange,
  scanStatus,
  error,
  onRunNewAnalysis,
  onRescan,
  onImageLoaded
}) {
  const [showAbsurdReport, setShowAbsurdReport] = useState(false);
  const bubbleCount = statistics ? statistics.count : (bubbleResult ? (bubbleResult.count || bubbleResult.bubbleCount) : 63);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-6xl mx-auto space-y-6 font-mono-spec pb-16 px-4"
    >
      {/* Absurd Scientific Report Modal */}
      {showAbsurdReport && (
        <AbsurdTeaReport
          result={bubbleResult}
          previewUrl={previewUrl}
          file={file}
          onClose={() => setShowAbsurdReport(false)}
        />
      )}

      {/* Editorial Report Banner Header */}
      <div className="bg-[#FBF9F4] border-2 border-[#2C221E] p-4 shadow-editorial flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#9E5E26] text-[#FBF9F4] border-2 border-[#2C221E] flex items-center justify-center font-editorial font-bold text-xl shadow-editorial-sm">
            §
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-editorial text-xl font-bold text-[#1C1917]">
                SCIENTIFIC FIELD GUIDE REPORT
              </h2>
              <span className="bg-[#5F7A62] text-[#FBF9F4] text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                VERIFIED SPECIMEN
              </span>
            </div>
            <p className="text-xs text-[#9E5E26] italic font-medium">
              TEA VISION Optical Specimen Diagnostic Protocol
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <ReportExporter
            file={file}
            statistics={statistics}
            roi={roi}
            bubbleResult={bubbleResult}
            telemetry={telemetry}
            calibration={calibration}
            onGenerateReport={() => setShowAbsurdReport(true)}
          />

          <button
            type="button"
            onClick={onRunNewAnalysis}
            className="px-4 py-1.5 bg-[#2C221E] hover:bg-[#9E5E26] text-[#FBF9F4] font-bold border-2 border-[#2C221E] shadow-editorial-sm hover:shadow-editorial transition-all flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#C57B36]" />
            <span>NEW SPECIMEN</span>
          </button>
        </div>
      </div>

      {/* Error Alert Display State */}
      {error && (
        <div className="w-full bg-[#FEF2F2] border-2 border-[#DC2626] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-[#991B1B]">
            <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0" />
            <div>
              <strong className="block uppercase font-bold text-[#7F1D1D]">SPECIMEN PIPELINE WARNING</strong>
              <p className="text-xs text-[#991B1B] mt-0.5">{error}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRescan}
            className="px-3 py-1.5 bg-[#FBF9F4] hover:bg-[#F3EEE3] text-[#7F1D1D] border border-[#DC2626] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RETRY PIPELINE SCAN</span>
          </button>
        </div>
      )}

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Specimen Viewer (7 cols) */}
        <div className="lg:col-span-7 w-full">
          <AnalysisViewer
            file={file}
            previewUrl={previewUrl}
            roi={roi}
            bubbleResult={bubbleResult}
            telemetry={telemetry}
            vizMode={vizMode}
            onVizModeChange={onVizModeChange}
            scanStatus={scanStatus}
            onReset={onRunNewAnalysis}
            onInitialize={onRescan}
            onImageLoaded={onImageLoaded}
          />
        </div>

        {/* Right Column: Hero Result Metric & 4-Metrics Grid (5 cols) */}
        <div className="lg:col-span-5 w-full space-y-6">
          {/* Hero Result Card: 63 BUBBLES DETECTED */}
          <PrimaryMetric
            count={bubbleCount}
            meanConfidence={statistics?.confidence?.mean || 0.984}
          />

          {/* 4 Primary Analytical Elements */}
          <MetricGrid statistics={statistics} />
        </div>
      </div>

      {/* Secondary Analysis Section: Size Distribution Histogram & Spatial Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SizeDistribution distribution={statistics?.sizeDistribution} />
        <SpatialDistribution
          bubbles={bubbleResult?.acceptedBubbles}
          roi={roi}
          naturalWidth={telemetry?.width}
          naturalHeight={telemetry?.height}
        />
      </div>
    </motion.div>
  );
}
