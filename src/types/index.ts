export type Language = 'en-IN' | 'hi-IN' | 'as-IN';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  speechCode: string;
  isFullySupported: boolean;
  notes?: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en-IN',
    name: 'English (India)',
    nativeName: 'English (India)',
    speechCode: 'en-IN',
    isFullySupported: true,
  },
  {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechCode: 'hi-IN',
    isFullySupported: true,
  },
  {
    code: 'as-IN',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    speechCode: 'as-IN',
    isFullySupported: false,
    notes: 'Browser speech recognition engine support for Assamese varies. Manual input and text prompts are always available.',
  },
];

export type FormTypeId = 'citizen_welfare' | 'student_scholarship' | 'universal_service';

export interface LocalizedString {
  'en-IN': string;
  'hi-IN': string;
  'as-IN': string;
}

export interface FormFieldOption {
  value: string;
  label: LocalizedString;
}

export interface FormFieldDefinition {
  id: string;
  label: LocalizedString;
  placeholder: LocalizedString;
  voicePrompt: LocalizedString;
  helpText?: LocalizedString;
  type: 'text' | 'number' | 'tel' | 'email' | 'textarea' | 'select';
  required: boolean;
  options?: FormFieldOption[];
  min?: number;
  max?: number;
  pattern?: string;
}

export interface FormTypeDefinition {
  id: FormTypeId;
  title: LocalizedString;
  description: LocalizedString;
  badge: LocalizedString;
  fields: FormFieldDefinition[];
  sampleTranscripts: {
    'en-IN': string;
    'hi-IN': string;
    'as-IN': string;
  };
}

export type FieldSource = 'ai' | 'manual' | 'default';
export type FieldConfidence = 'high' | 'medium' | 'low';

export interface FieldState {
  value: string | number;
  source: FieldSource;
  confidence?: FieldConfidence;
  isEdited: boolean;
  isUncertain?: boolean;
  error?: string;
}

export interface ExtractionResponse {
  success: boolean;
  extracted: Record<string, any>;
  uncertain_fields: string[];
  missing_fields: string[];
  summary?: string;
  model_used: string;
  is_fallback?: boolean;
  error?: string;
}

export interface FormSubmissionRecord {
  id: string;
  reference_id: string;
  form_type: FormTypeId;
  full_name: string;
  age: number;
  phone: string;
  email?: string;
  city: string;
  state: string;
  address?: string;
  preferred_language: string;
  additional_details?: string;
  fields_payload: Record<string, any>;
  created_at: string;
  source: 'web_voice' | 'web_manual';
}

export interface SubmissionResponse {
  success: boolean;
  reference_id?: string;
  id?: string;
  message: string;
  created_at?: string;
  is_local_mock?: boolean;
}
