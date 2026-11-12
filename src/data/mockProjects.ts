import type { Project, Unit } from '../types/realEstate';

// ─── Helper: generate centroid from polygon points string ───
function centroidFromPoints(points: string): { x: number; y: number } {
  const coords = points.split(' ').map(p => {
    const [x, y] = p.split(',').map(Number);
    return { x, y };
  });
  const cx = coords.reduce((sum, c) => sum + c.x, 0) / coords.length;
  const cy = coords.reduce((sum, c) => sum + c.y, 0) / coords.length;
  return { x: cx, y: cy };
}

// For centroid computation we import vector maps here
import { towerFloorPlan, subdivisionMasterplan, luminaFloorPlan } from './vectorMaps';
import { torreMiradorFacade, luminaFacade } from './facadeMaps';

function getCentroid(mapDef: { unitPolygons: Array<{ graphicId: string; points: string }> }, graphicId: string) {
  const poly = mapDef.unitPolygons.find(p => p.graphicId === graphicId);
  return poly ? centroidFromPoints(poly.points) : { x: 0, y: 0 };
}

// ─── TORRE MIRADOR — Edificio residencial en altura ─────────────────────────

const torreUnits: Unit[] = [
  {
    id: 'u-4A',
    code: '4A',
    graphicId: 'unit-4A',
    status: 'AVAILABLE',
    unitType: 'APARTMENT',
    price: 125000,
    currency: 'USD',
    surfaceCoveredM2: 58,
    surfaceTotalM2: 65,
    rooms: 2,
    bathrooms: 1,
    floor: 4,
    block: 'Torre Mirador',
    orientation: 'N',
    features: ['Balcón al frente', 'Cocina integrada', 'Placard empotrado'],
    description: 'Departamento de 2 ambientes con excelente vista al norte. Living-comedor amplio con salida a balcón corrido. Cocina integrada con mesada de granito.',
    centroid: getCentroid(towerFloorPlan, 'unit-4A'),
  },
  {
    id: 'u-4B',
    code: '4B',
    graphicId: 'unit-4B',
    status: 'RESERVED',
    unitType: 'APARTMENT',
    price: 98000,
    currency: 'USD',
    surfaceCoveredM2: 42,
    surfaceTotalM2: 48,
    rooms: 1,
    bathrooms: 1,
    floor: 4,
    block: 'Torre Mirador',
    orientation: 'N',
    features: ['Monoambiente divisible', 'Balcón', 'Amenities incluidos'],
    description: 'Monoambiente divisible con vista al norte. Ideal inversión para renta o primer hogar. Incluye acceso a amenities del edificio.',
    centroid: getCentroid(towerFloorPlan, 'unit-4B'),
  },
  {
    id: 'u-4C',
    code: '4C',
    graphicId: 'unit-4C',
    status: 'AVAILABLE',
    unitType: 'APARTMENT',
    price: 102000,
    currency: 'USD',
    surfaceCoveredM2: 44,
    surfaceTotalM2: 50,
    rooms: 1,
    bathrooms: 1,
    floor: 4,
    block: 'Torre Mirador',
    orientation: 'NE',
    features: ['Luminoso', 'Vista panorámica', 'Piso porcelanato'],
    description: 'Monoambiente con excelente luminosidad natural por orientación noreste. Terminaciones premium con piso de porcelanato.',
    centroid: getCentroid(towerFloorPlan, 'unit-4C'),
  },
  {
    id: 'u-4D',
    code: '4D',
    graphicId: 'unit-4D',
    status: 'SOLD',
    unitType: 'APARTMENT',
    price: 155000,
    currency: 'USD',
    surfaceCoveredM2: 72,
    surfaceTotalM2: 82,
    rooms: 3,
    bathrooms: 2,
    floor: 4,
    block: 'Torre Mirador',
    orientation: 'NE',
    features: ['3 ambientes', 'Suite con vestidor', 'Doble balcón', 'Toilette'],
    description: 'Amplio departamento de 3 ambientes con suite principal con vestidor y baño privado. Doble balcón con vista panorámica.',
    centroid: getCentroid(towerFloorPlan, 'unit-4D'),
  },
  {
    id: 'u-4E',
    code: '4E',
    graphicId: 'unit-4E',
    status: 'AVAILABLE',
    unitType: 'APARTMENT',
    price: 145000,
    currency: 'USD',
    surfaceCoveredM2: 68,
    surfaceTotalM2: 78,
    rooms: 3,
    bathrooms: 2,
    floor: 4,
    block: 'Torre Mirador',
    orientation: 'S',
    features: ['3 ambientes', 'Cocina separada', 'Lavadero independiente', 'Balcón terraza'],
    description: 'Departamento de 3 ambientes con cocina separada y lavadero independiente. Gran balcón terraza con asador.',
    centroid: getCentroid(towerFloorPlan, 'unit-4E'),
  },
  {
    id: 'u-4F',
    code: '4F',
    graphicId: 'unit-4F',
    status: 'AVAILABLE',
    unitType: 'APARTMENT',
    price: 140000,
    currency: 'USD',
    surfaceCoveredM2: 66,
    surfaceTotalM2: 75,
    rooms: 2,
    bathrooms: 2,
    floor: 4,
    block: 'Torre Mirador',
    orientation: 'SE',
    features: ['2 ambientes amplio', 'Suite con baño', 'Toilette', 'Vista al parque'],
    description: 'Dos ambientes de categoría con suite y toilette. Vista privilegiada al parque. Terminaciones de primera calidad.',
    centroid: getCentroid(towerFloorPlan, 'unit-4F'),
  },
];

