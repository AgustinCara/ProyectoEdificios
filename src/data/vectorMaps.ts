/**
 * Vector map geometry definitions for two demo projects:
 *  1. "Torre Mirador" — A residential building floor plan (Piso Tipo) with apartments
 *  2. "Barrio Los Álamos" — A horizontal subdivision masterplan with lots, streets, green areas
 *
 * All coordinates are defined in an SVG viewBox coordinate system.
 * Each unit polygon maps to a unit record in mockProjects via `graphicId`.
 */

// ─── BUILDING FLOOR PLAN (Torre Mirador - Piso 4) ────────────────────────────
// ViewBox: 0 0 1200 800
// Layout: 6 apartments on a typical floor with central hallway, elevator and stairs

export interface PolygonDef {
  graphicId: string;
  points: string; // SVG polygon points
  labelPos: { x: number; y: number };
}

export interface StructuralElement {
  type: 'wall' | 'wall-thick' | 'area-label' | 'common-area' | 'green-area' | 'road' | 'street-label';
  points?: string; // polygon points for filled areas
  lines?: Array<{ x1: number; y1: number; x2: number; y2: number }>; // for walls
  label?: string;
  labelPos?: { x: number; y: number };
  rotation?: number;
}

export interface VectorMapDef {
  viewBox: string;
  width: number;
  height: number;
  unitPolygons: PolygonDef[];
  structuralElements: StructuralElement[];
  imageUrl?: string;
}

// ─── TOWER FLOOR PLAN ────────────────────────────────────────────────────────

export const towerFloorPlan: VectorMapDef = {
  viewBox: '0 0 1200 800',
  width: 1200,
  height: 800,
  unitPolygons: [
    // Left wing - Top Row
    {
      graphicId: 'unit-4A',
      points: '60,60 340,60 340,250 60,250',
      labelPos: { x: 200, y: 155 },
    },
    {
      graphicId: 'unit-4B',
      points: '360,60 580,60 580,250 360,250',
      labelPos: { x: 470, y: 155 },
    },
    // Right wing - Top Row
    {
      graphicId: 'unit-4C',
      points: '620,60 840,60 840,250 620,250',
      labelPos: { x: 730, y: 155 },
    },
    {
      graphicId: 'unit-4D',
      points: '860,60 1140,60 1140,250 860,250',
      labelPos: { x: 1000, y: 155 },
    },
    // Left wing - Bottom Row
    {
      graphicId: 'unit-4E',
      points: '60,490 400,490 400,740 60,740',
      labelPos: { x: 230, y: 615 },
    },
    // Right wing - Bottom Row
    {
      graphicId: 'unit-4F',
      points: '800,490 1140,490 1140,740 800,740',
      labelPos: { x: 970, y: 615 },
    },
  ],
  structuralElements: [
    // Outer boundary walls
    {
      type: 'wall-thick',
      lines: [
        { x1: 40, y1: 40, x2: 1160, y2: 40 },     // top
        { x1: 1160, y1: 40, x2: 1160, y2: 760 },   // right
        { x1: 1160, y1: 760, x2: 40, y2: 760 },     // bottom
        { x1: 40, y1: 760, x2: 40, y2: 40 },         // left
      ],
    },
    // Central corridor horizontal walls
    {
      type: 'wall',
      lines: [
        { x1: 40, y1: 270, x2: 1160, y2: 270 },   // top of corridor
        { x1: 40, y1: 470, x2: 1160, y2: 470 },   // bottom of corridor
      ],
    },
    // Vertical separations between apartments (top row)
    {
      type: 'wall',
      lines: [
        { x1: 350, y1: 40, x2: 350, y2: 270 },
        { x1: 590, y1: 40, x2: 590, y2: 270 },
        { x1: 610, y1: 40, x2: 610, y2: 270 },
        { x1: 850, y1: 40, x2: 850, y2: 270 },
      ],
    },
    // Vertical separations (bottom row)
    {
      type: 'wall',
      lines: [
        { x1: 410, y1: 470, x2: 410, y2: 760 },
        { x1: 790, y1: 470, x2: 790, y2: 760 },
      ],
    },
    // Elevator & Stairs area (center bottom corridor)
    {
      type: 'common-area',
      points: '430,290 770,290 770,450 430,450',
    },
    {
      type: 'area-label',
      label: 'Hall / Ascensores',
      labelPos: { x: 600, y: 350 },
    },
    {
      type: 'area-label',
      label: 'Escalera',
      labelPos: { x: 600, y: 420 },
    },
    // Corridor labels
    {
      type: 'area-label',
      label: 'Pasillo',
      labelPos: { x: 200, y: 370 },
    },
    {
      type: 'area-label',
      label: 'Pasillo',
      labelPos: { x: 1000, y: 370 },
    },
    // Medianera (middle of bottom)
    {
      type: 'common-area',
      points: '430,490 770,490 770,740 430,740',
    },
    {
      type: 'area-label',
      label: 'Área Común',
      labelPos: { x: 600, y: 580 },
    },
    {
      type: 'area-label',
      label: 'SUM / Lavadero',
      labelPos: { x: 600, y: 650 },
    },
  ],
};

