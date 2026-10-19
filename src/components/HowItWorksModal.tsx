import React from 'react';
import { X, Mic, Cpu, CheckCircle2, Shield, Database, Sparkles } from 'lucide-react';
import type { Language } from '../types';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-violet-800 text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Architecture & User Guide
            </span>
          </div>
          <h3 id="guide-title" className="text-2xl font-black">
            How Vaani Works
          </h3>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1">
            Democratizing digital form access through voice AI and accessibility engineering.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto text-sm text-slate-700 leading-relaxed">
          {/* Step 1 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">
                1. Multilingual Speech Recognition (Web Speech API)
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                When you tap the microphone, the browser's speech recognition engine captures your audio stream. It converts spoken words in Hindi (<code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">hi-IN</code>), English (<code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">en-IN</code>), or Assamese into an editable transcript.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">
                2. Server-Side Google Gemini LLM Extraction
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                The transcript is sent to a secure backend endpoint / Supabase Edge Function. Google Gemini 1.5 Flash parses colloquial phrases, extracts target fields, standardizes phone numbers into 10 digits, detects applicant age, and flags uncertain or missing fields in structured JSON.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">
                3. Smart Field Mapping & Voice-Guided Missing Fields
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Extracted fields populate the form visibly with source tags (<span className="text-indigo-700 font-bold">AI-filled</span>, <span className="text-amber-700 font-bold">Needs review</span>). If any required field is absent, Vaani speaks to you via SpeechSynthesis and lets you speak just that single missing piece without starting over.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">
                4. Explicit Confirmation & Supabase PostgreSQL Storage
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                No personal data is saved without your explicit review and consent. Once confirmed, data is stored in PostgreSQL protected with strict Row Level Security (RLS) to guarantee citizen privacy. A verified reference number is generated instantly.
              </p>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
            <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600">
              <strong className="text-slate-900 font-semibold block mb-0.5">
                Privacy & Data Minimization:
              </strong>
              Microphone access is requested only when you tap the button. No audio is recorded continuously or stored as raw sound recordings.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
