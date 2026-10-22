/**
 * Real Estate Service Layer
 *
 * Abstraction over data access. Currently backed by mock data,
 * designed to be swapped with REST API calls without changing consumer code.
 * Includes a real-time event simulator (SSE/WebSocket emulation).
 */

import type { Project, Unit, UnitStatus, RealTimeEvent } from '../types/realEstate';
import { mockProjects } from '../data/mockProjects';

// ─── Deep clone helper (to avoid mutating original mock data) ────────────────
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ─── Project & Inventory Service ─────────────────────────────────────────────

class RealEstateService {
  private projects: Project[];
  private listeners: Set<(event: RealTimeEvent) => void> = new Set();
  private simulationInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.projects = deepClone(mockProjects);
  }

  /** Get all projects (lightweight, for selectors) */
  getProjects(): Project[] {
    return this.projects.map(p => ({
      ...p,
      units: [], // Don't send units in the listing
    }));
  }

  /** Get a full project by slug (with all units) */
  getProjectBySlug(slug: string): Project | undefined {
    return this.projects.find(p => p.slug === slug);
  }

  /** Get a specific unit by ID across all projects */
  getUnit(unitId: string): Unit | undefined {
    for (const p of this.projects) {
      const unit = p.units.find(u => u.id === unitId);
      if (unit) return unit;
    }
    return undefined;
  }

  /** Change unit status (with event emission) */
  updateUnitStatus(unitId: string, newStatus: UnitStatus): boolean {
    for (const p of this.projects) {
      const unit = p.units.find(u => u.id === unitId);
      if (unit) {
        const oldStatus = unit.status;
        unit.status = newStatus;

        // Recompute stats
        p.summaryStats = {
          totalUnits: p.units.length,
          availableUnits: p.units.filter(u => u.status === 'AVAILABLE').length,
          reservedUnits: p.units.filter(u => u.status === 'RESERVED').length,
          soldUnits: p.units.filter(u => u.status === 'SOLD').length,
        };

        // Emit event
        this.emit({
          type: 'STATUS_CHANGED',
          unitId,
          newStatus,
          timestamp: new Date().toISOString(),
          reason: `${oldStatus} → ${newStatus}`,
        });

        return true;
      }
    }
    return false;
  }

  // ─── Real-time Event System ─────────────────────────────────────────────

  /** Subscribe to real-time events */
  subscribe(listener: (event: RealTimeEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(event: RealTimeEvent): void {
    this.listeners.forEach(fn => fn(event));
  }

  // ─── Live Simulation ───────────────────────────────────────────────────

  /** Start simulating random status changes at interval */
  startSimulation(projectSlug: string, intervalMs: number = 4000): void {
    this.stopSimulation();
    this.simulationInterval = setInterval(() => {
      const project = this.getProjectBySlug(projectSlug);
      if (!project) return;

      // Pick a random unit that can change
      const changeableUnits = project.units.filter(
        u => u.status === 'AVAILABLE' || u.status === 'RESERVED'
      );

      if (changeableUnits.length === 0) return;

      const unit = changeableUnits[Math.floor(Math.random() * changeableUnits.length)];

      const transitions: Record<string, UnitStatus[]> = {
        AVAILABLE: ['RESERVED'],
        RESERVED: ['SOLD', 'AVAILABLE'],
      };

      const possibleNext = transitions[unit.status] || [];
      if (possibleNext.length === 0) return;

      const nextStatus = possibleNext[Math.floor(Math.random() * possibleNext.length)];
      this.updateUnitStatus(unit.id, nextStatus);
    }, intervalMs);
  }

  /** Stop live simulation */
  stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  /** Reset all units to original mock state */
  resetData(): void {
    this.projects = deepClone(mockProjects);
  }
}

// Singleton instance
export const realEstateService = new RealEstateService();
