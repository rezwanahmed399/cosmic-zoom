/**
 * COSMIC AUDIO ENGINE (Web Audio API Procedural Synthesizer)
 * Generates dynamic cosmic drones, resonance sweeps, and scale-reactive harmonics.
 * No external sound files needed!
 */

export class CosmicAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.isPlaying = false;
    this.masterGain = null;
    
    // Synthesizer nodes
    this.subOsc = null;
    this.subGain = null;
    
    this.padOsc1 = null;
    this.padOsc2 = null;
    this.padFilter = null;
    this.padGain = null;

    this.quantumNoise = null;
    this.quantumFilter = null;
    this.quantumGain = null;

    this.droneLfo = null;
    this.lfoGain = null;

    this.lastOrder = 27;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master Safety Dynamics Compressor & Limiter (Protects hearing & prevents clipping)
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);

      // Post-compressor Master Output Limiter (Protective safety ceiling)
      this.outputLimiter = this.ctx.createGain();
      this.outputLimiter.gain.setValueAtTime(0.35, this.ctx.currentTime);

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.outputLimiter);
      this.outputLimiter.connect(this.ctx.destination);

      // 1. Sub-bass Drone (Cosmic Scale) + Audible Phone Harmonic
      this.subOsc = this.ctx.createOscillator();
      this.subOsc.type = 'sine';
      this.subOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // 55 Hz (A1)

      // Octave harmonic for mobile phone speakers
      this.subHarmonic = this.ctx.createOscillator();
      this.subHarmonic.type = 'triangle';
      this.subHarmonic.frequency.setValueAtTime(110, this.ctx.currentTime); // 110 Hz (A2)

      this.subGain = this.ctx.createGain();
      this.subGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

      this.harmonicGain = this.ctx.createGain();
      this.harmonicGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.subOsc.connect(this.subGain);
      this.subHarmonic.connect(this.harmonicGain);
      this.subGain.connect(this.masterGain);
      this.harmonicGain.connect(this.masterGain);

      // 2. Harmonic Pad (Mid / Planetary / Atomic)
      this.padOsc1 = this.ctx.createOscillator();
      this.padOsc1.type = 'triangle';
      this.padOsc1.frequency.setValueAtTime(110, this.ctx.currentTime); // A2

      this.padOsc2 = this.ctx.createOscillator();
      this.padOsc2.type = 'sine';
      this.padOsc2.frequency.setValueAtTime(164.81, this.ctx.currentTime); // E3 fifth

      this.padFilter = this.ctx.createBiquadFilter();
      this.padFilter.type = 'lowpass';
      this.padFilter.frequency.setValueAtTime(250, this.ctx.currentTime);
      this.padFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      this.padGain = this.ctx.createGain();
      this.padGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

      this.padOsc1.connect(this.padFilter);
      this.padOsc2.connect(this.padFilter);
      this.padFilter.connect(this.padGain);
      this.padGain.connect(this.masterGain);

      // 3. Quantum Vacuum Fluctuation Generator (White noise filtered)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.quantumNoise = this.ctx.createBufferSource();
      this.quantumNoise.buffer = noiseBuffer;
      this.quantumNoise.loop = true;

      this.quantumFilter = this.ctx.createBiquadFilter();
      this.quantumFilter.type = 'bandpass';
      this.quantumFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      this.quantumFilter.Q.setValueAtTime(5.0, this.ctx.currentTime);

      this.quantumGain = this.ctx.createGain();
      this.quantumGain.gain.setValueAtTime(0.01, this.ctx.currentTime);

      this.quantumNoise.connect(this.quantumFilter);
      this.quantumFilter.connect(this.quantumGain);
      this.quantumGain.connect(this.masterGain);

      // 4. Low-Frequency Oscillator (LFO) for organic cosmic breathing
      this.droneLfo = this.ctx.createOscillator();
      this.droneLfo.type = 'sine';
      this.droneLfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 8-second cycle
      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(30, this.ctx.currentTime);

      this.droneLfo.connect(this.lfoGain);
      this.lfoGain.connect(this.padFilter.frequency);

      // Start all oscillators
      this.subOsc.start();
      this.subHarmonic.start();
      this.padOsc1.start();
      this.padOsc2.start();
      this.quantumNoise.start();
      this.droneLfo.start();

      this.isPlaying = true;
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
    }
  }

  toggleSound() {
    this.init();
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    const now = this.ctx.currentTime;
    if (this.isMuted) {
      this.masterGain.gain.linearRampToValueAtTime(0, now + 0.3);
    } else {
      this.masterGain.gain.linearRampToValueAtTime(0.4, now + 0.8);
      this.playChime(440);
    }
    return !this.isMuted;
  }

  /**
   * Modulate audio parameters according to current order of magnitude (-35 to +27)
   */
  updateScale(order, zoomVelocity = 0) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Normalize scale: 0.0 (Planck, -35) to 1.0 (Cosmic, +27)
    const norm = (order + 35) / 62; // 0 at -35, 1 at +27
    const clampedNorm = Math.max(0, Math.min(1, norm));

    // Cosmic scale (> 10): Deep sub-bass dominance, broad lowpass
    // Quantum scale (< -15): High shimmering frequencies, quantum noise hiss
    if (this.subOsc && this.subGain) {
      const subFreq = 35 + clampedNorm * 45; // 35Hz at Planck, 80Hz at Cosmic
      this.subOsc.frequency.setTargetAtTime(subFreq, now, 0.2);
      const subVol = 0.15 + clampedNorm * 0.35;
      this.subGain.gain.setTargetAtTime(subVol, now, 0.2);
    }

    if (this.padOsc1 && this.padOsc2 && this.padFilter) {
      // Shifting harmonic chords as we dive
      const baseFreq = 80 + (1 - clampedNorm) * 350; // Higher pitch at quantum scale
      this.padOsc1.frequency.setTargetAtTime(baseFreq, now, 0.2);
      this.padOsc2.frequency.setTargetAtTime(baseFreq * 1.5, now, 0.2);

      const filterFreq = 180 + Math.pow(1 - clampedNorm, 1.5) * 1600;
      this.padFilter.frequency.setTargetAtTime(filterFreq, now, 0.2);
    }

    if (this.quantumGain && this.quantumFilter) {
      // Quantum froth active at microscopic down to Planck
      const quantumActivity = Math.max(0, ( -order ) / 35); // 0 at >=0, 1 at -35
      const noiseVol = Math.pow(quantumActivity, 2) * 0.18;
      this.quantumGain.gain.setTargetAtTime(noiseVol, now, 0.2);
      
      const noiseCenter = 800 + (1 - clampedNorm) * 2500;
      this.quantumFilter.frequency.setTargetAtTime(noiseCenter, now, 0.2);
    }

    this.lastOrder = order;
  }

  /**
   * Play clean sci-fi frequency chime when milestones are clicked or reached
   */
  playChime(freq = 523.25) {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.2);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {
      // Audio chime error fallback
    }
  }

  /**
   * Whoosh pulse when zoom speed is high
   */
  playZoomPulse(direction = 1) {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const startF = direction > 0 ? 120 : 280;
      const endF = direction > 0 ? 280 : 120;
      osc.frequency.setValueAtTime(startF, now);
      osc.frequency.exponentialRampToValueAtTime(endF, now + 0.25);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  /**
   * Spacetime stress hum during gravitational compression charging
   */
  playSpacetimeStress(charge = 0.5) {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const baseFreq = 80 + charge * 340;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(baseFreq + 25, now + 0.1);

      gain.gain.setValueAtTime(0.04 * charge, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  /**
   * Massive Gravitational Collapse & Singularity Implosion Sound
   */
  playBlackHoleCollapse() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;

      // 1. Deep Sub-bass Gravitational Implosion Sweep + Audible Phone Harmonic
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(160, now);
      sub.frequency.exponentialRampToValueAtTime(32, now + 1.2);

      subGain.gain.setValueAtTime(0.35, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      sub.connect(subGain);
      subGain.connect(this.masterGain);
      sub.start(now);
      sub.stop(now + 1.8);

      // Higher octave harmonic (for phone & laptop speakers cutting off below 100Hz)
      const harmonic = this.ctx.createOscillator();
      const harmGain = this.ctx.createGain();
      harmonic.type = 'triangle';
      harmonic.frequency.setValueAtTime(320, now);
      harmonic.frequency.exponentialRampToValueAtTime(64, now + 1.2);
      harmGain.gain.setValueAtTime(0.12, now);
      harmGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
      harmonic.connect(harmGain);
      harmGain.connect(this.masterGain);
      harmonic.start(now);
      harmonic.stop(now + 1.4);

      // 2. Spacetime Shear Snapping Crack (Metallic High-tension transient)
      const crack = this.ctx.createOscillator();
      const crackFilter = this.ctx.createBiquadFilter();
      const crackGain = this.ctx.createGain();

      crack.type = 'sawtooth';
      crack.frequency.setValueAtTime(880, now);
      crack.frequency.exponentialRampToValueAtTime(110, now + 0.4);

      crackFilter.type = 'bandpass';
      crackFilter.frequency.setValueAtTime(1200, now);
      crackFilter.Q.setValueAtTime(6.0, now);

      crackGain.gain.setValueAtTime(0.3, now);
      crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      crack.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(this.masterGain);
      crack.start(now);
      crack.stop(now + 0.5);

      // 3. Accretion Vacuum Shockwave (Filtered White Noise Burst)
      const bufferSize = this.ctx.sampleRate * 1.5;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(1400, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(70, now + 1.4);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 1.5);
    } catch (e) {}
  }

  /**
   * Hawking Radiation Burst & Spacetime Relaxation Sound
   */
  playBlackHoleEvaporate() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.9); // C6 cosmic release

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.1);
    } catch (e) {}
  }
}
