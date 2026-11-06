// main.js — the scene, the render loop and the state machine (title -> playing -> gameover), plus the beat line, its timing band and the portal. The only file that wires the others.
import * as THREE from 'three';
import * as T from './tuning.js';
import { createField, resetField, updateField, removePillar, findPillarNearLine, offsetToLine } from './pillars.js';
import { createKeyboard, judge, windowsFor } from './input.js';
import { createLabels, createPillarLabel, showLabels, stripBottomY } from './labels.js';
import { createUI, updateHud, showTitle, showGameOver, showPlayHint, placePlayHint } from './ui.js';
import { unlockAudio, playNote, playHit, playMiss, setInstrument } from './audio.js';

// --- RENDERER AND CAMERA: one fixed side-on view of the whole field
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.insertBefore(renderer.domElement, document.getElementById('ui'));

const scene = new THREE.Scene();
scene.background = new THREE.Color(T.BACKGROUND_COLOR);

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
camera.position.set(0, T.VIEW_CENTER_Y, 12);
camera.lookAt(0, T.VIEW_CENTER_Y, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const lamp = new THREE.DirectionalLight(0xffffff, 1.2);
lamp.position.set(-4, 8, 10);
scene.add(lamp);

const FIELD_HALF_WIDTH = (T.LANE_COUNT * T.LANE_WIDTH) / 2;

// Fit all seven lanes across, and never let the view get so short that the fall and the line go off screen.
// VIEW_HEIGHT is therefore a floor, not an exact height: every window shape shows at least this much of the
// fall, which is what keeps a spawning pillar whole and the lead time the same on every screen.
function resize() {
  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  const halfWidth = Math.max(FIELD_HALF_WIDTH + T.VIEW_MARGIN, (T.VIEW_HEIGHT / 2) * aspect);
  const halfHeight = halfWidth / aspect;
  camera.left = -halfWidth;
  camera.right = halfWidth;
  camera.top = halfHeight; // the frustum is measured from the camera, which sits at VIEW_CENTER_Y
  camera.bottom = -halfHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  placeHint();
}
window.addEventListener('resize', resize);

// --- THE BEAT LINE: the moment to press. A bright bar with a flat shaded band around it, and the band is
// the good window itself, converted from seconds to world units by the fall speed, so the two can never
// drift apart. The band is one unit plane scaled to size: one geometry and one material for the whole run.
const line = new THREE.Mesh(
  new THREE.BoxGeometry(FIELD_HALF_WIDTH * 2, T.LINE_THICKNESS, T.LINE_THICKNESS),
  new THREE.MeshBasicMaterial({ color: T.LINE_COLOR }),
);
line.position.set(0, T.STRIKE_Y, T.LINE_Z);
scene.add(line);

const band = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({ color: T.BAND_COLOR }),
);
band.position.set(0, T.STRIKE_Y, T.BAND_Z);
scene.add(band);

// The band narrows as WINDOW_TIGHTENING narrows the window, so a portal's difficulty is visible on the line.
function sizeBand(portalsOpened) {
  band.scale.set(FIELD_HALF_WIDTH * 2, windowsFor(portalsOpened).good * 2 * T.SCROLL_SPEED, 1);
}

// --- THE PORTAL: one ring, built once at the line and reused every time the beat meter fills.
const portalMaterial = new THREE.MeshBasicMaterial({
  color: T.PORTAL_COLOR,
  transparent: true,
  opacity: T.PORTAL_OPACITY,
  depthWrite: false, // it draws over the line, but never hides a pillar behind it
});
const portalRing = new THREE.Mesh(
  new THREE.RingGeometry(T.PORTAL_RADIUS * T.PORTAL_INNER_RATIO, T.PORTAL_RADIUS, T.PORTAL_SEGMENTS),
  portalMaterial,
);
portalRing.position.set(0, T.STRIKE_Y, T.PORTAL_Z);
portalRing.visible = false;
scene.add(portalRing);

// --- THE DANCER STAND-IN: a plain box, replaced by the real world at M4
const dancer = new THREE.Mesh(
  new THREE.BoxGeometry(T.DANCER_WIDTH, T.DANCER_HEIGHT, 0.5),
  new THREE.MeshLambertMaterial({ color: T.DANCER_COLOR }),
);
dancer.position.set(0, T.STRIKE_Y + T.DANCER_HEIGHT / 2, -0.7);
scene.add(dancer);

// --- STATE
// meter is hits landed since the last portal or the last life lost; portals is how many opened this run.
let ui = null;
const field = createField(scene, createPillarLabel);
const labels = createLabels(scene); // one key + swara strip under the lanes, for the whole run
const state = { phase: 'title', score: 0, lives: T.LIVES, combo: 0, hits: 0, meter: 0, portals: 0, portalTimer: 0 };

