import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Languages,
  FileText,
  Download,
} from 'lucide-react';
import type { FormTypeDefinition, FieldState, Language } from '../types';
import { soundFx } from '../services/soundFx';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formDef: FormTypeDefinition;
  fieldStates: Record<string, FieldState>;
  currentLanguage: Language;
  onConfirmSubmit: () => void;
  isSubmitting: boolean;
  validationErrors: Record<string, string>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  formDef,
  fieldStates,
  currentLanguage,
  onConfirmSubmit,
  isSubmitting,
  validationErrors,
}) => {
  const [hasConfirmedCheckbox, setHasConfirmedCheckbox] = useState(false);

  if (!isOpen) return null;

  const hasErrors = Object.keys(validationErrors).length > 0;

  const getFieldValue = (id: string) => {
    const val = fieldStates[id]?.value;
    return val !== undefined && val !== null && String(val).trim() !== ''
      ? String(val)
      : '—';
  };

  const handleDownloadDraftJson = () => {
    soundFx.playClick();
    const payload: Record<string, any> = {};
    for (const [k, v] of Object.entries(fieldStates)) {
      payload[k] = v.value;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vaani-draft-${formDef.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-[var(--surface-card)] rounded-3xl max-w-2xl w-full shadow-2xl border border-[var(--border-subtle)] overflow-hidden transform transition-all my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[var(--surface-card)] border-b border-[var(--border-subtle)] text-[var(--text-primary)] p-6 sm:p-7 relative">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            aria-label="Close review dialog"
            className="absolute top-5 right-5 p-2 rounded-full bg-[var(--surface-secondary)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] transition-colors cursor-pointer border border-[var(--border-subtle)]"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[var(--accent-primary)] text-xs font-bold uppercase tracking-wider border border-[#8B5CF6]/30">
              Official Application Draft
            </span>
            <span className="flex items-center gap-1 text-xs text-[var(--state-success)] font-bold bg-[#059669]/15 px-2.5 py-0.5 rounded-full border border-[#059669]/30">
              <ShieldCheck className="w-4 h-4 text-[var(--state-success)]" /> Explicit Citizen Verification
            </span>
          </div>

          <h3 id="review-modal-title" className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Review Your Application Details
          </h3>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1">
            {formDef.title[currentLanguage] || formDef.title['en-IN']}
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto text-[var(--text-primary)]">
          {hasErrors && (
            <div className="p-4 bg-[var(--bg-error-card)] rounded-2xl border border-[var(--border-error)] text-[var(--state-error)] text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[var(--state-error)] shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Required items are missing or invalid:</strong>
                <ul className="mt-1 list-disc list-inside space-y-0.5">
                  {Object.entries(validationErrors).map(([key, err]) => (
                    <li key={key}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Form Fields Summary Grid */}
          <div className="bg-[var(--surface-secondary)] rounded-2xl p-5 border border-[var(--border-subtle)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Verified Citizen Credentials
              </span>
              <button
                onClick={handleDownloadDraftJson}
                className="text-xs font-semibold text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Draft</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2.5 bg-[var(--surface-card)] p-3 rounded-xl border border-[var(--border-subtle)] shadow-2xs">
                <User className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-1" />
                <div>
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] block uppercase">Full Name</span>
                  <span className="font-bold text-[var(--text-primary)]">{getFieldValue('full_name')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-[var(--surface-card)] p-3 rounded-xl border border-[var(--border-subtle)] shadow-2xs">
                <Calendar className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-1" />
                <div>
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] block uppercase">Age</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {getFieldValue('age')} {getFieldValue('age') !== '—' ? 'years' : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-[var(--surface-card)] p-3 rounded-xl border border-[var(--border-subtle)] shadow-2xs">
                <Phone className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-1" />
                <div>
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] block uppercase">Phone Number</span>
                  <span className="font-bold text-[var(--text-primary)]">{getFieldValue('phone')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-[var(--surface-card)] p-3 rounded-xl border border-[var(--border-subtle)] shadow-2xs">
                <Mail className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-1" />
                <div>
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] block uppercase">Email Address</span>
                  <span className="font-bold text-[var(--text-primary)]">{getFieldValue('email')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-[var(--surface-card)] p-3 rounded-xl border border-[var(--border-subtle)] shadow-2xs">
                <MapPin className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-1" />
                <div>
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] block uppercase">City & State</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {getFieldValue('city')}, {getFieldValue('state')}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-[var(--surface-card)] p-3 rounded-xl border border-[var(--border-subtle)] shadow-2xs">
                <Languages className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-1" />
                <div>
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] block uppercase">Preferred Language</span>
                  <span className="font-bold text-[var(--text-primary)]">{getFieldValue('preferred_language')}</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--surface-card)] p-3 rounded-xl border border-[var(--border-subtle)] shadow-2xs">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] block uppercase mb-1">Full Street Address</span>
              <p className="font-medium text-[var(--text-primary)] text-sm">
                {getFieldValue('address')}
              </p>
            </div>

            {getFieldValue('additional_details') !== '—' && (
              <div className="bg-[var(--surface-card)] p-3 rounded-xl border border-[var(--border-subtle)] shadow-2xs">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-secondary)] uppercase mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Request / Additional Details</span>
                </div>
                <p className="font-medium text-[var(--text-primary)] text-sm">
                  {getFieldValue('additional_details')}
                </p>
              </div>
            )}
          </div>

          {/* Explicit User Confirmation Card */}
          <div className="p-4 bg-[var(--surface-secondary)] rounded-2xl border border-[var(--border-subtle)] flex items-start gap-3">
            <input
              id="confirm-consent"
              type="checkbox"
              checked={hasConfirmedCheckbox}
              onChange={(e) => {
                soundFx.playClick();
                setHasConfirmedCheckbox(e.target.checked);
              }}
              className="mt-1 h-5 w-5 rounded-md border-[var(--border-input)] bg-[var(--surface-card)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] cursor-pointer"
            />
            <label htmlFor="confirm-consent" className="text-xs text-[var(--text-secondary)] cursor-pointer select-none">
              <strong className="text-[var(--text-primary)] block font-bold mb-0.5">
                I verify that the above information is accurate and give consent for digital submission.
              </strong>
              Data is stored securely in Supabase PostgreSQL under strict Row Level Security. No one else can query your personal information.
            </label>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 sm:p-6 bg-[var(--surface-card)] border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Go Back & Edit
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onConfirmSubmit();
            }}
            disabled={!hasConfirmedCheckbox || hasErrors || isSubmitting}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              !hasConfirmedCheckbox || hasErrors || isSubmitting
                ? 'bg-[var(--surface-secondary)] text-[var(--text-muted)] cursor-not-allowed shadow-none border border-[var(--border-subtle)]'
                : 'bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white shadow-purple-500/30 transform hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Storing in Supabase PostgreSQL...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Confirm & Submit Application</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
