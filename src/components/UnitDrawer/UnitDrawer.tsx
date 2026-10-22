import React from 'react';
import type { Unit } from '../../types/realEstate';
import {
  STATUS_LABELS,
  UNIT_TYPE_LABELS,
  currencySymbol,
  formatCurrency,
  formatNumber,
} from '../../utils/format';
import {
  X,
  Maximize2,
  BedDouble,
  Bath,
  Compass,
  Ruler,
  DollarSign,
  Tag,
  Phone,
  CalendarCheck,
} from 'lucide-react';

interface UnitDrawerProps {
  unit: Unit | null;
  onClose: () => void;
}

export const UnitDrawer: React.FC<UnitDrawerProps> = ({ unit, onClose }) => {
  if (!unit) return null;

  const pricePerM2 = unit.surfaceTotalM2 > 0
    ? Math.round(unit.price / unit.surfaceTotalM2)
    : 0;

  return (
    <>
      {/* Overlay */}
      <div className="drawer-overlay" onClick={onClose} />

      {/* Drawer */}
      <div className="drawer">
        {/* Header */}
        <div className="drawer__header">
          <div className="drawer__title-group">
            <h2 className="drawer__title">{unit.code}</h2>
            <p className="drawer__subtitle">
              {unit.block ? `${unit.block} · ` : ''}
              {UNIT_TYPE_LABELS[unit.unitType]}
              {unit.floor !== undefined ? ` · ${unit.floor === 0 ? 'Planta Baja' : `Piso ${unit.floor}`}` : ''}
            </p>
          </div>
          <button className="drawer__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer__body">
          {/* Status Badge */}
          <div className={`drawer__status drawer__status--${unit.status}`}>
            <span className="drawer__status-dot" />
            {STATUS_LABELS[unit.status]}
          </div>

          {/* Price Block */}
          <div className="drawer__section">
            <div className="drawer__price-block">
              <div className="drawer__price-label">Precio</div>
              <div className="drawer__price-value">
                <span className="drawer__price-currency">{currencySymbol(unit.currency)}</span>
                {formatNumber(unit.price)}
              </div>
              {pricePerM2 > 0 && (
                <div className="drawer__price-per-m2">
                  {formatCurrency(pricePerM2, unit.currency)} / m²
                </div>
              )}
            </div>
          </div>

          {/* Specifications */}
          <div className="drawer__section">
            <h4 className="drawer__section-title">Especificaciones</h4>
            <div className="drawer__specs">
              {unit.rooms !== undefined && (
                <div className="drawer__spec">
                  <BedDouble size={18} className="drawer__spec-icon" />
                  <div className="drawer__spec-value">{unit.rooms}</div>
                  <div className="drawer__spec-label">Ambientes</div>
                </div>
              )}
              {unit.bathrooms !== undefined && (
                <div className="drawer__spec">
                  <Bath size={18} className="drawer__spec-icon" />
                  <div className="drawer__spec-value">{unit.bathrooms}</div>
                  <div className="drawer__spec-label">Baños</div>
                </div>
              )}
              <div className="drawer__spec">
                <Maximize2 size={18} className="drawer__spec-icon" />
                <div className="drawer__spec-value">{unit.surfaceTotalM2}</div>
                <div className="drawer__spec-label">m² Totales</div>
              </div>
              {unit.surfaceCoveredM2 > 0 && (
                <div className="drawer__spec">
                  <Ruler size={18} className="drawer__spec-icon" />
                  <div className="drawer__spec-value">{unit.surfaceCoveredM2}</div>
                  <div className="drawer__spec-label">m² Cubiertos</div>
                </div>
              )}
              {unit.orientation && (
                <div className="drawer__spec">
                  <Compass size={18} className="drawer__spec-icon" />
                  <div className="drawer__spec-value">{unit.orientation}</div>
                  <div className="drawer__spec-label">Orientación</div>
                </div>
              )}
              <div className="drawer__spec">
                <DollarSign size={18} className="drawer__spec-icon" />
                <div className="drawer__spec-value">
                  {pricePerM2 > 0 ? formatNumber(pricePerM2) : '—'}
                </div>
                <div className="drawer__spec-label">{currencySymbol(unit.currency)}/m²</div>
              </div>
            </div>
          </div>

          {/* Description */}
          {unit.description && (
            <div className="drawer__section">
              <h4 className="drawer__section-title">Descripción</h4>
              <p style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
              }}>
                {unit.description}
              </p>
            </div>
          )}

          {/* Features */}
          {unit.features.length > 0 && (
            <div className="drawer__section">
              <h4 className="drawer__section-title">
                <Tag size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Características
              </h4>
              <div className="drawer__features">
                {unit.features.map((f, i) => (
                  <span key={i} className="drawer__feature-tag">{f}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="drawer__actions">
          {unit.status === 'AVAILABLE' ? (
            <>
              <button className="drawer__btn drawer__btn--primary">
                <CalendarCheck size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                Reservar Unidad
              </button>
              <button className="drawer__btn drawer__btn--secondary">
                <Phone size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                Consultar
              </button>
            </>
          ) : unit.status === 'RESERVED' ? (
            <button className="drawer__btn drawer__btn--secondary" style={{ flex: 1 }}>
              <Phone size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
              Consultar Disponibilidad
            </button>
          ) : (
            <button className="drawer__btn drawer__btn--secondary" style={{ flex: 1, opacity: 0.6 }}>
              Unidad No Disponible
            </button>
          )}
        </div>
      </div>
    </>
  );
};
