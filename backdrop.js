// backdrop.js — the painted temple at the far end of the corridor: a canvas picture of the Vijay Vithala temple whose sky is left transparent, so the real five-stage sky shows above it and changes when a portal opens.
import * as THREE from 'three';
import { BACKDROP_Z, BACKDROP_WIDTH, BACKDROP_HEIGHT } from './tuning.js';

// --- THE PICTURE: one canvas at the plane's own proportions, drawn in code so it costs no download. It is
// wide enough that the middle sliver - the only part ever in frame - still holds the roof lines crisply.
const PICTURE_WIDTH = 4080;                          // canvas pixels across
const PIXELS_PER_UNIT = PICTURE_WIDTH / BACKDROP_WIDTH; // 24: canvas pixels to one world unit, and back
const PICTURE_HEIGHT = Math.round(PIXELS_PER_UNIT * BACKDROP_HEIGHT); // 1824: the plane's own aspect exactly

// --- THE ONE NUMBER THAT LETS THE SKY BACK IN: the whole complex is drawn at this share of the size the
// layout below describes. Shrunk around the same floor line, the temple's tallest point lands at about 0.68
// of the frame height instead of running off the top of it, so the upper third of the frame is open - and
// what shows there is the real sky, drawn by sky.js as scene.background, moving on a stage at every portal.
const TERRAIN_SCALE = 0.45;

// --- THE HORIZON GLOW: the only thing the sky pass paints, and the only warm light the picture itself
// carries. A soft radial warmth low behind the temple, so the silhouette has something to stand against at
// the dusk stage. It is translucent (0.34 at its centre) and fades to nothing, so at every later stage the
// real sky reads straight through it - nothing in this file ever lays down an opaque fill.
const HORIZON_GLOW_COLOUR = 'rgba(255, 198, 142, 0.34)';
const HORIZON_GLOW_EDGE = 'rgba(255, 198, 142, 0)';
const HORIZON_GLOW_RADIUS = 980;      // how far the glow reaches, in canvas pixels from the picture's base

// --- STONE: neutral greys with only a trace of warmth. The sky behind the temple is a different stage at
// every portal, so the stone has to read as stone against dusk, daylight, the airless dark and the nebulae
// alike. Never gold, and never bright: gold is the pillars' glow and nothing else on screen.
const HILL_COLOUR = '#79819a';         // the far range: the coolest, faintest thing in the picture
const TREE_COLOUR = '#5b6070';         // the treeline just in front of it
const WALL_COLOUR = '#63616a';         // the compound wall the whole complex stands behind
const FAR_STONE = '#6b686a';           // the flanking shrines, still cool with distance
const GOPURAM_STONE = '#66625f';       // the two tower gateways either side of the hall
const MAIN_STONE = '#6a655f';          // the mandapa and its tower: the middle mass of the picture
const NEAR_STONE = '#565350';          // the small shrine standing in front of it
const CHARIOT_STONE = '#413e3b';       // the stone chariot: nearest, and the darkest

// --- CARVING: the pale edge the light catches, and the shadow beside every recess. Far stone takes a cooler
// pair. Pale stone light on neutral grey - a highlight, not a metal.
const CARVE_LIT = 'rgba(255, 246, 230, 0.24)';
const CARVE_DARK = 'rgba(14, 12, 12, 0.34)';
const COOL_LIT = 'rgba(220, 226, 242, 0.2)';
const COOL_DARK = 'rgba(30, 34, 46, 0.32)';
const DOORWAY_COLOUR = 'rgba(10, 9, 10, 0.88)';       // the dark doorway at the foot of every building
const LAMP_COLOUR = 'rgba(255, 242, 218, 0.9)';       // a lit shrine lamp: lamplight, still not gold
const LAMP_HALO_COLOUR = 'rgba(255, 232, 190, 0.16)'; // the soft round of light around one
const GARLAND_COLOUR = 'rgba(206, 198, 184, 0.45)';   // the pale garlands swagged along the hall
const BANNER_COLOUR = 'rgba(58, 55, 53, 0.9)';        // the dark banners hanging beside the doorway
const BANNER_TRIM = 'rgba(214, 208, 196, 0.3)';
const GARLAND_BEADS = 7;              // how many beads one garland carries

// --- HAZE: a veil of the sky's own colour laid over each layer of far things, so distance reads as value.
// wash() lays these down only where the canvas already carries paint, so they never touch the sky.
const HAZE_FAR = 'rgba(140, 148, 172, 0.5)';   // over the hills: the farthest step
const HAZE_MID = 'rgba(150, 150, 162, 0.34)';  // over the treeline
const HAZE_NEAR = 'rgba(164, 160, 156, 0.2)';  // over the shrines and the compound wall

