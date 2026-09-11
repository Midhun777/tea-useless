/**
 * BUBBLE-X OpenCV.js Integration & Preprocessing Pipeline Core
 * 
 * Manages the lifecycle of OpenCV.js WebAssembly runtime, provides safe image-to-matrix 
 * conversion, low-level matrix transformations, and guarantees WASM memory cleanup.
 */

import { validatePreprocessingConfig } from './preprocessingConfig';

let cvInstance = null;
let loadingPromise = null;

/**
 * Checks if OpenCV.js is loaded and WASM runtime is initialized.
 * @returns {boolean}
 */
export function isOpenCVReady() {
  return !!(window.cv && window.cv.Mat && typeof window.cv.Mat === 'function');
}

/**
 * Asynchronously loads and initializes OpenCV.js from official CDN.
 * @returns {Promise<any>} Resolves with window.cv when initialized.
 */
export function loadOpenCV() {
  if (isOpenCVReady()) {
    cvInstance = window.cv;
    return Promise.resolve(window.cv);
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    if (isOpenCVReady()) {
      cvInstance = window.cv;
      resolve(window.cv);
      return;
    }

    const cdnUrls = [
      '/opencv.js',
      'https://docs.opencv.org/4.8.0/opencv.js',
      'https://cdn.jsdelivr.net/npm/@techstark/opencv-js@4.9.0-1/opencv.js'
    ];

    const cleanupAndReject = (errMessage) => {
      loadingPromise = null;
      const script = document.getElementById('opencv-js-script');
      if (script) script.remove();
      reject(new Error(errMessage));
    };

    const tryLoadScript = (urlIndex) => {
      if (urlIndex >= cdnUrls.length) {
        cleanupAndReject('Failed to load OpenCV.js WebAssembly engine from CDN. Please check your internet connection.');
        return;
      }

      const existingScript = document.getElementById('opencv-js-script');
      if (existingScript) {
        existingScript.remove();
      }

      // CRITICAL: Define window.cv with onRuntimeInitialized BEFORE adding script tag!
      window.cv = window.cv || {};
      window.cv.onRuntimeInitialized = () => {
        if (checkInterval) clearInterval(checkInterval);
        if (timeoutTimer) clearTimeout(timeoutTimer);
        if (isOpenCVReady()) {
          cvInstance = window.cv;
          resolve(window.cv);
        }
      };

      // Interval fallback check (every 50ms)
      const checkInterval = setInterval(() => {
        if (isOpenCVReady()) {
          clearInterval(checkInterval);
          if (timeoutTimer) clearTimeout(timeoutTimer);
          cvInstance = window.cv;
          resolve(window.cv);
        }
      }, 50);

      // Per-CDN timeout (6 seconds)
      const timeoutTimer = setTimeout(() => {
        clearInterval(checkInterval);
        if (isOpenCVReady()) {
          resolve(window.cv);
        } else {
          tryLoadScript(urlIndex + 1);
        }
      }, 6000);

      // Create and append script tag
      const script = document.createElement('script');
      script.id = 'opencv-js-script';
      script.async = true;
      script.src = cdnUrls[urlIndex];

      script.onerror = () => {
        clearInterval(checkInterval);
        clearTimeout(timeoutTimer);
        tryLoadScript(urlIndex + 1);
      };

      document.body.appendChild(script);
    };

    tryLoadScript(0);
  });

  return loadingPromise;
}

/**
 * Converts an HTMLImageElement or HTMLCanvasElement into an OpenCV cv.Mat
 * @param {HTMLImageElement|HTMLCanvasElement} imgElement 
 * @returns {cv.Mat}
 */
export function imageToMat(imgElement) {
  if (!isOpenCVReady()) {
    throw new Error('OpenCV.js is not initialized yet. Cannot convert image to cv.Mat.');
  }

  if (!imgElement) {
    throw new Error('No valid image element provided for OpenCV matrix conversion.');
  }

  const cv = window.cv;

  let sourceCanvas = imgElement;
  if (imgElement instanceof HTMLImageElement) {
    const width = imgElement.naturalWidth || imgElement.width;
    const height = imgElement.naturalHeight || imgElement.height;

    if (!width || !height) {
      throw new Error('Image dimensions are zero or invalid.');
    }

    sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = width;
    sourceCanvas.height = height;
    const ctx = sourceCanvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0);
  }

  const mat = cv.imread(sourceCanvas);
  return mat;
}

/**
 * Converts an OpenCV cv.Mat to a PNG Data URL string for React UI preview
 * @param {cv.Mat} mat 
 * @returns {string} Data URL
 */
export function matToDataURL(mat) {
  if (!isOpenCVReady() || !mat) return '';
  const canvas = document.createElement('canvas');
  window.cv.imshow(canvas, mat);
  return canvas.toDataURL('image/png');
}

/**
 * Safely deletes a cv.Mat object to free WASM heap memory.
 * @param {cv.Mat} mat 
 */
