/**
 * BUBBLE-X Tea Surface Region of Interest (ROI) Detection Engine
 * 
 * Automatically detects, filters, and scores candidate circular/elliptical tea surface regions.
 * Provides heuristic confidence evaluation and guarantees explicit WASM memory cleanup.
 */

import { validateRoiConfig } from './config';

/**
 * Calculates heuristic score for a candidate circle (x, y, r) in image (width x height)
 */
function scoreCandidateCircle(x, y, r, width, height, config) {
  const imgArea = width * height;
  const candArea = Math.PI * r * r;
  const areaRatio = candArea / imgArea;

  // 1. Size score (ideal cup ratio is ~30% - 60% of image)
  let sizeScore = 0;
  if (areaRatio >= config.minAreaRatio && areaRatio <= config.maxAreaRatio) {
    // Normal distribution curve centered around 0.45
    const diff = Math.abs(areaRatio - 0.45);
    sizeScore = Math.max(0.2, 1.0 - (diff * 2.0));
  } else if (areaRatio < config.minAreaRatio) {
    sizeScore = Math.max(0, areaRatio / config.minAreaRatio * 0.3);
  } else {
    sizeScore = Math.max(0, (1 - areaRatio) / (1 - config.maxAreaRatio) * 0.3);
  }

  // 2. Center proximity score (tea cups are usually photographed near the center)
  const imgCenterX = width / 2;
  const imgCenterY = height / 2;
  const distFromCenter = Math.hypot(x - imgCenterX, y - imgCenterY);
  const maxAllowedDist = (Math.min(width, height) / 2) * config.centerTolerance;
  
  let centerScore = Math.max(0, 1.0 - (distFromCenter / maxAllowedDist));

  // 3. Boundary containment score (circle should lie mostly inside image frame)
  const isInsideLeft = (x - r) >= -10;
  const isInsideRight = (x + r) <= width + 10;
  const isInsideTop = (y - r) >= -10;
  const isInsideBottom = (y + r) <= height + 10;
  const boundaryScore = (isInsideLeft && isInsideRight && isInsideTop && isInsideBottom) ? 1.0 : 0.5;

  // Overall weighted confidence heuristic
  const confidence = (sizeScore * 0.45) + (centerScore * 0.45) + (boundaryScore * 0.10);

  return {
    confidence: parseFloat(confidence.toFixed(2)),
    scoreDetails: {
      sizeScore: parseFloat(sizeScore.toFixed(2)),
      centerScore: parseFloat(centerScore.toFixed(2)),
      boundaryScore: parseFloat(boundaryScore.toFixed(2)),
      areaRatio: parseFloat(areaRatio.toFixed(3))
    }
  };
}

/**
 * Detects tea surface ROI automatically using Hough Circles & Contour Filtering
 * 
 * @param {cv.Mat} grayMat Preprocessed single-channel image matrix (CV_8UC1)
 * @param {Object} rawConfig ROI parameters
 * @returns {Object} ROI representation { type, centerX, centerY, radius, confidence, method, scoreDetails }
 */
export function detectTeaRoi(grayMat, rawConfig = {}) {
  const cv = window.cv;
  if (!cv || !cv.Mat) {
    throw new Error('OpenCV.js is not initialized for ROI detection.');
  }

  if (!grayMat || grayMat.rows === 0 || grayMat.cols === 0) {
    throw new Error('Invalid matrix provided for ROI detection.');
  }

  const config = validateRoiConfig(rawConfig);
  const width = grayMat.cols;
  const height = grayMat.rows;
  const minDim = Math.min(width, height);

  const allocatedMats = [];
  let bestCandidate = null;

  try {
    // -------------------------------------------------------------
    // Attempt 1: Hough Circle Transform
    // -------------------------------------------------------------
    const circlesMat = new cv.Mat();
    allocatedMats.push(circlesMat);

    const minRadius = Math.round(minDim * Math.sqrt(config.minAreaRatio / Math.PI));
    const maxRadius = Math.round(minDim * Math.sqrt(config.maxAreaRatio / Math.PI));
    const minDist = Math.round(minDim * config.houghMinDistRatio);

    cv.HoughCircles(
      grayMat,
      circlesMat,
      cv.HOUGH_GRADIENT,
      config.houghDp,
      minDist,
      config.houghParam1,
      config.houghParam2,
      minRadius,
      maxRadius
    );

    const numCircles = circlesMat.cols;
    const candidates = [];

    for (let i = 0; i < numCircles; i++) {
      const x = circlesMat.data32F[i * 3];
      const y = circlesMat.data32F[i * 3 + 1];
      const r = circlesMat.data32F[i * 3 + 2];

      const scoreObj = scoreCandidateCircle(x, y, r, width, height, config);
      candidates.push({
        type: 'circle',
        centerX: Math.round(x),
        centerY: Math.round(y),
        radius: Math.round(r),
        confidence: scoreObj.confidence,
        scoreDetails: scoreObj.scoreDetails,
        method: 'automatic'
      });
    }

    // -------------------------------------------------------------
    // Attempt 2: Canny Edge + Contour Detection Fallback
    // -------------------------------------------------------------
    if (candidates.length === 0) {
      const edgesMat = new cv.Mat();
      allocatedMats.push(edgesMat);
      cv.Canny(grayMat, edgesMat, 50, 150);

      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      allocatedMats.push(contours, hierarchy);

      cv.findContours(edgesMat, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      for (let i = 0; i < contours.size(); i++) {
        const cnt = contours.get(i);
        const circle = cv.minEnclosingCircle(cnt);
        cnt.delete();

        const x = circle.center.x;
        const y = circle.center.y;
        const r = circle.radius;

        if (r >= minRadius && r <= maxRadius) {
          const scoreObj = scoreCandidateCircle(x, y, r, width, height, config);
          candidates.push({
            type: 'circle',
            centerX: Math.round(x),
            centerY: Math.round(y),
            radius: Math.round(r),
            confidence: scoreObj.confidence,
            scoreDetails: scoreObj.scoreDetails,
            method: 'automatic'
          });
        }
      }
    }

    // Pick candidate with highest heuristic confidence score
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.confidence - a.confidence);
      const topCandidate = candidates[0];

      if (topCandidate.confidence >= config.confidenceThreshold) {
        bestCandidate = topCandidate;
      }
    }

    // -------------------------------------------------------------
    // Fallback: Default Centered Tea Surface Region
    // -------------------------------------------------------------
    if (!bestCandidate) {
      const defaultRadius = Math.round(minDim * 0.38);
      bestCandidate = {
        type: 'circle',
        centerX: Math.round(width / 2),
        centerY: Math.round(height / 2),
        radius: defaultRadius,
        confidence: 0.45,
        method: 'manual', // Suggest manual review
        isFallback: true,
        scoreDetails: {
          sizeScore: 0.5,
          centerScore: 1.0,
          boundaryScore: 1.0,
          note: 'Automatic detection uncertain. Centered fallback applied.'
        }
      };
    }

    return bestCandidate;
  } finally {
    // WASM Memory Clean up
    allocatedMats.forEach(mat => {
      if (mat && typeof mat.delete === 'function') mat.delete();
    });
  }
}
