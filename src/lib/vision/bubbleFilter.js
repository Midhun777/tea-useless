/**
 * BUBBLE-X Bubble Candidate Filtering, Validation & Deduplication Engine
 *
 * Dual-branch aware:
 *   - evaluateHoughCandidate  — Hough branch (large, faint bubbles): relaxed contrast
 *   - evaluateContourCandidate — Contour branch (small, visible bubbles): stricter circularity
 *   - classifyBubbleSize       — tags each bubble small/medium/large by pixel radius
 *   - deduplicateCandidates    — cross-branch IoU NMS
 */

import { validateFilterConfig, BUBBLE_SIZE_THRESHOLDS } from './config';

// ---------------------------------------------------------------------------
// Feature Extraction (shared by both branches via Hough path)
// ---------------------------------------------------------------------------

/**
 * Extracts geometric & image features for a circle candidate (x, y, radius px)
 * Works on the raw preprocessed grayscale mat.
 */
export function extractCandidateFeatures(grayMat, roi, candidate) {
  const { x, y, radius } = candidate;
  const width = grayMat.cols;
  const height = grayMat.rows;

  // 1. ROI Coverage
  let roiCoverage = 1.0;
  if (roi && roi.radius > 0) {
    const distFromRoiCenter = Math.hypot(x - roi.centerX, y - roi.centerY);
    const maxSafeDist = roi.radius - (radius * 0.3);
    roiCoverage = distFromRoiCenter <= maxSafeDist
      ? 1.0
      : Math.max(0.0, (roi.radius + radius - distFromRoiCenter) / (2 * radius));
  }

  // 2. Local Contrast (interior vs outer ring)
  let localContrast = 10.0;
  let edgeStrength = 0.75;
  let circularity = 0.80;

  if (grayMat && grayMat.data && width > 0 && height > 0) {
    try {
      const data = grayMat.data;
      let innerSum = 0, innerCount = 0;
      let outerSum = 0, outerCount = 0;

      const minX = Math.max(0, Math.floor(x - radius * 1.5));
      const maxX = Math.min(width - 1, Math.ceil(x + radius * 1.5));
      const minY = Math.max(0, Math.floor(y - radius * 1.5));
      const maxY = Math.min(height - 1, Math.ceil(y + radius * 1.5));

      for (let py = minY; py <= maxY; py++) {
        for (let px = minX; px <= maxX; px++) {
          const d2 = (px - x) ** 2 + (py - y) ** 2;
          const r2Inner    = (radius * 0.55) ** 2;
          const r2OuterMin = (radius * 0.85) ** 2;
          const r2OuterMax = (radius * 1.50) ** 2;
          const val = data[py * width + px];
          if (d2 <= r2Inner) { innerSum += val; innerCount++; }
          else if (d2 >= r2OuterMin && d2 <= r2OuterMax) { outerSum += val; outerCount++; }
        }
      }

      if (innerCount > 0 && outerCount > 0) {
        const innerMean = innerSum / innerCount;
        const outerMean = outerSum / outerCount;
        localContrast = Math.abs(innerMean - outerMean);
        edgeStrength  = Math.min(1.0, Math.max(0.2, localContrast / 25.0));
        circularity   = Math.min(1.0, Math.max(0.3, 0.60 + (edgeStrength * 0.40)));
      }
    } catch (e) {
      console.warn('[Feature Extraction Warning]', e);
    }
  }

  return {
    area: Math.round(Math.PI * radius * radius),
    roiCoverage:   parseFloat(roiCoverage.toFixed(2)),
    localContrast: parseFloat(localContrast.toFixed(1)),
    edgeStrength:  parseFloat(edgeStrength.toFixed(2)),
    circularity:   parseFloat(circularity.toFixed(2))
  };
}

// ---------------------------------------------------------------------------
// Hough Branch Evaluation — relaxed contrast threshold for faint bubbles
// ---------------------------------------------------------------------------

/**
 * Validates a Hough candidate with relaxed contrast rules (faint/large bubbles
 * typically have weaker interior-exterior delta than contour-detected ones).
 */
export function evaluateHoughCandidate(candidate, features, rawFilterConfig = {}, minRadius, maxRadius) {
  const filterConfig = validateFilterConfig(rawFilterConfig);
  const { radius } = candidate;
  const { roiCoverage, localContrast, edgeStrength, circularity } = features;

  if (radius < minRadius || radius > maxRadius) {
    return { isValid: false, reason: 'radius-out-of-range', confidence: 0.10 };
  }

  if (roiCoverage < filterConfig.minimumROICoverage) {
    return { isValid: false, reason: 'outside-roi', confidence: 0.20 };
  }

  // Hough-specific: halved minimum contrast — faint bubbles OK
  const houghMinContrast = Math.max(1.5, filterConfig.minimumLocalContrast * 0.5);
  if (localContrast < houghMinContrast) {
    return { isValid: false, reason: 'low-contrast', confidence: 0.30 };
  }

  // Circularity check (relaxed slightly for Hough — elliptical bubbles allowed)
  const houghMinCircularity = Math.max(0.30, filterConfig.minimumCircularity - 0.10);
  if (circularity < houghMinCircularity) {
    return { isValid: false, reason: 'low-circularity', confidence: 0.35 };
  }

  // Weighted confidence — Hough prizes edge strength + ROI coverage
  const contrastNorm = Math.min(1.0, localContrast / 18.0);
  const confidence = (roiCoverage * 0.30) + (contrastNorm * 0.25) + (edgeStrength * 0.25) + (circularity * 0.20);
  const roundedConfidence = parseFloat(Math.min(1.0, Math.max(0.0, confidence)).toFixed(2));

  if (roundedConfidence < filterConfig.minimumConfidence) {
    return { isValid: false, reason: 'low-confidence', confidence: roundedConfidence };
  }

  return { isValid: true, reason: null, confidence: roundedConfidence };
}

