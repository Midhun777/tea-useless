/**
 * Client for Moondream Tea Vision API Server
 */

/**
 * Convert a File object to base64 Data URL
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Split a data URL image into a rows×cols grid of overlapping tiles.
 * Returns an array of { data (dataURL), x0, y0, x1, y1 } in normalized [0,1] coords.
 */
function tileImage(dataUrl, rows = 2, cols = 2, overlap = 0.12) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const tiles = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Normalized bounds with overlap
          const x0 = Math.max(0, c / cols - overlap);
          const y0 = Math.max(0, r / rows - overlap);
          const x1 = Math.min(1, (c + 1) / cols + overlap);
          const y1 = Math.min(1, (r + 1) / rows + overlap);

          const sx = x0 * img.width;
          const sy = y0 * img.height;
          const sw = (x1 - x0) * img.width;
          const sh = (y1 - y0) * img.height;

          const canvas = document.createElement('canvas');
          canvas.width  = Math.round(sw);
          canvas.height = Math.round(sh);
          canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

          tiles.push({ data: canvas.toDataURL('image/jpeg', 0.88), x0, y0, x1, y1 });
        }
      }
      resolve(tiles);
    };
    img.onerror = () => resolve([]); // fail gracefully
    img.src = dataUrl;
  });
}

/**
 * Send tea image to secure server backend for Moondream bubble analysis
 */
export async function analyzeTeaWithMoondream(imageDataUrl, onProgress = () => {}) {
  try {
    onProgress('PREPARING SAMPLE SPECIMEN');
    await new Promise((r) => setTimeout(r, 200));

    onProgress('TILING IMAGE FOR MULTI-PASS DETECTION');
    // Build 2×2 tile grid for zoomed sub-region detection
    const tiles = await tileImage(imageDataUrl, 2, 2, 0.12);

    onProgress('SCANNING TEA SURFACE WITH MOONDREAM');
    await new Promise((r) => setTimeout(r, 300));

    onProgress('LOCATING SURFACE AIR BUBBLES');

    const response = await fetch('/api/analyze-tea', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageDataUrl, tiles }),
    });

    onProgress('VERIFYING SPATIAL DETECTIONS & DEDUPLICATING');

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `Server responded with HTTP ${response.status}`);
    }

    const data = await response.json();

    onProgress('ANALYSIS COMPLETE');
    await new Promise((r) => setTimeout(r, 200));

    return {
      count: data.count,
      bubbles: data.bubbles || [],
      rawCandidates: data.rawCandidates || [],
      rejectedCandidates: data.rejectedCandidates || [],
      surfaceDetected: data.surfaceDetected ?? true,
      surfaceDescription: data.surfaceDescription || '',
      verificationCount: data.verificationCount || null,
      status: data.status || 'Complete',
      warnings: data.warnings || [],
      telemetry: data.telemetry || {
        totalRawDetections: (data.bubbles || []).length,
        deduplicatedCount: (data.bubbles || []).length,
        model: 'moondream3.1-9B-A2B',
        executionTimeMs: 450,
        isDemoFallback: true,
      },
    };
  } catch (err) {
    console.error('Moondream Analysis Client Error:', err);
    throw err;
  }
}
