import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

// Dual-Engine Speech Synthesizer:
// 1. Native Android / iOS: Uses @capacitor-community/text-to-speech with device speaker at 100% volume
// 2. Web Browser / PWA: Uses Web Speech API (window.speechSynthesis)
class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private spanishVoice: SpeechSynthesisVoice | null = null;
  private availableSpanishVoices: SpeechSynthesisVoice[] = [];
  private isNative: boolean = false;
  private isSpeakingNative: boolean = false;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (voices.length > 0) {
      this.availableSpanishVoices = voices.filter(
        (v) => v.lang.startsWith('es') || v.lang.includes('Spanish')
      );

      // Male referee voice identification keywords
      const maleKeywords = [
        'pablo',
        'jorge',
        'alvaro',
        'álvaro',
        'diego',
        'carlos',
        'manuel',
        'raul',
        'raúl',
        'david',
        'enrique',
        'male',
        'hombre',
        'masculin',
        'guy',
        'mateo',
        'miguel',
        'alberto',
        'es-es-x-eed#male',
        'es-es-x-eea#male',
        'es-es-x-eef#male',
      ];
      const femaleKeywords = [
        'female',
        'mujer',
        'monica',
        'mónica',
        'helena',
        'laura',
        'lucia',
        'lucía',
        'elena',
        'rosa',
        'conchita',
        'victoria',
        'carmen',
        'marta',
        'soledad',
        'zira',
        'sabina',
        'mia',
        'mía',
        'paulina',
        'penelope',
        'penélope',
        'francisca',
        'elvira',
      ];

      // Sort available Spanish voices giving top priority to masculine voices
      const sorted = [...this.availableSpanishVoices].sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aIsMale = maleKeywords.some((k) => aName.includes(k));
        const bIsMale = maleKeywords.some((k) => bName.includes(k));
        const aIsFemale = femaleKeywords.some((k) => aName.includes(k));
        const bIsFemale = femaleKeywords.some((k) => bName.includes(k));

        let aScore = 0;
        let bScore = 0;

        if (aIsMale) aScore += 100;
        if (bIsMale) bScore += 100;
        if (aIsFemale) aScore -= 100;
        if (bIsFemale) bScore -= 100;

        if (a.lang === 'es-ES') aScore += 40;
        if (b.lang === 'es-ES') bScore += 40;

        return bScore - aScore;
      });

      this.spanishVoice = sorted[0] || null;
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.availableSpanishVoices;
  }

  public getCurrentVoiceName(): string {
    if (this.isNative) {
      return 'Altavoz Nativo Android (TextToSpeech FIE)';
    }
    return this.spanishVoice
      ? `${this.spanishVoice.name} (Árbitro FIE Masculino)`
      : 'Árbitro Oficial FIE (Masculino)';
  }

  /**
   * Speak command with official FIE referee pronunciation:
   * Uses native Android/iOS Text-to-Speech plugin if running in compiled APK/native app,
   * with seamless fallback to Web Speech API in desktop/browser.
   */
  public async speak(
    text: string,
    rate: number = 1.15,
    pitch: number = 0.92,
    _volume: number = 1.0
  ): Promise<void> {
    // Ensure "Allez" is never pronounced
    const cleaned = text
      .replace(/ ?allez!?/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleaned) return;

    // 1. If running as compiled Android / iOS app via Capacitor:
    if (Capacitor.isNativePlatform()) {
      try {
        await TextToSpeech.stop().catch(() => {});
        this.isSpeakingNative = true;

        await TextToSpeech.speak({
          text: cleaned,
          lang: 'es-ES',
          rate: Math.max(0.85, Math.min(1.45, rate)),
          pitch: pitch || 0.92,
          volume: 1.0,
          category: 'ambient',
        });
        return;
      } catch (nativeErr) {
        console.warn('Native TextToSpeech failed, trying fallback:', nativeErr);
        // Retry with generic 'es' if 'es-ES' wasn't recognized by device locale
        try {
          await TextToSpeech.speak({
            text: cleaned,
            lang: 'es',
            rate: Math.max(0.85, Math.min(1.45, rate)),
            pitch: pitch || 0.92,
            volume: 1.0,
            category: 'ambient',
          });
          return;
        } catch (retryErr) {
          console.warn('Native TextToSpeech generic fallback failed:', retryErr);
        }
      } finally {
        this.isSpeakingNative = false;
      }
    }

    // 2. Web Speech API for Browser / PWA:
    this.speakWeb(cleaned, rate, pitch);
  }

  private speakWeb(cleaned: string, rate: number, pitch: number) {
    if (!this.synth || !('SpeechSynthesisUtterance' in window)) return;
    try {
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = 'es-ES';
      utterance.pitch = pitch || 0.92;
      utterance.rate = Math.max(0.85, Math.min(1.45, rate));
      utterance.volume = 1.0;

      if (this.spanishVoice) {
        utterance.voice = this.spanishVoice;
      } else {
        this.loadVoices();
        if (this.spanishVoice) {
          utterance.voice = this.spanishVoice;
        }
      }

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Web speech synthesis error:', e);
    }
  }

  public testRefereeVoice(rate: number = 1.15) {
    this.speak('¡En guardia! ¡Marcha, fondo y a la guardia!', rate, 0.92, 1.0);
  }

  public stop() {
    if (Capacitor.isNativePlatform()) {
      TextToSpeech.stop().catch(() => {});
    }
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public isAvailable(): boolean {
    if (Capacitor.isNativePlatform()) {
      return true;
    }
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
}

export const speechEngine = new SpeechEngine();
