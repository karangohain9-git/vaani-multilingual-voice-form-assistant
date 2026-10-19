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
  const [activeTab, setActiveTab] = useState<'voice' | 'manual'>('voice');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  const selectedLangConfig =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) ||
    SUPPORTED_LANGUAGES[0];

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
    speechService.setLanguage(currentLanguage);

    const result = speechService.start(
      {
        onStart: () => {
          setIsListening(true);
          setMicError(null);
        },
        onResult: (text) => {
          onTranscriptChange(text);
        },
        onError: (message) => {
          setMicError(message);
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
      setIsListening(false);
    }
  };

  const handleClear = () => {
    soundFx.playClick();
    speechService.abort();
    setIsListening(false);
    onTranscriptChange('');
    setMicError(null);
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
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 card-glow-indigo transition-all">
      {/* Header and Language Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              1
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Spoken Voice Input
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Multilingual
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Speak naturally. Describe your full name, age, phone number, and location without worrying about computer form fields.
          </p>
        </div>

        {/* Language selector chips */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl self-start sm:self-auto border border-slate-200/50">
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
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
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
        <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold">Browser Voice Model Limitation:</strong> Standard desktop browsers lack native Assamese acoustic speech models. 
            If speech recognition doesn't capture phonetic nuances, speak in Hindi or English, or use the <strong>Manual Text Mode</strong> tab below to enter Assamese script directly.
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
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Microphone Voice Mode</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('manual');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'manual'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-pulse-ring -m-6 pointer-events-none" />
                <div className="absolute inset-0 rounded-full bg-rose-500/10 animate-pulse-ring -m-10 pointer-events-none" />
              </>
            )}

            <button
              onClick={handleToggleListening}
              aria-label={isListening ? 'Stop Listening' : 'Start Voice Input'}
              className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center cursor-pointer shadow-2xl transition-all transform active:scale-95 ${
                isListening
                  ? 'bg-gradient-to-tr from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white ring-8 ring-rose-100/90 shadow-rose-500/50 scale-105'
                  : 'bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white ring-8 ring-indigo-50 shadow-indigo-500/30 hover:scale-105'
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
                <span className="text-rose-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                  Listening in {selectedLangConfig.nativeName}... Speak clearly now
                </span>
              ) : (
                <span className="text-slate-500 flex items-center gap-1.5">
                  Click the microphone button to start speaking in {selectedLangConfig.nativeName}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Microphone Error Message Banner */}
      {micError && (
        <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-900 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-bold">Microphone Status:</strong> {micError}
            <div className="mt-1 text-slate-600">
              You can switch to the <strong>Manual Text Mode</strong> tab above or click below to insert sample speech text for testing.
            </div>
          </div>
        </div>
      )}

      {/* Live Transcript Preview Text Area */}
      <div className="mt-7">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <span>Recognized Speech Transcript</span>
            {transcript && (
              <span className="text-[11px] text-emerald-700 font-semibold lowercase flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> ready for AI mapping
              </span>
            )}
          </label>
          <div className="flex items-center gap-3">
            {transcript && (
              <button
                onClick={handleClear}
                className="text-xs text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            )}
            <span className="text-[11px] text-slate-400 font-mono">
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
            placeholder={`Your spoken words will appear here in real-time...\n\nExample in ${selectedLangConfig.nativeName}: "${sampleTranscripts[currentLanguage]}"`}
            className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white focus:bg-white text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all shadow-inner leading-relaxed resize-y"
          />
        </div>
      </div>

      {/* Quick Demo Helper Presets */}
      <div className="mt-5 p-4 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-slate-50 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-indigo-950 font-medium">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Hackathon Demo Helper: Need a sample voice sentence?</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSpeakSample}
            title="Listen to sample spoken by synthesizer"
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 font-bold border border-indigo-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Listen</span>
          </button>
          <button
            onClick={handleInsertSample}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
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
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 active:translate-y-0'
          }`}
        >
          {isProcessingAi ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing with Google Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-indigo-200" />
              <span>Extract & Map to Form Fields</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
