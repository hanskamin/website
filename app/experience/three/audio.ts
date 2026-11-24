import type { SoundName } from "./game";

/** Small synthesised sound set: no audio files to download. */
export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private ambience: { src: AudioBufferSourceNode; gain: GainNode } | null = null;
  muted = false;

  /** Must be called from a user gesture. */
  unlock() {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.8;
      this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 2;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(m ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
  }

  setAmbience(on: boolean) {
    const ctx = this.ctx;
    if (!ctx || !this.master || !this.noise) return;
    if (on && !this.ambience) {
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      src.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 480;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(0.045, ctx.currentTime, 0.8);
      src.connect(lp).connect(gain).connect(this.master);
      src.start();
      this.ambience = { src, gain };
    } else if (!on && this.ambience) {
      const { src, gain } = this.ambience;
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      src.stop(ctx.currentTime + 1.5);
      this.ambience = null;
    }
  }

  play(name: SoundName, volume = 1) {
    const ctx = this.ctx;
    if (!ctx || !this.master || !this.noise || this.muted) return;
    const t = ctx.currentTime;
    const burst = (
      freq: number,
      q: number,
      dur: number,
      gainValue: number,
      type: BiquadFilterType = "bandpass",
    ) => {
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      const f = ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      f.Q.value = q;
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(gainValue, t);
      gn.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      src.connect(f).connect(gn).connect(this.master!);
      src.start(t, Math.random());
      src.stop(t + dur + 0.02);
    };
    const thump = (f0: number, f1: number, dur: number, gainValue: number) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f0, t);
      osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(gainValue, t);
      gn.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      osc.connect(gn).connect(this.master!);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    };
    if (name === "hit" || name === "serve") {
      const v = volume * (name === "serve" ? 1.1 : 1);
      burst(1500, 0.9, 0.07, 0.75 * v);
      thump(230, 95, 0.09, 0.8 * v);
    } else if (name === "bounce") {
      thump(170, 80, 0.06, 0.5 * volume);
      burst(700, 0.7, 0.04, 0.2 * volume, "lowpass");
    } else if (name === "net") {
      burst(420, 0.6, 0.16, 0.5 * volume, "lowpass");
    } else if (name === "applause" || name === "gasp") {
      const dur = name === "applause" ? 2.6 : 0.8;
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      src.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = name === "applause" ? 2600 : 900;
      bp.Q.value = 0.5;
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(0.0001, t);
      const peak = 0.3 * volume;
      // Many overlapping claps: a quick random flutter under a slow envelope.
      const stepLen = 0.03;
      for (let i = 0; i * stepLen < dur; i++) {
        const u = (i * stepLen) / dur;
        const env = Math.min(1, u * 9) * Math.pow(1 - u, 1.4);
        gn.gain.linearRampToValueAtTime(
          peak * env * (0.55 + Math.random() * 0.45) + 0.0001,
          t + i * stepLen,
        );
      }
      gn.gain.linearRampToValueAtTime(0.0001, t + dur);
      src.connect(bp).connect(gn).connect(this.master);
      src.start(t, Math.random());
      src.stop(t + dur + 0.05);
    }
  }

  dispose() {
    this.ambience?.src.stop();
    this.ambience = null;
    void this.ctx?.close();
    this.ctx = null;
  }
}