// ─── HORIZONTAL SUBDIVISION MASTERPLAN (Barrio Los Álamos) ────────────────────
// ViewBox: 0 0 1600 1000
// Layout: ~20 lots arranged in blocks (manzanas) with streets and green areas

export const subdivisionMasterplan: VectorMapDef = {
  viewBox: '0 0 1600 1000',
  width: 1600,
  height: 1000,
  unitPolygons: [
    // ── MANZANA A (Top-left block) ──
    { graphicId: 'lot-A1', points: '100,100 260,100 260,220 100,220', labelPos: { x: 180, y: 160 } },
    { graphicId: 'lot-A2', points: '270,100 430,100 430,220 270,220', labelPos: { x: 350, y: 160 } },
    { graphicId: 'lot-A3', points: '100,230 260,230 260,350 100,350', labelPos: { x: 180, y: 290 } },
    { graphicId: 'lot-A4', points: '270,230 430,230 430,350 270,350', labelPos: { x: 350, y: 290 } },
    { graphicId: 'lot-A5', points: '100,360 260,360 260,470 100,470', labelPos: { x: 180, y: 415 } },
    { graphicId: 'lot-A6', points: '270,360 430,360 430,470 270,470', labelPos: { x: 350, y: 415 } },

    // ── MANZANA B (Top-right block) ──
    { graphicId: 'lot-B1', points: '560,100 720,100 720,220 560,220', labelPos: { x: 640, y: 160 } },
    { graphicId: 'lot-B2', points: '730,100 890,100 890,220 730,220', labelPos: { x: 810, y: 160 } },
    { graphicId: 'lot-B3', points: '560,230 720,230 720,350 560,350', labelPos: { x: 640, y: 290 } },
    { graphicId: 'lot-B4', points: '730,230 890,230 890,350 730,350', labelPos: { x: 810, y: 290 } },
    { graphicId: 'lot-B5', points: '560,360 720,360 720,470 560,470', labelPos: { x: 640, y: 415 } },
    { graphicId: 'lot-B6', points: '730,360 890,360 890,470 730,470', labelPos: { x: 810, y: 415 } },

    // ── MANZANA C (Bottom-left block) ──
    { graphicId: 'lot-C1', points: '100,600 280,600 280,730 100,730', labelPos: { x: 190, y: 665 } },
    { graphicId: 'lot-C2', points: '290,600 470,600 470,730 290,730', labelPos: { x: 380, y: 665 } },
    { graphicId: 'lot-C3', points: '100,740 280,740 280,870 100,870', labelPos: { x: 190, y: 805 } },
    { graphicId: 'lot-C4', points: '290,740 470,740 470,870 290,870', labelPos: { x: 380, y: 805 } },

    // ── MANZANA D (Bottom-right block) ──
    { graphicId: 'lot-D1', points: '560,600 740,600 740,730 560,730', labelPos: { x: 650, y: 665 } },
    { graphicId: 'lot-D2', points: '750,600 930,600 930,730 750,730', labelPos: { x: 840, y: 665 } },
    { graphicId: 'lot-D3', points: '560,740 740,740 740,870 560,870', labelPos: { x: 650, y: 805 } },
    { graphicId: 'lot-D4', points: '750,740 930,740 930,870 750,870', labelPos: { x: 840, y: 805 } },

    // ── MANZANA E (Far-right premium lots) ──
    { graphicId: 'lot-E1', points: '1080,100 1300,100 1300,280 1080,280', labelPos: { x: 1190, y: 190 } },
    { graphicId: 'lot-E2', points: '1310,100 1500,100 1500,280 1310,280', labelPos: { x: 1405, y: 190 } },
    { graphicId: 'lot-E3', points: '1080,290 1300,290 1300,470 1080,470', labelPos: { x: 1190, y: 380 } },
    { graphicId: 'lot-E4', points: '1310,290 1500,290 1500,470 1310,470', labelPos: { x: 1405, y: 380 } },
    { graphicId: 'lot-E5', points: '1080,600 1300,600 1300,730 1080,730', labelPos: { x: 1190, y: 665 } },
    { graphicId: 'lot-E6', points: '1310,600 1500,600 1500,730 1310,730', labelPos: { x: 1405, y: 665 } },
    { graphicId: 'lot-E7', points: '1080,740 1300,740 1300,870 1080,870', labelPos: { x: 1190, y: 805 } },
    { graphicId: 'lot-E8', points: '1310,740 1500,740 1500,870 1310,870', labelPos: { x: 1405, y: 805 } },
  ],
  structuralElements: [
    // ── Roads ──
    // Main horizontal avenue (center)
    { type: 'road', points: '40,490 1560,490 1560,580 40,580' },
    { type: 'street-label', label: 'AV. DE LOS ÁLAMOS', labelPos: { x: 800, y: 535 }, rotation: 0 },

    // Vertical road left
    { type: 'road', points: '450,40 540,40 540,960 450,960' },
    { type: 'street-label', label: 'CALLE ROBLES', labelPos: { x: 495, y: 300 }, rotation: -90 },

    // Vertical road right
    { type: 'road', points: '950,40 1060,40 1060,960 950,960' },
    { type: 'street-label', label: 'CALLE CEDROS', labelPos: { x: 1005, y: 300 }, rotation: -90 },

    // Perimeter road top
    { type: 'road', points: '40,40 1560,40 1560,85 40,85' },
    // Perimeter road bottom
    { type: 'road', points: '40,910 1560,910 1560,960 40,960' },
    // Perimeter road left
    { type: 'road', points: '40,40 85,40 85,960 40,960' },
    // Perimeter road right
    { type: 'road', points: '1515,40 1560,40 1560,960 1515,960' },

    // ── Green Areas ──
    // Central park
    { type: 'green-area', points: '560,490 890,490 890,580 560,580' },
    { type: 'area-label', label: '🌳 Plaza Central', labelPos: { x: 725, y: 535 } },

    // Small park top-center
    { type: 'green-area', points: '1080,490 1500,490 1500,580 1080,580' },
    { type: 'area-label', label: '🌳 Área Verde', labelPos: { x: 1290, y: 535 } },

    // Entrance area bottom-left
    { type: 'green-area', points: '100,910 430,910 430,960 100,960' },
    { type: 'area-label', label: 'Acceso Principal', labelPos: { x: 265, y: 935 } },

    // ── Block Labels ──
    { type: 'area-label', label: 'MANZANA A', labelPos: { x: 265, y: 82 } },
    { type: 'area-label', label: 'MANZANA B', labelPos: { x: 725, y: 82 } },
    { type: 'area-label', label: 'MANZANA C', labelPos: { x: 285, y: 590 } },
    { type: 'area-label', label: 'MANZANA D', labelPos: { x: 745, y: 590 } },
    { type: 'area-label', label: 'MANZANA E', labelPos: { x: 1290, y: 82 } },
  ],
};

// ─── RESIDENCIAS LUMINA PLAZA (Planta Real Render) ─────────────────────────
export const luminaFloorPlan: VectorMapDef = {
  viewBox: '0 0 1200 900',
  width: 1200,
  height: 900,
  imageUrl: '/floorplan-real.jpg',
  unitPolygons: [
    {
      graphicId: 'unit-lumina-5A',
      points: '40,40 560,40 560,420 40,420',
      labelPos: { x: 300, y: 230 },
    },
    {
      graphicId: 'unit-lumina-5B',
      points: '640,40 1160,40 1160,420 640,420',
      labelPos: { x: 900, y: 230 },
    },
    {
      graphicId: 'unit-lumina-5C',
      points: '40,440 560,440 560,860 40,860',
      labelPos: { x: 300, y: 650 },
    },
    {
      graphicId: 'unit-lumina-5D',
      points: '640,440 1160,440 1160,860 640,860',
      labelPos: { x: 900, y: 650 },
    },
  ],
  structuralElements: [
    {
      type: 'common-area',
      points: '565,40 635,40 635,860 565,860',
    },
    {
      type: 'area-label',
      label: 'Hall / Ascensores',
      labelPos: { x: 600, y: 440 },
    },
  ],
};
