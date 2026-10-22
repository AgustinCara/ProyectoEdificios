import React from 'react';
import type { FacadeLevel } from '../../types/realEstate';
import {
  MapPin,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface ProjectOverviewProps {
  name: string;
  location: string;
  developer?: string;
  amenities?: string[];
  heroImage?: string;
  facadeLevels?: FacadeLevel[];
  activeLevelId: string | null;
  onSelectLevel: (levelId: string) => void;
  onViewFloorPlan: () => void;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  name,
  location,
  developer,
  amenities,
  heroImage,
  facadeLevels,
  activeLevelId,
  onSelectLevel,
  onViewFloorPlan,
}) => {
  return (
    <aside className="project-overview">
      {/* Hero Banner */}
      <div className="po-hero">
        {heroImage && (
          <img
            src={heroImage}
            alt={name}
            className="po-hero__image"
          />
        )}
        <div className="po-hero__overlay">
          <div className="po-hero__badge">Edificio</div>
          <h2 className="po-hero__title">{name}</h2>
          <div className="po-hero__location">
            <MapPin size={13} />
            {location}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="po-content">
        {/* Developer info */}
        {developer && (
          <div className="po-section po-developer">
            <div className="po-developer__row">
              <div>
                <div className="po-developer__label">Desarrollador</div>
                <div className="po-developer__name">{developer}</div>
              </div>
              <button className="po-developer__link">
                Sitio <ExternalLink size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Amenities */}
        {amenities && amenities.length > 0 && (
          <div className="po-section">
            <div className="po-section__header">
              <span className="po-section__number">01</span>
              <span className="po-section__title">Amenities</span>
            </div>
            <div className="po-amenities">
              {amenities.map(a => (
                <span key={a} className="po-amenity-tag">
                  + {a.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pisos / Levels */}
        {facadeLevels && facadeLevels.length > 0 && (
          <div className="po-section">
            <div className="po-section__header">
              <span className="po-section__number">02</span>
              <span className="po-section__title">Pisos</span>
            </div>
            <div className="po-levels">
              {facadeLevels.map(level => (
                <button
                  key={level.id}
                  className={`po-level-btn ${
                    activeLevelId === level.id ? 'po-level-btn--active' : ''
                  }`}
                  onClick={() => onSelectLevel(level.id)}
                >
                  {level.label}
                </button>
              ))}
            </div>
            <p className="po-levels__hint">
              Click en un piso para ver la planta y los departamentos disponibles.
            </p>
          </div>
        )}

        {/* View floor plan CTA */}
        <div className="po-section po-cta-section">
          <button className="po-cta-btn" onClick={onViewFloorPlan}>
            <Layers size={16} />
            Ver Planta Detallada
          </button>
        </div>
      </div>
    </aside>
  );
};
