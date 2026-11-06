// backdrop.js — the flat painted temple at the far end of the corridor: one canvas picture of the Vijay Vithala temple, standing behind everything else.
import * as THREE from 'three';
import { BACKDROP_Z, BACKDROP_WIDTH, BACKDROP_HEIGHT } from './tuning.js';

// --- THE PICTURE: one canvas at the plane's own proportions, drawn in code so it costs no download. It is
// wide enough that the middle sliver - the only part ever in frame - still holds the roof lines crisply.
const PICTURE_WIDTH = 4080;                          // canvas pixels across
const PIXELS_PER_UNIT = PICTURE_WIDTH / BACKDROP_WIDTH; // 24: canvas pixels to one world unit, and back
const PICTURE_HEIGHT = Math.round(PIXELS_PER_UNIT * BACKDROP_HEIGHT); // 1824: the plane's own aspect exactly

// --- THE DUSK SKY THE TEMPLE STANDS AGAINST: warm along the horizon, cooling upward. The picture is opaque,
// so it carries its own light and never depends on anything behind the camera.
const SKY_TOP_COLOUR = '#2b2942';      // the top of the picture, far above the part ever in frame
const SKY_MID_COLOUR = '#6b5a6b';      // the dusty middle of the sky
const SKY_ROSE_COLOUR = '#a97a76';     // the rose band above the sunset
const SKY_GLOW_COLOUR = '#e0a463';     // the warm glow along the horizon itself
const SKY_BASE_COLOUR = '#c98a58';     // and the warmest strip at the very base of the sky
const HORIZON_GLOW_COLOUR = 'rgba(255, 196, 130, 0.5)'; // the sun's own hazy glow, sitting behind the temple
const HORIZON_GLOW_EDGE = 'rgba(255, 196, 130, 0)';     // and where that glow has faded to nothing
const HORIZON_GLOW_RADIUS = 1250;      // how far the glow reaches, in canvas pixels from the picture's base

// --- THE DISTANT PLACE: blue and faint at the back, warm and dark in front. Depth is value and haze, not detail.
const HILL_COLOUR = '#8b93ad';         // the far range: the faintest thing in the picture
const TREE_COLOUR = '#5f6478';         // the treeline just in front of it
const WALL_COLOUR = '#6a6470';         // the compound wall the whole complex stands behind
const FAR_STONE = '#6f6572';           // the flanking shrines: stone still blue with distance
const MAIN_STONE = '#60544b';          // the mandapa: the first warm mass, and the middle of the picture
const NEAR_STONE = '#4c433c';          // the small shrine in front of it
const CHARIOT_STONE = '#3a322b';       // the stone chariot: nearest, and the darkest

// --- CARVING: the warm edge the sunset catches, and the shadow beside every recess. Far stone takes a cooler pair.
const CARVE_LIT = 'rgba(255, 214, 160, 0.22)';
const CARVE_DARK = 'rgba(18, 12, 8, 0.32)';
const COOL_LIT = 'rgba(214, 222, 245, 0.18)';
const COOL_DARK = 'rgba(34, 38, 54, 0.3)';
const DOORWAY_COLOUR = 'rgba(12, 8, 6, 0.86)'; // the dark doorway at the foot of the mandapa

// --- HAZE: a veil of the sky's own colour laid over each layer of far things, so distance reads as value
const HAZE_FAR = 'rgba(150, 150, 190, 0.5)';   // over the hills: the farthest step
const HAZE_MID = 'rgba(172, 152, 168, 0.34)';  // over the treeline
const HAZE_NEAR = 'rgba(196, 166, 158, 0.2)';  // over the shrines

// --- THE LAYOUT: how wide and tall each building is, in world units measured up from the floor line
const MAIN_CENTRE_X = 2;       // the mandapa sits just right of centre
const MAIN_HALF_WIDTH = 11;    // so its carved face is the broad mass of the middle of the picture
const MAIN_WALL_HEIGHT = 10.5; // the hall, up to its overhanging cornice
const MAIN_TOWER_TIERS = 5;    // the pyramidal tower over the hall
const SHRINE_HALF_WIDTH = 5;   // the flanking shrines
const SHRINE_WALL_HEIGHT = 6.4;
const CHARIOT_CENTRE_X = -8.5;      // the stone chariot: in front, and slightly off-centre
const CHARIOT_WHEEL_RADIUS = 1.7;   // its solid carved wheels

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
  // world units from here on: x = 0 is the middle, y = 0 is the floor line, and y grows upward
  ctx.setTransform(PIXELS_PER_UNIT, 0, 0, -PIXELS_PER_UNIT, PICTURE_WIDTH / 2, PICTURE_HEIGHT);
}

