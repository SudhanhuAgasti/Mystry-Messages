// Web Audio API Paper Tearing Synthesizer with User-Gesture Activation
class PaperTearAudioPlayer {
  private ctx: AudioContext | null = null;
  private lastPlayTime = 0;
  private unlocked = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.initContext();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        this.unlocked = true;
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('wheel', unlock);
        window.removeEventListener('scroll', unlock);
      };
      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
      window.addEventListener('wheel', unlock, { passive: true });
      window.addEventListener('scroll', unlock, { passive: true });
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  public playTearGrain(intensity: number = 1.0) {
    const now = performance.now();
    if (now - this.lastPlayTime < 50) return;
    this.lastPlayTime = now;

    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const duration = 0.08 + Math.random() * 0.06;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Realistic paper rip friction texture (burst of micro fiber fractures)
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.96 * b1 + white * 0.11;
        b2 = 0.86 * b2 + white * 0.25;
        const pink = b0 + b1 + b2 + white * 0.2;
        const snap = Math.random() > 0.92 ? (Math.random() * 2 - 1) * 2.2 : 0;
        data[i] = (pink * 2.5 + snap) * (1 - i / bufferSize);
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Bandpass Filter matching paper tear resonance (1200Hz - 2800Hz)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1600 + Math.random() * 600;
      filter.Q.value = 2.2;

      // Gain Envelope
      const gainNode = this.ctx.createGain();
      const vol = Math.min(0.5, 0.25 * intensity);
      gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      noiseSource.start();
      noiseSource.stop(this.ctx.currentTime + duration);
    } catch {
      // Browser audio policy fallback
    }
  }
}

export const paperAudio = new PaperTearAudioPlayer();
