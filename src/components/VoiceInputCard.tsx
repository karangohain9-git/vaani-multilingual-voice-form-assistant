import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Keyboard,
  CheckCircle2,
  Volume2,
  FileCheck,
} from 'lucide-react';
import type { Language } from '../types';
import { SUPPORTED_LANGUAGES } from '../types';
import { WaveformIndicator } from './WaveformIndicator';
import { speechService } from '../services/speechRecognition';
import type { SpeechAdvisory } from '../services/speechRecognition';
import { voiceAssistant } from '../services/speechSynthesis';
import { soundFx } from '../services/soundFx';

interface VoiceInputCardProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  transcript: string;
  onTranscriptChange: (text: string) => void;
  onProcessExtraction: () => void;
  isProcessingAi: boolean;
  sampleTranscripts: {
    'en-IN': string;
    'hi-IN': string;
    'as-IN': string;
  };
}

export const VoiceInputCard: React.FC<VoiceInputCardProps> = ({
  currentLanguage,
  onLanguageChange,
  transcript,
  onTranscriptChange,
  onProcessExtraction,
  isProcessingAi,
  sampleTranscripts,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [micErrorCode, setMicErrorCode] = useState<string | null>(null);
  const [speechAdvisory, setSpeechAdvisory] = useState<SpeechAdvisory | null>(null);
  const [activeTab, setActiveTab] = useState<'voice' | 'manual'>('voice');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  const selectedLangConfig =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) ||
    SUPPORTED_LANGUAGES[0];

  // Stop listening and clear errors if language changes
  useEffect(() => {
    if (isListening) {
      soundFx.playRecordStop();
      speechService.stop();
      setIsListening(false);
    }
    setSpeechAdvisory(null);
    setMicError(null);
    setMicErrorCode(null);
  }, [currentLanguage]);

  // Recording seconds timer
  useEffect(() => {
    if (isListening) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  const handleToggleListening = () => {
    if (isListening) {
      soundFx.playRecordStop();
      speechService.stop();
      setIsListening(false);
      return;
    }

    soundFx.playRecordStart();
    setMicError(null);
    setMicErrorCode(null);
    setSpeechAdvisory(null);
    speechService.setLanguage(currentLanguage);

    const result = speechService.start(
      {
        onStart: () => {
          setIsListening(true);
          setMicError(null);
          setMicErrorCode(null);
          setSpeechAdvisory(null);
        },
        onResult: (text, _isFinal, advisory) => {
          onTranscriptChange(text);
          if (advisory) {
            setSpeechAdvisory(advisory);
          } else {
            setSpeechAdvisory(null);
          }
        },
        onError: (message, code) => {
          setMicError(message);
          setMicErrorCode(code);
          setIsListening(false);
          soundFx.playRecordStop();
        },
        onEnd: () => {
          setIsListening(false);
        },
      },
      transcript
    );

    if (!result.success) {
      setMicError(result.message || 'Failed to start microphone');
      setMicErrorCode('init-failure');
      setIsListening(false);
    }
  };

  const handleClear = () => {
    soundFx.playClick();
    speechService.abort();
    setIsListening(false);
    onTranscriptChange('');
    setMicError(null);
    setMicErrorCode(null);
    setSpeechAdvisory(null);
  };

  const handleSpeakSample = () => {
    soundFx.playClick();
    const text = sampleTranscripts[currentLanguage];
    voiceAssistant.speak(text, currentLanguage);
  };

  const handleInsertSample = () => {
    soundFx.playClick();
    const text = sampleTranscripts[currentLanguage];
    onTranscriptChange(text);
    setMicError(null);
    setSpeechAdvisory(null);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-[var(--surface-card)] rounded-3xl p-6 sm:p-8 shadow-xl border border-[var(--border-subtle)] transition-colors duration-200">
      {/* Header and Language Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-primary)] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              1
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
              Spoken Voice Input
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#8B5CF6]/15 text-[var(--accent-primary)] border border-[#8B5CF6]/30">
              Multilingual
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Speak naturally. Describe your full name, age, phone number, and location without worrying about computer form fields.
          </p>
        </div>

        {/* Language selector chips */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[var(--surface-secondary)] rounded-2xl self-start sm:self-auto border border-[var(--border-subtle)]">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLanguage;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  soundFx.playClick();
                  onLanguageChange(lang.code);
                  speechService.setLanguage(lang.code);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {lang.nativeName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Honest Warning for Assamese Browser Support */}
      {currentLanguage === 'as-IN' && (
        <div className="mt-4 p-4 bg-[var(--surface-secondary)] rounded-2xl border border-[var(--state-warning)]/30 text-xs text-[var(--text-secondary)] flex items-start gap-3 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-[var(--state-warning)] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold text-[var(--text-primary)]">Browser Voice Model Limitation:</strong> Standard desktop browsers lack native Assamese acoustic speech models. 
            If speech recognition doesn't capture phonetic nuances, speak in Hindi or English, or use the <strong className="text-[var(--accent-primary)]">Manual Text Mode</strong> tab below to enter Assamese script directly.
          </div>
        </div>
      )}

      {/* Dynamic Script Mismatch / Engine Advisory Banner */}
      {speechAdvisory && (
        <div className="mt-4 p-4 bg-[var(--surface-secondary)] border border-[var(--state-warning)]/30 rounded-2xl flex items-start gap-3 text-[var(--text-primary)] text-xs shadow-xs">
          <AlertCircle className="w-5 h-5 text-[var(--state-warning)] shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <div className="font-bold text-[var(--text-primary)]">
              Browser Recognition Advisory ({selectedLangConfig.nativeName})
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {speechAdvisory.message}
            </p>
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('manual');
                }}
                className="px-3 py-1 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-bold rounded-lg transition-colors cursor-pointer"
              >
                Switch to Manual Text Mode
              </button>
              <button
                type="button"
                onClick={() => setSpeechAdvisory(null)}
                className="px-2.5 py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode Switcher: Voice Microphone vs Keyboard fallback */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('voice');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'voice'
              ? 'bg-[var(--accent-primary)] text-white shadow-md'
              : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Microphone Voice Mode</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            if (isListening) {
              soundFx.playRecordStop();
              speechService.stop();
              setIsListening(false);
            }
            setMicError(null);
            setMicErrorCode(null);
            setActiveTab('manual');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'manual'
              ? 'bg-[var(--accent-primary)] text-white shadow-md'
              : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          <span>Manual Text Mode</span>
        </button>
      </div>

      {/* Main Microphone Button & Waveform Area */}
      {activeTab === 'voice' && (
        <div className="mt-8 flex flex-col items-center justify-center text-center">
          <div className="relative">
            {/* Multi-layered animated pulse rings when listening */}
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-[var(--state-error)]/20 animate-pulse-ring -m-6 pointer-events-none" />
                <div className="absolute inset-0 rounded-full bg-[var(--state-error)]/10 animate-pulse-ring -m-10 pointer-events-none" />
              </>
            )}

            <button
              onClick={handleToggleListening}
              aria-label={isListening ? 'Stop Listening' : 'Start Voice Input'}
              className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center cursor-pointer shadow-2xl transition-all transform active:scale-95 ${
                isListening
                  ? 'bg-gradient-to-tr from-[var(--state-error)] to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white ring-8 ring-[var(--state-error)]/20 scale-105'
                  : 'bg-gradient-to-tr from-[var(--accent-primary)] via-purple-600 to-[var(--accent-primary-hover)] hover:from-[var(--accent-primary-hover)] hover:to-purple-800 text-white ring-8 ring-[var(--accent-primary)]/20 shadow-xl shadow-purple-500/25 hover:scale-105'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-10 h-10 animate-bounce" />
                  <span className="text-[11px] font-black mt-1 tracking-wider uppercase">
                    Stop
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-white/20 px-2 py-0.2 rounded-full mt-0.5">
                    {formatTime(recordingSeconds)}
                  </span>
                </>
              ) : (
                <>
                  <Mic className="w-10 h-10" />
                  <span className="text-[11px] font-black mt-1.5 tracking-wider uppercase">
                    Tap to Speak
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Status Label & Waveform */}
          <div className="mt-6 flex flex-col items-center">
            <WaveformIndicator isListening={isListening} />
            <div className="mt-2.5 text-sm font-semibold">
              {isListening ? (
                <span className="text-[var(--state-error)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--state-error)] animate-ping" />
                  Listening in {selectedLangConfig.nativeName}... Speak clearly now
                </span>
              ) : (
                <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                  Click the microphone button to start speaking in {selectedLangConfig.nativeName}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Microphone / Speech Service Error Message Banner */}
      {micError && (
        <div className="mt-6 p-4 bg-[var(--bg-error-card)] border border-[var(--border-error)] rounded-2xl flex items-start gap-3 text-xs shadow-xs">
          <AlertCircle className="w-5 h-5 text-[var(--state-error)] shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div>
              <strong className="font-bold text-sm block mb-0.5 text-[var(--text-primary)]">
                {micErrorCode === 'network'
                  ? 'Speech Service Network Notice'
                  : micErrorCode === 'not-allowed' || micErrorCode === 'permission-denied' || micErrorCode === 'audio-capture'
                  ? 'Microphone Access Notice'
                  : 'Voice Input Notice'}
              </strong>
              <p className="leading-relaxed text-[var(--state-error)]">{micError}</p>
            </div>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setMicError(null);
                  setMicErrorCode(null);
                  handleToggleListening();
                }}
                className="px-3 py-1.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-bold rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1.5 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Microphone</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('manual');
                  setMicError(null);
                  setMicErrorCode(null);
                }}
                className="px-3 py-1.5 bg-[var(--surface-card)] hover:bg-[var(--surface-secondary)] text-[var(--text-primary)] font-bold border border-[var(--border-subtle)] rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Keyboard className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>Switch to Manual Text Mode</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMicError(null);
                  setMicErrorCode(null);
                }}
                className="px-2.5 py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium cursor-pointer text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Transcript Preview Text Area */}
      <div className="mt-7">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
            <span>
              {activeTab === 'manual' ? 'Enter Details Manually (Text Input)' : 'Recognized Speech Transcript'}
            </span>
            {transcript && (
              <span className="text-[11px] text-[var(--state-success)] font-semibold lowercase flex items-center gap-1 bg-[#059669]/10 px-2 py-0.5 rounded-full border border-[#059669]/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> ready for AI mapping
              </span>
            )}
          </label>
          <div className="flex items-center gap-3">
            {transcript && (
              <button
                onClick={handleClear}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--state-error)] font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            )}
            <span className="text-[11px] text-[var(--text-secondary)] font-mono">
              {wordCount} words
            </span>
          </div>
        </div>

        <div className="relative">
          <textarea
            aria-label="Editable voice transcript"
            rows={4}
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            placeholder={
              activeTab === 'manual'
                ? `Type or paste your information here in ${selectedLangConfig.nativeName} or English...\n\nExample: "${sampleTranscripts[currentLanguage]}"`
                : `Your spoken words will appear here in real-time...\n\nExample in ${selectedLangConfig.nativeName}: "${sampleTranscripts[currentLanguage]}"`
            }
            className="w-full p-4 rounded-2xl border border-[var(--border-input)] bg-[var(--surface-input)] hover:border-[var(--accent-primary)]/50 focus:border-[var(--accent-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:ring-1 focus:ring-[var(--accent-primary)] focus:outline-hidden transition-all shadow-inner leading-relaxed resize-y"
          />
        </div>
      </div>

      {/* Quick Demo Helper Presets */}
      <div className="mt-5 p-4 bg-[var(--surface-secondary)] rounded-2xl border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[var(--text-primary)] font-medium">
          <Sparkles className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
          <span>Need a sample voice sentence?</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSpeakSample}
            title="Listen to sample spoken by synthesizer"
            className="px-3.5 py-1.5 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-bold border border-[var(--border-subtle)] shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Listen</span>
          </button>
          <button
            onClick={handleInsertSample}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Insert Sample Text</span>
          </button>
        </div>
      </div>

      {/* Process with AI Action CTA */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => {
            soundFx.playClick();
            onProcessExtraction();
          }}
          disabled={!transcript || transcript.trim().length === 0 || isProcessingAi}
          className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer ${
            !transcript || transcript.trim().length === 0 || isProcessingAi
              ? 'bg-[var(--surface-secondary)] text-[var(--text-muted)]/50 border border-[var(--border-subtle)] cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-[var(--accent-primary)] via-purple-600 to-[var(--accent-primary-hover)] hover:from-[var(--accent-primary-hover)] hover:to-purple-800 text-white shadow-xl shadow-purple-500/25 transform hover:-translate-y-0.5 active:translate-y-0'
          }`}
        >
          {isProcessingAi ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing with Google Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-violet-200" />
              <span>Extract & Map to Form Fields</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
