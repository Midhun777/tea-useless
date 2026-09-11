/**
 * Sample Specimen Datasets for Instant "TRY A SAMPLE" Testing
 * Generates specimen image Data URLs dynamically via HTML5 Canvas
 */

function generateSpecimenCanvas(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  if (type === 'MATCHA') {
    // Rich Matcha Specimen (Green background with micro-foam bubble matrix)
    const grad = ctx.createRadialGradient(300, 300, 50, 300, 300, 280);
    grad.addColorStop(0, '#7C8C4E');
    grad.addColorStop(0.5, '#68773E');
    grad.addColorStop(0.85, '#4E5A2D');
    grad.addColorStop(1, '#2D351A');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(300, 300, 270, 0, Math.PI * 2);
    ctx.fill();

    // Ceramic Rim
    ctx.strokeStyle = '#2C221E';
    ctx.lineWidth = 12;
    ctx.stroke();

    // Generate ~63 realistic bubbles
    const seedBubbles = [
      { x: 300, y: 300, r: 28 }, { x: 260, y: 270, r: 22 }, { x: 340, y: 280, r: 24 },
      { x: 310, y: 350, r: 30 }, { x: 240, y: 330, r: 18 }, { x: 370, y: 340, r: 20 },
      { x: 280, y: 220, r: 16 }, { x: 350, y: 210, r: 15 }, { x: 210, y: 280, r: 25 },
      { x: 390, y: 270, r: 19 }, { x: 230, y: 390, r: 14 }, { x: 320, y: 410, r: 17 },
      { x: 390, y: 390, r: 22 }, { x: 180, y: 240, r: 12 }, { x: 420, y: 230, r: 14 }
    ];

    // Add smaller micro-foam surrounding bubbles
    for (let i = 0; i < 48; i++) {
      const angle = (i / 48) * Math.PI * 2;
      const dist = 50 + (i * 4.2) % 180;
      const r = 4 + ((i * 7) % 12);
      seedBubbles.push({
        x: 300 + Math.cos(angle) * dist,
        y: 300 + Math.sin(angle) * dist,
        r
      });
    }

    // Draw bubbles
    seedBubbles.forEach(b => {
      ctx.save();
      const bGrad = ctx.createRadialGradient(b.x - b.r*0.3, b.y - b.r*0.3, b.r*0.1, b.x, b.y, b.r);
      bGrad.addColorStop(0, 'rgba(255, 255, 245, 0.95)');
      bGrad.addColorStop(0.4, 'rgba(230, 240, 200, 0.7)');
      bGrad.addColorStop(0.85, 'rgba(104, 119, 62, 0.6)');
      bGrad.addColorStop(1, 'rgba(44, 34, 30, 0.8)');

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = bGrad;
      ctx.fill();
      ctx.strokeStyle = '#2C221E';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Highlight spot
      ctx.beginPath();
      ctx.arc(b.x - b.r*0.3, b.y - b.r*0.3, b.r*0.25, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();
    });

  } else if (type === 'EARL_GREY') {
    // Amber Earl Grey Crema Specimen
    const grad = ctx.createRadialGradient(300, 300, 50, 300, 300, 280);
    grad.addColorStop(0, '#E69C45');
    grad.addColorStop(0.4, '#C57B36');
    grad.addColorStop(0.8, '#9E5E26');
    grad.addColorStop(1, '#4A280D');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(300, 300, 270, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#2C221E';
    ctx.lineWidth = 12;
    ctx.stroke();

    // Crema Foam Cluster
    const seedBubbles = [];
    for (let i = 0; i < 63; i++) {
      const angle = (i / 63) * Math.PI * 2;
      const dist = (i * 3.5) % 210;
      const r = 5 + ((i * 11) % 18);
      seedBubbles.push({
        x: 300 + Math.cos(angle) * dist,
        y: 300 + Math.sin(angle) * dist,
        r
      });
    }

    seedBubbles.forEach(b => {
      ctx.save();
      const bGrad = ctx.createRadialGradient(b.x - b.r*0.3, b.y - b.r*0.3, b.r*0.1, b.x, b.y, b.r);
      bGrad.addColorStop(0, 'rgba(255, 245, 230, 0.95)');
      bGrad.addColorStop(0.5, 'rgba(230, 180, 120, 0.7)');
      bGrad.addColorStop(1, 'rgba(74, 40, 13, 0.8)');

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = bGrad;
      ctx.fill();
      ctx.strokeStyle = '#2C221E';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    });

  } else {
    // Jasmine Boba Pearls Specimen
    const grad = ctx.createRadialGradient(300, 300, 50, 300, 300, 280);
    grad.addColorStop(0, '#F5E6C8');
    grad.addColorStop(0.5, '#E2C799');
    grad.addColorStop(0.85, '#C49C5E');
    grad.addColorStop(1, '#8A6328');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(300, 300, 270, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#2C221E';
    ctx.lineWidth = 12;
    ctx.stroke();

    for (let i = 0; i < 42; i++) {
      const angle = (i / 42) * Math.PI * 2;
      const dist = 30 + (i * 5.5) % 200;
      const r = 8 + ((i * 9) % 22);
      ctx.save();
      ctx.beginPath();
      ctx.arc(300 + Math.cos(angle) * dist, 300 + Math.sin(angle) * dist, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fill();
      ctx.strokeStyle = '#2C221E';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }

  return canvas.toDataURL('image/png');
}

export const SAMPLE_SPECIMENS = [
  {
    id: 'MATCHA_01',
    title: 'High-Foam Ceremonial Matcha',
    tagline: 'Ceremonial Grade • Micro-Foam Bubble Matrix',
    count: 63,
    density: '4.2 bubbles/cm²',
    coverage: '18.5%',
    confidence: '98.4%',
    avgSize: '1.8 mm',
    getDataUrl: () => generateSpecimenCanvas('MATCHA')
  },
  {
    id: 'EARL_GREY_02',
    title: 'Earl Grey Bergamot Crema',
    tagline: 'Citrus Essential Oils • High Surface Tension',
    count: 63,
    density: '3.8 bubbles/cm²',
    coverage: '16.2%',
    confidence: '97.8%',
    avgSize: '2.1 mm',
    getDataUrl: () => generateSpecimenCanvas('EARL_GREY')
  }
];
