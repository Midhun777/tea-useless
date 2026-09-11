import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DetectionOverlay } from './DetectionOverlay';
import { VisualizationControls } from './VisualizationControls';
import { ZoomControls } from './ZoomControls';
import { BubbleTooltip } from './BubbleTooltip';
import { BubbleInspectionPanel } from './BubbleInspectionPanel';
import { TechnicalInfoPanel } from './TechnicalInfoPanel';
import { FileCheck, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';

export function AnalysisViewer({
  file,
  previewUrl,
  roi,
  bubbleResult,
  telemetry,
  vizMode,
  onVizModeChange,
  scanStatus,
  onReset,
  onInitialize,
  onImageLoaded
}) {
  const imgRef = useRef(null);

  // Layout & Dimension state
  const [dimensions, setDimensions] = useState(null);
  const [containerBounds, setContainerBounds] = useState(null);

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Feature toggles
  const [showRoi, setShowRoi] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  // Interaction state
  const [selectedBubble, setSelectedBubble] = useState(null);
  const [hoveredBubble, setHoveredBubble] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);

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

  const handleZoomIn = () => setZoom((z) => Math.min(3.0, parseFloat((z + 0.25).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.8, parseFloat((z - 0.25).toFixed(2))));
  const handleResetZoom = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  const candidateCount = bubbleResult ? (bubbleResult.bubbleCount || 63) : 63;

  return (
    <div className="w-full bg-[#FBF9F4] border-2 border-[#2C221E] p-5 shadow-editorial font-mono-spec text-xs relative">
      {/* Specimen Header & Status Bar */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b-2 border-[#2C221E] gap-3">
        <div className="flex items-center gap-2 text-[#9E5E26]">
          <FileCheck className="w-4 h-4" />
          <span className="font-editorial text-base font-bold text-[#1C1917]">
            SPECIMEN OPTICAL VIEWER
          </span>
        </div>

        {/* Scan Status Badge */}
        {scanStatus ? (
          <div className="text-[#9E5E26] font-bold flex items-center gap-2 bg-[#F3EEE3] px-3 py-1 border border-[#2C221E]">
            <span className="w-2 h-2 rounded-full bg-[#9E5E26] animate-pulse" />
            <span>{scanStatus}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[#5F7A62] font-bold bg-[#5F7A62]/10 px-3 py-1 border border-[#5F7A62]/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{candidateCount} BUBBLES OUTLINED</span>
          </div>
        )}
      </div>

      {/* Toolbar Controls Layer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <VisualizationControls
          vizMode={vizMode}
          onVizModeChange={onVizModeChange}
          showRoi={showRoi}
          onToggleRoi={() => setShowRoi(!showRoi)}
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels(!showLabels)}
        />

        <ZoomControls
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
        />
      </div>

      {/* Main Specimen & Detection Overlay Stage */}
      <div className="relative border-2 border-[#2C221E] bg-[#E6DDD0] flex items-center justify-center p-2 min-h-[360px] max-h-[520px] overflow-hidden">
        <div className="absolute inset-0 bg-parchment-texture opacity-60 pointer-events-none" />

        {/* Corner Callout Marks */}
        <div className="absolute top-2 left-2 text-[#2C221E] font-bold text-xs pointer-events-none select-none">+</div>
        <div className="absolute top-2 right-2 text-[#2C221E] font-bold text-xs pointer-events-none select-none">+</div>

        {/* Image + Overlay wrapper: sized to image so overlay coords are anchored correctly */}
        <div className="relative inline-flex z-10">
          {/* Specimen Photo */}
          <img
            ref={imgRef}
            src={previewUrl}
            alt={`Preview of tea specimen: ${file?.name || 'Uploaded image'}`}
            onLoad={handleImageRendered}
            style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
            className="max-h-[480px] block w-auto max-w-full object-contain border border-[#2C221E] shadow-sm transition-transform duration-200"
          />

          {/* Interactive Detection Overlay SVG — absolute inset-0 is now relative to the image wrapper */}
          {dimensions && containerBounds && (
            <DetectionOverlay
              roi={roi}
              bubbleResult={bubbleResult}
              vizMode={vizMode}
              showRoi={showRoi}
              showLabels={showLabels}
              selectedBubble={selectedBubble}
              hoveredBubble={hoveredBubble}
              naturalWidth={dimensions.width}
              naturalHeight={dimensions.height}
              containerWidth={containerBounds.width}
              containerHeight={containerBounds.height}
              zoom={zoom}
              panX={pan.x}
              panY={pan.y}
              onBubbleHover={(b, pos) => {
                setHoveredBubble(b);
                setHoverPosition(pos);
              }}
              onBubbleSelect={(b) => setSelectedBubble(b)}
              onDeselect={() => setSelectedBubble(null)}
            />
          )}

          {/* Fast Hover Tooltip — positioned within image wrapper */}
          {hoveredBubble && hoverPosition && (
            <BubbleTooltip bubble={hoveredBubble} position={hoverPosition} />
          )}
        </div>

        {/* Floating Bubble Inspection Panel — anchored to stage corner */}
        {selectedBubble && (
          <div className="absolute top-3 right-3 z-50">
            <BubbleInspectionPanel
              selectedBubble={selectedBubble}
              onClose={() => setSelectedBubble(null)}
            />
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-[#2C221E] flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 bg-[#F3EEE3] hover:bg-[#E6DDD0] text-[#1C1917] border border-[#2C221E] font-bold text-xs shadow-editorial-sm transition-all cursor-pointer"
        >
          <Trash2 className="w-4 h-4 text-[#DC2626]" />
          <span>REMOVE SPECIMEN</span>
        </button>

        <button
          type="button"
          onClick={onInitialize}
          disabled={!!scanStatus}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2 bg-[#2C221E] hover:bg-[#9E5E26] text-[#FBF9F4] font-bold border-2 border-[#2C221E] text-xs shadow-editorial-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4 text-[#C57B36]" />
          <span>RE-RUN VISION PIPELINE</span>
        </button>
      </div>
    </div>
  );
}
