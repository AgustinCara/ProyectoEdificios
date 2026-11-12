import React, { useEffect, useRef, useState } from 'react';
import type { Project, Unit, ReservationContact } from '../../types/realEstate';
import { CalendarCheck, CheckCircle2, MessageCircle, X } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { buildReservationMessage, buildWhatsAppUrl } from '../../utils/links';

interface ReservationModalProps {
  project: Project;
  unit: Unit;
  onClose: () => void;
  /** Returns an error message if the reservation could not be made */
  onConfirm: (contact: ReservationContact) => string | null;
}

type FieldErrors = Partial<Record<keyof ReservationContact, string>>;

const EMPTY_FORM: ReservationContact = { name: '', email: '', phone: '', message: '' };

function validate(form: ReservationContact): FieldErrors {
  const errors: FieldErrors = {};
  if (form.name.trim().length < 2) errors.name = 'Ingresá tu nombre.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Ingresá un email válido.';
  if (form.phone.replace(/\D/g, '').length < 8) errors.phone = 'Ingresá un teléfono válido.';
  return errors;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  project,
  unit,
  onClose,
  onConfirm,
}) => {
  const [form, setForm] = useState<ReservationContact>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reservedBy, setReservedBy] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Escape closes only the modal: listen in the capture phase and stop the key
  // before it reaches the unit drawer underneath. Tab stays inside the modal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  // Give focus back to whatever opened the modal (the "Reservar" button). Read it
  // during the first render: by the time effects run, autoFocus moved it to the form.
  const [opener] = useState(() => document.activeElement as HTMLElement | null);
  useEffect(() => () => opener?.focus(), [opener]);

  const setField = (key: keyof ReservationContact) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [key]: e.target.value }));
      setErrors(prev => ({ ...prev, [key]: undefined }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    const contact: ReservationContact = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      message: form.message?.trim() || undefined,
    };
    const error = onConfirm(contact);
    if (error) {
      setSubmitError(error);
      return;
    }
    setReservedBy(contact.name);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-title"
        onClick={e => e.stopPropagation()}
      >
        <button className="modal__close" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>

        {reservedBy ? (
          /* ── Success ── */
          <div className="modal__success">
            <CheckCircle2 size={48} className="modal__success-icon" />
            <h2 id="reservation-title" className="modal__title">¡Unidad reservada!</h2>
            <p className="modal__text">
              Reservaste <strong>{unit.code}</strong> en {project.name}. Un asesor se va a
              comunicar con vos para coordinar la seña y los próximos pasos.
            </p>
            <div className="modal__actions">
              {project.contactWhatsApp && (
                <a
                  className="drawer__btn drawer__btn--whatsapp"
                  href={buildWhatsAppUrl(
                    project.contactWhatsApp,
                    buildReservationMessage(project, unit, reservedBy)
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={16} />
                  Avisar por WhatsApp
                </a>
              )}
              <button className="drawer__btn drawer__btn--secondary" onClick={onClose}>
                Listo
              </button>
            </div>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={handleSubmit} noValidate>
            <h2 id="reservation-title" className="modal__title">Reservar {unit.code}</h2>
            <p className="modal__subtitle">
              {project.name} · {formatCurrency(unit.price, unit.currency)}
            </p>

            <label className="modal__field">
              <span>Nombre y apellido</span>
              <input
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={setField('name')}
                aria-invalid={!!errors.name}
                autoFocus
              />
              {errors.name && <small className="modal__error">{errors.name}</small>}
            </label>

            <div className="modal__row">
              <label className="modal__field">
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={setField('email')}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <small className="modal__error">{errors.email}</small>}
              </label>
              <label className="modal__field">
                <span>Teléfono</span>
                <input
                  type="tel"
                  autoComplete="tel"
                  placeholder="11 1234-5678"
                  value={form.phone}
                  onChange={setField('phone')}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && <small className="modal__error">{errors.phone}</small>}
              </label>
            </div>

            <label className="modal__field">
              <span>Mensaje <em>(opcional)</em></span>
              <textarea
                rows={3}
                placeholder="Horario de contacto, forma de pago, consultas…"
                value={form.message}
                onChange={setField('message')}
              />
            </label>

            {submitError && <div className="modal__alert">{submitError}</div>}

            <div className="modal__actions">
              <button type="button" className="drawer__btn drawer__btn--secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="drawer__btn drawer__btn--primary">
                <CalendarCheck size={16} />
                Confirmar reserva
              </button>
            </div>
            <p className="modal__fine-print">
              La reserva queda sujeta a confirmación del asesor y al pago de la seña.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
