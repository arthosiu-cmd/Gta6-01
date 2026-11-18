# CHANGELOG — SOLMAR (gta6-01)

## Cycle 1 — 2026-11-18 (build)
- Wrote checklist.md (MUST/SHOULD/WOW) before building.
- Copied kit vendor/makefun-game.ts unchanged (sha256 matches kit) and
  the MIT LICENSE; wrote .makefun/owner.json for wallet
  5FGhpCb28E2Vq9d5DwMhKEBk3HoBpJHwDCKDtUb7YREV.
- Built the full game from scratch in this session (14 modules, ~70 KB
  source + vendored three.js r160): city, player, vehicles, pedestrians,
  police, missions, combat, HUD + minimap, procedural audio, input,
  save, shots, main loop, index.html, main.ts.
- First render test: all 14 modules `node --check` clean. Headless
  Chromium renders the game; first screenshot run caught a real bug —
  player.js imported `clamp` from city.js, which does not export it
  (Uncaught SyntaxError, module failed to load, start screen only).
  Fixed the import to utils.js.
- Second render (4 shot modes): game runs — HUD, minimap, objectives,
  mission briefs all live. Issues found by looking at the frames:
  - chase shot: no police car visible (spawned 70 m away, slower than
    the player car, and behind the camera). Fixed: spawn 42 m, police
    top speed 24 + 1.5/star (faster than the player's 30 cap), chase
    shot player speed 22 → 14 so police close in during warm-up.
  - foot shot: camera ended up inside/behind a building (grey wall
    filled the top of the frame). Fixed: camera pull-in — the camera
    shortens its distance while its position is inside a building
    footprint (new pointInBuilding helper in city.js).
  - mission shot: car spawned inside the park block. Fixed: spawn on
    road x=-160 heading north toward the package.
  - drive shot: car reads small. Fixed: chase-cam distance 11 → 9,
    height 3.2 + pitch*6 → 2.8 + pitch*5.
  - palms looked like giant flat green billboards. Fixed: smaller
    (2.4×0.7), lighter fronds, drooping rotation.
  - mission brief text was duplicated (brief card + toast showed the
    same long text). Fixed: toast now shows only "Title — step text".
  - police ram applied damage every frame (one touch could drain the
    whole bar). Fixed: 1.2 s ram cooldown per cruiser.
  - brief card was very wide and sat mid-screen. Fixed: 440 px, top 15%.
- Re-rendering all 4 shots after the fixes (pending at log time).
- Round 2 (same cycle, after looking at the re-renders):
  - drive shot: player car was a speck in the distance — the camera was
    still flying in from its spawn point (270 m away) because
    SwiftShader runs only ~2 s of game time before the screenshot.
    Fixed with snapCamera() (player.js, exported): the camera jumps to
    its chase position on shot staging and on Start. Debug readout
    ?debug=1 (writes mode/pos/camera/speed/wanted to #status) proved
    the cause: player z=-155, camera z=-149, time 2.4 s.
  - foot shot: no pedestrians/traffic in frame. Fixed: foot mode now
    stages 5 pedestrians and 2 traffic cars onto the player's street,
    and flattens camPitch to 0.1.
  - mission shot: car was on the park lawn (x=-160 is mid-block, not a
    road). Fixed: spawn on road x=-128 heading north; package waits in
    the park just ahead-left; beach visible on the horizon.
  - chase shot (round 3): camera snap fixed the framing but police
    were behind the camera. Fixed: spawnPoliceCarAt() (police.js) stages
    two oncoming cruisers 70 m ahead in frame; warm-up closes them to
    ~26 m. Cover shot now shows 2 cruisers + 3 stars + "The Drop".
  - Screenshots finalized as JPEG quality 88, 1280×800:
    1-chase.jpg 116,863 B, 2-foot.jpg 129,346 B, 3-drive.jpg 119,391 B,
    4-mission.jpg 110,353 B — all real headless-Chromium renders.
  - main.ts verified: two runs to out/ and out2/ byte-identical
    (diff -r clean); dossier 738,132 B, text 99,890 chars, 15 source
    files + 1 vendored; game/ 19 entries, 769,646 B; no http/https refs
    anywhere in game/. out/ and out2/ removed after the check.
  - Added serve.ts (own-words tiny static server) and LESSONS.md.

## Cycle 2 — 2026-11-18 (Continue fix + held-key verification)
- Playtest (browser, live Pages URL) confirmed the game plays and is
  ready to submit, with 2 notes: (a) Continue button missing right
  after "Save & quit to menu" until a reload; (b) held-WASD unverified
  (browser can only tap keys, game polls isDown per frame).
- ROOT CAUSE (a): main.js checked loadSave() and attached the Continue
  click handler only once at page load. A save made in the session was
  never re-checked, so Continue stayed hidden until a reload.
- FIX (a): new refreshContinueButton() — shows Continue whenever a save
  exists, checked live; click handler attached unconditionally; called
  at page load AND in the "Save & quit to menu" handler after G.save().
  Only game/src/main.js changed (11,120 → 11,347 B, +227 B). No change
  to save/load logic or gameplay. Camera pitch + punch/wanted notes
  are OUT OF SCOPE and untouched.
- VERIFIED (a) with Playwright + CDP (headless Chromium, fresh profile,
  no save at load): Continue hidden at load; Start → Esc → Save & quit
  to menu → Continue VISIBLE immediately (inline-block, start screen
  flex, no reload) → click Continue → mode 'play', position restored
  (1,120) vs saved (0,120), restore distance 1 (integer rounding).
  The save/load mechanism itself was already proven by the browser
  playtest (reload → Continue restored HP 100, $150, mission, position
  exactly); this test proves the BUTTON now appears and triggers it.
  PASS.
- VERIFIED (b) with Playwright keyboard.down (HELD key, not tap):
  on foot (?shot=foot): held W 30 s wall → 11 units in 2.4 s game time
  (~4.6 u/s vs 5 u/s walk speed). Driving (?shot=drive): held W 30 s
  wall → speed 12.1 → 29 (clamp 30), 39 units in 1.7 s game time.
  Control: 5 quick taps moved ~1 unit (rounding noise); coasting
  without input decays speed (13 → 11.3). Held key WORKS; the
  playtest's tap-only input was the limitation, not the game.
  Caveat: headless SwiftShader runs ~1.6 fps, so game time advances
  ~0.08 s per wall second — movements are small in absolute terms but
  exactly proportional to game time and match the designed physics.
- Only console error in the runs: favicon.ico 404 (no favicon file;
  benign, not a game asset).
- main.ts re-verified after the fix: two runs byte-identical
  (diff -r clean); dossier 738,363 B (< 1.5 MiB); game/ 19 entries,
  769,873 B. Screenshots unchanged (headless JPGs still the submitted
  set); main.ts / dossier / screenshots otherwise untouched.
