# AI use log

Update this file **as you go**, each time you use AI during the jam. It is honest accounting for you, judges, and teachers: what you asked, what came back, and what you kept. Using AI is expected; hiding it is not the goal.

Log **every** AI touch: Claude Code in the build terminal, image or 3D generators, sound tools, or anything else. If something became part of your game, log it here **and** credit the file in `meta.json` (`ai_assets`, or `assets` with source and license).

The devlog agent (`claude --agent devlog`) can add rows when you report what you did. Say the tool, a short prompt or summary, and what you did with the result.

## Your log

Add one row per use (newest first). Leave blank cells as `—` if they do not apply.

| Time | Tool / model | What you asked (prompt or short summary) | What came back | Kept, changed, or rejected (why) | Game asset? |
|------|--------------|------------------------------------------|----------------|-----------------------------------|-------------|
| 13:00 (commit e451e98) | Claude Code, build terminal (jam-companion) | Build M1: seven plain pillars, seven keys, lives that drop on a wrong tap, restart | Commit e451e98: pillars, keys, three lives, restart in code | Kept as first build. Nothing changed yet; see devlog 13:22 | No (code only) |
| Before 13:00 (commit c4b39a1) | Claude Code, build terminal (jam-companion), web search | Search for CC0 instrument samples: tabla, sitar, flute, dhol, santoor | Four of five found; no santoor sample | Kept the four (tabla, sitar, flute, dhol). Santoor gap still open | Yes: `assets/audio/tabla.mp3`, `sitar.mp3`, `flute.mp3`, `dhol.wav`. Credited in `meta.json` `assets` (CC0 and CC BY) |
| Before 13:00 (commit c4b39a1) | Claude Code, build terminal (jam-companion) | Cut a short excerpt from a longer dhol recording | `assets/audio/dhol.wav` excerpt | Kept. Excerpt cut by Claude, so it may belong in `ai_assets` too; to check | Yes: `assets/audio/dhol.wav` (CC BY 3.0, Johnny Kalsi / The Dhol Foundation) |
| ~14:32 (`Dancer_Rig.glb` saved) | Tripo AI (3D generator) | "give me an indian dancer with indian looks low poly" | A dancer model; we retopologized and rigged it in Tripo | Kept after retopo and rigging in Tripo. Reason for retopo: not stated yet | Yes: `assets/models/Dancer_Rig.glb` (also `Dancer.glb`). Tripo paid plan; terms allow game use |
| 15:39 | Claude Code, build terminal (jam-companion) | Animate our rigged Indian dancer | First try: grey box, not the dancer. Later: only hands moving up and down, no dance | Not kept as the animation yet. Nothing decided | No (code only; the dancer file is in the Tripo row) |
| ~14:01 (commit 0343085) | Tripo AI (3D generator) | "create Vijayanagra inspired carved pillars Indian Architecture" | Pillar model, re-exported low poly; later the seven carvings `pillar1` to `pillar7` | Kept. Earlier pillar file dropped and replaced by the seven carvings (commit 2ec3d83). Tripo paid plan | Yes: `assets/models/pillar1.glb` to `pillar7.glb`. Credited in `meta.json` and `ai_assets` |
| | | | | | |

## Worked example

You can delete this section once you understand the format. Do not copy these rows into your log.

| Time | Tool / model | What you asked (prompt or short summary) | What came back | Kept, changed, or rejected (why) | Game asset? |
|------|--------------|------------------------------------------|----------------|-----------------------------------|-------------|
| 1:05 | Image generator (ChatGPT) | Pixel sky background, purple sunset, 512 px wide | One PNG, too pink | Rejected; used a code gradient instead | No |
| 1:40 | Claude Code (Opus), build terminal | Make the cube jump on space with a little squash | Jump in `main.js` | Kept; tuned jump height after playtest | No (code only) |
| 3:10 | Meshy | Low poly tree, GLB | GLB, scale wrong | Kept after resize; checked license allows game use | Yes: `assets/tree.glb`. Meshy terms (note which tier you used) |
