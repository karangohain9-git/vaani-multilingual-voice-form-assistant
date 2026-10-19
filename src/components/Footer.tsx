import React from 'react';
import { ShieldCheck, Heart, Sparkles, Database } from 'lucide-react';

interface FooterProps {
  onOpenHowItWorks: () => void;
  onOpenSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenHowItWorks,
  onOpenSettings,
}) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                वाणी
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Vaani
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              AI-Powered Multilingual Digital Form Assistant. Designed to make government, scholarship, and citizen services universally accessible for non-English speakers and first-time computer users.
            </p>
            <div className="flex items-center gap-2 text-xs text-indigo-400 pt-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Built for national hackathon demonstration</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">
              Navigation & Guide
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={onOpenHowItWorks}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Architecture & Flow
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSettings}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  System Diagnostics & Supabase Setup
                </button>
              </li>
              <li>
                <span className="text-slate-500">Web Speech API (en-IN, hi-IN)</span>
              </li>
              <li>
                <span className="text-slate-500">Google Gemini 1.5 Flash</span>
              </li>
            </ul>
          </div>

          {/* Privacy & Trust */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">
              Security & Ethics
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Explicit Review Before Submit</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>PostgreSQL Row Level Security</span>
              </li>
              <li className="text-[11px] text-slate-500">
                No raw audio recordings stored. No private API keys exposed to browsers.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 Vaani — AI-Powered Multilingual Digital Form Assistant.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Digital Inclusion in India.
          </p>
        </div>
      </div>
    </footer>
  );
};
