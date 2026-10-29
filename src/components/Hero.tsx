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

export interface PreviewContent {
  mainHeading: string;
  playBtnText: string;
  playingBtnText: string;
  resetBtnTitle: string;
  spokenCitizenVoice: string;
  languageBadge: string;
  samplePhrase: string;
  naturalSpeech: string;
  noJargon: string;
  aiExtractedHeading: string;
  validatedJsonBadge: string;
  applicantNameLabel: string;
  applicantNameValue: string;
  mobilePhoneLabel: string;
  mobilePhoneValue: string;
  phoneBadge: string;
  ageLabel: string;
  ageValue: string;
  locationLabel: string;
  locationValue: string;
  missingFieldLabel: string;
  missingFieldPrompt: string;
}

export const PREVIEW_CONTENT: Record<Language, PreviewContent> = {
  'en-IN': {
    mainHeading: 'Interactive Voice Automation Preview',
    playBtnText: 'Play Interactive Simulation',
    playingBtnText: 'Playing Demo Audio...',
    resetBtnTitle: 'Reset Preview',
    spokenCitizenVoice: 'Spoken Citizen Voice',
    languageBadge: 'Natural English',
    samplePhrase:
      'My name is Rahul Sharma. I am 24 years old. My phone number is 9876543210. I live in Guwahati, Assam at Zoo Road. I need monthly welfare assistance.',
    naturalSpeech: 'Natural conversational speech',
    noJargon: 'No form jargon',
    aiExtractedHeading: 'AI Extracted & Mapped',
    validatedJsonBadge: 'Validated JSON',
    applicantNameLabel: 'Applicant Name:',
    applicantNameValue: 'Rahul Sharma',
    mobilePhoneLabel: 'Mobile Phone:',
    mobilePhoneValue: '9876543210',
    phoneBadge: '10-Digit OK',
    ageLabel: 'Age:',
    ageValue: '24 Years',
    locationLabel: 'Location:',
    locationValue: 'Guwahati, Assam',
    missingFieldLabel: 'Missing Field Detection:',
    missingFieldPrompt: 'Address Prompted',
  },
  'hi-IN': {
    mainHeading: 'इंटरैक्टिव वॉयस ऑटोमेशन पूर्वावलोकन',
    playBtnText: 'इंटरैक्टिव सिमुलेशन चलाएं',
    playingBtnText: 'डेमो ऑडियो चल रहा है...',
    resetBtnTitle: 'पूर्वावलोकन रीसेट करें',
    spokenCitizenVoice: 'नागरिक की मौखिक आवाज़',
    languageBadge: 'प्राकृतिक हिन्दी',
    samplePhrase:
      'मेरा नाम राहुल शर्मा है। मेरी उम्र 24 साल है। मेरा मोबाइल नंबर 9876543210 है। मैं गुवाहाटी, असम में रहता हूँ। मुझे राशन सहायता चाहिए।',
    naturalSpeech: 'स्वाभाविक बातचीत वाली बोली',
    noJargon: 'फॉर्म की जटिलता से मुक्त',
    aiExtractedHeading: 'एआई द्वारा निकाला और भरा गया',
    validatedJsonBadge: 'सत्यापित जेसन (JSON)',
    applicantNameLabel: 'आवेदक का नाम:',
    applicantNameValue: 'राहुल शर्मा',
    mobilePhoneLabel: 'मोबाइल फोन:',
    mobilePhoneValue: '9876543210',
    phoneBadge: '10 अंक मान्य',
    ageLabel: 'उम्र:',
    ageValue: '24 वर्ष',
    locationLabel: 'स्थान:',
    locationValue: 'गुवाहाटी, असम',
    missingFieldLabel: 'छूटे हुए फ़ील्ड की पहचान:',
    missingFieldPrompt: 'घर का पता पूछा गया',
  },
  'as-IN': {
    mainHeading: 'ইণ্টাৰেক্টিভ ভয়েচ অটোমেচন পূৰ্বদৰ্শন',
    playBtnText: 'ইণ্টাৰেক্টিভ অনুকৰণ চলাওক',
    playingBtnText: 'ডেমো অডিঅ’ চলি আছে...',
    resetBtnTitle: 'পূৰ্বদৰ্শন পুনৰায় ঠিক কৰক',
    spokenCitizenVoice: 'নাগৰিকৰ কথিত কণ্ঠ',
    languageBadge: 'প্ৰাকৃতিক অসমীয়া',
    samplePhrase:
      'মোৰ নাম ৰাহুল শৰ্মা। মোৰ বয়স ২৪ বছৰ। মোৰ ফোন নম্বৰ ৯৮৭৬৫৪৩২১০। মই গুৱাহাটী, অসমত থাকোঁ। মোক খাদ্য সাহায্য আঁচনিৰ প্ৰয়োজন।',
    naturalSpeech: 'স্বাভাৱিক কথা-বতৰাৰ কণ্ঠ',
    noJargon: 'কোনো জটিল শব্দ নোহোৱাকৈ',
    aiExtractedHeading: 'এআই দ্বাৰা নিষ্কাশিত আৰু সংলগ্ন',
    validatedJsonBadge: 'পৰীক্ষিত জেছন (JSON)',
    applicantNameLabel: 'আবেদনকাৰীৰ নাম:',
    applicantNameValue: 'ৰাহুল শৰ্মা',
    mobilePhoneLabel: 'ম’বাইল ফোন:',
    mobilePhoneValue: '৯৮৭৬৫৪৩২১০',
    phoneBadge: '১০ টা অংক সঠিক',
    ageLabel: 'বয়স:',
    ageValue: '২৪ বছৰ',
    locationLabel: 'স্থান:',
    locationValue: 'গুৱাহাটী, অসম',
    missingFieldLabel: 'অনুপস্থিত তথ্য চিনাক্তকৰণ:',
    missingFieldPrompt: 'ঠিকনাৰ বিষয়ে সোধা হৈছে',
  },
};

