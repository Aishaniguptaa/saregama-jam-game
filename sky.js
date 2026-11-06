// sky.js — the travelling sky: four stages drawn in code on one canvas, crossfaded when a portal opens.
import * as THREE from 'three';
import { SKY_STAGE_COUNT, SKY_STAGE_SECONDS, SKY_CANVAS_WIDTH, SKY_CANVAS_HEIGHT } from './tuning.js';

// --- SHORTHANDS for the numbers that come from tuning.js, so the drawing code below reads in one line each
const CANVAS_W = SKY_CANVAS_WIDTH;
const CANVAS_H = SKY_CANVAS_HEIGHT;

// --- THE LOW SUN of the dusk stage, and the thin haze it leaves at the horizon (which sits at 0.62 of the
// canvas height, the warmest stop of every stage's gradient below)
const SUN_GLOW_X = 0.64;          // the sun stands off to one side of the Hampi horizon
const SUN_GLOW_Y = 0.60;          // low in the frame, just above the haze
const SUN_GLOW_RADIUS = 0.38;     // how far its warmth reaches, as a share of the canvas width
const SUN_GLOW_ALPHA = 0.5;       // soft, so it is a glow and not a disc
const HAZE_TOP = 0.55;            // the warm haze band spans this slice of the canvas...
const HAZE_BOTTOM = 0.72;         // ...and this one, right across its width
const WARM_HAZE_COLOUR = 'rgba(255, 192, 128, 0.42)'; // the band's own colour at its middle

// --- THE STARS: one fixed seed, a few brightness steps, and how many of each field to draw
const STAR_SEED = 0x51c0ffee;     // fixed on purpose, so the stars land in the same places every load
const STAR_ALPHAS = [0.22, 0.36, 0.55, 0.8]; // the handful of brightnesses a star may take
const STAR_SHARP_COUNT = 240;     // the sharp small stars of the airless dark
const STAR_DENSE_COUNT = 640;     // the denser field of the galaxy stage
const BRIGHT_STAR_COUNT = 16;     // the few haloed stars of the galaxies stage
const BRIGHT_STAR_CORE_STYLE = 'rgba(255, 255, 255, 0.95)'; // the hard point inside a bright star's halo

// --- THE CLOUDS of the air stage: two soft bands, each built from a row of overlapping puffs
const CLOUD_BANDS = [
  { y: 0.30, puffs: 7, spread: 0.14, size: 1.0, alpha: 0.30 },
  { y: 0.43, puffs: 9, spread: 0.18, size: 0.8, alpha: 0.22 },
];
const CLOUD_PUFF_RX = 0.16;       // one puff is this wide, of the canvas width...
const CLOUD_PUFF_RY = 0.035;      // ...and this tall, of the canvas height

// --- THE GALAXY of the last stage: one soft smear with a brighter core, on a shallow diagonal
const GALAXY_TILT = -0.42;        // how far the band leans across the canvas, in radians
const GALAXY_CX = 0.52;           // where the band crosses, across the canvas
const GALAXY_CY = 0.46;           // and up it
const GALAXY_HALF_LEN = 0.66;     // how far the band reaches along its own axis, of the canvas width
const GALAXY_HALF_THICK = 0.11;   // and how softly it spreads across it, of the canvas height
const GALAXY_ALPHA = 0.8;         // the outer smear's own strength
const GALAXY_CORE_LEN = 0.5;      // the brighter core inside the band reaches this far...
const GALAXY_CORE_THICK = 0.045;  // ...and is this thin
const GALAXY_CORE_ALPHA = 0.85;
const GALAXY_STAR_COUNT = 140;    // small stars dusted through the band, which give it its grain
const GALAXY_STAR_STYLE = 'rgba(222, 230, 255, 0.55)';

// --- THE FOUR STAGES, each one further from the world than the last: dusk over Hampi, up through the air,
// the airless dark, and out to the galaxies. Each stage is a sky gradient from the top of the frame down.
// They run into one another on purpose: the overhead goes violet, blue, then dark, and the horizon goes
// warm amber, hazy white, dim blue, then out - so the four read as one journey and not four pictures.
const STAGE_STOPS = [
  [ // 0 — dusk over Hampi: warm amber low, deep blue-violet overhead
    [0.0, '#241d3f'], [0.24, '#40325f'], [0.42, '#7c4a6b'], [0.54, '#b96250'],
    [0.62, '#e0913f'], [0.7, '#f0b26a'], [0.82, '#8a4d31'], [1.0, '#38220f'],
  ],
  [ // 1 — up through the air: pale blue overhead fading to hazy white at the horizon
    [0.0, '#2f6fb8'], [0.26, '#5d99d2'], [0.46, '#9cc4e2'], [0.58, '#cfe2ee'],
    [0.62, '#dceaf3'], [0.74, '#e9f2f7'], [1.0, '#c9d8e3'],
  ],
  [ // 2 — the airless dark: near-black blue with only a slight glow left at the horizon
    [0.0, '#04060d'], [0.3, '#060a16'], [0.5, '#0a1022'], [0.62, '#12203c'],
    [0.7, '#0a1224'], [0.86, '#060a15'], [1.0, '#030509'],
  ],
  [ // 3 — the galaxies: near-black, and the fog closes on almost nothing at all
    [0.0, '#010208'], [0.4, '#02040c'], [0.62, '#060b18'], [1.0, '#020309'],
  ],
];

