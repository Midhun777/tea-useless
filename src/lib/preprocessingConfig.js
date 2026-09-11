/**
 * BUBBLE-X Preprocessing Configuration
 * 
 * Centralized parameters for tea specimen image preprocessing pipeline:
 * - maxDimension: Normalization scaling threshold (px)
 * - blurKernelSize: Gaussian blur filter aperture size (must be odd: 3, 5, 7, etc.)
 * - blurSigma: Gaussian blur standard deviation in X direction (0 = computed from kernel size)
 * - enableClahe: Contrast Limited Adaptive Histogram Equalization toggle
 * - claheClipLimit: Threshold for contrast limiting (1.0 to 5.0)
 * - claheGridSize: Size of grid for histogram equalization (e.g. 8 for 8x8 tiles)
 */

export const DEFAULT_PREPROCESSING_CONFIG = {
  maxDimension: 1280,
  blurKernelSize: 5,
  blurSigma: 0,
  enableClahe: true,
  claheClipLimit: 2.0,
  claheGridSize: 8
};

/**
 * Validates and normalizes preprocessing parameters to prevent OpenCV C++ exceptions.
 * @param {Object} config 
 * @returns {Object} Validated configuration
 */
export function validatePreprocessingConfig(config = {}) {
  const merged = { ...DEFAULT_PREPROCESSING_CONFIG, ...config };

  // Ensure maxDimension is positive integer >= 100
  let maxDimension = parseInt(merged.maxDimension, 10);
  if (isNaN(maxDimension) || maxDimension < 100) maxDimension = 1280;

  // Ensure blurKernelSize is positive odd integer >= 1
  let blurKernelSize = parseInt(merged.blurKernelSize, 10);
  if (isNaN(blurKernelSize) || blurKernelSize < 1) blurKernelSize = 5;
  if (blurKernelSize % 2 === 0) blurKernelSize += 1; // Make odd

  // Ensure blurSigma is non-negative number
  let blurSigma = parseFloat(merged.blurSigma);
  if (isNaN(blurSigma) || blurSigma < 0) blurSigma = 0;

  // Ensure CLAHE params
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
