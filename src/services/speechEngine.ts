// Web Speech API Voice Synthesizer in Spanish
// Official FIE Fencing Referee voice profile
// Authoritative, crisp, 100% volume locked

class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private spanishVoice: SpeechSynthesisVoice | null = null;
  private availableSpanishVoices: SpeechSynthesisVoice[] = [];

  constructor() {
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
    return this.spanishVoice
      ? `${this.spanishVoice.name} (Árbitro FIE Masculino)`
      : 'Árbitro Oficial FIE (Masculino)';
  }

  /**
   * Speak command with official FIE referee pronunciation:
   * Crisp, authoritative, masculine cadence, 100% volume locked.
   * Strips out any "Allez" automatically.
   */
  public speak(
    text: string,
    rate: number = 1.15,
    pitch: number = 0.92,
    _volume: number = 1.0
  ) {
    if (!this.synth || !('SpeechSynthesisUtterance' in window)) return;

    try {
      this.synth.cancel();

      // Ensure "Allez" is never pronounced
      const cleaned = text
        .replace(/¡?allez!?/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleaned) return;

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = 'es-ES';
      utterance.pitch = pitch || 0.92; // Firm, authoritative masculine pitch
      utterance.rate = Math.max(0.85, Math.min(1.45, rate));
      utterance.volume = 1.0; // 100% volume locked

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
      console.warn('Speech synthesis error:', e);
    }
  }

  public testRefereeVoice(rate: number = 1.15) {
    this.speak('¡En guardia! ¡Marcha, fondo y a la guardia!', rate, 0.92, 1.0);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public isAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
}

export const speechEngine = new SpeechEngine();