// The colour the corridor's fog should take at each stage: the stage's own horizon, so the temple
// dissolves into the sky rather than into a colour that no longer matches it.
const STAGE_HORIZON = ['#e0913f', '#dceaf3', '#12203c', '#060b18'];

// --- A TINY FIXED-SEED GENERATOR, so the stars and clouds land in the same places on every load.
function makeRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- GRADIENT HELPERS, all built once and then reused, so no frame ever makes a new one
function verticalGradient(ctx, stops) {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  for (const [at, colour] of stops) gradient.addColorStop(at, colour);
  return gradient;
}

// A soft round glow, white or warm, drawn through the stamps below and reused for every star and cloud.
function softGlow(ctx, centre, edge) {
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  gradient.addColorStop(0, centre);
  gradient.addColorStop(1, edge);
  return gradient;
}

// A band that fades in and out vertically: the warm haze that sits on the dusk horizon.
function bandGradient(ctx, top, bottom, colour) {
  const gradient = ctx.createLinearGradient(0, top * CANVAS_H, 0, bottom * CANVAS_H);
  gradient.addColorStop(0, 'rgba(255, 186, 120, 0)');
  gradient.addColorStop(0.5, colour);
  gradient.addColorStop(1, 'rgba(255, 186, 120, 0)');
  return gradient;
}

// --- THE SHARED SOFT GLOWS: one white, one warm for the sun, and the two that make up the galaxy band
function buildGlows(ctx) {
  return {
    white: softGlow(ctx, 'rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0)'),
    warm: softGlow(ctx, 'rgba(255, 228, 182, 0.85)', 'rgba(255, 190, 120, 0)'),
    galaxy: softGlow(ctx, 'rgba(206, 217, 255, 0.5)', 'rgba(150, 170, 255, 0)'),
    galaxyCore: softGlow(ctx, 'rgba(238, 243, 255, 0.85)', 'rgba(190, 205, 255, 0)'),
  };
}

// --- STAMP: one soft glow laid down at a place and size, in one reusable call. The gradient is a unit
// circle, so scaling it to (rx, ry) is what makes it round, wide, or a long diagonal smear.
function stamp(ctx, gradient, x, y, rx, ry, alpha, rotation = 0) {
  ctx.save();
  ctx.translate(x, y);
  if (rotation) ctx.rotate(rotation);
  ctx.scale(rx, ry);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = gradient;
  ctx.fillRect(-1, -1, 2, 2);
  ctx.restore();
}

// --- THE STAR FIELDS, built once. Stars are grouped by brightness, so a whole group shares one colour
// string and no frame ever builds one per star.
function buildStarBuckets(random, count) {
  const buckets = STAR_ALPHAS.map((alpha) => ({ style: `rgba(255, 255, 255, ${alpha})`, stars: [] }));
  for (let i = 0; i < count; i += 1) {
    const bucket = buckets[Math.floor(random() * buckets.length) % buckets.length];
    bucket.stars.push({ x: random() * CANVAS_W, y: random() * CANVAS_H, s: random() < 0.85 ? 1 : 2 });
  }
  return buckets;
}

// The few brighter stars of the galaxy stage: a small point inside a soft halo.
function buildBrightStars(random, count) {
  const stars = [];
  for (let i = 0; i < count; i += 1) {
    stars.push({
      x: random() * CANVAS_W,
      y: random() * CANVAS_H * 0.9,
      halo: 5 + random() * 14,
      alpha: 0.25 + random() * 0.4,
      core: 2 + random() * 1.5,
    });
  }
  return stars;
}

// The grain inside the galaxy band: stars laid along the band's own diagonal, thicker at its middle.
function buildGalaxyStars(random, count) {
  const stars = [];
  const cos = Math.cos(GALAXY_TILT);
  const sin = Math.sin(GALAXY_TILT);
  for (let i = 0; i < count; i += 1) {
    const along = random() * 2 - 1;                              // how far up the band it sits
    const across = (random() + random() + random() - 1.5) / 1.5; // centre-weighted across the band
    const lx = along * GALAXY_HALF_LEN * CANVAS_W;
    const ly = across * GALAXY_HALF_THICK * CANVAS_H;
    stars.push({
      x: GALAXY_CX * CANVAS_W + lx * cos - ly * sin,
      y: GALAXY_CY * CANVAS_H + lx * sin + ly * cos,
      s: random() < 0.8 ? 1 : 2,
    });
  }
  return stars;
}