// ---------------------------------------------------------------------------
// Contour Branch Evaluation — stricter circularity, lower contrast needed
// ---------------------------------------------------------------------------

/**
 * Validates a contour candidate. Since contours already enforce circularity
 * via 4πA/P², confidence scoring can rely more on ROI coverage + area bounds.
 * Contrast is typically strong for visible small bubbles — but the interior
 * pixel sampling is less reliable at r < 5 px, so we soften it.
 */
export function evaluateContourCandidate(candidate, roi, rawFilterConfig = {}) {
  const filterConfig = validateFilterConfig(rawFilterConfig);
  const { x, y, radius, circularity = 0.7 } = candidate;

  // ROI coverage
  let roiCoverage = 1.0;
  if (roi && roi.radius > 0) {
    const dist = Math.hypot(x - roi.centerX, y - roi.centerY);
    const maxSafe = roi.radius - radius * 0.3;
    roiCoverage = dist <= maxSafe
      ? 1.0
      : Math.max(0.0, (roi.radius + radius - dist) / (2 * radius));
  }

  if (roiCoverage < filterConfig.minimumROICoverage) {
    return { isValid: false, reason: 'outside-roi', roiCoverage, localContrast: 0, edgeStrength: 0, confidence: 0.20 };
  }

  // Circularity already guaranteed by contour filter in contourDetection.js
  // Only need to re-check against shared config
  if (circularity < filterConfig.minimumCircularity) {
    return { isValid: false, reason: 'low-circularity', roiCoverage, localContrast: 0, edgeStrength: 0, confidence: 0.35 };
  }

  // Confidence: circularity + ROI coverage dominate; small bubbles treated at full confidence
  const localContrast = 12.0; // assumed good for contour-detected (adaptive threshold ensures this)
  const edgeStrength = Math.min(1.0, circularity);
  const contrastNorm = Math.min(1.0, localContrast / 18.0);
  const confidence = parseFloat(
    Math.min(1.0, (roiCoverage * 0.30) + (contrastNorm * 0.25) + (edgeStrength * 0.25) + (circularity * 0.20)).toFixed(2)
  );

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
 * Thresholds are defined in BUBBLE_SIZE_THRESHOLDS in config.js.
 *
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
 * Used for cross-branch duplicate detection.
 *
 * @param {{x,y,radius}} a
 * @param {{x,y,radius}} b
 * @returns {number} IoU in [0, 1]
 */
function circleIoU(a, b) {
  const dist = Math.hypot(a.x - b.x, a.y - b.y);
  const r1 = a.radius;
  const r2 = b.radius;

  if (dist >= r1 + r2) return 0; // No overlap
  if (dist <= Math.abs(r1 - r2)) {
    // One circle fully inside the other
    const smaller = Math.min(r1, r2);
    return (Math.PI * smaller * smaller) / (Math.PI * Math.max(r1, r2) ** 2);
  }

  // Lens-shaped intersection area
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
 * Cross-branch merging policy:
 *   - IoU > 0.25 OR centre distance < min(r1,r2)*0.5 → duplicate
 *   - Keep whichever has higher confidence (prefer contour for small, hough for large)
 *
 * @param {Array} candidates   Merged array from both branches (with isValid flag)
 * @param {number} dupFactor   Distance factor from filterConfig.duplicateDistanceFactor
 * @returns {{ acceptedBubbles: Array, duplicates: Array }}
 */
export function deduplicateCandidates(candidates, dupFactor = 0.55) {
  // Sort by confidence descending so NMS keeps the best candidate
  const sorted = [...candidates].sort((a, b) => b.confidence - a.confidence);
  const accepted = [];
  const duplicates = [];

  for (const cand of sorted) {
    let isDuplicate = false;

    for (const existing of accepted) {
      const iou = circleIoU(cand, existing);
      const dist = Math.hypot(cand.x - existing.x, cand.y - existing.y);
      const minR = Math.min(cand.radius, existing.radius);
      const thresholdDist = minR * dupFactor;

      if (iou > 0.25 || (dist < thresholdDist && Math.abs(cand.radius - existing.radius) < minR * 0.7)) {
        isDuplicate = true;
        duplicates.push({
          ...cand,
          reason: 'duplicate',
          mergedWithId: existing.id
        });
        break;
      }
    }

    if (!isDuplicate) {
      accepted.push(cand);
    }
  }

  return { acceptedBubbles: accepted, duplicates };
}
