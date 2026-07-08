/**
 * gameSoundEngine.js — DopaMind Per-Game Web Audio API Sound System
 *
 * All sounds generated via Web Audio API (no external files).
 * Each game has its own "soundscape":
 *  - SUCCESS tones  → clean chimes, synthesized
 *  - ERROR tones    → low gentle buzz (NOT harsh)
 *  - AMBIENT pulses → very subtle background heartbeat feel
 *
 * Usage:
 *   import { playGameSound } from '@/app/games/core_engine/gameSoundEngine';
 *   playGameSound('speedmatch', 'success');
 *   playGameSound('echomap', 'sequence', { note: 3 });
 */

const AudioCtx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
let _ctx = null;

function getCtx() {
  if (!_ctx && AudioCtx) _ctx = new AudioCtx();
  if (_ctx?.state === 'suspended') _ctx.resume();
  return _ctx;
}

// ── Core oscillator helpers ────────────────────────────────────────

function playTone(freq, type = 'sine', duration = 0.12, gain = 0.18, startDelay = 0) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);
  vol.gain.setValueAtTime(0, ctx.currentTime + startDelay);
  vol.gain.linearRampToValueAtTime(gain, ctx.currentTime + startDelay + 0.01);
  vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration);
  osc.connect(vol);
  vol.connect(ctx.destination);
  osc.start(ctx.currentTime + startDelay);
  osc.stop(ctx.currentTime + startDelay + duration + 0.01);
}

function playChord(freqs, type = 'sine', duration = 0.18, gain = 0.12) {
  freqs.forEach((f, i) => playTone(f, type, duration, gain, i * 0.04));
}

function playNoise(duration = 0.08, gain = 0.06) {
  const ctx = getCtx();
  if (!ctx) return;
  const bufLen = Math.floor(ctx.sampleRate * duration);
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
  const source = ctx.createBufferSource();
  source.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 300;
  filter.Q.value = 0.8;
  const vol = ctx.createGain();
  vol.gain.setValueAtTime(gain, ctx.currentTime);
  vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  source.connect(filter);
  filter.connect(vol);
  vol.connect(ctx.destination);
  source.start();
  source.stop(ctx.currentTime + duration + 0.01);
}

// ── Per-game sound presets ─────────────────────────────────────────

