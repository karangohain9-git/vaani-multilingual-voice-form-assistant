import React, { useState, useEffect } from 'react';
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
  const [fieldAdvisory, setFieldAdvisory] = useState<string | null>(null);

  // Stop recording if the language changes
  useEffect(() => {
    if (isFieldRecording) {
      speechService.stop();
      setIsFieldRecording(false);
    }
    setFieldAdvisory(null);
  }, [currentLanguage]);

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
    setFieldAdvisory(null);
    speechService.setLanguage(currentLanguage);

    speechService.start({
      onStart: () => setIsFieldRecording(true),
      onResult: (text, _isFinal, advisory) => {
        if (text && text.trim()) {
          onChange(text.trim());
          if (advisory) {
            setFieldAdvisory(advisory.message);
          } else {
            setFieldAdvisory(null);
          }
        }
      },
      onEnd: () => {
        setIsFieldRecording(false);
      },
      onError: (errMsg) => {
        setIsFieldRecording(false);
        setFieldAdvisory(errMsg);
      },
    });
  };

  const labelText = field.label[currentLanguage] || field.label['en-IN'];
  const placeholderText = field.placeholder[currentLanguage] || field.placeholder['en-IN'];
  const helpText = field.helpText ? field.helpText[currentLanguage] : undefined;

  const isValueEmpty =
    state.value === undefined ||
    state.value === null ||
    (typeof state.value === 'string' && state.value.trim() === '');

  // Only highlight as an active validation error if the field has an invalid value, or was touched/edited
  const hasActiveError = Boolean(error && (!isValueEmpty || state.isEdited));

  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        hasActiveError
          ? 'bg-[var(--bg-error-card)] border-[var(--border-error)] shadow-sm'
          : state.isUncertain
          ? 'bg-[var(--surface-card)] border-[var(--state-warning)]/50 shadow-xs'
          : state.source === 'ai'
          ? 'bg-[var(--surface-card)] border-[var(--accent-primary)]/50 shadow-[0_0_15px_rgba(139,92,246,0.08)]'
          : state.isEdited
          ? 'bg-[var(--surface-card)] border-[var(--state-success)]/40 shadow-xs'
          : 'bg-[var(--surface-card)] border-[var(--border-subtle)] hover:border-[var(--border-input)] shadow-xs'
      }`}
    >
      {/* Field Header: Label, Badges, Speaker & Mic controls */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <label
            htmlFor={`field-${field.id}`}
            className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
          >
            {labelText}
            {field.required && (
              <span className="text-[var(--state-error)] font-bold" title="Required field">
                *
              </span>
            )}
          </label>

          {/* AI vs Manual Badges */}
          {state.source === 'ai' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#8B5CF6]/15 text-[var(--accent-primary)] border border-[#8B5CF6]/30">
              <Sparkles className="w-3 h-3 text-[var(--accent-primary)]" /> AI-filled
            </span>
          )}

          {state.isEdited && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#059669]/15 text-[var(--state-success)] border border-[#059669]/30">
              <Check className="w-3 h-3 text-[var(--state-success)]" /> User edited
            </span>
          )}

          {state.isUncertain && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#B45309]/15 text-[var(--state-warning)] border border-[#B45309]/30">
              <AlertCircle className="w-3 h-3 text-[var(--state-warning)]" /> Needs review
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
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isFieldRecording
                ? 'bg-[var(--state-error)] border-[var(--state-error)] text-white animate-pulse'
                : 'bg-[var(--surface-secondary)] hover:bg-[var(--accent-primary)] text-[var(--text-primary)] hover:text-white border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]'
            }`}
          >
            {isFieldRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleSpeakFieldPrompt}
            title={`Read instructions for ${labelText} aloud`}
            aria-label={`Read instructions for ${labelText} aloud`}
            className="p-1.5 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--accent-primary)] text-[var(--text-primary)] hover:text-white border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
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
              hasActiveError
                ? 'bg-[var(--bg-error-card)] border-[var(--border-error)] text-[var(--text-primary)] focus:border-[var(--state-error)] focus:ring-1 focus:ring-[var(--state-error)]'
                : 'bg-[var(--surface-input)] border-[var(--border-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]'
            }`}
          />
        ) : field.type === 'select' ? (
          <select
            id={`field-${field.id}`}
            value={state.value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-hidden ${
              hasActiveError
                ? 'bg-[var(--bg-error-card)] border-[var(--border-error)] text-[var(--text-primary)] focus:border-[var(--state-error)] focus:ring-1 focus:ring-[var(--state-error)]'
                : 'bg-[var(--surface-input)] border-[var(--border-input)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]'
            }`}
          >
            <option value="" className="bg-[var(--surface-card)] text-[var(--text-primary)]">-- {placeholderText} --</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[var(--surface-card)] text-[var(--text-primary)]">
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
              hasActiveError
                ? 'bg-[var(--bg-error-card)] border-[var(--border-error)] text-[var(--text-primary)] focus:border-[var(--state-error)] focus:ring-1 focus:ring-[var(--state-error)]'
                : 'bg-[var(--surface-input)] border-[var(--border-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]'
            }`}
          />
        )}
      </div>

      {/* Help text */}
      {helpText && !hasActiveError && (
        <p className="mt-1.5 text-xs text-[var(--text-secondary)] flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
          <span>{helpText}</span>
        </p>
      )}

      {/* Validation Error Message */}
      {hasActiveError && (
        <div className="mt-2.5 flex items-center gap-2 text-xs font-medium text-[var(--state-error)] bg-[var(--bg-error-card)] p-2.5 rounded-xl border border-[var(--border-error)]">
          <AlertCircle className="w-4 h-4 shrink-0 text-[var(--state-error)]" />
          <span>{error}</span>
        </div>
      )}

      {/* Missing indicator prompt if not yet filled */}
      {isMissing && !hasActiveError && (
        <div className="mt-2 flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] bg-[var(--surface-secondary)] p-2 rounded-xl border border-[var(--border-subtle)]">
          <AlertCircle className="w-4 h-4 shrink-0 text-[var(--state-warning)]" />
          <span>Required information missing. Click the mic button above to speak this field.</span>
        </div>
      )}

      {/* Script Mismatch / Engine Advisory */}
      {fieldAdvisory && (
        <div className="mt-2 flex items-start gap-1.5 text-xs font-medium text-[var(--state-warning)] bg-[var(--surface-secondary)] p-2.5 rounded-xl border border-[var(--state-warning)]/40">
          <AlertCircle className="w-4 h-4 shrink-0 text-[var(--state-warning)] mt-0.5" />
          <span className="leading-snug">{fieldAdvisory}</span>
        </div>
      )}
    </div>
  );
};
