import React, { useMemo } from 'react';
import { mapMatrixToScreen } from '../lib/vision/coordinateMapper';
import { RoiOverlay } from './RoiOverlay';

/** Corner bracket sizes based on bubble radius */
function getBracketSize(r) {
  const arm = Math.max(5, Math.min(14, r * 0.55));
  const gap = Math.max(3, r * 0.35);
  return { arm, gap };
}

/** Draw the four L-shaped corner brackets around a bubble */
function CornerBrackets({ cx, cy, r, color, strokeWidth = 1.6 }) {
  const { arm, gap } = getBracketSize(r);
  const x0 = cx - gap - arm, x1 = cx - gap;
  const x2 = cx + gap,       x3 = cx + gap + arm;
  const y0 = cy - gap - arm, y1 = cy - gap;
  const y2 = cy + gap,       y3 = cy + gap + arm;

  return (
    <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square">
      {/* Top-left */}
      <path d={`M${x1},${y0} L${x0},${y0} L${x0},${y1}`} />
      {/* Top-right */}
      <path d={`M${x2},${y0} L${x3},${y0} L${x3},${y1}`} />
      {/* Bottom-left */}
      <path d={`M${x0},${y2} L${x0},${y3} L${x1},${y3}`} />
      {/* Bottom-right */}
      <path d={`M${x3},${y2} L${x3},${y3} L${x2},${y3}`} />
    </g>
  );
}

/** Thin crosshair ticks at center */
function Crosshair({ cx, cy, color, size = 5 }) {
  return (
    <g stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.75">
      <line x1={cx - size} y1={cy} x2={cx + size} y2={cy} />
      <line x1={cx} y1={cy - size} x2={cx} y2={cy + size} />
    </g>
  );
}

/** Leader line + specimen tag label */
function SpecimenTag({ cx, cy, r, label, color, visible }) {
  if (!visible) return null;
  // Leader always goes to top-right corner of the bracket
  const { gap, arm } = getBracketSize(r);
  const lx0 = cx + gap + arm;
  const ly0 = cy - gap - arm * 0.5;
  const lx1 = lx0 + 8;
  const ly1 = ly0 - 6;
  const tagW = label.length * 6.2 + 8;
  const tagH = 13;

  return (
    <g className="pointer-events-none select-none">
      {/* Dashed leader line */}
      <line
        x1={lx0} y1={ly0}
        x2={lx1} y2={ly1}
        stroke={color} strokeWidth="0.8" strokeDasharray="2.5,2"
      />
      {/* Tag box */}
      <rect
        x={lx1} y={ly1 - tagH}
        width={tagW} height={tagH}
        fill="rgba(10,10,15,0.82)"
        stroke={color} strokeWidth="0.7"
        rx="1"
      />
      <text
        x={lx1 + 4} y={ly1 - 4}
        fill={color}
        fontSize="8.5"
        fontFamily="Space Mono, JetBrains Mono, monospace"
        fontWeight="700"
        letterSpacing="0.5"
      >
        {label}
      </text>
    </g>
  );
}

