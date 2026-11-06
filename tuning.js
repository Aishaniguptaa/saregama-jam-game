// tuning.js — every number the makers might tune, in one named export per value.

// --- THE SEVEN NOTES
export const LANE_COUNT = 7;
export const SWARAS = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni'];
export const KEYS = ['s', 'r', 'g', 'm', 'p', 'd', 'n'];

// --- RHYTHM (world units per second, and seconds)
export const SCROLL_SPEED = 6;        // how fast pillars fall toward the beat line
export const BEAT_INTERVAL = 0.85;    // seconds between pillars arriving at the line

// --- TIMING WINDOWS (seconds either side of the line)
export const WINDOW_PERFECT = 0.11;
export const WINDOW_GOOD = 0.17;
export const WINDOW_TIGHTENING = 0.92; // windows are multiplied by this per portal opened

// --- RULES AND SCORING
export const HITS_PER_PORTAL = 20;
export const LIVES = 3;
export const POINTS_HIT = 10;
export const POINTS_PERFECT = 25;
export const COMBO_MULTIPLIER = 0.1;  // extra score per combo step
export const RESTART_KEY = 'Space';   // event.code, starts and restarts a run

// --- GREY-BOX LAYOUT (plain shapes; the temple replaces these at M4)
export const LANE_WIDTH = 1.5;
export const PILLAR_WIDTH = 1.1;
export const PILLAR_HEIGHT = 1.5;
export const PILLAR_DEPTH = 0.7;
export const STRIKE_Y = -2.0;         // the beat line
export const SPAWN_Y = 7.0;           // where pillars appear, just inside the top of the view
export const DESPAWN_Y = -6.0;        // fallen this far past the line, the pillar is gone
export const VIEW_HEIGHT = 11.5;      // world units tall the camera shows on a wide screen
export const VIEW_CENTER_Y = 1.6;     // camera height: the fall and the line both stay in view
export const VIEW_MARGIN = 0.6;       // empty world units left at the side of the seven lanes
export const LINE_THICKNESS = 0.06;
export const DANCER_WIDTH = 0.9;
export const DANCER_HEIGHT = 1.8;

// --- GREY-BOX COLOURS (flat greys, replaced at M4)
export const BACKGROUND_COLOR = 0x111111;
export const PILLAR_COLOR = 0x9a9a9a;
export const LINE_COLOR = 0x666666;
export const DANCER_COLOR = 0xcccccc;

// --- PLACEHOLDER AUDIO (synth tones; real instrument samples replace these at M4)
export const SWARA_FREQUENCIES = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88];
export const NOTE_DURATION = 0.45;
export const NOTE_GAIN = 0.16;
export const HIT_FREQUENCY = 1200;
export const HIT_DURATION = 0.07;
export const HIT_GAIN = 0.08;
export const MISS_FREQUENCY = 110;
export const MISS_DURATION = 0.28;
export const MISS_GAIN = 0.13;
