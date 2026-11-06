// audio.js — placeholder synth voices: one per swara, one timbre per instrument, plus a hit tick and a miss buzz. Real samples land at M4.
import {
  SWARA_FREQUENCIES, INSTRUMENT_VOICES, HIT_FREQUENCY, HIT_TONE, MISS_FREQUENCY, MISS_TONE,
} from './tuning.js';

let context = null;
let instrument = 0; // which voice the notes use: 0 = Tabla, moved on by setInstrument()

// Browsers block sound until the player has interacted, so main.js calls this on the first keypress.
export function unlockAudio() {
  if (!context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    context = new AudioContextClass();
  }
  if (context.state === 'suspended') context.resume();
}

// One voice: an oscillator pair shaped by a voice row from tuning.js. Short-lived, so nothing to keep.
function tone(frequency, voice) {
  if (!context) return;
  const now = context.currentTime;
  const base = frequency * (voice.octave ?? 1);

  const gain = context.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(voice.gain, now + (voice.attack ?? 0.01));
  gain.gain.exponentialRampToValueAtTime(0.0001, now + voice.duration);
  gain.connect(context.destination);

  const oscillators = [];
  const main = context.createOscillator();
  main.type = voice.type;
  main.frequency.setValueAtTime(base * (voice.pitchStart ?? 1), now);
  if (voice.pitchStart && voice.pitchStart !== 1) {
    main.frequency.exponentialRampToValueAtTime(base, now + Math.max(0.001, voice.dropTime ?? 0.02));
  }
  main.connect(gain);
  oscillators.push(main);

  if (voice.detuneCents) { // a second string a little out of tune: the buzz of the sitar and the santoor
    const second = context.createOscillator();
    second.type = voice.type;
    second.frequency.setValueAtTime(base, now);
    second.detune.setValueAtTime(voice.detuneCents, now);
    second.connect(gain);
    oscillators.push(second);
  }

  for (const oscillator of oscillators) {
    oscillator.start(now);
    oscillator.stop(now + voice.duration + 0.02);
  }
}

// --- THE ONE PLACE A NOTE IS PLAYED: swap this body for samples at M4 and nothing else changes.
// index is the portal count: 0 Tabla, then Sitar, Flute, Dhol, Santoor, and it holds on the last one.
export function setInstrument(index) {
  const safe = Number.isFinite(index) ? Math.floor(index) : 0;
  instrument = Math.max(0, Math.min(INSTRUMENT_VOICES.length - 1, safe));
}

export function playNote(laneIndex) {
  const frequency = SWARA_FREQUENCIES[laneIndex];
  if (frequency) tone(frequency, INSTRUMENT_VOICES[instrument]);
}

// --- FEEDBACK
export function playHit() {
  tone(HIT_FREQUENCY, HIT_TONE);
}

export function playMiss() {
  tone(MISS_FREQUENCY, MISS_TONE);
}
