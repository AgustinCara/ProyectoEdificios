import React, { useState } from 'react';
import type { FinancingPlan, Project, Unit } from '../../types/realEstate';
import { formatCurrency } from '../../utils/format';
import { computeFinancing } from '../../utils/financing';
import { buildFinancingMessage, buildWhatsAppUrl } from '../../utils/links';
import { Calculator, ChevronDown, MessageCircle } from 'lucide-react';

interface FinancingCalculatorProps {
  project: Project;
  plan: FinancingPlan;
  unit: Unit;
}

const DOWN_PAYMENT_STEP = 5;

export const FinancingCalculator: React.FC<FinancingCalculatorProps> = ({ project, plan, unit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [downPaymentPct, setDownPaymentPct] = useState(plan.minDownPaymentPct);
  const [months, setMonths] = useState(plan.installmentOptions[Math.floor(plan.installmentOptions.length / 2)]);

  const result = computeFinancing(unit.price, downPaymentPct, months, plan.annualRatePct);
  const fmt = (v: number) => formatCurrency(Math.round(v), unit.currency);

  const whatsAppUrl = project.contactWhatsApp
    ? buildWhatsAppUrl(
        project.contactWhatsApp,
        buildFinancingMessage(project, unit, {
          downPaymentPct,
          months,
          downPayment: result.downPayment,
          installment: Math.round(result.installment),
        }),
      )
    : undefined;

  const maxMonths = Math.max(...plan.installmentOptions);

  return (
    <div className="drawer__section">
      {/* Collapsed by default: the card itself is the toggle */}
      <button
        type="button"
        className={`financing-toggle ${isOpen ? 'financing-toggle--open' : ''}`}
        onClick={() => setIsOpen(open => !open)}
        aria-expanded={isOpen}
        aria-controls="financing-panel"
      >
        <Calculator size={18} className="financing-toggle__icon" />
        <span className="financing-toggle__text">
          <span className="financing-toggle__title">Simulá tu financiación</span>
          <span className="financing-toggle__hint">
            Anticipo desde {plan.minDownPaymentPct}% · hasta {maxMonths} cuotas
            {plan.annualRatePct === 0 ? ' sin interés' : ''}
          </span>
        </span>
        <ChevronDown size={18} className="financing-toggle__chevron" />
      </button>

      {isOpen && (
      <div className="financing" id="financing-panel">
        <div className="financing__field">
          <div className="financing__field-header">
            <label htmlFor="financing-down-payment">Anticipo</label>
            <span className="financing__field-value">
              {downPaymentPct}% · {fmt(result.downPayment)}
            </span>
          </div>
          <input
            id="financing-down-payment"
            className="financing__range"
            type="range"
            min={plan.minDownPaymentPct}
            max={plan.maxDownPaymentPct}
            step={DOWN_PAYMENT_STEP}
            value={downPaymentPct}
            onChange={e => setDownPaymentPct(Number(e.target.value))}
          />
        </div>

        <div className="financing__field">
          <div className="financing__field-header">
            <span>Cuotas</span>
          </div>
          <div className="financing__options" role="radiogroup" aria-label="Cantidad de cuotas">
            {plan.installmentOptions.map(n => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={n === months}
                className={`financing__option ${n === months ? 'financing__option--active' : ''}`}
                onClick={() => setMonths(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="financing__result">
          <div className="financing__result-label">{months} cuotas mensuales de</div>
          <div className="financing__result-value">{fmt(result.installment)}</div>
          <div className="financing__result-detail">
            Saldo a financiar {fmt(result.financed)}
            {plan.annualRatePct === 0
              ? ' · Sin interés'
              : ` · TNA ${plan.annualRatePct}% · Total ${fmt(result.totalPaid)}`}
          </div>
        </div>

        {whatsAppUrl && (
          <a className="financing__cta" href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={14} />
            Consultar este plan
          </a>
        )}

        <p className="financing__disclaimer">
          {plan.note ? `${plan.note}. ` : ''}Valores estimativos, sujetos a confirmación comercial.
        </p>
      </div>
      )}
    </div>
  );
};
