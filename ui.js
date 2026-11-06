// ui.js — plain DOM overlay: score, lives, combo, the beat meter and the instrument, the one-line play hint, plus the title and game-over screens.
import {
  LIVES, KEYS, SWARAS, INSTRUMENTS, HITS_PER_PORTAL,
  HINT_FONT_PX, HINT_BOTTOM_PERCENT, HINT_OPACITY, HINT_CLEARANCE_PX,
  BEAT_METER_TOP_PX, BEAT_METER_WIDTH_PX, BEAT_METER_HEIGHT_PX, BEAT_METER_BORDER_PX,
  BEAT_METER_TRACK_COLOR, BEAT_METER_BACKGROUND_COLOR, BEAT_METER_FILL_COLOR, BEAT_METER_FULL_COLOR,
  INSTRUMENT_TOP_PX, INSTRUMENT_FONT_PX, INSTRUMENT_COLOR, INSTRUMENT_PREFIX,
} from './tuning.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// --- BUILD: the blocks main.js shows and hides
export function createUI(root) {
  const hud = el('div', 'hud');
  const score = el('div', 'hud-score', 'Score 0');
  const combo = el('div', 'hud-combo');
  const lives = el('div', 'hud-lives');
  hud.append(score, combo, lives);

  // The beat meter and the instrument name: a row of their own under the HUD, so they never fight the
  // score, combo and lives line for room. Styled inline, because index.html belongs to the makers.
  const meter = el('div', 'hud-meter');
  Object.assign(meter.style, {
    position: 'absolute',
    top: `${BEAT_METER_TOP_PX}px`,
    left: '50%',
    transform: 'translateX(-50%)',
    width: `${BEAT_METER_WIDTH_PX}px`,
    height: `${BEAT_METER_HEIGHT_PX}px`,
    boxSizing: 'border-box',
    border: `${BEAT_METER_BORDER_PX}px solid ${BEAT_METER_TRACK_COLOR}`,
    background: BEAT_METER_BACKGROUND_COLOR,
  });
  const meterFill = el('div', 'hud-meter-fill');
  Object.assign(meterFill.style, {
    height: '100%',
    width: '0%',
    background: BEAT_METER_FILL_COLOR,
  });
  meter.append(meterFill);

  const instrument = el('div', 'hud-instrument');
  Object.assign(instrument.style, {
    position: 'absolute',
    top: `${INSTRUMENT_TOP_PX}px`,
    left: '0',
    right: '0',
    textAlign: 'center',
    fontSize: `${INSTRUMENT_FONT_PX}px`,
    color: INSTRUMENT_COLOR,
  });

  const legend = KEYS.map((key, i) => `${key.toUpperCase()} = ${SWARAS[i]}`).join('   ');
  const title = el('div', 'screen');
  title.append(
    el('h1', 'screen-title', 'SaReGaMa'),
    el('p', 'screen-line', legend),
    el('p', 'screen-line', "Press a pillar's key as it reaches the beat line."),
    el('p', 'screen-line', 'A wrong tap costs a life. A pillar that slips past costs nothing.'),
    el('p', 'screen-line', 'Filling the beat meter opens a portal to the next instrument.'),
    el('p', 'screen-prompt', 'Press SPACE to begin'),
  );

  const over = el('div', 'screen');
  const overScore = el('p', 'screen-line', 'Score 0');
  over.append(
    el('h1', 'screen-title', 'Game Over'),
    overScore,
    el('p', 'screen-prompt', 'Press SPACE to play again'),
  );

  // The one-line hint for the first beats of a run: bottom centre, low contrast, out of the HUD's way.
  // Its offset is a share of the window height, but main.js also hands us the bottom edge of the lane
  // label strip in pixels (placePlayHint), so on a short window the two cannot collide.
  const hint = el('div', 'play-hint', 'Press the key when the pillar reaches the line. A wrong tap costs a life.');
  Object.assign(hint.style, {
    position: 'absolute',
    left: '0',
    right: '0',
    bottom: `${HINT_BOTTOM_PERCENT}%`,
    textAlign: 'center',
    fontSize: `${HINT_FONT_PX}px`,
    opacity: String(HINT_OPACITY),
  });

  root.append(hud, meter, instrument, hint, title, over);

  const ui = { score, combo, lives, meterFill, instrument, hint, title, over, overScore, hintCeilingPx: Infinity };
  over.hidden = true; // the game-over screen only appears when a run ends
  hint.hidden = true; // and the play hint only while a run is on
  updateHud(ui, { score: 0, lives: LIVES, combo: 0, meter: 0, portals: 0 });
  return ui;
}

// --- THE PLAY HINT: one quiet line under the lanes, teaching the first beats on its own
// ceilingPx is where the lane label strip starts, measured from the bottom of the window by main.js.
export function placePlayHint(ui, ceilingPx) {
  ui.hintCeilingPx = ceilingPx;
  applyHintBottom(ui);
}

function applyHintBottom(ui) {
  const preferred = (window.innerHeight * HINT_BOTTOM_PERCENT) / 100;
  const room = ui.hintCeilingPx - ui.hint.offsetHeight - HINT_CLEARANCE_PX;
  ui.hint.style.bottom = `${Math.round(Math.max(0, Math.min(preferred, room)))}px`;
}

export function showPlayHint(ui, visible) {
  ui.hint.hidden = !visible;
  if (visible) applyHintBottom(ui); // measured while visible: a hidden element has no height
}

// --- NUMBERS ON SCREEN, straight from the state main.js owns
// meter is hits landed since the last portal or the last life lost; portals is the count this run.
export function updateHud(ui, { score, lives, combo, meter, portals }) {
  const full = Math.max(0, lives);
  ui.score.textContent = `Score ${score}`;
  ui.lives.textContent = `Lives ${'●'.repeat(full)}${'○'.repeat(Math.max(0, LIVES - full))}`;
  ui.combo.textContent = combo > 1 ? `Combo x${combo}` : '';

  const filled = Math.max(0, Math.min(1, (meter ?? 0) / HITS_PER_PORTAL));
  ui.meterFill.style.width = `${(filled * 100).toFixed(1)}%`;
  ui.meterFill.style.background = filled >= 1 ? BEAT_METER_FULL_COLOR : BEAT_METER_FILL_COLOR;
  ui.instrument.textContent = INSTRUMENT_PREFIX + INSTRUMENTS[Math.min(portals ?? 0, INSTRUMENTS.length - 1)];
}

export function showTitle(ui, visible) {
  ui.title.hidden = !visible;
}

export function showGameOver(ui, visible, score) {
  ui.overScore.textContent = `Score ${score}`;
  ui.over.hidden = !visible;
}
