/**
 * Web Audio Ambient Soundscape Generator
 * Synthesizes warm Tibetan singing bowl harmonics and meditative Vedic drone
 */
class AmbientSoundscape {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private oscillators: OscillatorNode[] = [];
  private filter: BiquadFilterNode | null = null;

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(480, this.ctx.currentTime);
    this.filter.connect(this.masterGain);
  }

  public play() {
    this.init();
    if (!this.ctx || !this.masterGain || !this.filter) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) return;
    this.isPlaying = true;

    // Base fundamental drone (C#2 ~ 68.68 Hz + harmonic overtone)
    const baseFreqs = [68.68, 137.36, 206.04, 274.72, 412.08];
    this.oscillators = [];

    baseFreqs.forEach((freq, i) => {
      if (!this.ctx || !this.filter) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      
      osc.type = i === 0 ? 'sine' : i === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      // subtle detune for warm chorus beating
      osc.detune.setValueAtTime((i - 2) * 3, this.ctx.currentTime);
      
      const gainVal = i === 0 ? 0.25 : i === 1 ? 0.15 : 0.08 / (i + 1);
      oscGain.gain.setValueAtTime(gainVal, this.ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(this.filter);
      osc.start();
      this.oscillators.push(osc);
    });

    // Smooth fade in
    this.masterGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 2.5);
  }

  public stop() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
    setTimeout(() => {
      this.oscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore already stopped
        }
      });
      this.oscillators = [];
      this.isPlaying = false;
    }, 1300);
  }

  public triggerChime(pitch: number = 528) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);

    chimeGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.5);

    osc.connect(chimeGain);
    chimeGain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 3.6);
  }

  public getActive() {
    return this.isPlaying;
  }
}

export const soundscape = new AmbientSoundscape();
