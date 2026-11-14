// Web Audio API Paper Tearing Synthesizer with Instant Multi-Gesture Activation
class PaperTearAudioPlayer {
  private ctx: AudioContext | null = null;
  private lastPlayTime = 0;
  private isUnlocked = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.resume();
      };
      ['pointerdown', 'mousedown', 'touchstart', 'wheel', 'scroll', 'keydown'].forEach((evt) => {
        window.addEventListener(evt, unlock, { passive: true });
      });
    }
  }

  public resume() {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.isUnlocked = true;
    } catch {
      // AudioContext resume catch
    }
  }

  public playTearGrain(intensity: number = 1.0) {
    const now = performance.now();
    // Allow rapid micro-crackles every 28ms for realistic continuous paper fiber rip
    if (now - this.lastPlayTime < 28) return;
    this.lastPlayTime = now;

    try {
      this.resume();
      if (!this.ctx || this.ctx.state !== 'running') return;

      const duration = 0.07 + Math.random() * 0.06;
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
        const snap = Math.random() > 0.88 ? (Math.random() * 2 - 1) * 3.5 : 0;
        data[i] = (pink * 2.8 + snap) * (1 - i / bufferSize);
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Bandpass Filter matching paper tear resonance (1000Hz - 2900Hz)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1400 + Math.random() * 800;
      filter.Q.value = 2.0;

      // Gain Envelope with boosted audible presence
      const gainNode = this.ctx.createGain();
      const vol = Math.min(0.85, 0.45 * intensity);
      gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      noiseSource.start();
      noiseSource.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio policy catch
    }
  }
}

export const paperAudio = new PaperTearAudioPlayer();