function wash(ctx, colour) {
  // a full-picture veil: whatever is already drawn sits back one step into the haze
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, PICTURE_WIDTH, PICTURE_HEIGHT);
  ctx.restore();
}

// --- THE SKY: the one layer drawn in plain canvas pixels, since it is a full-frame gradient
function drawSky(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const sky = ctx.createLinearGradient(0, 0, 0, PICTURE_HEIGHT);
  sky.addColorStop(0, SKY_TOP_COLOUR);
  sky.addColorStop(0.55, SKY_MID_COLOUR);
  sky.addColorStop(0.76, SKY_ROSE_COLOUR);
  sky.addColorStop(0.9, SKY_GLOW_COLOUR);
  sky.addColorStop(1, SKY_BASE_COLOUR);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PICTURE_WIDTH, PICTURE_HEIGHT);

  // the sun's own glow, low and behind the temple, so the silhouette has something warm to stand against
  const glow = ctx.createRadialGradient(
    PICTURE_WIDTH / 2, PICTURE_HEIGHT, 0,
    PICTURE_WIDTH / 2, PICTURE_HEIGHT, HORIZON_GLOW_RADIUS,
  );
  glow.addColorStop(0, HORIZON_GLOW_COLOUR);
  glow.addColorStop(1, HORIZON_GLOW_EDGE);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, PICTURE_WIDTH, PICTURE_HEIGHT);
}

// --- THE FAR RANGE: rounded hills, drawn wide so they run off both edges on any window shape
function drawHills(ctx) {
  worldSpace(ctx);
  const edge = BACKDROP_WIDTH / 2 + 6;
  ctx.beginPath();
  ctx.moveTo(-edge, 0);
  ctx.quadraticCurveTo(-64, 10.5, -46, 6.0);
  ctx.quadraticCurveTo(-34, 3.0, -22, 8.0);
  ctx.quadraticCurveTo(-8, 13.5, 4, 6.5);
  ctx.quadraticCurveTo(18, 0.5, 32, 7.5);
  ctx.quadraticCurveTo(46, 13.0, 60, 5.5);
  ctx.quadraticCurveTo(74, 1.5, edge, 6.5);
  ctx.lineTo(edge, 0);
  ctx.closePath();
  ctx.fillStyle = HILL_COLOUR;
  ctx.fill();
}

// --- THE TREELINE: a lower, nearer, darker run of trees in front of the range
function drawTreeline(ctx) {
  worldSpace(ctx);
  const edge = BACKDROP_WIDTH / 2 + 6;
  const bumps = [
    [-80, 4.6], [-68, 3.0], [-57, 5.0], [-46, 2.8], [-35, 4.6], [-23, 3.0], [-11, 4.8],
    [1, 3.1], [13, 4.6], [26, 3.0], [39, 4.9], [52, 3.0], [64, 4.6], [77, 3.2], [edge, 4.4],
  ];
  ctx.beginPath();
  ctx.moveTo(-edge, 0);
  for (const [bx, by] of bumps) ctx.quadraticCurveTo(bx - 5.5, by + 1.4, bx, by);
  ctx.lineTo(edge, 0);
  ctx.closePath();
  ctx.fillStyle = TREE_COLOUR;
  ctx.fill();
}

