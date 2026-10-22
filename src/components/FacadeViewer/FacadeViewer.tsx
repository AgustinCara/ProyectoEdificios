import React, { useState, useCallback } from 'react';
import type { FacadeLevel, FacadeMap } from '../../types/realEstate';
import { usePanZoom } from '../../hooks/usePanZoom';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

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

export const FacadeViewer: React.FC<FacadeViewerProps> = ({
  heroImage,
  facadeMap,
  activeLevelId,
  onSelectLevel,
  onViewFloorPlan,
}) => {
  const facadeLevels = facadeMap.levels;

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
              {/* Warm gold wash used by hovered / active levels (see facade.css) */}
              <defs>
                <linearGradient id="facade-level-fill" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#d4b06a" stopOpacity="0.32" />
                  <stop offset="50%" stopColor="#d4b06a" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#d4b06a" stopOpacity="0.32" />
                </linearGradient>
              </defs>

              {facadeLevels.map(level => {
                const isActive = level.id === activeLevelId;
                const isHovered = level.id === hoveredLevelId;
                const isHighlighted = isActive || isHovered;

                return (
                  <polygon
                    key={level.id}
                    className={`facade-level-polygon ${
                      isHighlighted ? 'facade-level-polygon--active' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                    points={level.overlayPolygon}
                    onClick={() => handleLevelClick(level)}
                    onPointerEnter={() => setHoveredLevelId(level.id)}
                    onPointerLeave={() => setHoveredLevelId(null)}
                  />
                );
              })}
            </svg>

            {/* Level badges with starting price */}
            {facadeLevels.map(level => {
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

      {/* Zoom Controls */}
      <div className="zoom-controls">
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
