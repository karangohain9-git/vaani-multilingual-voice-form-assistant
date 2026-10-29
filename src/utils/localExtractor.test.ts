import { describe, it, expect } from 'vitest';
import { heuristicExtract, normalizeIndicDigits } from './localExtractor';

describe('Local Rule-Based Extractor Tests', () => {
  const sampleFields = [
    { id: 'full_name', label: 'Full Name', type: 'text', required: true },
    { id: 'age', label: 'Age', type: 'number', required: true },
    { id: 'phone', label: 'Phone', type: 'tel', required: true },
    { id: 'email', label: 'Email', type: 'email', required: false },
    { id: 'city', label: 'City', type: 'text', required: true },
    { id: 'state', label: 'State', type: 'text', required: true },
    { id: 'address', label: 'Address', type: 'textarea', required: true },
  ];

  it('correctly extracts from the user transcript: i am rahul sharma i am 24 years old and live in guwahati phone number 9101096356', () => {
    const transcript =
      'i am rahul sharma i am 24 years old and live in guwahati phone number 9101096356';

    const result = heuristicExtract(transcript, sampleFields);

    expect(result.extracted.full_name).toBe('Rahul Sharma');
    expect(result.extracted.age).toBe(24);
    expect(result.extracted.phone).toBe('9101096356');
    expect(result.extracted.city).toBe('Guwahati');
    expect(result.extracted.state).toBe('Assam');
    expect(result.extracted.preferred_language).toBe('English');

    // Required fields that were NOT mentioned in the transcript should be in missing_fields
    expect(result.missing_fields).toContain('address');
    expect(result.missing_fields).not.toContain('full_name');
    expect(result.missing_fields).not.toContain('age');
    expect(result.missing_fields).not.toContain('phone');
    expect(result.missing_fields).not.toContain('city');
    expect(result.missing_fields).not.toContain('state');
  });

  it('extracts English transcript with +91 phone, email, and address', () => {
    const englishTranscript =
      'My name is Rahul Sharma. I am 24 years old. Phone is +91 9876543210. Email rahul@example.com. I live in Guwahati, Assam at House number 42, Zoo Road.';

    const result = heuristicExtract(englishTranscript, sampleFields);

    expect(result.extracted.full_name).toBe('Rahul Sharma');
    expect(result.extracted.age).toBe(24);
    expect(result.extracted.phone).toBe('9876543210');
    expect(result.extracted.email).toBe('rahul@example.com');
    expect(result.extracted.city).toBe('Guwahati');
    expect(result.extracted.state).toBe('Assam');
    expect(result.extracted.address).toContain('Zoo Road');
    expect(result.extracted.preferred_language).toBe('English');
    expect(result.missing_fields).toHaveLength(0);
  });

  it('extracts Hindi speech transcript', () => {
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

  it('extracts Assamese speech transcript with Indic numerals', () => {
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

  it('handles spoken email format (e.g., rahul dot sharma at gmail dot com)', () => {
    const transcript =
      'My name is Rahul Sharma. Email is rahul dot sharma at gmail dot com. Phone 9876543210.';

    const result = heuristicExtract(transcript, sampleFields);
    expect(result.extracted.email).toBe('rahul.sharma@gmail.com');
  });

  it('normalizes Eastern Indic and Devanagari numerals to standard digits', () => {
    expect(normalizeIndicDigits('২৪ বছৰ')).toBe('24 বছৰ');
    expect(normalizeIndicDigits('२४ साल')).toBe('24 साल');
    expect(normalizeIndicDigits('৯৮৭৬৫৪৩২১০')).toBe('9876543210');
    expect(normalizeIndicDigits('९८७६५४३२१०')).toBe('9876543210');
  });

  it('handles empty transcript gracefully', () => {
    const result = heuristicExtract('', sampleFields);
    expect(result.extracted).toEqual({});
    expect(result.missing_fields.length).toBeGreaterThan(0);
  });
});
