import type { Language } from '../types';

export class VoiceAssistanceService {
  private isEnabled = true;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onSpeakingStateChange?: (speaking: boolean) => void;

  constructor() {
    this.loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public setSpeakingCallback(callback: (speaking: boolean) => void) {
    this.onSpeakingStateChange = callback;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  private pickVoice(lang: Language): SpeechSynthesisVoice | null {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }

    if (lang === 'hi-IN') {
      const hindiVoice = this.voices.find(
        (v) =>
          v.lang.toLowerCase().includes('hi') ||
          v.name.toLowerCase().includes('hindi') ||
          v.name.toLowerCase().includes('swara') ||
          v.name.toLowerCase().includes('madhur')
      );
      if (hindiVoice) return hindiVoice;
    }

    if (lang === 'as-IN') {
      const assameseVoice = this.voices.find(
        (v) =>
          v.lang.toLowerCase().includes('as') ||
          v.name.toLowerCase().includes('assamese')
      );
      if (assameseVoice) return assameseVoice;
    }

    if (lang === 'en-IN' || lang === 'as-IN') {
      const indianEnglish = this.voices.find(
        (v) =>
          v.lang.toLowerCase() === 'en-in' ||
          v.name.toLowerCase().includes('india') ||
          v.name.toLowerCase().includes('neerja') ||
          v.name.toLowerCase().includes('prabhat')
      );
      if (indianEnglish) return indianEnglish;

      const anyEnglish = this.voices.find((v) => v.lang.toLowerCase().startsWith('en'));
      if (anyEnglish) return anyEnglish;
    }

    // Default to first available or null
    return this.voices[0] || null;
  }

  public speak(
    text: string,
    lang: Language = 'hi-IN',
    onEnd?: () => void
  ): boolean {
    if (!this.isEnabled) return false;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;

    // Stop ongoing speech
    this.stop();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'as-IN' ? 'en-IN' : lang; // fallback for speech synthesizer
      utterance.rate = 0.95; // slightly slower for better accessibility & clarity
      utterance.pitch = 1.0;

      const voice = this.pickVoice(lang);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.onSpeakingStateChange?.(true);
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.onSpeakingStateChange?.(false);
        this.currentUtterance = null;
        onEnd?.();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        this.isSpeaking = false;
        this.onSpeakingStateChange?.(false);
        this.currentUtterance = null;
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      console.warn('Failed to speak text:', err);
      this.isSpeaking = false;
      this.onSpeakingStateChange?.(false);
      return false;
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Error cancelling speech synthesis:', e);
      }
    }
    this.isSpeaking = false;
    this.onSpeakingStateChange?.(false);
    this.currentUtterance = null;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance;
  }
}

export const voiceAssistant = new VoiceAssistanceService();
