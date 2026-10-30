// Web Audio API Sound Generator & Dynamic Espionage Soundtrack for Operation: CrossTalk

/**
 * Dynamic Procedural Espionage Thriller Soundtrack Engine
 * Synthesizes a low-level, suspenseful tactical groove using Web Audio API nodes:
 * - Persistent analog D-minor tension drone with chorused fifth
 * - Rhythmic 16th-step syncopated stealth bassline (Mission: Impossible / Bourne style)
 * - Clockwork tick / muted hi-hat pulse for constant forward momentum
 * - Sub-bass heartbeat thump under 30 seconds
 * - Mixed at ~0.085 gain (whisper/dialogue safe) so player verbal communication is never obscured
 */
class SoundtrackEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning = false;
  private timerId: number | null = null;
  private nextStepTime = 0;
  private currentStep = 0;
  private tempo = 122; // BPM
  private remainingSeconds = 240;

  // Drone nodes
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private droneGain: GainNode | null = null;

  public start(ctx: AudioContext, isMuted: boolean, remaining = 240) {
    if (this.isRunning) return;
    this.ctx = ctx;
    this.remainingSeconds = remaining;
    this.isRunning = true;

    // Master soundtrack gain node (calibrated to sit comfortably under voice chat)
    this.masterGain = this.ctx.createGain();
    const targetVol = isMuted ? 0 : 0.085;
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(targetVol, this.ctx.currentTime + 1.2);
    this.masterGain.connect(this.ctx.destination);

    // 1. Start Persistent Espionage Drone (Subtle D minor tension pad)
    this.startDrone();

    // 2. Start Rhythmic Step Sequencer (Stealth bass pulse & clockwork tick)
    this.currentStep = 0;
    this.nextStepTime = this.ctx.currentTime + 0.08;
    this.timerId = window.setInterval(() => this.scheduleSteps(), 45);
  }

  public updateTime(remaining: number) {
    this.remainingSeconds = remaining;
    if (!this.ctx) return;

    // Adapt musical urgency as bomb ticks down
    if (remaining <= 30) {
      this.tempo = 134;
      if (this.droneFilter) {
        this.droneFilter.frequency.setTargetAtTime(420, this.ctx.currentTime, 0.4);
      }
    } else if (remaining <= 60) {
      this.tempo = 128;
      if (this.droneFilter) {
        this.droneFilter.frequency.setTargetAtTime(320, this.ctx.currentTime, 0.4);
      }
    } else {
      this.tempo = 122;
      if (this.droneFilter) {
        this.droneFilter.frequency.setTargetAtTime(220, this.ctx.currentTime, 0.4);
      }
    }
  }

  public setMuted(muted: boolean) {
    if (!this.masterGain || !this.ctx) return;
    const targetVol = muted ? 0 : 0.085;
    this.masterGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.04);
  }

  public stop() {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    if (this.masterGain && this.ctx) {
      // Clean fadeout over 0.5s
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      setTimeout(() => {
        this.cleanupNodes();
      }, 550);
    } else {
      this.cleanupNodes();
    }
  }

  private startDrone() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Dark analog style drone: D2 (73.4Hz) + A2 (110Hz) fifth
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneGain = this.ctx.createGain();

    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(73.42, now); // D2

    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.setValueAtTime(110.0, now); // A2 fifth
    this.droneOsc2.detune.setValueAtTime(4, now); // Warm analog chorusing

    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(220, now);
    this.droneFilter.Q.setValueAtTime(3.0, now);

    this.droneGain.gain.setValueAtTime(0.45, now);

    this.droneOsc1.connect(this.droneFilter);
    this.droneOsc2.connect(this.droneFilter);
    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc1.start(now);
    this.droneOsc2.start(now);
  }

  private scheduleSteps() {
    if (!this.ctx || !this.isRunning || !this.masterGain) return;

    // Lookahead: schedule events within next 120ms
    const scheduleAheadTime = 0.12;
    const secondsPerBeat = 60.0 / this.tempo;
    const secondsPerStep = secondsPerBeat / 4; // 16th notes

    while (this.nextStepTime < this.ctx.currentTime + scheduleAheadTime) {
      this.playStep(this.currentStep, this.nextStepTime);
      this.nextStepTime += secondsPerStep;
      this.currentStep = (this.currentStep + 1) % 16;
    }
  }

  // 16-step suspense bass & percussion loop
  private playStep(step: number, time: number) {
    if (!this.ctx || !this.masterGain) return;

    // 1. Stealth Bassline (Mission: Impossible style syncopated groove in D minor)
    // Root D2 (73.4Hz), Tension half-step Eb2 (77.8Hz), Minor third F2 (87.3Hz)
    const bassPattern: { [key: number]: { freq: number; vol: number; dur: number } } = {
      0: { freq: 73.42, vol: 0.85, dur: 0.13 },
      2: { freq: 73.42, vol: 0.45, dur: 0.08 },
      4: { freq: 77.78, vol: 0.70, dur: 0.12 }, // Eb suspense
      6: { freq: 73.42, vol: 0.40, dur: 0.08 },
      8: { freq: 73.42, vol: 0.80, dur: 0.13 },
      10: { freq: 87.31, vol: 0.75, dur: 0.12 }, // F minor third
      12: { freq: 77.78, vol: 0.65, dur: 0.11 }, // Eb
      14: { freq: 73.42, vol: 0.45, dur: 0.09 },
    };

    if (bassPattern[step]) {
      const note = bassPattern[step];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.freq, time);

      filter.type = 'lowpass';
      // Dynamic filter envelope that snaps open and clamps down
      filter.frequency.setValueAtTime(360, time);
      filter.frequency.exponentialRampToValueAtTime(110, time + note.dur);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(note.vol, time + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + note.dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + note.dur);
    }

    // 2. High-Tension Clockwork / Shaker Tick (On off-beats: 2, 6, 10, 14)
    if (step % 2 === 0) {
      const isAccent = step % 4 === 2;
      this.playStealthTick(time, isAccent);
    }

    // 3. Heartbeat Thump Under 30 Seconds Remaining (Steps 0 and 8)
    if (this.remainingSeconds <= 30 && (step === 0 || step === 8)) {
      this.playHeartbeatThump(time);
    }
  }

  private playStealthTick(time: number, isAccent: boolean) {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.02);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6000, time);

    const gain = this.ctx.createGain();
    const vol = isAccent ? 0.065 : 0.035;
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.016);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.016);
  }

  private playHeartbeatThump(time: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.16);

    gain.gain.setValueAtTime(0.45, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.18);
  }

  private cleanupNodes() {
    try {
      if (this.droneOsc1) {
        this.droneOsc1.stop();
        this.droneOsc1.disconnect();
        this.droneOsc1 = null;
      }
      if (this.droneOsc2) {
        this.droneOsc2.stop();
        this.droneOsc2.disconnect();
        this.droneOsc2 = null;
      }
      if (this.droneFilter) {
        this.droneFilter.disconnect();
        this.droneFilter = null;
      }
      if (this.droneGain) {
        this.droneGain.disconnect();
        this.droneGain = null;
      }
      if (this.masterGain) {
        this.masterGain.disconnect();
        this.masterGain = null;
      }
    } catch {}
  }
}

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private soundtrack: SoundtrackEngine = new SoundtrackEngine();

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    this.soundtrack.setMuted(this.isMuted);
    return this.isMuted;
  }

  public getMuted() {
    return this.isMuted;
  }

  // Spy / Thriller Soundtrack Controls
  public startMusic(remainingSeconds?: number) {
    this.initCtx();
    if (this.ctx) {
      this.soundtrack.start(this.ctx, this.isMuted, remainingSeconds);
    }
  }

  public updateMusic(remainingSeconds: number) {
    this.soundtrack.updateTime(remainingSeconds);
  }

  public stopMusic() {
    this.soundtrack.stop();
  }

  // Realistic Electronic Bomb Timer Beep (Authentic Hollywood / Tactical Piezo Beep)
  public tick(remainingSecondsOrFast: number | boolean = 60) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const remaining = typeof remainingSecondsOrFast === 'boolean'
        ? (remainingSecondsOrFast ? 15 : 60)
        : remainingSecondsOrFast;

      const now = this.ctx.currentTime;
      const isCritical = remaining <= 10;
      const isUrgent = remaining <= 30;

      // Authentic tactical frequency: standard movie bomb timer is ~2093Hz (C7), sharpening under stress
      const baseFreq = isCritical ? 2793.83 : isUrgent ? 2349.32 : 2093.0;

      const playBeep = (timeOffset: number, duration: number, volume: number) => {
        const t = now + timeOffset;

        // Primary high-frequency tone
        const osc1 = this.ctx!.createOscillator();
        const osc2 = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, t);

        // Harmonic overtone giving that sharp, metallic piezo buzzer bite
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(baseFreq * 2, t);

        // Highpass filter removes low-end pop and gives clean digital edge
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1200, t);

        // Snappy envelope: instant 1ms attack, crisp sustain, fast decay
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(volume, t + 0.002);
        gain.gain.setValueAtTime(volume, t + duration * 0.6);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

        const osc2Gain = this.ctx!.createGain();
        osc2Gain.gain.setValueAtTime(volume * 0.22, t);
        osc2Gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

        osc1.connect(gain);
        gain.connect(filter);

        osc2.connect(osc2Gain);
        osc2Gain.connect(filter);

        filter.connect(this.ctx!.destination);

        osc1.start(t);
        osc1.stop(t + duration);
        osc2.start(t);
        osc2.stop(t + duration);
      };

      if (isCritical) {
        // Frantic double-beep ("pip-pip") for final 10 seconds!
        playBeep(0, 0.035, 0.24);
        playBeep(0.075, 0.045, 0.26);
        this.vibrate([25, 45, 25]);
      } else if (isUrgent) {
        // Higher pitched urgent single beep
        playBeep(0, 0.045, 0.22);
        this.vibrate(20);
      } else {
        // Standard clinical digital timer beep
        playBeep(0, 0.04, 0.18);
        this.vibrate(10);
      }
    } catch {
      // AudioContext policy fallback
    }
  }

  // Snip wire sound
  public wireCut() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
      this.vibrate([40, 30, 40]);
    } catch {}
  }

  // Harsh strike/error buzzer
  public strike() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, this.ctx.currentTime);
      osc.frequency.setValueAtTime(98, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
      this.vibrate([150, 50, 150]);
    } catch {}
  }

  // Button key beep
  public beep(freq = 600) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
      this.vibrate(20);
    } catch {}
  }

  // Module Solved green chime
  public moduleSolved() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        const startTime = this.ctx!.currentTime + idx * 0.07;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
      this.vibrate([60, 40, 120]);
    } catch {}
  }

  // Dramatic Cinematic Explosion / Detonation (Multi-Layer Shockwave, Blast Crack & Debris Rumble)
  public explode() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // 1. Heavy Sub-Bass Shockwave (Physical chest-thump thud)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(170, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 1.8);

      subGain.gain.setValueAtTime(0.9, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 1.8);

      // 2. High-Impact Detonation Blast Crack (Overdriven transient supersonic crack)
      const crackOsc = this.ctx.createOscillator();
      const crackGain = this.ctx.createGain();

      crackOsc.type = 'sawtooth';
      crackOsc.frequency.setValueAtTime(500, now);
      crackOsc.frequency.exponentialRampToValueAtTime(35, now + 0.16);

      crackGain.gain.setValueAtTime(0.85, now);
      crackGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      crackOsc.connect(crackGain);
      crackGain.connect(this.ctx.destination);
      crackOsc.start(now);
      crackOsc.stop(now + 0.18);

      // 3. Volumetric Fireball Roar & Debris Rumble (Filtered White Noise Buffer)
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * 2.5);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      // Lowpass resonant filter sweeps from blazing initial fireball (1600Hz) down to rumbling rubble (55Hz)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(2.8, now);
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(55, now + 2.4);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.8, now);
      noiseGain.gain.linearRampToValueAtTime(0.7, now + 0.2);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 2.5);

      // Violent multi-stage haptic blast
      this.vibrate([180, 40, 350, 60, 200, 50, 450]);
    } catch {}
  }

  // Triumphant Victory Fanfare
  public victory() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = this.ctx!.currentTime + i * 0.12;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.4);
      });
      this.vibrate([100, 50, 100, 50, 300]);
    } catch {}
  }

  // Mobile haptic vibration helper
  public vibrate(pattern: number | number[]) {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }
}

export const sound = new SoundSystem();
