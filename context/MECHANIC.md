# Mechanic

How the game plays. Jam rule: the whole game is built around **one action the player repeats** (jump, dodge, run, aim, time a tap). Think Subway Surfers, Flappy Bird, or the Chrome dino.

## The one action

*What is the single action the player repeats, and what makes doing it again feel good?*

> Tap the correct glowing pillar as it reaches the beat line. The dancer is a devotee at the beat line; the pillars scroll down vertically past her.

## 500 times

*Would you do this action 500 times? What's different each time?*

> The pillars scroll vertically past the dancer. As portals open into new dimensions, new instrumental pillars join in and different Indian instruments play (Tabla, Sitar, Flute, Dhol, Santoor), so each stretch sounds and looks different.

## The worst 30 seconds

*Picture the most boring or frustrating 30 seconds of this game. What happens?*

> The first 30 seconds, where the player is trying to understand the gameplay.
>
> Fix direction from that: teach it on screen instead of leaving them to guess, and keep the very first beats slow and forgiving so the understanding happens before the pressure does.
>
> Claude's additional read, to be tested at the 2:00 playtest: the opening stretch of every retry can also drag once the player already knows the game. If it plays that way, make the first portal short (~20 hits) so the opening is a warm-up and not a wait.

## Controls

*Which keys or mouse actions, and what does each do?*

> One key per note, each key being the swara's first letter: S = Sa, R = Re, G = Ga, M = Ma, P = Pa, D = Dha, N = Ni.
>
> Note: these seven keys land across three keyboard rows (R/P top, S/D/G middle, M/N bottom). Readable because the letters match the notes; if the 2:00 playtest finds it fumbly, a tighter cluster is a one-line change in `tuning.js`.
>
> Keyboard only for the action: the player never clicks a pillar. The mouse moves the camera only — a look control with no effect on scoring or on the dancer's position. The dancer stays at the beat line.

## Win and lose

*How does a round end? What counts as doing well?*

> Three lives. A wrong tap costs a life. A missed beat does not cost anything — it simply does not add to the score.
>
> Score is a points system. The loop is: tap, hit the beat, unlock a portal to the new dimension, add new instrumental pillars. Perfect hits drop a collectible.
>
> Design consequence to watch at playtest: because missing is free and a wrong tap is expensive, the safe play is to tap late or not at all. If the playtest plays passively, a missed beat should also break the combo.
