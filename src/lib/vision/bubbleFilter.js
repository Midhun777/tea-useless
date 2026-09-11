/**
 * BUBBLE-X Bubble Candidate Filtering, Validation & Deduplication Engine
 *
 * Dual-branch aware:
 *   - evaluateHoughCandidate   — ZERO pixel loops: confidence from geometry + ROI only
 *   - evaluateContourCandidate — uses contour-derived circularity (already computed in WASM)
 *   - classifyBubbleSize       — tags each bubble small/medium/large by pixel radius
 *   - deduplicateCandidates    — cross-branch circle IoU NMS
 *
 * PERFORMANCE NOTE:
 *   extractCandidateFeatures() (pixel-loop version) is intentionally NOT used in the
 *   Hough branch because iterating over pixel bounding boxes in JavaScript for every
 *   detected circle is O(circles × radius²) and blocks the main thread.
 *   The Hough branch uses a geometry-only confidence scoring approach instead.
 */

import { validateFilterConfig, BUBBLE_SIZE_THRESHOLDS } from './config';

// ---------------------------------------------------------------------------
// Hough Branch Evaluation — ZERO pixel loops, geometry-only confidence
// ---------------------------------------------------------------------------

/**
 * Evaluates a Hough candidate using only geometric properties.
 * No pixel array access — completely safe for main-thread execution.
 *
 * Confidence is derived from:
 *   - ROI coverage (how centred is the bubble within the tea surface)
 *   - Radius normalisation (mid-range radii score higher)
 *   - Base Hough confidence (Hough only returns circles that passed the accumulator)
 *
 * @param {Object} candidate    { x, y, radius }
 * @param {Object} roi          Tea ROI { centerX, centerY, radius }
 * @param {Object} rawFilter    Filter config overrides
 * @param {number} minRadius    Minimum accepted radius
 * @param {number} maxRadius    Maximum accepted radius
 * @returns {{ isValid, reason, confidence, roiCoverage, localContrast, edgeStrength, circularity }}
 */
export function evaluateHoughCandidate(candidate, roi, rawFilter = {}, minRadius, maxRadius) {
  const filterConfig = validateFilterConfig(rawFilter);
  const { x, y, radius } = candidate;

  // Radius bounds check
  if (radius < minRadius || radius > maxRadius) {
    return { isValid: false, reason: 'radius-out-of-range', confidence: 0.10,
      roiCoverage: 0, localContrast: 0, edgeStrength: 0, circularity: 0 };
  }

  // ROI coverage — pure geometry, no pixels
  let roiCoverage = 1.0;
  if (roi && roi.radius > 0) {
    const distFromRoiCentre = Math.hypot(x - roi.centerX, y - roi.centerY);
    const maxSafeDist = roi.radius - radius * 0.3;
    roiCoverage = distFromRoiCentre <= maxSafeDist
      ? 1.0
      : Math.max(0.0, (roi.radius + radius - distFromRoiCentre) / (2 * radius));
  }

  if (roiCoverage < filterConfig.minimumROICoverage) {
    return { isValid: false, reason: 'outside-roi', confidence: 0.20,
      roiCoverage, localContrast: 0, edgeStrength: 0, circularity: 0 };
  }

  // Radius score: bubbles in the middle of the radius range are more reliable
  const radiusRange = maxRadius - minRadius;
  const radiusMid   = minRadius + radiusRange * 0.4;
  const radiusScore = Math.max(0.3, 1.0 - Math.abs(radius - radiusMid) / radiusRange);

  // Hough baseline: any circle that passed the accumulator threshold gets
  // base edge/circularity scores (HoughCircles enforces circular shape)
  const edgeStrength  = 0.75;
  const circularity   = 0.80;
  const localContrast = 10.0; // assumed — Hough detects edge-ring structures

  // Weighted confidence — no pixel data needed
  const confidence = parseFloat(Math.min(1.0,
    (roiCoverage * 0.35) + (radiusScore * 0.30) + (edgeStrength * 0.20) + (circularity * 0.15)
  ).toFixed(2));

  if (confidence < filterConfig.minimumConfidence) {
    return { isValid: false, reason: 'low-confidence', confidence,
      roiCoverage, localContrast, edgeStrength, circularity };
  }

  return { isValid: true, reason: null, confidence, roiCoverage, localContrast, edgeStrength, circularity };
}

// ---------------------------------------------------------------------------
// Contour Branch Evaluation — uses WASM-computed circularity, no pixel loops
// ---------------------------------------------------------------------------

/**
 * Validates a contour candidate using contour-derived metrics (computed in WASM).
 * Circularity is pre-computed by contourDetection.js from contourArea/arcLength.
 */
