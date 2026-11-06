// tuning.js — every number the makers might tune, in one named export per value.

// --- THE SEVEN NOTES
export const LANE_COUNT = 7;
export const SWARAS = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni'];
export const KEYS = ['s', 'r', 'g', 'm', 'p', 'd', 'n'];

// --- RHYTHM (world units per second, and seconds)
export const SCROLL_SPEED = 4;          // how fast pillars fall toward the beat line
export const START_BEAT_GAP = 1.95;     // the slow opening gap between pillars
export const FASTEST_BEAT_GAP = 0.55;   // the floor the gap ramps down to
export const PILLARS_TO_FULL_SPEED = 30; // hits it takes to travel from one to the other

// The gap between pillars: slow at the start, tightening with every hit the player lands.
export function beatGap(hits) {
  const ramp = Math.min(1, Math.max(0, hits) / PILLARS_TO_FULL_SPEED);
  return START_BEAT_GAP + (FASTEST_BEAT_GAP - START_BEAT_GAP) * ramp;
}

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
// Where pillars appear. A pillar must be whole and readable on its first frame, so this is the highest
// the view can ever be minus half a pillar: the drop from here to the line is the player's whole lead.
export const SPAWN_Y = 7.4;
export const DESPAWN_Y = -6.0;        // fallen this far past the line, the pillar is gone (off screen first)
export const VIEW_HEIGHT = 13.0;      // world units tall the camera shows at least, on any window shape
export const VIEW_CENTER_Y = 1.8;     // camera height: the fall and the line both stay in view
export const VIEW_MARGIN = 0.6;       // empty world units left at the side of the seven lanes
export const LINE_THICKNESS = 0.16;
export const LINE_Z = 0.4;            // in front of the pillars, so the line always reads
export const BAND_Z = -0.3;           // the timing band sits behind the pillars, over the dancer
export const DANCER_WIDTH = 0.9;
export const DANCER_HEIGHT = 1.8;

// --- THE PORTAL (plain geometry: one ring at the line, opened by filling the beat meter)
export const PORTAL_RADIUS = 2.4;       // world units, at full size
export const PORTAL_SEGMENTS = 48;
export const PORTAL_INNER_RATIO = 0.72; // ring thickness, as a share of the radius
export const PORTAL_Z = 0.5;            // over the line and the pillars: this is the moment
export const PORTAL_DURATION = 1.2;     // seconds the portal is open and read
export const PORTAL_START_SCALE = 0.25; // the ring opens out from this share of PORTAL_RADIUS
export const PORTAL_OPACITY = 0.9;

// --- INSTRUMENTS: the makers' order. One section per instrument; a portal moves on one step.
export const INSTRUMENTS = ['Tabla', 'Sitar', 'Flute', 'Dhol', 'Santoor'];
// One placeholder voice per instrument: waveform, octave, envelope, and a pitch drop or a second
// detuned string for the struck ones. M4 swaps these for samples behind setInstrument() in audio.js.
export const INSTRUMENT_VOICES = [
  { type: 'sine', octave: 1, duration: 0.22, gain: 0.24, attack: 0.002, pitchStart: 1.8, dropTime: 0.08 }, // Tabla: struck, pitched
  { type: 'sawtooth', octave: 1, duration: 0.75, gain: 0.09, attack: 0.005, detuneCents: 9 },              // Sitar: long buzzing strings
  { type: 'sine', octave: 2, duration: 0.65, gain: 0.18, attack: 0.09 },                                   // Flute: high, soft swell
  { type: 'square', octave: 0.5, duration: 0.3, gain: 0.15, attack: 0.003 },                               // Dhol: low and blunt
  { type: 'triangle', octave: 2, duration: 0.55, gain: 0.12, attack: 0.003, detuneCents: 7 },              // Santoor: bright metal
];

// --- LANE LABELS (plain text: which key plays which lane; real styling is M4)
export const SHOW_LANE_STRIP = true;            // the strip under the lanes; off leaves only the pillar labels
export const LABEL_Y = STRIKE_Y - 0.72;         // just below the strike line, clear of the line itself
export const LABEL_Z = -1.0;                    // behind the pillars, so a pillar is never covered
export const LABEL_WIDTH = 1.4;                 // one lane is LANE_WIDTH = 1.5 wide
export const LABEL_FONT = '600 56px system-ui, sans-serif';
export const LABEL_CANVAS_HEIGHT_PX = 72;
export const LABEL_PADDING_PX = 12;             // blank canvas either side of the widest label
export const LABEL_KEY_GAP_PX = 14;             // gap between the key letter and the swara
export const LABEL_KEY_COLOR = '#f4f4f4';
export const LABEL_SWARA_COLOR = 'rgba(244, 244, 244, 0.66)';

// --- THE LABEL ON A FALLING PILLAR (the same text, on the pillar itself, facing the fixed camera)
export const PILLAR_LABEL_WIDTH = 0.95;         // inside the PILLAR_WIDTH = 1.1 face
export const PILLAR_LABEL_Z = PILLAR_DEPTH / 2 + 0.01; // in front of the pillar face, behind the strike line

// --- THE ONE-LINE PLAY HINT (quiet, bottom centre, out of the HUD's way, retires after a few pillars)
export const HINT_FONT_PX = 13;
export const HINT_BOTTOM_PERCENT = 2.5;         // of the window height, so it stays clear of the lanes
export const HINT_OPACITY = 0.5;
export const HINT_CLEARANCE_PX = 6;             // and never closer than this to the lane label strip
export const HINT_HIDE_AFTER_HITS = 8;

// --- THE BEAT METER (top centre, under the HUD row: fills with hits, empties on a life lost or a portal)
export const BEAT_METER_TOP_PX = 58;
export const BEAT_METER_WIDTH_PX = 260;
export const BEAT_METER_HEIGHT_PX = 10;
export const BEAT_METER_BORDER_PX = 2;
export const BEAT_METER_TRACK_COLOR = '#4a4a4a';
export const BEAT_METER_BACKGROUND_COLOR = '#1a1a1a';
export const BEAT_METER_FILL_COLOR = '#8a8a8a';
export const BEAT_METER_FULL_COLOR = '#f4f4f4'; // the moment the meter fills and the portal opens
export const INSTRUMENT_TOP_PX = 74;
export const INSTRUMENT_FONT_PX = 12;
export const INSTRUMENT_COLOR = 'rgba(244, 244, 244, 0.75)';
export const INSTRUMENT_PREFIX = 'Instrument: ';

// --- GREY-BOX COLOURS (flat greys, replaced at M4)
export const BACKGROUND_COLOR = 0x111111;
export const PILLAR_COLOR = 0x9a9a9a;
export const LINE_COLOR = 0xf0f0f0;   // the line is the brightest thing in the grey box: press here
export const BAND_COLOR = 0x3c3c3c;   // flat shade either side of it: this is the good window
export const DANCER_COLOR = 0xcccccc;
export const PORTAL_COLOR = 0xffffff;

// --- PLACEHOLDER AUDIO (synth tones; real instrument samples replace these at M4)
export const SWARA_FREQUENCIES = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88];
export const HIT_FREQUENCY = 1200;
export const HIT_TONE = { type: 'square', octave: 1, duration: 0.07, gain: 0.08, attack: 0.004 };
export const MISS_FREQUENCY = 110;
export const MISS_TONE = { type: 'sawtooth', octave: 1, duration: 0.28, gain: 0.13, attack: 0.006, pitchStart: 1.5, dropTime: 0.14 };
