// Web Audio API Sound Generator & Cinematic Espionage Soundtrack for Operation: CrossTalk

export type SoundtrackChoice =
  | 'spy-groove'
  | 'spy-glass'
  | 'covert-affair'
  | 'volatile-reaction'
  | 'none';

/**
 * Authentic Studio-Produced Cinematic Spy Movie Soundtrack Player
 * Streams high-fidelity espionage scores composed with live brass, B3 organ,
 * acoustic double-bass, vibraphone, congas, and film percussion.
 *
 * Automatically calibrated to dialogue-safe volume (~0.12) to ensure
 * clear player verbal communication.
 */
class CinematicSoundtrack {
  private audio: HTMLAudioElement | null = null;
  private currentTrack: SoundtrackChoice = 'spy-groove';
  private isMuted: boolean = false;
  private volume: number = 0.12; // Dialogue-safe master level
  private fadeInterval: number | null = null;

  public setTrack(track: SoundtrackChoice) {
    if (this.currentTrack === track) return;
    const wasPlaying = this.isPlaying();
    this.currentTrack = track;
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    if (wasPlaying && track !== 'none') {
      this.play();
    }
  }

  public getTrack(): SoundtrackChoice {
    return this.currentTrack;
  }

  public isPlaying(): boolean {
    return !!this.audio && !this.audio.paused;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.audio) {
      this.audio.volume = muted ? 0 : this.volume;
    }
  }

  public play() {
    if (this.currentTrack === 'none') {
      this.stop();
      return;
    }

    const src = `./${this.currentTrack}.mp3`;

    if (!this.audio || !this.audio.src.endsWith(`${this.currentTrack}.mp3`)) {
      if (this.audio) {
        this.audio.pause();
      }
      this.audio = new Audio(src);
      this.audio.loop = true;
      this.audio.preload = 'auto';
    }

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    this.audio.volume = this.isMuted ? 0 : 0.02;
    const playPromise = this.audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Smooth fade in to target volume over 600ms
          if (this.isMuted) return;
          let v = 0.02;
          this.fadeInterval = window.setInterval(() => {
            if (!this.audio || this.isMuted) {
              if (this.fadeInterval) clearInterval(this.fadeInterval);
              return;
            }
            v = Math.min(this.volume, v + 0.02);
            this.audio.volume = v;
            if (v >= this.volume) {
              if (this.fadeInterval) clearInterval(this.fadeInterval);
              this.fadeInterval = null;
            }
          }, 50);
        })
        .catch(() => {
          // Handled if browser autoplay policy delays playback
        });
    }
  }

  public updateTime(remaining: number) {
    if (!this.audio || this.isMuted) return;
    // Under 30s: subtly lift volume slightly for heightened climax tension
    if (remaining <= 30) {
      this.audio.volume = Math.min(0.18, this.volume * 1.35);
    } else {
      this.audio.volume = this.volume;
    }
  }

  public stop() {
    if (!this.audio) return;
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    let v = this.audio.volume;
    this.fadeInterval = window.setInterval(() => {
      if (!this.audio) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        return;
      }
      v = Math.max(0, v - 0.03);
      this.audio.volume = v;
      if (v <= 0) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        this.audio.pause();
        this.audio.currentTime = 0;
      }
    }, 40);
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audio && !this.isMuted) {
      this.audio.volume = this.volume;
    }
  }
}

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private soundtrack: CinematicSoundtrack = new CinematicSoundtrack();

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

  // Cinematic Soundtrack Controls
  public startMusic(remainingSeconds?: number) {
    this.initCtx();
    this.soundtrack.play();
    if (remainingSeconds !== undefined) {
      this.soundtrack.updateTime(remainingSeconds);
    }
  }

  public updateMusic(remainingSeconds: number) {
    this.soundtrack.updateTime(remainingSeconds);
  }

  public stopMusic() {
    this.soundtrack.stop();
  }

  public setSoundtrack(track: SoundtrackChoice) {
    this.soundtrack.setTrack(track);
  }

  public getSoundtrack(): SoundtrackChoice {
    return this.soundtrack.getTrack();
  }

  public setMusicVolume(vol: number) {
    this.soundtrack.setVolume(vol);
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