const GAME_SOUNDS = {

  // Quick Reflexes family
  speedmatch: {
    success: () => playChord([523, 659, 784], 'triangle', 0.15, 0.14),
    error:   () => playTone(180, 'sawtooth', 0.1, 0.08),
    tick:    () => playTone(880, 'sine', 0.04, 0.06),
    start:   () => playChord([392, 523, 659], 'sine', 0.2, 0.1),
  },
  reactiontap: {
    success: () => playTone(880, 'sine', 0.08, 0.15),
    error:   () => playTone(160, 'sawtooth', 0.12, 0.1),
    tap:     () => playTone(1046, 'triangle', 0.06, 0.12),
    start:   () => playChord([440, 554, 659], 'sine', 0.18, 0.1),
  },
  directiondash: {
    success: () => playChord([659, 784], 'triangle', 0.1, 0.12),
    error:   () => playTone(200, 'square', 0.08, 0.07),
    tap:     () => playTone(740, 'sine', 0.06, 0.1),
    start:   () => playChord([330, 440, 554], 'sine', 0.2, 0.1),
  },

  // Stay Sharp family
  focusgrid: {
    success: () => playTone(1047, 'sine', 0.1, 0.1),
    error:   () => playTone(220, 'triangle', 0.12, 0.08),
    highlight: () => playTone(880, 'sine', 0.05, 0.07),
    start:   () => playChord([262, 330, 392], 'sine', 0.22, 0.09),
  },
  symbolmatch: {
    success: () => playChord([784, 988], 'triangle', 0.14, 0.11),
    error:   () => playTone(196, 'sawtooth', 0.1, 0.07),
    flip:    () => playTone(659, 'sine', 0.06, 0.08),
    start:   () => playChord([392, 494, 587], 'sine', 0.2, 0.09),
  },
  chromanode: {
    success: () => playChord([698, 880, 1047], 'sine', 0.14, 0.1),
    error:   () => playTone(174, 'sawtooth', 0.1, 0.07),
    slide:   () => playTone(523, 'triangle', 0.05, 0.06),
    start:   () => playChord([349, 440, 523], 'sine', 0.2, 0.09),
  },
  chromashift: {
    success: () => playChord([698, 880], 'sine', 0.14, 0.1),
    error:   () => playTone(174, 'sawtooth', 0.1, 0.07),
    slide:   () => playTone(523, 'triangle', 0.05, 0.06),
    start:   () => playChord([349, 440, 523], 'sine', 0.2, 0.09),
  },

  // Remember & Recall family
  echomap: {
    // Uses a pentatonic scale for musical sequence feedback
    sequence: ({ note = 0 } = {}) => {
      const PENTA = [261, 293, 329, 392, 440, 523, 587, 659, 784, 880];
      playTone(PENTA[note % PENTA.length], 'sine', 0.25, 0.16);
    },
    success: () => playChord([523, 659, 784, 1047], 'sine', 0.22, 0.1),
    error:   () => playChord([196, 220], 'sawtooth', 0.15, 0.08),
    start:   () => { [261, 329, 392, 523].forEach((f, i) => playTone(f, 'sine', 0.18, 0.1, i * 0.1)); },
  },
  wordwarp: {
    success: () => playChord([523, 659, 784], 'sine', 0.18, 0.11),
    error:   () => playTone(180, 'sawtooth', 0.1, 0.07),
    letter:  () => playTone(880, 'triangle', 0.04, 0.06),
    start:   () => playChord([330, 415, 523], 'sine', 0.2, 0.09),
  },
  numbercascade: {
    success: () => playTone(1047, 'triangle', 0.1, 0.12),
    error:   () => playNoise(0.1, 0.07),
    tap:     () => playTone(740, 'sine', 0.05, 0.07),
    start:   () => playChord([262, 330, 523], 'sine', 0.2, 0.09),
  },

  // Think & Solve family
  countflow: {
    success: () => playChord([440, 554, 659], 'triangle', 0.15, 0.12),
    error:   () => playTone(165, 'sawtooth', 0.1, 0.08),
    count:   () => playTone(660, 'sine', 0.06, 0.08),
    start:   () => playChord([220, 277, 330], 'sine', 0.22, 0.1),
  },
  patternpulse: {
    success: () => playChord([587, 740, 880], 'sine', 0.16, 0.11),
    error:   () => playTone(185, 'sawtooth', 0.1, 0.08),
    flash:   () => playTone(1047, 'triangle', 0.04, 0.07),
    start:   () => playChord([293, 370, 440], 'sine', 0.2, 0.09),
  },
  phaselock: {
    success: () => playChord([523, 659, 784, 1047], 'triangle', 0.2, 0.1),
    error:   () => playTone(196, 'sawtooth', 0.12, 0.08),
    tick:    () => playTone(1200, 'sine', 0.03, 0.05),
    start:   () => playChord([392, 494, 587, 740], 'sine', 0.22, 0.09),
  },

  // Sort & Prioritize family
  gravitysort: {
    success: () => playChord([440, 554], 'triangle', 0.14, 0.11),
    error:   () => playNoise(0.1, 0.06),
    drop:    () => playTone(220, 'sine', 0.08, 0.09),
    start:   () => playChord([220, 277, 349], 'sine', 0.2, 0.09),
  },
  weightguess: {
    success: () => playChord([392, 523, 659], 'sine', 0.16, 0.11),
    error:   () => playTone(175, 'sawtooth', 0.1, 0.07),
    weigh:   () => playTone(330, 'triangle', 0.08, 0.08),
    start:   () => playChord([196, 247, 330], 'sine', 0.22, 0.09),
  },

  // Time-based
  timeestimator: {
    success: () => playChord([659, 784], 'sine', 0.14, 0.11),
    error:   () => playTone(196, 'sawtooth', 0.1, 0.07),
    tick:    () => playTone(500, 'sine', 0.04, 0.05),
    start:   () => playChord([330, 415, 523], 'sine', 0.2, 0.09),
  },
};

// ── Public API ─────────────────────────────────────────────────────

/**
 * @param {string} gameId  - Registry game ID
 * @param {string} event   - 'success' | 'error' | 'start' | game-specific event
 * @param {object} opts    - Extra options (e.g. { note: 3 } for echomap sequences)
 */
export function playGameSound(gameId, event, opts = {}) {
  try {
    const sounds = GAME_SOUNDS[gameId];
    if (!sounds) return;
    const fn = sounds[event];
    if (typeof fn === 'function') fn(opts);
  } catch (e) {
    // Never crash the game due to audio failure
  }
}

export function unlockAudio() {
  // Call on first user interaction to satisfy autoplay policy
  getCtx();
}
