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
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-[var(--surface-card)] rounded-3xl max-w-2xl w-full shadow-2xl border border-[var(--border-subtle)] overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[var(--surface-card)] text-[var(--text-primary)] border-b border-[var(--border-subtle)] p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-5 right-5 p-2 rounded-full bg-[var(--surface-secondary)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] transition-colors cursor-pointer border border-[var(--border-subtle)]"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Architecture & User Guide
            </span>
          </div>
          <h3 id="guide-title" className="text-2xl font-black text-[var(--text-primary)]">
            How Vaani Works
          </h3>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1">
            Democratizing digital form access through voice AI and accessibility engineering.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto text-sm text-[var(--text-secondary)] leading-relaxed">
          {/* Step 1 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 flex items-center justify-center shrink-0 font-bold">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[var(--text-primary)] text-base">
                1. Multilingual Speech Recognition (Web Speech API)
              </h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                When you tap the microphone, the browser's speech recognition engine captures your audio stream. It converts spoken words in Hindi (<code className="bg-[var(--surface-secondary)] px-1 py-0.5 rounded text-[var(--accent-primary)] border border-[var(--border-subtle)]">hi-IN</code>), English (<code className="bg-[var(--surface-secondary)] px-1 py-0.5 rounded text-[var(--accent-primary)] border border-[var(--border-subtle)]">en-IN</code>), or Assamese into an editable transcript.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30 flex items-center justify-center shrink-0 font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[var(--text-primary)] text-base">
                2. Server-Side Google Gemini LLM Extraction
              </h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                The transcript is sent to a secure backend endpoint / Supabase Edge Function. Google Gemini 1.5 Flash parses colloquial phrases, extracts target fields, standardizes phone numbers into 10 digits, detects applicant age, and flags uncertain or missing fields in structured JSON.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30 flex items-center justify-center shrink-0 font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[var(--text-primary)] text-base">
                3. Smart Field Mapping & Voice-Guided Missing Fields
              </h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                Extracted fields populate the form visibly with source tags (<span className="text-[var(--accent-primary)] font-bold">AI-filled</span>, <span className="text-[#FBBF24] font-bold">Needs review</span>). If any required field is absent, Vaani speaks to you via SpeechSynthesis and lets you speak just that single missing piece without starting over.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30 flex items-center justify-center shrink-0 font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[var(--text-primary)] text-base">
                4. Explicit Confirmation & Supabase PostgreSQL Storage
              </h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                No personal data is saved without your explicit review and consent. Once confirmed, data is stored in PostgreSQL protected with strict Row Level Security (RLS) to guarantee citizen privacy. A verified reference number is generated instantly.
              </p>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-4 bg-[var(--surface-secondary)] rounded-2xl border border-[var(--border-subtle)] flex items-start gap-3">
            <Shield className="w-5 h-5 text-[var(--accent-primary)] shrink-0 mt-0.5" />
            <div className="text-xs text-[var(--text-secondary)]">
              <strong className="text-[var(--text-primary)] font-semibold block mb-0.5">
                Privacy & Data Minimization:
              </strong>
              Microphone access is requested only when you tap the button. No audio is recorded continuously or stored as raw sound recordings.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-[var(--surface-card)] border-t border-[var(--border-subtle)] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
