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
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden relative">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-2xl m-3 pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-2xl m-3 pointer-events-none" />

        {/* Success Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-7 sm:p-9 text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-4 shadow-inner ring-4 ring-white/10">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          <span className="text-xs font-bold tracking-widest uppercase text-emerald-100 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            Official Submission Receipt
          </span>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-3">
            Application Submitted Successfully!
          </h2>
          <p className="mt-1 text-emerald-100 text-xs sm:text-sm">
            {formDef.title[currentLanguage] || formDef.title['en-IN']}
          </p>
        </div>

        {/* Receipt Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Reference ID Banner */}
          <div className="p-5 bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-2xl border border-slate-200 text-center relative shadow-xs">
            <span className="text-xs uppercase font-extrabold text-slate-500 tracking-wider block">
              Application Reference Number (संदर्भ संख्या)
            </span>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 tracking-wider">
                {submission.reference_id}
              </span>
              <button
                onClick={handleCopyRef}
                title="Copy reference number"
                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shadow-2xs"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Keep this reference number safe for status verification and official inquiries.
            </p>
          </div>

          {/* Database Storage Verification Badge */}
          <div className="p-4 rounded-xl border flex items-center justify-between text-xs font-semibold bg-indigo-50/70 border-indigo-200 text-indigo-900 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                {isLocalMock
                  ? 'Application recorded in session store (Supabase credentials unconfigured)'
                  : 'Stored securely in Supabase PostgreSQL (Production Database)'}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black border border-emerald-300">
              Verified
            </span>
          </div>

          {/* Recorded Citizen Information Table */}
          <div className="space-y-3.5 border-t border-b border-slate-100 py-5 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> Applicant Name:
              </span>
              <span className="font-bold text-slate-900">{submission.full_name}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" /> Mobile Number:
              </span>
              <span className="font-bold text-slate-900">{submission.phone}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" /> City & State:
              </span>
              <span className="font-bold text-slate-900">
                {submission.city}, {submission.state}
              </span>
            </div>

            {submission.address && (
              <div className="flex justify-between items-start">
                <span className="text-slate-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" /> Street Address:
                </span>
                <span className="font-semibold text-slate-800 text-right max-w-xs">{submission.address}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" /> Submission Timestamp:
              </span>
              <span className="font-semibold text-slate-800">{formattedDate}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-2">
                <FileBadge className="w-4 h-4 text-slate-400" /> Application Source:
              </span>
              <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-xs">
                {submission.source === 'web_voice' ? 'Multilingual Speech Recognition' : 'Digital Web Entry'}
              </span>
            </div>
          </div>

          {/* Actions: Download, Print, and New Application */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleDownloadReceiptText}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Download Receipt (.txt)</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Official Receipt</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onNewForm();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
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
