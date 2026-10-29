import { describe, it, expect } from 'vitest';
import { PREVIEW_CONTENT } from './Hero';
import type { Language } from '../types';

describe('Hero Interactive Voice Automation Preview Localization', () => {
  const supportedLanguages: Language[] = ['en-IN', 'hi-IN', 'as-IN'];

  it('provides complete non-empty preview data for all supported languages', () => {
    for (const lang of supportedLanguages) {
      const content = PREVIEW_CONTENT[lang];
      expect(content, `Preview content for ${lang} must exist`).toBeDefined();

      // Verify all fields are present and non-empty strings
      expect(content.mainHeading.trim().length).toBeGreaterThan(0);
      expect(content.playBtnText.trim().length).toBeGreaterThan(0);
      expect(content.playingBtnText.trim().length).toBeGreaterThan(0);
      expect(content.resetBtnTitle.trim().length).toBeGreaterThan(0);
      expect(content.spokenCitizenVoice.trim().length).toBeGreaterThan(0);
      expect(content.languageBadge.trim().length).toBeGreaterThan(0);
      expect(content.samplePhrase.trim().length).toBeGreaterThan(0);
      expect(content.naturalSpeech.trim().length).toBeGreaterThan(0);
      expect(content.noJargon.trim().length).toBeGreaterThan(0);
      expect(content.aiExtractedHeading.trim().length).toBeGreaterThan(0);
      expect(content.validatedJsonBadge.trim().length).toBeGreaterThan(0);
      expect(content.applicantNameLabel.trim().length).toBeGreaterThan(0);
      expect(content.applicantNameValue.trim().length).toBeGreaterThan(0);
      expect(content.mobilePhoneLabel.trim().length).toBeGreaterThan(0);
      expect(content.mobilePhoneValue.trim().length).toBeGreaterThan(0);
      expect(content.phoneBadge.trim().length).toBeGreaterThan(0);
      expect(content.ageLabel.trim().length).toBeGreaterThan(0);
      expect(content.ageValue.trim().length).toBeGreaterThan(0);
      expect(content.locationLabel.trim().length).toBeGreaterThan(0);
      expect(content.locationValue.trim().length).toBeGreaterThan(0);
      expect(content.missingFieldLabel.trim().length).toBeGreaterThan(0);
      expect(content.missingFieldPrompt.trim().length).toBeGreaterThan(0);
    }
  });

  describe('Assamese (as-IN) Preview Localization', () => {
    const asPreview = PREVIEW_CONTENT['as-IN'];

    it('contains authentic Assamese sample spoken statement', () => {
      expect(asPreview.samplePhrase).toContain('মোৰ নাম ৰাহুল শৰ্মা');
      expect(asPreview.samplePhrase).toContain('মোৰ বয়স ২৪ বছৰ');
      expect(asPreview.samplePhrase).toContain('মোৰ ফোন নম্বৰ ৯৮৭৬৫৪৩২১০');
    });

    it('contains Assamese preview headings and badges', () => {
      expect(asPreview.mainHeading).toBe('ইণ্টাৰেক্টিভ ভয়েচ অটোমেচন পূৰ্বদৰ্শন');
      expect(asPreview.spokenCitizenVoice).toBe('নাগৰিকৰ কথিত কণ্ঠ');
      expect(asPreview.languageBadge).toBe('প্ৰাকৃতিক অসমীয়া');
      expect(asPreview.aiExtractedHeading).toBe('এআই দ্বাৰা নিষ্কাশিত আৰু সংলগ্ন');
      expect(asPreview.validatedJsonBadge).toBe('পৰীক্ষিত জেছন (JSON)');
    });

    it('contains Assamese field labels and extracted values', () => {
      expect(asPreview.applicantNameLabel).toBe('আবেদনকাৰীৰ নাম:');
      expect(asPreview.applicantNameValue).toBe('ৰাহুল শৰ্মা');
      expect(asPreview.mobilePhoneLabel).toBe('ম’বাইল ফোন:');
      expect(asPreview.mobilePhoneValue).toBe('৯৮৭৬৫৪৩২১০');
      expect(asPreview.ageLabel).toBe('বয়স:');
      expect(asPreview.ageValue).toBe('২৪ বছৰ');
      expect(asPreview.locationLabel).toBe('স্থান:');
      expect(asPreview.locationValue).toBe('গুৱাহাটী, অসম');
    });

    it('contains Assamese status badge and missing-field prompt', () => {
      expect(asPreview.phoneBadge).toBe('১০ টা অংক সঠিক');
      expect(asPreview.missingFieldLabel).toBe('অনুপস্থিত তথ্য চিনাক্তকৰণ:');
      expect(asPreview.missingFieldPrompt).toBe('ঠিকনাৰ বিষয়ে সোধা হৈছে');
    });

    it('contains Assamese interactive simulation buttons', () => {
      expect(asPreview.playBtnText).toBe('ইণ্টাৰেক্টিভ অনুকৰণ চলাওক');
      expect(asPreview.playingBtnText).toBe('ডেমো অডিঅ’ চলি আছে...');
      expect(asPreview.resetBtnTitle).toBe('পূৰ্বদৰ্শন পুনৰায় ঠিক কৰক');
    });
  });

  describe('Hindi (hi-IN) Preview Localization', () => {
    const hiPreview = PREVIEW_CONTENT['hi-IN'];

    it('contains valid Hindi sample spoken statement and headings', () => {
      expect(hiPreview.samplePhrase).toContain('मेरा नाम राहुल शर्मा है');
      expect(hiPreview.mainHeading).toBe('इंटरैक्टिव वॉयस ऑटोमेशन पूर्वावलोकन');
      expect(hiPreview.spokenCitizenVoice).toBe('नागरिक की मौखिक आवाज़');
      expect(hiPreview.languageBadge).toBe('प्राकृतिक हिन्दी');
      expect(hiPreview.aiExtractedHeading).toBe('एआई द्वारा निकाला और भरा गया');
    });

    it('correctly populates mobilePhoneLabel and mobilePhoneValue without missing keys', () => {
      expect(hiPreview.mobilePhoneLabel).toBe('मोबाइल फोन:');
      expect(hiPreview.mobilePhoneValue).toBe('9876543210');
      expect(hiPreview.phoneBadge).toBe('10 अंक मान्य');
      expect(hiPreview.applicantNameLabel).toBe('आवेदक का नाम:');
      expect(hiPreview.missingFieldLabel).toBe('छूटे हुए फ़ील्ड की पहचान:');
      expect(hiPreview.missingFieldPrompt).toBe('घर का पता पूछा गया');
    });
  });

  describe('English (en-IN) Preview Localization', () => {
    const enPreview = PREVIEW_CONTENT['en-IN'];

    it('contains standard English preview content', () => {
      expect(enPreview.samplePhrase).toContain('My name is Rahul Sharma');
      expect(enPreview.mainHeading).toBe('Interactive Voice Automation Preview');
      expect(enPreview.spokenCitizenVoice).toBe('Spoken Citizen Voice');
      expect(enPreview.languageBadge).toBe('Natural English');
      expect(enPreview.mobilePhoneLabel).toBe('Mobile Phone:');
      expect(enPreview.missingFieldLabel).toBe('Missing Field Detection:');
    });
  });

  describe('Repeated Language Switching Resilience', () => {
    it('switches preview immediately between en-IN, hi-IN, and as-IN without stale data', () => {
      const getPreview = (lang: Language) => PREVIEW_CONTENT[lang] || PREVIEW_CONTENT['en-IN'];

      // Initial English
      expect(getPreview('en-IN').languageBadge).toBe('Natural English');

      // Switch to Assamese
      expect(getPreview('as-IN').languageBadge).toBe('প্ৰাকৃতিক অসমীয়া');
      expect(getPreview('as-IN').samplePhrase).toContain('ৰাহুল শৰ্মা');

      // Switch to Hindi
      expect(getPreview('hi-IN').languageBadge).toBe('प्राकृतिक हिन्दी');
      expect(getPreview('hi-IN').samplePhrase).toContain('राहुल शर्मा');

      // Switch back to Assamese
      expect(getPreview('as-IN').languageBadge).toBe('প্ৰাকৃতিক অসমীয়া');
      expect(getPreview('as-IN').mainHeading).toBe('ইণ্টাৰেক্টিভ ভয়েচ অটোমেচন পূৰ্বদৰ্শন');
    });
  });
});
