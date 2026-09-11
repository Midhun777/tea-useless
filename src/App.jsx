import React, { useState, useRef, useCallback } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { Hero } from './components/Hero';
import { UploadZone } from './components/UploadZone';
import { AnalysisScannerOverlay } from './components/AnalysisScannerOverlay';
import { ResultsDashboard } from './components/results/ResultsDashboard';
import { SAMPLE_SPECIMENS } from './components/illustrations/SampleSpecimensData';
import {
  processSpecimenPipeline,
  loadOpenCV,
  isOpenCVReady,
  DEFAULT_PREPROCESSING_CONFIG,
  DEFAULT_ROI_CONFIG,
  DEFAULT_HOUGH_CONFIG,
  DEFAULT_CONTOUR_CONFIG,
  DEFAULT_FILTER_CONFIG
} from './lib/visionUtils';

/**
 * Converts a File object to a base64 Data URL.
 */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Loads an HTMLImageElement from a data URL. Resolves when image is decoded.
 */
function loadImageElement(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image for OpenCV analysis.'));
    img.src = dataUrl;
  });
}

export default function App() {
  const [selectedFile,  setSelectedFile]  = useState(null);
  const [previewUrl,    setPreviewUrl]    = useState(null);
  const [isScanning,    setIsScanning]    = useState(false);
  const [scanStatus,    setScanStatus]    = useState(null);
  const currentImgRef = useRef(null);

  // Vision state
  const [openCVStatus]                    = useState('READY');
  const [openCVError,   setOpenCVError]   = useState(null);
  const [matrixTelemetry, setMatrixTelemetry] = useState(null);

  // Vision Pipeline State
  const [currentRoi,    setCurrentRoi]    = useState(null);
  const [bubbleResult,  setBubbleResult]  = useState(null);
  const [vizMode,       setVizMode]       = useState('ACCEPTED');
  const [calibration]                     = useState({ enabled: false, pixelsPerMillimeter: null });
  const [statistics,    setStatistics]    = useState(null);

  // ---------------------------------------------------------------------------
  // Main OpenCV dual-branch analysis pipeline
  // ---------------------------------------------------------------------------
  const runOpenCVAnalysis = async (dataUrl) => {
    setIsScanning(true);
    setOpenCVError(null);
    setBubbleResult(null);
    setStatistics(null);

    try {
      // Ensure OpenCV WebAssembly is loaded
      setScanStatus('LOADING OPENCV ENGINE');
      if (!isOpenCVReady()) {
        await loadOpenCV();
      }

      // Load the image as HTMLImageElement for imageToMat()
      setScanStatus('ACQUIRING SPECIMEN');
      const imgElement = await loadImageElement(dataUrl);
      currentImgRef.current = imgElement;

      // Run the full dual-branch pipeline
      const result = await processSpecimenPipeline(
        imgElement,
        DEFAULT_PREPROCESSING_CONFIG,
        DEFAULT_ROI_CONFIG,
        DEFAULT_HOUGH_CONFIG,
        DEFAULT_CONTOUR_CONFIG,
        DEFAULT_FILTER_CONFIG,
        calibration,
        (stage) => setScanStatus(stage)
      );

      // Wire ROI to pixel coordinates for overlay rendering
      const roiForOverlay = result.roi
        ? {
            center: { x: Math.round(result.roi.centerX), y: Math.round(result.roi.centerY) },
            radius: Math.round(result.roi.radius),
            boundaryPoints: []
          }
        : {
            center: { x: Math.round(imgElement.naturalWidth / 2), y: Math.round(imgElement.naturalHeight / 2) },
            radius: Math.round(Math.min(imgElement.naturalWidth, imgElement.naturalHeight) * 0.42),
            boundaryPoints: []
          };

      setCurrentRoi(roiForOverlay);
      setBubbleResult(result.bubbleResult);
      setStatistics(result.statistics);

      setMatrixTelemetry({
        width: result.finalTelemetry.width,
        height: result.finalTelemetry.height,
        model: 'OpenCV Dual-Branch (Hough + Contour/Watershed)',
        executionTimeMs: result.executionTimeMs,
        isDemoFallback: false,
        moondreamEngine: 'N/A — Full OpenCV Local',
        branchTelemetry: result.bubbleResult?.branchTelemetry || {},
        sizeBreakdown: result.bubbleResult?.sizeBreakdown || {}
      });

    } catch (err) {
      console.error('OpenCV Vision Pipeline Error:', err);
      setOpenCVError(err.message || 'OpenCV Vision Analysis Failed');
    } finally {
      setIsScanning(false);
      setScanStatus(null);
    }
  };

  // Scroll to Upload Section
  const handleScrollToUpload = () => {
    const uploadEl = document.getElementById('upload-section');
    if (uploadEl) {
      uploadEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 500, behavior: 'smooth' });
    }
  };

  // Trigger Instant "TRY A DEMO SAMPLE" Specimen
  const handleTrySample = async (sample = SAMPLE_SPECIMENS[0]) => {
    const sampleDataUrl = sample.getDataUrl();
    setPreviewUrl(sampleDataUrl);
    setSelectedFile({ name: `${sample.title}.png`, size: 245000 });
    await runOpenCVAnalysis(sampleDataUrl);
  };

  // File selection handler
  const handleFileSelect = async (file) => {
    if (previewUrl && !previewUrl.startsWith('data:')) {
      URL.revokeObjectURL(previewUrl);
    }
    const dataUrl = await fileToDataUrl(file);
    setSelectedFile(file);
    setPreviewUrl(dataUrl);
    await runOpenCVAnalysis(dataUrl);
  };

  // Scan transition completed (animation done)
  const handleScanComplete = useCallback(() => {
    setIsScanning(false);
    setScanStatus(null);
  }, []);

  // Reset to empty state
  const handleRunNewAnalysis = () => {
    if (previewUrl && !previewUrl.startsWith('data:')) {
      URL.revokeObjectURL(previewUrl);
    }
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

  // Image loaded in DOM view
  const handleImageLoaded = (imgElement) => {
    if (!imgElement) return;
    currentImgRef.current = imgElement;
  };

  return (
    <MainLayout openCVStatus={openCVStatus} onReset={previewUrl ? handleRunNewAnalysis : null}>
      {/* 1. Hero Section */}
      <Hero
        onCountClick={handleScrollToUpload}
        onTrySampleClick={() => handleTrySample(SAMPLE_SPECIMENS[0])}
      />

      {/* 2. Main Workspace State Machine */}
      <div className="w-full my-4">
        {/* State A: Empty State / Upload Zone */}
        {!previewUrl && (
          <UploadZone
            onFileSelect={handleFileSelect}
            onSampleSelect={handleTrySample}
            isProcessing={isScanning}
          />
        )}

        {/* State B: Analysis Scanning Transition Scene */}
        {previewUrl && isScanning && (
          <AnalysisScannerOverlay
            previewUrl={previewUrl}
            scanStatus={scanStatus}
            onScanComplete={handleScanComplete}
          />
        )}

        {/* State C: Results Dashboard */}
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
