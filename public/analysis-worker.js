/**
 * TEA VISION — OpenCV Analysis Web Worker
 *
 * Runs ALL OpenCV WASM operations (preprocessing, ROI detection, Hough branch,
 * Contour branch, merge/dedup, size classification) in a background thread.
 *
 * The main thread stays completely responsive.
 *
 * Protocol:
 *   MAIN → WORKER:  { type: 'analyze', imageData: ImageData, width: number, height: number }
 *   WORKER → MAIN:  { type: 'ready' }
 *                   { type: 'progress', stage: string }
 *                   { type: 'result', bubbles, roi, rawCandidates, rejectedCandidates,
 *                                     branchTelemetry, sizeBreakdown, processingTimeMs }
 *                   { type: 'error', message: string }
 */

/* global cv, importScripts */

// ─── Load OpenCV WASM ───────────────────────────────────────────────────────
let cvReady = false;
let pendingPayload = null;

// In a worker, globalThis / self is used instead of window
// Set the callback BEFORE importScripts so it fires when WASM finishes compiling
self.cv = { onRuntimeInitialized: onCVReady };

function onCVReady() {
  cvReady = true;
  self.postMessage({ type: 'ready' });
  if (pendingPayload) {
    runAnalysis(pendingPayload);
    pendingPayload = null;
  }
}

try {
  importScripts('/opencv.js');
  // Some builds initialize synchronously
  if (typeof cv !== 'undefined' && cv.Mat && typeof cv.Mat === 'function') {
    onCVReady();
  }
} catch (e) {
  self.postMessage({ type: 'error', message: 'Failed to load OpenCV.js in worker: ' + e.message });
}

// ─── Message Handler ─────────────────────────────────────────────────────────
self.onmessage = function (e) {
  const { type, imageData, width, height } = e.data;
  if (type === 'analyze') {
    const payload = { imageData, width, height };
    if (cvReady) {
      runAnalysis(payload);
    } else {
      pendingPayload = payload;
    }
  }
};

// ─── Progress Helper ─────────────────────────────────────────────────────────
function progress(stage) {
  self.postMessage({ type: 'progress', stage });
}

// ─── Size Config ─────────────────────────────────────────────────────────────
const MAX_DIM        = 800;
const SMALL_MAX_R    = 8;
const MEDIUM_MAX_R   = 22;

