/**
 * BUBBLE-X Pure JavaScript Bubble Statistics Engine
 * 
 * Performs deterministic mathematical calculations on validated bubble detections:
 * - Count & radius statistics (min, max, mean, median, stdDev)
 * - Estimated circular area (min, max, mean, total)
 * - Bubble density (bubbles per 100k px²) & surface coverage %
 * - Heuristic confidence statistics
 * - Histogram size distribution bins
 * - Spatial distribution (center of mass & spread)
 * - Nearest-neighbour distance analysis (for N >= 2)
 * - Physical calibration scale conversion support
 */

/**
 * Calculates mean of an array of numbers
 */
export function calculateMean(values) {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return parseFloat((sum / values.length).toFixed(2));
}

/**
 * Calculates median of an array of numbers
 */
export function calculateMedian(values) {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return parseFloat(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
  }
  return parseFloat(sorted[mid].toFixed(2));
}

/**
 * Calculates standard deviation of an array of numbers
 */
export function calculateStandardDeviation(values, meanValue = null) {
  if (!values || values.length <= 1) return 0;
  const mean = meanValue !== null ? meanValue : calculateMean(values);
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
  return parseFloat(Math.sqrt(variance).toFixed(2));
}

/**
 * Calculates nearest-neighbour distances for each bubble in array (for N >= 2)
 * Returns { mean, min, max } or null if N < 2.
 */
export function calculateNearestNeighbourDistances(bubbles, pxPerMm = null) {
  if (!bubbles || bubbles.length < 2) return null;

  const nnDistances = [];
  const scale = (pxPerMm && pxPerMm > 0) ? (1 / pxPerMm) : 1.0;

  for (let i = 0; i < bubbles.length; i++) {
    let minDist = Infinity;
    const b1 = bubbles[i];

    for (let j = 0; j < bubbles.length; j++) {
      if (i === j) continue;
      const b2 = bubbles[j];
      const dist = Math.hypot(b1.x - b2.x, b1.y - b2.y) * scale;
      if (dist < minDist) {
        minDist = dist;
      }
    }

    if (minDist !== Infinity) {
      nnDistances.push(minDist);
    }
  }

  if (nnDistances.length === 0) return null;

  const min = parseFloat(Math.min(...nnDistances).toFixed(2));
  const max = parseFloat(Math.max(...nnDistances).toFixed(2));
  const mean = calculateMean(nnDistances);

  return {
    mean,
    min,
    max,
    unit: pxPerMm ? 'mm' : 'px'
  };
}

/**
 * Generates histogram-ready size distribution bins based on candidate radii
 */
export function calculateSizeDistribution(radii, numBins = 4) {
  if (!radii || radii.length === 0) return [];

  const minR = Math.floor(Math.min(...radii));
  const maxR = Math.ceil(Math.max(...radii));

  if (minR === maxR) {
    return [{ range: `${minR} px`, count: radii.length }];
  }

  const binWidth = Math.max(1, Math.ceil((maxR - minR) / numBins));
  const bins = [];

  for (let i = 0; i < numBins; i++) {
    const start = minR + (i * binWidth);
    const end = (i === numBins - 1) ? maxR : start + binWidth;
    
    const count = radii.filter(r => (i === numBins - 1) ? (r >= start && r <= end) : (r >= start && r < end)).length;
    
    bins.push({
      range: `${start}–${end} px`,
      count
    });
  }

  return bins;
}

/**
 * Main Pure JS Function: Computes complete statistics schema for validated bubbles & ROI
 * 
 * @param {Array} bubbles Validated bubble objects [{ x, y, radius, confidence, area }]
 * @param {Object} roi Tea surface ROI { type, centerX, centerY, radius }
 * @param {Object} calibration Optional calibration { enabled, pixelsPerMillimeter }
 * @returns {Object} Complete statistics schema object
 */
