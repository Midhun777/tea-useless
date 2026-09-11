/**
 * TEA VISION — Minimal Backend Server
 *
 * All image analysis now runs fully client-side via OpenCV.js WebAssembly.
 * This server exists only to serve a health check endpoint and can be
 * extended with additional backend features in the future.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'TEA VISION Backend',
    mode: 'OPENCV_LOCAL_WASM',
    analysisEngine: 'OpenCV.js Dual-Branch (Hough + Contour/Watershed)',
    moondream: 'removed'
  });
});

app.listen(PORT, () => {
  console.log(`☕ TEA VISION Backend listening on port ${PORT}`);
  console.log(`🔬 Analysis Engine: OpenCV.js Dual-Branch (fully client-side)`);
});