export function DetectionOverlay({
  roi,
  bubbleResult,
  vizMode = 'ACCEPTED',
  showRoi = true,
  showLabels = true,
  selectedBubble = null,
  hoveredBubble = null,
  naturalWidth,
  naturalHeight,
  containerWidth,
  containerHeight,
  zoom = 1.0,
  panX = 0,
  panY = 0,
  onBubbleHover,
  onBubbleSelect,
  onDeselect
}) {
  if (!naturalWidth || !naturalHeight || !containerWidth || !containerHeight) {
    return null;
  }

  const { acceptedBubbles = [], rawCandidates = [], rejectedCandidates = [] } = bubbleResult || {};

  let targetList = acceptedBubbles;
  if (vizMode === 'RAW') targetList = rawCandidates;
  else if (vizMode === 'REJECTED') targetList = rejectedCandidates;

  const handleOverlayClick = (e) => {
    if (e.target.tagName === 'svg' || e.target.id === 'overlay-bg-rect') {
      onDeselect?.();
    }
  };

  const getColor = (b, isSelected) => {
    if (isSelected) return '#22d3ee';
    if (vizMode === 'REJECTED') {
      if (b.reason === 'duplicate') return '#f59e0b';
      if (b.reason === 'outside-roi') return '#ef4444';
      return '#6b7280';
    }
    if (vizMode === 'RAW') return '#c084fc';
    const conf = b.confidence || 0.8;
    if (conf >= 0.75) return '#22d3ee';
    if (conf >= 0.55) return '#f59e0b';
    return '#ef4444';
  };

  // Pre-compute all screen positions once
  const mapped = useMemo(() => targetList.map(b => {
    const pos = mapMatrixToScreen(b.x, b.y, b.radius, naturalWidth, naturalHeight, containerWidth, containerHeight, zoom, panX, panY);
    return { ...b, ...pos };
  }), [targetList, naturalWidth, naturalHeight, containerWidth, containerHeight, zoom, panX, panY]);

  // Build proximity mesh edges (connect nearest 3 neighbours, deduplicated)
  const meshEdges = useMemo(() => {
    if (mapped.length < 2) return [];
    const maxDist = containerWidth * 0.22;
    const edges = [];
    const seen = new Set();
    mapped.forEach((a, i) => {
      const neighbours = mapped
        .map((b, j) => ({ j, dist: Math.hypot(a.screenX - b.screenX, a.screenY - b.screenY) }))
        .filter(({ j, dist }) => j !== i && dist < maxDist)
        .sort((x, y) => x.dist - y.dist)
        .slice(0, 3);

      neighbours.forEach(({ j, dist }) => {
        const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
        if (!seen.has(key)) {
          seen.add(key);
          const b = mapped[j];
          edges.push({ ax: a.screenX, ay: a.screenY, bx: b.screenX, by: b.screenY, dist });
        }
      });
    });
    return edges;
  }, [mapped, containerWidth]);

  return (
    <div
      className="absolute inset-0 z-30 overflow-hidden cursor-crosshair select-none"
      onClick={handleOverlayClick}
    >
      <svg className="w-full h-full" id="overlay-svg">
        {/* Filter definitions for glow effects */}
        <defs>
          <filter id="bubble-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="selected-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <rect id="overlay-bg-rect" width="100%" height="100%" fill="transparent" />

        {/* ── ROI ring ── */}
        {showRoi && roi && (
          <RoiOverlay
            roi={roi}
            naturalWidth={naturalWidth}
            naturalHeight={naturalHeight}
            containerWidth={containerWidth}
            containerHeight={containerHeight}
          />
        )}

        {/* ── Proximity triangulation mesh ── */}
        <g opacity="0.22">
          {meshEdges.map(({ ax, ay, bx, by, dist }, i) => {
            // Opacity fades with distance
            const alpha = 1 - dist / (containerWidth * 0.22);
            return (
              <line
                key={i}
                x1={ax} y1={ay} x2={bx} y2={by}
                stroke="#22d3ee"
                strokeWidth="0.6"
                strokeDasharray="3,4"
                opacity={alpha * 0.7}
              />
            );
          })}
        </g>

        {/* ── Per-bubble annotation markers ── */}
        {mapped.map((b, idx) => {
          const { screenX, screenY, screenRadius } = b;
          const r = Math.max(6, screenRadius);

          const isSelected = selectedBubble?.id === b.id && selectedBubble?.x === b.x;
          const isHovered = hoveredBubble?.id === b.id && hoveredBubble?.x === b.x;
          const color = getColor(b, isSelected);
          const opacity = selectedBubble ? (isSelected ? 1.0 : 0.2) : (isHovered ? 1.0 : 0.9);

          // Label text
          const labelText = vizMode === 'REJECTED'
            ? `${b.reason || 'REJ'}`
            : `#${b.id}`;

          return (
            <g
              key={`${b.id ?? idx}-${b.x}-${b.y}`}
              style={{ opacity }}
              className="cursor-pointer"
              onMouseEnter={() => onBubbleHover?.(b, { x: screenX, y: screenY })}
              onMouseLeave={() => onBubbleHover?.(null, null)}
              onClick={(e) => { e.stopPropagation(); onBubbleSelect?.(b); }}
            >
              {/* Selected state: outer scanning ring (very subtle) */}
              {isSelected && (
                <circle
                  cx={screenX} cy={screenY}
                  r={r + getBracketSize(r).gap + getBracketSize(r).arm + 5}
                  fill="none"
                  stroke={color}
                  strokeWidth="0.6"
                  strokeDasharray="4,5"
                  opacity="0.5"
                  filter="url(#selected-glow)"
                />
              )}

              {/* Faint bounding ring (thin, low-key size reference) */}
              <circle
                cx={screenX} cy={screenY}
                r={r}
                fill={isSelected ? `${color}18` : 'none'}
                stroke={color}
                strokeWidth="0.5"
                strokeDasharray={vizMode === 'REJECTED' ? '2,3' : '2,3'}
                opacity={isSelected ? 1 : 0.45}
              />

              {/* Corner bracket specimen mounts */}
              <CornerBrackets
                cx={screenX} cy={screenY} r={r}
                color={color}
                strokeWidth={isSelected ? 2.2 : isHovered ? 1.9 : 1.5}
              />

              {/* Hairline crosshairs at center */}
              <Crosshair
                cx={screenX} cy={screenY}
                color={color}
                size={isSelected ? 6 : 4}
              />

              {/* Center specimen dot */}
              <circle
                cx={screenX} cy={screenY}
                r={isSelected ? 3 : isHovered ? 2.5 : 2}
                fill={color}
                filter={isSelected ? 'url(#bubble-glow)' : undefined}
              />

              {/* Specimen ID tag + leader line */}
              {showLabels && (r >= 5 || isSelected || isHovered) && (
                <SpecimenTag
                  cx={screenX} cy={screenY} r={r}
                  label={labelText}
                  color={color}
                  visible={true}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
