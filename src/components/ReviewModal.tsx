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
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-violet-900 text-white p-6 sm:p-7 relative">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            aria-label="Close review dialog"
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full bg-indigo-500/30 text-indigo-100 text-xs font-bold uppercase tracking-wider border border-indigo-400/30">
              Official Application Draft
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-300 font-bold bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Explicit Citizen Verification
            </span>
          </div>

          <h3 id="review-modal-title" className="text-2xl font-black tracking-tight">
            Review Your Application Details
          </h3>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1">
            {formDef.title[currentLanguage] || formDef.title['en-IN']}
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto">
          {hasErrors && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
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
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Verified Citizen Credentials
              </span>
              <button
                onClick={handleDownloadDraftJson}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Draft</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                <User className="w-4 h-4 text-indigo-600 shrink-0 mt-1" />
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Full Name</span>
                  <span className="font-bold text-slate-900">{getFieldValue('full_name')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                <Calendar className="w-4 h-4 text-indigo-600 shrink-0 mt-1" />
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Age</span>
                  <span className="font-bold text-slate-900">
                    {getFieldValue('age')} {getFieldValue('age') !== '—' ? 'years' : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                <Phone className="w-4 h-4 text-indigo-600 shrink-0 mt-1" />
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Phone Number</span>
                  <span className="font-bold text-slate-900">{getFieldValue('phone')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0 mt-1" />
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Email Address</span>
                  <span className="font-bold text-slate-900">{getFieldValue('email')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-1" />
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">City & State</span>
                  <span className="font-bold text-slate-900">
                    {getFieldValue('city')}, {getFieldValue('state')}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                <Languages className="w-4 h-4 text-indigo-600 shrink-0 mt-1" />
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Preferred Language</span>
                  <span className="font-bold text-slate-900">{getFieldValue('preferred_language')}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase mb-1">Full Street Address</span>
              <p className="font-medium text-slate-800 text-sm">
                {getFieldValue('address')}
              </p>
            </div>

            {getFieldValue('additional_details') !== '—' && (
              <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Request / Additional Details</span>
                </div>
                <p className="font-medium text-slate-800 text-sm">
                  {getFieldValue('additional_details')}
                </p>
              </div>
            )}
          </div>

          {/* Explicit User Confirmation Card */}
          <div className="p-4 bg-gradient-to-r from-indigo-50/80 to-purple-50/60 rounded-2xl border border-indigo-200 flex items-start gap-3">
            <input
              id="confirm-consent"
              type="checkbox"
              checked={hasConfirmedCheckbox}
              onChange={(e) => {
                soundFx.playClick();
                setHasConfirmedCheckbox(e.target.checked);
              }}
              className="mt-1 h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="confirm-consent" className="text-xs text-slate-700 cursor-pointer select-none">
              <strong className="text-slate-900 block font-bold mb-0.5">
                I verify that the above information is accurate and give consent for digital submission.
              </strong>
              Data is stored securely in Supabase PostgreSQL under strict Row Level Security. No one else can query your personal information.
            </label>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
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
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Storing in Supabase PostgreSQL...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
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