export const Hero: React.FC<HeroProps> = ({
  currentLanguage,
  onStartForm,
  onSelectSamplePhrase,
}) => {
  const [isDemoSimulating, setIsDemoSimulating] = useState(false);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [prevLanguage, setPrevLanguage] = useState(currentLanguage);

  // If language changes, reset any active demo simulation immediately
  if (prevLanguage !== currentLanguage) {
    setPrevLanguage(currentLanguage);
    setIsDemoSimulating(false);
    setDemoStep(0);
    voiceAssistant.stop();
  }

  const preview = PREVIEW_CONTENT[currentLanguage] || PREVIEW_CONTENT['en-IN'];

  const handleSimulateDemo = () => {
    soundFx.playClick();
    setIsDemoSimulating(true);
    setDemoStep(1);

    const phrase = preview.samplePhrase;

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
    <div className="relative overflow-hidden bg-gradient-to-b from-[var(--hero-gradient-from)] via-[var(--hero-gradient-to)] to-[var(--bg-main)] pt-10 pb-20 bg-dot-pattern transition-colors duration-200">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-[var(--accent-primary)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-[var(--accent-secondary)]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Government & Hackathon Innovation Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[var(--surface-card)] backdrop-blur-md border border-[var(--border-subtle)] shadow-xs text-xs font-semibold text-[var(--text-primary)]">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#34D399] animate-pulse" />
            <span className="font-bold text-[var(--accent-primary)]">
              Digital India & Citizen Accessibility Initiative
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black text-[var(--text-primary)] tracking-tight leading-[1.15]">
            Speak your language.{" "}
            <span className="bg-gradient-to-r from-[var(--accent-primary)] via-purple-500 to-[var(--accent-secondary)] bg-clip-text text-transparent">
              Complete forms with confidence.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
            Filling digital applications can be stressful for citizens with
            limited computer skills.
            <strong className="text-[var(--text-primary)] font-bold"> Vaani</strong> listens
            to your natural voice in{" "}
            <span className="text-[var(--accent-secondary)] font-semibold underline decoration-[var(--accent-secondary)]/40 underline-offset-4">
              Hindi
            </span>
            ,{" "}
            <span className="text-[var(--accent-secondary)] font-semibold underline decoration-[var(--accent-secondary)]/40 underline-offset-4">
              English
            </span>
            , or{" "}
            <span className="text-[var(--accent-secondary)] font-semibold underline decoration-[var(--accent-secondary)]/40 underline-offset-4">
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
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] via-purple-600 to-[var(--accent-primary-hover)] hover:from-[var(--accent-primary-hover)] hover:to-purple-800 text-white font-bold text-lg shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span>Start Voice Form Now</span>
              <ArrowRight className="w-5 h-5 text-violet-200 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onSelectSamplePhrase(preview.samplePhrase);
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[var(--surface-card)] hover:bg-[var(--surface-secondary)] text-[var(--text-primary)] font-semibold text-base border border-[var(--border-subtle)] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-[var(--accent-secondary)]" />
              <span>Load Sample Phrase</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-[var(--state-success)]" /> No typing required
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[var(--state-success)]" /> Human review before database save
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <UserCheck className="w-4 h-4 text-[var(--state-success)]" /> Accessible for all ages & literacy
            </span>
          </div>
        </div>

        {/* Interactive Live Voice Demo Simulation Card */}
        <div className="mt-14 max-w-4xl mx-auto bg-[var(--surface-card)] backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border-subtle)] transition-colors duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-6 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-[#FB7185] shadow-xs" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#FBBF24] shadow-xs" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#34D399] shadow-xs" />
              <span className="text-xs font-bold text-[var(--text-primary)] ml-2 tracking-wide uppercase">
                {preview.mainHeading}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateDemo}
                disabled={isDemoSimulating}
                className="px-3.5 py-1.5 rounded-xl bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 text-[var(--accent-primary)] font-bold text-xs flex items-center gap-1.5 border border-[#8B5CF6]/30 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-[var(--accent-primary)] text-[var(--accent-primary)]" />
                <span>
                  {isDemoSimulating
                    ? preview.playingBtnText
                    : preview.playBtnText}
                </span>
              </button>

              {demoStep > 0 && (
                <button
                  onClick={handleResetDemo}
                  className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  title={preview.resetBtnTitle}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Left: What citizen speaks */}
            <div className="bg-[var(--surface-secondary)] rounded-2xl p-5 border border-[var(--border-subtle)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-[var(--accent-primary)]" /> {preview.spokenCitizenVoice}
                  </span>
                  <span className="text-[11px] font-bold text-[var(--accent-primary)] bg-[var(--surface-card)] px-2 py-0.5 rounded-md border border-[var(--border-subtle)] shadow-2xs">
                    {preview.languageBadge}
                  </span>
                </div>

                <div className="bg-[var(--surface-card)] rounded-xl p-4 border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-primary)] leading-relaxed shadow-sm relative">
                  "{preview.samplePhrase}"
                  {isDemoSimulating && (
                    <span className="inline-block w-2 h-4 bg-[var(--accent-primary)] ml-1 animate-pulse align-middle" />
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  {preview.naturalSpeech}
                </span>
                <span className="text-[var(--state-success)] font-semibold bg-[#059669]/10 border border-[#059669]/20 px-2 py-0.5 rounded-md">
                  {preview.noJargon}
                </span>
              </div>
            </div>

            {/* Right: What Vaani maps in real-time */}
            <div className="bg-[var(--surface-secondary)] rounded-2xl p-5 border border-[var(--border-subtle)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-[var(--accent-secondary)]" /> {preview.aiExtractedHeading}
                  </span>
                  <span className="text-[11px] font-bold text-[var(--state-success)] bg-[#059669]/10 px-2 py-0.5 rounded-md border border-[#059669]/20">
                    {preview.validatedJsonBadge}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-[var(--surface-card)] rounded-xl p-2.5 border border-[var(--border-subtle)] flex justify-between items-center shadow-2xs">
                    <span className="text-[var(--text-secondary)] font-medium">
                      {preview.applicantNameLabel}
                    </span>
                    <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      {preview.applicantNameValue}
                      <span className="w-2 h-2 rounded-full bg-[var(--state-success)]" />
                    </span>
                  </div>

                  <div className="bg-[var(--surface-card)] rounded-xl p-2.5 border border-[var(--border-subtle)] flex justify-between items-center shadow-2xs">
                    <span className="text-[var(--text-secondary)] font-medium">
                      {preview.mobilePhoneLabel}
                    </span>
                    <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      {preview.mobilePhoneValue}
                      <span className="text-[10px] text-[var(--state-success)] font-bold bg-[#059669]/10 px-1.5 py-0.2 rounded border border-[#059669]/20">
                        {preview.phoneBadge}
                      </span>
                    </span>
                  </div>

                  <div className="bg-[var(--surface-card)] rounded-xl p-2.5 border border-[var(--border-subtle)] flex justify-between items-center shadow-2xs">
                    <span className="text-[var(--text-secondary)] font-medium">{preview.ageLabel}</span>
                    <span className="font-bold text-[var(--text-primary)]">{preview.ageValue}</span>
                  </div>

                  <div className="bg-[var(--surface-card)] rounded-xl p-2.5 border border-[var(--border-subtle)] flex justify-between items-center shadow-2xs">
                    <span className="text-[var(--text-secondary)] font-medium">
                      {preview.locationLabel}
                    </span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {preview.locationValue}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span className="font-medium">{preview.missingFieldLabel}</span>
                <span className="text-[var(--state-warning)] font-bold bg-[#B45309]/15 border border-[#B45309]/30 px-2 py-0.5 rounded-md">
                  {preview.missingFieldPrompt}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Metrics Ticker for Hackathon Showcase */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="bg-[var(--surface-card)] p-5 rounded-2xl border border-[var(--border-subtle)] text-center shadow-xs transition-colors duration-200">
            <span className="text-3xl font-black text-[var(--accent-primary)] block">
              3+
            </span>
            <span className="text-xs font-semibold text-[var(--text-secondary)] mt-1 block">
              Native Languages (HI, EN, AS)
            </span>
          </div>

          <div className="bg-[var(--surface-card)] p-5 rounded-2xl border border-[var(--border-subtle)] text-center shadow-xs transition-colors duration-200">
            <span className="text-3xl font-black text-[var(--accent-secondary)] block">
              10-Digit
            </span>
            <span className="text-xs font-semibold text-[var(--text-secondary)] mt-1 block">
              Indian Phone Verification
            </span>
          </div>

          <div className="bg-[var(--surface-card)] p-5 rounded-2xl border border-[var(--border-subtle)] text-center shadow-xs transition-colors duration-200">
            <span className="text-3xl font-black text-[var(--state-success)] block">
              100%
            </span>
            <span className="text-xs font-semibold text-[var(--text-secondary)] mt-1 block">
              PostgreSQL Row Level Security
            </span>
          </div>

          <div className="bg-[var(--surface-card)] p-5 rounded-2xl border border-[var(--border-subtle)] text-center shadow-xs transition-colors duration-200">
            <span className="text-3xl font-black text-[var(--state-warning)] block">0</span>
            <span className="text-xs font-semibold text-[var(--text-secondary)] mt-1 block">
              Mandatory Typing Needed
            </span>
          </div>
        </div>

        {/* 3 Steps Visual Architecture */}
        <div className="mt-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] bg-[#8B5CF6]/15 px-3 py-1 rounded-full border border-[#8B5CF6]/30">
              Simple 3-Step Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-3">
              How Vaani Makes Digital Services Accessible
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-[var(--surface-card)] rounded-3xl p-7 border border-[var(--border-subtle)] shadow-xs hover:border-[var(--accent-primary)]/50 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6]/15 text-[var(--accent-primary)] flex items-center justify-center font-black text-2xl mb-5 group-hover:scale-110 transition-transform border border-[#8B5CF6]/30">
                1
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                Speak In Your Native Tongue
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Choose Hindi, English, or Assamese. Tap the microphone and speak
                freely. The browser Web Speech API captures and streams your
                voice in real-time.
              </p>
            </div>

            <div className="bg-[var(--surface-card)] rounded-3xl p-7 border border-[var(--border-subtle)] shadow-xs hover:border-[var(--accent-secondary)]/50 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#0891B2]/15 text-[var(--accent-secondary)] flex items-center justify-center font-black text-2xl mb-5 group-hover:scale-110 transition-transform border border-[#0891B2]/30">
                2
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                AI Extraction & Voice Guidance
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Google Gemini extracts phone, age, names, and address. If
                anything is omitted, Vaani speaks to you via SpeechSynthesis to
                prompt just that missing field.
              </p>
            </div>

            <div className="bg-[var(--surface-card)] rounded-3xl p-7 border border-[var(--border-subtle)] shadow-xs hover:border-[var(--state-success)]/50 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#059669]/15 text-[var(--state-success)] flex items-center justify-center font-black text-2xl mb-5 group-hover:scale-110 transition-transform border border-[#059669]/30">
                3
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                Review & Secure Database Save
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
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
