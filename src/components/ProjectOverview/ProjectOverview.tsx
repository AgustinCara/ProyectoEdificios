import React from 'react';
import type { Unit } from '../../types/realEstate';
import { MapPin, MousePointerClick } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface ProjectOverviewProps {
  name: string;
  location: string;
  developer?: string;
  amenities?: string[];
  availableUnits: number;
  totalUnits: number;
  /** Cheapest available unit, if any */
  priceFrom?: { value: number; currency: Unit['currency'] };
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  name,
  location,
  developer,
  amenities,
  availableUnits,
  totalUnits,
  priceFrom,
}) => {
  return (
    <aside className="project-overview">
      <div className="po-content">
        {/* Project identity */}
        <div className="po-section po-intro">
          <span className="po-intro__badge">Edificio</span>
          <h2 className="po-intro__title">{name}</h2>
          <div className="po-intro__location">
            <MapPin size={13} />
            {location}
          </div>
          {developer && (
            <div className="po-intro__developer">
              Desarrolla <strong>{developer}</strong>
            </div>
          )}
        </div>

        {/* Availability summary */}
        <div className="po-section po-summary">
          <div className="po-summary__item">
            <div className="po-summary__value po-summary__value--available">
              {availableUnits}
              <span className="po-summary__total"> / {totalUnits}</span>
            </div>
            <div className="po-summary__label">Unidades disponibles</div>
          </div>
          {priceFrom && (
            <div className="po-summary__item">
              <div className="po-summary__value po-summary__value--price">
                {formatCurrency(priceFrom.value, priceFrom.currency)}
              </div>
              <div className="po-summary__label">Precio desde</div>
            </div>
          )}
        </div>

        {/* Amenities */}
        {amenities && amenities.length > 0 && (
          <div className="po-section">
            <h3 className="po-section__title">Amenities</h3>
            <div className="po-amenities">
              {amenities.map(a => (
                <span key={a} className="po-amenity-tag">{a}</span>
              ))}
            </div>
          </div>
        )}

        {/* How to navigate */}
        <div className="po-section po-hint">
          <MousePointerClick size={16} className="po-hint__icon" />
          <p>Elegí un piso de la fachada para ver su planta y las unidades disponibles.</p>
        </div>
      </div>
    </aside>
  );
};
