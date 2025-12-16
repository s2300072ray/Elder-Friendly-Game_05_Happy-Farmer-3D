import { AUDIO_CONFIG } from '../gameConfig';

class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // We defer initialization until the first user interaction to comply with browser autoplay policies
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    // Resume context if unmuting, just in case
    if (!muted && this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Generic Synth Function
  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

    // Envelope for a softer "electronic" feel
    const time = this.ctx.currentTime + startTime;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol * AUDIO_CONFIG.SFX_VOLUME, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  // --- Specific SFX ---

  public playClick() {
    // Gentle high blip
    this.playTone(800, 'sine', 0.1, 0, 0.5);
  }

  public playUISelect() {
    this.playTone(400, 'triangle', 0.1, 0, 0.5);
  }

  public playGrow() {
    // Happy major arpeggio
    this.playTone(523.25, 'sine', 0.2, 0, 0.4); // C5
    this.playTone(659.25, 'sine', 0.2, 0.1, 0.4); // E5
    this.playTone(783.99, 'sine', 0.4, 0.2, 0.4); // G5
  }

  public playWeedClear() {
    // A quick "swish" or lower tone
    this.playTone(200, 'sawtooth', 0.1, 0, 0.3);
    this.playTone(150, 'sine', 0.2, 0.05, 0.5);
  }

  public playError() {
    // Low buzz
    this.playTone(150, 'sawtooth', 0.3, 0, 0.4);
    this.playTone(140, 'sawtooth', 0.3, 0.1, 0.4);
  }

  public playBearSpawn() {
    // Warning sound - two tones
    this.playTone(300, 'square', 0.3, 0, 0.2);
    this.playTone(250, 'square', 0.5, 0.3, 0.2);
  }

  public playSuccess() {
    // Higher pitched chime
    this.playTone(880, 'sine', 0.5, 0, 0.5);
    this.playTone(1100, 'sine', 1.0, 0.1, 0.3);
  }

  public playVictory() {
    // Major chord fanfare (C Major)
    this.playTone(523.25, 'triangle', 0.2, 0, 0.6); // C5
    this.playTone(659.25, 'triangle', 0.2, 0.15, 0.6); // E5
    this.playTone(783.99, 'triangle', 0.2, 0.3, 0.6); // G5
    this.playTone(1046.50, 'triangle', 0.8, 0.45, 0.6); // C6
  }
}

export const audioManager = new AudioManager();