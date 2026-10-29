import { useState, useEffect, useMemo, useRef } from 'react';
import type { Language, FormTypeId, FieldState, FormSubmissionRecord } from './types';
import { FORM_SCHEMAS } from './data/formSchemas';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VoiceInputCard } from './components/VoiceInputCard';
import { FormFieldItem } from './components/FormFieldItem';
import { MissingFieldsBanner } from './components/MissingFieldsBanner';
import { ReviewModal } from './components/ReviewModal';
import { SuccessReceipt } from './components/SuccessReceipt';
import { HowItWorksModal } from './components/HowItWorksModal';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';
import { initializeFieldStates, mergeExtractedFields } from './utils/formMapping';
import { validateForm } from './utils/validation';
import { aiService } from './services/aiExtraction';
import { voiceAssistant } from './services/speechSynthesis';
import { soundFx } from './services/soundFx';
import {
  FileText,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Volume2,
  GraduationCap,
  Building2,
  CheckCircle2,
  Mic,
  Cpu,
  ShieldCheck,
  Award,
} from 'lucide-react';
import './App.css';

export function App() {
  // Navigation View: 'landing' | 'form' | 'success'
  const [view, setView] = useState<'landing' | 'form' | 'success'>('landing');

  // Application Language: 'hi-IN' | 'en-IN' | 'as-IN'
  const [currentLanguage, setCurrentLanguage] = useState<Language>('hi-IN');

  // Selected Form Type
  const [selectedFormId, setSelectedFormId] = useState<FormTypeId>('citizen_welfare');

  // Voice Transcript
  const [transcript, setTranscript] = useState('');

  // Field States
  const currentFormDef = useMemo(() => FORM_SCHEMAS[selectedFormId], [selectedFormId]);
  const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>(() =>
    initializeFieldStates(currentFormDef.fields)
  );

  // Processing & Loading States
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Notice Info
  const [aiNotice, setAiNotice] = useState<{
    message: string;
    model: string;
    isFallback: boolean;
  } | null>(null);

  // Validation State
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // Dialogs & Modals
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Final Submission Receipt
  const [submissionRecord, setSubmissionRecord] = useState<FormSubmissionRecord | null>(null);
  const [isLocalMockSubmission, setIsLocalMockSubmission] = useState(false);

  // User Settings & Accessibility
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vaani_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [fontSizeMode, setFontSizeMode] = useState<'normal' | 'large' | 'xlarge'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vaani_font_size');
      if (saved === 'large' || saved === 'xlarge' || saved === 'normal') return saved;
    }
    return 'normal';
  });
  const [userApiKey, setUserApiKey] = useState(() => {
    return typeof window !== 'undefined'
      ? localStorage.getItem('vaani_gemini_key') || ''
      : '';
  });

  const formTopRef = useRef<HTMLDivElement>(null);

  // Sync field states when form schema changes
  useEffect(() => {
    setFieldStates(initializeFieldStates(currentFormDef.fields));
    setValidationErrors({});
    setMissingFields(currentFormDef.fields.filter((f) => f.required).map((f) => f.id));
    setTranscript('');
    setAiNotice(null);
  }, [selectedFormId, currentFormDef]);

  // Recalculate validation whenever field values change
  useEffect(() => {
    const rawValues: Record<string, any> = {};
    for (const [key, state] of Object.entries(fieldStates)) {
      rawValues[key] = state.value;
    }
    const valResult = validateForm(currentFormDef.fields, rawValues, currentLanguage);
    setValidationErrors(valResult.errors);
    setMissingFields(valResult.missingFields);
  }, [fieldStates, currentFormDef, currentLanguage]);

  // Sync Voice Assistant enabled state
  useEffect(() => {
    voiceAssistant.setEnabled(voiceGuidanceEnabled);
    soundFx.setMuted(!voiceGuidanceEnabled);
  }, [voiceGuidanceEnabled]);

  // Sync High Contrast class on body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (darkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      body.setAttribute('data-theme', 'dark');
      if (typeof window !== 'undefined') {
        localStorage.setItem('vaani_theme', 'dark');
      }
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      body.setAttribute('data-theme', 'light');
      if (typeof window !== 'undefined') {
        localStorage.setItem('vaani_theme', 'light');
      }
    }
  }, [darkMode]);

  // Sync Font Size class on root and body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove('font-size-normal', 'font-size-large', 'font-size-xlarge');
    body.classList.remove('font-size-normal', 'font-size-large', 'font-size-xlarge');

    root.setAttribute('data-font-size', fontSizeMode);
    body.setAttribute('data-font-size', fontSizeMode);

    if (fontSizeMode === 'large') {
      root.classList.add('font-size-large');
      body.classList.add('font-size-large');
    } else if (fontSizeMode === 'xlarge') {
      root.classList.add('font-size-xlarge');
      body.classList.add('font-size-xlarge');
    } else {
      root.classList.add('font-size-normal');
      body.classList.add('font-size-normal');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('vaani_font_size', fontSizeMode);
    }
  }, [fontSizeMode]);

  const handleSaveUserApiKey = (key: string) => {
    setUserApiKey(key);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vaani_gemini_key', key);
    }
  };

  const handleCycleFontSize = () => {
    soundFx.playClick();
    setFontSizeMode((prev) => {
      if (prev === 'normal') return 'large';
      if (prev === 'large') return 'xlarge';
      return 'normal';
    });
  };

  const handleStartVoiceForm = () => {
    soundFx.playClick();
    setView('form');
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    if (voiceGuidanceEnabled) {
      const welcome =
        currentLanguage === 'hi-IN'
          ? 'वाणी में आपका स्वागत है। माइक बटन दबाएं और अपनी जानकारी बोलें।'
          : currentLanguage === 'as-IN'
          ? 'বাণীত আপোনাক স্বাগতম। মাইক বুটামত ক্লিক কৰি আপোনাৰ তথ্য কওক।'
          : 'Welcome to Vaani. Click the microphone button and speak your details naturally.';
      voiceAssistant.speak(welcome, currentLanguage);
    }
  };

  const handleSelectSamplePhrase = (text: string) => {
    soundFx.playClick();
    setTranscript(text);
    setView('form');
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Process AI Extraction
  const handleProcessExtraction = async () => {
    if (!transcript.trim()) return;

    soundFx.playClick();
    setIsProcessingAi(true);
    setAiNotice(null);

    try {
      const result = await aiService.extract({
        transcript,
        formType: selectedFormId,
        language: currentLanguage,
        fields: currentFormDef.fields,
        userApiKey: userApiKey || undefined,
      });

      if (result.success && result.extracted) {
        soundFx.playAiSuccess();
        const { updatedStates, fieldsUpdatedCount, preservedManualCount } = mergeExtractedFields(
          fieldStates,
          result,
          currentFormDef.fields
        );

        setFieldStates(updatedStates);

        let noticeMsg = `Extracted and mapped ${fieldsUpdatedCount} field(s) automatically.`;
        if (preservedManualCount > 0) {
          noticeMsg += ` Preserved ${preservedManualCount} field(s) you edited manually.`;
        }
        if (result.is_fallback) {
          noticeMsg += ' (Running local pattern matcher. Configure GEMINI_API_KEY for full LLM extraction)';
        }

        setAiNotice({
          message: noticeMsg,
          model: result.model_used,
          isFallback: Boolean(result.is_fallback),
        });

        // Spoken audio feedback
        if (voiceGuidanceEnabled) {
          const speakMsg =
            currentLanguage === 'hi-IN'
              ? `हमने आपकी ${fieldsUpdatedCount} जानकारियां भर दी हैं। कृपया नीचे दिए गए फॉर्म की समीक्षा करें।`
              : currentLanguage === 'as-IN'
              ? `আমি আপোনাৰ ${fieldsUpdatedCount} টা তথ্য পূৰণ কৰিছোঁ। অনুগ্ৰহ কৰি পৰীক্ষা কৰক।`
              : `We found ${fieldsUpdatedCount} pieces of information. Please review them before continuing.`;
          voiceAssistant.speak(speakMsg, currentLanguage);
        }
      } else {
        setAiNotice({
          message: result.error || 'Could not extract information from speech transcript.',
          model: result.model_used,
          isFallback: true,
        });
      }
    } catch (err: any) {
      setAiNotice({
        message: err?.message || 'Error occurred during AI processing.',
        model: 'Error',
        isFallback: true,
      });
    } finally {
      setIsProcessingAi(false);
    }
  };

  // Field edit handler (preserves manual input)
  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldStates((prev) => ({
      ...prev,
      [fieldId]: {
        value,
        source: 'manual',
        isEdited: true,
        confidence: 'high',
        isUncertain: false,
      },
    }));
  };

  // Open Review Dialog
  const handleOpenReview = () => {
    soundFx.playClick();
    const rawValues: Record<string, any> = {};
    for (const [key, state] of Object.entries(fieldStates)) {
      rawValues[key] = state.value;
    }
    const valResult = validateForm(currentFormDef.fields, rawValues, currentLanguage);
    setValidationErrors(valResult.errors);
    setMissingFields(valResult.missingFields);

    if (valResult.missingFields.length > 0) {
      if (voiceGuidanceEnabled) {
        const firstMissing = currentFormDef.fields.find((f) => f.id === valResult.missingFields[0]);
        if (firstMissing) {
          voiceAssistant.speak(firstMissing.voicePrompt[currentLanguage], currentLanguage);
        }
      }
    }

    setIsReviewModalOpen(true);
  };

  // Final Form Submission
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    const rawValues: Record<string, any> = {};
    for (const [key, state] of Object.entries(fieldStates)) {
      rawValues[key] = state.value;
    }

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_type: selectedFormId,
          full_name: rawValues.full_name,
          age: rawValues.age,
          phone: rawValues.phone,
          email: rawValues.email,
          city: rawValues.city,
          state: rawValues.state,
          address: rawValues.address,
          preferred_language: rawValues.preferred_language,
          additional_details: rawValues.additional_details,
          fields_payload: rawValues,
        }),
      });

      const data = await response.json();

      if (data.success) {
        soundFx.playAiSuccess();
        const record: FormSubmissionRecord = {
          id: data.id || 'rec-' + Date.now(),
          reference_id: data.reference_id || `VN-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          form_type: selectedFormId,
          full_name: String(rawValues.full_name || ''),
          age: Number(rawValues.age || 0),
          phone: String(rawValues.phone || ''),
          email: rawValues.email ? String(rawValues.email) : undefined,
          city: String(rawValues.city || ''),
          state: String(rawValues.state || ''),
          address: rawValues.address ? String(rawValues.address) : undefined,
          preferred_language: String(rawValues.preferred_language || 'Hindi'),
          additional_details: rawValues.additional_details ? String(rawValues.additional_details) : undefined,
          fields_payload: rawValues,
          created_at: data.created_at || new Date().toISOString(),
          source: transcript ? 'web_voice' : 'web_manual',
        };

        setSubmissionRecord(record);
        setIsLocalMockSubmission(Boolean(data.is_local_mock));
        setIsReviewModalOpen(false);
        setView('success');

        if (voiceGuidanceEnabled) {
          const successSpoken =
            currentLanguage === 'hi-IN'
              ? 'आपका आवेदन सफलतापूर्वक जमा हो गया है। संदर्भ संख्या सुरक्षित रख लें।'
              : currentLanguage === 'as-IN'
              ? 'আপোনাৰ আবেদন সফলতাৰে জমা কৰা হৈছে।'
              : 'Your application has been submitted successfully. Please note your reference number.';
          voiceAssistant.speak(successSpoken, currentLanguage);
        }
      } else {
        alert(data.error || 'Failed to submit application');
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      alert('Network or server error during submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewForm = () => {
    soundFx.playClick();
    setFieldStates(initializeFieldStates(currentFormDef.fields));
    setTranscript('');
    setAiNotice(null);
    setSubmissionRecord(null);
    setView('form');
  };

  const filledCount = useMemo(() => {
    return Object.values(fieldStates).filter(
      (s) => s.value !== undefined && s.value !== null && String(s.value).trim() !== ''
    ).length;
  }, [fieldStates]);

  const formCompletionPercent = Math.round(
    (filledCount / currentFormDef.fields.length) * 100
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-indigo-600 selection:text-white">
      {/* Accessible Global Navbar */}
      <Navbar
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        voiceGuidanceEnabled={voiceGuidanceEnabled}
        onToggleVoiceGuidance={() => setVoiceGuidanceEnabled((v) => !v)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        fontSizeMode={fontSizeMode}
        onCycleFontSize={handleCycleFontSize}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNavigateHome={() => {
          soundFx.playClick();
          setView('landing');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* LANDING PAGE VIEW */}
        {view === 'landing' && (
          <Hero
            currentLanguage={currentLanguage}
            onStartForm={handleStartVoiceForm}
            onSelectSamplePhrase={handleSelectSamplePhrase}
          />
        )}

        {/* VOICE FORM WORKSPACE VIEW */}
        {view === 'form' && (
          <div ref={formTopRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* 4-Step Pipeline Header */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Form Automation Progress
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                  {formCompletionPercent}% Complete ({filledCount}/{currentFormDef.fields.length} fields)
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-6">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${formCompletionPercent}%` }}
                />
              </div>

              {/* Step Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${transcript ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <Mic className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="block font-black">1. Voice Audio</span>
                    <span className="text-[10px] text-slate-500">{transcript ? 'Captured' : 'Pending'}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${filledCount > 0 ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <Cpu className="w-4 h-4 text-violet-600 shrink-0" />
                  <div>
                    <span className="block font-black">2. Gemini AI</span>
                    <span className="text-[10px] text-slate-500">{filledCount > 0 ? `${filledCount} Mapped` : 'Awaiting'}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${missingFields.length === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-amber-50 border-amber-200 text-amber-900 font-bold'}`}>
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${missingFields.length === 0 ? 'text-emerald-600' : 'text-amber-600'}`} />
                  <div>
                    <span className="block font-black">3. Missing Check</span>
                    <span className="text-[10px]">{missingFields.length === 0 ? 'All Completed' : `${missingFields.length} Missing`}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl border bg-slate-50 border-slate-200 text-slate-600 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <span className="block font-black">4. Final Save</span>
                    <span className="text-[10px] text-slate-500">PostgreSQL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Form Switcher (3 Application Scheme Cards) */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Select Application Scheme
                </span>
                <span className="text-xs text-indigo-700 font-semibold">
                  3 Schemas Available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Scheme 1 */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedFormId('citizen_welfare');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedFormId === 'citizen_welfare'
                      ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-md card-glow-indigo'
                      : 'bg-white/80 hover:bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    {selectedFormId === 'citizen_welfare' && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-sm text-slate-900 leading-snug">
                    Citizen Welfare Scheme
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    Ration support, financial assistance, and rural housing grant.
                  </p>
                </button>

                {/* Scheme 2 */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedFormId('student_scholarship');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedFormId === 'student_scholarship'
                      ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-md card-glow-indigo'
                      : 'bg-white/80 hover:bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    {selectedFormId === 'student_scholarship' && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-sm text-slate-900 leading-snug">
                    Student Scholarship
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    Higher education tuition, vocational grants, and study books.
                  </p>
                </button>

                {/* Scheme 3 */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedFormId('universal_service');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedFormId === 'universal_service'
                      ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-md card-glow-indigo'
                      : 'bg-white/80 hover:bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    {selectedFormId === 'universal_service' && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-sm text-slate-900 leading-snug">
                    Universal Civic Grievance
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    Municipal utilities, water, electricity, and civic requests.
                  </p>
                </button>
              </div>
            </div>

            {/* STEP 1: Voice Input Card */}
            <div className="mb-8">
              <VoiceInputCard
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
                transcript={transcript}
                onTranscriptChange={setTranscript}
                onProcessExtraction={handleProcessExtraction}
                isProcessingAi={isProcessingAi}
                sampleTranscripts={currentFormDef.sampleTranscripts}
              />
            </div>

            {/* AI Extraction Result Notice Banner */}
            {aiNotice && (
              <div
                className={`p-4 sm:p-5 rounded-3xl border mb-8 flex items-start gap-3.5 text-xs sm:text-sm shadow-md transition-all ${
                  aiNotice.isFallback
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50/50 border-amber-300 text-amber-950'
                    : 'bg-gradient-to-r from-indigo-50 to-purple-50/50 border-indigo-200 text-indigo-950'
                }`}
              >
                <div className="p-2 rounded-xl bg-white shadow-xs shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="font-bold text-sm">
                      {aiNotice.isFallback ? 'Local Fallback Extractor Output:' : 'Google Gemini 1.5 Flash Output:'}
                    </strong>
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200/80 shadow-2xs">
                      {aiNotice.model}
                    </span>
                  </div>
                  <p className="mt-1.5 leading-relaxed">{aiNotice.message}</p>
                </div>
              </div>
            )}

            {/* STEP 2: Missing Fields Interactive Voice Assistant */}
            <div className="mb-8">
              <MissingFieldsBanner
                missingFields={missingFields}
                fields={currentFormDef.fields}
                currentLanguage={currentLanguage}
                onFieldFilled={handleFieldChange}
                filledCount={filledCount}
              />
            </div>

            {/* STEP 3: Auto-Mapped Form Fields Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      2
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Review & Correct Form Fields
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {filledCount} of {currentFormDef.fields.length} completed
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Every field below can be clicked and edited with keyboard or by clicking the mini microphone icon.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      if (voiceGuidanceEnabled) {
                        const summary =
                          currentLanguage === 'hi-IN'
                            ? `आपके फॉर्म में ${filledCount} जानकारियां भरी हैं, और ${missingFields.length} आवश्यक जानकारियां बाकी हैं।`
                            : `Your form has ${filledCount} fields filled and ${missingFields.length} required fields remaining.`;
                        voiceAssistant.speak(summary, currentLanguage);
                      }
                    }}
                    title="Speak form summary"
                    className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Read Summary</span>
                  </button>
                </div>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {currentFormDef.fields.map((field) => (
                  <div
                    key={field.id}
                    className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                  >
                    <FormFieldItem
                      field={field}
                      state={fieldStates[field.id] || { value: '', source: 'default', isEdited: false }}
                      currentLanguage={currentLanguage}
                      onChange={(val) => handleFieldChange(field.id, val)}
                      error={validationErrors[field.id]}
                      isMissing={missingFields.includes(field.id)}
                    />
                  </div>
                ))}
              </div>

              {/* Bottom Action Bar */}
              <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setFieldStates(initializeFieldStates(currentFormDef.fields));
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Form Fields</span>
                </button>

                <button
                  onClick={handleOpenReview}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white font-bold text-base shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <FileText className="w-5 h-5 text-indigo-200" />
                  <span>Review and Submit Application</span>
                  <ArrowRight className="w-5 h-5 text-indigo-200" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUBMISSION SUCCESS RECEIPT VIEW */}
        {view === 'success' && submissionRecord && (
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <SuccessReceipt
              submission={submissionRecord}
              formDef={currentFormDef}
              currentLanguage={currentLanguage}
              onNewForm={handleNewForm}
              isLocalMock={isLocalMockSubmission}
            />
          </div>
        )}
      </main>

      {/* Review & Explicit Confirmation Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        formDef={currentFormDef}
        fieldStates={fieldStates}
        currentLanguage={currentLanguage}
        onConfirmSubmit={handleConfirmSubmit}
        isSubmitting={isSubmitting}
        validationErrors={validationErrors}
      />

      {/* How It Works Guide Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        currentLanguage={currentLanguage}
      />

      {/* Settings & System Diagnostics Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userApiKey={userApiKey}
        onSaveUserApiKey={handleSaveUserApiKey}
        voiceGuidanceEnabled={voiceGuidanceEnabled}
        onToggleVoiceGuidance={() => setVoiceGuidanceEnabled((v) => !v)}
      />

      {/* Accessible Global Footer */}
      <Footer
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
    </div>
  );
}

export default App;
