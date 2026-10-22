export type UnitStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'BLOCKED';

export type UnitType = 'APARTMENT' | 'LOT' | 'PARKING' | 'STORAGE' | 'COMMERCIAL';

export type ProjectType = 'BUILDING' | 'SUBDIVISION';

export interface Unit {
  id: string;
  code: string; // Ej: "Depto 4B" o "Lote 14"
  graphicId: string; // ID en el elemento SVG (path/polygon)
  status: UnitStatus;
  unitType: UnitType;
  price: number;
  currency: 'USD' | 'ARS';
  surfaceCoveredM2: number;
  surfaceTotalM2: number;
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  block?: string; // Manzana / Torre
  orientation?: 'N' | 'S' | 'E' | 'O' | 'NE' | 'NO' | 'SE' | 'SO';
  features: string[];
  description?: string;
  images?: string[];
  floorPlanUrl?: string;
  centroid?: { x: number; y: number }; // Coordenada central para Tooltip
}

export interface Blueprint {
  id: string;
  name: string;
  type: 'SVG' | 'CANVAS' | 'GLTF';
  viewBox: string; // Ej: "0 0 1600 1000"
  width: number;
  height: number;
  backgroundLabel?: string;
  imageUrl?: string;
}

export interface FacadeLevel {
  id: string;           // ej. 'level-pb'
  label: string;        // ej. 'PB'
  fullLabel: string;    // ej. 'Planta Baja'
  floorRange: number[]; // pisos que abarca, ej. [0] o [3, 4]
  priceFrom?: number;   // precio mínimo del nivel
  overlayPolygon: string; // puntos SVG del polígono sobre la fachada
  labelPos: { x: number; y: number }; // posición del badge de precio
  badgeSide?: 'left' | 'right'; // lado del badge
}

export interface FacadeMap {
  viewBox: string;  // debe coincidir con la relación de aspecto de la imagen
  width: number;
  height: number;
  levels: FacadeLevel[];
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  location: string;
  projectType: ProjectType;
  blueprint: Blueprint;
  units: Unit[];
  developer?: string;
  amenities?: string[];
  heroImage?: string;
  facade?: FacadeMap;
  summaryStats?: {
    totalUnits: number;
    availableUnits: number;
    reservedUnits: number;
    soldUnits: number;
  };
}

export interface FilterState {
  search: string;
  status: UnitStatus | 'ALL';
  minPrice: number;
  maxPrice: number;
  rooms: number | 'ALL';
  unitType: UnitType | 'ALL';
  sortBy: 'code' | 'price_asc' | 'price_desc' | 'surface_desc';
  floors: number[] | 'ALL'; // rango de pisos (desde un nivel de la fachada)
}

export interface RealTimeEvent {
  type: 'STATUS_CHANGED';
  unitId: string;
  newStatus: UnitStatus;
  timestamp: string;
  reason?: string;
}
