import React, { useEffect, useState, useRef } from 'react';
import { TargetPin } from './illustrations/ScientificAnnotations';

/**
 * Illustrated Analysis Scene Transition Component
 * Displays animated radar scanning, detection reticles, and incrementing bubble counter
 */
export function AnalysisScannerOverlay({ previewUrl, scanStatus = "SURFACE ANALYSIS ACTIVE", onScanComplete }) {
  const [bubbleCount, setBubbleCount] = useState(0);
  const [scanPhase, setScanPhase] = useState(1);

  const onScanCompleteRef = useRef(onScanComplete);
  useEffect(() => {
    onScanCompleteRef.current = onScanComplete;
  }, [onScanComplete]);

  // Animated incrementing counter during scan — just shows scanning activity,
  // the real count comes from OpenCV after the worker completes.
  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      setBubbleCount(current);
      if (current >= 15 && current < 35) setScanPhase(2);
      if (current >= 35 && current < 55) setScanPhase(3);
      if (current >= 55) setScanPhase(4);
      // Don't stop — the worker result drives actual completion via onScanComplete
      if (current >= 999) clearInterval(timer); // safety cap
    }, 45);

    return () => clearInterval(timer);
  }, []);


  // Animated detection reticle positions
  const detectionPins = [
    { x: '35%', y: '28%', label: 'PIN 01', d: '2.4mm' },
    { x: '62%', y: '34%', label: 'PIN 02', d: '3.1mm' },
    { x: '45%', y: '58%', label: 'PIN 03', d: '1.8mm' },
    { x: '70%', y: '65%', label: 'PIN 04', d: '4.2mm' },
    { x: '28%', y: '72%', label: 'PIN 05', d: '2.0mm' },
  ];

  return (
    <div className="relative w-full max-w-3xl mx-auto my-6 bg-[#FBF9F4] border-2 border-[#2C221E] shadow-editorial p-6 overflow-hidden">
      {/* Editorial Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-[#2C221E] pb-4 mb-6 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#0284C7] animate-pulse"></div>
          <div>
            <span className="font-mono-spec text-[10px] text-[#57534E] uppercase tracking-widest block">
              LABORATORY ANALYSIS IN PROGRESS
            </span>
            <h2 className="font-editorial text-xl font-bold text-[#1C1917]">
              {scanPhase === 1 && "PHASE I: SPECIMEN SURFACE ACQUISITION"}
              {scanPhase === 2 && "PHASE II: MENISCUS EDGE DENSITY MAPPING"}
              {scanPhase === 3 && "PHASE III: CIRCULAR HOUGH TRANSFORM"}
              {scanPhase === 4 && "PHASE IV: BUBBLE MEMBRANE CALIBRATION"}
            </h2>
          </div>
        </div>

        {/* Incrementing Counter Badge */}
        <div className="bg-[#F3EEE3] border border-[#2C221E] px-4 py-2 text-right shadow-editorial-sm">
          <span className="font-mono-spec text-[9px] text-[#57534E] uppercase block">LIVE COUNT</span>
          <span className="font-mono-spec text-2xl font-bold text-[#9E5E26] tracking-tight">
            {String(bubbleCount).padStart(3, '0')}
          </span>
        </div>
      </div>

      {/* Center Image Container with Vector Overlay */}
      <div className="relative w-full h-[380px] bg-[#E6DDD0] border-2 border-[#2C221E] overflow-hidden flex items-center justify-center">
        {/* Parchment background texture */}
        <div className="absolute inset-0 bg-parchment-texture opacity-50 z-0"></div>

        {/* Specimen Preview Image */}
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Specimen under scan" 
            className="w-full h-full object-cover filter brightness-95 contrast-105" 
          />
        ) : (
          <div className="w-full h-full bg-[#D4A359]/30 flex items-center justify-center">
            <span className="font-mono-spec text-sm text-[#2C221E]">SYNTHETIC MATRIX SCAN</span>
          </div>
        )}

        {/* Sweeping Laser Scan Line */}
        <div className="absolute inset-x-0 h-1 bg-[#0284C7] shadow-[0_0_15px_#0284C7] animate-scan-line z-20 pointer-events-none"></div>

        {/* Radial Radar Scanning Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-60">
          <svg className="w-full h-full" viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="180" fill="none" stroke="#2C221E" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="200" cy="200" r="120" fill="none" stroke="#2C221E" strokeWidth="0.75" strokeDasharray="2 2" />
            <circle cx="200" cy="200" r="60" fill="none" stroke="#2C221E" strokeWidth="0.75" />
            <line x1="200" y1="10" x2="200" y2="390" stroke="#2C221E" strokeWidth="0.75" strokeDasharray="3 3" />
            <line x1="10" y1="200" x2="390" y2="200" stroke="#2C221E" strokeWidth="0.75" strokeDasharray="3 3" />
            
            {/* Animated Sweeping Radar Beam */}
            <g className="origin-center animate-radar" style={{ transformOrigin: '200px 200px' }}>
              <line x1="200" y1="200" x2="380" y2="200" stroke="#0284C7" strokeWidth="2" />
              <path d="M 200 200 L 380 200 A 180 180 0 0 0 350 70 Z" fill="#0284C7" fillOpacity="0.15" />
            </g>
          </svg>
        </div>

        {/* Dynamic Vector Detection Reticles Appearing based on count */}
        {detectionPins.map((pin, i) => {
          if (bubbleCount < (i + 1) * 12) return null;
          return (
            <div 
              key={i} 
              className="absolute z-30 transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: pin.x, top: pin.y }}
            >
              <div className="relative">
                <div className="w-8 h-8 border border-[#0284C7] rounded-full animate-ping opacity-75 absolute -inset-1"></div>
                <div className="w-6 h-6 border-2 border-[#0284C7] rounded-full flex items-center justify-center bg-[#FBF9F4]/80">
                  <div className="w-1.5 h-1.5 bg-[#0284C7] rounded-full"></div>
                </div>
                <div className="absolute top-7 left-0 bg-[#FBF9F4] border border-[#2C221E] px-1.5 py-0.5 whitespace-nowrap shadow-editorial-sm">
                  <span className="font-mono-spec text-[8px] font-bold text-[#1C1917]">
                    {pin.label} (∅{pin.d})
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Footer Bar */}
      <div className="mt-4 pt-3 border-t border-[#2C221E] flex flex-wrap items-center justify-between font-mono-spec text-xs text-[#57534E] gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1C1917]">STATUS:</span>
          <span>{scanStatus}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[#9E5E26]">CALCULATING SURFACE COVERAGE...</span>
        </div>
      </div>
    </div>
  );
}
