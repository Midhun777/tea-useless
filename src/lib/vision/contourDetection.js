/**
 * BUBBLE-X Contour Detection Branch (v2 — No Watershed pixel loops)
 *
 * Targets: SMALL, TOUCHING, VISIBLE bubbles
 *
 * Strategy (all operations stay in WASM — no JS pixel loops):
 *   1. Adaptive Gaussian threshold → binary image (bubbles = white)
 *   2. Morphological opening (ellipse kernel) → removes noise + breaks light touches
 *   3. findContours directly on the opened binary (RETR_EXTERNAL)
 *   4. Filter each contour: area bounds + circularity (4πA/P²)
 *   5. minEnclosingCircle per accepted contour → center + radius
 *
 * The watershed segment extraction was removed because the required JS-side
 * pixel-by-pixel label iteration is O(labels × W × H) and blocks the main
 * thread, causing "Page Unresponsive" on any reasonably sized image.
 */

import { validateContourConfig } from './config';
import { evaluateContourCandidate } from './bubbleFilter';
import { createRoiMaskMat } from './roiMask';
import { deleteMat } from '../opencv';

/**
 * Detects small, touching, visible bubbles using Adaptive Threshold + Contour analysis.
 *
 * @param {cv.Mat} preprocessedMat  Grayscale CV_8UC1 matrix (CLAHE-enhanced)
 * @param {Object} roi              Tea surface ROI { centerX, centerY, radius, ... }
 * @param {Object} rawContourConfig Contour branch configuration overrides
 * @param {Object} rawFilterConfig  Shared filter configuration overrides
 * @returns {Array} Array of bubble candidate objects tagged detectionMethod:'contour'
 */
export function detectContourBubbles(preprocessedMat, roi, rawContourConfig = {}, rawFilterConfig = {}) {
  const cv = window.cv;
  if (!cv || !cv.Mat) throw new Error('OpenCV.js is not initialized for Contour detection.');

  const config = validateContourConfig(rawContourConfig);
  const width  = preprocessedMat.cols;
  const height = preprocessedMat.rows;
  const allocatedMats = [];
  const candidates    = [];

  try {
    // -----------------------------------------------------------------------
    // Step 1: Apply ROI mask — restrict detection to tea surface
    // -----------------------------------------------------------------------
    const maskMat = createRoiMaskMat(width, height, roi);
    allocatedMats.push(maskMat);

    const maskedMat = new cv.Mat();
    allocatedMats.push(maskedMat);
    cv.bitwise_and(preprocessedMat, preprocessedMat, maskedMat, maskMat);

    // -----------------------------------------------------------------------
    // Step 2: Adaptive Gaussian Threshold → binary image
    // ADAPTIVE_THRESH_GAUSSIAN_C weighs neighbours by Gaussian, handling the
    // radial lighting gradient across a curved tea cup surface.
    // THRESH_BINARY_INV: bubble walls (edges) become white, interior dark.
    // -----------------------------------------------------------------------
    const binaryMat = new cv.Mat();
    allocatedMats.push(binaryMat);
    cv.adaptiveThreshold(
      maskedMat,
      binaryMat,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY_INV,
      config.adaptiveBlockSize,
      config.adaptiveC
    );

    // -----------------------------------------------------------------------
    // Step 3: Morphological open (ellipse kernel)
    // Opening = erosion then dilation:
    //   - Erosion removes thin 1-2 px noise filaments between bubbles
    //   - Dilation restores bubble boundary thickness
    // Net effect: bubble interiors merge into distinct blobs, touching
    // bubble walls thin out, improving separation.
    // -----------------------------------------------------------------------
    const morphKernel = cv.getStructuringElement(
      cv.MORPH_ELLIPSE,
      new cv.Size(config.morphKernelSize, config.morphKernelSize)
    );
    allocatedMats.push(morphKernel);

    const openedMat = new cv.Mat();
    allocatedMats.push(openedMat);
    cv.morphologyEx(
      binaryMat, openedMat, cv.MORPH_OPEN, morphKernel,
      new cv.Point(-1, -1), config.morphIterations
    );

    // -----------------------------------------------------------------------
    // Step 4: findContours — all operations stay in WASM
    // RETR_EXTERNAL: only outermost contours (no nested bubble-in-bubble)
    // CHAIN_APPROX_SIMPLE: compress horizontal/vertical/diagonal segments
    // -----------------------------------------------------------------------
    const contours  = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(openedMat, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    // -----------------------------------------------------------------------
    // Step 5: Filter contours by area + circularity, then fit enclosing circle
    // -----------------------------------------------------------------------
    const minAreaPx  = config.minAreaPx;
    const maxAreaPx  = Math.PI * config.maxRadius * config.maxRadius * 1.4; // generous upper bound

    let idCounter = 0;

    for (let ci = 0; ci < contours.size(); ci++) {
      const contour = contours.get(ci);

      try {
        const area = cv.contourArea(contour);

        // Fast area reject (cheap)
        if (area < minAreaPx || area > maxAreaPx) continue;

        // Circularity: 4π × A / P²  (1.0 = perfect circle)
        const perimeter   = cv.arcLength(contour, true);
        const circularity = perimeter > 0 ? (4 * Math.PI * area) / (perimeter * perimeter) : 0;
        if (circularity < config.minCircularity) continue;

        // Minimum enclosing circle → centre (x, y) and radius (all in WASM)
        const center    = { x: 0, y: 0 };
        const radiusRef = { value: 0 };
        cv.minEnclosingCircle(contour, center, radiusRef);

        const cx = Math.round(center.x);
        const cy = Math.round(center.y);
        const r  = Math.round(radiusRef.value);

        // Radius bounds check
        if (r < config.minRadius || r > config.maxRadius) continue;

        // Coordinate sanity
        if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue;

        // Quick ROI centre-distance reject (no pixel loop)
        if (roi && roi.radius > 0) {
          const distFromRoiCentre = Math.hypot(cx - roi.centerX, cy - roi.centerY);
          if (distFromRoiCentre > roi.radius + r * 0.3) continue;
        }

        idCounter++;
        const rawCandidate = {
          id:              `c_${idCounter}`,
          x:               cx,
          y:               cy,
          radius:          r,
          area:            Math.round(area),
          circularity:     parseFloat(circularity.toFixed(2)),
          detectionMethod: 'contour'
        };

        const evalResult = evaluateContourCandidate(rawCandidate, roi, rawFilterConfig);

        candidates.push({
          ...rawCandidate,
          roiCoverage:  evalResult.roiCoverage,
          localContrast: evalResult.localContrast,
          edgeStrength:  evalResult.edgeStrength,
          confidence:    evalResult.confidence,
          isValid:       evalResult.isValid,
          reason:        evalResult.reason || null
        });
      } finally {
        contour.delete();
      }
    }

    contours.delete();
    hierarchy.delete();

  } catch (err) {
    console.warn('[Contour Branch Warning]', err.message);
  } finally {
    allocatedMats.forEach(m => { if (m && typeof m.delete === 'function') deleteMat(m); });
  }

  return candidates;
}
