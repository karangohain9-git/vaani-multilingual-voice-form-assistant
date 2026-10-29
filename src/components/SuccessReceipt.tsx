import React, { useEffect } from 'react';
import {
  CheckCircle,
  Copy,
  Printer,
  RotateCcw,
  Database,
  Calendar,
  User,
  Phone,
  MapPin,
  Check,
  Download,
  FileBadge,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { FormSubmissionRecord, FormTypeDefinition, Language } from '../types';
import { soundFx } from '../services/soundFx';

interface SuccessReceiptProps {
  submission: FormSubmissionRecord;
  formDef: FormTypeDefinition;
  currentLanguage: Language;
  onNewForm: () => void;
  isLocalMock?: boolean;
}

export const SuccessReceipt: React.FC<SuccessReceiptProps> = ({
  submission,
  formDef,
  currentLanguage,
  onNewForm,
  isLocalMock = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    soundFx.playAiSuccess();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#4338ca', '#7c3aed', '#10b981', '#f59e0b', '#06b6d4'],
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const handleCopyRef = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(submission.reference_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    soundFx.playClick();
    window.print();
  };

  const handleDownloadReceiptText = () => {
    soundFx.playClick();
    const content = `=====================================================
VAANI DIGITAL APPLICATION RECEIPT (वाणी डिजिटल रसीद)
=====================================================
Application Reference : ${submission.reference_id}
Scheme / Form Type    : ${formDef.title['en-IN']}
Applicant Name        : ${submission.full_name}
Age                   : ${submission.age}
Mobile Phone          : ${submission.phone}
Email                 : ${submission.email || 'N/A'}
Residence             : ${submission.city}, ${submission.state}
Street Address        : ${submission.address || 'N/A'}
Preferred Language    : ${submission.preferred_language}
Submission Timestamp  : ${new Date(submission.created_at).toLocaleString('en-IN')}
Database Storage      : ${isLocalMock ? 'Session Verified' : 'Supabase PostgreSQL (RLS Protected)'}
=====================================================
This is a computer-generated digital submission acknowledgement.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt-${submission.reference_id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formattedDate = new Date(submission.created_at).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  return (
    <div className="max-w-2xl mx-auto my-8">
      {/* Official Certificate Style Card */}
      <div className="bg-[var(--surface-card)] rounded-3xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden relative">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--state-success)] rounded-tl-2xl m-3 pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--state-success)] rounded-tr-2xl m-3 pointer-events-none" />

        {/* Success Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-7 sm:p-9 text-center relative border-b border-[var(--border-subtle)]">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-4 shadow-inner ring-4 ring-white/20">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          <span className="text-xs font-bold tracking-widest uppercase text-white bg-white/20 px-3 py-1 rounded-full border border-white/30">
            Official Submission Receipt
          </span>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-3 text-white">
            Application Submitted Successfully!
          </h2>
          <p className="mt-1 text-emerald-100 text-xs sm:text-sm">
            {formDef.title[currentLanguage] || formDef.title['en-IN']}
          </p>
        </div>

        {/* Receipt Body */}
        <div className="p-6 sm:p-8 space-y-6 text-[var(--text-primary)]">
          {/* Reference ID Banner */}
          <div className="p-5 bg-[var(--surface-secondary)] rounded-2xl border border-[var(--border-subtle)] text-center relative shadow-xs">
            <span className="text-xs uppercase font-extrabold text-[var(--text-secondary)] tracking-wider block">
              Application Reference Number (संदर्भ संख्या)
            </span>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-wider">
                {submission.reference_id}
              </span>
              <button
                onClick={handleCopyRef}
                title="Copy reference number"
                className="p-2 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] transition-colors cursor-pointer shadow-2xs"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-[var(--state-success)]" />
                ) : (
                  <Copy className="w-4 h-4 text-[var(--text-secondary)]" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-2">
              Keep this reference number safe for status verification and official inquiries.
            </p>
          </div>

          {/* Database Storage Verification Badge */}
          <div className="p-4 rounded-xl border flex items-center justify-between text-xs font-semibold bg-[var(--surface-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-[var(--state-success)] shrink-0" />
              <span>
                {isLocalMock
                  ? 'Application recorded in session store (Supabase credentials unconfigured)'
                  : 'Stored securely in Supabase PostgreSQL (Production Database)'}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--state-success)]/15 text-[var(--state-success)] text-[10px] font-black border border-[var(--state-success)]/30">
              Verified
            </span>
          </div>

          {/* Recorded Citizen Information Table */}
          <div className="space-y-3.5 border-t border-b border-[var(--border-subtle)] py-5 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)] flex items-center gap-2">
                <User className="w-4 h-4 text-[var(--text-secondary)]" /> Applicant Name:
              </span>
              <span className="font-bold text-[var(--text-primary)]">{submission.full_name}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)] flex items-center gap-2">
                <Phone className="w-4 h-4 text-[var(--text-secondary)]" /> Mobile Number:
              </span>
              <span className="font-bold text-[var(--text-primary)]">{submission.phone}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--text-secondary)]" /> City & State:
              </span>
              <span className="font-bold text-[var(--text-primary)]">
                {submission.city}, {submission.state}
              </span>
            </div>

            {submission.address && (
              <div className="flex justify-between items-start">
                <span className="text-[var(--text-secondary)] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--text-secondary)]" /> Street Address:
                </span>
                <span className="font-semibold text-[var(--text-primary)] text-right max-w-xs">{submission.address}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--text-secondary)]" /> Submission Timestamp:
              </span>
              <span className="font-semibold text-[var(--text-primary)]">{formattedDate}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)] flex items-center gap-2">
                <FileBadge className="w-4 h-4 text-[var(--text-secondary)]" /> Application Source:
              </span>
              <span className="font-semibold text-[var(--accent-primary)] bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 px-2 py-0.5 rounded-md text-xs">
                {submission.source === 'web_voice' ? 'Multilingual Speech Recognition' : 'Digital Web Entry'}
              </span>
            </div>
          </div>

          {/* Actions: Download, Print, and New Application */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleDownloadReceiptText}
              className="flex-1 py-3 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>Download Receipt (.txt)</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 py-3 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>Print Official Receipt</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onNewForm();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-violet-900/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start New Form</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