// --- THE LAYOUT: how wide and tall each building is, in picture units measured up from the floor line.
// Everything here is drawn at TERRAIN_SCALE, so these are the temple's proportions, not its size on screen.
const MAIN_CENTRE_X = 0;          // the mandapa stands dead centre, so the whole complex reads around it
const MAIN_HALF_WIDTH = 11.5;
const MAIN_WALL_HEIGHT = 9;
const MAIN_WALL_VERTICALS = 13;   // thirteen carved verticals: the wall reads as finely chiselled stone
const MAIN_TOWER_TIERS = 6;       // six diminishing storeys, each with its own lit cornice and niches
const MAIN_TIER_HEIGHT = 1.1;
const PLINTH_HEIGHT = 1.1;        // the moulded platform the hall stands on
const PLINTH_OVERHANG = 1.5;
const CORNICE_HEIGHT = 1.3;       // the cornice overhanging the wall
const LIT_CAP_HEIGHT = 0.28;
const PARAPET_HEIGHT = 0.52;      // and the parapet the row of lamps stands on
const FRIEZE_HEIGHT = 0.85;       // the band of small niches under the cornice
const TOWER_BASE_Y = MAIN_WALL_HEIGHT + CORNICE_HEIGHT + LIT_CAP_HEIGHT + PARAPET_HEIGHT; // 11.1
const GOPURAM_CENTRE_X = 18.5;    // the two tower gateways, one each side of the hall
const GOPURAM_HALF_WIDTH = 3.4;
const GOPURAM_WALL_HEIGHT = 5;
const GOPURAM_TIERS = 4;
const GOPURAM_TIER_HEIGHT = 1.2;
const SHRINE_CENTRE_X = 29;       // the far shrines, out at the edges of the complex
const SHRINE_HALF_WIDTH = 4.6;
const SHRINE_WALL_HEIGHT = 4.6;
const SHRINE_TIERS = 3;
const SHRINE_TIER_HEIGHT = 1;
const NEAR_SHRINE_CENTRE_X = -15.4; // the small dark shrine in front of the left gopuram
const NEAR_SHRINE_HALF_WIDTH = 2.6;
const CHARIOT_CENTRE_X = -9.5;      // the stone chariot: in front, and slightly off-centre
const CHARIOT_WHEEL_RADIUS = 1.7;   // its solid carved wheels

// --- HOW FAR THE BACKGROUND LAYERS RUN: on the widest window the frame reaches about 90 world units to each
// side of centre at the plane, and these layers are drawn at TERRAIN_SCALE, so their own coordinates have to
// run further out than the frame itself to still leave both edges. This is that reach, in picture units.
const HORIZON_REACH = 240;

// --- THE ONE THING MAIN.JS NEEDS TO KNOW ABOUT THE PICTURE ON SCREEN
const BACKDROP_RENDER_ORDER = -1;   // drawn first, so it stays behind everything else in the corridor
const MATERIAL_TINT = 0xffffff;     // white leaves the picture's own colours alone
const FALLBACK_COLOUR = 0x8a6a55;   // and if the canvas is somehow unavailable, a plain dusk panel stands in

// --- FLOOR AND ROOF SHAPES: the small building blocks every part of the temple is drawn from
function block(ctx, x, y, width, height, colour) {
  // a rectangle measured from its own bottom-left corner, in world units
  ctx.fillStyle = colour;
  ctx.fillRect(x, y, width, height);
}

function face(ctx, points, colour) {
  // a filled polygon in world units
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = colour;
  ctx.fill();
}

function worldSpace(ctx) {
  // world units from here on: x = 0 is the middle, y = 0 is the floor line, and y grows upward. Everything
  // is drawn at TERRAIN_SCALE, which is the whole trick of the picture: the temple keeps its own proportions,
  // the floor line stays exactly where it was, and the sky above the temple is left open.
  const unit = PIXELS_PER_UNIT * TERRAIN_SCALE;
  ctx.setTransform(unit, 0, 0, -unit, PICTURE_WIDTH / 2, PICTURE_HEIGHT);
}

function wash(ctx, colour) {
  // a veil over whatever is already painted, so each receding layer sits back one step into the haze.
  // source-atop is what keeps it off the sky: the fill only lands on pixels that already carry paint, so the
  // transparent sky stays transparent and the real sky behind it is never tinted grey by the haze.
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, PICTURE_WIDTH, PICTURE_HEIGHT);
  ctx.restore();
}

// --- THE SKY PASS: it paints the glow and nothing else, and never fills the canvas
function drawSky(ctx) {
  // The pixels the temple does not cover stay fully transparent, and the real sky - sky.js, one stage per
  // portal - is what shows through them. All this pass adds is the low warm glow behind the temple, which is
  // translucent at its strongest and fades to nothing, so it warms the silhouette without ever hiding a stage.
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const glow = ctx.createRadialGradient(
    PICTURE_WIDTH / 2, PICTURE_HEIGHT, 0,
    PICTURE_WIDTH / 2, PICTURE_HEIGHT, HORIZON_GLOW_RADIUS,
  );
  glow.addColorStop(0, HORIZON_GLOW_COLOUR);
  glow.addColorStop(1, HORIZON_GLOW_EDGE);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, PICTURE_WIDTH, PICTURE_HEIGHT);
}

// --- LAMPS: the small lit shrines' lamps that run along the temple's ledges
function lamp(ctx, centreX, centreY, radius) {
  ctx.beginPath();
  ctx.arc(centreX, centreY, radius * 2.8, 0, Math.PI * 2);
  ctx.fillStyle = LAMP_HALO_COLOUR;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centreX, centreY, radius, 0, Math.PI * 2);
  ctx.fillStyle = LAMP_COLOUR;
  ctx.fill();
}

