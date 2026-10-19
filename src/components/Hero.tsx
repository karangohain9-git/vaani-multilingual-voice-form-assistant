import React, { useState } from "react";
import {
  Mic,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  UserCheck,
  Volume2,
  Play,
  RotateCcw,
  Cpu,
} from 'lucide-react';
import type { Language } from "../types";
import { voiceAssistant } from "../services/speechSynthesis";
import { soundFx } from "../services/soundFx";

interface HeroProps {
  currentLanguage: Language;
  onStartForm: () => void;
  onSelectSamplePhrase: (text: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  currentLanguage,
  onStartForm,
  onSelectSamplePhrase,
}) => {
  const [isDemoSimulating, setIsDemoSimulating] = useState(false);
  const [demoStep, setDemoStep] = useState<number>(0);

  const samplePhraseHindi =
    "मेरा नाम राहुल शर्मा है। मेरी उम्र 24 साल है। मेरा मोबाइल नंबर 9876543210 है। मैं गुवाहाटी, असम में रहता हूँ। मुझे राशन सहायता चाहिए।";
  const samplePhraseEnglish =
    "My name is Rahul Sharma. I am 24 years old. My phone number is 9876543210. I live in Guwahati, Assam at Zoo Road. I need monthly welfare assistance.";

  const handleSimulateDemo = () => {
    soundFx.playClick();
    setIsDemoSimulating(true);
    setDemoStep(1);

    const phrase =
      currentLanguage === "hi-IN" ? samplePhraseHindi : samplePhraseEnglish;

    // Step 1: Speak audio and animate
    soundFx.playRecordStart();
    voiceAssistant.speak(phrase, currentLanguage, () => {
      soundFx.playRecordStop();
      // Step 2: Show extraction
      setDemoStep(2);
      soundFx.playAiSuccess();
      setTimeout(() => {
        setIsDemoSimulating(false);
      }, 3500);
    });
  };

  const handleResetDemo = () => {
    soundFx.playClick();
    voiceAssistant.stop();
    setIsDemoSimulating(false);
    setDemoStep(0);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-slate-50 to-white pt-10 pb-20 bg-dot-pattern">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-violet-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Government & Hackathon Innovation Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-indigo-200/80 shadow-xs text-xs font-semibold text-indigo-950">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-indigo-700">
              Digital India & Citizen Accessibility Initiative
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium hidden sm:inline">
              Hackathon Ready Edition
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Speak your language.{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Complete forms with confidence.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Filling digital applications can be stressful for citizens with
            limited computer skills.
            <strong className="text-slate-900 font-bold"> Vaani</strong> listens
            to your natural voice in{" "}
            <span className="text-indigo-700 font-semibold underline decoration-indigo-300 underline-offset-4">
              Hindi
            </span>
            ,{" "}
            <span className="text-indigo-700 font-semibold underline decoration-indigo-300 underline-offset-4">
              English
            </span>
            , or{" "}
            <span className="text-indigo-700 font-semibold underline decoration-indigo-300 underline-offset-4">
              Assamese
            </span>
            , extracts each detail with Google Gemini AI, validates required
            fields, and lets you review everything before submission.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                soundFx.playClick();
                onStartForm();
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white font-bold text-lg shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span>Start Voice Form Now</span>
              <ArrowRight className="w-5 h-5 text-indigo-200 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onSelectSamplePhrase(
                  currentLanguage === "hi-IN"
                    ? samplePhraseHindi
                    : samplePhraseEnglish,
                );
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Load Sample Phrase</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> No typing
              required
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Human review
              before database save
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <UserCheck className="w-4 h-4 text-emerald-600" /> Accessible for
              all ages & literacy
            </span>
          </div>
        </div>

        {/* Interactive Live Voice Demo Simulation Card */}
        <div className="mt-14 max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 card-glow-indigo">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-xs" />
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-xs" />
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-xs" />
              <span className="text-xs font-bold text-slate-700 ml-2 tracking-wide uppercase">
                Interactive Voice Automation Preview
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateDemo}
                disabled={isDemoSimulating}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 border border-indigo-200 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
                <span>
                  {isDemoSimulating
                    ? "Playing Demo Audio..."
                    : "Play Interactive Simulation"}
                </span>
              </button>

              {demoStep > 0 && (
                <button
                  onClick={handleResetDemo}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                  title="Reset Preview"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Left: What citizen speaks */}
            <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-indigo-600" /> Spoken Citizen
                    Voice
                  </span>
                  <span className="text-[11px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-100 shadow-2xs">
                    Natural Hindi / English
                  </span>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200/90 text-sm font-medium text-slate-800 leading-relaxed shadow-sm relative">
                  "
                  {currentLanguage === "hi-IN"
                    ? samplePhraseHindi
                    : samplePhraseEnglish}
                  "
                  {isDemoSimulating && (
                    <span className="inline-block w-2 h-4 bg-indigo-600 ml-1 animate-pulse align-middle" />
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                  Natural conversational speech
                </span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                  No form jargon
                </span>
              </div>
            </div>

            {/* Right: What Vaani maps in real-time */}
            <div className="bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-white rounded-2xl p-5 border border-indigo-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-indigo-600" /> AI Extracted &
                    Mapped
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
                    Validated JSON
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-white rounded-xl p-2.5 border border-indigo-100/80 flex justify-between items-center shadow-2xs">
                    <span className="text-slate-500 font-medium">
                      Applicant Name:
                    </span>
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      Rahul Sharma
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-2.5 border border-indigo-100/80 flex justify-between items-center shadow-2xs">
                    <span className="text-slate-500 font-medium">
                      Mobile Phone:
                    </span>
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      9876543210
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        10-Digit OK
                      </span>
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-2.5 border border-indigo-100/80 flex justify-between items-center shadow-2xs">
                    <span className="text-slate-500 font-medium">Age:</span>
                    <span className="font-bold text-slate-900">24 Years</span>
                  </div>

                  <div className="bg-white rounded-xl p-2.5 border border-indigo-100/80 flex justify-between items-center shadow-2xs">
                    <span className="text-slate-500 font-medium">
                      Location:
                    </span>
                    <span className="font-bold text-slate-900">
                      Guwahati, Assam
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
                <span className="font-medium">Missing Field Detection:</span>
                <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
                  Address Prompted
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Metrics Ticker for Hackathon Showcase */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-2xs">
            <span className="text-3xl font-black text-indigo-600 block">
              3+
            </span>
            <span className="text-xs font-semibold text-slate-600 mt-1 block">
              Native Languages (HI, EN, AS)
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-2xs">
            <span className="text-3xl font-black text-violet-600 block">
              10-Digit
            </span>
            <span className="text-xs font-semibold text-slate-600 mt-1 block">
              Indian Phone Verification
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-2xs">
            <span className="text-3xl font-black text-emerald-600 block">
              100%
            </span>
            <span className="text-xs font-semibold text-slate-600 mt-1 block">
              PostgreSQL Row Level Security
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-2xs">
            <span className="text-3xl font-black text-amber-600 block">0</span>
            <span className="text-xs font-semibold text-slate-600 mt-1 block">
              Mandatory Typing Needed
            </span>
          </div>
        </div>

        {/* 3 Steps Visual Architecture */}
        <div className="mt-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Simple 3-Step Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              How Vaani Makes Digital Services Accessible
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-2xl mb-5 group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Speak In Your Native Tongue
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Choose Hindi, English, or Assamese. Tap the microphone and speak
                freely. The browser Web Speech API captures and streams your
                voice in real-time.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center font-black text-2xl mb-5 group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                AI Extraction & Voice Guidance
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Google Gemini extracts phone, age, names, and address. If
                anything is omitted, Vaani speaks to you via SpeechSynthesis to
                prompt just that missing field.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-2xl mb-5 group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Review & Secure Database Save
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Inspect every field, edit manually if needed, and confirm. Data
                is saved in Supabase PostgreSQL protected by Row Level Security,
                with an instant reference receipt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
