export interface FinancingResult {
  downPayment: number;
  financed: number;
  installment: number;
  totalPaid: number;
  interest: number;
}

/**
 * Anticipo + cuotas mensuales fijas (sistema francés).
 * Con tasa 0 las cuotas son simplemente el saldo dividido en partes iguales.
 */
export function computeFinancing(
  price: number,
  downPaymentPct: number,
  months: number,
  annualRatePct: number,
): FinancingResult {
  const downPayment = Math.round(price * downPaymentPct / 100);
  const financed = price - downPayment;
  const monthlyRate = annualRatePct / 100 / 12;

  const installment = monthlyRate === 0
    ? financed / months
    : financed * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));

  const totalPaid = downPayment + installment * months;
  return {
    downPayment,
    financed,
    installment,
    totalPaid,
    interest: totalPaid - price,
  };
}
