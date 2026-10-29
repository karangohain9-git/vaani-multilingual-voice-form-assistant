import type { Language } from '../types';

export interface SpeechAdvisory {
  type: 'script-mismatch' | 'unsupported-language' | 'info';
  message: string;
  detectedScript?: 'Latin' | 'Devanagari' | 'Other';
}

export interface SpeechRecognitionCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean, advisory?: SpeechAdvisory) => void;
  onError?: (errorMessage: string, errorCode: string) => void;
  onEnd?: () => void;
}

export interface SpeechEngineStatus {
  isSupported: boolean;
  isAssameseSupported: boolean;
  engineName: string;
}

// Declare SpeechRecognition interfaces for TypeScript
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private currentLanguage: Language = 'hi-IN';
  private callbacks: SpeechRecognitionCallbacks = {};
  private finalTranscriptAccumulated = '';
  private sessionGeneration = 0;

  constructor() {
    this.initRecognition();
  }

  /**
   * Development-only diagnostic logger.
   * Logs language configurations, session generation, and script flags without leaking personal form data.
   */
  private logDiagnostic(event: string, details: Record<string, any>) {
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.log(`[Vaani Speech Diagnostic: ${event}]`, details);
    }
  }

  public static checkSupport(): SpeechEngineStatus {
    const isSupported =
      typeof window !== 'undefined' &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition);

    return {
      isSupported,
      // Desktop browsers lack universal native Assamese acoustic models on standard Web Speech API.
      // We explicitly inform the user so they can utilize manual typing fallback if needed.
      isAssameseSupported: false,
      engineName: isSupported
        ? window.webkitSpeechRecognition
          ? 'Webkit Speech Recognition'
          : 'Standard Web Speech'
        : 'Unsupported',
    };
  }

  private initRecognition(session?: number) {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      return;
    }

    try {
      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = this.currentLanguage;

      const activeSession = session ?? this.sessionGeneration;

      rec.onstart = () => {
        if (activeSession !== this.sessionGeneration) return;
        this.isListening = true;
        this.logDiagnostic('onstart', {
          currentLanguage: this.currentLanguage,
          activeSession,
          recLang: rec.lang,
        });
        this.callbacks.onStart?.();
      };

      rec.onresult = (event: any) => {
        if (activeSession !== this.sessionGeneration) return;
        let interimTranscript = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            currentFinal += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        if (currentFinal) {
          this.finalTranscriptAccumulated += (this.finalTranscriptAccumulated ? ' ' : '') + currentFinal.trim();
        }

        const fullOutput = (
          this.finalTranscriptAccumulated + (interimTranscript ? ' ' + interimTranscript : '')
        ).trim();

        // Check for script mismatch advisory when currentLanguage is Assamese (as-IN)
        let advisory: SpeechAdvisory | undefined;
        let detectedLatin = false;
        let detectedDevanagari = false;
        let detectedAssamese = false;

        if (this.currentLanguage === 'as-IN' && fullOutput.length > 0) {
          // Assamese/Bengali letters: \u0984-\u09B9, \u09CE, \u09DC-\u09DF, \u09F0-\u09F1
          detectedAssamese = /[\u0984-\u09B9\u09CE\u09DC-\u09DF\u09F0-\u09F1]/.test(fullOutput);
          // Latin / English letters: a-z, A-Z
          detectedLatin = /[a-zA-Z]/.test(fullOutput);
          // Devanagari letters: \u0904-\u0939, \u0958-\u0961, \u0972-\u097F
          detectedDevanagari = /[\u0904-\u0939\u0958-\u0961\u0972-\u097F]/.test(fullOutput);

          // If the browser returned Latin / English script instead of Assamese
          if (!detectedAssamese && detectedLatin) {
            advisory = {
              type: 'script-mismatch',
              detectedScript: 'Latin',
              message:
                'The browser speech engine returned English text for your Assamese voice input. Desktop browser speech models for Assamese are limited on standard engines and typically fall back to English. You can use the recognized text as is or switch to Manual Text Mode to enter Assamese script directly.',
            };
          }
          // If the browser returned Devanagari / Hindi script instead of Assamese
          else if (!detectedAssamese && detectedDevanagari) {
            advisory = {
              type: 'script-mismatch',
              detectedScript: 'Devanagari',
              message:
                'The browser speech engine recognized Hindi-script text for your Assamese voice input. Desktop browser speech models for Assamese may vary. You can switch to Manual Text Mode to edit or type in Assamese directly.',
            };
          }
        }

        this.logDiagnostic('onresult', {
          currentLanguage: this.currentLanguage,
          activeSession,
          isFinal: !!currentFinal && !interimTranscript,
          snippetLength: fullOutput.length,
          detectedAssamese,
          detectedLatin,
          detectedDevanagari,
          advisoryScript: advisory?.detectedScript,
        });

        this.callbacks.onResult?.(fullOutput, !!currentFinal && !interimTranscript, advisory);
      };

      rec.onerror = (event: any) => {
        if (activeSession !== this.sessionGeneration) return;
        this.isListening = false;
        const error = event.error;
        let humanMessage = 'Speech recognition error occurred.';

        this.logDiagnostic('onerror', {
          error,
          currentLanguage: this.currentLanguage,
          activeSession,
        });

        switch (error) {
          case 'not-allowed':
          case 'permission-denied':
            humanMessage =
              'Microphone access was denied. Please allow microphone permissions in your browser address bar to use voice input.';
            break;
          case 'no-speech':
            humanMessage = 'No speech was detected. Please check your microphone volume and speak clearly.';
            break;
          case 'audio-capture':
            humanMessage = 'No microphone was found on this device or it is being used exclusively by another application.';
            break;
          case 'network':
            humanMessage =
              'The browser speech recognition cloud service could not be reached over the network. Google Chrome and Microsoft Edge stream audio to remote cloud speech servers to transcribe voice. Please check your internet connection, VPN, or firewall, click Retry, or switch to Manual Text Mode.';
            break;
          case 'service-not-allowed':
            humanMessage = 'The browser speech service is disabled or blocked on this network or browser profile.';
            break;
          case 'language-not-supported':
            humanMessage =
              this.currentLanguage === 'as-IN'
                ? 'Assamese (as-IN) speech recognition is not supported by your current browser engine. Please use Manual Text Mode to enter Assamese text directly, or select Hindi / English for voice input.'
                : `The selected language (${this.currentLanguage}) is not supported by your browser voice engine.`;
            break;
          case 'aborted':
            humanMessage = 'Voice input was stopped.';
            break;
          default:
            humanMessage = `Speech recognition error (${error}). Please try again or switch to Manual Text Mode.`;
        }

        this.callbacks.onError?.(humanMessage, error);
      };

      rec.onend = () => {
        if (activeSession !== this.sessionGeneration) return;
        this.isListening = false;
        this.logDiagnostic('onend', {
          currentLanguage: this.currentLanguage,
          activeSession,
        });
        this.callbacks.onEnd?.();
      };

      this.recognition = rec;
    } catch (e) {
      console.error('Failed to initialize SpeechRecognition:', e);
    }
  }

  public setLanguage(lang: Language) {
    const previousLanguage = this.currentLanguage;
    this.currentLanguage = lang;

    if (previousLanguage !== lang) {
      // If language changed while listening, stop previous session to avoid stale results
      if (this.isListening) {
        this.abort();
      }
      this.sessionGeneration++;
    }

    if (this.recognition) {
      // Explicitly configure requested language tag - never force Assamese to 'hi-IN'
      this.recognition.lang = lang;
    }

    this.logDiagnostic('setLanguage', {
      previousLanguage,
      requestedLanguage: lang,
      sessionGeneration: this.sessionGeneration,
      recognitionLang: this.recognition?.lang,
    });
  }

  public start(
    callbacks: SpeechRecognitionCallbacks,
    initialTranscript = ''
  ): { success: boolean; message?: string } {
    const status = SpeechRecognitionService.checkSupport();
    if (!status.isSupported) {
      return {
        success: false,
        message:
          'Your browser does not support the Web Speech API. Please use Google Chrome, Microsoft Edge, or use manual typing fallback.',
      };
    }

    // Invalidate any prior session
    this.sessionGeneration++;
    const currentSession = this.sessionGeneration;

    // Clean up previous recognition instance listeners
    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.abort();
      } catch (e) {
        // Ignore abort notes
      }
      this.recognition = null;
    }

    this.initRecognition(currentSession);

    if (!this.recognition) {
      return {
        success: false,
        message: 'Could not initialize speech recognition engine.',
      };
    }

    this.callbacks = callbacks;
    this.finalTranscriptAccumulated = initialTranscript;
    this.recognition.lang = this.currentLanguage;

    this.logDiagnostic('start', {
      currentLanguage: this.currentLanguage,
      sessionGeneration: currentSession,
      requestedLang: this.recognition.lang,
    });

    try {
      this.recognition.start();
      return { success: true };
    } catch (e: any) {
      this.isListening = false;
      console.warn('Speech recognition start note:', e);
      return {
        success: false,
        message: e?.message || 'Could not start speech recognition.',
      };
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
    }
    this.isListening = false;
  }

  public abort() {
    this.sessionGeneration++;
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        console.warn('Error aborting recognition:', e);
      }
    }
    this.isListening = false;
    this.finalTranscriptAccumulated = '';
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  public getRecognitionLang(): string | null {
    return this.recognition ? this.recognition.lang : null;
  }

  public getSessionGeneration(): number {
    return this.sessionGeneration;
  }

  public resetForTesting(): void {
    this.sessionGeneration = 0;
    this.isListening = false;
    this.finalTranscriptAccumulated = '';
    this.callbacks = {};
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {}
      this.recognition = null;
    }
  }
}

export const speechService = new SpeechRecognitionService();
