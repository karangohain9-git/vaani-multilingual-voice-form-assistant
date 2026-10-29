import React from 'react';
import { ShieldCheck, Database } from 'lucide-react';

interface FooterProps {
  onOpenHowItWorks: () => void;
  onOpenSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenHowItWorks,
  onOpenSettings,
}) => {
  return (
    <footer className="bg-[var(--surface-card)] text-[var(--text-secondary)] border-t border-[var(--border-subtle)] mt-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold">
                वाणी
              </div>
              <span className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
                Vaani
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md leading-relaxed">
              AI-Powered Multilingual Digital Form Assistant. Designed to make government, scholarship, and citizen services universally accessible for non-English speakers and first-time computer users.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Navigation & Guide
            </h5>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>
                <button
                  onClick={onOpenHowItWorks}
                  className="hover:text-[var(--accent-primary)] transition-colors cursor-pointer text-left"
                >
                  Architecture & Flow
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSettings}
                  className="hover:text-[var(--accent-primary)] transition-colors cursor-pointer text-left"
                >
                  System Diagnostics & Supabase Setup
                </button>
              </li>
              <li>
                <span className="text-[var(--text-muted)]">Web Speech API (en-IN, hi-IN)</span>
              </li>
              <li>
                <span className="text-[var(--text-muted)]">Google Gemini 1.5 Flash</span>
              </li>
            </ul>
          </div>

          {/* Privacy & Trust */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Security & Ethics
            </h5>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[var(--state-success)]" />
                <span>Explicit Review Before Submit</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>PostgreSQL Row Level Security</span>
              </li>
              <li className="text-[11px] text-[var(--text-muted)]">
                No raw audio recordings stored. No private API keys exposed to browsers.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--border-subtle)] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)]">
          <p>© 2026 Vaani — AI-Powered Multilingual Digital Form Assistant.</p>
        </div>
      </div>
    </footer>
  );
};
