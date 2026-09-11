/**
 * BUBBLE-X Bubble Detection & Filtering Engine (v2)
 * 
 * Uses OpenCV.js Hough Circle Transform for candidate detection, followed by 
 * feature extraction, heuristic confidence scoring, threshold validation, 
 * rejection categorization, and spatial NMS deduplication.
 */

import { validateBubbleConfig, validateFilterConfig } from './config';
import { createRoiMaskMat } from './roiMask';
import { extractCandidateFeatures, evaluateCandidate, deduplicateCandidates } from './bubbleFilter';
import { deleteMat } from '../opencv';

/**
 * Detects, validates, filters, and deduplicates bubble candidates inside the tea ROI.
 * 
 * @param {cv.Mat} preprocessedMat Single-channel grayscale matrix (CV_8UC1)
 * @param {Object} roi Tea surface ROI { type, centerX, centerY, radius }
 * @param {Object} rawBubbleConfig Hough detection parameters
 * @param {Object} rawFilterConfig Candidate filtering parameters
 * @returns {Object} { rawCandidates, acceptedBubbles, rejectedCandidates, rawCandidateCount, rejectedCandidateCount, duplicateCount, bubbleCount, processingTimeMs }
 */
export function detectBubbles(preprocessedMat, roi, rawBubbleConfig = {}, rawFilterConfig = {}) {
  const cv = window.cv;
  if (!cv || !cv.Mat) {
    throw new Error('OpenCV.js is not initialized for bubble detection.');
  }

  if (!preprocessedMat || preprocessedMat.cols === 0 || preprocessedMat.rows === 0) {
    throw new Error('Invalid preprocessed image matrix provided for bubble detection.');
  }

  const bubbleConfig = validateBubbleConfig(rawBubbleConfig);
  const filterConfig = validateFilterConfig(rawFilterConfig);
  const width = preprocessedMat.cols;
  const height = preprocessedMat.rows;

  const startTime = performance.now();
  const allocatedMats = [];

  const rawCandidates = [];
  const validCandidates = [];
  const rejectedCandidates = [];

  try {
    // 1. Create binary ROI mask matrix (255 = inside ROI, 0 = background)
    const maskMat = createRoiMaskMat(width, height, roi);
    allocatedMats.push(maskMat);

    // 2. Apply ROI mask (bitwise AND) to isolate tea surface
    const maskedMat = new cv.Mat();
    allocatedMats.push(maskedMat);
    cv.bitwise_and(preprocessedMat, preprocessedMat, maskedMat, maskMat);

    // 3. Execute OpenCV.js Hough Circle Transform
    const circlesMat = new cv.Mat();
    allocatedMats.push(circlesMat);

    cv.HoughCircles(
      maskedMat,
      circlesMat,
      cv.HOUGH_GRADIENT,
      bubbleConfig.dp,
      bubbleConfig.minDist,
      bubbleConfig.param1,
      bubbleConfig.param2,
      bubbleConfig.minRadius,
      bubbleConfig.maxRadius
    );

    const numCircles = circlesMat.cols;

    // 4. Extract raw candidates, extract features, and evaluate filtering rules
    for (let i = 0; i < numCircles; i++) {
      const x = circlesMat.data32F[i * 3];
      const y = circlesMat.data32F[i * 3 + 1];
      const r = circlesMat.data32F[i * 3 + 2];

      const rawCandidate = {
        id: i + 1,
        x: Math.round(x),
        y: Math.round(y),
        radius: Math.round(r),
        detectionMethod: 'hough'
      };

      rawCandidates.push(rawCandidate);

      // Feature extraction (ROI coverage, local contrast, edge strength, circularity)
      const features = extractCandidateFeatures(preprocessedMat, roi, rawCandidate);

      // Validation evaluation
      const evalResult = evaluateCandidate(
        rawCandidate, 
        features, 
        filterConfig, 
        bubbleConfig.minRadius, 
        bubbleConfig.maxRadius
      );

      const candidateObject = {
        ...rawCandidate,
        ...features,
        confidence: evalResult.confidence
      };

      if (evalResult.isValid) {
        validCandidates.push(candidateObject);
      } else {
        rejectedCandidates.push({
          ...candidateObject,
          reason: evalResult.reason
        });
      }
    }

    // 5. Perform Spatial NMS Deduplication
    const { acceptedBubbles, duplicates } = deduplicateCandidates(
      validCandidates, 
      filterConfig.duplicateDistanceFactor
    );

    // Append duplicates to rejectedCandidates list with reason 'duplicate'
    rejectedCandidates.push(...duplicates);

    // Re-assign clean consecutive IDs (#1, #2, #3...) to accepted final bubbles
    const finalBubbles = acceptedBubbles.map((b, idx) => ({
      ...b,
      id: idx + 1
    }));

    const endTime = performance.now();
    const processingTimeMs = parseFloat((endTime - startTime).toFixed(1));

    return {
      rawCandidates,
      acceptedBubbles: finalBubbles,
      rejectedCandidates,
      rawCandidateCount: rawCandidates.length,
      rejectedCandidateCount: rejectedCandidates.length,
      duplicateCount: duplicates.length,
      bubbleCount: finalBubbles.length,
      processingTimeMs,
      bubbleConfig,
      filterConfig
    };
  } finally {
    // GUARANTEED MEMORY CLEANUP: Delete all temporary WASM OpenCV matrices
    allocatedMats.forEach(mat => {
      if (mat && typeof mat.delete === 'function') deleteMat(mat);
    });
  }
}
