import React from 'react';
import { Volume2, VolumeX, Sparkles, HelpCircle, Settings, Sun, Moon, Type } from 'lucide-react';
import type { Language } from '../types';
import { SUPPORTED_LANGUAGES } from '../types';
import { soundFx } from '../services/soundFx';

interface NavbarProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  voiceGuidanceEnabled: boolean;
  onToggleVoiceGuidance: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  fontSizeMode: 'normal' | 'large' | 'xlarge';
  onCycleFontSize: () => void;
  onOpenHowItWorks: () => void;
  onOpenSettings: () => void;
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  voiceGuidanceEnabled,
  onToggleVoiceGuidance,
  darkMode,
  onToggleDarkMode,
  fontSizeMode,
  onCycleFontSize,
  onOpenHowItWorks,
  onOpenSettings,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-header)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Tagline */}
          <button
            onClick={() => {
              soundFx.playClick();
              onNavigateHome();
            }}
            className="flex items-center space-x-3 text-left focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-primary)] rounded-xl p-1.5 group cursor-pointer"
            aria-label="Vaani Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] via-indigo-600 to-violet-800 flex items-center justify-center shadow-md shadow-violet-900/40 group-hover:scale-105 transition-all">
              <span className="text-white text-xl font-black tracking-tight">वाणी</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                  Vaani
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[var(--accent-primary)] border border-[#8B5CF6]/30 flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-[var(--accent-primary)]" /> AI Powered
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] hidden sm:block font-medium">
                Digital Form Automation for Everyone
              </p>
            </div>
          </button>

          {/* Controls: Language, Accessibility, Audio, Help, Settings */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Selector */}
            <div className="relative">
              <select
                aria-label="Select Application Language"
                value={currentLanguage}
                onChange={(e) => {
                  soundFx.playClick();
                  onLanguageChange(e.target.value as Language);
                }}
                className="text-xs sm:text-sm font-bold bg-[var(--surface-secondary)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 pr-8 focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-hidden cursor-pointer transition-colors shadow-2xs"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-[var(--surface-card)] text-[var(--text-primary)]">
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Voice Guidance Toggle Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                onToggleVoiceGuidance();
              }}
              title={
                voiceGuidanceEnabled
                  ? 'Voice guidance is ON (Click to mute speech assistance)'
                  : 'Voice guidance is MUTED (Click to enable speech assistance)'
              }
              aria-label={
                voiceGuidanceEnabled
                  ? 'Mute Voice Assistance'
                  : 'Enable Spoken Voice Assistance'
              }
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                voiceGuidanceEnabled
                  ? 'bg-[#8B5CF6]/15 text-[var(--accent-primary)] border-[#8B5CF6]/30 shadow-2xs'
                  : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--border-subtle)]'
              }`}
            >
              {voiceGuidanceEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-[var(--accent-primary)] animate-pulse" />
                  <span className="hidden md:inline">Voice ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span className="hidden md:inline">Muted</span>
                </>
              )}
            </button>

            {/* Font Size Accessibility Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                onCycleFontSize();
              }}
              title={`Text Size: ${fontSizeMode} (Click to toggle normal/large/xlarge)`}
              aria-label="Cycle Font Size"
              className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
            >
              <Type className="w-4 h-4 text-[var(--text-secondary)]" />
              <span className="uppercase text-[11px] font-black">
                {fontSizeMode === 'normal' ? '1x' : fontSizeMode === 'large' ? '1.2x' : '1.4x'}
              </span>
            </button>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                onToggleDarkMode();
              }}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                darkMode
                  ? 'bg-[var(--surface-secondary)] text-[#FBBF24] border-[var(--border-subtle)] hover:bg-[var(--border-subtle)] shadow-xs ring-1 ring-[#8B5CF6]/30'
                  : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--border-subtle)]'
              }`}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-[#FBBF24]" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
              )}
            </button>

            {/* How It Works Modal Trigger */}
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenHowItWorks();
              }}
              title="How Vaani Works"
              aria-label="How Vaani Works"
              className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] transition-colors flex items-center gap-1.5 text-xs font-bold hidden sm:flex cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Guide</span>
            </button>

            {/* Settings & Backend Status Modal Trigger */}
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenSettings();
              }}
              title="System Configuration & Diagnostics"
              aria-label="System Settings & Diagnostics"
              className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
