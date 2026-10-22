import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Unit, ReservationContact } from './types/realEstate';
import { mockProjects } from './data/mockProjects';
import { towerFloorPlan, subdivisionMasterplan, luminaFloorPlan } from './data/vectorMaps';
import { useInventory } from './hooks/useInventory';
import { Header } from './components/Header/Header';
import type { ViewMode } from './components/Header/Header';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Viewer } from './components/Viewer/Viewer';
import { UnitDrawer } from './components/UnitDrawer/UnitDrawer';
import { FacadeViewer } from './components/FacadeViewer/FacadeViewer';
import { ProjectOverview } from './components/ProjectOverview/ProjectOverview';
import { PolygonMapperTool } from './components/PolygonMapper/PolygonMapperTool';
import { ReservationModal } from './components/ReservationModal/ReservationModal';
import { readDeepLink, writeDeepLink } from './utils/links';

// Internal tools (mapper, reset, simulation) only show up with ?admin in the URL
const showDevTools = new URLSearchParams(window.location.search).has('admin');

// Shared link (?proyecto=…&unidad=…) → initial project, unit and view
const initialLink = readDeepLink();
const initialProject =
  mockProjects.find(p => p.slug === initialLink.projectSlug) ?? mockProjects[0];
const initialUnit = initialLink.unitCode
  ? initialProject.units.find(u => u.code.toLowerCase() === initialLink.unitCode!.toLowerCase())
  : undefined;
const initialViewMode: ViewMode =
  initialUnit || initialProject.projectType !== 'BUILDING' ? 'floorplan' : 'facade';

