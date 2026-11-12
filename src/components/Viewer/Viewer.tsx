import React, { useEffect, useCallback, useState } from 'react';
import type { Unit } from '../../types/realEstate';
import type { VectorMapDef } from '../../types/realEstate';
import { usePanZoom } from '../../hooks/usePanZoom';
import { Tooltip } from '../Tooltip/Tooltip';
import { ZoomIn, ZoomOut, Maximize, ArrowLeft } from 'lucide-react';

interface ViewerProps {
  mapDef: VectorMapDef;
  unitsByGraphicId: Map<string, Unit>;
  filteredUnitIds: Set<string>;
  changedUnitIds: Set<string>;
  selectedUnitId?: string;
  blueprintName: string;
  onSelectUnit: (unit: Unit) => void;
  /** Label shown in the breadcrumb when navigating from a facade level */
  activeLevelLabel?: string;
  /** Called when the user clicks "Volver a Fachada" */
  onBackToFacade?: () => void;
}

export const Viewer: React.FC<ViewerProps> = ({
  mapDef,
  unitsByGraphicId,
  filteredUnitIds,
  changedUnitIds,
  selectedUnitId,
  blueprintName,
  onSelectUnit,
  activeLevelLabel,
  onBackToFacade,
}) => {
  const {
    state,
    containerRef,
    handlers,
    zoomIn,
    zoomOut,
    resetZoom,
    centerCanvas,
    zoomPercent,
  } = usePanZoom();

  // Center on initial load and project change
  useEffect(() => {
    const timer = setTimeout(() => {
      centerCanvas(mapDef.width, mapDef.height);
    }, 100);
    return () => clearTimeout(timer);
  }, [mapDef, centerCanvas]);

  // Tooltip state
  const [hoveredUnit, setHoveredUnit] = useState<Unit | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      // Hover tooltip is mouse-only: on touch it would stick after a tap
      if (e.pointerType !== 'mouse') return;
      const target = e.target as SVGElement;
      const unitEl = target.closest('[data-unit-id]') as SVGElement | null;
      if (unitEl) {
        const graphicId = unitEl.getAttribute('data-graphic-id') || '';
        const unit = unitsByGraphicId.get(graphicId);
        if (unit && unit.status !== 'BLOCKED') {
          setHoveredUnit(unit);
          setTooltipPos({ x: e.clientX, y: e.clientY });
        }
      } else {
        setHoveredUnit(null);
        setTooltipPos(null);
      }
    },
    [unitsByGraphicId]
  );

  const handlePointerLeave = useCallback(() => {
    setHoveredUnit(null);
    setTooltipPos(null);
  }, []);

  const handleUnitClick = useCallback(
    (e: React.MouseEvent<SVGElement>) => {
      const target = e.target as SVGElement;
      const unitEl = target.closest('[data-unit-id]') as SVGElement | null;
      if (unitEl) {
        const graphicId = unitEl.getAttribute('data-graphic-id') || '';
        const unit = unitsByGraphicId.get(graphicId);
        if (unit) {
          onSelectUnit(unit);
        }
      }
    },
    [unitsByGraphicId, onSelectUnit]
  );

  return (
    <div className="viewer-area">
      <div
        className="viewer"
        ref={containerRef}
        {...handlers}
      >
        <div
          className="viewer__canvas"
          style={{
            transform: `translate(${state.x}px, ${state.y}px) scale(${state.scale})`,
          }}
        >
          <svg
            viewBox={mapDef.viewBox}
            width={mapDef.width}
            height={mapDef.height}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            style={{ display: 'block' }}
          >
            {/* ── Background Render Image (if provided) ── */}
            {mapDef.imageUrl && (
              <image
                href={mapDef.imageUrl}
                x="0"
                y="0"
                width={mapDef.width}
                height={mapDef.height}
                preserveAspectRatio="none"
              />
            )}

            {/* ── Structural Elements (roads, walls, areas) ── */}
            {mapDef.structuralElements.map((el, i) => {
              switch (el.type) {
                case 'road':
                  return el.points ? (
                    <polygon
                      key={`struct-${i}`}
                      className="svg-road"
                      points={el.points}
                    />
                  ) : null;

                case 'green-area':
                  return el.points ? (
                    <polygon
                      key={`struct-${i}`}
                      className="svg-green-area"
                      points={el.points}
                    />
                  ) : null;

                case 'common-area':
                  return el.points ? (
                    <polygon
                      key={`struct-${i}`}
                      className="svg-common-area"
                      points={el.points}
                    />
                  ) : null;

                case 'wall':
                  return (
                    <g key={`struct-${i}`}>
                      {el.lines?.map((l, li) => (
                        <line
                          key={li}
                          className="svg-wall"
                          x1={l.x1} y1={l.y1}
                          x2={l.x2} y2={l.y2}
                        />
                      ))}
                    </g>
                  );

                case 'wall-thick':
                  return (
                    <g key={`struct-${i}`}>
                      {el.lines?.map((l, li) => (
                        <line
                          key={li}
                          className="svg-wall svg-wall--thick"
                          x1={l.x1} y1={l.y1}
                          x2={l.x2} y2={l.y2}
                        />
                      ))}
                    </g>
                  );

                case 'area-label':
                  return el.labelPos ? (
                    <text
                      key={`struct-${i}`}
                      className="svg-area-label"
                      x={el.labelPos.x}
                      y={el.labelPos.y}
                    >
                      {el.label}
                    </text>
                  ) : null;

                case 'street-label':
                  return el.labelPos ? (
                    <text
                      key={`struct-${i}`}
                      className="svg-street-label"
                      x={el.labelPos.x}
                      y={el.labelPos.y}
                      transform={
                        el.rotation
                          ? `rotate(${el.rotation}, ${el.labelPos.x}, ${el.labelPos.y})`
                          : undefined
                      }
                    >
                      {el.label}
                    </text>
                  ) : null;

                default:
                  return null;
              }
            })}

            {/* ── Unit Polygons (interactive) ── */}
            {mapDef.unitPolygons.map(poly => {
              const unit = unitsByGraphicId.get(poly.graphicId);
              if (!unit) return null;

              const isFiltered = !filteredUnitIds.has(unit.id);
              const isSelected = unit.id === selectedUnitId;
              const isChanged = changedUnitIds.has(unit.id);

              let classNames = 'unit-polygon';
              if (isFiltered) classNames += ' unit-polygon--filtered-out';
              if (isSelected) classNames += ' unit-polygon--selected';
              if (isChanged) classNames += ' unit-polygon--status-changed';

              return (
                <g key={poly.graphicId}>
                  <polygon
                    className={classNames}
                    points={poly.points}
                    data-status={unit.status}
                    data-unit-id={unit.id}
                    data-graphic-id={poly.graphicId}
                    onClick={handleUnitClick}
                  />
                  {/* Unit label */}
                  <text
                    className="svg-unit-label"
                    x={poly.labelPos.x}
                    y={poly.labelPos.y}
                    style={{ opacity: isFiltered ? 0.1 : 0.9 }}
                  >
                    {unit.code}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Breadcrumb: where we are (+ back to facade for buildings) */}
      <div className="viewer-breadcrumb">
        {onBackToFacade && (
          <>
            <button className="viewer-breadcrumb__back" onClick={onBackToFacade}>
              <ArrowLeft size={14} />
              Fachada
            </button>
            <span className="viewer-breadcrumb__sep">/</span>
          </>
        )}
        <span className="viewer-breadcrumb__current">
          {activeLevelLabel || blueprintName}
        </span>
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
          onClick={() => resetZoom(mapDef.width, mapDef.height)}
          title="Restablecer vista"
        >
          <Maximize size={18} />
        </button>
      </div>

      {/* Tooltip */}
      <Tooltip unit={hoveredUnit} position={tooltipPos} />
    </div>
  );
};
