import React, { useState, useEffect } from 'react';
import { AlertTriangle, Mic, MicOff, Volume2, CheckCircle2 } from 'lucide-react';
import type { FormFieldDefinition, Language } from '../types';
import { speechService } from '../services/speechRecognition';
import { voiceAssistant } from '../services/speechSynthesis';

interface MissingFieldsBannerProps {
  missingFields: string[];
  fields: FormFieldDefinition[];
  currentLanguage: Language;
  onFieldFilled: (fieldId: string, value: string) => void;
  filledCount: number;
}

export const MissingFieldsBanner: React.FC<MissingFieldsBannerProps> = ({
  missingFields,
  fields,
  currentLanguage,
  onFieldFilled,
  filledCount,
}) => {
  const [isRecordingField, setIsRecordingField] = useState(false);
  const [activeRecordingFieldId, setActiveRecordingFieldId] = useState<string | null>(null);
  const [bannerAdvisory, setBannerAdvisory] = useState<string | null>(null);

  // Stop recording if the language changes
  useEffect(() => {
    if (isRecordingField) {
      speechService.stop();
      setIsRecordingField(false);
      setActiveRecordingFieldId(null);
    }
    setBannerAdvisory(null);
  }, [currentLanguage]);

  if (missingFields.length === 0) {
    return (
      <div className="p-4 bg-[var(--surface-card)] rounded-2xl border border-[#059669]/40 flex items-center justify-between text-[var(--state-success)] text-xs sm:text-sm shadow-xs transition-colors duration-200">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[var(--state-success)] shrink-0" />
          <span className="font-semibold text-[var(--text-primary)]">
            All required fields are completed! You can review details below and confirm submission.
          </span>
        </div>
      </div>
    );
  }

  const firstMissingDef = fields.find((f) => f.id === missingFields[0]);
  if (!firstMissingDef) return null;

  const handleSpeakPrompt = () => {
    const prompt = firstMissingDef.voicePrompt[currentLanguage];
    voiceAssistant.speak(prompt, currentLanguage);
  };

  const handleRecordJustThisField = () => {
    if (isRecordingField) {
      speechService.stop();
      setIsRecordingField(false);
      setActiveRecordingFieldId(null);
      return;
    }

    setIsRecordingField(true);
    setActiveRecordingFieldId(firstMissingDef.id);
    setBannerAdvisory(null);
    speechService.setLanguage(currentLanguage);

    speechService.start({
      onStart: () => setIsRecordingField(true),
      onResult: (text, _isFinal, advisory) => {
        if (text && text.trim()) {
          onFieldFilled(firstMissingDef.id, text.trim());
          if (advisory) {
            setBannerAdvisory(advisory.message);
          } else {
            setBannerAdvisory(null);
          }
        }
      },
      onEnd: () => {
        setIsRecordingField(false);
        setActiveRecordingFieldId(null);
      },
      onError: (errMsg) => {
        setIsRecordingField(false);
        setActiveRecordingFieldId(null);
        setBannerAdvisory(errMsg);
      },
    });
  };

  const label = firstMissingDef.label[currentLanguage] || firstMissingDef.label['en-IN'];

  return (
    <div className="p-5 bg-[var(--surface-card)] rounded-3xl border border-[var(--state-warning)]/30 shadow-sm transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#B45309]/15 text-[var(--state-warning)] shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-[var(--text-primary)] text-sm sm:text-base">
                We found {filledCount} pieces of information. Next: {label} is missing
              </h4>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-[#B45309]/15 text-[var(--state-warning)] border border-[#B45309]/30 rounded-full">
                {missingFields.length} remaining
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              "{firstMissingDef.voicePrompt[currentLanguage]}"
            </p>
          </div>
        </div>

        {/* Quick Voice Prompt & Mini-Mic for this specific field */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={handleSpeakPrompt}
            title="Read question aloud"
            className="p-2.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="hidden sm:inline">Ask Aloud</span>
          </button>

          <button
            onClick={handleRecordJustThisField}
            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
              isRecordingField && activeRecordingFieldId === firstMissingDef.id
                ? 'bg-[var(--state-error)] text-white animate-pulse'
                : 'bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white'
            }`}
          >
            {isRecordingField ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Speak {label}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {bannerAdvisory && (
        <div className="mt-3 p-2.5 bg-[var(--surface-secondary)] border border-[var(--state-warning)]/30 rounded-xl flex items-start gap-2 text-xs text-[var(--state-warning)]">
          <AlertTriangle className="w-4 h-4 text-[var(--state-warning)] shrink-0 mt-0.5" />
          <p className="leading-snug">{bannerAdvisory}</p>
        </div>
      )}
    </div>
  );
};
