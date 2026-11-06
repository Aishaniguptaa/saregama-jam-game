# Runbook

How to run and ship this game. The devlog terminal keeps this current.

## Run locally

Start a local server in a third terminal (not a Claude terminal). Don't double-click `index.html`.

| macOS | Windows (Git Bash) |
|---|---|
| `python3 -m http.server 8000 --bind 127.0.0.1` | `py -m http.server 8000 --bind 127.0.0.1` (or `python` instead of `py`) |

Then open http://localhost:8000.

## Controls

- **Seven keys, one per pillar:** `S` Sa, `R` Re, `G` Ga, `M` Ma, `P` Pa, `D` Dha, `N` Ni.
- **Space:** start, or restart after a game over.
- **Touch screens:** a row of seven lane buttons along the bottom does the same as the keys. It only shows on a touch device.

## Where things are

- `index.html`: page and three.js import map
- `main.js`: the game loop, scoring, lives, screens
- `tuning.js`: the numbers you can tune (speed, timing, keys, restart key)
- `input.js`: key map, keyboard listener, touch buttons
- `pillars.js`: the seven pillars and the glow cue
- `dancer.js`: the dancer
- `audio.js`: instrument samples
- `sky.js`, `backdrop.js`: the sky and the temple backdrop
- `labels.js`, `ui.js`: key labels and on-screen text
- `assets/`: sounds (`assets/audio/`), 3D models (`assets/models/`), menu images, and temple SVGs
- `meta.json`: title, handle, description, asset credits, and `ai_assets` (AI-made files)

## Ship

In the build terminal: `/jam-ship`.
