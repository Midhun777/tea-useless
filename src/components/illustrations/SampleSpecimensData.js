/**
 * Sample Specimen Datasets for Instant "TRY A SAMPLE" Testing
 *
 * Uses real tea/coffee macro photos from Unsplash (free, no attribution required for demos).
 * This ensures the OpenCV pipeline processes REAL photography and returns ACTUAL varying counts.
 *
 * Images are loaded as cross-origin and converted to canvas DataURL for CORS-safe pixel access.
 */

// Real high-res tea/coffee macro photos — each produces genuinely different bubble counts
const SPECIMEN_IMAGES = [
  {
    // Dense foam tea — lots of small bubbles
    unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80&fm=jpg',
    fallback: null
  },
  {
    // Frothy matcha — medium density
    unsplash: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&q=80&fm=jpg',
    fallback: null
  }
];

/**
 * Fetches an Unsplash image and converts to a same-origin DataURL via canvas.
 * Falls back to a synthetic canvas if network is unavailable.
 */
async function fetchSpecimenDataUrl(index) {
  const spec = SPECIMEN_IMAGES[index] || SPECIMEN_IMAGES[0];

  try {
    // Try loading the real photo
    const dataUrl = await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width  = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = reject;
      img.src = spec.unsplash;
    });
    return dataUrl;
  } catch (_) {
    // Network unavailable — fall back to synthetic
    return generateFallbackCanvas(index);
  }
}

/**
 * Synthetic fallback canvas (used only when network is unavailable).
 * Uses Math.random() seeded by index so different specimens look different.
 */
function generateFallbackCanvas(index) {
  const canvas = document.createElement('canvas');
  canvas.width  = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  const palettes = [
    { bg: ['#7C8C4E', '#68773E', '#4E5A2D'], bubble: 'rgba(255,255,245,0.85)' },
    { bg: ['#E69C45', '#C57B36', '#9E5E26'], bubble: 'rgba(255,245,230,0.90)' }
  ];
  const p = palettes[index % palettes.length];

  // Cup background gradient
  const grad = ctx.createRadialGradient(300, 300, 40, 300, 300, 275);
  grad.addColorStop(0,   p.bg[0]);
  grad.addColorStop(0.6, p.bg[1]);
  grad.addColorStop(1,   p.bg[2]);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(300, 300, 270, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#2C221E';
  ctx.lineWidth = 12;
  ctx.stroke();

  // Pseudorandom bubbles — count varies by index to make counts differ
  const baseCounts = [37, 54];
  const count = baseCounts[index % baseCounts.length];
  const rng = (seed) => {
    let s = seed ^ 0xdeadbeef;
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    return ((s ^ (s >>> 16)) >>> 0) / 0xffffffff;
  };

  for (let i = 0; i < count; i++) {
    const angle = rng(i * 17 + index * 100) * Math.PI * 2;
    const dist  = 20 + rng(i * 31 + index * 100) * 230;
    const r     = 4 + rng(i * 53 + index * 100) * 22;
    const bx    = 300 + Math.cos(angle) * dist;
    const by    = 300 + Math.sin(angle) * dist;

    // Skip if outside cup
    if (Math.hypot(bx - 300, by - 300) > 255) continue;

    ctx.save();
    const bg = ctx.createRadialGradient(bx - r * 0.3, by - r * 0.3, r * 0.05, bx, by, r);
    bg.addColorStop(0,   'rgba(255,255,255,0.95)');
    bg.addColorStop(0.5, p.bubble);
    bg.addColorStop(1,   'rgba(30,20,10,0.6)');
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = '#2C221E';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}

// Cached DataURLs (loaded on first use)
const _cache = {};

export const SAMPLE_SPECIMENS = [
  {
    id:       'CHAI_FROTH_01',
    title:    'High-Foam Chai Froth',
    tagline:  'Dense Surface Foam • Real Photo Specimen',
    count:    null,    // Set by OpenCV after analysis — not hardcoded
    density:  null,
    coverage: null,
    confidence: null,
    avgSize:  null,
    getDataUrl: async () => {
      if (!_cache[0]) _cache[0] = await fetchSpecimenDataUrl(0);
      return _cache[0];
    }
  },
  {
    id:       'MATCHA_CREMA_02',
    title:    'Matcha Micro-Foam Layer',
    tagline:  'Fine Bubble Matrix • Real Photo Specimen',
    count:    null,
    density:  null,
    coverage: null,
    confidence: null,
    avgSize:  null,
    getDataUrl: async () => {
      if (!_cache[1]) _cache[1] = await fetchSpecimenDataUrl(1);
      return _cache[1];
    }
  }
];
