// main.js — the scene, the render loop and the state machine (title -> playing -> gameover): the one file that wires the others.
import * as THREE from 'three';
import * as T from './tuning.js';
import { createField, resetField, updateField, pressPillar, setColumnX, loadPillarModels, loadDancerModel } from './pillars.js';
import { createPillarLabel } from './labels.js';
import { createKeyboard } from './input.js';
import { createUI, updateHud, showTitle, showGameOver, showPlayHint, setInstruments } from './ui.js';
import { unlockAudio, playNote, playHit, playMiss, setInstrument } from './audio.js';

// --- RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.insertBefore(renderer.domElement, document.getElementById('ui'));

// --- SCENE: the player stands still and the temple travels past, so the fog closes the far end of the
// hall and the stones and the paving bands glide by. The camera looks straight down the hall and never
// turns, which is also why nothing in the scene ever needs to be turned to face it.
const scene = new THREE.Scene();
scene.background = new THREE.Color(T.BACKGROUND_COLOR);
scene.fog = new THREE.Fog(T.BACKGROUND_COLOR, T.FOG_NEAR, T.FOG_FAR);

// --- CAMERA
// Motion down the hall is only visible in perspective, so the camera is a perspective one, standing still
// behind the player. Its distance comes from the corridor height that has to be visible at the press
// point, so the framing is the same on every window shape and only the aspect changes with the window.
const camera = new THREE.PerspectiveCamera(T.CAMERA_FOV, 1, T.CAMERA_NEAR, T.CAMERA_FAR);
camera.position.set(0, T.CAMERA_Y, T.CAMERA_DISTANCE);
camera.lookAt(0, T.CAMERA_Y, 0);

// --- LIGHTS: a warm key from the left and a cool fill from the right, so the carving keeps its shape and
// the stone never goes flat and muddy. Both are dialled in tuning.js.
scene.add(new THREE.AmbientLight(0xffffff, T.AMBIENT_INTENSITY));
const keyLight = new THREE.DirectionalLight(T.KEY_LIGHT_COLOR, T.KEY_LIGHT_INTENSITY);
keyLight.position.set(-6, 9, 7);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(T.FILL_LIGHT_COLOR, T.FILL_LIGHT_INTENSITY);
fillLight.position.set(7, 4, 6);
scene.add(fillLight);

// --- THE FIELD: the travelling pillar line, the hall, the floor and the dancer. Built once, reused every
// run. The carvings arrive when they arrive: every pillar is a plain grey box and the dancer is a plain
// box from the first frame, and anything that cannot load simply stays that way. Nothing waits on 16 MB
// of models, so the title screen never stalls and the game never breaks with them.
const field = createField(scene, createPillarLabel, camera);
loadPillarModels(field);
loadDancerModel(field);

// Every window shape shows the same corridor, and the pillar line keeps its place across the screen:
// PILLAR_COLUMN_SPLIT of the way across, on the right, wherever the window's shape puts the edges.
function resize() {
  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  setColumnX(field, (2 * T.PILLAR_COLUMN_SPLIT - 1) * T.CAMERA_DISTANCE * T.TAN_HALF_FOV * aspect);
}
window.addEventListener('resize', resize);

// --- STATE
// orchestra is how many instruments are playing: one at the start of a run, and a portal raises it by one.
let ui = null;
const state = { phase: 'title', score: 0, lives: T.LIVES, combo: 0, hits: 0, orchestra: 1 };

function startRun() {
  state.phase = 'playing';
  state.score = 0;
  state.lives = T.LIVES;
  state.combo = 0;
  state.hits = 0;
  state.orchestra = 1;
  resetField(field); // the whole line goes back down the corridor and the notes are dealt again
  setInstrument(state.orchestra - 1);
  setInstruments(ui, state.orchestra);
  updateHud(ui, state);
  showTitle(ui, false);
  showGameOver(ui, false, 0);
  showPlayHint(ui, true);
}

function endRun() {
  state.phase = 'gameover';
  showGameOver(ui, true, state.score);
  showPlayHint(ui, false);
}

function loseLife() {
  state.lives -= 1;
  state.combo = 0;
  playMiss();
  updateHud(ui, state);
  if (state.lives <= 0) endRun();
}

// --- ONE KEYPRESS, JUDGED AGAINST THE LIGHT
// The right key on the lit pillar scores: dead on the beat for full points, anywhere in the glow for less.
// A key pressed with nothing lit, a repeat press on a pillar already answered, and a light left to go out
// all cost nothing at all. The only thing that costs a life is a wrong key on a lit pillar.
function tapLane(lane) {
  if (state.phase !== 'playing') return;

  const verdict = pressPillar(field, lane);
  if (verdict === 'wrong') {
    loseLife();
    return;
  }
  if (verdict !== 'perfect' && verdict !== 'hit') return;

  state.hits += 1;
  state.combo += 1;
  const base = verdict === 'perfect' ? T.POINTS_PERFECT : T.POINTS_HIT;
  state.score += Math.round(base * (1 + (state.combo - 1) * T.COMBO_MULTIPLIER));
  playNote(lane);
  playHit();
  updateHud(ui, state);
  if (state.hits === T.HINT_HIDE_AFTER_HITS) showPlayHint(ui, false); // the hint has taught its first beats
}

// --- INPUT: sound wakes on the first keypress, SPACE starts and restarts
createKeyboard({
  onLane: (lane) => {
    unlockAudio();
    tapLane(lane);
  },
  onRestartKey: () => {
    unlockAudio();
    if (state.phase === 'title' || state.phase === 'gameover') startRun();
  },
});

// --- LOOP: dt comes from the frame clock, capped so a stalled frame cannot skip a whole beat
let lastFrame = 0;

renderer.setAnimationLoop((now) => {
  const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 0;
  lastFrame = now;
  // The hall glides on the title and game-over screens too; only the light cue stops.
  updateField(field, dt, state.hits, state.phase === 'playing');
  renderer.render(scene, camera);
});

ui = createUI(document.getElementById('ui'));
resize();
updateHud(ui, state);
setInstruments(ui, state.orchestra);
showTitle(ui, true);
showGameOver(ui, false, 0);
