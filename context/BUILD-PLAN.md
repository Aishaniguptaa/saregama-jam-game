# Build Plan

Drafted by the build terminal from your context kit and your card; you edit and approve it in `/jam-plan`. One page. Nothing here that you didn't say or approve.

**Approved by:** ag, nc — 12:36

## The game in one line

> You are an Indian dancer and devotee at the musical pillars of the Vijay Vithala temple in Hampi, tapping the glowing pillars on the beat to play an Indian orchestra and open portals into new dimensions.

## The one action

> Tap the correct glowing pillar as it reaches the beat line, on the beat.

## Card

> 5. Timing tapper — press at the right moment. One target, a timing window that tightens, combo counter. Card Stretch: one visual beat cue.

## Done means (3 to 5 checks you can play)

- [ ] I can press `S R G M P D N` and the matching pillar answers.
- [ ] A lit pillar reaching the line on the beat scores and raises my combo.
- [ ] A wrong tap costs a life; three wrong taps ends the run, and I can restart in under 2 seconds.
- [ ] Filling the beat meter opens a portal and a new instrumental pillar joins.
- [ ] Perfect hits drop collectibles that add to my score.

## Milestones

| Milestone | By | Done when (your words) |
|---|---|---|
| M1 gray box | 1:30 | 7 plain pillars scroll down past the dancer, each of the 7 keys hits its own pillar, a wrong tap costs a life, restart works. |
| M2 loop | 2:00 | Score, 3 lives, fail and restart in under 2 seconds; the beat meter fills and a portal opens. **Playtest 1** |
| M3 feel | 2:45 | Every number lives in `tuning.js`; the pillar flashes and the dancer reacts on a hit; a wrong tap and a miss each read clearly. **Playtest 2** |
| M4 look | 3:15 | Hampi stone, glowing pillars, the dancer, portal and instrument sound; gameplay frozen. |
| M5 ship | 3:30 | `JUDGING.md` self-check and `/jam-ship`. |

## Tasks

| Milestone | Task | Files | Owner | Check |
|---|---|---|---|---|
| M1 | Wave 1: scene, fixed side-on camera, game loop, state machine, restart | `index.html`, `main.js` | jam-builder | `node --check main.js`, page loads with no console errors |
| M1 | Wave 2a: pillars — build 7, scroll on a beat grid, reach the line | `tuning.js`, `pillars.js` | jam-builder | pillars scroll and reach the line at a steady beat |
| M1 | Wave 2b: input — key map, timing window judgement, hit/miss/life | `input.js` | jam-builder | right key on time = hit; wrong key = life lost |
| M1 | Wave 2c: audio — one tone per note, hit and miss sounds | `audio.js` | jam-builder | each of the 7 keys plays its own note |
| M1 | Wave 3: HUD — score, lives, beat meter, restart prompt | `ui.js` | jam-builder | numbers on screen match the state |
| M2 | Combo, points, portal threshold, game over screen | `main.js`, `ui.js`, `tuning.js` | jam-builder | a run ends and restarts in under 2 seconds |
| M3 | Feedback pass: pillar flash, dancer reaction, tightening window, `?fps` readout | `pillars.js`, `ui.js`, `tuning.js` | jam-builder | every timing number tunable without touching logic |
| M4 | Look: temple, glowing pillars, dancer, portal, instrument sounds | `world.js`, `audio.js`, `tuning.js` | jam-builder | gameplay unchanged from M3 |
| M5 | Self-check and ship | `meta.json`, `JUDGING.md` | jam-helper | checklist returns clean |

## File map

- `index.html`: page, import map (three.js 0.186.1), HUD markup
- `main.js`: scene, render loop, game state machine
- `tuning.js`: every number you might tune
- `pillars.js`: the 7 pillars, the beat grid, when a pillar is at the line
- `input.js`: key to note mapping, timing-window judgement
- `audio.js`: one tone per note, hit and miss sounds
- `ui.js`: score, lives, combo, beat meter, title and game over
- `world.js`: temple, backdrop, dancer, portal (M4)

## Tuning knobs

- `scrollSpeed` — how fast pillars fall
- `beatInterval` — the gap between pillars
- `timingWindowPerfect` / `timingWindowGood` — the ms window for perfect and for a normal hit
- `windowTightening` — how much the window shrinks per portal opened
- `hitsPerPortal` — first portal ~20 hits, later portals longer
- `lives` — 3
- `pointsPerHit` / `pointsPerPerfect` / `comboMultiplier` — scoring
- `laneCount` — starts at 7; the playtest can drop it to 4 with one number
- `keys` — S R G M P D N, remappable in one place

## Assets plan (the card's safe budget)

- **Blender is not installed**, so no custom GLB export. Models are built from three.js primitives — temple, pillars and dancer as boxes and cylinders. Free, no licence, and it keeps playtests judging the action.
- If you want a real dancer model instead, that means downloading a licensed GLB: hunting time plus a licence to record in `meta.json`. Your call, at M4.
- **Sounds: 5 instruments wanted (Tabla, Sitar, Flute, Dhol, Santoor), the card's safe budget is about 3 files.** Makers chose **real samples**, so the plan is:
  - M1 uses **synthesized placeholder tones** in `audio.js`, so the game has sound from the first playtest and the feel pass at M3 is not blocked.
  - Claude searches for **CC0 / public domain** samples in parallel from M1; real samples swap into the same `audio.js` interface at M4, or earlier if the search lands early.
  - Each replaced file gets `{ file, source, license }` in `meta.json`.
  - Safeguard: if no correctly-licensed sample is found for an instrument, that instrument keeps its synthesized tone. The game ships either way.
- Every downloaded file gets `{ file, source, license }` in `meta.json`; every file Claude creates goes in `ai_assets`.

## Cut list

If the clock bites, in this order:

1. Per-portal distinct destinations
2. Collectible types beyond one
3. The 56-pillar hall detail — keep the 7
4. Click/tap as a second input, if keys are enough
5. Compose mode

## Stretch (only after M4)

- Mode 2, Compose: players use the orchestra to play and record
- More collectible types
- A distinct destination for each portal
- One visual beat cue (the card's own Stretch)