function lampRow(ctx, centreX, y, width, count, radius) {
  // the row of lamps that runs along a lit ledge, spaced evenly across it
  const step = width / count;
  for (let i = 0; i < count; i += 1) lamp(ctx, centreX - width / 2 + step * (i + 0.5), y, radius);
}

// --- A ROW OF NICHES: the small blind arches that run along every one of the temple's cornices
function kuduRow(ctx, centreX, y, width, count, dark, lit) {
  const step = width / count;
  const radius = Math.min(step * 0.32, 0.42);
  for (let i = 0; i < count; i += 1) {
    const cx = centreX - width / 2 + step * (i + 0.5);
    ctx.beginPath();
    ctx.arc(cx, y, radius, Math.PI, 0);
    ctx.fillStyle = dark;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, y - radius * 0.12, radius * 0.52, Math.PI, 0);
    ctx.fillStyle = lit;
    ctx.fill();
  }
}

// --- A FRIEZE: the band of small niches that runs along a wall just under its cornice
function frieze(ctx, centreX, y, width, count, height, stone, lit, dark) {
  const left = centreX - width / 2;
  block(ctx, left, y, width, height, stone);
  const step = width / count;
  for (let i = 0; i < count; i += 1) {
    const nx = left + step * (i + 0.34);
    block(ctx, nx, y + height * 0.2, step * 0.32, height * 0.6, dark);   // the niche
    block(ctx, nx, y + height * 0.2, step * 0.07, height * 0.6, lit);   // its lit edge
  }
  block(ctx, left, y + height - 0.14, width, 0.14, lit);                // the lit top of the band
}

// --- A CARVED STONE FACE: a flat fill with recessed verticals, and the light caught on the near edge
function carvedWall(ctx, x, y, width, height, base, verticals, lit, dark) {
  block(ctx, x, y, width, height, base);
  const step = width / (verticals + 1);
  for (let i = 1; i <= verticals; i += 1) {
    const line = x + i * step;
    block(ctx, line - 0.14, y, 0.34, height, dark); // the recess
    block(ctx, line + 0.2, y, 0.18, height, lit);   // and the edge the light catches beside it
  }
  block(ctx, x, y, 0.3, height, lit);                 // the lit left edge
  block(ctx, x, y + height - 0.3, width, 0.3, lit);   // and the lit top
}

// --- A HANGING BANNER: a dark pennant with a pale trim, hung on the hall's wall
function banner(ctx, centreX, topY, width, height) {
  face(ctx, [
    [centreX - width / 2, topY],
    [centreX + width / 2, topY],
    [centreX + width / 2, topY - height + 0.6],
    [centreX, topY - height],
    [centreX - width / 2, topY - height + 0.6],
  ], BANNER_COLOUR);
  block(ctx, centreX - width / 2, topY - 0.34, width, 0.34, BANNER_TRIM);                    // the bar it hangs from
  block(ctx, centreX - width * 0.18, topY - height * 0.62, width * 0.36, 0.5, BANNER_TRIM);  // and its emblem
}

// --- A GARLAND SWAG: the pale rope of a garland looped from one bay of the hall to the next, sagging between
function garland(ctx, x1, x2, y, sag) {
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.quadraticCurveTo((x1 + x2) / 2, y - sag, x2, y);
  ctx.lineWidth = 0.14;
  ctx.strokeStyle = GARLAND_COLOUR;
  ctx.stroke();
  for (let i = 1; i < GARLAND_BEADS; i += 1) {
    const t = i / GARLAND_BEADS;
    ctx.beginPath();
    ctx.arc(x1 + (x2 - x1) * t, y - 2 * t * (1 - t) * sag, 0.18, 0, Math.PI * 2); // the same curve, evaluated
    ctx.fillStyle = GARLAND_COLOUR;
    ctx.fill();
  }
}

// --- A TIERED TOWER: the stepped storeys over a hall, each narrower than the one beneath it, each finished
// with its own lit cornice and its row of small niches - so the tower carries as much carving as the wall
// under it. It hands back where it finished, so the crown knows where to start and how wide it is.
function tieredTower(ctx, centreX, halfWidth, baseY, tiers, tierHeight, stone, lit, dark) {
  const shrink = Math.max(0.35, halfWidth * 0.14);
  let half = halfWidth;
  let y = baseY;
  for (let i = 0; i < tiers; i += 1) {
    const top = y + tierHeight;
    const inset = Math.min(0.5, half * 0.2);
    face(ctx, [
      [centreX - half, y],
      [centreX + half, y],
      [centreX + half - inset, top],
      [centreX - half + inset, top],
    ], stone);
    block(ctx, centreX - half, y, half * 2, 0.22, dark);                          // the shadow under the storey
    block(ctx, centreX - half + inset, top - 0.2, (half - inset) * 2, 0.2, lit);  // its lit cornice
    kuduRow(ctx, centreX, top - 0.12, (half - inset) * 2, Math.max(3, Math.round(half * 2.2)), dark, lit);
    y = top;
    half = Math.max(0.8, half - shrink);
  }
  return { top: y, half };
}

