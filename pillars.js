// pillars.js — the travelling pillar line (the makers' carvings, the long glow cue they answer), the hall and floor gliding past, and the dancer.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { setLabelLane } from './labels.js';
import {
  LANE_COUNT, PRESS_Z, PLAY_PILLAR_COUNT, PILLAR_SPACING, PILLAR_WIDTH, PILLAR_HEIGHT, PILLAR_DEPTH,
  PILLAR_BASE_Y, PILLAR_RECYCLE_Z, PILLAR_COLOR, PILLAR_LIGHT_COLOR, PILLAR_HIT_COLOR,
  PILLAR_LIGHT_INTENSITY, PILLAR_GLOW_SCALE, PILLAR_GLOW_OPACITY, PILLAR_LABEL_Y, PILLAR_LABEL_Z,
  PILLAR_LABEL_CLEARANCE, FLASH_KEY_ON_GLOW, FLASH_CYCLES_PER_GLOW, FLASH_LOW, GLOW_RAMP_SHARE,
  GLOW_RENDER_ORDER, LABEL_RENDER_ORDER,
  GLOW_AFTER_SECONDS, PERFECT_SECONDS, HIT_SECONDS, HIT_LEVEL, GLOW_LEVEL, glowBefore,
  START_BEAT_GAP, beatGap, travelSpeed,
  PILLAR_MODEL_URLS, PILLAR_FALLBACK_MODEL_URL, PILLAR_MODEL_METALNESS,
  DANCER_WIDTH, DANCER_HEIGHT, DANCER_X, DANCER_Z, DANCER_YAW, DANCER_COLOR,
  HALL_ROW_X, HALL_PILLARS_PER_ROW, HALL_PILLAR_SPACING, HALL_PILLAR_WIDTH, HALL_PILLAR_HEIGHT,
  HALL_PILLAR_DEPTH, HALL_WRAP_Z, HALL_PILLAR_COLOR,
  FLOOR_BAND_COUNT, FLOOR_BAND_SPACING, FLOOR_BAND_WIDTH, FLOOR_BAND_DEPTH, FLOOR_BAND_HEIGHT,
  FLOOR_DEPTH, FLOOR_COLOR,
} from './tuning.js';

// --- THE TEMPLE WALLS: a continuous carved wall down each side of the corridor, in place of the old two
// rows of separate hall stones. A stepped base, a carved face carrying pilasters and recessed panels, a
// decorated frieze under a projecting cornice, and a lit capstone along the very top; open above, so the
// sky stays the game's whole look. Cool desaturated grey only, never warm stone.
const WALL_INNER_X = HALL_ROW_X;       // the inner faces sit on the old hall-stone line, well clear of the pillar line
const WALL_THICKNESS = 1.2;            // how far each wall runs back from its inner face
const WALL_PLINTH_HEIGHT = 0.7;        // the footing course at the base
const WALL_PLINTH_PROJECT = 0.22;      // the plinth steps this far toward the corridor
const WALL_PLINTH_MOULDING_HEIGHT = 0.2;   // the moulding step laid on top of the plinth course
const WALL_PLINTH_MOULDING_PROJECT = 0.34; // the moulding stands further forward than the plinth under it
const WALL_FACE_HEIGHT = 4.1;          // the carved wall face above the base: raised from 3.6, so the wall reads grander
const WALL_CORNICE_HEIGHT = 0.5;       // the band along the top edge
const WALL_CORNICE_PROJECT = 0.28;     // the cornice steps this far toward the corridor
const WALL_SHADOW_LINE_HEIGHT = 0.07;  // the narrow groove between the cornice and the capstone
const WALL_SHADOW_LINE_PROJECT = 0.16; // it sits back from both, so that groove reads as shadow, not stone
const WALL_CAPSTONE_HEIGHT = 0.22;     // the lit capstone along the very top of the wall
const WALL_CAPSTONE_PROJECT = 0.44;    // it oversails the cornice: the wall's grand top edge, still clear of the pillar lane
const WALL_SEGMENT_COUNT = 8;          // wall pieces per side in the recycled pool
const WALL_SEGMENT_LENGTH = 9;         // world units each piece runs down the corridor
const WALL_SPAN = WALL_SEGMENT_COUNT * WALL_SEGMENT_LENGTH; // how far the pool reaches before it wraps
const WALL_WRAP_Z = HALL_WRAP_Z - WALL_SEGMENT_LENGTH / 2;  // a piece wraps when its leading edge reaches the hall's wrap line
const WALL_TILE_LENGTH = 2.25;         // world units one texture tile covers along the run
const WALL_PILASTER_WIDTH = 0.5;       // a full pilaster's width, made of two half-pilasters meeting at the seams
const WALL_CAP_BAND = 0.4;             // the base and capital moulding band at the foot and head of a pilaster
const WALL_FRIEZE_HEIGHT = 0.6;        // the decorated band under the cornice, carved out of the same face
const WALL_FRIEZE_MOTIF_COUNT = 4;     // carved motifs repeated across one bay of the frieze
const WALL_FRIEZE_MOTIF_WIDTH = 0.46;  // how much of its slot across a motif's carved block fills
const WALL_FRIEZE_MOTIF_HEIGHT = 0.56; // how much of the band's height a motif's carved block fills
const WALL_FRIEZE_DIAMOND = 0.34;      // the diamond cut into each block, as a share of the block's smaller side
const WALL_TEXTURE_PX = 512;           // the carving canvas, drawn once in code, nothing downloaded
// The stone is deliberately cool. The scene's key light is warm, so a warm grey-brown stone turns orange
// under it and the wall stops reading as the temple at all: this sits on the cool side of grey, so the
// light brings it back to neutral stone. Gold is never used here - gold belongs to the pillars' glow.
const WALL_FACE_COLOR = 0x6b6e6a;      // the wall stone: a cool desaturated grey, never warm
const WALL_FACE_STYLE = '#' + WALL_FACE_COLOR.toString(16).padStart(6, '0');
const WALL_PANEL_STYLE = '#3b3e38';    // the recessed panel, deepened: at a distance the recess is the carving
const WALL_FRIEZE_STYLE = '#5c6058';   // the frieze ground: a shade darker than the face, so the band reads
const WALL_PILASTER_STYLE = '#9da297'; // the raised pilaster, lightened again: it must stand out against the recess
const WALL_PLINTH_COLOR = 0x585b56;    // the plinth course, darker than the stone
const WALL_MOULDING_COLOR = 0x7c8079;  // the moulding step over the plinth: mid grey, between plinth and face
const WALL_CORNICE_COLOR = 0x949891;   // the cornice band, lighter, so the wall carries a lit top edge
const WALL_SHADOW_COLOR = 0x3a3d37;    // the groove beneath the capstone: the wall's deepest shadow line
const WALL_CAPSTONE_COLOR = 0xa4a99e;  // the lit capstone along the top: the lightest stone on the wall, still grey