// ─── BARRIO LOS ÁLAMOS — Loteo horizontal ────────────────────────────────────

type StatusType = 'AVAILABLE' | 'RESERVED' | 'SOLD';

const lotStatuses: StatusType[] = [
  'AVAILABLE', 'RESERVED', 'AVAILABLE', 'SOLD',
  'AVAILABLE', 'AVAILABLE', 'SOLD', 'RESERVED',
  'AVAILABLE', 'AVAILABLE', 'RESERVED', 'AVAILABLE',
  'AVAILABLE', 'SOLD', 'AVAILABLE', 'AVAILABLE',
  'AVAILABLE', 'AVAILABLE', 'RESERVED', 'SOLD',
  'AVAILABLE', 'SOLD', 'AVAILABLE', 'AVAILABLE',
  'RESERVED', 'AVAILABLE', 'AVAILABLE', 'SOLD',
];

const lotFeaturesSets = [
  ['Esquina', 'Doble frente', 'Cerca de plaza'],
  ['Orientación norte', 'Medianera'],
  ['Vista al lago', 'Fondo de manzana'],
  ['Esquina', 'Sobre avenida principal'],
  ['Orientación noreste', 'Lote interno'],
  ['Sobre calle Robles', 'Lote regular'],
];

function makeLot(
  block: string,
  num: number,
  graphicId: string,
  status: StatusType,
  surface: number,
  price: number,
  frontMeters: number,
  depthMeters: number,
): Unit {
  const featIdx = (num - 1) % lotFeaturesSets.length;
  return {
    id: `lot-${block}${num}`,
    code: `${block}${num}`,
    graphicId,
    status,
    unitType: 'LOT',
    price,
    currency: 'USD',
    surfaceCoveredM2: 0,
    surfaceTotalM2: surface,
    features: [
      `Frente: ${frontMeters}m`,
      `Fondo: ${depthMeters}m`,
      ...lotFeaturesSets[featIdx],
    ],
    description: `Lote ${block}${num} de ${surface}m² en Manzana ${block}. ${frontMeters}m de frente x ${depthMeters}m de fondo. Excelente ubicación dentro del barrio cerrado Los Álamos.`,
    block: `Manzana ${block}`,
    centroid: getCentroid(subdivisionMasterplan, graphicId),
  };
}

