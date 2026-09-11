/**
 * BUBBLE-X Vision Utilities Domain Facade
 * Connects OpenCV.js engine with preprocessing, ROI surface detection,
 * dual-branch bubble detection (Hough + Contour), and statistics calculations.
 */

import {
  loadOpenCV,
  isOpenCVReady,
  imageToMat,
  deleteMat,
  getMatTelemetry
} from './opencv';
import {
  DEFAULT_PREPROCESSING_CONFIG,
  DEFAULT_ROI_CONFIG,
  DEFAULT_HOUGH_CONFIG,
  DEFAULT_CONTOUR_CONFIG,
  DEFAULT_FILTER_CONFIG,
  DEFAULT_BUBBLE_CONFIG,
  validatePreprocessingConfig,
  validateRoiConfig,
  validateHoughConfig,
  validateContourConfig,
  validateBubbleConfig,
  validateFilterConfig
} from './vision/config';
import {
  executePreprocessingPipeline
} from './vision/preprocessing';
import {
  detectTeaRoi
} from './vision/roiDetection';
import {
  createRoiMaskMat,
  getRoiMaskDataUrl
} from './vision/roiMask';
import {
  detectBubbles
} from './vision/bubbleDetection';
import {
  calculateBubbleStatistics,
  calculateMean,
  calculateMedian,
  calculateStandardDeviation,
  calculateNearestNeighbourDistances
} from './vision/statistics';

export {
  loadOpenCV,
  isOpenCVReady,
  imageToMat,
  deleteMat,
  getMatTelemetry,
  DEFAULT_PREPROCESSING_CONFIG,
  DEFAULT_ROI_CONFIG,
  DEFAULT_HOUGH_CONFIG,
  DEFAULT_CONTOUR_CONFIG,
  DEFAULT_FILTER_CONFIG,
  DEFAULT_BUBBLE_CONFIG,
  validatePreprocessingConfig,
  validateRoiConfig,
  validateHoughConfig,
  validateContourConfig,
  validateBubbleConfig,
  validateFilterConfig,
  detectTeaRoi,
  createRoiMaskMat,
  getRoiMaskDataUrl,
  detectBubbles,
  calculateBubbleStatistics,
  calculateMean,
  calculateMedian,
  calculateStandardDeviation,
  calculateNearestNeighbourDistances
};

/**
 * Yields the main thread to let the browser repaint / handle events.
 * Critical for keeping the UI responsive during heavy WASM processing.
 */
const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Complete Vision Pipeline Execution
 * Preprocessing → ROI Detection → Dual-Branch Bubble Detection → Statistics
 *
 * @param {HTMLImageElement} imgElement
 * @param {Object} preprocessingConfig
 * @param {Object} roiConfig
 * @param {Object} houghConfig       Hough branch overrides
 * @param {Object} contourConfig     Contour branch overrides
 * @param {Object} filterConfig      Shared merge filter overrides
 * @param {Object} calibration
 * @param {Function} onStageChange   Progress callback (stageName: string) => void
 * @returns {Promise<Object>}
 */
export async function processSpecimenPipeline(
  imgElement,
  preprocessingConfig = DEFAULT_PREPROCESSING_CONFIG,
  roiConfig = DEFAULT_ROI_CONFIG,
  houghConfig = DEFAULT_HOUGH_CONFIG,
  contourConfig = DEFAULT_CONTOUR_CONFIG,
  filterConfig = DEFAULT_FILTER_CONFIG,
  calibration = null,
  onStageChange = null
) {
  if (!isOpenCVReady()) {
    await loadOpenCV();
  }

  const startTime = performance.now();
  let srcMat = null;
  let preprocessedMat = null;

  const notifyStage = async (stageName) => {
    if (onStageChange && typeof onStageChange === 'function') {
      onStageChange(stageName);
    }
    // Always yield to main thread so browser stays responsive
    await yieldToMain();
  };

  try {
    // 1. Convert image element to cv.Mat
    await notifyStage('ACQUIRING SPECIMEN');
    srcMat = imageToMat(imgElement);

    // 2. Preprocessing: resize → grayscale → Gaussian blur → CLAHE
    await notifyStage('PREPROCESSING IMAGE');
    const prepResult = executePreprocessingPipeline(srcMat, preprocessingConfig);
    preprocessedMat = prepResult.preprocessedMat;

    // 3. ROI Detection: locate tea cup surface
    await notifyStage('LOCATING TEA SURFACE');
    const detectedRoi = detectTeaRoi(preprocessedMat, roiConfig);

    // 4. ROI mask data URL for debug overlay
    const maskDataUrl = getRoiMaskDataUrl(preprocessedMat.cols, preprocessedMat.rows, detectedRoi);

    // 5. Dual-branch bubble detection
    await notifyStage('HOUGH SCAN — LARGE BUBBLES');
    await notifyStage('CONTOUR SCAN — SMALL BUBBLES');
    const bubbleResult = await detectBubbles(
      preprocessedMat,
      detectedRoi,
      houghConfig,
      contourConfig,
      filterConfig
    );

    // 6. Statistics
    await notifyStage('CALCULATING METRICS');
    const statistics = calculateBubbleStatistics(bubbleResult.acceptedBubbles, detectedRoi, calibration);

    const endTime = performance.now();
    const executionTimeMs = parseFloat((endTime - startTime).toFixed(1));

    await notifyStage('ANALYSIS COMPLETE');

    return {
      stages: prepResult.stages,
      finalStageId: prepResult.finalStageId,
      finalTelemetry: {
        width: preprocessedMat.cols,
        height: preprocessedMat.rows,
        channels: preprocessedMat.channels()
      },
      config: prepResult.config,
      roi: detectedRoi,
      maskDataUrl,
      bubbleResult,
      statistics,
      executionTimeMs
    };
  } finally {
    if (srcMat) deleteMat(srcMat);
    if (preprocessedMat) deleteMat(preprocessedMat);
  }
}

// Backward compatibility alias
export const preprocessSpecimen = processSpecimenPipeline;
