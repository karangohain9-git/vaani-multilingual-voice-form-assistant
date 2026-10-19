import React, { useState } from 'react';
import { Volume2, AlertCircle, Sparkles, Check, HelpCircle, Mic, MicOff } from 'lucide-react';
import type { FormFieldDefinition, FieldState, Language } from '../types';
import { voiceAssistant } from '../services/speechSynthesis';
import { speechService } from '../services/speechRecognition';
import { soundFx } from '../services/soundFx';

interface FormFieldItemProps {
  field: FormFieldDefinition;
  state: FieldState;
  currentLanguage: Language;
  onChange: (value: any) => void;
  error?: string;
  isMissing?: boolean;
}

export const FormFieldItem: React.FC<FormFieldItemProps> = ({
  field,
  state,
  currentLanguage,
  onChange,
  error,
  isMissing,
}) => {
  const [isFieldRecording, setIsFieldRecording] = useState(false);

  const handleSpeakFieldPrompt = () => {
    soundFx.playClick();
    const promptText = field.voicePrompt[currentLanguage];
    voiceAssistant.speak(promptText, currentLanguage);
  };

  const handleToggleFieldMic = () => {
    if (isFieldRecording) {
      soundFx.playRecordStop();
      speechService.stop();
      setIsFieldRecording(false);
      return;
    }

    soundFx.playRecordStart();
    setIsFieldRecording(true);
    speechService.setLanguage(currentLanguage);

    speechService.start({
      onStart: () => setIsFieldRecording(true),
      onResult: (text) => {
        if (text && text.trim()) {
          onChange(text.trim());
        }
      },
      onEnd: () => {
        setIsFieldRecording(false);
      },
      onError: () => {
        setIsFieldRecording(false);
      },
    });
  };

  const labelText = field.label[currentLanguage] || field.label['en-IN'];
  const placeholderText = field.placeholder[currentLanguage] || field.placeholder['en-IN'];
  const helpText = field.helpText ? field.helpText[currentLanguage] : undefined;

  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        error
          ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-200/50'
          : state.isUncertain
          ? 'bg-amber-50/40 border-amber-300'
          : state.source === 'ai'
          ? 'bg-gradient-to-br from-indigo-50/30 via-white to-white border-indigo-200/90 shadow-2xs'
          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
      }`}
    >
      {/* Field Header: Label, Badges, Speaker & Mic controls */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <label
            htmlFor={`field-${field.id}`}
            className="text-sm font-bold text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            {labelText}
            {field.required && (
              <span className="text-rose-600 font-bold" title="Required field">
                *
              </span>
            )}
          </label>

          {/* AI vs Manual Badges */}
          {state.source === 'ai' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              <Sparkles className="w-3 h-3 text-indigo-600" /> AI-filled
            </span>
          )}

          {state.isEdited && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
              <Check className="w-3 h-3 text-emerald-600" /> User edited
            </span>
          )}

          {state.isUncertain && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
              <AlertCircle className="w-3 h-3 text-amber-600" /> Needs review
            </span>
          )}
        </div>

        {/* Action Buttons: Voice Prompt Speaker & Micro-Mic */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleToggleFieldMic}
            title={isFieldRecording ? 'Stop voice recording' : `Speak ${labelText}`}
            aria-label={`Speak ${labelText}`}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isFieldRecording
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700'
            }`}
          >
            {isFieldRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleSpeakFieldPrompt}
            title={`Read instructions for ${labelText} aloud`}
            aria-label={`Read instructions for ${labelText} aloud`}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Field Input Control */}
      <div className="mt-1">
        {field.type === 'textarea' ? (
          <textarea
            id={`field-${field.id}`}
            rows={3}
            value={state.value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholderText}
            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-hidden ${
              error
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-400 bg-white'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white'
            }`}
          />
        ) : field.type === 'select' ? (
          <select
            id={`field-${field.id}`}
            value={state.value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-hidden bg-white ${
              error
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-400'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
            }`}
          >
            <option value="">-- {placeholderText} --</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label[currentLanguage] || opt.label['en-IN']}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={`field-${field.id}`}
            type={field.type}
            min={field.min}
            max={field.max}
            value={state.value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholderText}
            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-hidden ${
              error
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-400 bg-white'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white'
            }`}
          />
        )}
      </div>

      {/* Help text */}
      {helpText && !error && (
        <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{helpText}</span>
        </p>
      )}

      {/* Validation Error Message */}
      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Missing indicator prompt if not yet filled */}
      {isMissing && !error && (
        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Required information missing. Click the mic button above to speak this field.</span>
        </div>
      )}
    </div>
  );
};