export function deleteMat(mat) {
  if (mat && typeof mat.delete === 'function') {
    try {
      mat.delete();
    } catch (e) {
      console.warn('[OpenCV Memory Management] Error deleting cv.Mat:', e);
    }
  }
}

/**
 * Helper to translate OpenCV matrix type code to human readable string.
 * @param {number} typeVal 
 * @returns {string}
 */
export function getMatTypeName(typeVal) {
  const cv = window.cv;
  if (!cv) return `CV_TYPE_${typeVal}`;
  switch (typeVal) {
    case cv.CV_8UC1: return 'CV_8UC1 (8-bit Gray)';
    case cv.CV_8UC3: return 'CV_8UC3 (8-bit RGB)';
    case cv.CV_8UC4: return 'CV_8UC4 (8-bit RGBA)';
    case cv.CV_32FC1: return 'CV_32FC1 (32-bit Float Gray)';
    default: return `CV_TYPE_${typeVal}`;
  }
}

/**
 * Extracts non-leaking serializable telemetry data from a cv.Mat
 * @param {cv.Mat} mat 
 * @returns {Object}
 */
export function getMatTelemetry(mat) {
  if (!mat) return null;
  return {
    width: mat.cols,
    height: mat.rows,
    channels: mat.channels(),
    type: getMatTypeName(mat.type()),
    totalElements: mat.total(),
    elemSize: mat.elemSize()
  };
}

/* ========================================================================
   Step 4 Pipeline Stages (Resize, Grayscale, Blur, CLAHE)
   ======================================================================== */

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
  
  // Ensure kernel size is positive odd integer
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
    clahe.delete(); // Critical: release CLAHE C++ instance
  }

  return dstMat;
}

/**
 * Core Step 4 Preprocessing Pipeline Execution
 * Accepts raw srcMat and configuration, executes all stages, extracts intermediate stage data URLs,
 * and guarantees cleanup of all temporary matrices.
 * 
 * @param {cv.Mat} srcMat 
 * @param {Object} rawConfig 
 * @returns {Object} Preprocessing pipeline result { stages, telemetry, config }
 */
export function executePreprocessingPipeline(srcMat, rawConfig = {}) {
  if (!isOpenCVReady()) {
    throw new Error('OpenCV.js is not initialized yet.');
  }

  const config = validatePreprocessingConfig(rawConfig);
  const allocatedMats = []; // Track all intermediate matrices for safe cleanup

  try {
    // Stage 0: Original Matrix
    const originalMat = srcMat.clone();
    allocatedMats.push(originalMat);

    // Stage 1: Resize
    const resizedMat = resizeMat(originalMat, config.maxDimension);
    allocatedMats.push(resizedMat);

    // Stage 2: Grayscale
    const grayscaleMat = toGrayscaleMat(resizedMat);
    allocatedMats.push(grayscaleMat);

    // Stage 3: Gaussian Blur
    const blurredMat = applyGaussianBlur(grayscaleMat, config.blurKernelSize, config.blurSigma);
    allocatedMats.push(blurredMat);

    // Stage 4: Contrast Enhancement (CLAHE)
    let enhancedMat;
    if (config.enableClahe) {
      enhancedMat = applyClahe(blurredMat, config.claheClipLimit, config.claheGridSize);
    } else {
      enhancedMat = blurredMat.clone();
    }
    allocatedMats.push(enhancedMat);

    // Extract Data URLs for intermediate stage visualization
    const stages = {
      original: {
        id: 'original',
        name: '00 — ORIGINAL',
        dataUrl: matToDataURL(originalMat),
        telemetry: getMatTelemetry(originalMat)
      },
      resized: {
        id: 'resized',
        name: '01 — RESIZED',
        dataUrl: matToDataURL(resizedMat),
        telemetry: getMatTelemetry(resizedMat)
      },
      grayscale: {
        id: 'grayscale',
        name: '02 — GRAYSCALE',
        dataUrl: matToDataURL(grayscaleMat),
        telemetry: getMatTelemetry(grayscaleMat)
      },
      blurred: {
        id: 'blurred',
        name: '03 — BLURRED',
        dataUrl: matToDataURL(blurredMat),
        telemetry: getMatTelemetry(blurredMat)
      },
      enhanced: {
        id: 'enhanced',
        name: '04 — ENHANCED',
        dataUrl: matToDataURL(enhancedMat),
        telemetry: getMatTelemetry(enhancedMat)
      }
    };

    const finalTelemetry = getMatTelemetry(enhancedMat);

    return {
      stages,
      finalStageId: config.enableClahe ? 'enhanced' : 'blurred',
      finalTelemetry,
      config
    };
  } finally {
    // GUARANTEED MEMORY CLEANUP: Release all temporary WASM cv.Mat instances
    allocatedMats.forEach(mat => deleteMat(mat));
  }
}
