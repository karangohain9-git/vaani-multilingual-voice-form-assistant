import type { FormFieldDefinition, ExtractionResponse, Language, FormTypeId } from '../types';
import { heuristicExtract } from '../utils/localExtractor';

export interface ExtractRequestPayload {
  transcript: string;
  formType: FormTypeId;
  language: Language;
  fields: FormFieldDefinition[];
  userApiKey?: string;
}

export class AiExtractionService {
  /**
   * Calls the secure server-side endpoint (/api/extract) to extract structured data
   * from speech transcripts using Google Gemini.
   * If the network fails, endpoint is unreachable, or returns an error,
   * it seamlessly falls back to the client-side local pattern recognition engine.
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

    const simplifiedFields = fields.map((f) => ({
      id: f.id,
      label: f.label['en-IN'],
      type: f.type,
      required: f.required,
      min: f.min,
      max: f.max,
      options: f.options?.map((o) => o.value),
    }));

    let serverError: string | null = null;

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
          fields: simplifiedFields,
        }),
      });

      if (response.ok) {
        const data: ExtractionResponse = await response.json();
        // If server responded with extracted fields, return directly
        if (data && data.extracted && Object.keys(data.extracted).length > 0) {
          return data;
        }

        // If server succeeded but extracted 0 fields, test if local rules find information
        const localSupplement = heuristicExtract(transcript, simplifiedFields, language);
        if (Object.keys(localSupplement.extracted).length > 0) {
          return {
            success: true,
            extracted: localSupplement.extracted,
            uncertain_fields: localSupplement.uncertain_fields,
            missing_fields: localSupplement.missing_fields,
            model_used: data.model_used || 'Local Rule-Based Extractor (Enhanced)',
            is_fallback: true,
            summary: localSupplement.summary,
          };
        }

        return data;
      } else {
        const errorData = await response.json().catch(() => ({}));
        serverError = errorData.error || `Server responded with status ${response.status}`;
      }
    } catch (err: any) {
      serverError = err?.message || 'Failed to connect to AI extraction service.';
      console.warn('Primary AI extraction endpoint unavailable, activating local fallback:', serverError);
    }

    // Independent client-side local fallback extraction
    const localResult = heuristicExtract(transcript, simplifiedFields, language);
    const extractedCount = Object.keys(localResult.extracted).length;

    if (extractedCount > 0) {
      return {
        success: true,
        extracted: localResult.extracted,
        uncertain_fields: localResult.uncertain_fields,
        missing_fields: localResult.missing_fields,
        model_used: 'Local Rule-Based Extractor (Client Fallback)',
        is_fallback: true,
        summary: `Extracted ${extractedCount} field(s) locally using pattern recognition. (AI service status: ${serverError || 'offline'}).`,
      };
    }

    // If local heuristic also found no recognizable fields, return meaningful error guidance
    return {
      success: false,
      extracted: {},
      uncertain_fields: [],
      missing_fields: fields.filter((f) => f.required).map((f) => f.id),
      model_used: 'Local Rule-Based Extractor',
      error: `Could not identify required details in transcript (${serverError ? `AI status: ${serverError}. ` : ''}Please speak or type clearly mentioning your full name, age, phone number, and location).`,
    };
  }
}

export const aiService = new AiExtractionService();
