import { describe, it, expect } from 'vitest';
import { heuristicExtract, handleSubmit } from './apiHandler.ts';

describe('Server API Handler Tests', () => {
  const sampleFields = [
    { id: 'full_name', label: 'Full Name', type: 'text', required: true },
    { id: 'age', label: 'Age', type: 'number', required: true },
    { id: 'phone', label: 'Phone', type: 'tel', required: true },
    { id: 'email', label: 'Email', type: 'email', required: false },
    { id: 'city', label: 'City', type: 'text', required: true },
    { id: 'state', label: 'State', type: 'text', required: true },
    { id: 'address', label: 'Address', type: 'textarea', required: true },
  ];

  it('heuristically extracts Hindi speech transcript', () => {
    const hindiTranscript =
      'मेरा नाम राहुल शर्मा है। मेरी उम्र 24 साल है। मेरा फोन नंबर 9876543210 है। मैं गुवाहाटी, असम में रहता हूँ।';

    const result = heuristicExtract(hindiTranscript, sampleFields);

    expect(result.extracted.full_name).toBe('राहुल शर्मा');
    expect(result.extracted.age).toBe(24);
    expect(result.extracted.phone).toBe('9876543210');
    expect(result.extracted.city).toBe('Guwahati');
    expect(result.extracted.state).toBe('Assam');
    expect(result.extracted.preferred_language).toBe('Hindi');
  });

  it('heuristically extracts English speech transcript with +91 phone', () => {
    const englishTranscript =
      'My name is Rahul Sharma. I am 24 years old. Phone is +91 9876543210. Email rahul@example.com. I live in Guwahati, Assam.';

    const result = heuristicExtract(englishTranscript, sampleFields);

    expect(result.extracted.full_name).toBe('Rahul Sharma');
    expect(result.extracted.age).toBe(24);
    expect(result.extracted.phone).toBe('9876543210');
    expect(result.extracted.email).toBe('rahul@example.com');
    expect(result.extracted.city).toBe('Guwahati');
    expect(result.extracted.state).toBe('Assam');
    expect(result.extracted.preferred_language).toBe('English');
  });

  it('heuristically extracts Assamese speech transcript with Indic numerals', () => {
    const assameseTranscript =
      'মোৰ নাম ৰাহুল শৰ্মা। মোৰ বয়স ২৪ বছৰ। মোৰ ফোন নম্বৰ ৯৮৭৬৫৪৩২১০। মই গুৱাহাটী, অসমত থাকোঁ।';

    const result = heuristicExtract(assameseTranscript, sampleFields);

    expect(result.extracted.full_name).toBe('ৰাহুল শৰ্মা');
    expect(result.extracted.age).toBe(24);
    expect(result.extracted.phone).toBe('9876543210');
    expect(result.extracted.city).toBe('Guwahati');
    expect(result.extracted.state).toBe('Assam');
    expect(result.extracted.preferred_language).toBe('Assamese');
  });

  it('detects missing required fields in transcript', () => {
    const partialTranscript = 'My name is Priya. Phone is 9435123456.';
    const result = heuristicExtract(partialTranscript, sampleFields);

    expect(result.missing_fields).toContain('age');
    expect(result.missing_fields).toContain('city');
    expect(result.missing_fields).toContain('address');
  });

  it('handleSubmit generates valid reference ID format', async () => {
    const res = await handleSubmit({
      form_type: 'citizen_welfare',
      full_name: 'Rahul Sharma',
      age: 24,
      phone: '9876543210',
      city: 'Guwahati',
      state: 'Assam',
    });

    expect(res.success).toBe(true);
    expect(res.reference_id).toMatch(/^VN-2026-[A-Z0-9]+$/);
  });
});
