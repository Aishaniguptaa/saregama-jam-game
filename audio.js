// audio.js — placeholder synth tones: one tone per swara, plus a hit tick and a miss buzz. Real samples land at M4.
import {
  SWARA_FREQUENCIES, NOTE_DURATION, NOTE_GAIN,
  HIT_FREQUENCY, HIT_DURATION, HIT_GAIN,
  MISS_FREQUENCY, MISS_DURATION, MISS_GAIN,
} from './tuning.js';

let context = null;

// Browsers block sound until the player has interacted, so main.js calls this on the first keypress.
export function unlockAudio() {
  if (!context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    context = new AudioContextClass();
  }
  if (context.state === 'suspended') context.resume();
}

// One short oscillator note with a soft attack and a quick fade.
function tone(frequency, duration, peak, type) {
  if (!context) return;
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peak, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

// --- THE ONE PLACE A NOTE IS PLAYED: swap this body for samples at M4 and nothing else changes.
export function playNote(laneIndex) {
  const frequency = SWARA_FREQUENCIES[laneIndex];
  if (frequency) tone(frequency, NOTE_DURATION, NOTE_GAIN, 'triangle');
}

// --- FEEDBACK
export function playHit() {
  tone(HIT_FREQUENCY, HIT_DURATION, HIT_GAIN, 'square');
}

export function playMiss() {
  tone(MISS_FREQUENCY, MISS_DURATION, MISS_GAIN, 'sawtooth');
}
