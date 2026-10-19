import React, { useState } from 'react';
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

  if (missingFields.length === 0) {
    return (
      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-emerald-900 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">
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
    speechService.setLanguage(currentLanguage);

    speechService.start({
      onStart: () => setIsRecordingField(true),
      onResult: (text) => {
        if (text && text.trim()) {
          onFieldFilled(firstMissingDef.id, text.trim());
        }
      },
      onEnd: () => {
        setIsRecordingField(false);
        setActiveRecordingFieldId(null);
      },
      onError: () => {
        setIsRecordingField(false);
        setActiveRecordingFieldId(null);
      },
    });
  };

  const label = firstMissingDef.label[currentLanguage] || firstMissingDef.label['en-IN'];

  return (
    <div className="p-5 bg-amber-50/90 rounded-3xl border border-amber-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-amber-950 text-sm sm:text-base">
                We found {filledCount} pieces of information. Next: {label} is missing
              </h4>
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                {missingFields.length} remaining
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-1">
              "{firstMissingDef.voicePrompt[currentLanguage]}"
            </p>
          </div>
        </div>

        {/* Quick Voice Prompt & Mini-Mic for this specific field */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={handleSpeakPrompt}
            title="Read question aloud"
            className="p-2.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">Ask Aloud</span>
          </button>

          <button
            onClick={handleRecordJustThisField}
            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
              isRecordingField && activeRecordingFieldId === firstMissingDef.id
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
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
    </div>
  );
};
