import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AiExtractionService } from './aiExtraction';
import type { FormFieldDefinition } from '../types';

describe('AiExtractionService Flow & Client Fallback Tests', () => {
  const service = new AiExtractionService();

  const sampleFields: FormFieldDefinition[] = [
    {
      id: 'full_name',
      label: { 'en-IN': 'Full Name', 'hi-IN': 'पूरा नाम', 'as-IN': 'সম্পূৰ্ণ নাম' },
      placeholder: { 'en-IN': '', 'hi-IN': '', 'as-IN': '' },
      voicePrompt: { 'en-IN': '', 'hi-IN': '', 'as-IN': '' },
      type: 'text',
      required: true,
    },
    {
      id: 'age',
      label: { 'en-IN': 'Age', 'hi-IN': 'उम्र', 'as-IN': 'বয়স' },
      placeholder: { 'en-IN': '', 'hi-IN': '', 'as-IN': '' },
      voicePrompt: { 'en-IN': '', 'hi-IN': '', 'as-IN': '' },
      type: 'number',
      required: true,
    },
    {
      id: 'phone',
      label: { 'en-IN': 'Phone', 'hi-IN': 'फोन', 'as-IN': 'ফোন' },
      placeholder: { 'en-IN': '', 'hi-IN': '', 'as-IN': '' },
      voicePrompt: { 'en-IN': '', 'hi-IN': '', 'as-IN': '' },
      type: 'tel',
      required: true,
    },
    {
      id: 'city',
      label: { 'en-IN': 'City', 'hi-IN': 'शहर', 'as-IN': 'চহৰ' },
      placeholder: { 'en-IN': '', 'hi-IN': '', 'as-IN': '' },
      voicePrompt: { 'en-IN': '', 'hi-IN': '', 'as-IN': '' },
      type: 'text',
      required: true,
    },
    {
      id: 'state',
      label: { 'en-IN': 'State', 'hi-IN': 'राज्य', 'as-IN': 'ৰাজ্য' },
      placeholder: { 'en-IN': '', 'hi-IN': '', 'as-IN': '' },
      voicePrompt: { 'en-IN': '', 'hi-IN': '', 'as-IN': '' },
      type: 'text',
      required: true,
    },
    {
      id: 'address',
      label: { 'en-IN': 'Address', 'hi-IN': 'पता', 'as-IN': 'ঠিকনা' },
      placeholder: { 'en-IN': '', 'hi-IN': '', 'as-IN': '' },
      voicePrompt: { 'en-IN': '', 'hi-IN': '', 'as-IN': '' },
      type: 'textarea',
      required: true,
    },
  ];

  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('rejects empty transcript with user-friendly error', async () => {
    const res = await service.extract({
      transcript: '   ',
      formType: 'citizen_welfare',
      language: 'en-IN',
      fields: sampleFields,
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('Transcript is empty');
  });

  it('seamlessly falls back to client local extractor when /api/extract fetch throws Failed to fetch', async () => {
    // Simulate endpoint connection failure (e.g., offline or preview server without proxy)
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    const userTranscript =
      'i am rahul sharma i am 24 years old and live in guwahati phone number 9101096356';

    const res = await service.extract({
      transcript: userTranscript,
      formType: 'citizen_welfare',
      language: 'en-IN',
      fields: sampleFields,
    });

    expect(res.success).toBe(true);
    expect(res.is_fallback).toBe(true);
    expect(res.model_used).toContain('Local Rule-Based Extractor');

    // Extracted fields
    expect(res.extracted.full_name).toBe('Rahul Sharma');
    expect(res.extracted.age).toBe(24);
    expect(res.extracted.phone).toBe('9101096356');
    expect(res.extracted.city).toBe('Guwahati');
    expect(res.extracted.state).toBe('Assam');
    expect(res.extracted.preferred_language).toBe('English');

    // Missing fields should correctly list unmentioned required fields
    expect(res.missing_fields).toContain('address');
    expect(res.missing_fields).not.toContain('full_name');
    expect(res.missing_fields).not.toContain('age');
    expect(res.missing_fields).not.toContain('phone');
  });

  it('uses primary server response when /api/extract responds successfully', async () => {
    const mockApiResponse = {
      success: true,
      extracted: {
        full_name: 'Rahul Sharma',
        age: 24,
        phone: '9101096356',
        city: 'Guwahati',
        state: 'Assam',
      },
      uncertain_fields: [],
      missing_fields: ['address'],
      model_used: 'Google Gemini 1.5 Flash',
      is_fallback: false,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as any);

    const res = await service.extract({
      transcript: 'i am rahul sharma i am 24 years old and live in guwahati phone number 9101096356',
      formType: 'citizen_welfare',
      language: 'en-IN',
      fields: sampleFields,
    });

    expect(res.success).toBe(true);
    expect(res.is_fallback).toBe(false);
    expect(res.model_used).toBe('Google Gemini 1.5 Flash');
    expect(res.extracted.full_name).toBe('Rahul Sharma');
  });

  it('reports clear error when both AI endpoint and local rules find 0 recognizable fields', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    const unparseableTranscript = 'testing microphone one two three';

    const res = await service.extract({
      transcript: unparseableTranscript,
      formType: 'citizen_welfare',
      language: 'en-IN',
      fields: sampleFields,
    });

    expect(res.success).toBe(false);
    expect(res.extracted).toEqual({});
    expect(res.error).toContain('Could not identify required details in transcript');
  });
});