// --- THE FLOOR PAVING: the stone courtyard the whole temple stands on, drawn in code like the walls.
// Same reasoning as the wall stone: the scene's key light is warm, so a warm brown floor turns orange
// under it. This sits on the cool side of grey too, so the light brings it back to neutral paving stone.
const FLOOR_TEXTURE_PX = 512;         // the paving canvas, drawn once in code, nothing downloaded
const FLOOR_TILE_WORLD = 3.0;         // world units one whole canvas tile covers, across and along
const FLOOR_SLABS_ACROSS = 2;         // slabs across one tile, so each slab reads about 1.5 units wide
const FLOOR_SLABS_ALONG = 2;          // slabs along one tile, so each slab reads about 1.5 units deep
const FLOOR_SLAB_SHADE = 0.13;        // how far one slab's tone strays from its neighbours: softened from 0.16, since
                                      // this tonal step is now the floor's only division and must never draw an edge
const FLOOR_MOTTLE_COUNT = 70;        // faint weathering blotches, so the tile's repeat is hard to spot
const FLOOR_TEXTURE_ANISOTROPY = 8;   // keeps the paving readable at the grazing angle the floor is seen at
const FLOOR_STONE_COLOR = 0x686b64;   // the paving stone, and the paving bands: a cool grey, never warm
const FLOOR_STONE_STYLE = '#' + FLOOR_STONE_COLOR.toString(16).padStart(6, '0');

