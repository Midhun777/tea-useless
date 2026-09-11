/**
 * BUBBLE-X ROI Mask Operations
 * Creates single-channel binary masks (CV_8UC1) where 255 = tea surface ROI, 0 = background.
 */

import { matToDataURL } from './preprocessing';

/**
 * Creates an OpenCV binary mask matrix (CV_8UC1) for a given ROI representation.
 * Caller MUST delete the returned matrix using deleteMat() when finished!
 * 
 * @param {number} width 
 * @param {number} height 
 * @param {Object} roi { type, centerX, centerY, radius, width, height }
 * @returns {cv.Mat} Single-channel binary matrix (255 = inside ROI, 0 = outside)
 */
export function createRoiMaskMat(width, height, roi) {
  const cv = window.cv;
  if (!cv || !cv.Mat) {
    throw new Error('OpenCV.js is not initialized for mask creation.');
  }

  // Create black single-channel background matrix (CV_8UC1)
  const maskMat = cv.Mat.zeros(height, width, cv.CV_8UC1);

  if (!roi) return maskMat;

  const center = new cv.Point(roi.centerX, roi.centerY);
  const whiteColor = new cv.Scalar(255, 255, 255, 255);

  if (roi.type === 'circle' || !roi.type) {
    const radius = Math.max(1, Math.round(roi.radius || 100));
    // Draw filled circle (-1 thickness fills interior)
    cv.circle(maskMat, center, radius, whiteColor, -1);
  } else if (roi.type === 'ellipse') {
    const axes = new cv.Size(Math.max(1, Math.round(roi.radiusX || roi.width / 2)), Math.max(1, Math.round(roi.radiusY || roi.height / 2)));
    cv.ellipse(maskMat, center, axes, roi.angle || 0, 0, 360, whiteColor, -1);
  } else if (roi.type === 'rect') {
    const halfW = Math.round((roi.width || 100) / 2);
    const halfH = Math.round((roi.height || 100) / 2);
    const p1 = new cv.Point(Math.max(0, roi.centerX - halfW), Math.max(0, roi.centerY - halfH));
    const p2 = new cv.Point(Math.min(width, roi.centerX + halfW), Math.min(height, roi.centerY + halfH));
    cv.rectangle(maskMat, p1, p2, whiteColor, -1);
  }

  return maskMat;
}

/**
 * Helper to generate a PNG Data URL representation of binary ROI mask for UI inspection
 */
export function getRoiMaskDataUrl(width, height, roi) {
  if (!window.cv) return '';
  const maskMat = createRoiMaskMat(width, height, roi);
  try {
    return matToDataURL(maskMat);
  } finally {
    if (maskMat && typeof maskMat.delete === 'function') {
      maskMat.delete();
    }
  }
}
