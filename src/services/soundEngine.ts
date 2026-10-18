// Web Audio API Synthesizer for Fencing Footwork
// 100% offline, zero network latency, immediate response on mobile devices
class SoundEngine {
  private ctx: AudioContext | null = null;
  private volume: number = 0.8;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public unlockAudio() {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  public playTone(freq: number, durationSeconds: number, type: OscillatorType = 'sine', decay: boolean = true) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(this.volume * 0.7, ctx.currentTime);
      if (decay) {
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSeconds);
      } else {
        gain.gain.setValueAtTime(this.volume * 0.7, ctx.currentTime + durationSeconds - 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSeconds);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + durationSeconds);
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  }

  // Countdown tick
  public playCountdownTick(isFinal: boolean = false) {
    if (isFinal) {
      this.playTone(880, 0.4, 'triangle'); // High A
    } else {
      this.playTone(440, 0.15, 'sine'); // Standard A
    }
  }

  // Fencing action beeps
  public playActionSound(soundCue: string) {
    const ctx = this.getContext();
    if (!ctx) return;

    switch (soundCue) {
      case 'beep-high-1':
      case 'advance':
        this.playTone(950, 0.12, 'sine');
        break;
      case 'beep-high-3':
      case 'double_advance':
        this.playTone(950, 0.08, 'sine');
        setTimeout(() => this.playTone(1100, 0.1, 'sine'), 100);
        break;
      case 'beep-high-6':
      case 'quick_advance':
        this.playTone(1200, 0.09, 'sine');
        break;
      case 'retreat':
      case 'low-linear-1':
        this.playTone(380, 0.15, 'sine');
        break;
      case 'double_retreat':
        this.playTone(380, 0.09, 'sine');
        setTimeout(() => this.playTone(320, 0.12, 'sine'), 100);
        break;
      case 'lunge':
      case 'beep-shreek-1':
        // Piercing athletic attack sound
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.22);
          gain.gain.setValueAtTime(this.volume * 0.6, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        } catch {
          this.playTone(1200, 0.25, 'triangle');
        }
        break;
      case 'recover':
        this.playTone(520, 0.16, 'sine');
        break;
      case 'beep-medium-2':
        this.playTone(650, 0.14, 'triangle');
        break;
      case 'piston':
      case 'balestra':
        // Percussive stomp/appel sound
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(240, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(this.volume * 0.9, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.14);
        } catch {
          this.playTone(220, 0.1, 'triangle');
        }
        break;
      case 'low-linear-reverse-1':
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(this.volume * 0.7, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        } catch {
          this.playTone(400, 0.15, 'sine');
        }
        break;
      case 'workout_complete':
        this.playFanfare();
        break;
      default:
        this.playTone(700, 0.12, 'sine');
        break;
    }
  }

  public playFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, High C
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, idx === notes.length - 1 ? 0.6 : 0.15, 'triangle');
      }, idx * 140);
    });
  }
}

export const soundEngine = new SoundEngine();