// ─── Main Analysis Pipeline ──────────────────────────────────────────────────
function runAnalysis({ imageData, width, height }) {
  const startTime = Date.now();
  const allMats = [];

  function track(mat) { allMats.push(mat); return mat; }
  function cleanup() {
    allMats.forEach(m => { try { if (m && m.delete) m.delete(); } catch (_) {} });
  }

  try {
    // ── Stage 1: Build source Mat from ImageData ────────────────────────────
    progress('ACQUIRING SPECIMEN');
    const srcMat = track(cv.matFromImageData({ data: imageData, width, height }));

    // ── Stage 2: Resize to max 800px ────────────────────────────────────────
    progress('RESIZING');
    const maxDim = Math.max(srcMat.cols, srcMat.rows);
    let resized;
    if (maxDim > MAX_DIM) {
      const scale = MAX_DIM / maxDim;
      const dsize = new cv.Size(Math.round(srcMat.cols * scale), Math.round(srcMat.rows * scale));
      resized = track(new cv.Mat());
      cv.resize(srcMat, resized, dsize, 0, 0, cv.INTER_AREA);
    } else {
      resized = track(srcMat.clone());
    }
    const W = resized.cols;
    const H = resized.rows;

    // ── Stage 3: Grayscale ─────────────────────────────────────────────────
    progress('PREPROCESSING IMAGE');
    const gray = track(new cv.Mat());
    cv.cvtColor(resized, gray, cv.COLOR_RGBA2GRAY);

    // ── Stage 4: Gaussian blur ─────────────────────────────────────────────
    const blurred = track(new cv.Mat());
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

    // ── Stage 5: CLAHE ─────────────────────────────────────────────────────
    const clahe = cv.createCLAHE(2.0, new cv.Size(8, 8));
    const enhanced = track(new cv.Mat());
    clahe.apply(blurred, enhanced);
    clahe.delete();

    // ── Stage 6: ROI (simple centre-based ellipse) ─────────────────────────
    progress('LOCATING TEA SURFACE');
    // Try HoughCircles for ROI; fall back to a centre-covering ellipse
    const roiBlur = track(new cv.Mat());
    cv.GaussianBlur(enhanced, roiBlur, new cv.Size(9, 9), 2, 2, cv.BORDER_DEFAULT);
    const roiCircles = track(new cv.Mat());
    cv.HoughCircles(roiBlur, roiCircles, cv.HOUGH_GRADIENT, 1.2,
      Math.max(W, H) * 0.2,   // minDist
      80, 35,                   // param1, param2
      Math.round(Math.min(W, H) * 0.15),  // minR
      Math.round(Math.min(W, H) * 0.55)   // maxR
    );

    let roi;
    if (roiCircles.cols > 0) {
      const cx = roiCircles.data32F[0];
      const cy = roiCircles.data32F[1];
      const cr = roiCircles.data32F[2];
      roi = { centerX: cx, centerY: cy, radius: cr };
    } else {
      roi = { centerX: W / 2, centerY: H / 2, radius: Math.min(W, H) * 0.42 };
    }

    // ── Stage 7: ROI Mask ──────────────────────────────────────────────────
    const mask = track(cv.Mat.zeros(H, W, cv.CV_8UC1));
    cv.circle(mask, new cv.Point(Math.round(roi.centerX), Math.round(roi.centerY)),
      Math.round(roi.radius), new cv.Scalar(255), -1);

    const masked = track(new cv.Mat());
    cv.bitwise_and(enhanced, enhanced, masked, mask);

    // ── Stage 8: Hough Branch — large, faint, circular ────────────────────
    progress('HOUGH SCAN — LARGE BUBBLES');
    const houghBlur = track(new cv.Mat());
    cv.GaussianBlur(masked, houghBlur, new cv.Size(9, 9), 2.0, 2.0, cv.BORDER_DEFAULT);
    const houghCircles = track(new cv.Mat());
    cv.HoughCircles(houghBlur, houghCircles, cv.HOUGH_GRADIENT,
      1.2, 15, 80, 20, 10, 100);

    const houghCandidates = [];
    for (let i = 0; i < houghCircles.cols; i++) {
      const x = Math.round(houghCircles.data32F[i * 3]);
      const y = Math.round(houghCircles.data32F[i * 3 + 1]);
      const r = Math.round(houghCircles.data32F[i * 3 + 2]);
      if (x < 0 || y < 0 || x >= W || y >= H) continue;

      const roiCov = computeRoiCoverage(x, y, r, roi);
      if (roiCov < 0.55) continue;

      const radiusScore = Math.max(0.3, 1.0 - Math.abs(r - 35) / 90);
      const confidence  = parseFloat((roiCov * 0.40 + radiusScore * 0.35 + 0.75 * 0.15 + 0.80 * 0.10).toFixed(2));
      if (confidence < 0.40) continue;

      houghCandidates.push({
        id: `h_${i + 1}`, x, y, radius: r,
        roiCoverage: parseFloat(roiCov.toFixed(2)),
        localContrast: 10.0, edgeStrength: 0.75, circularity: 0.80,
        confidence, detectionMethod: 'hough', isValid: true
      });
    }

    // ── Stage 9: Contour Branch — small, touching, visible ─────────────────
    progress('CONTOUR SCAN — SMALL BUBBLES');
    const binary = track(new cv.Mat());
    cv.adaptiveThreshold(masked, binary, 255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2);

    const morphKernel = track(cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(3, 3)));
    const opened = track(new cv.Mat());
    cv.morphologyEx(binary, opened, cv.MORPH_OPEN, morphKernel,
      new cv.Point(-1, -1), 1);

    const contours  = new cv.MatVector();
    const hierarchy = track(new cv.Mat());
    cv.findContours(opened, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    const contourCandidates = [];
    const MAX_CONTOURS = 600;
    const total = Math.min(contours.size(), MAX_CONTOURS);

    for (let ci = 0; ci < total; ci++) {
      const contour = contours.get(ci);
      try {
        const area = cv.contourArea(contour);
        if (area < 8) continue;

        const perim = cv.arcLength(contour, true);
        const circ  = perim > 0 ? (4 * Math.PI * area) / (perim * perim) : 0;
        if (circ < 0.48) continue;

        const centre = { x: 0, y: 0 };
        const rRef   = { value: 0 };
        cv.minEnclosingCircle(contour, centre, rRef);
        const cx = Math.round(centre.x);
        const cy = Math.round(centre.y);
        const r  = Math.round(rRef.value);
        if (r < 2 || r > 30) continue;
        if (cx < 0 || cy < 0 || cx >= W || cy >= H) continue;

        const roiCov = computeRoiCoverage(cx, cy, r, roi);
        if (roiCov < 0.55) continue;

        const confidence = parseFloat(
          Math.min(1.0, roiCov * 0.30 + 0.67 * 0.25 + circ * 0.25 + circ * 0.20).toFixed(2)
        );
        if (confidence < 0.40) continue;

        contourCandidates.push({
          id: `c_${ci + 1}`, x: cx, y: cy, radius: r,
          area: Math.round(area),
          circularity: parseFloat(circ.toFixed(2)),
          roiCoverage: parseFloat(roiCov.toFixed(2)),
          localContrast: 12.0, edgeStrength: parseFloat(Math.min(1, circ).toFixed(2)),
          confidence, detectionMethod: 'contour', isValid: true
        });
      } finally {
        contour.delete();
      }
    }
    contours.delete();

    // ── Stage 10: Merge + IoU Dedup ────────────────────────────────────────
    progress('MERGING & DEDUPLICATING');
    const merged = [...houghCandidates, ...contourCandidates]
      .sort((a, b) => b.confidence - a.confidence);

    const accepted   = [];
    const duplicates = [];
    for (const cand of merged) {
      let isDup = false;
      for (const ex of accepted) {
        const iou  = circleIoU(cand, ex);
        const dist = Math.hypot(cand.x - ex.x, cand.y - ex.y);
        const minR = Math.min(cand.radius, ex.radius);
        if (iou > 0.25 || (dist < minR * 0.55 && Math.abs(cand.radius - ex.radius) < minR * 0.7)) {
          isDup = true;
          duplicates.push({ ...cand, reason: 'duplicate', mergedWithId: ex.id });
          break;
        }
      }
      if (!isDup) accepted.push(cand);
    }

    // ── Stage 11: Size classify + final IDs ────────────────────────────────
    const finalBubbles = accepted.map((b, idx) => ({
      ...b,
      id: idx + 1,
      sizeClass: b.radius < SMALL_MAX_R ? 'small' : b.radius <= MEDIUM_MAX_R ? 'medium' : 'large'
    }));

    const sizeBreakdown = {
      small:  finalBubbles.filter(b => b.sizeClass === 'small').length,
      medium: finalBubbles.filter(b => b.sizeClass === 'medium').length,
      large:  finalBubbles.filter(b => b.sizeClass === 'large').length
    };

    const branchTelemetry = {
      houghRaw: houghCircles.cols,
      houghAccepted: finalBubbles.filter(b => b.detectionMethod === 'hough').length,
      contourRaw: total,
      contourAccepted: finalBubbles.filter(b => b.detectionMethod === 'contour').length
    };

    progress('ANALYSIS COMPLETE');

    self.postMessage({
      type: 'result',
      bubbles:          finalBubbles,
      rawCandidates:    merged,
      rejectedCandidates: duplicates,
      roi: { ...roi, type: 'circle' },
      branchTelemetry,
      sizeBreakdown,
      processingTimeMs: Date.now() - startTime,
      imageWidth:       W,
      imageHeight:      H,
      originalWidth:    width,
      originalHeight:   height
    });

  } catch (err) {
    self.postMessage({ type: 'error', message: err.message || String(err) });
  } finally {
    cleanup();
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function computeRoiCoverage(x, y, r, roi) {
  if (!roi || roi.radius <= 0) return 1.0;
  const dist     = Math.hypot(x - roi.centerX, y - roi.centerY);
  const maxSafe  = roi.radius - r * 0.3;
  return dist <= maxSafe ? 1.0 : Math.max(0, (roi.radius + r - dist) / (2 * r));
}

function circleIoU(a, b) {
  const dist = Math.hypot(a.x - b.x, a.y - b.y);
  if (dist >= a.radius + b.radius) return 0;
  if (dist <= Math.abs(a.radius - b.radius)) {
    const s = Math.min(a.radius, b.radius);
    return (Math.PI * s * s) / (Math.PI * Math.max(a.radius, b.radius) ** 2);
  }
  const d1 = (dist * dist + a.radius * a.radius - b.radius * b.radius) / (2 * dist);
  const d2 = dist - d1;
  const area =
    a.radius * a.radius * Math.acos(Math.max(-1, Math.min(1, d1 / a.radius))) +
    b.radius * b.radius * Math.acos(Math.max(-1, Math.min(1, d2 / b.radius))) -
    d1 * Math.sqrt(Math.max(0, a.radius * a.radius - d1 * d1)) -
    d2 * Math.sqrt(Math.max(0, b.radius * b.radius - d2 * d2));
  const union = Math.PI * a.radius * a.radius + Math.PI * b.radius * b.radius - area;
  return union > 0 ? Math.max(0, area / union) : 0;
}
