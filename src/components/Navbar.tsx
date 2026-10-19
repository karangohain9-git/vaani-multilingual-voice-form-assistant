import React from 'react';
import { Volume2, VolumeX, Sparkles, HelpCircle, Settings, Contrast, Type } from 'lucide-react';
import type { Language } from '../types';
import { SUPPORTED_LANGUAGES } from '../types';
import { soundFx } from '../services/soundFx';

interface NavbarProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  voiceGuidanceEnabled: boolean;
  onToggleVoiceGuidance: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
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
  highContrast,
  onToggleHighContrast,
  fontSizeMode,
  onCycleFontSize,
  onOpenHowItWorks,
  onOpenSettings,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Tagline */}
          <button
            onClick={() => {
              soundFx.playClick();
              onNavigateHome();
            }}
            className="flex items-center space-x-3 text-left focus:outline-hidden focus:ring-2 focus:ring-indigo-500 rounded-xl p-1.5 group cursor-pointer"
            aria-label="Vaani Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 flex items-center justify-center shadow-md shadow-indigo-300/40 group-hover:scale-105 transition-all">
              <span className="text-white text-xl font-black tracking-tight">वाणी</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Vaani
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70 flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-indigo-600" /> AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
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
                className="text-xs sm:text-sm font-bold bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer transition-colors shadow-2xs"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
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
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {voiceGuidanceEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <span className="hidden md:inline">Voice ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-400" />
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
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
            >
              <Type className="w-4 h-4 text-slate-600" />
              <span className="uppercase text-[11px] font-black">
                {fontSizeMode === 'normal' ? '1x' : fontSizeMode === 'large' ? '1.2x' : '1.4x'}
              </span>
            </button>

            {/* High Contrast Toggle Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                onToggleHighContrast();
              }}
              title={highContrast ? 'Disable High Contrast' : 'Enable High Contrast'}
              aria-label="Toggle High Contrast Mode"
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                highContrast
                  ? 'bg-black text-white border-black ring-2 ring-amber-400'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Contrast className="w-4 h-4" />
            </button>

            {/* How It Works Modal Trigger */}
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenHowItWorks();
              }}
              title="How Vaani Works"
              aria-label="How Vaani Works"
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold hidden sm:flex cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-indigo-600" />
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
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
