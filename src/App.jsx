import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { Hero } from './components/Hero';
import { UploadZone } from './components/UploadZone';
import { AnalysisScannerOverlay } from './components/AnalysisScannerOverlay';
import { ResultsDashboard } from './components/results/ResultsDashboard';
import { SAMPLE_SPECIMENS } from './components/illustrations/SampleSpecimensData';
import { calculateBubbleStatistics } from './lib/visionUtils';

// ─── Utilities ────────────────────────────────────────────────────────────────

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Draws a data URL onto a canvas and extracts ImageData.
 * Returns { imageData, width, height, naturalWidth, naturalHeight }
 */
function dataUrlToImageData(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Downscale to max 800px before sending to worker
      const maxDim = 800;
      const scale  = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.round(img.naturalWidth  * scale);
      const h = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      resolve({
        imageData:     ctx.getImageData(0, 0, w, h).data,
        width:         w,
        height:        h,
        naturalWidth:  img.naturalWidth,
        naturalHeight: img.naturalHeight
      });
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = dataUrl;
  });
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [selectedFile,    setSelectedFile]    = useState(null);
  const [previewUrl,      setPreviewUrl]      = useState(null);
  const [isScanning,      setIsScanning]      = useState(false);
  const [scanStatus,      setScanStatus]      = useState(null);
  const [openCVError,     setOpenCVError]     = useState(null);
  const [matrixTelemetry, setMatrixTelemetry] = useState(null);
  const [currentRoi,      setCurrentRoi]      = useState(null);
  const [bubbleResult,    setBubbleResult]    = useState(null);
  const [vizMode,         setVizMode]         = useState('ACCEPTED');
  const [calibration]                         = useState({ enabled: false, pixelsPerMillimeter: null });
  const [statistics,      setStatistics]      = useState(null);
  const [openCVStatus]                        = useState('READY');

  const currentImgRef = useRef(null);
  const workerRef     = useRef(null);

  // Initialise the Web Worker once on mount
  useEffect(() => {
    const worker = new Worker('/analysis-worker.js');

    worker.onmessage = (e) => {
      const { type } = e.data;

      if (type === 'ready') {
        console.log('✅ OpenCV Worker ready');
      }

      if (type === 'progress') {
        setScanStatus(e.data.stage);
      }

      if (type === 'result') {
        const res = e.data;

        // Scale bubble pixel coords back to naturalWidth/naturalHeight display space
        const scaleX = (res.originalWidth  || res.imageWidth)  / res.imageWidth;
        const scaleY = (res.originalHeight || res.imageHeight) / res.imageHeight;

        const scaleBubbles = (arr) => (arr || []).map(b => ({
          ...b,
          x:      Math.round(b.x      * scaleX),
          y:      Math.round(b.y      * scaleY),
          radius: Math.round(b.radius * ((scaleX + scaleY) / 2))
        }));

        const scaledBubbles   = scaleBubbles(res.bubbles);
        const scaledRaw       = scaleBubbles(res.rawCandidates);
        const scaledRejected  = scaleBubbles(res.rejectedCandidates);

        const scaledRoi = {
          center:  {
            x: Math.round(res.roi.centerX * scaleX),
            y: Math.round(res.roi.centerY * scaleY)
          },
          centerX: Math.round(res.roi.centerX * scaleX),
          centerY: Math.round(res.roi.centerY * scaleY),
          radius:  Math.round(res.roi.radius  * ((scaleX + scaleY) / 2)),
          boundaryPoints: []
        };

        const formattedResult = {
          acceptedBubbles:    scaledBubbles,
          rawCandidates:      scaledRaw,
          rejectedCandidates: scaledRejected,
          bubbleCount:        scaledBubbles.length,
          branchTelemetry:    res.branchTelemetry,
          sizeBreakdown:      res.sizeBreakdown
        };

        // Compute statistics in main thread (pure JS, no OpenCV)
        const stats = calculateBubbleStatistics(scaledBubbles, {
          ...scaledRoi, type: 'circle'
        }, calibration);

        setBubbleResult(formattedResult);
        setCurrentRoi(scaledRoi);
        setStatistics(stats);
        setMatrixTelemetry({
          width:          res.originalWidth  || res.imageWidth,
          height:         res.originalHeight || res.imageHeight,
          model:          'OpenCV Dual-Branch (Hough + Contour) — Web Worker',
          executionTimeMs: res.processingTimeMs,
          isDemoFallback: false,
          branchTelemetry: res.branchTelemetry,
          sizeBreakdown:   res.sizeBreakdown
        });

        setIsScanning(false);
        setScanStatus(null);
      }

      if (type === 'error') {
        console.error('Worker error:', e.data.message);
        setOpenCVError(e.data.message || 'OpenCV analysis failed in worker');
        setIsScanning(false);
        setScanStatus(null);
      }
    };

    worker.onerror = (err) => {
      console.error('Worker uncaught error:', err);
      setOpenCVError('Worker crashed: ' + err.message);
      setIsScanning(false);
      setScanStatus(null);
    };

    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  // ── Analysis trigger ────────────────────────────────────────────────────────
  const runAnalysis = async (dataUrl) => {
    setIsScanning(true);
    setOpenCVError(null);
    setBubbleResult(null);
    setStatistics(null);
    setScanStatus('PREPARING IMAGE');

    try {
      const { imageData, width, height, naturalWidth, naturalHeight } =
        await dataUrlToImageData(dataUrl);

      setScanStatus('SENDING TO OPENCV WORKER');

      workerRef.current.postMessage(
        { type: 'analyze', imageData, width, height,
          originalWidth: naturalWidth, originalHeight: naturalHeight },
        [imageData.buffer]   // Transfer ArrayBuffer (zero-copy)
      );
    } catch (err) {
      setOpenCVError(err.message || 'Failed to prepare image');
      setIsScanning(false);
      setScanStatus(null);
    }
  };

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const handleScrollToUpload = () => {
    const el = document.getElementById('upload-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  const handleTrySample = async (sample = SAMPLE_SPECIMENS[0]) => {
    setScanStatus('LOADING SAMPLE PHOTO...');
    setIsScanning(true);
    try {
      const url = await sample.getDataUrl();
      setPreviewUrl(url);
      setSelectedFile({ name: `${sample.title}.jpg`, size: 0 });
      await runAnalysis(url);
    } catch (err) {
      setOpenCVError('Failed to load sample: ' + err.message);
      setIsScanning(false);
    }
  };

  const handleFileSelect = async (file) => {
    if (previewUrl && !previewUrl.startsWith('data:')) URL.revokeObjectURL(previewUrl);
    const dataUrl = await fileToDataUrl(file);
    setSelectedFile(file);
    setPreviewUrl(dataUrl);
    await runAnalysis(dataUrl);
  };

  const handleScanComplete = useCallback(() => {
    setIsScanning(false);
    setScanStatus(null);
  }, []);

  const handleRunNewAnalysis = () => {
    if (previewUrl && !previewUrl.startsWith('data:')) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsScanning(false);
    setScanStatus(null);
    setBubbleResult(null);
    setStatistics(null);
    setMatrixTelemetry(null);
    setCurrentRoi(null);
    currentImgRef.current = null;
  };

  const handleImageLoaded = (imgElement) => {
    if (imgElement) currentImgRef.current = imgElement;
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <MainLayout openCVStatus={openCVStatus} onReset={previewUrl ? handleRunNewAnalysis : null}>
      <Hero
        onCountClick={handleScrollToUpload}
        onTrySampleClick={() => handleTrySample(SAMPLE_SPECIMENS[0])}
      />

      <div className="w-full my-4">
        {!previewUrl && (
          <UploadZone
            onFileSelect={handleFileSelect}
            onSampleSelect={handleTrySample}
            isProcessing={isScanning}
          />
        )}

        {previewUrl && isScanning && (
          <AnalysisScannerOverlay
            previewUrl={previewUrl}
            scanStatus={scanStatus}
            onScanComplete={handleScanComplete}
          />
        )}

        {previewUrl && !isScanning && (
          <ResultsDashboard
            file={selectedFile}
            previewUrl={previewUrl}
            roi={currentRoi}
            bubbleResult={bubbleResult}
            telemetry={matrixTelemetry}
            statistics={statistics}
            calibration={calibration}
            vizMode={vizMode}
            onVizModeChange={setVizMode}
            scanStatus={scanStatus}
            error={openCVError}
            onRunNewAnalysis={handleRunNewAnalysis}
            onRescan={() => handleTrySample(SAMPLE_SPECIMENS[0])}
            onImageLoaded={handleImageLoaded}
          />
        )}
      </div>
    </MainLayout>
  );
}