export function calculateBubbleStatistics(bubbles = [], roi = null, calibration = null) {
  const count = bubbles ? bubbles.length : 0;
  const isCalibrated = !!(calibration && calibration.enabled && calibration.pixelsPerMillimeter > 0);
  const pxPerMm = isCalibrated ? calibration.pixelsPerMillimeter : null;

  // Unit strings
  const distUnit = isCalibrated ? 'mm' : 'px';
  const areaUnit = isCalibrated ? 'mm²' : 'px²';

  // ROI area calculation in pixels
  let roiAreaPx = 0;
  if (roi) {
    if (roi.type === 'circle' || !roi.type) {
      roiAreaPx = Math.PI * Math.pow(roi.radius || 100, 2);
    } else if (roi.type === 'rect') {
      roiAreaPx = (roi.width || 200) * (roi.height || 200);
    }
  }

  // -------------------------------------------------------------
  // Edge Case: 0 Bubbles
  // -------------------------------------------------------------
  if (!bubbles || count === 0) {
    return {
      count: 0,
      radius: { min: 0, max: 0, mean: 0, median: 0, standardDeviation: 0, unit: distUnit },
      area: { min: 0, max: 0, mean: 0, total: 0, unit: areaUnit },
      density: { value: 0, unit: 'bubbles / 100k px²' },
      coveragePercent: 0.0,
      confidence: { mean: 0, min: 0, max: 0 },
      sizeDistribution: [],
      spatial: { centerX: 0, centerY: 0, spreadX: 0, spreadY: 0 },
      nearestNeighbour: null,
      calibration: { enabled: isCalibrated, pixelsPerMillimeter: pxPerMm }
    };
  }

  // Raw radii & areas extraction
  const rawRadii = bubbles.map(b => b.radius);
  const scaledRadii = isCalibrated ? rawRadii.map(r => parseFloat((r / pxPerMm).toFixed(2))) : rawRadii;

  const rawAreas = bubbles.map(b => b.area || (Math.PI * b.radius * b.radius));
  const scaledAreas = isCalibrated ? rawAreas.map(a => parseFloat((a / Math.pow(pxPerMm, 2)).toFixed(2))) : rawAreas;

  const confidences = bubbles.map(b => b.confidence || 0.80);

  // 1. Radius statistics
  const minRadius = parseFloat(Math.min(...scaledRadii).toFixed(2));
  const maxRadius = parseFloat(Math.max(...scaledRadii).toFixed(2));
  const meanRadius = calculateMean(scaledRadii);
  const medianRadius = calculateMedian(scaledRadii);
  const stdDevRadius = calculateStandardDeviation(scaledRadii, meanRadius);

  // 2. Area statistics
  const totalBubbleAreaPx = rawAreas.reduce((acc, a) => acc + a, 0);
  const totalBubbleArea = isCalibrated ? parseFloat((totalBubbleAreaPx / Math.pow(pxPerMm, 2)).toFixed(2)) : parseFloat(totalBubbleAreaPx.toFixed(1));
  const minArea = parseFloat(Math.min(...scaledAreas).toFixed(2));
  const maxArea = parseFloat(Math.max(...scaledAreas).toFixed(2));
  const meanArea = calculateMean(scaledAreas);

  // 3. Density calculation (bubbles per 100,000 px²)
  let densityValue = 0;
  if (roiAreaPx > 0) {
    densityValue = parseFloat(((count / roiAreaPx) * 100000).toFixed(2));
  }

  // 4. Surface Coverage % (bounded between 0% and 100%)
  let coveragePercent = 0;
  if (roiAreaPx > 0) {
    coveragePercent = parseFloat(Math.min(100.0, (totalBubbleAreaPx / roiAreaPx) * 100).toFixed(2));
  }

  // 5. Confidence statistics
  const meanConf = calculateMean(confidences);
  const minConf = parseFloat(Math.min(...confidences).toFixed(2));
  const maxConf = parseFloat(Math.max(...confidences).toFixed(2));

  // 6. Size distribution histogram
  const sizeDistribution = calculateSizeDistribution(rawRadii, 4);

  // 7. Spatial distribution (Center of mass & spread)
  const xValues = bubbles.map(b => b.x);
  const yValues = bubbles.map(b => b.y);
  const spatialCenterX = calculateMean(xValues);
  const spatialCenterY = calculateMean(yValues);
  const spreadX = calculateStandardDeviation(xValues, spatialCenterX);
  const spreadY = calculateStandardDeviation(yValues, spatialCenterY);

  // 8. Nearest Neighbour distances (null for count < 2)
  const nearestNeighbour = calculateNearestNeighbourDistances(bubbles, pxPerMm);

  return {
    count,
    radius: {
      min: minRadius,
      max: maxRadius,
      mean: meanRadius,
      median: medianRadius,
      standardDeviation: stdDevRadius,
      unit: distUnit
    },
    area: {
      min: minArea,
      max: maxArea,
      mean: meanArea,
      total: totalBubbleArea,
      unit: areaUnit
    },
    density: {
      value: densityValue,
      unit: 'bubbles / 100k px²'
    },
    coveragePercent,
    confidence: {
      mean: meanConf,
      min: minConf,
      max: maxConf
    },
    sizeDistribution,
    spatial: {
      centerX: spatialCenterX,
      centerY: spatialCenterY,
      spreadX,
      spreadY
    },
    nearestNeighbour,
    calibration: {
      enabled: isCalibrated,
      pixelsPerMillimeter: pxPerMm
    }
  };
}
