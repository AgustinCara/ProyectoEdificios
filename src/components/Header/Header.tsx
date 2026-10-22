import React from 'react';
import type { Project } from '../../types/realEstate';
import {
  Building2,
  ChevronDown,
  Radio,
  RotateCcw,
  MapPin,
  Layers,
  Image,
  PenTool,
} from 'lucide-react';

export type ViewMode = 'facade' | 'floorplan';

interface HeaderProps {
  projects: Project[];
  currentProject: Project | undefined;
  onSelectProject: (slug: string) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onResetData: () => void;
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  onOpenMapper?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  currentProject,
  onSelectProject,
  isSimulating,
  onToggleSimulation,
  onResetData,
  viewMode,
  onSetViewMode,
  onOpenMapper,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const isBuilding = currentProject?.projectType === 'BUILDING';

  return (
    <header className="header">
      <div className="header__left">
        {/* Brand */}
        <div className="header__brand">
          <div className="header__logo">
            <Building2 size={20} />
          </div>
          <span className="header__title">InmoView</span>
        </div>

        <div className="header__divider" />

        {/* Project Selector */}
        <div className="project-selector">
          <button
            className="project-selector__trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="project-selector__name">
              {currentProject?.name || 'Seleccionar proyecto'}
            </span>
            {currentProject && (
              <span className="project-selector__type">
                {currentProject.projectType === 'BUILDING' ? 'Edificio' : 'Loteo'}
              </span>
            )}
            <ChevronDown size={16} />
          </button>

          {dropdownOpen && (
            <div className="project-selector__dropdown">
              {projects.map(p => (
                <button
                  key={p.slug}
                  className={`project-selector__option ${currentProject?.slug === p.slug
                      ? 'project-selector__option--active'
                      : ''
                    }`}
                  onClick={() => {
                    onSelectProject(p.slug);
                    setDropdownOpen(false);
                  }}
                >
                  <div>
                    <div className="project-selector__option-name">{p.name}</div>
                    <div className="project-selector__option-location">
                      <MapPin size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                      {p.location}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode Toggle — only for buildings */}
        {isBuilding && (
          <>
            <div className="header__divider" />
            <div className="view-toggle">
              <button
                className={`view-toggle__btn ${viewMode === 'facade' ? 'view-toggle__btn--active' : ''}`}
                onClick={() => onSetViewMode('facade')}
              >
                <Image size={14} />
                Fachada
              </button>
              <button
                className={`view-toggle__btn ${viewMode === 'floorplan' ? 'view-toggle__btn--active' : ''}`}
                onClick={() => onSetViewMode('floorplan')}
              >
                <Layers size={14} />
                Planta
              </button>
            </div>
          </>
        )}
      </div>

      <div className="header__right">
        {/* Polygon Mapper Tool Toggle */}
        {onOpenMapper && (
          <button
            className="live-toggle"
            onClick={onOpenMapper}
            title="Herramienta para trazar coordenadas sobre planos y renders"
          >
            <PenTool size={14} />
            Modo Mapeador
          </button>
        )}

        {/* Reset Button */}
        <button
          className="live-toggle"
          onClick={onResetData}
          title="Restablecer datos originales"
        >
          <RotateCcw size={14} />
          Reset
        </button>

        {/* Live Simulation Toggle */}
        <button
          className={`live-toggle ${isSimulating ? 'live-toggle--active' : ''}`}
          onClick={onToggleSimulation}
        >
          <span className="live-toggle__dot" />
          <Radio size={14} />
          {isSimulating ? 'Simulación Activa' : 'Simulación en Vivo'}
        </button>
      </div>
    </header>
  );
};
