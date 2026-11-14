// Web Audio API Paper Tearing Synthesizer with Guaranteed Browser Unlock & Fallback
class PaperTearAudioPlayer {
  private ctx: AudioContext | null = null;
  private lastPlayTime = 0;
  private isUnlocked = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAndWarmup = () => {
        this.resumeContext();
      };
      // Listen to every possible user activity event across desktop & mobile
      const events = ['pointerdown', 'mousedown', 'touchstart', 'touchend', 'wheel', 'scroll', 'keydown'];
      events.forEach((evt) => {
        window.addEventListener(evt, unlockAndWarmup, { passive: true });
      });
    }
  }

  public resumeContext(): boolean {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx) {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        if (this.ctx.state === 'running') {
          this.isUnlocked = true;
          return true;
        }
      }
    } catch {
      // AudioContext catch
    }
    return false;
  }

  public playTearGrain(intensity: number = 1.0) {
    const now = performance.now();
    // Allow rapid granular crackles every 22ms for continuous tearing sensation
    if (now - this.lastPlayTime < 22) return;
    this.lastPlayTime = now;

    try {
      this.resumeContext();
      if (!this.ctx) return;

      // Even if suspended, resume immediately
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const duration = 0.08 + Math.random() * 0.07;
      const bufferSize = Math.max(256, Math.floor(this.ctx.sampleRate * duration));
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Realistic paper rip friction texture (burst of micro fiber fractures)
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.96 * b1 + white * 0.11;
        b2 = 0.86 * b2 + white * 0.25;
        const pink = b0 + b1 + b2 + white * 0.22;
        // High frequency fiber snap cracks
        const snap = Math.random() > 0.86 ? (Math.random() * 2 - 1) * 3.8 : 0;
        data[i] = (pink * 2.6 + snap) * (1 - i / bufferSize);
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Resonant bandpass filter modeling physical paper tearing
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1500 + Math.random() * 800;
      filter.Q.value = 2.2;

      // High volume presence so it's clearly heard
      const gainNode = this.ctx.createGain();
      const vol = Math.min(1.0, 0.65 * intensity);
      const startTime = this.ctx.currentTime;
      gainNode.gain.setValueAtTime(0.05, startTime);
      gainNode.gain.linearRampToValueAtTime(vol, startTime + 0.012);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      noiseSource.start(startTime);
      noiseSource.stop(startTime + duration);
    } catch {
      // Audio safety
    }
  }
}

export const paperAudio = new PaperTearAudioPlayer();
