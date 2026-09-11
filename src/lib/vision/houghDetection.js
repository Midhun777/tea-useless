/**
 * BUBBLE-X Hough Circle Detection Branch
 *
 * Targets: LARGE, FAINT, CIRCULAR bubbles
 *
 * Strategy:
 *   1. Apply extra-soft Gaussian blur (kernel 9, sigma 2) BEFORE HoughCircles
 *      → suppresses foam texture so accumulator votes cluster on true large circles
 *   2. Low param2 accumulator threshold (~12) → sensitive to faint/incomplete edges
 *   3. High param1 Canny threshold → only strong gradients seeded, reducing noise
 *   4. Radius range: 12–120 px (large bubble territory)
 */

import { validateHoughConfig } from './config';
import { evaluateHoughCandidate } from './bubbleFilter';
import { createRoiMaskMat } from './roiMask';
import { deleteMat } from '../opencv';

/**
 * Detects large, faint, circular bubbles using Hough Circle Transform.
 *
 * @param {cv.Mat} preprocessedMat  Grayscale CV_8UC1 matrix (CLAHE-enhanced)
 * @param {Object} roi              Tea surface ROI { centerX, centerY, radius, ... }
 * @param {Object} rawHoughConfig   Hough branch configuration (see DEFAULT_HOUGH_CONFIG)
 * @param {Object} rawFilterConfig  Shared filter configuration
 * @returns {Array} Array of raw bubble candidate objects tagged detectionMethod:'hough'
 */
export function detectHoughBubbles(preprocessedMat, roi, rawHoughConfig = {}, rawFilterConfig = {}) {
  const cv = window.cv;
  if (!cv || !cv.Mat) throw new Error('OpenCV.js is not initialized for Hough detection.');

  const config = validateHoughConfig(rawHoughConfig);
  const width = preprocessedMat.cols;
  const height = preprocessedMat.rows;
  const allocatedMats = [];
  const candidates = [];

  try {
    // Step 1: Apply ROI mask
    const maskMat = createRoiMaskMat(width, height, roi);
    allocatedMats.push(maskMat);

    const maskedMat = new cv.Mat();
    allocatedMats.push(maskedMat);
    cv.bitwise_and(preprocessedMat, preprocessedMat, maskedMat, maskMat);

    // Step 2: Extra-soft Gaussian blur to suppress micro-texture
    // This allows faint large-bubble ring edges to accumulate votes without
    // noise spikes drowning them out.
    const softBlurred = new cv.Mat();
    allocatedMats.push(softBlurred);
    const ksize = new cv.Size(config.preSoftBlurKernel, config.preSoftBlurKernel);
    cv.GaussianBlur(maskedMat, softBlurred, ksize, config.preSoftBlurSigma, config.preSoftBlurSigma, cv.BORDER_DEFAULT);

    // Step 3: Hough Circle Transform
    const circlesMat = new cv.Mat();
    allocatedMats.push(circlesMat);

    cv.HoughCircles(
      softBlurred,
      circlesMat,
      cv.HOUGH_GRADIENT,
      config.dp,
      config.minDist,
      config.param1,
      config.param2,
      config.minRadius,
      config.maxRadius
    );

    // Step 4: Build candidate objects
    const numCircles = circlesMat.cols;
    for (let i = 0; i < numCircles; i++) {
      const x = circlesMat.data32F[i * 3];
      const y = circlesMat.data32F[i * 3 + 1];
      const r = circlesMat.data32F[i * 3 + 2];

      // Bounds guard
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      if (r < config.minRadius || r > config.maxRadius) continue;

      // Feature extraction
      const rawCandidate = {
        id:              `h_${i + 1}`,
        x:               Math.round(x),
        y:               Math.round(y),
        radius:          Math.round(r),
        detectionMethod: 'hough'
      };

      // Geometry-only evaluation — no pixel loops
      const evalResult = evaluateHoughCandidate(rawCandidate, roi, rawFilterConfig, config.minRadius, config.maxRadius);

      candidates.push({
        ...rawCandidate,
        roiCoverage:   evalResult.roiCoverage,
        localContrast: evalResult.localContrast,
        edgeStrength:  evalResult.edgeStrength,
        circularity:   evalResult.circularity,
        confidence:    evalResult.confidence,
        isValid:       evalResult.isValid,
        reason:        evalResult.reason || null
      });
    }
  } finally {
    allocatedMats.forEach(m => { if (m && typeof m.delete === 'function') deleteMat(m); });
  }

  return candidates;
}
