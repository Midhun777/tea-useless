/**
 * BUBBLE-X Vision & ROI Configuration
 * Centralized parameters for preprocessing, Region of Interest (ROI) detection, 
 * Hough Circle candidate detection, and candidate filtering/validation.
 */

export const DEFAULT_PREPROCESSING_CONFIG = {
  maxDimension: 1280,
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

export const DEFAULT_BUBBLE_CONFIG = {
  dp: 1.2,
  minDist: 12,
  param1: 100,
  param2: 18,
  minRadius: 3,
  maxRadius: 40
};

export const DEFAULT_FILTER_CONFIG = {
  minimumConfidence: 0.55,       // Minimum heuristic confidence score (0.0 to 1.0)
  minimumCircularity: 0.45,      // Minimum circularity (4pi*A/P^2)
  minimumROICoverage: 0.70,      // Minimum fraction of bubble inside ROI (70%)
  minimumLocalContrast: 6.0,     // Minimum interior vs ring intensity contrast delta
  duplicateDistanceFactor: 0.55  // Distance factor for deduplication NMS (0.55 * min(r1, r2))
};

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
    minimumConfidence: Math.max(0.1, Math.min(0.95, parseFloat(merged.minimumConfidence) || 0.55)),
    minimumCircularity: Math.max(0.1, Math.min(0.95, parseFloat(merged.minimumCircularity) || 0.45)),
    minimumROICoverage: Math.max(0.1, Math.min(1.0, parseFloat(merged.minimumROICoverage) || 0.70)),
    minimumLocalContrast: Math.max(0.0, Math.min(50.0, parseFloat(merged.minimumLocalContrast) || 6.0)),
    duplicateDistanceFactor: Math.max(0.1, Math.min(1.5, parseFloat(merged.duplicateDistanceFactor) || 0.55))
  };
}
