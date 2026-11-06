// main.js — the scene, the render loop and the state machine (title -> playing -> gameover). The only file that wires the others.
import * as THREE from 'three';
import * as T from './tuning.js';
import { createField, resetField, updateField, removePillar, findPillarNearLine, offsetToLine } from './pillars.js';
import { createKeyboard, judge } from './input.js';
import { createUI, updateHud, showTitle, showGameOver } from './ui.js';
import { unlockAudio, playNote, playHit, playMiss } from './audio.js';

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
}
window.addEventListener('resize', resize);
resize();

// --- THE BEAT LINE AND THE DANCER STAND-IN: two plain boxes, replaced by the real world at M4
const line = new THREE.Mesh(
  new THREE.BoxGeometry(FIELD_HALF_WIDTH * 2, T.LINE_THICKNESS, T.LINE_THICKNESS),
  new THREE.MeshBasicMaterial({ color: T.LINE_COLOR }),
);
line.position.set(0, T.STRIKE_Y, 0.4);
scene.add(line);

const dancer = new THREE.Mesh(
  new THREE.BoxGeometry(T.DANCER_WIDTH, T.DANCER_HEIGHT, 0.5),
  new THREE.MeshLambertMaterial({ color: T.DANCER_COLOR }),
);
dancer.position.set(0, T.STRIKE_Y + T.DANCER_HEIGHT / 2, -0.7);
scene.add(dancer);

// --- STATE
const ui = createUI(document.getElementById('ui'));
const field = createField(scene);
const state = { phase: 'title', score: 0, lives: T.LIVES, combo: 0, hits: 0 };

function startRun() {
  state.phase = 'playing';
  state.score = 0;
  state.lives = T.LIVES;
  state.combo = 0;
  state.hits = 0;
  resetField(field); // pillars, beat grid and bag all back to the start
  updateHud(ui, state);
  showTitle(ui, false);
  showGameOver(ui, false, 0);
}

function endRun() {
  state.phase = 'gameover';
  showGameOver(ui, true, state.score);
}

function loseLife() {
  state.lives -= 1;
  state.combo = 0;
  playMiss();
  updateHud(ui, state);
  if (state.lives <= 0) endRun();
}

// --- ONE TAP: find the pillar in that lane, judge it against the line
function tapLane(laneIndex) {
  if (state.phase !== 'playing') return;

  const pillar = findPillarNearLine(field, laneIndex);
  const portalsOpened = Math.floor(state.hits / T.HITS_PER_PORTAL);
  const verdict = judge(pillar ? offsetToLine(pillar) : Infinity, portalsOpened);

  if (verdict === 'wrong') {
    loseLife(); // the pillar, if there was one, is untouched and still falling
    return;
  }

  removePillar(field, pillar);
  state.hits += 1;
  state.combo += 1;
  const base = verdict === 'perfect' ? T.POINTS_PERFECT : T.POINTS_HIT;
  state.score += Math.round(base * (1 + (state.combo - 1) * T.COMBO_MULTIPLIER));
  playNote(laneIndex);
  playHit();
  updateHud(ui, state);
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
  if (state.phase === 'playing') updateField(field, dt);
  renderer.render(scene, camera);
});

updateHud(ui, state);
showTitle(ui, true);