const barrioUnits: Unit[] = [
  // Manzana A (6 lots)
  makeLot('A', 1, 'lot-A1', lotStatuses[0],  450, 32000,  15, 30),
  makeLot('A', 2, 'lot-A2', lotStatuses[1],  450, 35000,  15, 30),
  makeLot('A', 3, 'lot-A3', lotStatuses[2],  420, 30000,  15, 28),
  makeLot('A', 4, 'lot-A4', lotStatuses[3],  420, 31000,  15, 28),
  makeLot('A', 5, 'lot-A5', lotStatuses[4],  380, 28000,  15, 25.3),
  makeLot('A', 6, 'lot-A6', lotStatuses[5],  380, 29000,  15, 25.3),

  // Manzana B (6 lots)
  makeLot('B', 1, 'lot-B1', lotStatuses[6],  450, 33000,  15, 30),
  makeLot('B', 2, 'lot-B2', lotStatuses[7],  450, 36000,  15, 30),
  makeLot('B', 3, 'lot-B3', lotStatuses[8],  420, 31000,  15, 28),
  makeLot('B', 4, 'lot-B4', lotStatuses[9],  420, 32000,  15, 28),
  makeLot('B', 5, 'lot-B5', lotStatuses[10], 380, 28500,  15, 25.3),
  makeLot('B', 6, 'lot-B6', lotStatuses[11], 380, 29500,  15, 25.3),

  // Manzana C (4 lots)
  makeLot('C', 1, 'lot-C1', lotStatuses[12], 520, 38000,  18, 28.9),
  makeLot('C', 2, 'lot-C2', lotStatuses[13], 520, 39000,  18, 28.9),
  makeLot('C', 3, 'lot-C3', lotStatuses[14], 480, 35000,  18, 26.7),
  makeLot('C', 4, 'lot-C4', lotStatuses[15], 480, 36000,  18, 26.7),

  // Manzana D (4 lots)
  makeLot('D', 1, 'lot-D1', lotStatuses[16], 520, 37000,  18, 28.9),
  makeLot('D', 2, 'lot-D2', lotStatuses[17], 520, 38000,  18, 28.9),
  makeLot('D', 3, 'lot-D3', lotStatuses[18], 480, 34000,  18, 26.7),
  makeLot('D', 4, 'lot-D4', lotStatuses[19], 480, 35500,  18, 26.7),

  // Manzana E - Premium (8 lots, larger)
  makeLot('E', 1, 'lot-E1', lotStatuses[20], 680, 52000,  22, 30.9),
  makeLot('E', 2, 'lot-E2', lotStatuses[21], 620, 48000,  19, 32.6),
  makeLot('E', 3, 'lot-E3', lotStatuses[22], 680, 54000,  22, 30.9),
  makeLot('E', 4, 'lot-E4', lotStatuses[23], 620, 49000,  19, 32.6),
  makeLot('E', 5, 'lot-E5', lotStatuses[24], 550, 42000,  22, 25),
  makeLot('E', 6, 'lot-E6', lotStatuses[25], 510, 40000,  19, 26.8),
  makeLot('E', 7, 'lot-E7', lotStatuses[26], 550, 43000,  22, 25),
  makeLot('E', 8, 'lot-E8', lotStatuses[27], 510, 41000,  19, 26.8),
];

// ─── RESIDENCIAS LUMINA PLAZA (Proyecto con Render y Planta Real) ─────────

const luminaUnits: Unit[] = [
  {
    id: 'u-lumina-5A',
    code: 'Dpto 5A',
    graphicId: 'unit-lumina-5A',
    status: 'AVAILABLE',
    unitType: 'APARTMENT',
    price: 320000,
    currency: 'USD',
    surfaceCoveredM2: 110,
    surfaceTotalM2: 135,
    rooms: 4,
    bathrooms: 2,
    floor: 5,
    block: 'Residencias Lumina',
    orientation: 'N',
    features: ['Planta real renderizada', 'Suite principal con vestidor', 'Balcón aterrazado con parrilla', 'Doble cochera'],
    description: 'Espectacular departamento de 4 ambientes en render real. Master suite con vestidor, gran living comedor integrado a cocina de isla y amplio balcón al frente.',
    centroid: getCentroid(luminaFloorPlan, 'unit-lumina-5A'),
  },
  {
    id: 'u-lumina-5B',
    code: 'Dpto 5B',
    graphicId: 'unit-lumina-5B',
    status: 'RESERVED',
    unitType: 'APARTMENT',
    price: 295000,
    currency: 'USD',
    surfaceCoveredM2: 98,
    surfaceTotalM2: 120,
    rooms: 3,
    bathrooms: 2,
    floor: 5,
    block: 'Residencias Lumina',
    orientation: 'NE',
    features: ['Planta real renderizada', 'Suite con baño privado', 'Cocina equipada', 'Balcón corrido'],
    description: 'Excelente piso de 3 ambientes sobre render arquitectónico real. Acabados en madera natural y ventanales de piso a techo.',
    centroid: getCentroid(luminaFloorPlan, 'unit-lumina-5B'),
  },
  {
    id: 'u-lumina-5C',
    code: 'Dpto 5C',
    graphicId: 'unit-lumina-5C',
    status: 'AVAILABLE',
    unitType: 'APARTMENT',
    price: 245000,
    currency: 'USD',
    surfaceCoveredM2: 82,
    surfaceTotalM2: 95,
    rooms: 2,
    bathrooms: 2,
    floor: 5,
    block: 'Residencias Lumina',
    orientation: 'S',
    features: ['Planta real renderizada', 'Living con pisos de madera', 'Toilette de recepción'],
    description: 'Unidad de 2 ambientes amplia y luminosa con terminaciones de diseño, cocina semi-integrada y balcón privado.',
    centroid: getCentroid(luminaFloorPlan, 'unit-lumina-5C'),
  },
  {
    id: 'u-lumina-5D',
    code: 'Dpto 5D',
    graphicId: 'unit-lumina-5D',
    status: 'SOLD',
    unitType: 'APARTMENT',
    price: 260000,
    currency: 'USD',
    surfaceCoveredM2: 88,
    surfaceTotalM2: 104,
    rooms: 3,
    bathrooms: 2,
    floor: 5,
    block: 'Residencias Lumina',
    orientation: 'SE',
    features: ['Planta real renderizada', '2 dormitorios', 'Balcón panorámico'],
    description: 'Departamento de 3 ambientes al contrafrente con vistas despejadas a zonas verdes.',
    centroid: getCentroid(luminaFloorPlan, 'unit-lumina-5D'),
  },
];

