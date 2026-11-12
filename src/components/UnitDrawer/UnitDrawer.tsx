import React, { useEffect, useRef, useState } from 'react';
import type { Project, Unit } from '../../types/realEstate';
import {
  STATUS_LABELS,
  UNIT_TYPE_LABELS,
  currencySymbol,
  formatCurrency,
  formatNumber,
} from '../../utils/format';
import { buildInquiryMessage, buildUnitUrl, buildWhatsAppUrl } from '../../utils/links';
import { FinancingCalculator } from '../FinancingCalculator/FinancingCalculator';
import {
  X,
  Maximize2,
  BedDouble,
  Bath,
  Compass,
  Ruler,
  Tag,
  CalendarCheck,
  MessageCircle,
  Share2,
  Check,
} from 'lucide-react';

interface UnitDrawerProps {
  project: Project;
  unit: Unit | null;
  onClose: () => void;
  onReserve: (unit: Unit) => void;
}

export const UnitDrawer: React.FC<UnitDrawerProps> = ({ project, unit, onClose, onReserve }) => {
  // Tied to the unit, so the "copied" feedback never carries over to another one
  const [copiedUnitId, setCopiedUnitId] = useState<string | null>(null);
  const linkCopied = !!unit && copiedUnitId === unit.id;
  const drawerRef = useRef<HTMLDivElement>(null);
  const isOpen = !!unit;

  // Close on Escape (the reservation modal stops the key first when it's on top)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Move keyboard focus into the drawer when it opens or shows another unit
  const unitId = unit?.id;
  useEffect(() => {
    if (unitId) drawerRef.current?.focus();
  }, [unitId]);

  if (!unit) return null;

  const pricePerM2 = unit.surfaceTotalM2 > 0
    ? Math.round(unit.price / unit.surfaceTotalM2)
    : 0;

  const whatsAppUrl = project.contactWhatsApp
    ? buildWhatsAppUrl(project.contactWhatsApp, buildInquiryMessage(project, unit))
    : undefined;

  // Native share sheet on mobile; copy to clipboard elsewhere
  const handleShare = async () => {
    const url = buildUnitUrl(project.slug, unit.code);
    if (navigator.share) {
      try {
        await navigator.share({ title: `${unit.code} · ${project.name}`, url });
      } catch {
        // User dismissed the share sheet — nothing to do
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopiedUnitId(unit.id);
    setTimeout(() => setCopiedUnitId(null), 2000);
  };

  return (
    <>
      {/* Overlay */}
      <div className="drawer-overlay" onClick={onClose} />

      {/* Drawer */}
      <div
        className="drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="drawer__header">
          <div className="drawer__title-group">
            <h2 className="drawer__title" id="drawer-title">{unit.code}</h2>
            <p className="drawer__subtitle">
              {unit.block ? `${unit.block} · ` : ''}
              {UNIT_TYPE_LABELS[unit.unitType]}
              {unit.floor !== undefined ? ` · ${unit.floor === 0 ? 'Planta Baja' : `Piso ${unit.floor}`}` : ''}
            </p>
          </div>
          <div className="drawer__header-actions">
            <button
              className={`drawer__close ${linkCopied ? 'drawer__close--done' : ''}`}
              onClick={handleShare}
              title="Compartir unidad"
              aria-label="Compartir unidad"
            >
              {linkCopied ? <Check size={18} /> : <Share2 size={16} />}
            </button>
            <button className="drawer__close" onClick={onClose} aria-label="Cerrar">
              <X size={18} />
            </button>
          </div>
        </div>
        {linkCopied && <div className="drawer__toast">Link copiado</div>}

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

          {/* Financing — keyed by project so the chosen plan carries over between its units */}
          {project.financing && unit.status === 'AVAILABLE' && (
            <FinancingCalculator
              key={project.slug}
              project={project}
              plan={project.financing}
              unit={unit}
            />
          )}

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
          {unit.status === 'AVAILABLE' && (
            <button className="drawer__btn drawer__btn--primary" onClick={() => onReserve(unit)}>
              <CalendarCheck size={16} />
              Reservar
            </button>
          )}
          {(unit.status === 'AVAILABLE' || unit.status === 'RESERVED') && whatsAppUrl && (
            <a
              className="drawer__btn drawer__btn--whatsapp"
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={16} />
              {unit.status === 'RESERVED' ? 'Consultar disponibilidad' : 'Consultar por WhatsApp'}
            </a>
          )}
          {(unit.status === 'SOLD' || unit.status === 'BLOCKED') && (
            <button className="drawer__btn drawer__btn--secondary" disabled>
              Unidad no disponible
            </button>
          )}
        </div>
      </div>
    </>
  );
};
