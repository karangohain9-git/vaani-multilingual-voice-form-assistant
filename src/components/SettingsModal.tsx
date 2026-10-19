import React, { useState } from 'react';
import {
  X,
  Settings,
  Key,
  Database,
  Mic,
  Volume2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Code,
  Check,
} from 'lucide-react';
import { SpeechRecognitionService } from '../services/speechRecognition';
import { voiceAssistant } from '../services/speechSynthesis';
import { testSupabaseConnection } from '../services/supabaseClient';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userApiKey: string;
  onSaveUserApiKey: (key: string) => void;
  voiceGuidanceEnabled: boolean;
  onToggleVoiceGuidance: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userApiKey,
  onSaveUserApiKey,
  voiceGuidanceEnabled,
  onToggleVoiceGuidance,
}) => {
  const [tempKey, setTempKey] = useState(userApiKey);
  const [keySaved, setKeySaved] = useState(false);
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<string | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  if (!isOpen) return null;

  const speechStatus = SpeechRecognitionService.checkSupport();
  const availableVoices = voiceAssistant.getAvailableVoices();

  const handleSaveKey = () => {
    onSaveUserApiKey(tempKey.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    const res = await testSupabaseConnection();
    setSupabaseTestStatus(res.message);
    setIsTestingSupabase(false);
  };

  const handleTestVoiceHindi = () => {
    voiceAssistant.speak('नमस्ते, वाणी में आपका स्वागत है। आवाज परीक्षण सफल रहा।', 'hi-IN');
  };

  const handleTestVoiceEnglish = () => {
    voiceAssistant.speak('Hello, welcome to Vaani. Voice audio test is working successfully.', 'en-IN');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              System Diagnostics & Integrations
            </span>
          </div>
          <h3 id="settings-dialog-title" className="text-2xl font-black">
            Settings & Connectivity
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Configure Google Gemini AI, Supabase database, and audio diagnostics.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto text-sm text-slate-700">
          {/* Section 1: Google Gemini LLM API */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-base">
                  Google Gemini AI API Key
                </h4>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                LLM Extraction
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Extraction runs via server-side endpoint. You can set <code className="bg-white px-1.5 py-0.5 rounded border text-indigo-700">GEMINI_API_KEY</code> in <code className="bg-white px-1.5 py-0.5 rounded border">.env</code>, or provide a live testing key directly here:
            </p>

            <div className="flex gap-2">
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white font-mono"
              />
              <button
                onClick={handleSaveKey}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {keySaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Apply Key</span>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              If no key is configured, Vaani falls back honestly to local pattern recognition without faking AI.
            </p>
          </div>

          {/* Section 2: Supabase PostgreSQL Database */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-base">
                  Supabase PostgreSQL & RLS
                </h4>
              </div>
              <button
                onClick={handleTestSupabase}
                disabled={isTestingSupabase}
                className="text-xs font-semibold px-3 py-1 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              >
                {isTestingSupabase ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Uses <code className="bg-white px-1.5 py-0.5 rounded border">form_submissions</code> table with Row Level Security.
            </p>

            {supabaseTestStatus && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800">
                {supabaseTestStatus}
              </div>
            )}

            <button
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{showSqlGuide ? 'Hide SQL Migration Instructions' : 'View SQL Migration Schema'}</span>
            </button>

            {showSqlGuide && (
              <div className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-48 border border-slate-800">
                <code>
{`-- Run in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id TEXT NOT NULL UNIQUE,
  form_type TEXT NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  address TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'Hindi',
  additional_details TEXT,
  fields_payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert" ON public.form_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Deny public select" ON public.form_submissions FOR SELECT TO anon USING (false);`}
                </code>
              </div>
            )}
          </div>

          {/* Section 3: Speech Recognition Diagnostics */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-indigo-600" />
              <h4 className="font-bold text-slate-900 text-base">
                Speech Recognition Engine
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span>Web Speech API:</span>
                {speechStatus.isSupported ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Supported
                  </span>
                ) : (
                  <span className="text-rose-700 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Not Supported
                  </span>
                )}
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span>Engine Type:</span>
                <span className="font-semibold text-slate-800">{speechStatus.engineName}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Voice Synthesis Diagnostics */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-base">
                  Voice Guidance & TTS Audio
                </h4>
              </div>
              <button
                onClick={onToggleVoiceGuidance}
                className={`text-xs font-bold px-3 py-1 rounded-xl border transition-colors ${
                  voiceGuidanceEnabled
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-300'
                }`}
              >
                {voiceGuidanceEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Found {availableVoices.length} voice synthesizers installed in your browser.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleTestVoiceHindi}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Test Hindi Voice (हिन्दी)
              </button>
              <button
                onClick={handleTestVoiceEnglish}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Test Indian English Voice
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
