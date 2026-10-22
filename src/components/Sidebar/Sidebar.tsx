import React from 'react';
import type { Unit, FilterState, UnitStatus } from '../../types/realEstate';
import { Search, Filter, Package } from 'lucide-react';
import { STATUS_LABELS, formatCurrency } from '../../utils/format';

interface SidebarProps {
  stats: {
    totalUnits: number;
    availableUnits: number;
    reservedUnits: number;
    soldUnits: number;
  };
  filters: FilterState;
  filteredUnits: Unit[];
  projectType: 'BUILDING' | 'SUBDIVISION';
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onClearFilters: () => void;
  onSelectUnit: (unit: Unit) => void;
  selectedUnitId?: string;
}

const FILTER_STATUS_LABELS: Record<UnitStatus | 'ALL', string> = {
  ALL: 'Todos',
  ...STATUS_LABELS,
};

export const Sidebar: React.FC<SidebarProps> = ({
  stats,
  filters,
  filteredUnits,
  projectType,
  onUpdateFilter,
  onClearFilters,
  onSelectUnit,
  selectedUnitId,
}) => {
  const total = stats.totalUnits || 1;
  const availPct = (stats.availableUnits / total) * 100;
  const resPct = (stats.reservedUnits / total) * 100;
  const soldPct = (stats.soldUnits / total) * 100;

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.status !== 'ALL' ||
    filters.rooms !== 'ALL' ||
    filters.unitType !== 'ALL' ||
    filters.floors !== 'ALL' ||
    filters.minPrice > 0 ||
    filters.maxPrice < Infinity ||
    filters.sortBy !== 'code';

  return (
    <aside className="sidebar">
      {/* Stats Section */}
      <div className="sidebar__section">
        <h3 className="sidebar__section-title">Inventario</h3>
        <div className="stats-grid">
          <div className="stat-card stat-card--total stat-card--full">
            <div className="stat-card__value">{stats.totalUnits}</div>
            <div className="stat-card__label">
              {projectType === 'BUILDING' ? 'Unidades Totales' : 'Lotes Totales'}
            </div>
          </div>
          <div className="stat-card stat-card--available">
            <div className="stat-card__value">{stats.availableUnits}</div>
            <div className="stat-card__label">Disponibles</div>
          </div>
          <div className="stat-card stat-card--reserved">
            <div className="stat-card__value">{stats.reservedUnits}</div>
            <div className="stat-card__label">Reservados</div>
          </div>
          <div className="stat-card stat-card--sold" style={{ gridColumn: '1 / -1' }}>
            <div className="stat-card__value">{stats.soldUnits}</div>
            <div className="stat-card__label">Vendidos</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="inventory-bar">
          <div
            className="inventory-bar__segment inventory-bar__segment--available"
            style={{ width: `${availPct}%` }}
          />
          <div
            className="inventory-bar__segment inventory-bar__segment--reserved"
            style={{ width: `${resPct}%` }}
          />
          <div
            className="inventory-bar__segment inventory-bar__segment--sold"
            style={{ width: `${soldPct}%` }}
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className="sidebar__section">
        <h3 className="sidebar__section-title">
          <Filter size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          Filtros
        </h3>

        {/* Search */}
        <div className="filter-group">
          <div className="filter-search">
            <Search size={15} className="filter-search__icon" />
            <input
              type="text"
              className="filter-search__input"
              placeholder={
                projectType === 'BUILDING'
                  ? 'Buscar depto (ej: 4A)...'
                  : 'Buscar lote (ej: A3)...'
              }
              value={filters.search}
              onChange={e => onUpdateFilter('search', e.target.value)}
            />
          </div>
        </div>

        {/* Status Chips */}
        <div className="filter-group">
          <label className="filter-label">Estado</label>
          <div className="filter-chips">
            {(['ALL', 'AVAILABLE', 'RESERVED', 'SOLD'] as const).map(s => (
              <button
                key={s}
                className={`filter-chip filter-chip--${s.toLowerCase()} ${
                  filters.status === s ? 'filter-chip--active' : ''
                }`}
                onClick={() => onUpdateFilter('status', s as UnitStatus | 'ALL')}
              >
                {s !== 'ALL' && (
                  <span className={`filter-chip__dot filter-chip__dot--${s.toLowerCase()}`} />
                )}
                {FILTER_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Rooms filter - only for buildings */}
        {projectType === 'BUILDING' && (
          <div className="filter-group">
            <label className="filter-label">Ambientes</label>
            <div className="filter-buttons">
              {(['ALL', 1, 2, 3] as const).map(r => (
                <button
                  key={String(r)}
                  className={`filter-btn ${filters.rooms === r ? 'filter-btn--active' : ''}`}
                  onClick={() => onUpdateFilter('rooms', r)}
                >
                  {r === 'ALL' ? 'Todos' : `${r} Amb`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sort */}
        <div className="filter-group">
          <label className="filter-label">Ordenar por</label>
          <div className="filter-buttons">
            {[
              { key: 'code' as const, label: 'Código' },
              { key: 'price_asc' as const, label: '$ ↑' },
              { key: 'price_desc' as const, label: '$ ↓' },
              { key: 'surface_desc' as const, label: 'm² ↓' },
            ].map(opt => (
              <button
                key={opt.key}
                className={`filter-btn ${filters.sortBy === opt.key ? 'filter-btn--active' : ''}`}
                onClick={() => onUpdateFilter('sortBy', opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {hasActiveFilters ? (
          <button
            className="filter-btn"
            onClick={onClearFilters}
            style={{ width: '100%', marginTop: 8, color: 'var(--primary)' }}
          >
            Limpiar filtros
          </button>
        ) : null}
      </div>

      {/* Unit List */}
      <div className="sidebar__section" style={{ flex: 1 }}>
        <h3 className="sidebar__section-title">
          <Package size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          {projectType === 'BUILDING' ? 'Unidades' : 'Lotes'} ({filteredUnits.length})
        </h3>
        <div className="unit-list">
          {filteredUnits.length === 0 ? (
            <div className="empty-state">
              <Search size={28} className="empty-state__icon" />
              <div className="empty-state__title">Sin resultados</div>
              <div className="empty-state__subtitle">Ajusta los filtros para ver unidades</div>
            </div>
          ) : (
            filteredUnits.map(unit => (
              <div
                key={unit.id}
                className={`unit-list-item ${selectedUnitId === unit.id ? 'unit-list-item--selected' : ''}`}
                onClick={() => onSelectUnit(unit)}
                style={
                  selectedUnitId === unit.id
                    ? { borderColor: 'var(--primary)', background: 'rgba(59,130,246,0.08)' }
                    : undefined
                }
              >
                <div className="unit-list-item__left">
                  <span className={`unit-list-item__status-dot unit-list-item__status-dot--${unit.status}`} />
                  <div>
                    <div className="unit-list-item__code">{unit.code}</div>
                    <div className="unit-list-item__surface">
                      {unit.surfaceTotalM2}m²
                      {unit.rooms ? ` · ${unit.rooms} amb` : ''}
                    </div>
                  </div>
                </div>
                <div className="unit-list-item__price">
                  {formatCurrency(unit.price, unit.currency)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