// --- ONE BAY OF THE WALL, DRAWN IN CODE
// The whole carving is a canvas texture: no file is downloaded for it. A tile is one bay of the mandapa - a
// pilaster down each edge (two halves that meet to make one pilaster where two tiles join) and a recessed
// panel between them, over block courses with a little vertical weathering so the repeat is hard to spot.
// A decorated frieze carries across the top of the bay, under the cornice. Cool desaturated grey only: the
// gold belongs to the pillar glow and never appears on the walls.
function makeWallTexture() {
  const size = WALL_TEXTURE_PX;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx === null) return null;            // no canvas: the walls fall back to flat stone, never an error
  const across = size / WALL_TILE_LENGTH;   // pixels per world unit along the run
  const up = size / WALL_FACE_HEIGHT;       // pixels per world unit up the wall
  const px = (world) => world * across;
  const py = (world) => size - world * up;  // world height measured up from the foot

  // the carving - pilasters and recessed panels - stops here, and the decorated frieze runs above it,
  // so the frieze carries across the pilaster heads the way an entablature carries across a colonnade
  const carveTop = WALL_FACE_HEIGHT - WALL_FRIEZE_HEIGHT;

  // the stone ground
  ctx.fillStyle = WALL_FACE_STYLE;
  ctx.fillRect(0, 0, size, size);

  // the recessed panel between the two half-pilasters
  const panelLeft = px(WALL_PILASTER_WIDTH / 2);
  const panelRight = px(WALL_TILE_LENGTH - WALL_PILASTER_WIDTH / 2);
  const panelTop = py(carveTop - WALL_CAP_BAND);
  const panelBottom = py(WALL_CAP_BAND);
  ctx.fillStyle = WALL_PANEL_STYLE;
  ctx.fillRect(panelLeft, panelTop, panelRight - panelLeft, panelBottom - panelTop);

  // block courses: a shallow tonal step between rows and a staggered joint, so the stone reads as many
  // blocks rather than one slab
  const course = 0.45; // world units per course
  for (let row = 0; row * course < WALL_FACE_HEIGHT; row++) {
    const shade = (Math.random() - 0.5) * 0.1;
    ctx.fillStyle = shade > 0 ? `rgba(255,246,228,${shade})` : `rgba(30,26,20,${-shade})`;
    ctx.fillRect(0, py((row + 1) * course), size, course * up);
    ctx.fillStyle = 'rgba(30,32,28,0.34)';
    ctx.fillRect(px(Math.random() * WALL_TILE_LENGTH), py((row + 1) * course), 4, course * up);
  }

  // weathering: faint vertical streaking, dark and light, that breaks up the repeat
  for (let i = 0; i < 16; i++) {
    const sx = Math.random() * size;
    const w = (0.04 + Math.random() * 0.12) * across;
    const alpha = 0.04 + Math.random() * 0.07;
    const grad = ctx.createLinearGradient(sx, 0, sx + w, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, Math.random() < 0.6 ? `rgba(34,29,23,${alpha})` : `rgba(222,213,194,${alpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(sx, 0, w, size);
  }

  // the pilasters: each tile carries half a pilaster at either edge, so two tiles meet to make a whole
  // one. The relief is pushed hard - a deep shadow line into the panel, a bright lit edge on the outer
  // corner - because at the low angle the wall is seen from, that contrast is what reads as carving.
  const halfWidth = px(WALL_PILASTER_WIDTH / 2);
  const capTop = py(carveTop - WALL_CAP_BAND);
  const capBottom = py(WALL_CAP_BAND);
  for (const leftHalf of [true, false]) {
    const x0 = leftHalf ? 0 : size - halfWidth;
    ctx.fillStyle = WALL_PILASTER_STYLE;
    ctx.fillRect(x0, capTop, halfWidth, size - capTop);
    ctx.fillStyle = 'rgba(38,40,36,0.18)';     // a wash so the pilaster is not flat
    ctx.fillRect(x0, capTop, halfWidth, (size - capTop) * 0.5);
    ctx.fillStyle = 'rgba(18,20,18,0.74)';     // base and capital moulding lines: deeper and wider than before
    ctx.fillRect(x0, capTop, halfWidth, 8);
    ctx.fillRect(x0, capBottom, halfWidth, 8);
    ctx.fillStyle = 'rgba(8,9,8,0.9)';         // the shadowed joint where it meets the panel: this line IS the relief
    ctx.fillRect(leftHalf ? x0 + halfWidth - 10 : x0, capTop, 10, size - capTop);
    ctx.fillStyle = 'rgba(244,247,240,0.6)';   // the lit outer edge, raised again: the pilaster catches the light
    ctx.fillRect(leftHalf ? x0 : x0 + halfWidth - 7, capTop, 7, size - capTop);
  }

  // the panel bevel: lit along the top, shadowed along the foot, both pushed harder than before
  ctx.fillStyle = 'rgba(242,246,238,0.5)';
  ctx.fillRect(panelLeft, panelTop, panelRight - panelLeft, 6);
  ctx.fillStyle = 'rgba(8,9,8,0.78)';
  ctx.fillRect(panelLeft, panelBottom - 8, panelRight - panelLeft, 8);

  // a shallow carved relief in the panel: an inset frame around a small diamond
  const inset = px(0.2);
  const frameTop = panelTop + 0.18 * up;
  const frameBottom = panelBottom - 0.18 * up;
  ctx.strokeStyle = 'rgba(14,16,14,0.6)';
  ctx.lineWidth = 6;
  ctx.strokeRect(panelLeft + inset, frameTop, panelRight - panelLeft - 2 * inset, frameBottom - frameTop);
  const cx = (panelLeft + panelRight) / 2;
  const cy = (frameTop + frameBottom) / 2;
  const r = Math.min((panelRight - panelLeft) * 0.18, (frameBottom - frameTop) * 0.2);
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.7, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r * 0.7, cy);
  ctx.closePath();
  ctx.fillStyle = 'rgba(10,11,10,0.42)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(10,11,10,0.72)';
  ctx.stroke();

  // the frieze: a continuous decorated band under the cornice, painted over the pilaster heads, so it runs
  // the whole length of the wall with the lit order above it and a shadow at its foot to read as raised
  const friezeTop = py(WALL_FACE_HEIGHT);
  const friezeBottom = py(carveTop);
  ctx.fillStyle = WALL_FRIEZE_STYLE;
  ctx.fillRect(0, friezeTop, size, friezeBottom - friezeTop);
  ctx.fillStyle = 'rgba(242,246,238,0.36)';                 // the lit upper order of the band
  ctx.fillRect(0, friezeTop, size, 4);
  ctx.fillStyle = 'rgba(8,9,8,0.7)';                        // the shadow at its foot, so the band stands proud
  ctx.fillRect(0, friezeBottom - 6, size, 6);

  // the motifs on it: a raised block with a diamond cut into it, repeated along the band, each lit from
  // the upper left and shadowed to the lower right so the carving reads at a distance
  const motifW = (size / WALL_FRIEZE_MOTIF_COUNT) * WALL_FRIEZE_MOTIF_WIDTH;
  const motifH = (friezeBottom - friezeTop) * WALL_FRIEZE_MOTIF_HEIGHT;
  const motifY = (friezeTop + friezeBottom) / 2 - motifH / 2;
  for (let i = 0; i < WALL_FRIEZE_MOTIF_COUNT; i++) {
    const motifX = ((i + 0.5) * size) / WALL_FRIEZE_MOTIF_COUNT - motifW / 2;
    ctx.fillStyle = 'rgba(8,9,8,0.5)';
    ctx.fillRect(motifX + 4, motifY + 4, motifW, motifH);    // the block's own cast shadow, down and to the right
    ctx.fillStyle = 'rgba(236,240,232,0.34)';
    ctx.fillRect(motifX, motifY, motifW, motifH);            // the lit face of the block
    const dx = motifX + motifW / 2;
    const dy = motifY + motifH / 2;
    const dr = Math.min(motifW, motifH) * WALL_FRIEZE_DIAMOND;
    ctx.beginPath();                                         // the diamond cut into the block
    ctx.moveTo(dx, dy - dr);
    ctx.lineTo(dx + dr * 0.7, dy);
    ctx.lineTo(dx, dy + dr);
    ctx.lineTo(dx - dr * 0.7, dy);
    ctx.closePath();
    ctx.fillStyle = 'rgba(8,9,8,0.42)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(8,9,8,0.72)';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(WALL_SEGMENT_LENGTH / WALL_TILE_LENGTH, 1); // whole tiles along the run, one tile tall
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// --- ONE TILE OF THE FLOOR, DRAWN IN CODE
// A square canvas holding a run of large paving slabs, each a slightly different tone, with faint
// mottling and weathering over the top so the tile's own repeat is hard to spot. There are no joint
// grooves and no lit edges anywhere on it: the paving reads as continuous dressed stone, and the only
// thing marking one slab from the next is that soft tonal step, so nothing draws a grid across the floor
// and no hard line runs away into the distance. No file is downloaded for it.
function makeFloorTexture() {
  const size = FLOOR_TEXTURE_PX;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx === null) return null;            // no canvas: the floor falls back to flat stone, never an error
  const cols = FLOOR_SLABS_ACROSS;
  const rows = FLOOR_SLABS_ALONG;
  const slabW = size / cols;
  const slabH = size / rows;

  // the stone ground
  ctx.fillStyle = FLOOR_STONE_STYLE;
  ctx.fillRect(0, 0, size, size);

  // each slab a little lighter or darker than its neighbours, so no two read as the same stone. This
  // tonal step is the floor's ONLY division: there is no joint groove and no lit edge, so the eye reads
  // dressed stone rather than a grid, and the step repeats seamlessly where one tile meets the next.
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const shade = (Math.random() - 0.5) * FLOOR_SLAB_SHADE;
      ctx.fillStyle = shade > 0 ? `rgba(244,246,240,${shade})` : `rgba(22,24,22,${-shade})`;
      ctx.fillRect(c * slabW, r * slabH, slabW, slabH);
    }
  }

  // weathering: faint dark and light blotches and streaks, so the tile's repeat is hard to spot and the
  // slab edges are broken up rather than drawn
  for (let i = 0; i < FLOOR_MOTTLE_COUNT; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const w = (0.05 + Math.random() * 0.16) * size;
    const h = (0.05 + Math.random() * 0.22) * size;
    const alpha = 0.02 + Math.random() * 0.05;
    ctx.fillStyle = Math.random() < 0.5 ? `rgba(238,241,234,${alpha})` : `rgba(24,26,23,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(FLOOR_BAND_WIDTH / FLOOR_TILE_WORLD, FLOOR_DEPTH / FLOOR_TILE_WORLD); // one slab ~1.5 units
  texture.anisotropy = FLOOR_TEXTURE_ANISOTROPY;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// --- FIELD
// Everything is built once, at its starting place, and reused for every run: the six travelling pillars,
// a fixed pool of wall pieces, a fixed set of paving bands, and the dancer. A run only ever moves things
// and swaps which carving a pillar wears, so the hundredth beat costs what the first one cost.
export function createField(scene, makeLabel, camera = null) {
  const group = new THREE.Group();
  scene.add(group);

  // --- THE PILLARS: one line of them, on the right, travelling past the press point and off behind it.
  // A pillar is one group holding three things: its body (a plain grey box until a carving loads, and
  // always the fallback if one never does), its additive halo, and - behind the FLASH_KEY_ON_GLOW switch
  // - the key letter, which only shows while this pillar is the lit one. Only wear(), applyLight() and
  // applyLabel() have to know what is in place.
  const bodyGeometry = new THREE.BoxGeometry(PILLAR_WIDTH, PILLAR_HEIGHT, PILLAR_DEPTH);
  bodyGeometry.translate(0, PILLAR_BASE_Y + PILLAR_HEIGHT / 2, 0); // the group's origin is the pillar's base
  const glowGeometry = new THREE.BoxGeometry(
    PILLAR_WIDTH * PILLAR_GLOW_SCALE,
    PILLAR_HEIGHT * PILLAR_GLOW_SCALE,
    PILLAR_DEPTH * PILLAR_GLOW_SCALE,
  );
  glowGeometry.translate(0, PILLAR_BASE_Y + PILLAR_HEIGHT / 2, 0);

  const pillars = [];
  for (let i = 0; i < PLAY_PILLAR_COUNT; i++) {
    const object = new THREE.Group();

    const material = new THREE.MeshLambertMaterial({ color: PILLAR_COLOR, emissive: 0x000000, emissiveIntensity: 0 });
    const box = new THREE.Mesh(bodyGeometry, material);
    const boxHolder = new THREE.Group();
    boxHolder.add(box);
    object.add(boxHolder);

    // The halo: additive, so it brightens the stone and the dark around it without hiding either.
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: PILLAR_LIGHT_COLOR,
      transparent: true,
      opacity: 0,
      depthWrite: false, // it draws over the pillar, but never hides it
      blending: THREE.AdditiveBlending,
      fog: false,        // fog would wash the halo out grey instead of letting it add
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.renderOrder = GLOW_RENDER_ORDER;
    glow.visible = false; // and it is only on the card while its pillar is lit
    object.add(glow);

    const label = (FLASH_KEY_ON_GLOW && makeLabel) ? makeLabel(i % LANE_COUNT) : null;
    if (label) {
      label.position.set(0, PILLAR_BASE_Y + PILLAR_LABEL_Y, PILLAR_LABEL_Z);
      label.renderOrder = LABEL_RENDER_ORDER; // it draws last, so the letter is never washed out by the halo
      object.add(label);
    }

    group.add(object);
    pillars.push({
      object, glow, label, boxHolder, boxMaterial: material,
      skins: new Map(), skin: null, materials: [material],
      lane: i % LANE_COUNT, modelId: i % PILLAR_MODEL_URLS.length, answered: false, popTimer: 0, lit: false,
    });
    pillars[i].skin = { content: boxHolder, materials: [material] };
    pillars[i].skins.set(-1, pillars[i].skin);
  }

  // --- THE HALL: two continuous carved walls, one down each side, and the paved floor they stand on.
  // Each side is a pool of identical segments that tile edge to edge and recycle like the old stones, so
  // the wall is endless and no piece is ever seen to pop or vanish mid-frame.
  const wallTexture = makeWallTexture();
  // Lambert, like the floor, the paving and the pillars: the walls then take the scene's light exactly the
  // way the rest of the temple does, instead of sitting in it looking like a separate material.
  const wallFaceMaterial = new THREE.MeshLambertMaterial({
    map: wallTexture,
    color: wallTexture === null ? WALL_FACE_COLOR : 0xffffff, // the map carries the colour; the fallback is flat stone
  });
  const wallPlinthMaterial = new THREE.MeshLambertMaterial({ color: WALL_PLINTH_COLOR });
  const wallMouldingMaterial = new THREE.MeshLambertMaterial({ color: WALL_MOULDING_COLOR });
  const wallCorniceMaterial = new THREE.MeshLambertMaterial({ color: WALL_CORNICE_COLOR });
  const wallShadowMaterial = new THREE.MeshLambertMaterial({ color: WALL_SHADOW_COLOR });
  const wallCapstoneMaterial = new THREE.MeshLambertMaterial({ color: WALL_CAPSTONE_COLOR });

  const plinthGeometry = new THREE.BoxGeometry(WALL_THICKNESS + WALL_PLINTH_PROJECT, WALL_PLINTH_HEIGHT, WALL_SEGMENT_LENGTH);
  const mouldingGeometry = new THREE.BoxGeometry(WALL_THICKNESS + WALL_PLINTH_MOULDING_PROJECT, WALL_PLINTH_MOULDING_HEIGHT, WALL_SEGMENT_LENGTH);
  const wallFaceGeometry = new THREE.BoxGeometry(WALL_THICKNESS, WALL_FACE_HEIGHT, WALL_SEGMENT_LENGTH);
  const corniceGeometry = new THREE.BoxGeometry(WALL_THICKNESS + WALL_CORNICE_PROJECT, WALL_CORNICE_HEIGHT, WALL_SEGMENT_LENGTH);
  const shadowGeometry = new THREE.BoxGeometry(WALL_THICKNESS + WALL_SHADOW_LINE_PROJECT, WALL_SHADOW_LINE_HEIGHT, WALL_SEGMENT_LENGTH);
  const capstoneGeometry = new THREE.BoxGeometry(WALL_THICKNESS + WALL_CAPSTONE_PROJECT, WALL_CAPSTONE_HEIGHT, WALL_SEGMENT_LENGTH);
  const wallFaceBottom = WALL_PLINTH_HEIGHT + WALL_PLINTH_MOULDING_HEIGHT; // the face sits on plinth course + moulding
  const wallFaceTop = wallFaceBottom + WALL_FACE_HEIGHT;
  const wallCorniceTop = wallFaceTop + WALL_CORNICE_HEIGHT;
  const wallShadowTop = wallCorniceTop + WALL_SHADOW_LINE_HEIGHT;
  const wallCentreX = WALL_INNER_X + WALL_THICKNESS / 2; // the box centres, so each inner face lands on WALL_INNER_X

  const walls = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < WALL_SEGMENT_COUNT; i++) {
      const segment = new THREE.Group();

      const plinth = new THREE.Mesh(plinthGeometry, wallPlinthMaterial);
      plinth.position.y = WALL_PLINTH_HEIGHT / 2;
      const moulding = new THREE.Mesh(mouldingGeometry, wallMouldingMaterial);
      moulding.position.y = WALL_PLINTH_HEIGHT + WALL_PLINTH_MOULDING_HEIGHT / 2;
      const face = new THREE.Mesh(wallFaceGeometry, wallFaceMaterial);
      face.position.y = wallFaceBottom + WALL_FACE_HEIGHT / 2;
      const cornice = new THREE.Mesh(corniceGeometry, wallCorniceMaterial);
      cornice.position.y = wallFaceTop + WALL_CORNICE_HEIGHT / 2;
      const shadow = new THREE.Mesh(shadowGeometry, wallShadowMaterial);
      shadow.position.y = wallCorniceTop + WALL_SHADOW_LINE_HEIGHT / 2;
      const capstone = new THREE.Mesh(capstoneGeometry, wallCapstoneMaterial);
      capstone.position.y = wallShadowTop + WALL_CAPSTONE_HEIGHT / 2;
      segment.add(plinth, moulding, face, cornice, shadow, capstone);

      // centres are offset by half a length, so consecutive pieces tile edge to edge from the wrap line back
      segment.position.set(side * wallCentreX, 0, HALL_WRAP_Z - (i + 0.5) * WALL_SEGMENT_LENGTH);
      group.add(segment);
      walls.push(segment);
    }
  }

  const floorTexture = makeFloorTexture();
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(FLOOR_BAND_WIDTH, FLOOR_DEPTH),
    new THREE.MeshLambertMaterial({
      map: floorTexture,
      color: floorTexture === null ? FLOOR_COLOR : 0xffffff, // the map carries the paving; the fallback is flat stone
    }),
  );
  floor.rotation.x = -Math.PI / 2; // the plane lies flat: its own +y runs into the distance
  floor.position.set(0, 0, HALL_WRAP_Z - FLOOR_DEPTH / 2);
  group.add(floor);

  const bandGeometry = new THREE.BoxGeometry(FLOOR_BAND_WIDTH, FLOOR_BAND_HEIGHT, FLOOR_BAND_DEPTH);
  // the same stone tone as the paving under it, so the bands read as part of the floor, not another material
  const bandMaterial = new THREE.MeshLambertMaterial({ color: FLOOR_STONE_COLOR });
  const bandSpan = FLOOR_BAND_COUNT * FLOOR_BAND_SPACING;
  const bands = [];
  for (let i = 0; i < FLOOR_BAND_COUNT; i++) {
    const band = new THREE.Mesh(bandGeometry, bandMaterial);
    band.position.set(0, FLOOR_BAND_HEIGHT / 2, HALL_WRAP_Z - i * FLOOR_BAND_SPACING);
    group.add(band);
    bands.push(band);
  }

  // --- THE DANCER: on the left, facing down the corridor, a plain box until her carving arrives
  const dancerObject = new THREE.Group();
  dancerObject.position.set(DANCER_X, 0, DANCER_Z);
  dancerObject.rotation.y = DANCER_YAW;
  const dancerGeometry = new THREE.BoxGeometry(DANCER_WIDTH, DANCER_HEIGHT, DANCER_WIDTH);
  dancerGeometry.translate(0, DANCER_HEIGHT / 2, 0);
  const dancerBox = new THREE.Mesh(dancerGeometry, new THREE.MeshLambertMaterial({ color: DANCER_COLOR }));
  dancerObject.add(dancerBox);
  group.add(dancerObject);

  const field = {
    group, pillars, walls, bands, camera,
    dancer: { object: dancerObject, box: dancerBox },
    bandSpan, columnX: 0,
    models: new Array(PILLAR_MODEL_URLS.length).fill(null),
    gap: START_BEAT_GAP, speed: travelSpeed(START_BEAT_GAP), cycleCursor: 0,
    litPillar: null, litOffset: 0, bag: [],
  };
  resetField(field);
  return field;
}