export function evaluateContourCandidate(candidate, roi, rawFilter = {}) {
  const filterConfig = validateFilterConfig(rawFilter);
  const { x, y, radius, circularity = 0.7 } = candidate;

  // ROI coverage — geometry only
  let roiCoverage = 1.0;
  if (roi && roi.radius > 0) {
    const dist     = Math.hypot(x - roi.centerX, y - roi.centerY);
    const maxSafe  = roi.radius - radius * 0.3;
    roiCoverage = dist <= maxSafe
      ? 1.0
      : Math.max(0.0, (roi.radius + radius - dist) / (2 * radius));
  }

  if (roiCoverage < filterConfig.minimumROICoverage) {
    return { isValid: false, reason: 'outside-roi', roiCoverage, localContrast: 0, edgeStrength: 0, confidence: 0.20 };
  }

  if (circularity < filterConfig.minimumCircularity) {
    return { isValid: false, reason: 'low-circularity', roiCoverage, localContrast: 0, edgeStrength: 0, confidence: 0.35 };
  }

  // Contour-detected bubbles: circularity was enforced by WASM filter
  // Use it directly as a quality signal
  const localContrast = 12.0;
  const edgeStrength  = Math.min(1.0, circularity);
  const contrastNorm  = Math.min(1.0, localContrast / 18.0);
  const confidence    = parseFloat(Math.min(1.0,
    (roiCoverage * 0.30) + (contrastNorm * 0.25) + (edgeStrength * 0.25) + (circularity * 0.20)
  ).toFixed(2));

  if (confidence < filterConfig.minimumConfidence) {
    return { isValid: false, reason: 'low-confidence', roiCoverage, localContrast, edgeStrength, confidence };
  }

  return { isValid: true, reason: null, roiCoverage, localContrast, edgeStrength, confidence };
}

// ---------------------------------------------------------------------------
// Size Classification
// ---------------------------------------------------------------------------

/**
 * Classifies a bubble by pixel radius into 'small' | 'medium' | 'large'.
 * @param {number} radius  Pixel radius
 * @returns {'small'|'medium'|'large'}
 */
export function classifyBubbleSize(radius) {
  if (radius < BUBBLE_SIZE_THRESHOLDS.smallMaxRadius) return 'small';
  if (radius <= BUBBLE_SIZE_THRESHOLDS.mediumMaxRadius) return 'medium';
  return 'large';
}

// ---------------------------------------------------------------------------
// Cross-Branch IoU NMS Deduplication
// ---------------------------------------------------------------------------

/**
 * Computes Intersection over Union between two circles.
 */
function circleIoU(a, b) {
  const dist = Math.hypot(a.x - b.x, a.y - b.y);
  const r1 = a.radius;
  const r2 = b.radius;

  if (dist >= r1 + r2) return 0;
  if (dist <= Math.abs(r1 - r2)) {
    const smaller = Math.min(r1, r2);
    return (Math.PI * smaller * smaller) / (Math.PI * Math.max(r1, r2) ** 2);
  }

  const d1 = (dist * dist + r1 * r1 - r2 * r2) / (2 * dist);
  const d2 = dist - d1;
  const areaIntersect =
    r1 * r1 * Math.acos(Math.max(-1, Math.min(1, d1 / r1))) +
    r2 * r2 * Math.acos(Math.max(-1, Math.min(1, d2 / r2))) -
    d1 * Math.sqrt(Math.max(0, r1 * r1 - d1 * d1)) -
    d2 * Math.sqrt(Math.max(0, r2 * r2 - d2 * d2));

  const areaUnion = Math.PI * r1 * r1 + Math.PI * r2 * r2 - areaIntersect;
  return areaUnion > 0 ? Math.max(0, areaIntersect / areaUnion) : 0;
}

/**
 * Deduplicates overlapping candidates from merged Hough + Contour results.
 * Uses circle IoU + centre distance — preserves the higher-confidence candidate.
 *
 * @param {Array}  candidates  Merged array from both branches (with isValid flag)
 * @param {number} dupFactor   Distance factor from filterConfig.duplicateDistanceFactor
 * @returns {{ acceptedBubbles: Array, duplicates: Array }}
 */
export function deduplicateCandidates(candidates, dupFactor = 0.55) {
  const sorted   = [...candidates].sort((a, b) => b.confidence - a.confidence);
  const accepted = [];
  const duplicates = [];

  for (const cand of sorted) {
    let isDuplicate = false;

    for (const existing of accepted) {
      const iou  = circleIoU(cand, existing);
      const dist = Math.hypot(cand.x - existing.x, cand.y - existing.y);
      const minR = Math.min(cand.radius, existing.radius);

      if (iou > 0.25 || (dist < minR * dupFactor && Math.abs(cand.radius - existing.radius) < minR * 0.7)) {
        isDuplicate = true;
        duplicates.push({ ...cand, reason: 'duplicate', mergedWithId: existing.id });
        break;
      }
    }

    if (!isDuplicate) accepted.push(cand);
  }

  return { acceptedBubbles: accepted, duplicates };
}