// --- THE CLOUD PUFFS of the air stage, built once: a row of overlapping globes per band.
function buildClouds(random) {
  const puffs = [];
  for (const band of CLOUD_BANDS) {
    for (let i = 0; i < band.puffs; i += 1) {
      const along = band.puffs === 1 ? 0.5 : i / (band.puffs - 1);
      puffs.push({
        x: (0.08 + 0.84 * along + (random() - 0.5) * band.spread) * CANVAS_W,
        y: (band.y + (random() - 0.5) * 0.02) * CANVAS_H,
        rx: CLOUD_PUFF_RX * band.size * (0.7 + random() * 0.7) * CANVAS_W,
        ry: CLOUD_PUFF_RY * band.size * (0.7 + random() * 0.7) * CANVAS_H,
        alpha: band.alpha * (0.6 + random() * 0.6),
      });
    }
  }
  return puffs;
}

// --- EVERY STAGE'S DRAWING KIT, made once when the sky is built: a sky gradient, plus whatever that
// stage adds on top of it. Nothing here is ever rebuilt, so a fade allocates nothing at all.
function buildStyles(ctx) {
  const random = makeRandom(STAR_SEED);
  return STAGE_STOPS.map((stops, stage) => {
    const style = { sky: verticalGradient(ctx, stops) };
    if (stage === 0) {
      style.sunGlow = true;
      style.haze = bandGradient(ctx, HAZE_TOP, HAZE_BOTTOM, WARM_HAZE_COLOUR);
    } else if (stage === 1) {
      style.clouds = buildClouds(random);
    } else if (stage === 2) {
      style.stars = buildStarBuckets(random, STAR_SHARP_COUNT);
    } else {
      style.stars = buildStarBuckets(random, STAR_DENSE_COUNT);
      style.galaxy = true;
      style.galaxyStars = buildGalaxyStars(random, GALAXY_STAR_COUNT);
      style.brightStars = buildBrightStars(random, BRIGHT_STAR_COUNT);
    }
    return style;
  });
}

// --- THE PAINTING STEPS, one small function each, all reading the kits built above.

function paintStars(ctx, buckets, baseAlpha) {
  ctx.globalAlpha = baseAlpha;
  for (const bucket of buckets) {
    if (bucket.stars.length === 0) continue;
    ctx.fillStyle = bucket.style; // the group's brightness is baked into this one string
    for (const star of bucket.stars) ctx.fillRect(star.x, star.y, star.s, star.s);
  }
}

function paintGalaxyStars(ctx, stars, baseAlpha) {
  ctx.globalAlpha = baseAlpha;
  ctx.fillStyle = GALAXY_STAR_STYLE;
  for (const star of stars) ctx.fillRect(star.x, star.y, star.s, star.s);
}

function paintGalaxy(ctx, glows, baseAlpha) {
  const x = GALAXY_CX * CANVAS_W;
  const y = GALAXY_CY * CANVAS_H;
  stamp(ctx, glows.galaxy, x, y, GALAXY_HALF_LEN * CANVAS_W, GALAXY_HALF_THICK * CANVAS_H, GALAXY_ALPHA * baseAlpha, GALAXY_TILT);
  stamp(ctx, glows.galaxyCore, x, y, GALAXY_CORE_LEN * CANVAS_W, GALAXY_CORE_THICK * CANVAS_H, GALAXY_CORE_ALPHA * baseAlpha, GALAXY_TILT);
}

function paintBrightStars(ctx, glows, stars, baseAlpha) {
  for (const star of stars) {
    stamp(ctx, glows.white, star.x, star.y, star.halo, star.halo, star.alpha * baseAlpha);
    ctx.globalAlpha = baseAlpha;
    ctx.fillStyle = BRIGHT_STAR_CORE_STYLE;
    ctx.fillRect(star.x - star.core * 0.5, star.y - star.core * 0.5, star.core, star.core);
  }
}

function paintClouds(ctx, glows, puffs, baseAlpha) {
  for (const puff of puffs) stamp(ctx, glows.white, puff.x, puff.y, puff.rx, puff.ry, puff.alpha * baseAlpha);
}