// --- BACK TO THE START OF A RUN
// Every pillar goes back to its place down the corridor, one spacing apart, so the first one arrives
// exactly one beat from now and the interval between arrivals is the beat from the first beat on.
export function resetField(field) {
  field.gap = START_BEAT_GAP;
  field.speed = travelSpeed(START_BEAT_GAP);
  field.litPillar = null;
  field.litOffset = 0;
  field.cycleCursor = 0;
  field.bag.length = 0;
  field.pillars.forEach((pillar, index) => placeAt(field, pillar, -(index + 1) * PILLAR_SPACING));
  paintLights(field, true);
}

// main.js works out where the line sits across the screen on this window shape and tells us.
export function setColumnX(field, x) {
  field.columnX = x;
  for (const pillar of field.pillars) pillar.object.position.x = x;
}

// --- ONE PILLAR, PUT AT THE FAR END AND DRESSED FOR ITS NEXT ARRIVAL
// Its note comes from a shuffled bag so every note is played and none repeats straight away; its carving
// comes from the seven files in turn, so replacing one file on disk changes one pillar and nothing else.
function placeAt(field, pillar, z) {
  pillar.object.position.set(field.columnX, PILLAR_BASE_Y, z);
  pillar.lane = nextLane(field);
  pillar.modelId = field.cycleCursor % PILLAR_MODEL_URLS.length;
  field.cycleCursor += 1;
  pillar.answered = false;
  pillar.popTimer = 0;
  pillar.lit = false;
  wear(pillar, field.models[pillar.modelId] || null);
  if (pillar.label) setLabelLane(pillar.label, pillar.lane);
}