// ─── EXPORT PROJECTS ────────────────────────────────────────────────────────

// Ventas: 11 2300-6327 (móvil AR → formato internacional 54 9 11 …)
const SALES_WHATSAPP = '5491123006327';

export const mockProjects: Project[] = [
  {
    id: 'proj-lumina-plaza',
    slug: 'residencias-lumina-plaza',
    name: 'Residencias Lumina Plaza',
    location: 'Av. Alicia Moreau de Justo 1500, Puerto Madero, Buenos Aires',
    projectType: 'BUILDING',
    developer: 'Lumina Development Group',
    contactWhatsApp: SALES_WHATSAPP,
    financing: {
      minDownPaymentPct: 30,
      maxDownPaymentPct: 80,
      installmentOptions: [12, 24, 36],
      annualRatePct: 0,
      note: 'Cuotas fijas en USD',
    },
    amenities: ['Rooftop Lounge', 'Piscina Infinity', 'Gimnasio Tech', 'Cocheras Valet'],
    heroImage: '/building-facade.webp',
    facade: luminaFacade,
    blueprint: {
      id: 'bp-lumina-p5',
      name: 'Planta Tipo Real Render (Piso 5)',
      type: 'SVG',
      viewBox: '0 0 1200 900',
      width: 1200,
      height: 900,
      imageUrl: '/floorplan.webp',
    },
    units: luminaUnits,
  },
  {
    id: 'proj-torre-mirador',
    slug: 'torre-mirador',
    name: 'Torre Mirador',
    location: 'Av. del Libertador 4200, Buenos Aires',
    projectType: 'BUILDING',
    developer: 'Solutec',
    contactWhatsApp: SALES_WHATSAPP,
    financing: {
      minDownPaymentPct: 40,
      maxDownPaymentPct: 90,
      installmentOptions: [12, 24, 36, 48],
      annualRatePct: 6,
      note: 'Cuotas en USD',
    },
    amenities: ['Pileta', 'SUM', 'Cocheras', 'Locales', 'Gimnasio', 'Lavadero'],
    heroImage: '/building-facade.webp',
    facade: torreMiradorFacade,
    blueprint: {
      id: 'bp-torre-p4',
      name: 'Planta Piso 4 (Tipo)',
      type: 'SVG',
      viewBox: '0 0 1200 800',
      width: 1200,
      height: 800,
    },
    units: torreUnits,
  },
  {
    id: 'proj-barrio-alamos',
    slug: 'barrio-los-alamos',
    name: 'Barrio Los Álamos',
    location: 'Ruta 8 Km 62, Pilar, Buenos Aires',
    projectType: 'SUBDIVISION',
    contactWhatsApp: SALES_WHATSAPP,
    financing: {
      minDownPaymentPct: 20,
      maxDownPaymentPct: 80,
      installmentOptions: [12, 24, 36, 60],
      annualRatePct: 8,
      note: 'Cuotas en USD',
    },
    blueprint: {
      id: 'bp-alamos-master',
      name: 'Masterplan General',
      type: 'SVG',
      viewBox: '0 0 1600 1000',
      width: 1600,
      height: 1000,
    },
    units: barrioUnits,
  },
];
