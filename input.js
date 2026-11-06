// input.js — the key map ('s'..'n' to a lane, SPACE to restart) and the one keyboard listener the game has.
import { KEYS, RESTART_KEY } from './tuning.js';

// --- KEY MAP: 's'..'n' -> lane 0..6, anything else -> -1
export function laneFromKey(key) {
  return KEYS.indexOf(String(key).toLowerCase());
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