function nextLane(field) {
  if (field.bag.length === 0) {
    field.bag = Array.from({ length: LANE_COUNT }, (_, lane) => lane);
    for (let i = field.bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [field.bag[i], field.bag[j]] = [field.bag[j], field.bag[i]];
    }
  }
  return field.bag.pop();
}

// A pillar that has passed behind the camera is put back at the far end, out beyond the fog where nobody
// can see it arrive. It travels exactly the whole line's length, so every pillar keeps its neighbours at
// exactly one spacing: the gap in the world never changes, and neither does the beat.
function recycle(field, pillar) {
  pillar.object.position.z -= PLAY_PILLAR_COUNT * PILLAR_SPACING;
  pillar.lane = nextLane(field);
  pillar.modelId = field.cycleCursor % PILLAR_MODEL_URLS.length;
  field.cycleCursor += 1;
  pillar.answered = false;
  pillar.popTimer = 0;
  wear(pillar, field.models[pillar.modelId] || null);
  if (pillar.label) setLabelLane(pillar.label, pillar.lane);
}

// --- THE BEAT, THE TRAVEL AND THE LIGHT, once per frame
// The beat is not a timer beside the travel: a pillar crosses one spacing in exactly one gap, so the
// interval between two arrivals is the gap by construction, and the light window is read off the same
// number. Changing the tempo changes the speed and leaves every pillar where it is.
// cue is off on the title and game-over screens: the hall still glides past, but no pillar lights up, so
// nobody reading a screen is asked to press anything.
export function updateField(field, dt, hits, cue = true) {
  field.gap = beatGap(hits);
  field.speed = travelSpeed(field.gap);

  for (const pillar of field.pillars) {
    pillar.object.position.z += field.speed * dt;
    if (pillar.object.position.z > PILLAR_RECYCLE_Z) recycle(field, pillar);
  }

  // The walls travel past at the same speed, so the whole temple moves as one thing. A piece that has
  // passed the camera goes back to the far end by the whole span, so the run stays unbroken and no piece
  // is ever seen to pop or vanish mid-frame.
  for (const segment of field.walls) {
    segment.position.z += field.speed * dt;
    if (segment.position.z > WALL_WRAP_Z) segment.position.z -= WALL_SPAN;
  }
  for (const band of field.bands) {
    band.position.z += field.speed * dt;
    if (band.position.z > HALL_WRAP_Z) band.position.z -= field.bandSpan;
  }

  paintLights(field, cue, dt);
}

