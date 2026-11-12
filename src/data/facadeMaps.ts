/**
 * Facade overlay geometry definitions for building projects.
 * Defines the SVG polygons that overlay on top of the facade image,
 * one per floor level group.
 *
 * ViewBox matches the facade image aspect ratio (3:4 → 750 x 1000).
 */

import type { FacadeMap } from '../types/realEstate';

export type FacadeMapDef = FacadeMap;

// ─── Residencias Lumina Plaza Facade ──────────────────────────────────────────
export const luminaFacade: FacadeMapDef = {
  viewBox: '0 0 750 1000',
  width: 750,
  height: 1000,
  levels: [
    {
      id: 'lumina-penthouse',
      label: 'Penthouse',
      fullLabel: 'Penthouse Terraza (P7)',
      floorRange: [7],
      priceFrom: 420000,
      overlayPolygon: '160,100 680,100 680,210 160,210',
      labelPos: { x: 580, y: 150 },
      badgeSide: 'right',
    },
    {
      id: 'lumina-p5-6',
      label: 'Pisos 5-6',
      fullLabel: 'Pisos 5 y 6 (Alta Vista)',
      floorRange: [5, 6],
      priceFrom: 310000,
      overlayPolygon: '140,215 690,215 690,380 140,380',
      labelPos: { x: 180, y: 290 },
      badgeSide: 'left',
    },
    {
      id: 'lumina-p3-4',
      label: 'Pisos 3-4',
      fullLabel: 'Pisos 3 y 4 (Intermedios)',
      floorRange: [3, 4],
      priceFrom: 260000,
      overlayPolygon: '130,385 700,385 700,560 130,560',
      labelPos: { x: 580, y: 470 },
      badgeSide: 'right',
    },
    {
      id: 'lumina-p1-2',
      label: 'Pisos 1-2',
      fullLabel: 'Pisos 1 y 2',
      floorRange: [1, 2],
      priceFrom: 210000,
      overlayPolygon: '130,565 710,565 710,740 130,740',
      labelPos: { x: 180, y: 650 },
      badgeSide: 'left',
    },
    {
      id: 'lumina-pb',
      label: 'PB',
      fullLabel: 'Planta Baja & Lobby',
      floorRange: [0],
      priceFrom: 195000,
      overlayPolygon: '130,745 710,745 710,880 130,880',
      labelPos: { x: 580, y: 810 },
      badgeSide: 'right',
    },
  ],
};
