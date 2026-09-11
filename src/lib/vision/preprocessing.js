/**
 * BUBBLE-X Preprocessing Pipeline Operations
 */

import { validatePreprocessingConfig } from './config';

/**
 * Stage 1: Resizes matrix preserving aspect ratio if max dimension exceeds limit
 */
export function resizeMat(srcMat, maxDimension = 1280) {
  const cv = window.cv;
  const width = srcMat.cols;
  const height = srcMat.rows;
  const maxDim = Math.max(width, height);

  if (maxDim <= maxDimension) {
    return srcMat.clone();
  }

  const scale = maxDimension / maxDim;
  const newWidth = Math.round(width * scale);
  const newHeight = Math.round(height * scale);

  const dstMat = new cv.Mat();
  const dsize = new cv.Size(newWidth, newHeight);
  cv.resize(srcMat, dstMat, dsize, 0, 0, cv.INTER_AREA);
  return dstMat;
}

/**
 * Stage 2: Converts matrix to Grayscale (CV_8UC1)
 */
export function toGrayscaleMat(srcMat) {
  const cv = window.cv;
  const dstMat = new cv.Mat();

  if (srcMat.channels() === 1) {
    srcMat.copyTo(dstMat);
  } else if (srcMat.channels() === 4) {
    cv.cvtColor(srcMat, dstMat, cv.COLOR_RGBA2GRAY);
  } else if (srcMat.channels() === 3) {
    cv.cvtColor(srcMat, dstMat, cv.COLOR_RGB2GRAY);
  } else {
    srcMat.copyTo(dstMat);
  }

  return dstMat;
}

/**
 * Stage 3: Applies Gaussian blur to reduce high-frequency noise
 */
export function applyGaussianBlur(srcMat, kernelSize = 5, sigma = 0) {
  const cv = window.cv;
  const dstMat = new cv.Mat();
  
  let kSize = parseInt(kernelSize, 10);
  if (kSize < 1) kSize = 1;
  if (kSize % 2 === 0) kSize += 1;

  const ksize = new cv.Size(kSize, kSize);
  cv.GaussianBlur(srcMat, dstMat, ksize, sigma, sigma, cv.BORDER_DEFAULT);
  return dstMat;
}

/**
 * Stage 4: Contrast Limited Adaptive Histogram Equalization (CLAHE)
 */
export function applyClahe(srcMat, clipLimit = 2.0, gridSize = 8) {
  const cv = window.cv;
  const dstMat = new cv.Mat();
  
  const tileSize = new cv.Size(gridSize, gridSize);
  const clahe = cv.createCLAHE(clipLimit, tileSize);
  
  try {
    clahe.apply(srcMat, dstMat);
  } finally {
    clahe.delete();
  }

  return dstMat;
}

/**
 * Helper: Converts an OpenCV cv.Mat to a PNG Data URL string
 */
export function matToDataURL(mat) {
  if (!window.cv || !mat) return '';
  const canvas = document.createElement('canvas');
  window.cv.imshow(canvas, mat);
  return canvas.toDataURL('image/png');
}

/**
 * Core Step 4 Preprocessing Pipeline Execution
 */
export function executePreprocessingPipeline(srcMat, rawConfig = {}) {
  const cv = window.cv;
  if (!cv || !cv.Mat) {
    throw new Error('OpenCV.js is not initialized yet.');
  }

  const config = validatePreprocessingConfig(rawConfig);
  const allocatedMats = [];

  try {
    const originalMat = srcMat.clone();
    allocatedMats.push(originalMat);

    const resizedMat = resizeMat(originalMat, config.maxDimension);
    allocatedMats.push(resizedMat);

    const grayscaleMat = toGrayscaleMat(resizedMat);
    allocatedMats.push(grayscaleMat);

    const blurredMat = applyGaussianBlur(grayscaleMat, config.blurKernelSize, config.blurSigma);
    allocatedMats.push(blurredMat);

    let enhancedMat;
    if (config.enableClahe) {
      enhancedMat = applyClahe(blurredMat, config.claheClipLimit, config.claheGridSize);
    } else {
      enhancedMat = blurredMat.clone();
    }
    allocatedMats.push(enhancedMat);

    const stages = {
      original: {
        id: 'original',
        name: '00 — ORIGINAL',
        dataUrl: matToDataURL(originalMat),
        telemetry: { width: originalMat.cols, height: originalMat.rows, channels: originalMat.channels() }
      },
      resized: {
        id: 'resized',
        name: '01 — RESIZED',
        dataUrl: matToDataURL(resizedMat),
        telemetry: { width: resizedMat.cols, height: resizedMat.rows, channels: resizedMat.channels() }
      },
      grayscale: {
        id: 'grayscale',
        name: '02 — GRAYSCALE',
        dataUrl: matToDataURL(grayscaleMat),
        telemetry: { width: grayscaleMat.cols, height: grayscaleMat.rows, channels: grayscaleMat.channels() }
      },
      blurred: {
        id: 'blurred',
        name: '03 — BLURRED',
        dataUrl: matToDataURL(blurredMat),
        telemetry: { width: blurredMat.cols, height: blurredMat.rows, channels: blurredMat.channels() }
      },
      enhanced: {
        id: 'enhanced',
        name: '04 — ENHANCED',
        dataUrl: matToDataURL(enhancedMat),
        telemetry: { width: enhancedMat.cols, height: enhancedMat.rows, channels: enhancedMat.channels() }
      }
    };

    // Keep cloned preprocessed matrix for downstream ROI detection
    const preprocessedMat = enhancedMat.clone();

    return {
      stages,
      finalStageId: config.enableClahe ? 'enhanced' : 'blurred',
      preprocessedMat,
      config
    };
  } finally {
    allocatedMats.forEach(mat => {
      if (mat && typeof mat.delete === 'function') mat.delete();
    });
  }
}
