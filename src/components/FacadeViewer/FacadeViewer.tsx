import React, { useState, useCallback } from 'react';
import type { FacadeLevel, FacadeMap } from '../../types/realEstate';
import { usePanZoom } from '../../hooks/usePanZoom';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Eye,
  EyeOff,
} from 'lucide-react';

interface FacadeViewerProps {
  heroImage: string;
  facadeMap: FacadeMap;
  activeLevelId: string | null;
  onSelectLevel: (levelId: string) => void;
  onViewFloorPlan: (levelId: string, floors: number[]) => void;
}

function formatPriceShort(value: number): string {
  if (value >= 1_000_000) return `US$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `US$ ${Math.round(value / 1000)}K`;
  return `US$ ${value}`;
}

/** Center of the polygon's bounding box, ej: "80,160 670,160 670,350 80,350" → { x: 375, y: 255 } */
function polygonCenter(points: string): { x: number; y: number } {
  const coords = points
    .trim()
    .split(/\s+/)
    .map(pair => pair.split(',').map(Number));
  const xs = coords.map(([x]) => x);
  const ys = coords.map(([, y]) => y);
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
}

export const FacadeViewer: React.FC<FacadeViewerProps> = ({
  heroImage,
  facadeMap,
  activeLevelId,
  onSelectLevel,
  onViewFloorPlan,
}) => {
  const facadeLevels = facadeMap.levels;
  const [showLabels, setShowLabels] = useState(false);

  const {
    state,
    containerRef,
    handlers,
    zoomIn,
    zoomOut,
    resetZoom,
    zoomPercent,
  } = usePanZoom();

  const [hoveredLevelId, setHoveredLevelId] = useState<string | null>(null);

  const handleLevelClick = useCallback(
    (level: FacadeLevel) => {
      onSelectLevel(level.id);
      onViewFloorPlan(level.id, level.floorRange);
    },
    [onSelectLevel, onViewFloorPlan]
  );

  return (
    <div className="viewer-area facade-viewer-area">
      <div
        className="viewer facade-viewer"
        ref={containerRef}
        {...handlers}
      >
        <div
          className="viewer__canvas facade-viewer__canvas"
          style={{
            transform: `translate(${state.x}px, ${state.y}px) scale(${state.scale})`,
          }}
        >
          {/* Background image */}
          <div className="facade-viewer__image-wrap">
            <img
              src={heroImage}
              alt="Fachada del edificio"
              className="facade-viewer__image"
              draggable={false}
            />

            {/* SVG overlay with level polygons */}
            <svg
              className="facade-viewer__overlay"
              viewBox={facadeMap.viewBox}
              preserveAspectRatio="none"
            >
              {/* Defs for glow filter */}
              <defs>
                <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {facadeLevels.map(level => {
                const isActive = level.id === activeLevelId;
                const isHovered = level.id === hoveredLevelId;
                const isHighlighted = isActive || isHovered;

                return (
                  <g key={level.id} style={{ cursor: 'pointer' }}>
                    <polygon
                      className={`facade-level-polygon ${
                        isHighlighted ? 'facade-level-polygon--active' : ''
                      }`}
                      points={level.overlayPolygon}
                      onClick={() => handleLevelClick(level)}
                      onPointerEnter={() => setHoveredLevelId(level.id)}
                      onPointerLeave={() => setHoveredLevelId(null)}
                      filter={isHighlighted ? 'url(#glow-filter)' : undefined}
                    />
                    {/* "Ver Planta" hover hint (only when showLabels is enabled) */}
                    {showLabels && isHovered && level.priceFrom && (
                      <text
                        x={polygonCenter(level.overlayPolygon).x}
                        y={polygonCenter(level.overlayPolygon).y + 6}
                        className="facade-floor-hint"
                        textAnchor="middle"
                      >
                        ↗ Ver planta
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Price badges (only rendered if showLabels is true) */}
            {showLabels && facadeLevels.map(level => {
              const isActive = level.id === activeLevelId;
              const isHovered = level.id === hoveredLevelId;
              const isHighlighted = isActive || isHovered;

              // Convert SVG coordinates to percentages
              const xPct = (level.labelPos.x / facadeMap.width) * 100;
              const yPct = (level.labelPos.y / facadeMap.height) * 100;

              return (
                <div
                  key={`badge-${level.id}`}
                  className={`facade-badge ${
                    isHighlighted ? 'facade-badge--active' : ''
                  } facade-badge--${level.badgeSide || 'right'}`}
                  style={{
                    left: `${xPct}%`,
                    top: `${yPct}%`,
                  }}
                  onClick={() => handleLevelClick(level)}
                  onPointerEnter={() => setHoveredLevelId(level.id)}
                  onPointerLeave={() => setHoveredLevelId(null)}
                >
                  <span className="facade-badge__label">{level.fullLabel}</span>
                  {level.priceFrom && (
                    <span className="facade-badge__price">
                      DESDE {formatPriceShort(level.priceFrom)}
                    </span>
                  )}
                  {isHighlighted && (
                    <span className="facade-badge__hint">↗ Ver planta</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Zoom & Text Controls */}
      <div className="zoom-controls">
        <button
          className={`zoom-controls__btn ${showLabels ? 'zoom-controls__btn--active' : ''}`}
          onClick={() => setShowLabels(!showLabels)}
          title={showLabels ? "Ocultar texto sobre la imagen" : "Mostrar texto sobre la imagen"}
          style={{ padding: '0 10px', gap: 6 }}
        >
          {showLabels ? <EyeOff size={16} /> : <Eye size={16} />}
          <span style={{ fontSize: 12, fontWeight: 600 }}>
            {showLabels ? 'Ocultar Texto' : 'Ver Texto'}
          </span>
        </button>
        <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)' }} />
        <button className="zoom-controls__btn" onClick={zoomIn} title="Acercar">
          <ZoomIn size={18} />
        </button>
        <span className="zoom-controls__level">{zoomPercent}%</span>
        <button className="zoom-controls__btn" onClick={zoomOut} title="Alejar">
          <ZoomOut size={18} />
        </button>
        <button
          className="zoom-controls__btn"
          onClick={() => resetZoom(facadeMap.width, facadeMap.height)}
          title="Restablecer vista"
        >
          <Maximize size={18} />
        </button>
      </div>
    </div>
  );
};
