// input.js — the key map and the timing judgement: is this tap a hit, a perfect, or a wrong tap?
import { KEYS, RESTART_KEY, WINDOW_PERFECT, WINDOW_GOOD, WINDOW_TIGHTENING } from './tuning.js';

// --- KEY MAP: 's'..'n' -> lane 0..6, anything else -> -1
export function laneFromKey(key) {
  return KEYS.indexOf(String(key).toLowerCase());
}

// --- TIMING WINDOW: tighter each time a portal opens
export function windowsFor(portalsOpened) {
  const shrink = Math.pow(WINDOW_TIGHTENING, Math.max(0, portalsOpened));
  return { perfect: WINDOW_PERFECT * shrink, good: WINDOW_GOOD * shrink };
}

// --- HIT JUDGEMENT: offset is seconds from the line (0 = dead on). Returns 'perfect' | 'good' | 'wrong'.
export function judge(offsetSeconds, portalsOpened) {
  if (!Number.isFinite(offsetSeconds)) return 'wrong';
  const windows = windowsFor(portalsOpened);
  const distance = Math.abs(offsetSeconds);
  if (distance <= windows.perfect) return 'perfect';
  if (distance <= windows.good) return 'good';
  return 'wrong';
}

// --- KEYBOARD
// Held keys do not repeat-fire; main.js decides what a lane tap or the restart key means.
export function createKeyboard({ onLane, onRestartKey }) {
  window.addEventListener('keydown', (event) => {
    if (event.repeat) return; // holding a key must not fire taps
    if (event.ctrlKey || event.metaKey || event.altKey) return; // leave browser shortcuts alone

    if (event.code === RESTART_KEY) {
      event.preventDefault();
      onRestartKey();
      return;
    }

    const laneIndex = laneFromKey(event.key);
    if (laneIndex >= 0) {
      event.preventDefault();
      onLane(laneIndex);
    }
  });
}