function App() {
  const [currentSlug, setCurrentSlug] = useState(initialProject.slug);
  // Store only the ID so the drawer always reflects the latest unit data (live updates, reset)
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(initialUnit?.id ?? null);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [activeLevelId, setActiveLevelId] = useState<string | null>(null);
  const [isMapperOpen, setIsMapperOpen] = useState(false);
  const [reservingUnitId, setReservingUnitId] = useState<string | null>(null);

  const {
    project,
    filters,
    filteredUnits,
    filteredUnitIds,
    stats,
    isSimulating,
    changedUnitIds,
    unitsByGraphicId,
    updateFilter,
    clearFilters,
    toggleSimulation,
    resetData,
    reserveUnit,
  } = useInventory(currentSlug);

  // Determine which vector map to use
  const mapDef = useMemo(() => {
    if (!project) return luminaFloorPlan;
    if (project.slug === 'residencias-lumina-plaza') return luminaFloorPlan;
    return project.projectType === 'BUILDING' ? towerFloorPlan : subdivisionMasterplan;
  }, [project]);

  const selectedUnit = useMemo<Unit | null>(
    () => project?.units.find(u => u.id === selectedUnitId) ?? null,
    [project, selectedUnitId]
  );

  const reservingUnit = useMemo<Unit | null>(
    () => project?.units.find(u => u.id === reservingUnitId) ?? null,
    [project, reservingUnitId]
  );

  // Keep the address bar pointing at the current project/unit (shareable at any time)
  const projectSlug = project?.slug;
  const selectedUnitCode = selectedUnit?.code;
  useEffect(() => {
    if (projectSlug) writeDeepLink({ projectSlug, unitCode: selectedUnitCode });
  }, [projectSlug, selectedUnitCode]);

  const handleSelectProject = useCallback((slug: string) => {
    setCurrentSlug(slug);
    setSelectedUnitId(null);
    setActiveLevelId(null);
    // Default to facade for buildings, floorplan for subdivisions
    const proj = mockProjects.find(p => p.slug === slug);
    setViewMode(proj?.projectType === 'BUILDING' ? 'facade' : 'floorplan');
  }, []);

  const handleSelectUnit = useCallback((unit: Unit) => {
    setSelectedUnitId(unit.id);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedUnitId(null);
  }, []);

  const handleOpenReservation = useCallback((unit: Unit) => {
    setReservingUnitId(unit.id);
  }, []);

  const handleCloseReservation = useCallback(() => {
    setReservingUnitId(null);
  }, []);

  // Returns an error message for the modal, or null on success
  const handleConfirmReservation = useCallback(
    (contact: ReservationContact): string | null => {
      if (!reservingUnitId) return 'No hay una unidad seleccionada.';
      const result = reserveUnit(reservingUnitId, contact);
      return result.ok ? null : result.reason;
    },
    [reservingUnitId, reserveUnit]
  );

  const handleResetData = useCallback(() => {
    resetData();
    setSelectedUnitId(null);
  }, [resetData]);

  const handleSelectLevel = useCallback((levelId: string) => {
    setActiveLevelId(prev => prev === levelId ? null : levelId);
  }, []);

  // Clearing filters also drops the facade level the floor filter came from
  const handleClearFilters = useCallback(() => {
    clearFilters();
    setActiveLevelId(null);
  }, [clearFilters]);

  // Facade level clicked — go to the floor plan filtered by that level's whole floor range
  const handleViewFloorPlanFromLevel = useCallback(
    (_levelId: string, floors: number[]) => {
      setViewMode('floorplan');
      updateFilter('floors', floors.length > 0 ? floors : 'ALL');
    },
    [updateFilter]
  );

  // Going back to the facade (header toggle or breadcrumb) drops the floor filter
  const handleSetViewMode = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      if (mode === 'facade') updateFilter('floors', 'ALL');
    },
    [updateFilter]
  );

  if (!project) return null;

  const isBuilding = project.projectType === 'BUILDING';
  const showFacade = isBuilding && viewMode === 'facade' && !!project.facade;

  const activeLevel = activeLevelId
    ? project.facade?.levels.find(l => l.id === activeLevelId)
    : undefined;
  // Only show the level in the breadcrumb while its floor filter is actually applied
  const activeLevelLabel = filters.floors !== 'ALL' ? activeLevel?.fullLabel : undefined;

  const handleBackToFacade = isBuilding ? () => handleSetViewMode('facade') : undefined;

  // Cheapest available unit, for the "Precio desde" summary
  const cheapestAvailable = project.units
    .filter(u => u.status === 'AVAILABLE')
    .reduce<Unit | undefined>((min, u) => (!min || u.price < min.price ? u : min), undefined);

  return (
    <div className="app-layout">
      <Header
        projects={mockProjects}
        currentProject={project}
        onSelectProject={handleSelectProject}
        isSimulating={isSimulating}
        onToggleSimulation={toggleSimulation}
        onResetData={handleResetData}
        viewMode={viewMode}
        onSetViewMode={handleSetViewMode}
        onOpenMapper={() => setIsMapperOpen(true)}
        showDevTools={showDevTools}
      />

      <div className="app-body">
        {showFacade ? (
          <>
            {/* Facade mode: ProjectOverview sidebar + FacadeViewer */}
            <ProjectOverview
              name={project.name}
              location={project.location}
              developer={project.developer}
              amenities={project.amenities}
              availableUnits={stats.availableUnits}
              totalUnits={stats.totalUnits}
              priceFrom={
                cheapestAvailable
                  ? { value: cheapestAvailable.price, currency: cheapestAvailable.currency }
                  : undefined
              }
            />
            <FacadeViewer
              heroImage={project.heroImage || ''}
              facadeMap={project.facade!}
              activeLevelId={activeLevelId}
              onSelectLevel={handleSelectLevel}
              onViewFloorPlan={handleViewFloorPlanFromLevel}
            />
          </>
        ) : (
          <>
            {/* Floor plan mode: Sidebar filters + SVG Viewer */}
            <Sidebar
              stats={stats}
              filters={filters}
              filteredUnits={filteredUnits}
              projectType={project.projectType}
              onUpdateFilter={updateFilter}
              onClearFilters={handleClearFilters}
              onSelectUnit={handleSelectUnit}
              selectedUnitId={selectedUnit?.id}
            />
            <Viewer
              mapDef={mapDef}
              unitsByGraphicId={unitsByGraphicId}
              filteredUnitIds={filteredUnitIds}
              changedUnitIds={changedUnitIds}
              selectedUnitId={selectedUnit?.id}
              blueprintName={project.blueprint.name}
              onSelectUnit={handleSelectUnit}
              activeLevelLabel={activeLevelLabel}
              onBackToFacade={handleBackToFacade}
            />
          </>
        )}
      </div>

      {/* Unit Detail Drawer */}
      <UnitDrawer
        project={project}
        unit={selectedUnit}
        onClose={handleCloseDrawer}
        onReserve={handleOpenReservation}
      />

      {/* Reservation form */}
      {reservingUnit && (
        <ReservationModal
          project={project}
          unit={reservingUnit}
          onClose={handleCloseReservation}
          onConfirm={handleConfirmReservation}
        />
      )}

      {/* Interactive Polygon Mapper Tool (internal) */}
      {showDevTools && (
        <PolygonMapperTool
          isOpen={isMapperOpen}
          onClose={() => setIsMapperOpen(false)}
          viewBoxWidth={mapDef.width}
          viewBoxHeight={mapDef.height}
        />
      )}
    </div>
  );
}

export default App;
