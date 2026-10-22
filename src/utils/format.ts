import type { Unit, UnitStatus, UnitType } from '../types/realEstate';

const LOCALE = 'es-AR';

export const STATUS_LABELS: Record<UnitStatus, string> = {
  AVAILABLE: 'Disponible',
  RESERVED: 'Reservado',
  SOLD: 'Vendido',
  BLOCKED: 'Bloqueado',
};

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  APARTMENT: 'Departamento',
  LOT: 'Lote',
  PARKING: 'Cochera',
  STORAGE: 'Baulera',
  COMMERCIAL: 'Local',
};

/** Ej: "US$ 185.000" o "$ 185.000" */
export function formatCurrency(value: number, currency: Unit['currency'] = 'USD'): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Ej: "185.000" (sin símbolo de moneda) */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 }).format(value);
}

/** Símbolo corto de la moneda, ej: "US$" o "$" */
export function currencySymbol(currency: Unit['currency']): string {
  return currency === 'USD' ? 'US$' : '$';
}
