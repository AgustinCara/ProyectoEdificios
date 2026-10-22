import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Project, Unit, FilterState, RealTimeEvent } from '../types/realEstate';
import { realEstateService } from '../services/realEstateService';

const defaultFilters: FilterState = {
  search: '',
  status: 'ALL',
  minPrice: 0,
  maxPrice: Infinity,
  rooms: 'ALL',
  unitType: 'ALL',
  sortBy: 'code',
  floors: 'ALL',
};

export function useInventory(projectSlug: string) {
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isSimulating, setIsSimulating] = useState(false);
  const [changedUnitIds, setChangedUnitIds] = useState<Set<string>>(new Set());
  const changedTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Load project data
  const loadProject = useCallback(() => {
    const p = realEstateService.getProjectBySlug(projectSlug);
    if (p) {
      setProject({ ...p, units: [...p.units] });
    }
  }, [projectSlug]);

  useEffect(() => {
    loadProject();
    setFilters(defaultFilters);
  }, [loadProject]);

  // Subscribe to real-time events
  useEffect(() => {
    const timers = changedTimersRef.current;
    const unsubscribe = realEstateService.subscribe((event: RealTimeEvent) => {
      if (event.type === 'STATUS_CHANGED') {
        // Reload project to get fresh data
        loadProject();

        // Mark unit as recently changed for visual flash
        setChangedUnitIds(prev => new Set(prev).add(event.unitId));

        // Clear after animation
        const existingTimer = timers.get(event.unitId);
        if (existingTimer) clearTimeout(existingTimer);
        const timer = setTimeout(() => {
          setChangedUnitIds(prev => {
            const next = new Set(prev);
            next.delete(event.unitId);
            return next;
          });
          timers.delete(event.unitId);
        }, 1200);
        timers.set(event.unitId, timer);
      }
    });

    return () => {
      unsubscribe();
      timers.forEach(t => clearTimeout(t));
      timers.clear();
    };
  }, [loadProject]);

  // Simulation controls
  const toggleSimulation = useCallback(() => {
    if (isSimulating) {
      realEstateService.stopSimulation();
      setIsSimulating(false);
    } else {
      realEstateService.startSimulation(projectSlug, 3500);
      setIsSimulating(true);
    }
  }, [isSimulating, projectSlug]);

  // Stop simulation on unmount or project change (and keep the UI flag in sync)
  useEffect(() => {
    return () => {
      realEstateService.stopSimulation();
      setIsSimulating(false);
    };
  }, [projectSlug]);

  // Reset data
  const resetData = useCallback(() => {
    realEstateService.stopSimulation();
    setIsSimulating(false);
    realEstateService.resetData();
    loadProject();
  }, [loadProject]);

  // Filter logic
  const filteredUnits = useMemo<Unit[]>(() => {
    if (!project) return [];

    let result = [...project.units];

    // Search filter
    if (filters.search.trim()) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        u =>
          u.code.toLowerCase().includes(term) ||
          u.id.toLowerCase().includes(term) ||
          (u.block && u.block.toLowerCase().includes(term)) ||
          (u.description && u.description.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (filters.status !== 'ALL') {
      result = result.filter(u => u.status === filters.status);
    }

    // Price range filter
    if (filters.minPrice > 0) {
      result = result.filter(u => u.price >= filters.minPrice);
    }
    if (filters.maxPrice < Infinity && filters.maxPrice > 0) {
      result = result.filter(u => u.price <= filters.maxPrice);
    }

    // Rooms filter
    if (filters.rooms !== 'ALL') {
      result = result.filter(u => u.rooms === filters.rooms);
    }

    // Unit type filter
    if (filters.unitType !== 'ALL') {
      result = result.filter(u => u.unitType === filters.unitType);
    }

    // Floor range filter (from facade level click)
    if (filters.floors !== 'ALL') {
      const floors = filters.floors;
      result = result.filter(u => u.floor !== undefined && floors.includes(u.floor));
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'surface_desc':
        result.sort((a, b) => b.surfaceTotalM2 - a.surfaceTotalM2);
        break;
      default:
        result.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    }

    return result;
  }, [project, filters]);

  // Filtered unit IDs set for quick lookup in the viewer
  const filteredUnitIds = useMemo(
    () => new Set(filteredUnits.map(u => u.id)),
    [filteredUnits]
  );

  // Summary stats from the current (possibly mutated) project
  const stats = useMemo(() => {
    if (!project) return { totalUnits: 0, availableUnits: 0, reservedUnits: 0, soldUnits: 0 };
    return {
      totalUnits: project.units.length,
      availableUnits: project.units.filter(u => u.status === 'AVAILABLE').length,
      reservedUnits: project.units.filter(u => u.status === 'RESERVED').length,
      soldUnits: project.units.filter(u => u.status === 'SOLD').length,
    };
  }, [project]);

  // Update a single filter value
  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Get the unit map for O(1) lookup by graphicId
  const unitsByGraphicId = useMemo(() => {
    if (!project) return new Map<string, Unit>();
    return new Map(project.units.map(u => [u.graphicId, u]));
  }, [project]);

  return {
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
  };
}