// --- THE LIGHT ON THE STONE
// A pillar is lit from GLOW_BEFORE_SECONDS before its beat until GLOW_AFTER_SECONDS after it, so most of
// the beat is pressable; the window is cut short at the fastest tempo so two pillars are never lit at
// once. The model's own material is boosted, never swapped, so the carving and its textures stay on
// screen and the stone glows along its carving instead of flipping to a flat white block.
function paintLights(field, cue, dt = 0) {
  if (!cue) {
    for (const pillar of field.pillars) {
      pillar.popTimer = 0;
      applyLight(pillar, 0, PILLAR_LIGHT_COLOR);
      applyLabel(field, pillar, 0);
    }
    field.litPillar = null;
    field.litOffset = 0;
    return;
  }

  const before = glowBefore(field.gap);
  let lit = null;
  let litOffset = 0;
  for (const pillar of field.pillars) {
    // seconds until this pillar's beat: negative once it is past the press point, which is still pressable
    const offset = (PRESS_Z - pillar.object.position.z) / field.speed;
    if (offset < -GLOW_AFTER_SECONDS || offset > before) continue;
    // the one nearest its beat is the one being asked for: with these windows there is only ever one
    if (lit === null || Math.abs(offset) < Math.abs(litOffset)) {
      lit = pillar;
      litOffset = offset;
    }
  }
  field.litPillar = lit;
  field.litOffset = litOffset;

  // The lit pillar's fade and flash, worked out once. The flash is not a timer of its own: it is read off
  // the glow's own progress through its window, so it can never drift out of step with the light. The
  // letter fades in and out over the glow's first and last GLOW_RAMP_SHARE, so it never pops.
  let fade = 0;
  let flash = 0;
  if (lit !== null) {
    const window = before + GLOW_AFTER_SECONDS;
    const progress = Math.min(1, Math.max(0, (before - litOffset) / window)); // 0 as the light comes on
    fade = Math.max(0, Math.min(1, progress / GLOW_RAMP_SHARE, (1 - progress) / GLOW_RAMP_SHARE));
    flash = FLASH_LOW + (1 - FLASH_LOW) * (0.5 + 0.5 * Math.cos(2 * Math.PI * FLASH_CYCLES_PER_GLOW * progress));
  }

  for (const pillar of field.pillars) {
    if (pillar.popTimer > 0) pillar.popTimer = Math.max(0, pillar.popTimer - dt);
    if (pillar.popTimer > 0) {
      applyLight(pillar, HIT_LEVEL, PILLAR_HIT_COLOR); // the cool pop that answers a landed key
    } else if (pillar === lit) {
      applyLight(pillar, GLOW_LEVEL * fade, PILLAR_LIGHT_COLOR);
    } else {
      applyLight(pillar, 0, PILLAR_LIGHT_COLOR);
    }
    applyLabel(field, pillar, pillar === lit ? fade * flash : 0);
  }
}

