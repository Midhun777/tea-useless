/**
 * BUBBLE-X Coordinate Mapping Utility
 * Converts OpenCV matrix coordinates (natural image space) to DOM screen coordinates,
 * taking into account container dimensions, aspect-ratio scaling, zoom factor, and pan offsets.
 */

/**
 * Maps a point and radius from natural image matrix space to DOM screen space.
 * 
 * @param {number} x Matrix X coordinate
 * @param {number} y Matrix Y coordinate
 * @param {number} radius Matrix radius in pixels
 * @param {number} naturalWidth Original matrix width
 * @param {number} naturalHeight Original matrix height
 * @param {number} displayWidth Rendered DOM width
 * @param {number} displayHeight Rendered DOM height
 * @param {number} zoom Current zoom level (1.0 = 100%)
 * @param {number} panX Pan offset X in pixels
 * @param {number} panY Pan offset Y in pixels
 * @returns {Object} { screenX, screenY, screenRadius, scaleX, scaleY }
 */
export function mapMatrixToScreen(
  x, 
  y, 
  radius = 0, 
  naturalWidth, 
  naturalHeight, 
  displayWidth, 
  displayHeight, 
  zoom = 1.0, 
  panX = 0, 
  panY = 0
) {
  if (!naturalWidth || !naturalHeight || !displayWidth || !displayHeight) {
    return { screenX: x, screenY: y, screenRadius: radius, scaleX: 1, scaleY: 1 };
  }

  const scaleX = (displayWidth / naturalWidth) * zoom;
  const scaleY = (displayHeight / naturalHeight) * zoom;
  const avgScale = (scaleX + scaleY) / 2;

  const screenX = (x * (displayWidth / naturalWidth) * zoom) + panX;
  const screenY = (y * (displayHeight / naturalHeight) * zoom) + panY;
  const screenRadius = Math.max(3, radius * avgScale);

  return {
    screenX,
    screenY,
    screenRadius,
    scaleX,
    scaleY
  };
}

/**
 * Checks if two bounding boxes or labels collide, used for label collision prevention.
 */
export function isLabelOverlapping(l1, l2) {
  return !(
    l1.x + l1.width < l2.x ||
    l1.x > l2.x + l2.width ||
    l1.y + l1.height < l2.y ||
    l1.y > l2.y + l2.height
  );
}
