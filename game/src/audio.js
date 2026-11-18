// audio.js — fully procedural WebAudio for Solmar. No audio files:
// engine hum follows speed, the siren is two-tone, gunshots and punches
// are filtered noise, pickups and missions are sine jingles, and a quiet
// chord-pad loop plays as ambient music. M toggles mute.
export function createAudio() {
  const audio = {
    ctx: null,
    master: null,
    muted: false,
    engineOsc: null,
    engineOsc2: null,
    engineGain: null,
    sirenOsc: null,
    sirenGain: null,
    musicTimer: 0,
    musicStep: 0,
    ready: false,
  };

  audio.init = () => {
    if (audio.ready) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audio.ctx = new Ctx();
      audio.master = audio.ctx.createGain();
      audio.master.gain.value = audio.muted ? 0 : 0.5;
      audio.master.connect(audio.ctx.destination);
      // Engine: two detuned saws through a lowpass, gain by speed.
      audio.engineOsc = audio.ctx.createOscillator();
      audio.engineOsc.type = 'sawtooth';
      audio.engineOsc.frequency.value = 55;
      audio.engineOsc2 = audio.ctx.createOscillator();
      audio.engineOsc2.type = 'square';
      audio.engineOsc2.frequency.value = 28;
      const engineFilter = audio.ctx.createBiquadFilter();
      engineFilter.type = 'lowpass';
      engineFilter.frequency.value = 420;
      audio.engineGain = audio.ctx.createGain();
      audio.engineGain.gain.value = 0;
      audio.engineOsc.connect(engineFilter);
      audio.engineOsc2.connect(engineFilter);
      engineFilter.connect(audio.engineGain);
      audio.engineGain.connect(audio.master);
      audio.engineOsc.start();
      audio.engineOsc2.start();
      // Siren: a sine whose pitch flips between two tones.
      audio.sirenOsc = audio.ctx.createOscillator();
      audio.sirenOsc.type = 'sine';
      audio.sirenOsc.frequency.value = 750;
      audio.sirenGain = audio.ctx.createGain();
      audio.sirenGain.gain.value = 0;
      audio.sirenOsc.connect(audio.sirenGain);
      audio.sirenGain.connect(audio.master);
      audio.sirenOsc.start();
      audio.ready = true;
    } catch (err) {
      audio.ready = false; // no audio device: the game still plays silent
    }
  };

  audio.setMuted = (muted) => {
    audio.muted = muted;
    if (audio.master && audio.ctx) {
      audio.master.gain.setTargetAtTime(muted ? 0 : 0.5, audio.ctx.currentTime, 0.05);
    }
  };

  // Called every frame: speed in m/s, 0 on foot; siren 0..1 by police heat.
  audio.update = (speed, sirenLevel, dt) => {
    if (!audio.ready) return;
    if (audio.ctx.state === 'suspended') audio.ctx.resume();
    const t = audio.ctx.currentTime;
    audio.engineOsc.frequency.setTargetAtTime(45 + speed * 4.2, t, 0.08);
    audio.engineOsc2.frequency.setTargetAtTime(22 + speed * 2.1, t, 0.08);
    audio.engineGain.gain.setTargetAtTime(speed > 0.5 ? 0.05 + Math.min(speed / 30, 1) * 0.05 : 0, t, 0.1);
    const tone = (Math.floor(t * 1.6) % 2 === 0) ? 720 : 980;
    audio.sirenOsc.frequency.setTargetAtTime(tone, t, 0.03);
    audio.sirenGain.gain.setTargetAtTime(sirenLevel * 0.045, t, 0.2);
    // Ambient music: a slow Am–F–C–G pad, one chord every 4 seconds.
    audio.musicTimer -= dt;
    if (audio.musicTimer <= 0) {
      audio.musicTimer = 4;
      const chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [196, 261.6, 329.6], [196, 246.9, 293.7]];
      const chord = chords[audio.musicStep % chords.length];
      audio.musicStep++;
      for (const freq of chord) {
        const osc = audio.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const gain = audio.ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.035, t + 0.8);
        gain.gain.linearRampToValueAtTime(0, t + 4);
        osc.connect(gain);
        gain.connect(audio.master);
        osc.start(t);
        osc.stop(t + 4.1);
      }
      // Soft bass note under each chord.
      const bass = audio.ctx.createOscillator();
      bass.type = 'sine';
      bass.frequency.value = chord[0] / 2;
      const bassGain = audio.ctx.createGain();
      bassGain.gain.setValueAtTime(0, t);
      bassGain.gain.linearRampToValueAtTime(0.06, t + 0.4);
      bassGain.gain.linearRampToValueAtTime(0, t + 3.8);
      bass.connect(bassGain);
      bassGain.connect(audio.master);
      bass.start(t);
      bass.stop(t + 4);
    }
  };

  function noiseBurst(duration, filterFreq, gainValue) {
    if (!audio.ready) return;
    const t = audio.ctx.currentTime;
    const len = Math.floor(audio.ctx.sampleRate * duration);
    const buffer = audio.ctx.createBuffer(1, len, audio.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = audio.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = audio.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const gain = audio.ctx.createGain();
    gain.gain.value = gainValue;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(audio.master);
    src.start(t);
  }

  function tone(freq, duration, type, gainValue, when = 0) {
    if (!audio.ready) return;
    const t = audio.ctx.currentTime + when;
    const osc = audio.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const gain = audio.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(gainValue, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(audio.master);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  audio.gunshot = () => noiseBurst(0.16, 1800, 0.5);
  audio.punch = () => noiseBurst(0.1, 300, 0.55);
  audio.pickup = () => { tone(880, 0.18, 'sine', 0.22); tone(1318, 0.3, 'sine', 0.2, 0.09); };
  audio.missionJingle = () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.35, 'triangle', 0.22, i * 0.12));
  };
  audio.failBuzz = () => { tone(160, 0.4, 'sawtooth', 0.18); tone(110, 0.5, 'sawtooth', 0.18, 0.15); };
  audio.bustedSting = () => { tone(392, 0.5, 'triangle', 0.22); tone(311, 0.8, 'triangle', 0.22, 0.3); };
  audio.carDoor = () => noiseBurst(0.08, 500, 0.3);
  return audio;
}
