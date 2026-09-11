import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Play, FileCheck, Target, CircleDot, RefreshCw } from 'lucide-react';
import { RoiOverlay } from './RoiOverlay';
import { BubbleOverlay } from './BubbleOverlay';

export function ImagePreview({ 
  file, 
  previewUrl, 
  roi, 
  bubbleResult, 
  vizMode = 'ACCEPTED',
  scanStatus, 
  onReset, 
  onInitialize, 
  onImageLoaded 
}) {
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState(null);
  const [containerBounds, setContainerBounds] = useState(null);

  // Extract natural dimensions dynamically from object URL
  useEffect(() => {
    if (!previewUrl) return;

    const img = new Image();
    img.onload = () => {
      setDimensions((prev) => {
        if (prev && prev.width === img.naturalWidth && prev.height === img.naturalHeight) return prev;
        return { width: img.naturalWidth, height: img.naturalHeight };
      });
    };
    img.src = previewUrl;
  }, [previewUrl]);

  // Update container DOM bounds on image load and window resize
  const updateContainerBounds = () => {
    if (imgRef.current) {
      const w = imgRef.current.clientWidth;
      const h = imgRef.current.clientHeight;
      if (w > 0 && h > 0) {
        setContainerBounds((prev) => {
          if (prev && prev.width === w && prev.height === h) return prev;
          return { width: w, height: h };
        });
      }
    }
  };

  useEffect(() => {
    window.addEventListener('resize', updateContainerBounds);
    return () => window.removeEventListener('resize', updateContainerBounds);
  }, []);

  const handleImageRendered = () => {
    updateContainerBounds();
    if (imgRef.current && onImageLoaded) {
      onImageLoaded(imgRef.current);
    }
  };

  const bubbleCount = bubbleResult ? (bubbleResult.bubbleCount || bubbleResult.candidateCount || 0) : 0;
  const rawCount = bubbleResult ? bubbleResult.rawCandidateCount || 0 : 0;

  // Format bytes into readable string
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto my-4 bg-slate-900/80 border border-slate-800 rounded-xl p-6 sm:p-8 backdrop-blur"
    >
      {/* Specimen Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-slate-800 font-mono-lab text-xs gap-2">
        <div className="flex items-center space-x-2 text-cyan-400">
          <FileCheck className="w-4 h-4" />
          <span className="font-semibold uppercase tracking-wider">SPECIMEN LOADED</span>
        </div>

        <div className="flex items-center space-x-4">
          {scanStatus && (
            <div className="text-amber-400 flex items-center space-x-1.5 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span className="font-bold">{scanStatus}</span>
            </div>
          )}

          {bubbleResult && (
            <div className="flex items-center space-x-1.5 bg-cyan-950/80 text-cyan-300 px-2.5 py-1 rounded border border-cyan-800 font-bold">
              <CircleDot className="w-3.5 h-3.5 text-cyan-400" />
              <span>ACCEPTED BUBBLES: {bubbleCount} ({rawCount} RAW)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Image Frame Container with Lab Reticle Accents */}
      <div 
        ref={containerRef}
        className="relative rounded-lg overflow-hidden bg-slate-950 border border-slate-800/80 flex items-center justify-center p-2 group max-h-[420px]"
      >
        {/* Alignment corner ticks */}
        <div className="absolute top-2 left-2 text-cyan-500/40 font-mono-lab text-xs z-10 pointer-events-none">+</div>
        <div className="absolute top-2 right-2 text-cyan-500/40 font-mono-lab text-xs z-10 pointer-events-none">+</div>
        <div className="absolute bottom-2 left-2 text-cyan-500/40 font-mono-lab text-xs z-10 pointer-events-none">+</div>
        <div className="absolute bottom-2 right-2 text-cyan-500/40 font-mono-lab text-xs z-10 pointer-events-none">+</div>

        {/* Specimen Image */}
        <img
          ref={imgRef}
          src={previewUrl}
          alt={`Preview of tea specimen: ${file?.name || 'Uploaded image'}`}
          onLoad={handleImageRendered}
          className="max-h-[380px] w-auto max-w-full object-contain rounded border border-slate-800/50"
        />

        {/* ROI Overlay Ring */}
        {roi && dimensions && containerBounds && (
          <RoiOverlay
            roi={roi}
            naturalWidth={dimensions.width}
            naturalHeight={dimensions.height}
            containerWidth={containerBounds.width}
            containerHeight={containerBounds.height}
          />
        )}

        {/* Candidate Bubbles Overlay Ring */}
        {bubbleResult && dimensions && containerBounds && (
          <BubbleOverlay
            bubbleResult={bubbleResult}
            vizMode={vizMode}
            naturalWidth={dimensions.width}
            naturalHeight={dimensions.height}
            containerWidth={containerBounds.width}
            containerHeight={containerBounds.height}
          />
        )}
      </div>

      {/* File Metadata Telemetry Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-950/60 rounded-lg border border-slate-800/60 text-left font-mono-lab text-xs text-slate-400">
        <div>
          <span className="block text-[10px] text-slate-500 uppercase">SPECIMEN NAME</span>
          <span className="font-medium text-slate-200 truncate block mt-0.5" title={file?.name}>
            {file?.name || 'Unrecognized_Specimen'}
          </span>
        </div>

        <div>
          <span className="block text-[10px] text-slate-500 uppercase">RESOLUTION</span>
          <span className="font-medium text-slate-200 block mt-0.5">
            {dimensions ? `${dimensions.width} × ${dimensions.height} px` : 'CALCULATING...'}
          </span>
        </div>

        <div>
          <span className="block text-[10px] text-slate-500 uppercase">FILE SIZE</span>
          <span className="font-medium text-slate-200 block mt-0.5">
            {file ? formatFileSize(file.size) : 'N/A'}
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/50 rounded-lg font-mono-lab text-xs transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Remove uploaded specimen image"
        >
          <Trash2 className="w-4 h-4" />
          <span>REMOVE SPECIMEN</span>
        </button>

        <button
          type="button"
          onClick={onInitialize}
          disabled={!!scanStatus}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 font-mono-lab text-xs font-bold rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] focus:outline-none focus:ring-2 focus:ring-cyan-300"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>{scanStatus ? scanStatus : 'INITIALIZE ANALYSIS'}</span>
        </button>
      </div>
    </motion.div>
  );
}
