import type { Project, Unit } from '../types/realEstate';
import { formatCurrency } from './format';

// URL params, ej: ?proyecto=torre-mirador&unidad=4B
const PROJECT_PARAM = 'proyecto';
const UNIT_PARAM = 'unidad';

export interface DeepLink {
  projectSlug?: string;
  unitCode?: string;
}

export function readDeepLink(search: string = window.location.search): DeepLink {
  const params = new URLSearchParams(search);
  return {
    projectSlug: params.get(PROJECT_PARAM) ?? undefined,
    unitCode: params.get(UNIT_PARAM) ?? undefined,
  };
}

/**
 * Keep the address bar in sync with what the user is looking at, so copying
 * the URL always shares the current project/unit. Preserves other params (ej: ?admin).
 */
export function writeDeepLink({ projectSlug, unitCode }: DeepLink): void {
  const params = new URLSearchParams(window.location.search);
  if (projectSlug) params.set(PROJECT_PARAM, projectSlug);
  else params.delete(PROJECT_PARAM);
  if (unitCode) params.set(UNIT_PARAM, unitCode);
  else params.delete(UNIT_PARAM);

  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  window.history.replaceState(null, '', url);
}

/** Public link to a unit (never includes internal params like ?admin) */
export function buildUnitUrl(projectSlug: string, unitCode: string): string {
  const params = new URLSearchParams({ [PROJECT_PARAM]: projectSlug, [UNIT_PARAM]: unitCode });
  return `${window.location.origin}${window.location.pathname}?${params}`;
}

export function buildWhatsAppUrl(phone: string, text: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

function unitLabel(unit: Unit): string {
  return unit.unitType === 'LOT' ? `el Lote ${unit.code}` : `la unidad ${unit.code}`;
}

/** Pre-filled inquiry message for the sales WhatsApp */
export function buildInquiryMessage(project: Project, unit: Unit): string {
  const link = buildUnitUrl(project.slug, unit.code);
  const price = formatCurrency(unit.price, unit.currency);

  if (unit.status === 'RESERVED') {
    return `Hola! Vi que ${unitLabel(unit)} de ${project.name} está reservada. ` +
      `¿Me avisan si se libera o si hay opciones similares?\n${link}`;
  }
  return `Hola! Me interesa ${unitLabel(unit)} de ${project.name} ` +
    `(${unit.surfaceTotalM2} m², ${price}). ¿Me pasan más información?\n${link}`;
}

/** Inquiry that carries the financing plan the buyer simulated */
export function buildFinancingMessage(
  project: Project,
  unit: Unit,
  plan: { downPaymentPct: number; months: number; downPayment: number; installment: number },
): string {
  const link = buildUnitUrl(project.slug, unit.code);
  const fmt = (v: number) => formatCurrency(v, unit.currency);
  return `Hola! Me interesa ${unitLabel(unit)} de ${project.name} (${fmt(unit.price)}) financiado: ` +
    `anticipo del ${plan.downPaymentPct}% (${fmt(plan.downPayment)}) y ${plan.months} cuotas de ` +
    `${fmt(plan.installment)}. ¿Me confirman las condiciones?\n${link}`;
}

/** Message the buyer can send right after reserving, so sales follows up */
export function buildReservationMessage(project: Project, unit: Unit, buyerName: string): string {
  const link = buildUnitUrl(project.slug, unit.code);
  return `Hola! Soy ${buyerName}, acabo de reservar ${unitLabel(unit)} de ${project.name} ` +
    `desde la web. Quedo atento/a para coordinar los próximos pasos.\n${link}`;
}