// --- THE COMPOUND WALL: a low plinth line along the base, running the full width of the picture
function drawWall(ctx) {
  worldSpace(ctx);
  const edge = BACKDROP_WIDTH / 2 + 4;
  block(ctx, -edge, 0, edge * 2, 1.2, WALL_COLOUR);
  block(ctx, -edge, 1.2, edge * 2, 0.3, COOL_LIT); // the lit capstone
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

// --- A TIERED TOWER: the pyramidal roof over a hall, each storey narrower than the one beneath it
function tieredTower(ctx, centreX, halfWidth, baseY, tiers, tierHeight, stone, lit, dark) {
  let half = halfWidth;
  let y = baseY;
  for (let i = 0; i < tiers; i += 1) {
    const top = y + tierHeight;
    face(ctx, [
      [centreX - half, y],
      [centreX + half, y],
      [centreX + half - 0.8, top],
      [centreX - half + 0.8, top],
    ], stone);
    block(ctx, centreX - half, y, half * 2, 0.36, dark);                                   // shadow under the storey
    block(ctx, centreX - half + 0.8, top - 0.26, (half - 0.8) * 2, 0.26, lit);             // its lit cornice
    y = top;
    half = Math.max(1.1, half - 1.5);
  }
  // the small crown, the finial neck, and the ball at the very top
  face(ctx, [
    [centreX - half, y],
    [centreX + half, y],
    [centreX + half * 0.5, y + 1.1],
    [centreX - half * 0.5, y + 1.1],
  ], stone);
  block(ctx, centreX - 0.28, y + 1.1, 0.56, 1.5, stone);
  ctx.beginPath();
  ctx.arc(centreX, y + 2.95, 0.62, 0, Math.PI * 2);
  ctx.fillStyle = stone;
  ctx.fill();
}

// --- A FLANKING SHRINE: a squat carved wall, a dark doorway, and a small stepped tower
function drawShrine(ctx, centreX, halfWidth, wallHeight, towerHeight, stone, lit, dark) {
  worldSpace(ctx);
  carvedWall(ctx, centreX - halfWidth, 0, halfWidth * 2, wallHeight, stone, 3, lit, dark);
  block(ctx, centreX - 1.1, 0, 2.2, wallHeight * 0.55, DOORWAY_COLOUR);
  block(ctx, centreX - halfWidth - 0.7, wallHeight, halfWidth * 2 + 1.4, 0.9, stone);
  block(ctx, centreX - halfWidth - 0.7, wallHeight + 0.9, halfWidth * 2 + 1.4, 0.24, lit);
  tieredTower(ctx, centreX, halfWidth - 0.8, wallHeight + 0.9, 3, towerHeight / 3, stone, lit, dark);
}

// --- THE MANDAPA: the broad pillared hall, its dark doorway, and the tall tiered tower over it
function drawMainTemple(ctx) {
  worldSpace(ctx);
  const left = MAIN_CENTRE_X - MAIN_HALF_WIDTH;
  const width = MAIN_HALF_WIDTH * 2;
  carvedWall(ctx, left, 0, width, MAIN_WALL_HEIGHT, MAIN_STONE, 7, CARVE_LIT, CARVE_DARK);
  block(ctx, MAIN_CENTRE_X - 3.2, 0, 6.4, 5.2, DOORWAY_COLOUR);
  block(ctx, MAIN_CENTRE_X - 3.9, 5.2, 7.8, 0.5, CARVE_LIT);          // the lintel over the doorway
  block(ctx, left - 1.4, MAIN_WALL_HEIGHT, width + 2.8, 1.5, MAIN_STONE);   // the overhanging cornice
  block(ctx, left - 1.4, MAIN_WALL_HEIGHT, width + 2.8, 0.4, CARVE_DARK);
  block(ctx, left - 1.4, MAIN_WALL_HEIGHT + 1.5, width + 2.8, 0.32, CARVE_LIT);
  tieredTower(ctx, MAIN_CENTRE_X, MAIN_HALF_WIDTH - 1.2, MAIN_WALL_HEIGHT + 1.5,
    MAIN_TOWER_TIERS, 1.75, MAIN_STONE, CARVE_LIT, CARVE_DARK);
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

// --- THE WHOLE PICTURE, drawn once, far to near, with a veil of haze laid over each receding layer
function drawPicture() {
  const canvas = document.createElement('canvas');
  canvas.width = PICTURE_WIDTH;
  canvas.height = PICTURE_HEIGHT;
  const ctx = canvas.getContext('2d');

  drawSky(ctx);

  drawHills(ctx);
  wash(ctx, HAZE_FAR);
  drawTreeline(ctx);
  wash(ctx, HAZE_MID);

  drawWall(ctx);
  drawShrine(ctx, -25, SHRINE_HALF_WIDTH, SHRINE_WALL_HEIGHT, 4.6, FAR_STONE, COOL_LIT, COOL_DARK);
  drawShrine(ctx, 25, SHRINE_HALF_WIDTH - 0.4, SHRINE_WALL_HEIGHT - 0.4, 4.2, FAR_STONE, COOL_LIT, COOL_DARK);
  wash(ctx, HAZE_NEAR);

  drawMainTemple(ctx);
  drawShrine(ctx, -16.5, 3.0, 4.2, 2.4, NEAR_STONE, CARVE_LIT, CARVE_DARK); // the small shrine in front
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
  });

  const geometry = new THREE.PlaneGeometry(BACKDROP_WIDTH, BACKDROP_HEIGHT);
  geometry.translate(0, BACKDROP_HEIGHT / 2, 0); // so the plane stands on the floor, growing upward
  const backdrop = new THREE.Mesh(geometry, material);
  backdrop.position.set(0, 0, BACKDROP_Z);
  backdrop.renderOrder = BACKDROP_RENDER_ORDER;
  scene.add(backdrop);
  return backdrop;
}