// --- THE CROWN: the ornamented finial over a tower - two stepped caps, a ringed neck, the flattened
// amalaka disc, the pot and the spike, with a bead on the very top. Every part is measured off the tower's
// own width, so the tall main tower and the much smaller gopurams each get a crown in proportion.
function crown(ctx, centreX, baseY, half, stone, lit, dark) {
  const h0 = half;
  let y = baseY;
  let w = h0;
  for (const [height, taper] of [[0.55, 0.62], [0.42, 0.38]]) { // [height, taper], as shares of the half-width
    const top = y + h0 * height;
    face(ctx, [
      [centreX - w, y],
      [centreX + w, y],
      [centreX + w * taper, top],
      [centreX - w * taper, top],
    ], stone);
    block(ctx, centreX - w, y, w * 2, h0 * 0.1, dark);
    block(ctx, centreX - w * taper, top - h0 * 0.09, w * taper * 2, h0 * 0.09, lit);
    y = top;
    w *= taper;
  }
  const neckHalf = Math.max(0.16, w * 0.72);
  block(ctx, centreX - neckHalf, y, neckHalf * 2, h0 * 0.42, stone);                            // the neck
  block(ctx, centreX - neckHalf - 0.06, y + h0 * 0.05, (neckHalf + 0.06) * 2, h0 * 0.09, lit);  // a lit ring
  block(ctx, centreX - neckHalf - 0.06, y + h0 * 0.32, (neckHalf + 0.06) * 2, h0 * 0.09, lit);  // and another
  y += h0 * 0.42;
  const rx = Math.max(0.22, w * 0.95);
  const ry = rx * 0.42;
  ctx.beginPath();                                                                              // the amalaka
  ctx.ellipse(centreX, y + ry * 0.6, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = stone;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(centreX, y + ry * 0.8, rx * 0.7, ry * 0.5, 0, Math.PI, 0);
  ctx.fillStyle = lit;
  ctx.fill();
  y += ry * 1.6;
  const potHalf = Math.max(0.12, rx * 0.42);
  block(ctx, centreX - potHalf, y, potHalf * 2, h0 * 0.34, stone);                              // the pot
  block(ctx, centreX - potHalf + 0.04, y + h0 * 0.28, potHalf * 2 - 0.08, h0 * 0.06, lit);
  const potTop = y + h0 * 0.34;
  face(ctx, [                                                                                    // and the spike
    [centreX - potHalf * 0.9, potTop],
    [centreX + potHalf * 0.9, potTop],
    [centreX, potTop + h0 * 0.38],
  ], stone);
  const bead = Math.max(0.1, h0 * 0.09);
  const beadY = potTop + h0 * 0.38 + bead * 0.8;
  ctx.beginPath();
  ctx.arc(centreX, beadY, bead, 0, Math.PI * 2);
  ctx.fillStyle = stone;
  ctx.fill();
  return beadY + bead;
}

// --- A SMALL FINIAL: the cap, the pot and the bead that finish the small shrines, all off their own width
function finial(ctx, centreX, baseY, half, stone, lit) {
  const w = Math.max(0.3, half);
  face(ctx, [
    [centreX - w, baseY],
    [centreX + w, baseY],
    [centreX + w * 0.45, baseY + w * 0.7],
    [centreX - w * 0.45, baseY + w * 0.7],
  ], stone);
  block(ctx, centreX - w * 0.45, baseY + w * 0.7, w * 0.9, w * 0.12, lit);
  block(ctx, centreX - w * 0.2, baseY + w * 0.82, w * 0.4, w * 0.5, stone);
  ctx.beginPath();
  ctx.arc(centreX, baseY + w * 1.4, w * 0.26, 0, Math.PI * 2);
  ctx.fillStyle = stone;
  ctx.fill();
}

// --- THE FAR RANGE: rounded hills, drawn wider than the frame so they run off both edges on any window
function drawHills(ctx) {
  worldSpace(ctx);
  ctx.beginPath();
  ctx.moveTo(-HORIZON_REACH, 0);
  ctx.quadraticCurveTo(-208, 12.5, -176, 6.4);
  ctx.quadraticCurveTo(-146, 2.6, -114, 8.6);
  ctx.quadraticCurveTo(-84, 14.5, -52, 6.8);
  ctx.quadraticCurveTo(-22, 1.4, 10, 7.6);
  ctx.quadraticCurveTo(42, 13.8, 74, 5.6);
  ctx.quadraticCurveTo(106, 2.2, 138, 8.2);
  ctx.quadraticCurveTo(170, 13.2, 202, 5.4);
  ctx.quadraticCurveTo(222, 1.6, HORIZON_REACH, 6.8);
  ctx.lineTo(HORIZON_REACH, 0);
  ctx.closePath();
  ctx.fillStyle = HILL_COLOUR;
  ctx.fill();
}

// --- THE TREELINE: a lower, nearer, darker run of trees in front of the range
function drawTreeline(ctx) {
  worldSpace(ctx);
  const bumps = [
    [-252, 4.4], [-224, 3.0], [-196, 4.8], [-168, 2.9], [-140, 4.6], [-112, 3.1], [-84, 4.9],
    [-56, 3.0], [-28, 4.6], [0, 3.1], [28, 4.8], [56, 3.0], [84, 4.7], [112, 3.2], [140, 4.6],
    [168, 3.0], [196, 4.8], [224, 3.1], [252, 4.4],
  ];
  ctx.beginPath();
  ctx.moveTo(-HORIZON_REACH - 12, 0);
  for (const [bx, by] of bumps) ctx.quadraticCurveTo(bx - 12, by + 1.4, bx, by);
  ctx.lineTo(HORIZON_REACH + 12, 0);
  ctx.closePath();
  ctx.fillStyle = TREE_COLOUR;
  ctx.fill();
}

// --- THE COMPOUND WALL: a low plinth line along the base, with a pilaster rhythm and a lit capstone
function drawWall(ctx) {
  worldSpace(ctx);
  const edge = HORIZON_REACH;
  block(ctx, -edge, 0, edge * 2, 1.2, WALL_COLOUR);
  for (let x = -edge + 6; x < edge; x += 12) {   // a pilaster every twelve units along it
    block(ctx, x, 0, 0.9, 1.2, COOL_DARK);
    block(ctx, x, 0, 0.22, 1.2, COOL_LIT);
  }
  block(ctx, -edge, 1.2, edge * 2, 0.3, COOL_LIT); // the lit capstone
}

// --- THE LAMPS ALONG THE WALL: drawn after the haze, so the little lights still burn through it
function drawWallLamps(ctx) {
  worldSpace(ctx);
  lampRow(ctx, 0, 1.62, HORIZON_REACH * 2 - 8, 54, 0.11);
}

// --- A FLANKING SHRINE: a carved wall on a plinth, a dark doorway, lamps beside it, and a stepped tower
function drawShrine(ctx, centreX, halfWidth, wallHeight, tiers, tierHeight, stone, lit, dark) {
  worldSpace(ctx);
  block(ctx, centreX - halfWidth - 0.8, 0, (halfWidth + 0.8) * 2, 0.8, stone);
  block(ctx, centreX - halfWidth - 0.8, 0.58, (halfWidth + 0.8) * 2, 0.22, dark);
  carvedWall(ctx, centreX - halfWidth, 0.8, halfWidth * 2, wallHeight - 0.8, stone, 4, lit, dark);
  block(ctx, centreX - 1.05, 0.8, 2.1, 2.2, DOORWAY_COLOUR);
  lamp(ctx, centreX - 1.55, 1.7, 0.14);
  lamp(ctx, centreX + 1.55, 1.7, 0.14);
  block(ctx, centreX - halfWidth - 0.8, wallHeight, (halfWidth + 0.8) * 2, 0.7, stone);
  block(ctx, centreX - halfWidth - 0.8, wallHeight, (halfWidth + 0.8) * 2, 0.2, dark);
  block(ctx, centreX - halfWidth - 0.8, wallHeight + 0.7, (halfWidth + 0.8) * 2, 0.2, lit);
  const tower = tieredTower(ctx, centreX, halfWidth - 0.6, wallHeight + 0.9,
    tiers, tierHeight, stone, lit, dark);
  finial(ctx, centreX, tower.top, tower.half, stone, lit);
}

// --- A GOPURAM: one of the two tower gateways flanking the hall - a carved base, a dark gate, lamps, and the
// stepped tower with its own crown. Shorter than the hall's tower, so the eye still climbs to the middle.
function drawGopuram(ctx, centreX) {
  worldSpace(ctx);
  const left = centreX - GOPURAM_HALF_WIDTH;
  const width = GOPURAM_HALF_WIDTH * 2;
  block(ctx, left - 0.9, 0, width + 1.8, 0.8, GOPURAM_STONE);           // its plinth
  block(ctx, left - 0.9, 0.58, width + 1.8, 0.22, COOL_DARK);
  carvedWall(ctx, left, 0.8, width, GOPURAM_WALL_HEIGHT - 0.8, GOPURAM_STONE, 5, COOL_LIT, COOL_DARK);
  frieze(ctx, centreX, GOPURAM_WALL_HEIGHT - 0.6, width, 9, 0.6, GOPURAM_STONE, COOL_LIT, COOL_DARK);
  block(ctx, centreX - 1.0, 0.8, 2.0, 2.8, DOORWAY_COLOUR);             // the gate
  lamp(ctx, centreX - 1.5, 1.7, 0.14);
  lamp(ctx, centreX + 1.5, 1.7, 0.14);
  block(ctx, left - 1.0, GOPURAM_WALL_HEIGHT, width + 2.0, 0.7, GOPURAM_STONE);
  block(ctx, left - 1.0, GOPURAM_WALL_HEIGHT, width + 2.0, 0.2, COOL_DARK);
  block(ctx, left - 1.0, GOPURAM_WALL_HEIGHT + 0.7, width + 2.0, 0.2, COOL_LIT);
  const towerBase = GOPURAM_WALL_HEIGHT + 0.9;
  lampRow(ctx, centreX, towerBase - 0.1, width - 1.2, 5, 0.11);         // lamps along its first cornice
  const tower = tieredTower(ctx, centreX, GOPURAM_HALF_WIDTH - 0.6, towerBase,
    GOPURAM_TIERS, GOPURAM_TIER_HEIGHT, GOPURAM_STONE, COOL_LIT, COOL_DARK);
  crown(ctx, centreX, tower.top, tower.half, GOPURAM_STONE, COOL_LIT, COOL_DARK);
}

// --- THE MANDAPA: the broad pillared hall - plinth, thirteen carved verticals, a frieze of niches, the dark
// doorway with its lamps, banners, garland swags, the overhanging cornice with its row of lamps and its two
// end pavilions, and the six-storey tower with its ornamented crown over all of it.
function drawMainTemple(ctx) {
  worldSpace(ctx);
  const left = MAIN_CENTRE_X - MAIN_HALF_WIDTH;
  const width = MAIN_HALF_WIDTH * 2;
  const corniceLeft = left - 1.6;
  const corniceWidth = width + 3.2;

  // the plinth, with its dark moulding and the lit line above it
  block(ctx, left - PLINTH_OVERHANG, 0, width + PLINTH_OVERHANG * 2, PLINTH_HEIGHT, MAIN_STONE);
  block(ctx, left - PLINTH_OVERHANG, PLINTH_HEIGHT - 0.24, width + PLINTH_OVERHANG * 2, 0.24, CARVE_DARK);
  block(ctx, left - PLINTH_OVERHANG + 0.25, PLINTH_HEIGHT - 0.6, width + (PLINTH_OVERHANG - 0.25) * 2, 0.14, CARVE_LIT);

  // the wall, and the frieze of small niches under the cornice
  carvedWall(ctx, left, PLINTH_HEIGHT, width, MAIN_WALL_HEIGHT - PLINTH_HEIGHT,
    MAIN_STONE, MAIN_WALL_VERTICALS, CARVE_LIT, CARVE_DARK);
  frieze(ctx, MAIN_CENTRE_X, MAIN_WALL_HEIGHT - FRIEZE_HEIGHT, width, 26, FRIEZE_HEIGHT,
    MAIN_STONE, CARVE_LIT, CARVE_DARK);

  // the doorway: a stepped frame, the dark opening, a lamp in each niche beside it
  const doorHalf = 3;
  const doorTop = PLINTH_HEIGHT + 5.4;
  block(ctx, MAIN_CENTRE_X - doorHalf - 1.0, PLINTH_HEIGHT, (doorHalf + 1.0) * 2, doorTop - PLINTH_HEIGHT + 0.5, MAIN_STONE);
  block(ctx, MAIN_CENTRE_X - doorHalf - 1.0, PLINTH_HEIGHT, 0.3, doorTop - PLINTH_HEIGHT + 0.5, CARVE_LIT);
  block(ctx, MAIN_CENTRE_X + doorHalf + 0.7, PLINTH_HEIGHT, 0.3, doorTop - PLINTH_HEIGHT + 0.5, CARVE_LIT);
  block(ctx, MAIN_CENTRE_X - doorHalf, PLINTH_HEIGHT, doorHalf * 2, doorTop - PLINTH_HEIGHT, DOORWAY_COLOUR);
  block(ctx, MAIN_CENTRE_X - doorHalf - 0.6, doorTop, (doorHalf + 0.6) * 2, 0.5, MAIN_STONE);   // the lintel
  block(ctx, MAIN_CENTRE_X - doorHalf - 0.6, doorTop + 0.5, (doorHalf + 0.6) * 2, 0.22, CARVE_LIT);
  lamp(ctx, MAIN_CENTRE_X - doorHalf - 1.9, PLINTH_HEIGHT + 2.0, 0.2);
  lamp(ctx, MAIN_CENTRE_X + doorHalf + 1.9, PLINTH_HEIGHT + 2.0, 0.2);

  // two banners either side of the doorway, and garland swags along the bays of the hall
  banner(ctx, MAIN_CENTRE_X - doorHalf - 3.6, MAIN_WALL_HEIGHT - FRIEZE_HEIGHT, 1.5, 4.8);
  banner(ctx, MAIN_CENTRE_X + doorHalf + 3.6, MAIN_WALL_HEIGHT - FRIEZE_HEIGHT, 1.5, 4.8);
  garland(ctx, MAIN_CENTRE_X + doorHalf + 5.6, MAIN_CENTRE_X + doorHalf + 7.4, MAIN_WALL_HEIGHT - FRIEZE_HEIGHT, 1.3);
  garland(ctx, MAIN_CENTRE_X + doorHalf + 7.6, MAIN_CENTRE_X + doorHalf + 9.4, MAIN_WALL_HEIGHT - FRIEZE_HEIGHT, 1.3);
  garland(ctx, MAIN_CENTRE_X - doorHalf - 5.6, MAIN_CENTRE_X - doorHalf - 7.4, MAIN_WALL_HEIGHT - FRIEZE_HEIGHT, 1.3);
  garland(ctx, MAIN_CENTRE_X - doorHalf - 7.6, MAIN_CENTRE_X - doorHalf - 9.4, MAIN_WALL_HEIGHT - FRIEZE_HEIGHT, 1.3);

  // the cornice, the parapet, and the row of lamps along it
  block(ctx, corniceLeft, MAIN_WALL_HEIGHT, corniceWidth, CORNICE_HEIGHT, MAIN_STONE);
  block(ctx, corniceLeft, MAIN_WALL_HEIGHT, corniceWidth, 0.34, CARVE_DARK);
  block(ctx, corniceLeft, MAIN_WALL_HEIGHT + CORNICE_HEIGHT, corniceWidth, LIT_CAP_HEIGHT, CARVE_LIT);
  block(ctx, corniceLeft + 0.3, MAIN_WALL_HEIGHT + CORNICE_HEIGHT + LIT_CAP_HEIGHT,
    corniceWidth - 0.6, PARAPET_HEIGHT, MAIN_STONE);
  lampRow(ctx, MAIN_CENTRE_X, TOWER_BASE_Y - 0.16, width - 2, 11, 0.16);

  // the two little pavilions at the ends of the cornice, each with its own cap and bead
  for (const px of [corniceLeft + 1.6, corniceLeft + corniceWidth - 1.6]) {
    block(ctx, px - 1.3, TOWER_BASE_Y, 2.6, 0.9, MAIN_STONE);
    block(ctx, px - 1.3, TOWER_BASE_Y + 0.9, 2.6, 0.24, CARVE_LIT);
    face(ctx, [
      [px - 1.1, TOWER_BASE_Y + 1.14],
      [px + 1.1, TOWER_BASE_Y + 1.14],
      [px + 0.5, TOWER_BASE_Y + 2.1],
      [px - 0.5, TOWER_BASE_Y + 2.1],
    ], MAIN_STONE);
    block(ctx, px - 0.26, TOWER_BASE_Y + 2.1, 0.52, 0.6, MAIN_STONE);
    ctx.beginPath();
    ctx.arc(px, TOWER_BASE_Y + 2.95, 0.26, 0, Math.PI * 2);
    ctx.fillStyle = MAIN_STONE;
    ctx.fill();
  }

  // the tower, and the crown that finishes it
  const tower = tieredTower(ctx, MAIN_CENTRE_X, MAIN_HALF_WIDTH - 1.2, TOWER_BASE_Y,
    MAIN_TOWER_TIERS, MAIN_TIER_HEIGHT, MAIN_STONE, CARVE_LIT, CARVE_DARK);
  crown(ctx, MAIN_CENTRE_X, tower.top, tower.half, MAIN_STONE, CARVE_LIT, CARVE_DARK);
}

// --- THE NEAR SHRINE: the small, dark shrine standing in front of the left gopuram
function drawNearShrine(ctx) {
  worldSpace(ctx);
  const centreX = NEAR_SHRINE_CENTRE_X;
  const half = NEAR_SHRINE_HALF_WIDTH;
  block(ctx, centreX - half - 1.1, 0, (half + 1.1) * 2, 0.9, NEAR_STONE);
  block(ctx, centreX - half - 1.1, 0.66, (half + 1.1) * 2, 0.24, CARVE_DARK);
  carvedWall(ctx, centreX - half, 0.9, half * 2, 3.1, NEAR_STONE, 4, CARVE_LIT, CARVE_DARK);
  block(ctx, centreX - 0.9, 0.9, 1.8, 2.2, DOORWAY_COLOUR);
  lamp(ctx, centreX - 1.45, 1.7, 0.15);
  lamp(ctx, centreX + 1.45, 1.7, 0.15);
  block(ctx, centreX - half - 0.8, 4.0, (half + 0.8) * 2, 0.7, NEAR_STONE);
  block(ctx, centreX - half - 0.8, 4.0, (half + 0.8) * 2, 0.2, CARVE_DARK);
  block(ctx, centreX - half - 0.8, 4.7, (half + 0.8) * 2, 0.2, CARVE_LIT);
  const tower = tieredTower(ctx, centreX, half - 0.6, 4.9, 3, 0.9, NEAR_STONE, CARVE_LIT, CARVE_DARK);
  finial(ctx, centreX, tower.top, tower.half, NEAR_STONE, CARVE_LIT);
}

// --- ONE OF THE CHARIOT'S GREAT WHEELS: a dark disc, a lit rim, spokes and a hub
function wheel(ctx, centreX, centreY, radius) {
  ctx.beginPath();
  ctx.arc(centreX, centreY, radius, 0, Math.PI * 2);
  ctx.fillStyle = CHARIOT_STONE;
  ctx.fill();
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = CARVE_LIT;
  ctx.stroke();
  ctx.lineWidth = 0.2;
  for (let i = 0; i < 8; i += 1) {
    const angle = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(centreX, centreY);
    ctx.lineTo(centreX + Math.cos(angle) * radius, centreY + Math.sin(angle) * radius);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(centreX, centreY, radius * 0.26, 0, Math.PI * 2);
  ctx.fillStyle = CARVE_LIT;
  ctx.fill();
}

// --- THE STONE CHARIOT: the temple's most recognisable thing - a small pavilion on solid carved wheels
function drawChariot(ctx, centreX) {
  worldSpace(ctx);
  const wheelY = CHARIOT_WHEEL_RADIUS;
  wheel(ctx, centreX - 2.7, wheelY, CHARIOT_WHEEL_RADIUS);
  wheel(ctx, centreX + 2.7, wheelY, CHARIOT_WHEEL_RADIUS);
  block(ctx, centreX - 3.9, 3.0, 7.8, 0.8, CHARIOT_STONE);            // the platform over the wheels
  block(ctx, centreX - 3.9, 3.8, 7.8, 0.28, CARVE_LIT);
  block(ctx, centreX - 3.4, 4.08, 6.8, 0.4, CHARIOT_STONE);           // its floor
  for (const px of [centreX - 3.0, centreX - 1.0, centreX + 1.0, centreX + 3.0]) {
    block(ctx, px - 0.3, 4.48, 0.6, 2.6, CHARIOT_STONE);              // four pillars
    block(ctx, px - 0.3, 4.48, 0.22, 2.6, CARVE_LIT);                 // lit on their near edge
  }
  block(ctx, centreX - 3.8, 7.08, 7.6, 0.8, CHARIOT_STONE);           // the entablature
  block(ctx, centreX - 3.8, 7.88, 7.6, 0.28, CARVE_LIT);
  face(ctx, [[centreX - 3.6, 8.16], [centreX + 3.6, 8.16], [centreX + 2.5, 9.2], [centreX - 2.5, 9.2]], CHARIOT_STONE);
  face(ctx, [[centreX - 2.3, 9.2], [centreX + 2.3, 9.2], [centreX + 1.2, 10.1], [centreX - 1.2, 10.1]], CHARIOT_STONE);
  block(ctx, centreX - 0.3, 10.1, 0.6, 1.3, CHARIOT_STONE);           // the finial
  ctx.beginPath();
  ctx.arc(centreX, 11.75, 0.52, 0, Math.PI * 2);
  ctx.fillStyle = CHARIOT_STONE;
  ctx.fill();
}

// --- THE WHOLE PICTURE, drawn once, far to near, with a veil of haze laid over each receding layer. The
// tallest thing in it is the main tower's crown, at 21.7 picture units. Drawn at TERRAIN_SCALE that is 9.7
// world units above the floor line, which puts it at 0.68 of the frame height (the frame spans y = -22 to
// +24.5 at this plane), so everything above it is open sky.
function drawPicture() {
  const canvas = document.createElement('canvas');
  canvas.width = PICTURE_WIDTH;
  canvas.height = PICTURE_HEIGHT;
  const ctx = canvas.getContext('2d');

  drawSky(ctx);            // the low warm glow only: the sky itself is left transparent on purpose

  drawHills(ctx);
  wash(ctx, HAZE_FAR);
  drawTreeline(ctx);
  wash(ctx, HAZE_MID);

  drawWall(ctx);
  drawShrine(ctx, -SHRINE_CENTRE_X, SHRINE_HALF_WIDTH, SHRINE_WALL_HEIGHT, SHRINE_TIERS, SHRINE_TIER_HEIGHT, FAR_STONE, COOL_LIT, COOL_DARK);
  drawShrine(ctx, SHRINE_CENTRE_X, SHRINE_HALF_WIDTH - 0.4, SHRINE_WALL_HEIGHT - 0.4, SHRINE_TIERS, SHRINE_TIER_HEIGHT, FAR_STONE, COOL_LIT, COOL_DARK);
  wash(ctx, HAZE_NEAR);
  drawWallLamps(ctx);      // lit after the haze, so the small lights still reach through it

  drawGopuram(ctx, -GOPURAM_CENTRE_X);
  drawGopuram(ctx, GOPURAM_CENTRE_X);
  drawMainTemple(ctx);
  drawNearShrine(ctx);
  drawChariot(ctx, CHARIOT_CENTRE_X);

  return canvas;
}

// --- THE BACKDROP ON SCREEN: one unlit, unfogged plane carrying the picture, standing on the floor
export function createBackdrop(scene) {
  let texture = null;
  try {
    texture = new THREE.CanvasTexture(drawPicture());
    texture.colorSpace = THREE.SRGBColorSpace;
  } catch {
    texture = null; // if the canvas is somehow unavailable, the backdrop is simply a plain dusk panel
  }

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    color: texture ? MATERIAL_TINT : FALLBACK_COLOUR,
    fog: false, // the picture stands well past FOG_FAR: fog would erase it, so it is never fogged
    // The picture's own sky is transparent, so it has to be blended for the real sky - sky.js, one stage per
    // portal - to show through it. Without this the texture's alpha would be ignored and the open sky above
    // the temple would be painted black over the sky it is meant to reveal.
    transparent: true,
  });

  const geometry = new THREE.PlaneGeometry(BACKDROP_WIDTH, BACKDROP_HEIGHT);
  geometry.translate(0, BACKDROP_HEIGHT / 2, 0); // so the plane stands on the floor, growing upward
  const backdrop = new THREE.Mesh(geometry, material);
  backdrop.position.set(0, 0, BACKDROP_Z);
  backdrop.renderOrder = BACKDROP_RENDER_ORDER;
  scene.add(backdrop);
  return backdrop;
}