// The play hint may not ride up into the lane label strip: hand ui.js the strip's bottom edge in pixels.
// The camera is orthographic, axis-aligned and never rotates, so the mapping is a plain proportion.
function placeHint() {
  if (!ui) return;
  if (!T.SHOW_LANE_STRIP) {
    placePlayHint(ui, Infinity);
    return;
  }
  const viewBottom = T.VIEW_CENTER_Y + camera.bottom;
  const viewTop = T.VIEW_CENTER_Y + camera.top;
  const stripBottom = stripBottomY();
  placePlayHint(ui, ((stripBottom - viewBottom) / (viewTop - viewBottom)) * window.innerHeight);
}

function startRun() {
  state.phase = 'playing';
  state.score = 0;
  state.lives = T.LIVES;
  state.combo = 0;
  state.hits = 0;
  state.meter = 0;
  state.portals = 0;
  state.portalTimer = 0;
  resetField(field); // pillars, beat grid and bag all back to the start
  setInstrument(0);  // every run opens on the first instrument
  closePortal();
  sizeBand(0);
  updateHud(ui, state);
  showTitle(ui, false);
  showGameOver(ui, false, 0);
  showLabels(labels, true);
  showPlayHint(ui, true);
}

function endRun() {
  state.phase = 'gameover';
  closePortal();
  showGameOver(ui, true, state.score);
  showLabels(labels, false);
  showPlayHint(ui, false);
}

function loseLife() {
  state.lives -= 1;
  state.combo = 0;
  state.meter = 0; // the meter empties the moment a life goes
  playMiss();
  updateHud(ui, state);
  if (state.lives <= 0) endRun();
}

// --- ONE TAP: find the pillar in that lane, judge it against the line
function tapLane(laneIndex) {
  if (state.phase !== 'playing') return;

  const pillar = findPillarNearLine(field, laneIndex);
  const verdict = judge(pillar ? offsetToLine(pillar) : Infinity, state.portals);

  if (verdict === 'wrong') {
    loseLife(); // the pillar, if there was one, is untouched and still falling
    return;
  }

  removePillar(field, pillar);
  state.hits += 1;
  state.combo += 1;
  state.meter += 1;
  const base = verdict === 'perfect' ? T.POINTS_PERFECT : T.POINTS_HIT;
  state.score += Math.round(base * (1 + (state.combo - 1) * T.COMBO_MULTIPLIER));
  playNote(laneIndex);
  playHit();
  if (state.meter >= T.HITS_PER_PORTAL) openPortal();
  updateHud(ui, state);
  if (state.hits === T.HINT_HIDE_AFTER_HITS) showPlayHint(ui, false); // the hint has taught its first pillars
}

// --- THE PORTAL: the meter filled, so the section ends and the next dimension opens.
// The field clears and the beat grid restarts, which makes the open moment a real break in the music:
// nothing to hit while the ring is open, the meter stays full, and the next pillar is a whole lead away.
function openPortal() {
  state.portals += 1;
  state.portalTimer = T.PORTAL_DURATION;
  setInstrument(state.portals); // Tabla -> Sitar -> Flute -> Dhol -> Santoor
  sizeBand(state.portals);
  resetField(field);
  portalRing.scale.setScalar(T.PORTAL_START_SCALE);
  portalMaterial.opacity = T.PORTAL_OPACITY;
  portalRing.visible = true;
}

function closePortal() {
  state.portalTimer = 0;
  portalRing.visible = false;
}

// The ring opens out and fades over PORTAL_DURATION; when it closes the meter empties and the section starts.
function updatePortal(dt) {
  if (state.portalTimer <= 0) return;
  state.portalTimer = Math.max(0, state.portalTimer - dt);
  const progress = 1 - state.portalTimer / T.PORTAL_DURATION;
  portalRing.scale.setScalar(T.PORTAL_START_SCALE + (1 - T.PORTAL_START_SCALE) * progress);
  portalMaterial.opacity = T.PORTAL_OPACITY * (1 - progress);
  if (state.portalTimer === 0) {
    closePortal();
    state.meter = 0;
    updateHud(ui, state);
  }
}

// --- INPUT: sound wakes on the first keypress, SPACE starts and restarts
createKeyboard({
  onLane: (laneIndex) => {
    unlockAudio();
    tapLane(laneIndex);
  },
  onRestartKey: () => {
    unlockAudio();
    if (state.phase === 'title' || state.phase === 'gameover') startRun();
  },
});

// --- LOOP: dt comes from the frame clock, capped so a stalled frame cannot teleport a pillar
let lastFrame = 0;

renderer.setAnimationLoop((now) => {
  const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 0;
  lastFrame = now;
  if (state.phase === 'playing') {
    updateField(field, dt, state.hits);
    updatePortal(dt);
  }
  renderer.render(scene, camera);
});

ui = createUI(document.getElementById('ui'));
resize(); // the first fit, now that ui.js can be told where the lane label strip ends
sizeBand(0);
updateHud(ui, state);
showTitle(ui, true);
