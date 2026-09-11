/**
 * BUBBLE-X Dual-Branch Bubble Detection Orchestrator (v3)
 *
 * Runs two parallel OpenCV detection branches and merges their results:
 *
 *   Branch A — Hough (houghDetection.js)
 *     → prioritises LARGE + faint + circular bubbles
 *     → extra soft blur, low accumulator threshold, radius 12–120 px
 *
 *   Branch B — Contour/Watershed (contourDetection.js)
 *     → prioritises SMALL + touching + visible bubbles
 *     → adaptive threshold, morph open, watershed, circularity filter, radius 2–30 px
 *
 * After both branches complete:
 *   1. Valid candidates from both branches are merged
 *   2. Cross-branch IoU NMS deduplication removes duplicates
 *   3. Every accepted bubble is tagged with sizeClass: 'small'|'medium'|'large'
 *   4. Consecutive IDs (#1, #2…) are assigned to final accepted set
 */

import { validateHoughConfig, validateContourConfig, validateFilterConfig } from './config';
import { detectHoughBubbles } from './houghDetection';
import { detectContourBubbles } from './contourDetection';
import { classifyBubbleSize, deduplicateCandidates } from './bubbleFilter';

/**
 * Yields the main thread before/after heavy WASM operations.
 */
const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Full dual-branch bubble detection pipeline.
 *
 * @param {cv.Mat} preprocessedMat  Grayscale CV_8UC1 matrix
 * @param {Object} roi              Tea ROI { centerX, centerY, radius, ... }
 * @param {Object} rawHoughConfig   Hough branch config overrides
 * @param {Object} rawContourConfig Contour branch config overrides
 * @param {Object} rawFilterConfig  Shared post-merge filter config overrides
 * @returns {Promise<Object>} Full detection result object
 */
export async function detectBubbles(
  preprocessedMat,
  roi,
  rawHoughConfig = {},
  rawContourConfig = {},
  rawFilterConfig = {}
) {
  const cv = window.cv;
  if (!cv || !cv.Mat) {
    throw new Error('OpenCV.js is not initialized for bubble detection.');
  }

  if (!preprocessedMat || preprocessedMat.cols === 0 || preprocessedMat.rows === 0) {
    throw new Error('Invalid preprocessed image matrix provided for bubble detection.');
  }

  const houghConfig   = validateHoughConfig(rawHoughConfig);
  const contourConfig = validateContourConfig(rawContourConfig);
  const filterConfig  = validateFilterConfig(rawFilterConfig);

  const startTime = performance.now();

  // -------------------------------------------------------------------------
  // Branch A: Hough — large, faint, circular bubbles
  // -------------------------------------------------------------------------
  let houghCandidates = [];
  try {
    await yieldToMain();
    houghCandidates = detectHoughBubbles(preprocessedMat, roi, rawHoughConfig, rawFilterConfig);
  } catch (err) {
    console.warn('[Hough Branch Error]', err.message);
  }

  // -------------------------------------------------------------------------
  // Branch B: Contour/Watershed — small, touching, visible bubbles
  // -------------------------------------------------------------------------
  let contourCandidates = [];
  try {
    await yieldToMain();
    contourCandidates = detectContourBubbles(preprocessedMat, roi, rawContourConfig, rawFilterConfig);
  } catch (err) {
    console.warn('[Contour Branch Error]', err.message);
  }

  // -------------------------------------------------------------------------
  // Merge: combine all raw candidates for telemetry
  // -------------------------------------------------------------------------
  const allRawCandidates = [...houghCandidates, ...contourCandidates];

  // Separate valid from invalid (per-branch validation already done)
  const validCandidates    = allRawCandidates.filter(c => c.isValid);
  const preMergeRejected   = allRawCandidates.filter(c => !c.isValid);

  // -------------------------------------------------------------------------
  // Cross-branch IoU NMS Deduplication
  // -------------------------------------------------------------------------
  const { acceptedBubbles, duplicates } = deduplicateCandidates(
    validCandidates,
    filterConfig.duplicateDistanceFactor
  );

  // -------------------------------------------------------------------------
  // Size Classification + clean final IDs
  // -------------------------------------------------------------------------
  const finalBubbles = acceptedBubbles.map((b, idx) => ({
    ...b,
    id: idx + 1,
    sizeClass: classifyBubbleSize(b.radius)
  }));

  // Collect all rejected (per-branch + duplicates) for debug overlay
  const allRejected = [
    ...preMergeRejected,
    ...duplicates
  ];

  const endTime = performance.now();
  const processingTimeMs = parseFloat((endTime - startTime).toFixed(1));

  // -------------------------------------------------------------------------
  // Branch telemetry breakdown
  // -------------------------------------------------------------------------
  const houghAccepted   = finalBubbles.filter(b => b.detectionMethod === 'hough').length;
  const contourAccepted = finalBubbles.filter(b => b.detectionMethod === 'contour').length;

  const sizeBreakdown = {
    small:  finalBubbles.filter(b => b.sizeClass === 'small').length,
    medium: finalBubbles.filter(b => b.sizeClass === 'medium').length,
    large:  finalBubbles.filter(b => b.sizeClass === 'large').length
  };

  return {
    // Core detection results
    acceptedBubbles:       finalBubbles,
    rawCandidates:         allRawCandidates,
    rejectedCandidates:    allRejected,

    // Counts
    bubbleCount:           finalBubbles.length,
    rawCandidateCount:     allRawCandidates.length,
    rejectedCandidateCount: allRejected.length,
    duplicateCount:        duplicates.length,

    // Branch breakdown
    branchTelemetry: {
      houghRaw:       houghCandidates.length,
      houghValid:     houghCandidates.filter(c => c.isValid).length,
      houghAccepted,
      contourRaw:     contourCandidates.length,
      contourValid:   contourCandidates.filter(c => c.isValid).length,
      contourAccepted
    },

    // Size classification
    sizeBreakdown,

    // Timing & configs
    processingTimeMs,
    houghConfig,
    contourConfig,
    filterConfig
  };
}