function applyLight(pillar, level, colour) {
  const on = level > 0;
  if (pillar.lit !== on) {
    pillar.glow.visible = on;
    pillar.lit = on;
  }
  for (const material of pillar.materials) {
    if (material.emissive === undefined) continue; // an unlit material still gets its halo, never an error
    material.emissive.setHex(colour);
    material.emissiveIntensity = level * PILLAR_LIGHT_INTENSITY;
  }
  pillar.glow.material.color.setHex(colour);
  pillar.glow.material.opacity = level * PILLAR_GLOW_OPACITY;
}

// --- THE KEY LETTER ON A LIT PILLAR
// Only the pillar whose light is on shows a letter, and its opacity is the glow's own fade times the flash,
// so the letter arrives with the light and is gone with it. Nothing is written to the shared material of a
// dark pillar: a hidden label is hidden by its own visible flag, which no other pillar can disturb.
// The letter is billboarded onto the camera every frame - the pillars travel past the player, so a plane
// fixed to a pillar's face would turn away exactly as it arrived.
function applyLabel(field, pillar, opacity) {
  const label = pillar.label;
  if (label === null || label === undefined) return;
  if (field.camera) label.quaternion.copy(field.camera.quaternion);
  const on = opacity > 0.01;
  if (label.visible !== on) label.visible = on;
  if (on) label.material.opacity = opacity;
}

// --- ONE KEY, JUDGED AGAINST THE LIGHT
// 'perfect' (dead on the beat) and 'hit' (in the light, early or late) both score. 'idle' is a key pressed
// with nothing lit - nothing at all happens. 'wrong' is a key that is not the lit pillar's, and that is
// the only thing in the game that costs a life. A pillar already answered this beat is 'answered'.
export function pressPillar(field, lane) {
  const lit = field.litPillar;
  if (lit === null) return 'idle';
  if (lit.answered) return 'answered';
  if (lane !== lit.lane) return 'wrong';
  lit.answered = true;
  lit.popTimer = HIT_SECONDS;
  return Math.abs(field.litOffset) <= PERFECT_SECONDS ? 'perfect' : 'hit';
}

// The lane whose light is on right now, or -1.
export function litLane(field) {
  return field.litPillar === null ? -1 : field.litPillar.lane;
}

// --- THE MAKERS' CARVINGS
// Seven files, cycled across the arriving pillars by index, so replacing one file on disk changes that
// pillar with no code change here.
//
// Nothing blocks a frame on any of them: a pillar is a plain grey box from the first frame and stays one
// if its file never arrives, and every failure - a missing file, a file that will not parse, a file that
// cannot be measured - is silent. Each URL is fetched once, and two URLs holding the same bytes share one
// loaded copy, so identical files cannot multiply geometry or textures on the GPU.
let loader = null;

// A signature over every byte of the file, not a sample of it, so two carvings that differ anywhere can
// never be mistaken for one another and collapsed into a single copy. The length is carried in the key as
// well as the hash. Seven distinct models stay seven distinct models; only true duplicates share a copy.
function signature(buffer) {
  const bytes = new Uint8Array(buffer);
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < bytes.length; i++) hash = Math.imul(hash ^ bytes[i], 16777619) >>> 0;
  return bytes.length + ':' + hash;
}

// fetch, not GLTFLoader.load: a file that is not there is one quiet null instead of a console error.
function fetchModel(url) {
  return fetch(url).then((response) => (response.ok ? response.arrayBuffer() : null)).catch(() => null);
}

