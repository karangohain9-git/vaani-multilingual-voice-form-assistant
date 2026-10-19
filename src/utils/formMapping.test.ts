import { describe, it, expect } from 'vitest';
import {
  initializeFieldStates,
  mergeExtractedFields,
  buildVoiceGuidancePrompt,
} from './formMapping';
import { FORM_SCHEMAS } from '../data/formSchemas';
import type { ExtractionResponse } from '../types';

describe('Form Mapping Utility Tests', () => {
  const fields = FORM_SCHEMAS.citizen_welfare.fields;

  it('initializes field states with empty defaults', () => {
    const states = initializeFieldStates(fields);
    expect(states.full_name.value).toBe('');
    expect(states.full_name.source).toBe('default');
    expect(states.full_name.isEdited).toBe(false);
  });

  it('merges extracted AI fields and normalizes phone and age', () => {
    const initial = initializeFieldStates(fields);
    const mockAiResponse: ExtractionResponse = {
      success: true,
      extracted: {
        full_name: 'Rahul Sharma',
        age: '24',
        phone: '+91 98765 43210',
        city: 'Guwahati',
        state: 'Assam',
      },
      uncertain_fields: ['city'],
      missing_fields: ['address'],
      model_used: 'Gemini 1.5 Flash',
    };

    const { updatedStates, fieldsUpdatedCount } = mergeExtractedFields(
      initial,
      mockAiResponse,
      fields
    );

    expect(fieldsUpdatedCount).toBe(5);
    expect(updatedStates.full_name.value).toBe('Rahul Sharma');
    expect(updatedStates.full_name.source).toBe('ai');
    expect(updatedStates.phone.value).toBe('9876543210');
    expect(updatedStates.age.value).toBe(24);
    expect(updatedStates.city.isUncertain).toBe(true);
    expect(updatedStates.city.confidence).toBe('low');
  });

  it('preserves fields that the user has manually edited', () => {
    const initial = initializeFieldStates(fields);
    // User typed a specific address manually
    initial.address = {
      value: 'Custom Manual Address 101',
      source: 'manual',
      isEdited: true,
      confidence: 'high',
    };

    const mockAiResponse: ExtractionResponse = {
      success: true,
      extracted: {
        address: 'Overwriting Address from AI',
        city: 'Guwahati',
      },
      uncertain_fields: [],
      missing_fields: [],
      model_used: 'Gemini 1.5 Flash',
    };

    const { updatedStates, preservedManualCount } = mergeExtractedFields(
      initial,
      mockAiResponse,
      fields
    );

    expect(preservedManualCount).toBe(1);
    expect(updatedStates.address.value).toBe('Custom Manual Address 101');
    expect(updatedStates.address.isEdited).toBe(true);
    expect(updatedStates.city.value).toBe('Guwahati');
  });

  it('builds localized voice guidance prompt for missing fields', () => {
    const promptHi = buildVoiceGuidancePrompt(['phone'], fields, 'hi-IN');
    expect(promptHi).toContain('मोबाइल नंबर');

    const promptEn = buildVoiceGuidancePrompt(['full_name'], fields, 'en-IN');
    expect(promptEn).toContain('full name');
  });
});