// --- ONE STAGE ONTO THE CANVAS, at an overall strength: the sky first, then whatever this stage lays on
// it. A crossfade is this same function run twice, the newcomer over the stage being left.
function paintStage(ctx, glows, style, baseAlpha) {
  if (!style) return;
  ctx.globalAlpha = baseAlpha;
  ctx.fillStyle = style.sky;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  if (style.sunGlow) {
    stamp(ctx, glows.warm, SUN_GLOW_X * CANVAS_W, SUN_GLOW_Y * CANVAS_H,
      SUN_GLOW_RADIUS * CANVAS_W, SUN_GLOW_RADIUS * CANVAS_W * 0.5, SUN_GLOW_ALPHA * baseAlpha);
  }
  if (style.haze) {
    ctx.globalAlpha = baseAlpha;
    ctx.fillStyle = style.haze;
    ctx.fillRect(0, HAZE_TOP * CANVAS_H, CANVAS_W, (HAZE_BOTTOM - HAZE_TOP) * CANVAS_H);
  }
  if (style.clouds) paintClouds(ctx, glows, style.clouds, baseAlpha);
  if (style.stars) paintStars(ctx, style.stars, baseAlpha);
  if (style.galaxy) paintGalaxy(ctx, glows, baseAlpha);
  if (style.galaxyStars) paintGalaxyStars(ctx, style.galaxyStars, baseAlpha);
  if (style.brightStars) paintBrightStars(ctx, glows, style.brightStars, baseAlpha);

  ctx.globalAlpha = 1;
}

// --- SMOOTHSTEP: a fade that starts and ends gently, so a stage change never jerks.
function smoothstep(t) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

// --- CLAMP a stage number into range, and treat anything unreadable as the first stage.
function clampStage(n) {
  const highest = Math.max(0, SKY_STAGE_COUNT - 1);
  const value = Math.floor(Number(n));
  if (!Number.isFinite(value)) return 0;
  return Math.min(highest, Math.max(0, value));
}

// --- A SKY THAT DRAWS NOTHING, for the impossible case where there is no canvas: the game asks it the
// same questions and gets the same safe answers.
function quietSky() {
  return { stage: 0, setStage() {}, update() {} };
}

// --- CREATE SKY: build the canvas, the texture and every gradient once, paint stage 0, and hand back the
// handle main.js drives. Nothing here waits on anything: it is all ready before it returns.
export function createSky(scene) {
  if (typeof document === 'undefined') return quietSky();

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false; // the canvas is repainted often while it fades
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    if (scene) scene.background = texture;
    return quietSky();
  }

  const glows = buildGlows(ctx);
  const styles = buildStyles(ctx);
  const styleFor = (stage) => styles[stage] || styles[styles.length - 1] || null;

  // The corridor's fog follows the sky's horizon, eased over the very same crossfade.
  const fog = scene && scene.fog && scene.fog.color ? scene.fog : null;
  const horizonColors = STAGE_HORIZON.map((hex) => new THREE.Color(hex));
  const fogFrom = new THREE.Color();
  const fogTo = new THREE.Color();

  // t is the fade's progress: 1 means settled, and a settled sky never repaints.
  const state = { from: 0, t: 1 };

  function easeFog(t) {
    if (!fog) return;
    fog.color.copy(fogFrom).lerp(fogTo, smoothstep(t));
  }

  // Repaint the canvas for the fade's current progress. Called only while a fade is running.
  function redraw(from, to, t) {
    if (from === to || t >= 1) {
      paintStage(ctx, glows, styleFor(to), 1);
    } else {
      paintStage(ctx, glows, styleFor(from), 1);
      paintStage(ctx, glows, styleFor(to), smoothstep(t)); // the newcomer blended over the one being left
    }
    texture.needsUpdate = true;
  }

  const sky = {
    stage: 0,
    setStage(n) {
      const target = clampStage(n);
      if (target === sky.stage) return; // already there: nothing to do, nothing to repaint
      state.from = sky.stage;
      sky.stage = target;
      state.t = 0;
      if (fog) {
        fogFrom.copy(fog.color);
        fogTo.copy(horizonColors[target] || horizonColors[0]);
      }
      redraw(state.from, sky.stage, 0); // show the stage being left at once, whatever was mid-fade
    },
    update(dt) {
      if (state.t >= 1) return; // settled: no repaint, and nothing allocated
      const span = SKY_STAGE_SECONDS > 0 ? SKY_STAGE_SECONDS : 0.0001;
      const step = Number.isFinite(dt) && dt > 0 ? dt : 0;
      state.t = Math.min(1, state.t + step / span);
      redraw(state.from, sky.stage, state.t);
      easeFog(state.t);
      if (state.t >= 1) state.from = sky.stage; // the fade is done; further frames do nothing
    },
  };

  // --- FIRST PAINT: stage 0 is on the canvas before the first frame, and the fog already matches it.
  redraw(0, 0, 1);
  if (scene) scene.background = texture;
  if (fog) {
    fog.color.copy(horizonColors[0]);
    fogFrom.copy(fog.color);
    fogTo.copy(fog.color);
  }

  return sky;
}
