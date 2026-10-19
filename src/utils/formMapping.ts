import type {
  FormFieldDefinition,
  FieldState,
  ExtractionResponse,
  Language,
} from '../types';
import { normalizeIndianPhoneNumber } from './validation';

export function initializeFieldStates(
  fields: FormFieldDefinition[],
  defaultValues: Record<string, any> = {}
): Record<string, FieldState> {
  const states: Record<string, FieldState> = {};
  for (const field of fields) {
    states[field.id] = {
      value: defaultValues[field.id] ?? '',
      source: 'default',
      isEdited: false,
      confidence: 'high',
      isUncertain: false,
    };
  }
  return states;
}

/**
 * Merges newly extracted AI information into current form fields.
 * CRITICAL RULE: Preserves fields that the user has already manually edited!
 */
export function mergeExtractedFields(
  currentStates: Record<string, FieldState>,
  extraction: ExtractionResponse,
  fields: FormFieldDefinition[]
): {
  updatedStates: Record<string, FieldState>;
  fieldsUpdatedCount: number;
  preservedManualCount: number;
} {
  const updated: Record<string, FieldState> = { ...currentStates };
  let fieldsUpdatedCount = 0;
  let preservedManualCount = 0;

  for (const field of fields) {
    const rawVal = extraction.extracted[field.id];
    const isUncertain = extraction.uncertain_fields?.includes(field.id);
    const existing = currentStates[field.id] || {
      value: '',
      source: 'default',
      isEdited: false,
    };

    // If user previously made a manual edit, preserve their work!
    if (existing.isEdited && existing.value !== '') {
      preservedManualCount++;
      continue;
    }

    if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') {
      let finalVal: string | number = rawVal;

      if (field.id === 'phone' || field.type === 'tel') {
        finalVal = normalizeIndianPhoneNumber(rawVal);
      } else if (field.id === 'age' || field.type === 'number') {
        const parsed = parseInt(String(rawVal), 10);
        finalVal = isNaN(parsed) ? rawVal : parsed;
      }

      updated[field.id] = {
        value: finalVal,
        source: 'ai',
        confidence: isUncertain ? 'low' : 'high',
        isUncertain,
        isEdited: false,
      };
      fieldsUpdatedCount++;
    }
  }

  return {
    updatedStates: updated,
    fieldsUpdatedCount,
    preservedManualCount,
  };
}

/**
 * Builds user-friendly voice assistance prompt for missing or invalid fields
 */
export function buildVoiceGuidancePrompt(
  missingFieldIds: string[],
  fields: FormFieldDefinition[],
  lang: Language = 'hi-IN'
): string {
  if (missingFieldIds.length === 0) {
    if (lang === 'hi-IN') {
      return 'आपकी सभी जानकारी प्राप्त हो गई है। कृपया फॉर्म की समीक्षा करें और पुष्टि करें।';
    }
    if (lang === 'as-IN') {
      return 'আপোনাৰ সকলো তথ্য লাভ কৰা হৈছে। অনুগ্ৰহ কৰি পৰীক্ষা কৰি জমা দিয়ক।';
    }
    return 'All required details are filled. Please review and confirm your submission.';
  }

  const firstMissingField = fields.find((f) => f.id === missingFieldIds[0]);
  if (!firstMissingField) return '';

  return firstMissingField.voicePrompt[lang];
}
