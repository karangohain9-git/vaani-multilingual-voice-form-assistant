import type { FormFieldDefinition, ExtractionResponse, Language, FormTypeId } from '../types';

export interface ExtractRequestPayload {
  transcript: string;
  formType: FormTypeId;
  language: Language;
  fields: FormFieldDefinition[];
  userApiKey?: string;
}

export class AiExtractionService {
  /**
   * Calls the secure server-side endpoint (/api/extract or Supabase Edge Function)
   * to extract structured data from speech transcript using Google Gemini.
   */
  public async extract(payload: ExtractRequestPayload): Promise<ExtractionResponse> {
    const { transcript, formType, language, fields, userApiKey } = payload;

    if (!transcript || transcript.trim().length === 0) {
      return {
        success: false,
        extracted: {},
        uncertain_fields: [],
        missing_fields: fields.filter((f) => f.required).map((f) => f.id),
        model_used: 'None',
        error: 'Transcript is empty. Please speak or enter text first.',
      };
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (userApiKey) {
        headers['x-gemini-api-key'] = userApiKey;
      }

      const response = await fetch('/api/extract', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          transcript,
          formType,
          language,
          fields: fields.map((f) => ({
            id: f.id,
            label: f.label['en-IN'],
            type: f.type,
            required: f.required,
            min: f.min,
            max: f.max,
            options: f.options?.map((o) => o.value),
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data: ExtractionResponse = await response.json();
      return data;
    } catch (err: any) {
      console.error('AI Extraction endpoint error:', err);
      // Return safe fallback error structure
      return {
        success: false,
        extracted: {},
        uncertain_fields: [],
        missing_fields: fields.filter((f) => f.required).map((f) => f.id),
        model_used: 'Unavailable',
        error: err?.message || 'Failed to connect to AI extraction service.',
      };
    }
  }
}

export const aiService = new AiExtractionService();
