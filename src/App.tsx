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
import { speechService } from './services/speechRecognition';
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
    isError?: boolean;
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
      return true;
    }
    return true;
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

  // Sync Speech Recognition language and reset in-flight recognition on global language change
  useEffect(() => {
    speechService.setLanguage(currentLanguage);
  }, [currentLanguage]);

  // Sync Dark Mode theme class & attribute on root and body, and persist in localStorage
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

      if (result.success && result.extracted && Object.keys(result.extracted).length > 0) {
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
          isError: false,
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
          model: result.model_used || 'Notice',
          isFallback: false,
          isError: true,
        });
      }
    } catch (err: any) {
      setAiNotice({
        message: err?.message || 'Error occurred during AI processing.',
        model: 'Error',
        isFallback: false,
        isError: true,
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
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] antialiased selection:bg-[var(--accent-primary)] selection:text-white transition-colors duration-200">
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
            <div className="bg-[var(--surface-card)] rounded-3xl p-5 sm:p-6 shadow-sm border border-[var(--border-subtle)] mb-8 transition-colors duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">
                  Form Automation Progress
                </span>
                <span className="text-xs font-bold text-[var(--accent-primary)] bg-[#8B5CF6]/15 px-2.5 py-1 rounded-full border border-[#8B5CF6]/30">
                  {formCompletionPercent}% Complete ({filledCount}/{currentFormDef.fields.length} fields)
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full bg-[var(--surface-secondary)] rounded-full h-2.5 overflow-hidden mb-6">
                <div
                  className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${formCompletionPercent}%` }}
                />
              </div>

              {/* Step Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${transcript ? 'bg-[#8B5CF6]/15 border-[#8B5CF6]/40 text-[var(--text-primary)] font-bold' : 'bg-[var(--surface-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)]'}`}>
                  <Mic className={`w-4 h-4 shrink-0 ${transcript ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`} />
                  <div>
                    <span className="block font-black">1. Voice Audio</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">{transcript ? 'Captured' : 'Pending'}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${filledCount > 0 ? 'bg-[#8B5CF6]/15 border-[#8B5CF6]/40 text-[var(--text-primary)] font-bold' : 'bg-[var(--surface-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)]'}`}>
                  <Cpu className={`w-4 h-4 shrink-0 ${filledCount > 0 ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-secondary)]'}`} />
                  <div>
                    <span className="block font-black">2. Gemini AI</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">{filledCount > 0 ? `${filledCount} Mapped` : 'Awaiting'}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${missingFields.length === 0 ? 'bg-[#059669]/15 border-[#059669]/40 text-[var(--state-success)] font-bold' : 'bg-[#B45309]/15 border-[#B45309]/40 text-[var(--state-warning)] font-bold'}`}>
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${missingFields.length === 0 ? 'text-[var(--state-success)]' : 'text-[var(--state-warning)]'}`} />
                  <div>
                    <span className="block font-black">3. Missing Check</span>
                    <span className="text-[10px]">{missingFields.length === 0 ? 'All Completed' : `${missingFields.length} Missing`}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl border bg-[var(--surface-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                  <div>
                    <span className="block font-black">4. Final Save</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">PostgreSQL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Form Switcher (3 Application Scheme Cards) */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">
                  Select Application Scheme
                </span>
                <span className="text-xs text-[var(--accent-primary)] font-semibold">
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
                      ? 'bg-[var(--surface-secondary)] border-2 border-[var(--accent-primary)] shadow-sm'
                      : 'bg-[var(--surface-card)] hover:bg-[var(--surface-secondary)] border-[var(--border-subtle)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/15 text-[var(--accent-primary)] flex items-center justify-center font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    {selectedFormId === 'citizen_welfare' && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-[var(--accent-primary)] text-white px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-sm text-[var(--text-primary)] leading-snug">
                    Citizen Welfare Scheme
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-2">
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
                      ? 'bg-[var(--surface-secondary)] border-2 border-[var(--accent-primary)] shadow-sm'
                      : 'bg-[var(--surface-card)] hover:bg-[var(--surface-secondary)] border-[var(--border-subtle)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-[#0891B2]/15 text-[var(--accent-secondary)] flex items-center justify-center font-bold">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    {selectedFormId === 'student_scholarship' && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-[var(--accent-primary)] text-white px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-sm text-[var(--text-primary)] leading-snug">
                    Student Scholarship
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-2">
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
                      ? 'bg-[var(--surface-secondary)] border-2 border-[var(--accent-primary)] shadow-sm'
                      : 'bg-[var(--surface-card)] hover:bg-[var(--surface-secondary)] border-[var(--border-subtle)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-[#059669]/15 text-[var(--state-success)] flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    {selectedFormId === 'universal_service' && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-[var(--accent-primary)] text-white px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-sm text-[var(--text-primary)] leading-snug">
                    Universal Civic Grievance
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-2">
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
                  aiNotice.isError
                    ? 'bg-[var(--bg-error-card)] border-[var(--border-error)] text-[var(--state-error)]'
                    : aiNotice.isFallback
                    ? 'bg-[var(--surface-card)] border-[var(--state-warning)]/40 text-[var(--text-primary)]'
                    : 'bg-[var(--surface-card)] border-[var(--accent-primary)]/40 text-[var(--text-primary)]'
                }`}
              >
                <div className="p-2 rounded-xl bg-[var(--surface-secondary)] shadow-xs shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="font-bold text-sm text-[var(--text-primary)]">
                      {aiNotice.isError
                        ? 'Extraction Notice:'
                        : aiNotice.isFallback
                        ? 'Local Fallback Extractor Output:'
                        : 'Google Gemini 1.5 Flash Output:'}
                    </strong>
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-[var(--accent-primary)] shadow-2xs">
                      {aiNotice.model}
                    </span>
                  </div>
                  <p className="mt-1.5 leading-relaxed text-[var(--text-secondary)]">{aiNotice.message}</p>
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
            <div className="bg-[var(--surface-card)] rounded-3xl p-6 sm:p-8 shadow-sm border border-[var(--border-subtle)] transition-colors duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5 mb-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--accent-primary)] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      2
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                      Review & Correct Form Fields
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#059669]/15 text-[var(--state-success)] border border-[#059669]/30">
                      {filledCount} of {currentFormDef.fields.length} completed
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
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
                    className="px-3.5 py-2 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
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
              <div className="mt-10 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setFieldStates(initializeFieldStates(currentFormDef.fields));
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--state-error)] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Form Fields</span>
                </button>

                <button
                  onClick={handleOpenReview}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] via-purple-600 to-[var(--accent-primary-hover)] hover:from-[var(--accent-primary-hover)] hover:to-purple-800 text-white font-bold text-base shadow-xl shadow-purple-500/25 transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <FileText className="w-5 h-5 text-violet-200" />
                  <span>Review and Submit Application</span>
                  <ArrowRight className="w-5 h-5 text-violet-200" />
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