function parseModel(buffer, id, targetWidth, targetHeight) {
  if (loader === null) loader = new GLTFLoader();
  return new Promise((resolve) => {
    try {
      loader.parse(buffer, '', (gltf) => {
        try {
          resolve(prepare(gltf.scene, id, targetWidth, targetHeight));
        } catch (error) {
          resolve(null); // a model that loads but cannot be measured must not take the game down
        }
      }, () => resolve(null));
    } catch (error) {
      resolve(null);
    }
  });
}

// Measured, never assumed: the carving is fitted inside its slot on both axes, so all seven read the same
// size whatever they measure, and its centre is put on the slot's centre.
// Two things are settled on the source's own materials here, once, before any copy is made:
//   - no metal: the hall has no environment map to reflect, and a metallic surface would render black,
//     which would take the carving with it.
//   - the glow cue rides on the material's own emission, mapped from the basecolour.
function prepare(source, id, targetWidth, targetHeight) {
  const box = new THREE.Box3().setFromObject(source);
  const size = box.getSize(new THREE.Vector3());
  const centre = box.getCenter(new THREE.Vector3());
  const scale = Math.min(
    targetWidth / Math.max(size.x, 1e-6),
    targetHeight / Math.max(size.y, 1e-6),
  );
  source.traverse((child) => {
    if (!child.isMesh || !child.material) return;
    const list = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of list) {
      if ('metalness' in material) material.metalness = PILLAR_MODEL_METALNESS;
      if ('emissive' in material) {
        material.emissive = new THREE.Color(0x000000);
        material.emissiveIntensity = 0;
      }
      if (material.map) material.emissiveMap = material.map;
    }
  });
  return { id, source, scale, centre, halfDepth: (size.z * scale) / 2 };
}

// One copy of a carving per pillar that wears it, built the first time that pillar wears it and kept for
// the rest of the run: at most one per pillar, so the hundredth beat is as cheap as the first. clone()
// shares the geometry and the maps, so the triangles and the three textures stay a single GPU copy
// however many pillars are on screen; only the material instances are per pillar, because the light on
// one pillar must not touch the others. Materials that come in an array stay an array.
function modelSkin(model) {
  const clone = model.source.clone(true);
  const materials = [];
  clone.traverse((child) => {
    if (!child.isMesh || !child.material) return;
    const isList = Array.isArray(child.material);
    const list = isList ? child.material : [child.material];
    const copies = list.map((material) => {
      const copy = material.clone();
      materials.push(copy);
      return copy;
    });
    child.material = isList ? copies : copies[0];
  });
  const holder = new THREE.Group();
  holder.scale.setScalar(model.scale);
  holder.position.y = PILLAR_BASE_Y + PILLAR_HEIGHT / 2; // the slot's centre, so the base sits on the floor
  clone.position.copy(model.centre).multiplyScalar(-1);
  holder.add(clone);
  return { content: holder, materials };
}

function wear(pillar, model) {
  // The key letter floats clear of whichever body is in place: the box stand-in's face, or the carving's
  // own measured front. A deep carving pushes the letter further out rather than hiding it in the stone.
  if (pillar.label) {
    pillar.label.position.z = model === null
      ? PILLAR_LABEL_Z
      : Math.max(PILLAR_LABEL_Z, model.halfDepth + PILLAR_LABEL_CLEARANCE);
  }
  const key = model ? model.id : -1;
  let skin = pillar.skins.get(key);
  if (skin === undefined) {
    if (model === null) return; // the grey box is always there to fall back on
    skin = modelSkin(model);
    pillar.skins.set(key, skin);
  }
  if (pillar.skin === skin) return;
  pillar.object.remove(pillar.skin.content);
  pillar.object.add(skin.content);
  pillar.skin = skin;
  pillar.materials = skin.materials;
}

// --- WHICH MODELS EXIST
// All seven are asked for at once, and each one lands in its own time. If none of them is there, the
// single fallback carving is asked for instead: it still 404s silently if that is gone too.
export function loadPillarModels(field) {
  const seen = new Map(); // signature -> the one loaded copy that stands for every identical file
  let settled = 0;
  let loaded = 0;

  PILLAR_MODEL_URLS.forEach((url, index) => {
    fetchModel(url)
      .then((buffer) => {
        if (buffer === null) return null;
        const key = signature(buffer);
        const already = seen.get(key);
        if (already !== undefined) return already;
        return parseModel(buffer, index, PILLAR_WIDTH, PILLAR_HEIGHT).then((model) => {
          if (model !== null) seen.set(key, model);
          return model;
        });
      })
      .then((model) => {
        if (model === null) return;
        field.models[index] = model;
        loaded += 1;
        wearLoaded(field);
      })
      .catch(() => {})
      .then(() => {
        settled += 1;
        if (settled === PILLAR_MODEL_URLS.length && loaded === 0) loadFallback(field);
      });
  });
}

function loadFallback(field) {
  fetchModel(PILLAR_FALLBACK_MODEL_URL)
    .then((buffer) => (buffer === null ? null : parseModel(buffer, 0, PILLAR_WIDTH, PILLAR_HEIGHT)))
    .then((model) => {
      if (model === null) return;
      for (let i = 0; i < field.models.length; i++) if (field.models[i] === null) field.models[i] = model;
      wearLoaded(field);
    })
    .catch(() => {});
}

// A carving that has just arrived is put on the pillar that is already wearing its number, and any pillar
// whose carving is still missing keeps the grey box.
function wearLoaded(field) {
  for (const pillar of field.pillars) {
    const model = field.models[pillar.modelId];
    if (model) wear(pillar, model);
  }
}

// --- THE DANCER
// Only her stand-in lives here: the grey box the field builds, which stands where she will until she
// arrives. Her own model and her dance are dancer.js's job, driven by the beat from main.js, and main.js
// hides this box the moment she is really in the scene. Nothing here loads her twice.
