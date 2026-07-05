// FILE: SynthEngine.js
// PURPOSE: Generates procedural chimes and error sounds using Web Audio API

// 🧮 Frequencies for the Ascending Pentatonic Scale
export const PENTATONIC_SCALE = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.00, // G4
  440.00, // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.00  // A5
];

let audioCtx = null;

export const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playChime = (index) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(PENTATONIC_SCALE[index % PENTATONIC_SCALE.length], ctx.currentTime);

    gainNode.gain.setValueAtTime(0.18, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.warn("Audio Context failed to play chime:", e);
  }
};

export const playErrorSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    console.warn("Audio Context failed to play error sound:", e);
  }
};

export const playAscendingArpeggio = () => {
  const notes = [0, 2, 4, 5, 7, 9];
  notes.forEach((noteIdx, order) => {
    setTimeout(() => {
      playChime(noteIdx);
    }, order * 75);
  });
};
