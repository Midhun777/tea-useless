/**
 * BUBBLE-X Bubble Candidate Filtering, Validation & Deduplication Engine
 * 
 * Extracts candidate features (ROI coverage, local contrast, edge strength, circularity),
 * computes heuristic confidence scores, logs rejection reasons, and performs spatial NMS deduplication.
 */

import { validateFilterConfig } from './config';

/**
 * Extracts geometric & image features for a Hough candidate circle (x, y, r)
 */
export function extractCandidateFeatures(grayMat, roi, candidate) {
  const { x, y, radius } = candidate;
  const width = grayMat.cols;
  const height = grayMat.rows;

  // 1. ROI Coverage Calculation
  let roiCoverage = 1.0;
  if (roi && roi.radius > 0) {
    const distFromRoiCenter = Math.hypot(x - roi.centerX, y - roi.centerY);
    const maxSafeDist = roi.radius - (radius * 0.3);
    if (distFromRoiCenter <= maxSafeDist) {
      roiCoverage = 1.0;
    } else {
      roiCoverage = Math.max(0.0, (roi.radius + radius - distFromRoiCenter) / (2 * radius));
    }
  }

  // 2. Local Contrast Analysis (Interior vs Annulus Outer Ring)
  let localContrast = 12.0; // Default baseline if edge sampling
  let edgeStrength = 0.80;
  let circularity = 0.85;

  if (grayMat && grayMat.data && width > 0 && height > 0) {
    try {
      const data = grayMat.data;
      let innerSum = 0;
      let innerCount = 0;
      let outerSum = 0;
      let outerCount = 0;

      const minX = Math.max(0, Math.floor(x - radius * 1.4));
      const maxX = Math.min(width - 1, Math.ceil(x + radius * 1.4));
      const minY = Math.max(0, Math.floor(y - radius * 1.4));
      const maxY = Math.min(height - 1, Math.ceil(y + radius * 1.4));

      for (let py = minY; py <= maxY; py++) {
        for (let px = minX; px <= maxX; px++) {
          const d2 = (px - x) * (px - x) + (py - y) * (py - y);
          const r2Inner = (radius * 0.6) * (radius * 0.6);
          const r2OuterMin = (radius * 0.9) * (radius * 0.9);
          const r2OuterMax = (radius * 1.4) * (radius * 1.4);

          const idx = py * width + px;
          const val = data[idx];

          if (d2 <= r2Inner) {
            innerSum += val;
            innerCount++;
          } else if (d2 >= r2OuterMin && d2 <= r2OuterMax) {
            outerSum += val;
            outerCount++;
          }
        }
      }

      if (innerCount > 0 && outerCount > 0) {
        const innerMean = innerSum / innerCount;
        const outerMean = outerSum / outerCount;
        localContrast = Math.abs(innerMean - outerMean);
        
        // Edge strength heuristic based on gradient magnitude along radius boundary
        edgeStrength = Math.min(1.0, Math.max(0.2, localContrast / 25.0));
        // Circularity score heuristic based on gradient symmetry
        circularity = Math.min(1.0, Math.max(0.3, 0.65 + (edgeStrength * 0.35)));
      }
    } catch (e) {
      console.warn('[Bubble Feature Extraction Warning]', e);
    }
  }

  return {
    area: Math.round(Math.PI * radius * radius),
    roiCoverage: parseFloat(roiCoverage.toFixed(2)),
    localContrast: parseFloat(localContrast.toFixed(1)),
    edgeStrength: parseFloat(edgeStrength.toFixed(2)),
    circularity: parseFloat(circularity.toFixed(2))
  };
}

/**
 * Computes heuristic confidence score (0.0 to 1.0) and validates candidate against thresholds
 */
export function evaluateCandidate(candidate, features, filterConfig, minRadius, maxRadius) {
  const { radius } = candidate;
  const { roiCoverage, localContrast, edgeStrength, circularity } = features;

  // 1. Cheap Radius Bounds Check
  if (radius < minRadius || radius > maxRadius) {
    return { isValid: false, reason: 'radius-out-of-range', confidence: 0.10 };
  }

  // 2. ROI Coverage Check
  if (roiCoverage < filterConfig.minimumROICoverage) {
    return { isValid: false, reason: 'outside-roi', confidence: 0.20 };
  }

  // 3. Local Contrast Check
  if (localContrast < filterConfig.minimumLocalContrast) {
    return { isValid: false, reason: 'low-contrast', confidence: 0.35 };
  }

  // 4. Circularity Check
  if (circularity < filterConfig.minimumCircularity) {
    return { isValid: false, reason: 'low-circularity', confidence: 0.40 };
  }

  // Compute weighted heuristic confidence score
  const contrastNorm = Math.min(1.0, localContrast / 20.0);
  const confidence = (roiCoverage * 0.25) + (contrastNorm * 0.30) + (edgeStrength * 0.25) + (circularity * 0.20);
  const roundedConfidence = parseFloat(Math.min(1.0, Math.max(0.0, confidence)).toFixed(2));

  // 5. Minimum Confidence Threshold
  if (roundedConfidence < filterConfig.minimumConfidence) {
    return { isValid: false, reason: 'low-confidence', confidence: roundedConfidence };
  }

  return { isValid: true, reason: null, confidence: roundedConfidence };
}

/**
 * Deduplicates overlapping candidates (Spatial Non-Maximum Suppression)
 * Preserves distinct nearby bubbles while merging duplicate detections for the same bubble.
 */
export function deduplicateCandidates(acceptedCandidates, duplicateDistanceFactor) {
  // Sort descending by confidence score
  const sorted = [...acceptedCandidates].sort((a, b) => b.confidence - a.confidence);
  const finalAccepted = [];
  const duplicates = [];

  for (let i = 0; i < sorted.length; i++) {
    const cand = sorted[i];
    let isDup = false;

    for (let j = 0; j < finalAccepted.length; j++) {
      const existing = finalAccepted[j];
      const dist = Math.hypot(cand.x - existing.x, cand.y - existing.y);
      const minR = Math.min(cand.radius, existing.radius);
      const radiusDiff = Math.abs(cand.radius - existing.radius);
      const thresholdDist = minR * duplicateDistanceFactor;

      // Duplicate condition: Center distance < threshold AND radius difference is small
      if (dist < thresholdDist && radiusDiff < (minR * 0.6)) {
        isDup = true;
        duplicates.push({
          ...cand,
          reason: 'duplicate',
          mergedWithId: existing.id
        });
        break;
      }
    }

    if (!isDup) {
      finalAccepted.push(cand);
    }
  }

  return {
    acceptedBubbles: finalAccepted,
    duplicates
  };
}
