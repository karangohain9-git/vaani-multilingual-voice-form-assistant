import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SpeechRecognitionService } from './speechRecognition';
import type { SpeechAdvisory } from './speechRecognition';

class MockSpeechRecognition {
  lang: string = '';
  continuous: boolean = false;
  interimResults: boolean = false;
  maxAlternatives: number = 1;
  onstart: (() => void) | null = null;
  onresult: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onend: (() => void) | null = null;
  isStarted: boolean = false;
  isAborted: boolean = false;

  start() {
    this.isStarted = true;
    this.onstart?.();
  }

  stop() {
    this.isStarted = false;
    this.onend?.();
  }

  abort() {
    this.isStarted = false;
    this.isAborted = true;
    this.onend?.();
  }
}

describe('SpeechRecognitionService Language & Session Management', () => {
  let service: SpeechRecognitionService;
  let originalSpeechRecognition: any;
  let originalWebkitSpeechRecognition: any;

  beforeEach(() => {
    // Setup mock browser window Web Speech API
    originalSpeechRecognition = (globalThis as any).window?.SpeechRecognition;
    originalWebkitSpeechRecognition = (globalThis as any).window?.webkitSpeechRecognition;

    if (!(globalThis as any).window) {
      (globalThis as any).window = {};
    }

    (globalThis as any).window.SpeechRecognition = MockSpeechRecognition;
    (globalThis as any).window.webkitSpeechRecognition = MockSpeechRecognition;

    service = new SpeechRecognitionService();
  });

  afterEach(() => {
    service.resetForTesting();
    if (originalSpeechRecognition) {
      (globalThis as any).window.SpeechRecognition = originalSpeechRecognition;
    } else {
      delete (globalThis as any).window.SpeechRecognition;
    }
    if (originalWebkitSpeechRecognition) {
      (globalThis as any).window.webkitSpeechRecognition = originalWebkitSpeechRecognition;
    } else {
      delete (globalThis as any).window.webkitSpeechRecognition;
    }
  });

  describe('Language Configuration Requirements', () => {
    it('configures the intended recognition language as-IN when Assamese is selected', () => {
      service.setLanguage('as-IN');

      expect(service.getCurrentLanguage()).toBe('as-IN');
      expect(service.getRecognitionLang()).toBe('as-IN');
      // Must NOT be overridden to hi-IN
      expect(service.getRecognitionLang()).not.toBe('hi-IN');
    });

    it('switching from Hindi to Assamese does not leave the recognizer configured for Hindi', () => {
      // Step 1: Start in Hindi
      service.setLanguage('hi-IN');
      expect(service.getCurrentLanguage()).toBe('hi-IN');
      expect(service.getRecognitionLang()).toBe('hi-IN');

      // Step 2: Switch to Assamese
      service.setLanguage('as-IN');
      expect(service.getCurrentLanguage()).toBe('as-IN');
      expect(service.getRecognitionLang()).toBe('as-IN');
      expect(service.getRecognitionLang()).not.toBe('hi-IN');
    });

    it('switches cleanly between English, Hindi, and Assamese using the exact language setting', () => {
      service.setLanguage('en-IN');
      expect(service.getRecognitionLang()).toBe('en-IN');

      service.setLanguage('hi-IN');
      expect(service.getRecognitionLang()).toBe('hi-IN');

      service.setLanguage('as-IN');
      expect(service.getRecognitionLang()).toBe('as-IN');

      service.setLanguage('en-IN');
      expect(service.getRecognitionLang()).toBe('en-IN');
    });
  });

  describe('Session Lifecycle & Stale Callback Prevention', () => {
    it('stops previous session and increments session generation on language change while listening', () => {
      let isStarted = false;
      service.setLanguage('hi-IN');
      service.start({
        onStart: () => { isStarted = true; },
        onEnd: () => { isStarted = false; },
      });

      expect(isStarted).toBe(true);
      expect(service.getIsListening()).toBe(true);
      const initialGen = service.getSessionGeneration();

      // Change language while actively listening
      service.setLanguage('as-IN');

      // Previous session must be stopped and invalidated
      expect(service.getIsListening()).toBe(false);
      expect(service.getSessionGeneration()).toBeGreaterThan(initialGen);
      expect(service.getRecognitionLang()).toBe('as-IN');
    });

    it('prevents stale callbacks from previous recognition session from delivering results after language change', () => {
      let receivedHindiTranscript = '';
      let receivedAssameseTranscript = '';

      // Start Hindi session
      service.setLanguage('hi-IN');
      service.start({
        onResult: (text) => { receivedHindiTranscript = text; },
      });

      // Grab reference to the active internal mock recognition instance for session 1
      const staleRecognitionInstance = (service as any).recognition;

      // User changes language to Assamese and starts new session
      service.setLanguage('as-IN');
      service.start({
        onResult: (text) => { receivedAssameseTranscript = text; },
      });

      // Simulate late/stale onresult event firing from the old Hindi recognition instance
      staleRecognitionInstance.onresult?.({
        resultIndex: 0,
        results: [
          [{ transcript: 'मेरा नाम राहुल शर्मा है' }],
        ],
      });

      // The stale callback must NOT deliver text to the new Assamese session or the old callback
      expect(receivedAssameseTranscript).toBe('');
      expect(receivedHindiTranscript).toBe('');
    });
  });

  describe('Honest Browser Compatibility & Script Mismatch Handling', () => {
    it('flags an advisory when browser speech engine returns English/Latin text for Assamese input', () => {
      let deliveredTranscript = '';
      let deliveredAdvisory: SpeechAdvisory | undefined;

      service.setLanguage('as-IN');
      service.start({
        onResult: (text, _final, advisory) => {
          deliveredTranscript = text;
          deliveredAdvisory = advisory;
        },
      });

      const recognitionInstance = (service as any).recognition;

      // Browser falls back to English acoustic model and returns Latin text for Assamese speech
      recognitionInstance.onresult?.({
        resultIndex: 0,
        results: [
          [{ transcript: 'Rahul Sharma' }],
        ],
      });

      // Preserves original raw recognized text without fabrication or replacement
      expect(deliveredTranscript).toBe('Rahul Sharma');
      // Advises the user honestly that English text was returned by browser engine
      expect(deliveredAdvisory).toBeDefined();
      expect(deliveredAdvisory?.type).toBe('script-mismatch');
      expect(deliveredAdvisory?.detectedScript).toBe('Latin');
      expect(deliveredAdvisory?.message).toContain('returned English text for your Assamese voice input');
      expect(deliveredAdvisory?.message).toContain('Manual Text Mode');
    });

    it('flags an advisory when browser speech engine returns Hindi-script text for Assamese input', () => {
      let deliveredTranscript = '';
      let deliveredAdvisory: SpeechAdvisory | undefined;

      service.setLanguage('as-IN');
      service.start({
        onResult: (text, _final, advisory) => {
          deliveredTranscript = text;
          deliveredAdvisory = advisory;
        },
      });

      const recognitionInstance = (service as any).recognition;

      // Browser returns Hindi Devanagari text for Assamese speech
      recognitionInstance.onresult?.({
        resultIndex: 0,
        results: [
          [{ transcript: 'मेरा नाम राहुल' }],
        ],
      });

      // Preserves original recognized text without fabrication
      expect(deliveredTranscript).toBe('मेरा नाम राहुल');
      // Advises the user honestly about browser speech limitations
      expect(deliveredAdvisory).toBeDefined();
      expect(deliveredAdvisory?.type).toBe('script-mismatch');
      expect(deliveredAdvisory?.message).toContain('Hindi-script text for your Assamese voice input');
      expect(deliveredAdvisory?.message).toContain('Manual Text Mode');
    });

    it('does not flag script mismatch when authentic Assamese script text is received', () => {
      let deliveredAdvisory: SpeechAdvisory | undefined;

      service.setLanguage('as-IN');
      service.start({
        onResult: (_text, _final, advisory) => {
          deliveredAdvisory = advisory;
        },
      });

      const recognitionInstance = (service as any).recognition;

      // Browser returns correct Assamese text
      recognitionInstance.onresult?.({
        resultIndex: 0,
        results: [
          [{ transcript: 'মোৰ নাম ৰাহুল শৰ্মা' }],
        ],
      });

      expect(deliveredAdvisory).toBeUndefined();
    });

    it('reports clear user-friendly error when browser engine does not support as-IN', () => {
      let deliveredError = '';
      let deliveredCode = '';

      service.setLanguage('as-IN');
      service.start({
        onError: (message, code) => {
          deliveredError = message;
          deliveredCode = code;
        },
      });

      const recognitionInstance = (service as any).recognition;

      // Browser fires language-not-supported error
      recognitionInstance.onerror?.({ error: 'language-not-supported' });

      expect(deliveredCode).toBe('language-not-supported');
      expect(deliveredError).toContain('Assamese (as-IN) speech recognition is not supported');
      expect(deliveredError).toContain('Manual Text Mode');
    });
  });

  describe('Preservation of English and Hindi Behavior', () => {
    it('normal Hindi speech recognition works without mismatch advisory', () => {
      let deliveredTranscript = '';
      let deliveredAdvisory: SpeechAdvisory | undefined;

      service.setLanguage('hi-IN');
      service.start({
        onResult: (text, _final, advisory) => {
          deliveredTranscript = text;
          deliveredAdvisory = advisory;
        },
      });

      const recognitionInstance = (service as any).recognition;
      recognitionInstance.onresult?.({
        resultIndex: 0,
        results: [
          [{ transcript: 'मेरा नाम राहुल शर्मा है' }],
        ],
      });

      expect(deliveredTranscript).toBe('मेरा नाम राहुल शर्मा है');
      expect(deliveredAdvisory).toBeUndefined();
    });

    it('normal English speech recognition works without mismatch advisory', () => {
      let deliveredTranscript = '';
      let deliveredAdvisory: SpeechAdvisory | undefined;

      service.setLanguage('en-IN');
      service.start({
        onResult: (text, _final, advisory) => {
          deliveredTranscript = text;
          deliveredAdvisory = advisory;
        },
      });

      const recognitionInstance = (service as any).recognition;
      recognitionInstance.onresult?.({
        resultIndex: 0,
        results: [
          [{ transcript: 'My name is Rahul Sharma' }],
        ],
      });

      expect(deliveredTranscript).toBe('My name is Rahul Sharma');
      expect(deliveredAdvisory).toBeUndefined();
    });
  });

  describe('Speech Recognition Error Handling & Resilience', () => {
    it('handles network error with clear explanation of browser cloud speech service requirement', () => {
      let deliveredError = '';
      let deliveredCode = '';

      service.setLanguage('hi-IN');
      service.start({
        onError: (message, code) => {
          deliveredError = message;
          deliveredCode = code;
        },
      });

      expect(service.getIsListening()).toBe(true);

      const recognitionInstance = (service as any).recognition;
      // Simulate browser native network error (e.g., Google speech servers unreachable)
      recognitionInstance.onerror?.({ error: 'network' });

      expect(deliveredCode).toBe('network');
      expect(deliveredError).toContain('cloud service could not be reached over the network');
      expect(deliveredError).toContain('Manual Text Mode');
      expect(service.getIsListening()).toBe(false);
      // Selected language must be preserved
      expect(service.getCurrentLanguage()).toBe('hi-IN');
    });

    it('handles not-allowed permission error with clear instruction for browser address bar', () => {
      let deliveredError = '';
      let deliveredCode = '';

      service.setLanguage('en-IN');
      service.start({
        onError: (message, code) => {
          deliveredError = message;
          deliveredCode = code;
        },
      });

      const recognitionInstance = (service as any).recognition;
      recognitionInstance.onerror?.({ error: 'not-allowed' });

      expect(deliveredCode).toBe('not-allowed');
      expect(deliveredError).toContain('Microphone access was denied');
      expect(deliveredError).toContain('browser address bar');
      expect(service.getIsListening()).toBe(false);
    });

    it('handles audio-capture hardware error with clear guidance', () => {
      let deliveredError = '';
      let deliveredCode = '';

      service.start({
        onError: (message, code) => {
          deliveredError = message;
          deliveredCode = code;
        },
      });

      const recognitionInstance = (service as any).recognition;
      recognitionInstance.onerror?.({ error: 'audio-capture' });

      expect(deliveredCode).toBe('audio-capture');
      expect(deliveredError).toContain('No microphone was found');
      expect(service.getIsListening()).toBe(false);
    });

    it('supports clean retry after an error occurs without duplicate sessions', () => {
      let errorOccurred = false;
      let secondSessionStarted = false;

      // Session 1 encounters network error
      service.setLanguage('hi-IN');
      service.start({
        onError: () => { errorOccurred = true; },
      });

      const session1 = (service as any).recognition;
      session1.onerror?.({ error: 'network' });
      session1.onend?.();

      expect(errorOccurred).toBe(true);
      expect(service.getIsListening()).toBe(false);

      // Session 2: User retries microphone
      const result = service.start({
        onStart: () => { secondSessionStarted = true; },
      });

      expect(result.success).toBe(true);
      expect(secondSessionStarted).toBe(true);
      expect(service.getIsListening()).toBe(true);
      expect(service.getCurrentLanguage()).toBe('hi-IN');
    });
  });
});
