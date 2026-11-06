// pillars.js — the falling pillars: the beat grid that spawns them, their scroll, and where each one is against the line.
import * as THREE from 'three';
import {
  LANE_COUNT, LANE_WIDTH, PILLAR_WIDTH, PILLAR_HEIGHT, PILLAR_DEPTH,
  PILLAR_COLOR, SCROLL_SPEED, beatGap, SPAWN_Y, DESPAWN_Y, STRIKE_Y,
} from './tuning.js';

// --- FIELD
// One group, one shared box geometry and material; a pillar is a mesh plus which lane it is in.
// makeLabel(lane) comes from labels.js, wired in by main.js: it hands back the pillar's own label plane.
// Nothing here builds or owns a texture, so a hundred pillars cost the same seven as the first seven.
export function createField(scene, makeLabel) {
  const group = new THREE.Group();
  scene.add(group);
  return {
    group,
    makeLabel,
    geometry: new THREE.BoxGeometry(PILLAR_WIDTH, PILLAR_HEIGHT, PILLAR_DEPTH),
    material: new THREE.MeshLambertMaterial({ color: PILLAR_COLOR }),
    active: [],
    beatTimer: 0,
    bag: [],
  };
}

// Full reset: every pillar gone, beat grid back to its first spawn.
export function resetField(field) {
  for (const pillar of field.active) field.group.remove(pillar.mesh);
  field.active.length = 0;
  field.bag.length = 0;
  field.beatTimer = 0;
}

// --- LANES
// Lane 0..6 left to right, centred on x = 0.
export function laneX(laneIndex) {
  return (laneIndex - (LANE_COUNT - 1) / 2) * LANE_WIDTH;
}

// Draw lanes from a shuffled bag so all seven swaras get played and none repeats straight away.
function nextLane(field) {
  if (field.bag.length === 0) {
    field.bag = Array.from({ length: LANE_COUNT }, (_, i) => i);
    for (let i = field.bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [field.bag[i], field.bag[j]] = [field.bag[j], field.bag[i]];
    }
  }
  return field.bag.pop();
}

function spawnPillar(field, laneIndex) {
  const mesh = new THREE.Mesh(field.geometry, field.material);
  mesh.position.set(laneX(laneIndex), SPAWN_Y, 0);
  if (field.makeLabel) mesh.add(field.makeLabel(laneIndex)); // the pillar wears its own key and swara
  field.group.add(mesh);
  field.active.push({ lane: laneIndex, mesh });
}

export function removePillar(field, pillar) {
  const i = field.active.indexOf(pillar);
  if (i >= 0) field.active.splice(i, 1);
  field.group.remove(pillar.mesh);
}

// --- SCROLL + BEAT GRID
// hits is the run's hit count from main.js: the grid starts slow and tightens as pillars are landed.
export function updateField(field, dt, hits) {
  field.beatTimer -= dt;
  while (field.beatTimer <= 0) {
    spawnPillar(field, nextLane(field));
    field.beatTimer += beatGap(hits); // add to the leftover, so the grid never drifts
  }

  for (const pillar of field.active) pillar.mesh.position.y -= SCROLL_SPEED * dt;

  // Past the line with no input, it just keeps falling and drops off the bottom. No score, no life.
  for (let i = field.active.length - 1; i >= 0; i--) {
    if (field.active[i].mesh.position.y < DESPAWN_Y) removePillar(field, field.active[i]);
  }
}

// --- WHERE A PILLAR IS AGAINST THE LINE
// Seconds until it reaches the line; negative means it has already passed.
export function offsetToLine(pillar) {
  return (pillar.mesh.position.y - STRIKE_Y) / SCROLL_SPEED;
}

// The pillar in this lane closest to the line, or null if the lane is empty.
export function findPillarNearLine(field, laneIndex) {
  let best = null;
  let bestDistance = Infinity;
  for (const pillar of field.active) {
    if (pillar.lane !== laneIndex) continue;
    const distance = Math.abs(offsetToLine(pillar));
    if (distance < bestDistance) {
      best = pillar;
      bestDistance = distance;
    }
  }
  return best;
}
