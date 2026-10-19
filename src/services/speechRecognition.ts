import type { Language } from '../types';

export interface SpeechRecognitionCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
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

  constructor() {
    this.initRecognition();
  }

  public static checkSupport(): SpeechEngineStatus {
    const isSupported =
      typeof window !== 'undefined' &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition);

    return {
      isSupported,
      // Assamese (as-IN) is not universally indexed in standard Chromium Speech API
      // We explicitly inform the user of this limitation honestly.
      isAssameseSupported: false,
      engineName: isSupported
        ? window.webkitSpeechRecognition
          ? 'Webkit Speech Recognition'
          : 'Standard Web Speech'
        : 'Unsupported',
    };
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      return;
    }

    try {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.callbacks.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
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

        this.callbacks.onResult?.(fullOutput, !!currentFinal && !interimTranscript);
      };

      this.recognition.onerror = (event: any) => {
        const error = event.error;
        let humanMessage = 'Speech recognition error occurred.';

        switch (error) {
          case 'not-allowed':
          case 'permission-denied':
            humanMessage =
              'Microphone permission was denied. Please allow microphone access in your browser address bar to use voice input.';
            break;
          case 'no-speech':
            humanMessage = 'No speech was detected. Please speak clearly into your microphone.';
            break;
          case 'audio-capture':
            humanMessage = 'No microphone was found on this device or it is being used by another app.';
            break;
          case 'network':
            humanMessage = 'A network error occurred while communicating with the speech service.';
            break;
          case 'language-not-supported':
            humanMessage = `The selected language (${this.currentLanguage}) is not supported by your browser voice engine.`;
            break;
          case 'aborted':
            humanMessage = 'Voice input was stopped.';
            break;
          default:
            humanMessage = `Speech recognition error: ${error}`;
        }

        this.callbacks.onError?.(humanMessage, error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.callbacks.onEnd?.();
      };
    } catch (e) {
      console.error('Failed to initialize SpeechRecognition:', e);
    }
  }

  public setLanguage(lang: Language) {
    this.currentLanguage = lang;
    if (this.recognition) {
      // For Assamese, standard Chrome doesn't have an as-IN acoustic model, so fallback to hi-IN or en-IN
      if (lang === 'as-IN') {
        this.recognition.lang = 'hi-IN'; // closest phonetically if attempted, but UI warns
      } else {
        this.recognition.lang = lang;
      }
    }
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

    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      return {
        success: false,
        message: 'Could not initialize speech recognition engine.',
      };
    }

    this.callbacks = callbacks;
    this.finalTranscriptAccumulated = initialTranscript;
    this.setLanguage(this.currentLanguage);

    try {
      this.recognition.start();
      return { success: true };
    } catch (e: any) {
      // If already started or aborting
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
}

export const speechService = new SpeechRecognitionService();
