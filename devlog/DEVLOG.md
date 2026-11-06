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

### 13:26: Keep santoor; find another sample
- **Changed:** The sample search found four of five instruments (tabla, sitar, flute, dhol), with no santoor. We're going to find another santoor sample instead of leaving it out.
- **Expected:** didn't predict
- **Saw:** Not yet.
- **Decided, and why (ag, nc):** Both of us. We want to keep santoor for the Indian orchestra aspect.

### 13:30: Label the lanes with their keys
- **Changed:** Changing the lanes: adding labels so we can see which key is which.
- **Expected:** To work out which key to hit, so we can play.
- **Saw:** After the label change, we played again. Below the line, when a note reaches the line, that works well now. It's too fast.
- **Decided, and why (ag, nc):** Both of us. So we can see which key is which.

### 13:33: Slow the notes down
- **Changed:** Slowing the notes down. How much is not set yet.
- **Expected:** didn't predict
- **Saw:** Not yet.
- **Decided, and why (ag, nc):** Both of us. It's too fast.

### 13:43: Tap on sight, not on the line
- **Changed:** Changing how we hit the right keys: tap as soon as the block is seen on screen, not when it touches the line.
- **Expected:** didn't predict
- **Saw:** Not yet.
- **Decided, and why (ag, nc):** Both of us. It doesn't make for good gameplay.

### 13:59: Pillars in a column, not falling down
- **Changed:** Dropped the falling pillars, like a piano game. The pillars now stand in a column on the right, with the instruments on the left. The light shows when to press.
- **Expected:** An instrument added on each level or as the game goes on. Portals open up as we progress. The seven pillars show which instrument we're on.
- **Saw:** Not yet.
- **Decided, and why (ag, nc):** Both of us. Falling pillars were like any other traditional game and would get boring. Here you see the pillars placed and get the notes for each instrument. This is what the actual temple design has, and each rhythm hits the glowing pillars.

### 14:53: Tanpura instead of santoor, for now
- **Changed:** Swapped santoor for tanpura. This reverses our 13:26 decision to keep looking for a santoor sample.
- **Expected:** didn't predict
- **Saw:** Not yet.
- **Decided, and why (ag, nc):** Both of us, for now. Claude suggested tanpura because it couldn't find santoor sounds. We accepted the suggestion and stopped looking for santoor.

### 15:27: Rejected 2D pillars in boxes
- **Changed:** Rejected Claude's version, which gave us 2D pillars in boxes.
- **Expected:** didn't predict
- **Saw:** Not yet.
- **Decided, and why (ag, nc):** Both of us. It wasn't looking good aesthetically.

### 15:35: Own models, not Blender
- **Changed:** Rejected Claude's suggestion to use Blender. We imported our own models instead.
- **Expected:** didn't predict
- **Saw:** Not yet.
- **Decided, and why (ag, nc):** Both of us. We wanted our own visual style.

### 15:39: Animate the rigged dancer
- **Changed:** Asked Claude to animate our rigged Indian dancer. The first try showed a grey box, not the dancer.
- **Expected:** A little dance form to play.
- **Saw:** Only the hands moving up and down. (Both of us tested it ourselves, not a playtest.)
- **Decided, and why (who):** Nothing decided yet.

### 15:43: A late beat scores less
- **Changed:** A beat that's a few seconds late adds less score.
- **Expected:** didn't predict
- **Saw:** Not yet.
- **Decided, and why (ag, nc):** Both of us. It is not a missed beat.

### 15:45: Speed fix, left to Claude
- **Changed:** Fixed the game getting quick too easily. We left the exact change to Claude.
- **Expected:** didn't predict
- **Saw:** Speed fix worked well now.
- **Decided, and why (ag, nc):** Both of us. The game becomes really quick really easily. We left the exact change to Claude.

### 15:48: Portal sky sequence, earth to space
- **Changed:** The portal sequence: earthly sky, clouds in the air, space, outer space, and galaxies, from the references we added.
- **Expected:** didn't predict
- **Saw:** Not yet.
- **Decided, and why (ag, nc):** Both of us. It's like we're going up in the sky higher and higher. It also tells how happiness is achieved through dance and music. It is how we reach God.

## Reflection

*At the end: What did you decide that Claude didn't? What did you reject from Claude, and why? What would you do with another jam session?*

**What did you decide that Claude didn't?** I decided on the instruments on the left, the pillars, the environment, the game design, etc.

## AI Use Disclosure

*Short summary for the gallery, taken from your running log in `devlog/AI-USE-LOG.md` (not from memory at the last minute). Say what you directed yourselves, what Claude Code did in the build terminal (and its builder subagents), and what other AI tools did. List every AI-generated asset file again here, or cite the log row that names it.*

*Be accurate: neither more nor less than what happened.*
