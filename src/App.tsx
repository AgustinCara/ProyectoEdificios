import { useState, useCallback, useMemo } from 'react';
import type { Unit, FacadeLevel } from './types/realEstate';
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

const projectSlugs = mockProjects.map(p => p.slug);

function App() {
  const [currentSlug, setCurrentSlug] = useState(projectSlugs[0]);
  // Store only the ID so the drawer always reflects the latest unit data (live updates, reset)
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('facade');
  const [activeLevelId, setActiveLevelId] = useState<string | null>(null);
  const [isMapperOpen, setIsMapperOpen] = useState(false);

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

  // "Ver Planta Detallada" — respect the level selected in the sidebar, if any
  const handleViewFloorPlan = useCallback(
    (level: FacadeLevel | undefined) => {
      setViewMode('floorplan');
      updateFilter('floors', level ? level.floorRange : 'ALL');
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
              heroImage={project.heroImage}
              facadeLevels={project.facade?.levels}
              activeLevelId={activeLevelId}
              onSelectLevel={handleSelectLevel}
              onViewFloorPlan={() => handleViewFloorPlan(activeLevel)}
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
      <UnitDrawer unit={selectedUnit} onClose={handleCloseDrawer} />

      {/* Interactive Polygon Mapper Tool */}
      <PolygonMapperTool
        isOpen={isMapperOpen}
        onClose={() => setIsMapperOpen(false)}
        viewBoxWidth={mapDef.width}
        viewBoxHeight={mapDef.height}
      />
    </div>
  );
}

export default App;
