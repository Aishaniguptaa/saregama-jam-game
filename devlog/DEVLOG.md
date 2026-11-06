# Devlog

Your record of the jam, in your words. The devlog terminal (`claude --agent devlog`) helps you write it; you decide what goes in. On a team, initials show who decided.

## Entries

Format for each change (one change per entry):

### HH:MM: short title
- **Changed:**
- **Expected:**
- **Saw:**
- **Decided, and why (who):**

Format for each milestone check-in (M1 to M5):

### HH:MM: M# check-in
- **Expected:**
- **Saw when we played it:**
- **Next (who decided):**

Format for each playtest (after M2 and after M3):

### HH:MM: Playtest N
- **Their story:**
- **Bored or stuck:**
- **What we'll change (who decided):**

### 12:45: Picked the concept and the card
- **Changed:** Picked Timing tapper as our card. The game is a vertical side-scroller set in the Vijaya Vittala Temple at Hampi, Vijayanagara empire, 15th century. The temple has 56 pillars, and 7 pillars surround it, tied to the 7 notes. The pillars glow and you tap the correct ones. Instruments: table, sitar, flute, dhol, santoor, etc. As you progress, a portal opens into outer space. Points system. Two modes: Rhythm Journey and Compose (use the orchestra to play and record).
- **Expected:** didn't predict
- **Saw:** Not built yet. Plan block.
- **Decided, and why (ag, nc):** Both of us. We picked Timing tapper because it suits our design: a vertical side-scroll in the temple, focused on its musical pillars. Team name SaReGaMa is for the seven notes of Indian music. Rhythm Journey is our first choice. Compose is for jam day if it fits.

### 12:47: Real recorded instruments, not synthesized
- **Changed:** Chose real recorded instruments over synthesized ones for the sounds.
- **Expected:** didn't predict
- **Saw:** Not tested yet.
- **Decided, and why (ag, nc):** Both of us. Real recorded instruments would sound better and more real, and would enhance the gameplay experience, since music is our key feature.

### 13:22: First playable M1 build (seven pillars, seven keys, lives)
- **Changed:** Built M1 as plain shapes: seven pillars, seven keys, lives that cost a life on a wrong tap, and restart. Start screen at the bottom says what to do. Score top left, lives top right, grey boxes coming down, dancer placeholder at the bottom.
- **Expected:** Working. We could hear the sound, tap, lose lives, see what happens, and test it.
- **Saw:** We could tap, and we lost lives. Tapping a lane whose pillars had already passed the line was good, and didn't feel like a trap yet. We couldn't see which grey box is which note (we expected that). The centre pillar is annoying: it covers the dancer on its way down. We couldn't judge the timing between pillars because we couldn't see the keys to press. One of us guessed a key, and S worked for Sa. Every note has the same sound right now.
- **Decided, and why (who):** Nothing decided yet.

## Reflection

*At the end: What did you decide that Claude didn't? What did you reject from Claude, and why? What would you do with another jam session?*

## AI Use Disclosure

*Short summary for the gallery, taken from your running log in `devlog/AI-USE-LOG.md` (not from memory at the last minute). Say what you directed yourselves, what Claude Code did in the build terminal (and its builder subagents), and what other AI tools did. List every AI-generated asset file again here, or cite the log row that names it.*

*Be accurate: neither more nor less than what happened.*
