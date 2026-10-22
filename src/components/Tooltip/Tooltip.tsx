import React from 'react';
import type { Unit } from '../../types/realEstate';
import { MousePointerClick } from 'lucide-react';
import { STATUS_LABELS, formatCurrency } from '../../utils/format';

interface TooltipProps {
  unit: Unit | null;
  position: { x: number; y: number } | null;
}

export const Tooltip: React.FC<TooltipProps> = ({ unit, position }) => {
  if (!unit || !position) return null;

  // Offset from cursor
  const offsetX = 16;
  const offsetY = 16;

  // Prevent tooltip going off-screen
  const windowW = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const windowH = typeof window !== 'undefined' ? window.innerHeight : 1080;

  let left = position.x + offsetX;
  let top = position.y + offsetY;

  if (left + 280 > windowW) left = position.x - 280 - offsetX;
  if (top + 200 > windowH) top = position.y - 200 - offsetY;

  return (
    <div
      className="tooltip"
      style={{ left, top }}
    >
      <div className="tooltip__card">
        <div className="tooltip__header">
          <span className="tooltip__code">{unit.code}</span>
          <span className={`tooltip__badge tooltip__badge--${unit.status}`}>
            {STATUS_LABELS[unit.status]}
          </span>
        </div>

        <div className="tooltip__details">
          {unit.rooms !== undefined && (
            <div className="tooltip__row">
              <span className="tooltip__row-label">Ambientes</span>
              <span className="tooltip__row-value">{unit.rooms}</span>
            </div>
          )}
          <div className="tooltip__row">
            <span className="tooltip__row-label">Superficie</span>
            <span className="tooltip__row-value">{unit.surfaceTotalM2} m²</span>
          </div>
          {unit.surfaceCoveredM2 > 0 && (
            <div className="tooltip__row">
              <span className="tooltip__row-label">Cubierta</span>
              <span className="tooltip__row-value">{unit.surfaceCoveredM2} m²</span>
            </div>
          )}
          {unit.orientation && (
            <div className="tooltip__row">
              <span className="tooltip__row-label">Orientación</span>
              <span className="tooltip__row-value">{unit.orientation}</span>
            </div>
          )}
          <div className="tooltip__row">
            <span className="tooltip__row-label">Precio</span>
            <span className="tooltip__row-value tooltip__price">
              {formatCurrency(unit.price, unit.currency)}
            </span>
          </div>
        </div>

        <div className="tooltip__cta">
          <MousePointerClick size={12} />
          Click para ver detalles
        </div>
      </div>
    </div>
  );
};
