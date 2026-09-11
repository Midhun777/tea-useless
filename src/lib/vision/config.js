/**
 * BUBBLE-X Vision & ROI Configuration
 * Centralized parameters for preprocessing, Region of Interest (ROI) detection,
 * dual-branch bubble detection (Hough + Contour/Watershed), and candidate
 * filtering/validation.
 */

export const DEFAULT_PREPROCESSING_CONFIG = {
  maxDimension: 800,   // Reduced from 1280 for ~4x faster WASM processing
  blurKernelSize: 5,
  blurSigma: 0,
  enableClahe: true,
  claheClipLimit: 2.0,
  claheGridSize: 8
};

export const DEFAULT_ROI_CONFIG = {
  minAreaRatio: 0.08,
  maxAreaRatio: 0.92,
  centerTolerance: 0.40,
  confidenceThreshold: 0.55,
  houghDp: 1.2,
  houghMinDistRatio: 0.20,
  houghParam1: 100,
  houghParam2: 35
};

// ---------------------------------------------------------------------------
// Branch A — Hough Circle Transform
// Targets: LARGE, FAINT, CIRCULAR bubbles
// Strategy: heavy extra blur to suppress texture, low accumulator threshold
// ---------------------------------------------------------------------------
export const DEFAULT_HOUGH_CONFIG = {
  // Extra Gaussian blur applied before HoughCircles (suppresses foam texture
  // so faint large-bubble edges can accumulate votes cleanly)
  preSoftBlurKernel: 9,
  preSoftBlurSigma: 2.0,

  // HoughCircles params
  dp: 1.2,            // Inverse resolution ratio (1 = same as input)
  minDist: 15,        // Minimum distance between detected circle centres
  param1: 80,         // Canny upper threshold (lower = more edges found)
  param2: 20,         // Accumulator threshold — raised from 12 to reduce false positives
  minRadius: 10,      // px — ignore tiny noise
  maxRadius: 100      // px — capture large surface bubbles
};

// ---------------------------------------------------------------------------
// Branch B — Contour / Watershed
// Targets: SMALL, TOUCHING, VISIBLE bubbles
// Strategy: adaptive threshold → morph open → findContours → circularity filter
// ---------------------------------------------------------------------------
export const DEFAULT_CONTOUR_CONFIG = {
  // Adaptive threshold settings
  adaptiveBlockSize: 11,       // Must be odd
  adaptiveC: 2,                // Subtracted constant

  // Morphological open to break touching bubbles apart
  morphKernelSize: 3,
  morphIterations: 1,

  // Contour filter thresholds
  minRadius: 2,                // px — catch tiny micro-foam bubbles
  maxRadius: 30,               // px — small-to-medium range
  minCircularity: 0.50,        // 4πA/P² — how circular the contour must be
  minAreaPx: 8                 // Minimum contour area in pixels (removes noise specks)
};

// ---------------------------------------------------------------------------
// Shared filter config — applied after both branches are merged
// ---------------------------------------------------------------------------
export const DEFAULT_FILTER_CONFIG = {
  minimumConfidence: 0.45,       // Lower than old single-branch (both branches score differently)
  minimumCircularity: 0.40,      // Applied per-branch before merge
  minimumROICoverage: 0.60,      // Minimum fraction of bubble inside ROI
  minimumLocalContrast: 4.0,     // Hough faint bubbles can have low contrast
  duplicateDistanceFactor: 0.55  // IoU NMS dedup factor
};

// ---------------------------------------------------------------------------
// Bubble size classification thresholds (pixel radius)
// ---------------------------------------------------------------------------
export const BUBBLE_SIZE_THRESHOLDS = {
  smallMaxRadius: 8,    // radius < 8 px  → SMALL
  mediumMaxRadius: 22   // 8 ≤ radius ≤ 22 px → MEDIUM, else LARGE
};

// ---------------------------------------------------------------------------
// Legacy single-branch config (kept for backward compat / BubbleTuningPanel)
// ---------------------------------------------------------------------------
export const DEFAULT_BUBBLE_CONFIG = {
  dp: 1.2,
  minDist: 12,
  param1: 100,
  param2: 18,
  minRadius: 3,
  maxRadius: 40
};

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------
export function validatePreprocessingConfig(config = {}) {
  const merged = { ...DEFAULT_PREPROCESSING_CONFIG, ...config };

  let maxDimension = parseInt(merged.maxDimension, 10);
  if (isNaN(maxDimension) || maxDimension < 100) maxDimension = 1280;

  let blurKernelSize = parseInt(merged.blurKernelSize, 10);
  if (isNaN(blurKernelSize) || blurKernelSize < 1) blurKernelSize = 5;
  if (blurKernelSize % 2 === 0) blurKernelSize += 1;

  let blurSigma = parseFloat(merged.blurSigma);
  if (isNaN(blurSigma) || blurSigma < 0) blurSigma = 0;

  let claheClipLimit = parseFloat(merged.claheClipLimit);
  if (isNaN(claheClipLimit) || claheClipLimit < 0.5) claheClipLimit = 2.0;

  let claheGridSize = parseInt(merged.claheGridSize, 10);
  if (isNaN(claheGridSize) || claheGridSize < 2) claheGridSize = 8;

  return {
    maxDimension,
    blurKernelSize,
    blurSigma,
    enableClahe: !!merged.enableClahe,
    claheClipLimit,
    claheGridSize
  };
}

