/**
 * BUBBLE-X Vision Utilities Domain Facade
 * Connects OpenCV.js engine with preprocessing, ROI surface detection, 
 * Hough candidate detection, candidate filtering/deduplication, and statistics calculations.
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
  DEFAULT_BUBBLE_CONFIG,
  DEFAULT_FILTER_CONFIG,
  validatePreprocessingConfig,
  validateRoiConfig,
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
  DEFAULT_BUBBLE_CONFIG,
  DEFAULT_FILTER_CONFIG,
  validatePreprocessingConfig,
  validateRoiConfig,
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
 * Complete Vision Pipeline Execution (Step 4 -> Step 5 -> Step 6 -> Step 7 -> Step 9 Statistics)
 * 
 * @param {HTMLImageElement} imgElement 
 * @param {Object} preprocessingConfig 
 * @param {Object} roiConfig 
 * @param {Object} bubbleConfig 
 * @param {Object} filterConfig 
 * @param {Object} calibration 
 * @returns {Promise<Object>} { stages, finalTelemetry, roi, maskDataUrl, bubbleResult, statistics, executionTimeMs }
 */
export async function processSpecimenPipeline(
  imgElement, 
  preprocessingConfig = DEFAULT_PREPROCESSING_CONFIG, 
  roiConfig = DEFAULT_ROI_CONFIG,
  bubbleConfig = DEFAULT_BUBBLE_CONFIG,
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
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
  };

  try {
    // 1. Convert image element to cv.Mat
    await notifyStage('ACQUIRING SPECIMEN');
    srcMat = imageToMat(imgElement);

    // 2. Step 4 Preprocessing
    await notifyStage('PREPROCESSING');
    const prepResult = executePreprocessingPipeline(srcMat, preprocessingConfig);
    preprocessedMat = prepResult.preprocessedMat;

    // 3. Step 5 Automatic ROI Detection
    await notifyStage('LOCATING TEA SURFACE');
    const detectedRoi = detectTeaRoi(preprocessedMat, roiConfig);

    // 4. Generate ROI Binary Mask Data URL
    const maskDataUrl = getRoiMaskDataUrl(preprocessedMat.cols, preprocessedMat.rows, detectedRoi);

    // 5. Step 6 + Step 7 Bubble Detection & Filtering/Deduplication
    await notifyStage('DETECTING BUBBLES');
    await notifyStage('VALIDATING CANDIDATES');
    const bubbleResult = detectBubbles(preprocessedMat, detectedRoi, bubbleConfig, filterConfig);

    // 6. Step 9 Pure JS Statistics Metrics Calculation
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
    // WASM Memory Cleanup
    if (srcMat) deleteMat(srcMat);
    if (preprocessedMat) deleteMat(preprocessedMat);
  }
}

// Backward compatibility alias
export const preprocessSpecimen = processSpecimenPipeline;
