# LESSONS — SOLMAR (gta6-01), Cycle 1

## What worked
- **Ship the whole game first, then look at it.** The first render run
  (headless Chromium, all four `?shot=` modes) caught real bugs no
  syntax check could: a bad import that killed the whole module load,
  a camera that spawned 270 m from the player, a car staged inside a
  park. Looking at frames beats reading code.
- **Shot modes pay for themselves.** `?shot=` + `?seed=` made every
  render reproducible and let the chase/foot/drive/mission compositions
  be tuned in minutes instead of by playing the game by hand.
- **A debug readout in the DOM (`?debug=1`) settles arguments.** The
  drive shot looked wrong; the readout (player at z=-155, camera at
  z=-149, 2.4 s of game time) proved the camera was still flying in
  from its spawn point under virtual time — a real bug, not a bad
  angle. The fix (snap the camera on staging/start) helps real players
  too, not just screenshots.
- **Small, named modules made fixes local.** The police ram bug, the
  camera pull-in and the palm restyle each touched exactly one file.

## What bit us
- **An import typo killed the entire game.** `player.js` imported
  `clamp` from `city.js`, which does not export it — the module graph
  failed, the start screen stayed up, and nothing else ran. `node
  --check` passes each file alone; only a browser (or an import-graph
  check) catches a bad named import. Lesson: always render, never trust
  syntax checks alone.
- **Headless SwiftShader runs very few frames.** Under
  `--virtual-time-budget`, only a couple of seconds of game time
  elapsed before the screenshot. Anything that needs time to settle
  (camera damping, police closing in, brief timers) must be staged
  instantly instead: snap the camera, pre-place police close, warm the
  world up in a synchronous loop.
- **Grid coordinates are easy to get wrong by one block.** The package
  at (-160, 96) and the mission spawn at (-160, 150) looked "on a
  road" but x=-160 is mid-block (roads are at -192 and -128). Lesson:
  story positions must be picked from road coordinates, or the staging
  must deliberately put the player on a road.
- **Per-frame damage is a trap.** The police ram applied damage every
  frame — one touch could drain the whole health bar. Any contact
  damage needs a cooldown.
- **The camera will end up inside a building.** On a grid city the
  chase camera's rest position is over a block, not a road. Pull the
  camera in while its position is inside a building footprint.

## What we would do differently next time
- Add the `?debug=1` readout from the start — it turns "the screenshot
  looks wrong" into numbers in one run.
- Stage screenshots with the camera already snapped and the world
  already warmed up, from the first version of `shots.js`.
- Pick all story/waypoint positions from the road grid, and assert in a
  test that each one is within a few metres of a road.
- Keep the brief card and the toast from ever showing the same text:
  toast = short label, brief card = full story text.
