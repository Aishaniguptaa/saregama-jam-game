// ui.js — plain DOM overlay: score, lives and combo, plus the title and game-over screens.
import { LIVES, KEYS, SWARAS } from './tuning.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// --- BUILD: the three blocks main.js shows and hides
export function createUI(root) {
  const hud = el('div', 'hud');
  const score = el('div', 'hud-score', 'Score 0');
  const combo = el('div', 'hud-combo');
  const lives = el('div', 'hud-lives');
  hud.append(score, combo, lives);

  const legend = KEYS.map((key, i) => `${key.toUpperCase()} = ${SWARAS[i]}`).join('   ');
  const title = el('div', 'screen');
  title.append(
    el('h1', 'screen-title', 'SaReGaMa'),
    el('p', 'screen-line', legend),
    el('p', 'screen-line', "Press a pillar's key as it reaches the beat line."),
    el('p', 'screen-line', 'A wrong tap costs a life. A pillar that slips past costs nothing.'),
    el('p', 'screen-prompt', 'Press SPACE to begin'),
  );

  const over = el('div', 'screen');
  const overScore = el('p', 'screen-line', 'Score 0');
  over.append(
    el('h1', 'screen-title', 'Game Over'),
    overScore,
    el('p', 'screen-prompt', 'Press SPACE to play again'),
  );

  root.append(hud, title, over);

  const ui = { score, combo, lives, title, over, overScore };
  over.hidden = true; // the game-over screen only appears when a run ends
  updateHud(ui, { score: 0, lives: LIVES, combo: 0 });
  return ui;
}

// --- NUMBERS ON SCREEN, straight from the state main.js owns
export function updateHud(ui, { score, lives, combo }) {
  const full = Math.max(0, lives);
  ui.score.textContent = `Score ${score}`;
  ui.lives.textContent = `Lives ${'●'.repeat(full)}${'○'.repeat(Math.max(0, LIVES - full))}`;
  ui.combo.textContent = combo > 1 ? `Combo x${combo}` : '';
}

export function showTitle(ui, visible) {
  ui.title.hidden = !visible;
}

export function showGameOver(ui, visible, score) {
  ui.overScore.textContent = `Score ${score}`;
  ui.over.hidden = !visible;
}
