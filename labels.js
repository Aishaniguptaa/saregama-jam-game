// labels.js — every bit of label text: the key + swara strip under the lanes, and the label on each falling pillar.
import * as THREE from 'three';
import {
  LANE_COUNT, KEYS, SWARAS,
  LABEL_FONT, LABEL_CANVAS_HEIGHT_PX, LABEL_PADDING_PX, LABEL_KEY_GAP_PX,
  LABEL_KEY_COLOR, LABEL_SWARA_COLOR, LABEL_Y, LABEL_Z, LABEL_WIDTH,
  PILLAR_LABEL_WIDTH, PILLAR_LABEL_Z, SHOW_LANE_STRIP,
} from './tuning.js';
import { laneX } from './pillars.js';

// --- ONE LABEL: the key letter and the swara on one line, centred in a canvas of the shared size
function drawLabel(entry, canvasWidth, canvasHeight) {
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  ctx.font = LABEL_FONT;
  ctx.textBaseline = 'middle';

  const keyWidth = ctx.measureText(entry.key).width;
  const swaraWidth = ctx.measureText(entry.swara).width;
  const start = (canvasWidth - (keyWidth + LABEL_KEY_GAP_PX + swaraWidth)) / 2;

  ctx.textAlign = 'left';
  ctx.fillStyle = LABEL_KEY_COLOR;
  ctx.fillText(entry.key, start, canvasHeight / 2); // the key reads brightest: it is what the player presses
  ctx.fillStyle = LABEL_SWARA_COLOR;
  ctx.fillText(entry.swara, start + keyWidth + LABEL_KEY_GAP_PX, canvasHeight / 2);
  return canvas;
}

// --- THE SEVEN LABELS, BUILT ONCE
// One canvas, texture and material per lane, made on first use and shared from then on: the strip and
// every pillar of every run draw from these seven, so a long run cannot grow the texture count.
let shared = null;

function labelKit() {
  if (shared) return shared;

  const entries = Array.from({ length: LANE_COUNT }, (_, lane) => ({
    lane,
    key: (KEYS[lane] ?? '').toUpperCase(),
    swara: SWARAS[lane] ?? '',
  }));

  // Measure with the font the browser really uses, then size one canvas to the widest of the seven.
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = LABEL_FONT;
  let widest = 0;
  for (const entry of entries) {
    const width = probe.measureText(entry.key).width + LABEL_KEY_GAP_PX + probe.measureText(entry.swara).width;
    widest = Math.max(widest, width);
  }
  const canvasHeight = LABEL_CANVAS_HEIGHT_PX;
  const canvasWidth = Math.ceil(widest + LABEL_PADDING_PX * 2);
  const aspect = canvasHeight / canvasWidth; // both planes keep the canvas shape, so the text never stretches

  shared = {
    stripGeometry: new THREE.PlaneGeometry(LABEL_WIDTH, LABEL_WIDTH * aspect),
    stripHeight: LABEL_WIDTH * aspect, // the strip's own height in world units, for whatever needs to sit below it
    pillarGeometry: new THREE.PlaneGeometry(PILLAR_LABEL_WIDTH, PILLAR_LABEL_WIDTH * aspect),
    materials: entries.map((entry) => {
      const texture = new THREE.CanvasTexture(drawLabel(entry, canvasWidth, canvasHeight));
      texture.colorSpace = THREE.SRGBColorSpace;
      return new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true, // the canvas is only text; no box behind it
        depthWrite: false, // and it never hides what is in front of it
      });
    }),
  };
  return shared;
}

// --- THE STRIP: one plane per lane, in the scene, so window size and aspect cannot knock it out of line
export function createLabels(scene) {
  const kit = labelKit();
  const group = new THREE.Group();
  group.position.set(0, LABEL_Y, LABEL_Z);
  for (let lane = 0; lane < LANE_COUNT; lane++) {
    const label = new THREE.Mesh(kit.stripGeometry, kit.materials[lane]);
    label.position.x = laneX(lane);
    group.add(label);
  }
  group.visible = false; // the title screen carries its own legend; the strip belongs to play
  scene.add(group);
  return group;
}

// --- WHERE THE STRIP ENDS: its lowest world y. main.js turns this into pixels, so the play hint can be
// kept clear of the strip on any window shape instead of hoping a percentage of the height is enough.
export function stripBottomY() {
  return LABEL_Y - labelKit().stripHeight / 2;
}

// --- A PILLAR'S OWN LABEL: the same text on a plane just in front of the pillar's face.
// The view is fixed and side-on, so the plane needs no rotation. pillars.js adds this as a child of the
// pillar mesh: it falls with the pillar, and goes away with it.
export function createPillarLabel(laneIndex) {
  const kit = labelKit();
  const label = new THREE.Mesh(kit.pillarGeometry, kit.materials[laneIndex]);
  label.position.z = PILLAR_LABEL_Z;
  return label;
}

// --- VISIBILITY: the strip lives exactly as long as the pillars do, and only if the makers want it
export function showLabels(group, visible) {
  group.visible = SHOW_LANE_STRIP && visible;
}