export function validateRoiConfig(config = {}) {
  const merged = { ...DEFAULT_ROI_CONFIG, ...config };

  return {
    minAreaRatio: Math.max(0.01, Math.min(0.5, parseFloat(merged.minAreaRatio) || 0.08)),
    maxAreaRatio: Math.max(0.5, Math.min(0.99, parseFloat(merged.maxAreaRatio) || 0.92)),
    centerTolerance: Math.max(0.1, Math.min(0.8, parseFloat(merged.centerTolerance) || 0.40)),
    confidenceThreshold: Math.max(0.1, Math.min(0.95, parseFloat(merged.confidenceThreshold) || 0.55)),
    houghDp: Math.max(1.0, Math.min(3.0, parseFloat(merged.houghDp) || 1.2)),
    houghMinDistRatio: Math.max(0.05, Math.min(0.5, parseFloat(merged.houghMinDistRatio) || 0.20)),
    houghParam1: Math.max(20, Math.min(300, parseInt(merged.houghParam1, 10) || 100)),
    houghParam2: Math.max(10, Math.min(150, parseInt(merged.houghParam2, 10) || 35))
  };
}

export function validateHoughConfig(config = {}) {
  const merged = { ...DEFAULT_HOUGH_CONFIG, ...config };

  let preSoftBlurKernel = parseInt(merged.preSoftBlurKernel, 10) || 9;
  if (preSoftBlurKernel < 1) preSoftBlurKernel = 1;
  if (preSoftBlurKernel % 2 === 0) preSoftBlurKernel += 1;

  let minRadius = Math.max(1, parseInt(merged.minRadius, 10) || 12);
  let maxRadius = Math.max(minRadius + 5, parseInt(merged.maxRadius, 10) || 120);

  return {
    preSoftBlurKernel,
    preSoftBlurSigma: Math.max(0, parseFloat(merged.preSoftBlurSigma) || 2.0),
    dp: Math.max(1.0, Math.min(3.0, parseFloat(merged.dp) || 1.2)),
    minDist: Math.max(5, parseInt(merged.minDist, 10) || 20),
    param1: Math.max(20, Math.min(300, parseInt(merged.param1, 10) || 80)),
    param2: Math.max(5, Math.min(80, parseInt(merged.param2, 10) || 12)),
    minRadius,
    maxRadius
  };
}

export function validateContourConfig(config = {}) {
  const merged = { ...DEFAULT_CONTOUR_CONFIG, ...config };

  let adaptiveBlockSize = parseInt(merged.adaptiveBlockSize, 10) || 11;
  if (adaptiveBlockSize < 3) adaptiveBlockSize = 3;
  if (adaptiveBlockSize % 2 === 0) adaptiveBlockSize += 1;

  let morphKernelSize = parseInt(merged.morphKernelSize, 10) || 3;
  if (morphKernelSize < 1) morphKernelSize = 1;
  if (morphKernelSize % 2 === 0) morphKernelSize += 1;

  let minRadius = Math.max(1, parseInt(merged.minRadius, 10) || 2);
  let maxRadius = Math.max(minRadius + 2, parseInt(merged.maxRadius, 10) || 30);

  return {
    adaptiveBlockSize,
    adaptiveC: parseFloat(merged.adaptiveC) || 2,
    morphKernelSize,
    morphIterations: Math.max(1, parseInt(merged.morphIterations, 10) || 1),
    minRadius,
    maxRadius,
    minCircularity: Math.max(0.1, Math.min(0.95, parseFloat(merged.minCircularity) || 0.50)),
    minAreaPx: Math.max(1, parseInt(merged.minAreaPx, 10) || 8)
  };
}

export function validateBubbleConfig(config = {}) {
  const merged = { ...DEFAULT_BUBBLE_CONFIG, ...config };

  let minRadius = Math.max(1, parseInt(merged.minRadius, 10) || 3);
  let maxRadius = Math.max(minRadius + 2, parseInt(merged.maxRadius, 10) || 40);

  return {
    dp: Math.max(1.0, Math.min(3.0, parseFloat(merged.dp) || 1.2)),
    minDist: Math.max(2, parseInt(merged.minDist, 10) || 12),
    param1: Math.max(10, Math.min(300, parseInt(merged.param1, 10) || 100)),
    param2: Math.max(5, Math.min(100, parseInt(merged.param2, 10) || 18)),
    minRadius,
    maxRadius
  };
}

export function validateFilterConfig(config = {}) {
  const merged = { ...DEFAULT_FILTER_CONFIG, ...config };

  return {
    minimumConfidence: Math.max(0.1, Math.min(0.95, parseFloat(merged.minimumConfidence) || 0.45)),
    minimumCircularity: Math.max(0.1, Math.min(0.95, parseFloat(merged.minimumCircularity) || 0.40)),
    minimumROICoverage: Math.max(0.1, Math.min(1.0, parseFloat(merged.minimumROICoverage) || 0.60)),
    minimumLocalContrast: Math.max(0.0, Math.min(50.0, parseFloat(merged.minimumLocalContrast) || 4.0)),
    duplicateDistanceFactor: Math.max(0.1, Math.min(1.5, parseFloat(merged.duplicateDistanceFactor) || 0.55))
  };
}


