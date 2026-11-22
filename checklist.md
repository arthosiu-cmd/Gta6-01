# SOLMAR — gta6-01 checklist (Cycle 1 — DONE 2026-11-18)

## MUST (gate + judge criterion 1)
- [x] game/ static files only, no network refs, index.html ≤ 1 MiB (7,028 B), game/ ≤ 993 files / 48 MiB (16 files, 796,343 B after Cycle 18 — compaction freed 38,275 B of dossier text, rival cost 1,985 B); Cycle 19: 806,851 B, dossier text 137,066 chars, margin 26,774 B
- [x] main.ts (Node 22 stdlib only) copies game/ + screenshots/ to /output, writes dossier.json via buildDossier (text 163840, shots max 4 / 262144 B, game 993 / 48 MiB); deterministic (two runs byte-identical, diff -r clean; re-verified Cycle 17: dossier 905,428 B, text 163,248 chars — margin only 592 B; re-verified Cycle 18: dossier 868,796 B, text 126,575 chars — margin 37,265 B)
- [x] 4 screenshots, each ≤ 256 KiB (129–145 KB), 1280×800 (long 1280, short 800), first by name = cover (1-chase.jpg); real headless-Chromium renders of this game, unedited; Cycle 5: mission shot now stages the courier tail (gold beacon + live "43m · 20s"), drive has an oncoming car + near peds, chase has extra traffic + 2 peds; foot unchanged from Cycle 4; Cycle 6: mission shot re-staged closer (courier ~25 m, live "25m · 20s · IN ZONE" + zone toast), all 4 re-rendered and checked, no regression; Cycle 7: edge lines on every road + parked cars at the curb beside the player in all 4 shots + a close car ahead in drive/chase, slim beacon, foot cross-traffic closer — all 4 re-rendered and checked, no regression; Cycle 8: drive shot is a three-quarter view (camera 11 degrees off the road axis — the player car shows its side + wheels, not a flat slab), beacon column shorter + slimmer + fainter (10 m / 0.7 / 0.3 — ends inside the frame, sky visible above it) — all 4 re-rendered and checked, chase byte-identical to Cycle 7, no regression; Cycle 9: chase cover is a three-quarter view too (same 11-degree offset — the blue player car shows its side + wheels, not a flat slab), foot cross-street cars now cross the intersection ahead (z=64 road, ~25 degrees off-axis, both visible) — chase + foot re-rendered and checked, drive byte-identical to Cycle 8, mission same composition, no regression; Cycle 10: mission shot is a three-quarter view too (same 11-degree offset — the yellow player car shows its side + wheels, not a flat slab), foot/drive/chase are the same compositions as Cycle 9 (debug readouts match Cycle 9 exactly; hashes differ by a few KB of live timing) — all 4 re-rendered and checked, no regression; Cycle 14: chase cover restaged to the port (player (128,-192) heading east past the container yard, roadblock + cruisers + "The Drop: Pick up the crate at the port 96m") and the beacon column shortened again (5 m / 0.6 / 0.35, marker cone 0.9 / 1.8 at y=4.2 — the Cycle 8 10 m column still reached the top edge of the renders) + fare marker lowered to just above the ped's head (y=2.4) — all 4 re-rendered and checked, no regression; Cycle 15: foot shot restaged to the park's edge (Rico on road x=-128 at (-128,224) heading north, park lawn + palms on his left beyond the z=192 cross street, hunt target 15 m ahead, both cross cars visible) — all 4 re-rendered and checked, mission byte-identical to Cycle 14, no regression; Cycle 17: drive shot restaged to the M9 street race (player in the car at the start line on the beach road, checkpoint 1 + gold ring + beacon 40 m ahead, live "Checkpoint 1/5 · 30s", beach + boat + towers as before) — drive re-rendered and checked, chase/foot/mission re-rendered and same compositions as Cycle 16, no regression; Cycle 18: drive shot re-rendered with the rival — orange "Falco" beside the red player car at the start line, "Checkpoint 1/5 · 30s · Rival 1/5" live in the objective bar, beacon + ring at CP1 ahead (135,916 B); chase/foot/mission re-rendered and same compositions as Cycle 17, no regression; Cycle 19: all 4 re-rendered — chase with heli + dispatch + dusk (148,407 B), foot dusk hunt (138,220 B), drive dusk race + radio (137,134 B), mission dusk tail (131,411 B)
- [x] .makefun/owner.json {"wallet": "5FGhpCb28E2Vq9d5DwMhKEBk3HoBpJHwDCKDtUb7YREV"}; LICENSE (MIT, kit copy)
- [x] City explorable on foot AND by car (enter/exit with E, steal parked/traffic cars)
- [x] Traffic cars (road AI, stop at red lights) + pedestrians (sidewalks, flee)
- [x] Wanted 1–5 stars, police cars + foot cops chase, busted / wasted states; Cycle 4: at wanted ≥ 3 the PD parks a 2-cruiser roadblock across the road ahead of the player (spawns from the road grid, despawns below wanted 3, player car cannot drive through it but can steer around on the sidewalk); Cycle 19: at wanted ≥ 4 a police helicopter joins (hover 44 m ahead + 34 m left, 9 m up, spotlight cone + pool on the player, "▲ AIR UNIT DEPLOYED" chip, minimap ring blip; staged in the chase cover at wanted 3); every live unit has a callsign (HARBOUR-11, TANGO-7, BULWARK-1/2, AIR-1) shown in the dispatch panel with live distance + role (PURSUIT / RAMMING / ROADBLOCK / SPOTLIGHT)
- [x] Missions: 9-chapter story chain with waypoint + objective + reward; Cycle 5: Mission 6 "Shadow the Courier" is a tail, not a go-to — stay 12–45 m behind the courier for 20 s, too close (<8 m) gets you spotted, too far (>55 m) loses him; Cycle 6: the game now teaches the zone — brief + step text name 12–45 m / 8 m / 55 m / 20 s, the HUD shows a live zone label (IN ZONE / TOO CLOSE / TOO FAR / EDGE), and each danger zone warns once per entry ("Too close — he'll spot you! Back off!" / "You're losing him — speed up!") before the fail lands; Cycle 10: Mission 7 "Clean Getaway" is a lose-the-heat evasion, not a go-to — stay clean for 25 s while wanted 3 (any new crime restarts the clock; wanted falling never does), then reach the safehouse; the HUD shows a live "25s · 3★" and the brief names the rule; Cycle 11: Mission 8 "The Enforcer" is a hunt, not a go-to — chase down Thorne's enforcer on foot and take him down (100 HP, he flees); Cycle 17: Mission 9 "Boardwalk Rush" is a street race, not a go-to — steal a car, then hit 5 checkpoints on the beachfront road in 30 s (needCar step first so the clock does not tick on foot); the HUD shows a live "Checkpoint N/5 · Ns" and gold rings mark the course; storyDone now happens after M9, not M8; Cycle 18: M9 is now a race against a rival — orange "Falco" runs the same 5 checkpoints at 17.5 m/s (~23.3 s for the 408 m course; clean player run ~16 s), player must finish first or the mission fails ("The rival beat you to the finish!"); the 30 s timer still ticks but the rival is the binding clock; the rival is not a traffic car (no lights, no gap logic, no rng draw, not stealable) and is removed on complete/fail/restart; the HUD shows a live "Checkpoint N/5 · Ns · Rival N/5"
- [x] Combat: punch (F) + pistol (click/Space), health; Cycle 3: a punch that lands now raises wanted +1 like a shot (was 0 stars; no double-count when the target goes down)
- [x] HUD: health, money, wanted stars, minimap canvas, objective + distance, speed, clock, controls hint; Cycle 19: dispatch panel (SOLMAR PD — n UNITS · CODE n, callsign + kind + live distance + role, 5 rows max) + radio readout + air-unit chip
- [x] Start screen + pause (Esc) + busted/wasted screens; save/load via localStorage (Cycle 2: Continue now appears immediately after Save & quit — was only after reload)
- [x] ?shot=foot|drive|chase|mission|start & ?seed= staged deterministic scenes, HUD + minimap visible in every shot; Cycle 4: brief card hidden during staged shots (objective bar + toast still show the mission), traffic + peds staged into every mode, camera yaw staged at its settled value (foot/mission were mid-swing before); Cycle 5: mission shot stages the M6 tail (courier + beacon + live distance/countdown in the objective bar), drive/chase restaged fuller, foot untouched; Cycle 6: mission shot stages the player closer (z=107, courier ~25 m at frame time) with peds moved to match; ?debug=1 readout now also reports camPitch; Cycle 10: ?shot=escape opens M7 straight at its lay-low step for live playtesting (the M1–M6 chain is too long to play through headlessly) — a test staging like ?debug=1, not a submitted screenshot; ?debug=1 readout now also reports layLow [remain, lastWanted]; Cycle 17: drive shot opens M9 straight at its race step (startMissionStep(G, 8, 1)) — a test staging like ?shot=escape, not a new screenshot; ?debug=1 readout now also reports race [idx, timer]; Cycle 18: ?debug=1 readout also reports rival [idx, x, z]
- [x] All JS modules node --check clean; no http/https src in index.html; bare "three" only via import map

## SHOULD (criteria 2–3: depth, feel)
- [x] Side activities: cash pickups + fare job (pick up pedestrian, drive to waypoint)
- [x] Procedural WebAudio: engine hum, siren, gunshot, punch, pickup chime, mission jingle, ambient music; M mute; Cycle 19: radio — 3 switchable procedural stations (98.1 Sunset Drive, 101.4 Harbour Nights, 104.7 Palm Static), N cycles, HUD readout with freq + station + track
- [x] Third-person chase camera, mouse orbit; sprint (Shift); R restart mission; Cycle 3: pitch half as sensitive (0.0012), capped at 0.5, and eases back to default 0.25 when the mouse is still (was 0.0022, cap 0.7, accumulated with no reset)
- [x] Seeded RNG deterministic city per ?seed=
- [x] Distinct districts: beach, port/industrial, park, downtown towers

## WOW (criteria 4–5: look, structure)
- [x] Sun-soaked coastal art direction: warm sun, sky + fog, shadows, facade textures, palms, ocean, clouds; Cycle 19: fixed golden-hour grade (17:41 — purple-orange gradient sky, warm fog, low warm sun, lit windows), no day/night cycle
- [x] Original names/story: Rico Vega, Lena Cruz, Marcus Thorne — nothing from Rockstar/GTA
- [x] One clear job per file, names that read as the outline (city/player/vehicles/pedestrians/police/missions/combat/hud/audio/input/save/shots)
- [x] Cover screenshot shows chase + wanted + minimap + mission objective in one frame (1-chase.jpg: port containers + yard on the left, 2 cruisers closing at ~18 m + 2-cruiser roadblock at ~42 m + close car + 2 parked cars + 3 stars + "The Drop: Pick up the crate at the port 96m" + "Roadblock ahead!" toast, minimap blips); Cycle 16: two gantry cranes + container stacks + apron fill the horizon at the end of the port road (was empty grass + fog)

## Verification log (Cycle 1)
- 14 modules node --check: all OK.
- Headless Chromium (Playwright cache, SwiftShader) rendered all 4 shot modes, 3 rounds; no JS errors (only the expected AudioContext-no-gesture warning).
- Bugs found by looking at frames and fixed: bad import (clamp from city.js), camera spawn 270 m from player (now snaps), camera inside building (pull-in), police slower than player + invisible (now faster, staged oncoming), park swallowing a road (mission spawn moved to road x=-128), per-frame ram damage (1.2 s cooldown), brief/toast text duplication, palm billboards.
- main.ts: `mkdir -p out out2 && MAKEFUN_OUTPUT_DIR=out node main.ts && MAKEFUN_OUTPUT_DIR=out2 node main.ts && diff -r out out2` → identical. Dossier 738,132 B (< 1.5 MiB), text 99,890 chars (< 163,840 cap), 15 source files + 1 vendored.
- NOT done by this builder (parent's job): push to arthosiu-cmd/gta6-01, browser playtest with real input, submit (needs Arie's approval).

## Verification log (Cycle 2 — Continue fix + held-key, 2026-11-18)
- Root cause (Continue): main.js checked loadSave() + attached the click handler only once at page load. Fixed with refreshContinueButton() (live check, unconditional listener, called at load + after Save & quit). Only game/src/main.js changed (11,120 → 11,347 B).
- Playwright + CDP (headless Chromium, fresh profile): Continue hidden at load → Start → Esc → Save & quit → Continue VISIBLE immediately (no reload) → click → mode 'play', position restored (1,120) vs saved (0,120), distance 1 (rounding). PASS.
- Held-key (keyboard.down, not tap): on foot held W 30 s wall → 11 units in 2.4 s game time (~4.6 u/s vs 5 u/s walk). Driving held W 30 s wall → speed 12.1 → 29 (clamp 30), 39 units in 1.7 s game time. Control: 5 taps ≈ 1 unit; coasting decays speed (13 → 11.3). Held key WORKS.
- Caveat: headless SwiftShader ~1.6 fps, so game time advances ~0.08 s per wall second; movements are small in absolute terms but exactly proportional to game time and match the designed physics.
- Only console error: favicon.ico 404 (no favicon file; benign).
- main.ts re-verified: two runs byte-identical (diff -r clean); dossier 738,363 B; game/ 769,873 B. Screenshots unchanged.
- NOT done by this builder (parent's job): push the Cycle 2 fix to GitHub, re-deploy Pages, submit (needs Arie's approval). Camera pitch + punch/wanted notes are OUT OF SCOPE and untouched.

## Verification log (Cycle 3 — camera pitch + punch/wanted, 2026-11-18)
- Root cause (pitch): player.js updateCamera moved camPitch by -mouseDY * 0.0022/frame (a ~400 px vertical sweep spanned the whole range), clamped to [-0.15, 0.7], and it only accumulated — nothing brought it back. Fixed: factor 0.0022 → 0.0012, clamp max 0.7 → 0.5, and when mouseDY === 0 the pitch damps gently to its default 0.25 (rate 0.3/s). Only player.js changed (6,244 → 6,607 B).
- Root cause (punch): tryPunch hit a ped for 30 damage, but hurtPed only calls addWanted when the ped goes DOWN (100 HP), while tryShoot calls addWanted(1) unconditionally. Fixed: a punch that lands now raises wanted +1, unless the target already went down (hurtPed/hurtCop already raised it) — no double-count. Only combat.js changed (4,515 → 4,853 B).
- All 14 modules node --check clean. main.ts re-verified: two runs byte-identical (diff -r clean); dossier 739,074 B; game/ 770,574 B. Screenshots unchanged.
- CDP verification (Playwright + headless Chromium): RUNNING at log time (script /tmp/verify-cycle3.cjs) — pitch peak/decay + punch-wanted results to be appended here.
- NOT done by this builder (parent's job): push the Cycle 3 fix to GitHub, re-deploy Pages, seal the NEW recording (01a1ef03) + submit round 2 with BOTH recordings (needs Arie's approval).

## Verification log (Cycle 4 — living-city staging + roadblock, 2026-11-19)
- Files changed: police.js 7,614 → 10,511 B (spawnRoadblock, removeRoadblock,
  parked skip in updatePolice), vehicles.js 9,375 → 10,808 B (roadblock-only
  circle test in updatePlayerCar), shots.js 3,217 → 6,788 B (traffic + peds
  in every mode, brief hidden in shots, camYaw staged settled),
  main.js 11,347 → 11,757 B (debug readout: roadblock / police / ped
  positions). vendor/makefun-game.ts untouched (sha256 dc671875…).
  LICENSE / README / .makefun/owner.json untouched.
- All 14 modules node --check clean.
- Headless Chromium renders (CDP driver rebuilt in Node stdlib at
  /tmp/cycle4/cdp.cjs + render.cjs — old Playwright scripts were gone
  from /tmp and no playwright library is installed; Chromium 131 from
  ~/.cache/ms-playwright, serve.ts on :8091, 1280×800, JPEG q88, 1.2 s
  wait after __solmarReady): all 4 shots re-rendered and LOOKED at.
  - 1-chase.jpg 106,646 B: no brief card; player car + 1 cruiser closing
    at ~23 m + roadblock pair at ~44 m + 1 traffic car further ahead +
    3 stars + "The Drop: Pick up the crate at the port 451m" + toast
    "Roadblock ahead!". Debug: police 4, pc [[-40,126,chase],
    [-40,130,chase],[-19,125,rb],[-19,132,rb]], ped (-26,137).
  - 2-foot.jpg 124,491 B: no brief card; camera settled behind Rico;
    all 5 peds in frame ahead of him (debug peds (-5,78),(-2,89),
    (-1,75),(3,86),(7,70)), none clipped; road + city ahead.
  - 3-drive.jpg 113,689 B: no brief card; 1 traffic car clearly ahead
    (~57 m) + 1 ped on the right sidewalk + skyline; peds debug
    (9,-117),(-8,-98). The other 2 traffic cars (74/90 m) are small at
    the vanishing point.
  - 4-mission.jpg 116,205 B: no brief card; camera settled behind the
    yellow car; 1 traffic car ahead + 2 peds near the package + park +
    beach on the horizon; peds debug (-120,106),(-136,93).
  - Only console/network problem across all 4: favicon.ico 404 (benign,
    no favicon file). No JS errors. (The AudioContext-no-gesture
    warning did not even appear as a console problem in these runs.)
- Node harness /tmp/cycle4/harness.mjs (REAL game modules copied
  byte-identical, three.js from the vendored copy, stubbed G): 24/24
  PASS — roadblock spawns at wanted 3 on the road ahead ((-19,124.5) /
  (-19,131.5) for the chase geometry; (-3.5,-19)/(3.5,-19) heading +z),
  parked (positions unchanged over 2 s, chase cars still move, no
  second roadblock), despawns at wanted 2 (chase cars stay, respawns at
  wanted 3), stand-down at wanted 0 removes it too, off-road guard
  (no spawn mid-block), held-W car never crosses x=-19 (stops ~1 m
  short, speed collapses), car CAN pass on the sidewalk (route not
  permanently blocked).
- CDP playtest /tmp/cycle4/playtest.cjs: (A) held W in ?shot=chase —
  car accelerated 13 → 30, stopped at px=-20, speed 30 → 0.3, never
  crossed x=-19, roadblock stayed 2 / police 4 / mode play: PASS.
  (B) normal-play sanity — Start → mode play, Esc → pause screen,
  Save & quit → Continue inline-block, Continue → mode play, pos
  restored (0,120): PASS.
- main.ts re-verified: two runs byte-identical (diff -r clean); dossier
  727,668 B (< 1.5 MiB); game/ 19 entries, 778,885 B; index.html 7,028 B;
  no http/https refs in game/. out/ and out2/ removed after the check.
- NOT done by this builder (parent's job): push to GitHub, submit
  round 3 (needs Arie's explicit approval).

## Verification log (Cycle 5 — courier tail + fuller frames, 2026-11-20)
- Files changed: missions.js 10,633 → 15,299 B (M6, designateCourier,
  startMissionStep, tailTarget, tail branch in updateMissions, beacon
  tail branch, tail cleared on start/complete/fail), vehicles.js
  10,808 → 10,906 B (noTurn skip in updateTraffic), hud.js 6,989 →
  7,721 B (tailTarget on the minimap, tail objective + live "43m ·
  20s"), shots.js 6,788 → 8,375 B (drive oncoming car + 2 near peds,
  chase extra traffic + extra ped, mission restaged to the M6 tail),
  main.js 11,757 → 12,339 B (debug readout: mission index/step,
  tail [x,z,hold,spot,lose], objective texts). player.js, combat.js,
  police.js, save.js, city.js, audio.js, input.js, pedestrians.js
  byte-unchanged. vendor/makefun-game.ts untouched (sha256 dc671875…).
  LICENSE / README / .makefun/owner.json untouched.
- All 14 modules node --check clean.
- Node harness ~/workspace/makefun/dev-gta6-cycle5/harness.mjs (REAL
  game modules copied byte-identical + sha256-verified, vendored
  three.js, stubbed G): 47/47 PASS — designation fields, hold 20 s
  in-zone completes M6 (+$800, storyDone, beacon hidden, ~40 frames),
  spotted fail at d=5 after ~2 s, lost fail at d=60 after ~3 s,
  edge zones (8–12 / 45–55 m) pause hold + decay spot/lose,
  boundaries 12/45 count, 8 does not, courier never turns across
  intersections (noTurn), ping-pong flips at along ±235, lazy
  designation (tail step + no tail → designates, no crash, hold
  counts next frame), save/load mid-M6 (applySave restores index 5;
  load restarts M6 at step 0; stealing a car advances to the tail),
  beacon follows the courier after 2 s warm-up (along ~82), M1
  completes at the garage → M2 starts, restart/fail clear the tail.
  (Control observation, not a gate: an ordinary car did not turn in
  the noTurn control run — the rng chance simply did not hit.)
- Headless Chromium renders (CDP driver rebuilt in Node stdlib at
  ~/workspace/makefun/dev-gta6-cycle5/cdp.mjs + render.mjs — durable,
  not /tmp; serve.ts on :8093, 1280×800, JPEG q88, 1.2 s wait after
  __solmarReady): all 4 shots re-rendered and LOOKED at.
  - 1-chase.jpg 106,392 B: no brief card; 2 chase cruisers + 2-cruiser
    roadblock + 1 traffic car at depth + 2 peds on the south sidewalk
    + 3 stars + "The Drop" + "Roadblock ahead!" toast. Debug: police
    4, pc [[-40,126,chase],[-40,130,chase],[-19,125,rb],[-19,132,rb]],
    peds (-26,137),(-36,137).
  - 2-foot.jpg 124,491 B (Cycle 4 file kept — foot staging
    untouched; re-render matched it).
  - 3-drive.jpg 113,828 B: no brief card; oncoming white car ~24 m
    ahead + 1 same-direction car far + 2 peds on the near sidewalks
    (debug peds (8,-148),(-7,-139)) + skyline.
  - 4-mission.jpg 115,995 B: no brief card; yellow player car +
    courier under its tall gold beacon ~43 m ahead + 2 peds +
    downtown towers; objective "Shadow the Courier: stay in the
    zone 43m · 20s". Debug: mi=5, ms=1, tail [-3,81,0.1,0,0].
  - Only console/network problem across all 4: favicon.ico 404
    (benign, no favicon file). No JS errors.
  - Staging fix found by looking: the extra chase ped first staged
    at x=-52 was hidden behind the player car from the chase camera;
    moved to x=-38, now visible by the cruisers.
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest.mjs:
  (A) tail live — held W in ?shot=mission: hold 0.1 → 2.1, distance
  43 → 12 m, objectiveDist live ("43m · 20s" → "11m · 18s");
  holding on, Rico overshot the courier (d 4 → 106 m), hold froze
  at 3.5, mission failed live: "Mission failed — Lost the
  courier! Press R to retry." (B) roadblock regression — held W in
  ?shot=chase 35 s: px -63 → -20, never crossed x=-19, roadblock
  stayed 2 / police 4 / mode play. (C) Continue/save — fresh
  profile: Continue hidden at load → Start → play (0,120) → Esc →
  pause visible → Save & quit → Continue visible inline-block
  immediately → Continue → play, pos restored (0,120) exactly.
  (D) punch/wanted — walked to a ped (2.2 m), first F punch landed:
  "You clocked a pedestrian!", wanted 0 → 1. Camera pitch NOT
  re-verified live: pointer lock did not engage headless (cam y
  stayed 4 before/after mouse-up); player.js untouched since Cycle 3,
  when pitch was verified live.
- main.ts re-verified with the final screenshots: two runs
  byte-identical (diff -r clean); dossier 735,216 B (< 1.5 MiB);
  game/ 16 files, 786,693 B; index.html 7,028 B; no http/https refs
  in game/src + index.html.
- NOT done by this builder (parent's job): push to GitHub (this work
  dir's .git has NO commits yet — everything untracked), submit
  round 3 (needs Arie's explicit approval).

## Verification log (Cycle 6 — tail tutorial + closer staging + pitch, 2026-11-20)
- Recording: code edits + re-render under #5 01a1f707-09f7-730d-
  bcf7-bc53e9af707b (PID 243483, alive at every edit; state seq 30 /
  acked 511). A runtime restart killed #5 mid-playtest (first
  playtest6 'a' run interrupted, empty log, no result — re-ran fully)
  and #6 01a1f70f-235d-7086-a536-c8d492537349 (PID 1852) was started
  the prescribed way before any further file was touched; docs,
  screenshot copy, determinism and all playtests below ran under #6
  (seq 38 / acked 437 at log time). No file was edited without a live
  recording. Submit with BOTH recordings.
- Files changed: missions.js 15,299 → 16,503 B (M6 brief + step text
  name the numbers, tailZone(d) helper, warnClose/warnFar once-per-
  entry danger warnings), hud.js 7,721 → 7,855 B (live zone label in
  objectiveDist), shots.js 8,375 → 8,788 B (mission spawn z=125 →
  107, peds 115/105 → 97/87), main.js 12,339 → 12,379 B (debug
  readout + camPitch). player.js UNTOUCHED (6,607 B); input.js,
  combat.js, police.js, vehicles.js, save.js, city.js byte-unchanged.
  vendor/makefun-game.ts untouched (sha256 dc671875…).
  LICENSE / README / .makefun/owner.json untouched.
- All 14 modules node --check clean.
- Node harness ~/workspace/makefun/dev-gta6-cycle5/harness.mjs (REAL
  game modules copied byte-identical + sha256-verified, vendored
  three.js, stubbed G; player.js added to the copy list this cycle):
  68/68 PASS (47 Cycle 5 + 21 new) — tailZone labels in every band
  (12/45 IN ZONE, <8 TOO CLOSE, >55 TOO FAR, 8/10/50/55 EDGE),
  warnClose/warnFar start false, close warning toasts exactly once
  over 3 s at d=5 then the spotted fail still lands, far warning
  once over 2 s at d=60, flags reset back in-zone and the far warning
  fires again on re-entry, edge zone does NOT re-arm the warning,
  brief names 12–45 m / 8 m / 55 m / 20 s, step text + step-start
  toast carry '12–45 m back', M6 still completes in 20 s in-zone
  (+$800, ~40 frames), M1 still completes at the garage, pitch math
  via the REAL player.js updateCamera (mouseDY -200: 0.25 → 0.49,
  again → clamp 0.5; mouseDY +500: → -0.1, again → clamp -0.15;
  mouseDY 0: damps 0.5 → ~0.25 and 0.1 → ~0.25 over 20 s game).
- Headless Chromium renders (render.mjs, serve.ts :8093, 1280×800,
  JPEG q88, 1.2 s wait after __solmarReady): all 4 shots re-rendered
  and LOOKED at.
  - 1-chase.jpg 106,520 B: no brief card; 2 chase cruisers + 2-cruiser
    roadblock + 1 traffic car at depth + 1 ped by the cruisers + 3
    stars + "The Drop" + "Roadblock ahead!" toast. Same composition
    as Cycle 5, no regression.
  - 2-foot.jpg 124,925 B: no brief card; Rico + all 5 peds ahead +
    green beacon + skyline. Same composition as Cycle 4/5.
  - 3-drive.jpg 113,828 B: no brief card; oncoming white car + 1
    same-direction car far + 2 near peds + skyline. Same as Cycle 5.
  - 4-mission.jpg 121,148 B: no brief card; yellow player car big in
    frame + courier LARGE under its tall gold beacon ~25 m ahead +
    2 peds on the sidewalks + downtown towers; objective "Shadow the
    Courier: stay in the zone 25m · 20s · IN ZONE"; toast "Shadow the
    Courier — Tail the courier — stay 12–45 m back". Debug: mi=5,
    ms=1, tail [-3,81,0.1,0,0], hold already counting. The courier
    is now readable instead of a dot at 43 m.
  - Only console/network problem across all 4: favicon.ico 404
    (benign, no favicon file). No JS errors.
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest6.mjs
  (new; serve :8095, fresh chrome-profile-play6):
  (A1) tutorial tail live — held W in ?shot=mission from d=25.2:
  hold 0.1 → 1.5 while IN ZONE; at d=7.6 the toast turned live to
  "Too close — he'll spot you! Back off!" and objDist to "6m · 19s ·
  TOO CLOSE" (+18 s wall, before any fail). Released W + braked S:
  spot peaked 0.5 then decayed to 0, d reopened 5.0 → 21.2, hold
  resumed 1.5 → 2.2, mission stayed active — RECOVERED live.
  (A2) held W through: "Too close" warning live at d=4.2, then the
  car passed the courier, d grew through EDGE/IN ZONE to 59.1 where
  "You're losing him — speed up!" fired live (objDist "62m · 18s ·
  TOO FAR"), then the mission failed live: "Mission failed — Lost
  the courier! Press R to retry." Both warnings preceded the fail.
  (B1) roadblock — held W in ?shot=chase 35 s: px -61 → -23, never
  crossed x=-19; supplementary 60 s run: px stopped at -20, speed
  30 → 0.7, roadblock stayed 2 / police 4 / mode play. (B2)
  Continue/save — fresh profile: Continue hidden at load → Start →
  play (0,120) → Esc → pause → Save & quit → Continue visible
  inline-block immediately → Continue → play, pos restored (0,120)
  exactly. (B3) punch/wanted — walked to a ped (2.2 m), first F
  punch landed: "You clocked a pedestrian!", wanted 0 → 1.
  (C) camera pitch — pointer lock did NOT engage headless
  (document.pointerLockElement null after canvas click), so the
  mouse path is NOT verified live: input.js only accumulates
  mousemove while locked, by design. The touch path (touchmove
  feeds mouseDY with no lock) WAS verified live in ?shot=drive:
  touch-drag up drove camPitch 0.25 → 0.30 → 0.34 → 0.38 → 0.42 →
  0.46 → 0.49 → 0.5 (clamp hit, stayed 0.5), then with the input
  still it damped back 0.49 → 0.42 over 25 s wall (game 5.1 → 5.9 s,
  toward the 0.25 default). Exact clamp/damp values are covered by
  the harness pitch checks on the real player.js (see above);
  player.js itself is untouched since Cycle 3.
- main.ts re-verified with the final screenshots: two runs
  byte-identical (diff -r clean); dossier 744,525 B (< 1.5 MiB);
  game/ 19 entries, 788,341 B; index.html 7,028 B; no http/https refs
  in game/src + index.html.
- NOT done by this builder (parent's job): push to GitHub (this work
  dir's .git has NO commits yet — everything untracked), submit
  round 3 (needs Arie's explicit approval).

## Verification log (Cycle 7 — fill the bottom half + slim beacon, 2026-11-20)
- Recording: all edits + renders + playtests under #6
  01a1f70f-235d-7086-a536-c8d492537349 (PID 1852, alive at every edit;
  state file mode 600, last update 04:27 UTC at log time). No file was
  edited without a live recording. Kit level 27, current (status: no
  level warning, can_submit YES).
- Files changed: city.js (edge lines: +36 meshes, 0.35-wide cream
  lines at ±5.5 m on every road) → 15,295 B; shots.js (parkCar helper
  + parked cars in all 4 shots + near traffic drive/chase + foot
  cross-traffic closer) → 11,959 B; missions.js (beacon column radius
  1.6 → 0.9, opacity 0.28 → 0.35) → 16,770 B; main.js (debug readout
  + park/traf/meshes) → 12,701 B. player.js, combat.js, police.js,
  vehicles.js, save.js, input.js, hud.js, audio.js, pedestrians.js,
  utils.js byte-unchanged. vendor/makefun-game.ts untouched (sha256
  dc671875…). LICENSE / README / .makefun/owner.json untouched.
- All 14 modules node --check clean.
- Node harness ~/workspace/makefun/dev-gta6-cycle5/harness.mjs (REAL
  game modules copied byte-identical + sha256-verified, vendored
  three.js, stubbed G): 74/74 PASS (68 Cycle 6 + 6 new) — staging
  prerequisites (>=2 parked cars, >=5 traffic cars, parked speed 0),
  beacon column radius 0.9 + opacity 0.35 + ring/cone still present.
- Headless Chromium renders (render.mjs, serve.ts :8093, 1280×800,
  JPEG q88, 1.2 s wait after __solmarReady): all 4 shots re-rendered
  and LOOKED at, twice (two staged spots fell outside the frame on
  the first pass and were moved + re-rendered).
  - 1-chase.jpg 129,034 B: no brief card; edge lines converge from
    the bottom corners; black parked car bottom-left + purple parked
    car bottom-right (both on the sidewalks); purple near-traffic car
    mid-right by the roadblock; 2 chase cruisers + 2-cruiser roadblock
    + 1 traffic car at depth + 2 peds + 3 stars + "The Drop" +
    "Roadblock ahead!" toast. Debug: park [[-56,137],[-58,119]],
    traf [[16,131],[62,131],[-51,131]], meshes 1712 (1708 + 4 police).
  - 2-foot.jpg 145,116 B: no brief card; edge lines; black parked car
    left + purple parked car right + a white cross-street car big at
    the right edge (traffic at (9,93), 9 m from Rico); all 5 peds
    ahead + green beacon + skyline. Debug: park [[9,88],[-9,86]],
    traf [[-14,99],[9,93]], meshes 1707 (no player car in foot).
  - 3-drive.jpg 134,094 B: no brief card; edge lines; purple parked
    car bottom-left + black parked car bottom-right (both on the
    sidewalks); yellow near-traffic car big lower-centre-left (~11 m
    ahead) + oncoming white car + 1 same-direction car far + 2 near
    peds + skyline. Debug: park [[9,-158],[-9,-155]], traf
    [[3,-104],[3,-79],[3,-70],[-3,-137],[3,-147]], meshes 1708.
  - 4-mission.jpg 142,368 B: no brief card; slim gold beacon (towers
    visible behind the courier now) + courier under its ring ~25 m
    ahead; black parked car bottom-left + purple parked car
    bottom-right; edge lines; objective "Shadow the Courier: stay in
    the zone 25m · 20s · IN ZONE". Debug: park [[9,100],[-9,102]],
    tail [-3,81,0.2,0,0], meshes 1708.
  - Baseline before the change: meshes 1672 (drive render); after:
    1708 = +36 edge lines exactly. Only console problem across all
    renders: favicon.ico 404 (benign). No JS errors.
  - Staging fix found by looking (twice): the chase parked car at
    (-66,137) sat 56 degrees off the camera axis (invisible) and the
    drive parked car at (-9,-160) at 45 degrees (only a sliver);
    moved to (-56,137) and (-9,-155) (29-33 degrees, inside the ~44
    degree half-FOV) and re-rendered — both now read big at the
    bottom corners. Same off-axis problem affects the foot
    cross-street car at (-14,99) (70 degrees, invisible) — left as
    is, the foot frame is already dense.
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest6.mjs
  (re-run, serve :8095, fresh chrome-profile-play6):
  (A1) tail tutorial — warned=true, recovered(hold resumed, still
  active)=true. (A2) hold W through — sawWarningBeforeFail=true,
  fail live "Mission failed — Lost the courier!". (B1) roadblock —
  first run px=-23 (35 s window, never crossed x=-19); re-run
  px=-20 (the car reached the roadblock stop, never crossed x=-19),
  roadblock 2 / police 4 / mode play. (B2) Continue/save — first run
  read mode=start on a single status read after the Continue click;
  investigated with a focused repro (b2-repro.mjs, existing + fresh
  profiles, repeated reads, console + exception capture): both
  variants mode=play, no console exceptions, and the B-section
  re-run also shows mode=play — the first read was a flaky single
  read, not a bug (save/start code untouched this cycle; the save
  format is unchanged). (B3) punch/wanted — first F punch landed
  live, wanted 0 → 1 (twice, both runs). (C) camera pitch —
  touch-drag up drove camPitch 0.25 → 0.49 (clamp), damped toward
  0.25 (0.43 at log end); pointer lock did NOT engage headless (as
  in Cycle 6).
- main.ts re-verified with the final screenshots: two runs
  byte-identical (diff -r clean); dossier 861,460 B (< 1.5 MiB),
  text 123,125 chars (< 163,840 cap); game/ 16 files, 792,940 B;
  index.html 7,028 B; no http/https refs in game/src + index.html.
  Screenshots in /output: 550,612 B total, 4 files.
- NOT done by this builder (parent's job): push to GitHub (this work
  dir's .git has NO commits yet — everything untracked), submit
  round 3 (needs Arie's explicit approval).
## Verification log (Cycle 8 — three-quarter drive shot + slim beacon, 2026-11-20)
- Recording: all edits + renders + playtests under #6
  01a1f70f-235d-7086-a536-c8d492537349 (PID 1852, alive at every edit;
  state file mode 600). No file was edited without a live recording.
  Kit level 27, current (status: no level warning; can_submit was YES
  at Cycle 7 verification, no change observed — no kit refresh).
- Files changed: shots.js (drive camYaw PI+0.2 / camOrbit 0.2, west
  parked car -155 -> -152) → 13,221 B; missions.js (beacon column
  60 m / 0.9 / 0.35 -> 10 m / 0.7 / 0.3) → 17,264 B; main.js (debug
  readout + pickups / fareMarker) → 13,017 B. player.js, combat.js,
  police.js, vehicles.js, save.js, input.js, hud.js, audio.js,
  pedestrians.js, city.js, utils.js byte-unchanged.
  vendor/makefun-game.ts untouched (sha256 dc671875…). LICENSE /
  README / .makefun/owner.json untouched.
- All 14 modules node --check clean.
- Node harness ~/workspace/makefun/dev-gta6-cycle5/harness.mjs (REAL
  game modules copied byte-identical + sha256-verified, vendored
  three.js, stubbed G): 78/78 PASS (74 Cycle 7 + 4 new) — beacon
  column 10 m tall + y 5, radius 0.7, opacity 0.3, ring + cone still
  present, beacon still follows the courier after warm-up. (The two
  Cycle 7 beacon checks asserting radius 0.9 / opacity 0.35 were
  updated to the Cycle 8 values — Cycle 8 supersedes them.)
- Headless Chromium renders (render.mjs, serve.ts :8093, 1280×800,
  JPEG q88, 1.2 s wait after __solmarReady): all 4 shots re-rendered
  and LOOKED at, three passes (16-degree offset first, then 11
  degrees + shorter beacon, then a final full pass).
  - 1-chase.jpg 129,034 B: byte-identical to Cycle 7 (sha256
    8813ff13…) — no regression. Roadblock + cruisers + traffic +
    peds + 3 stars + "The Drop" + "Roadblock ahead!" toast.
  - 2-foot.jpg 145,402 B: same composition as Cycle 7 (hash differs
    by a few pixels — the fare-marker cone above a ped moves between
    runs, a live-game element, not a staging change). Rico + 5 peds
    + parked cars + cross-street car + green cone + skyline.
  - 3-drive.jpg 140,632 B: three-quarter view — the red player car
    shows its left side + wheels instead of a flat slab; the road
    runs slightly diagonally; yellow near-traffic car + oncoming
    white car + 2 near peds + both parked cars in frame; skyline
    still in frame. Debug: camYaw 3.34 (= PI+0.2, settled — exactly
    the staged value, no damping drift), park [[9,-158],[-9,-152]],
    traf [[3,-104],[3,-79],[3,-70],[-3,-137],[3,-147]].
  - 4-mission.jpg 142,152 B: slim gold beam + cone ending inside the
    frame, sky visible above it; courier + ring clear at ~25 m;
    objective "Shadow the Courier: stay in the zone 25m · 20s ·
    IN ZONE". Debug: tail [-3,81,0.1,0,0], park [[9,100],[-9,102]].
  - Staging fix found by looking (twice): at a 16-degree offset the
    drive frame pulled a seeded cash pickup into view as a big
    floating gold diamond overlapping the parked car; at 11 degrees
    it is a sliver at the edge again, as in Cycle 7. Identified with
    the debug readout (pickup at (8,-159), 1 m from the parked car
    (9,-158)) + a zoomed crop of the frame. A 16 m beacon column was
    also tried first and rejected by the render: the chase camera
    looks down steeply at the player, so anything taller than ~13 m
    at the courier still pokes out of the top of the frame.
  - Only console problem across all renders: favicon.ico 404
    (benign). No JS errors.
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest6.mjs
  (re-run, serve :8095, fresh chrome-profile-play6):
  (A1) tail tutorial — warned=true, recovered(hold resumed, still
  active)=true. (A2) hold W through — sawWarningBeforeFail=true,
  fail live "Mission failed — Lost the courier!". (B1) roadblock —
  35 s window ended at px=-29 (still approaching, never crossed
  x=-19); see the 70 s supplementary run below. (B2) Continue/save
  — playtest6's single read said mode=start after the Continue
  click (the Cycle 7 flake again); b2-repro.mjs (repeated reads,
  both profiles, no exceptions) shows mode=start at +0.5 s and
  mode=play at +1.0 s — the single read caught the pre-click state,
  not a bug. (B3) punch/wanted — playtest6 punched 5 times at
  pedDist 3.2 m, outside the 2.4 m punch range, so none landed; see
  the focused repro below. (C) camera pitch — touch-drag up drove
  camPitch 0.25 → 0.49 (clamp), damped toward 0.25 (0.42 at log
  end); pointer lock did NOT engage headless (as in Cycles 6-7).
- Focused repros ~/workspace/makefun/dev-gta6-cycle5/repro-c8.mjs
  (new; serve :8099): (B1-long) held W in ?shot=chase 70 s wall —
  car stopped at px=-20, speed 30 → 0.8, roadblock stayed 2 /
  police 4 / mode play, never crossed x=-19: PASS. (B3-long) walked
  in ?shot=foot until the nearest ped was 1.4 m, then punch 1
  landed live, wanted 0 → 1: PASS. Both playtest6 anomalies were
  test-window artefacts (35 s window too short at this run's fps;
  3 m walk-stop looser than the 2.4 m punch range) — no game code
  was changed for either, and the longer windows now live in
  repro-c8.mjs. The B2 single-read flake is the third occurrence
  (Cycles 7 and 8): playtest6 should read the status repeatedly
  after any click that changes mode — a note for the next cycle's
  playtest, not a game fix.
- main.ts re-verified with the final screenshots: two runs
  byte-identical (diff -r clean); dossier 872,376 B (< 1.5 MiB),
  text 125,191 chars (< 163,840 cap); game/ 16 files, 795,012 B;
  index.html 7,028 B; no http/https refs in game/src + index.html.
  Screenshots in /output: 557,220 B total, 4 files.
- NOT done by this builder (parent's job): push to GitHub (this work
  dir's .git has NO commits yet — everything untracked), submit
  round 3 (needs Arie's explicit approval).


## Verification log (Cycle 9 — three-quarter chase cover + visible foot cross traffic, 2026-11-20)
- Recording: all edits + renders + playtests under #6
  01a1f70f-235d-7086-a536-c8d492537349 (PID 1852, alive at every edit;
  state file mode 600, elapsed 1h43m at log time). No file was edited
  without a live recording. Kit level 27, current (status: no level
  warning; can_submit YES).
- Files changed: shots.js (chase camYaw PI/2+PI+0.2 / camOrbit 0.2;
  foot cross cars fixed 96 -> 64, along ±30 -> ±36; drive comment
  updated — the offset is no longer drive-only) → 14,387 B.
  missions.js, vehicles.js, hud.js, city.js, main.js, police.js,
  player.js, combat.js, save.js, input.js, audio.js, pedestrians.js,
  utils.js byte-unchanged. vendor/makefun-game.ts untouched (sha256
  dc671875…). LICENSE / README / .makefun/owner.json untouched.
  Dev scripts: harness.mjs (+10 Cycle 9 checks, section 21),
  playtest6.mjs (B2 now reads repeatedly — test hygiene).
- All 14 modules node --check clean.
- Node harness ~/workspace/makefun/dev-gta6-cycle5/harness.mjs (REAL
  game modules copied byte-identical + sha256-verified, vendored
  three.js, stubbed G): 88/88 PASS (78 Cycle 8 + 10 new) — settled
  chase camYaw (no drift via real player.js updateCamera), camera
  settles ~1.8 m south of the road centre 9 m behind the car, all
  staged chase objects inside the ~44 degree half-FOV (south parked
  car ~35 degrees), z=64 is a real road and z=96 is not, cross cars
  end near ±20 after 2 s warm-up with no turn (cruise 8), cruise
  7/11 still clear of x=0 after warm-up + 1 s live with no turn,
  cross cars ~26 degrees off-axis at screenshot time.
- Headless Chromium renders (render.mjs, serve.ts :8093, 1280×800,
  JPEG q88, 1.2 s wait after __solmarReady): all 4 shots re-rendered
  and LOOKED at, one pass.
  - 1-chase.jpg 132,356 B: three-quarter cover — the blue player car
    shows its side + a wheel instead of a flat slab; the road runs
    diagonally; roadblock (2) + cruisers (2 oncoming + 2 chase) +
    traffic + both parked cars + peds all in frame; no seeded pickup
    pulled into view as a gold diamond at the edges (the nearest,
    (-29,136), sits ~19 degrees off-axis and reads as a small
    roadside object, not a floating slab). Debug: camYaw 4.91 (=
    PI/2+PI+0.2, settled — exactly the staged value, no damping
    drift), cam (-72,4,130), rb [(-19,125),(-19,132)], pc
    [(-40,126),(-40,130)], park [(-56,137),(-58,119)], traf
    [(16,131),(62,131),(-51,131)], peds [(-26,137),(-36,137)].
  - 2-foot.jpg 143,533 B: BOTH cross-street cars now visible
    crossing the intersection ahead (blue at left, white at right)
    — the dead spot since Cycle 7 is gone; everything else
    unchanged (Rico + 5 peds + parked cars + green cone + skyline).
    Debug: traf [(-20,67),(14,61)] — the second car moved 22 m in
    warm-up (seeded cruise ~11, inside the harness band); park
    [(9,88),(-9,86)].
  - 3-drive.jpg 140,632 B: byte-identical to Cycle 8 (sha256
    efb4f6b3…) — no regression. Debug: camYaw 3.34, park
    [(9,-158),(-9,-152)], traf [(3,-104),(3,-79),(3,-70),
    (-3,-137),(3,-147)].
  - 4-mission.jpg 142,834 B: same composition as Cycle 8 (hash
    differs by a few pixels — live timing variation, as Cycle 8's
    foot was); courier + ring clear at ~25 m, objective "Shadow the
    Courier: stay in the zone 25m · 20s · IN ZONE". Debug: tail
    [-3,81,0.1,0,0], park [(9,100),(-9,102)].
  - Only console problem across all renders: favicon.ico 404
    (benign). No JS errors.
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest6.mjs
  (re-run, serve :8095, fresh chrome-profile-play6; log
  playtest-c9.log):
  (A1) tail tutorial — warned=true, recovered(hold resumed, still
  active)=true. (A2) hold W through — sawWarningBeforeFail=true,
  fail live "Mission failed — Lost the courier! Press R to retry.".
  (B1) roadblock — 35 s window ended at px=-39 (still approaching,
  never crossed x=-19); see the 70 s supplementary run below.
  (B2) Continue/save — PASS on the FIRST read now (mode=play,
  px=0, pz=120, reads=[play@+0.5s]) — the repeated-read fix worked;
  no flake this run. (B3) punch/wanted — playtest6 artefact again
  (5 punches at >2.4 m, none landed); see the focused repro below.
  (C) camera pitch — touch-drag up drove camPitch 0.25 → 0.49
  (clamp), damped toward 0.25 (0.43 at log end); pointer lock did
  NOT engage headless (as in Cycles 6-8). PLAYTEST6 EXIT:0.
- Focused repros ~/workspace/makefun/dev-gta6-cycle5/repro-c8.mjs
  (re-run, serve :8099): (B1-long) held W in ?shot=chase 70 s wall —
  car stopped at px=-20, speed 30 → 0.7, roadblock stayed 2 /
  police 4 / mode play, never crossed x=-19: PASS. (B3-long) walked
  in ?shot=foot until the nearest ped was 1.0 m, then punch 1
  landed live, wanted 0 → 1: PASS. REPRO EXIT:0, "ALL PASS".
- main.ts re-verified with the final screenshots: two runs
  byte-identical (diff -r clean); dossier 876,408 B (< 1.5 MiB),
  text 126,351 chars (< 163,840 cap); game/ 16 files, 796,178 B;
  index.html 7,028 B; no http/https refs in game/src + index.html.
  Screenshots in /output: 559,355 B total, 4 files.
- NOT done by this builder (parent's job): push to GitHub (this work
  dir's .git has NO commits yet — everything untracked), submit
  round 3 (needs Arie's explicit approval).


## Verification log (Cycle 10 — second mission verb + three-quarter mission shot, 2026-11-20)
- Recording: all edits + renders + playtests under #7
  01a1f7f7-308a-7545-b82a-97fd0e6c5088 (PID 32328, alive at every edit;
  state file mode 600, elapsed 28m at log time). No file was edited
  without a live recording. Kit level 27, current (status: no level
  warning; can_submit was YES at Cycle 7 verification, no change
  observed — no kit refresh).
- Fresh 6-dim critique of Cycle 9 (from looking at the frames):
  correctness 9, compliance 10, code quality 9, performance 8,
  robustness 8, judge criteria 7 (weak dim) — 5 of 6 missions are
  "go to X" (M2's timed delivery and M3's "lose the heat" are flavour
  on go-to steps, never a mechanic; only M6's tail is a different
  verb), and the mission shot is the last frame where the player car
  reads as a flat slab from dead behind.
- Files changed: missions.js 17,264 → 19,296 B (M7, layLow state +
  branch, layLow cleared on start/fail), hud.js 7,855 → 8,466 B (live
  "25s · 3★" for the lay-low step; the five-star spelling wrapped the
  objective bar onto a second line, so the count is short and the full
  row stays in the HUD top-left), shots.js 14,387 → 16,282 B (mission
  camYaw 2*PI → 2*PI+0.2 / camOrbit 0.2; new ?shot=escape staging for
  live M7 playtesting), main.js 13,017 → 13,128 B (debug readout +
  layLow). player.js, combat.js, police.js, vehicles.js, save.js,
  input.js, audio.js, pedestrians.js, city.js, utils.js
  byte-unchanged. vendor/makefun-game.ts untouched (sha256 dc671875…).
  LICENSE / README / .makefun/owner.json untouched. Dev scripts:
  harness.mjs (+28 Cycle 10 checks, sections 22–25; sections 4/18
  updated — M6 now chains into M7 instead of ending the story),
  playtest-c10.mjs (new: D1 escape live), check-c10-hud.mjs (new:
  one-off live read of the short HUD format).
- All 14 modules node --check clean.
- Node harness ~/workspace/makefun/dev-gta6-cycle5/harness.mjs (REAL
  game modules copied byte-identical + sha256-verified, vendored
  three.js, stubbed G): 116/116 PASS (88 Cycle 9 + 28 new) — M7 data
  (reward 1000, 2 steps, step0 layLow 25 + onStart, step1 safehouse
  radius 8, M6 unchanged), brief teaches the rule (25 seconds, clock
  restarts), start wanted 3 + layLow opens at 25, countdown 25 s
  clean advances to the safehouse step in ~50 half-second frames,
  beacon marks the safehouse, safehouse completes M7 + story +$1000,
  5 s clean ticks to 20, wanted rise restarts at 25 + warns exactly
  once, next frame ticks down (no spam), wanted falling does NOT
  reset, restart/fail clear layLow, save mid-M7 restarts at step 0,
  settled mission camYaw (no drift via real player.js updateCamera),
  camera ~1.8 m east of the road centre 9 m behind the car, all
  staged mission objects inside the ~44 degree half-FOV (east parked
  ~36 degrees, courier ~3 degrees).
- Headless Chromium renders (render.mjs, serve.ts :8093, 1280×800,
  JPEG q88, 1.2 s wait after __solmarReady): all 4 shots re-rendered
  and LOOKED at, one pass.
  - 1-chase.jpg 133,863 B: same composition as Cycle 9 (blue
    three-quarter car, roadblock + cruisers + traffic + parked cars +
    peds, 3 stars, "The Drop 452m", "Roadblock ahead!" toast). Debug:
    camYaw 4.91, cam (-72,4,130), rb [(-19,125),(-19,132)], pc
    [(-40,126),(-40,130)], park [(-56,137),(-58,119)], traf
    [(16,131),(62,131),(-51,131)] — identical to Cycle 9.
  - 2-foot.jpg 143,743 B: same composition as Cycle 9 (Rico + 5 peds
    + cross-street cars + parked cars + green cone + skyline). Debug:
    peds [(-5,78),(-2,89),(-1,75),(3,86),(7,70)], traf
    [(-20,67),(14,61)] — identical to Cycle 9.
  - 3-drive.jpg 141,138 B: same composition as Cycle 9 (red
    three-quarter car + wheels, yellow near-traffic, oncoming white
    car, parked cars, peds, skyline). Debug: camYaw 3.34, park
    [(9,-158),(-9,-152)], traf [(3,-104),(3,-79),(3,-70),
    (-3,-137),(3,-147)] — identical to Cycle 9.
  - 4-mission.jpg 142,202 B: three-quarter view — the yellow player
    car shows its left side + wheels instead of a flat slab; the road
    runs diagonally; courier + ring + slim beacon clear at ~25 m,
    objective "Shadow the Courier: stay in the zone 25m · 20s ·
    IN ZONE". Debug: camYaw 6.48 (= 2*PI+0.2, settled — exactly the
    staged value, no damping drift), cam (2,4,115), tail [-3,81,0.1,
    0,0], park [(9,100),(-9,102)], peds [(-8,93),(8,85)]. No seeded
    pickup pulled into view at the frame edges (nearest, (-29,136),
    sits behind the camera).
  - Hashes for foot/drive/chase differ from Cycle 9 by a few KB with
    identical debug readouts and identical compositions — live timing
    variation in the 1.2 s post-ready wait (the fare-marker cone and
    the cruisers move between runs), as Cycle 8's foot and Cycle 9's
    mission did. Judged by composition, not hash.
  - Only console problem across all renders: favicon.ico 404
    (benign). No JS errors.
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest-c10.mjs
  (new; serve :8097, fresh chrome-profile-play10; log
  playtest-c10.log): (D1) M7 lay-low live in ?shot=escape — opens
  M7 step 0 with wanted=3, layLow=[24.9,3], police 4, roadblock 2 at
  (-3,62)/(4,62), objective "Clean Getaway: Lay low — stay clean
  until the heat dies down", objDist "25s · ★★★☆☆", toast
  "Roadblock ahead!"; the clock ticked down live (24.9 → 22.9 over
  20 s wall); one Space shot raised wanted 3 → 4 and reset the clock
  live to 25 s with the toast "New trouble — the heat's back up! Lay
  low again." and objDist "25s · ★★★★☆"; the countdown then
  completed live into step 1 (ms=1, layLow null, objective "Clean
  Getaway: Reach the safehouse", objDist "273m", wanted decayed
  4 → 3 by the passive decay) while the car survived wedged against
  a building past the roadblock (px -20, pz 42, speed 0.9) — mode
  stayed play throughout (320 s wall). D1 RESULT: opensRight=true
  shotFired=true resetSeen=true completed=true. The escape frame
  (renders/escape.jpg, not submitted) shows the getaway read: wanted
  3 + roadblock ahead + the lay-low objective.
- HUD format check ~/workspace/makefun/dev-gta6-cycle5/check-c10-hud.mjs
  (after the short-form cleanup): ?shot=escape live — objDist "25s ·
  3★" (expect "25s · 3★"), stars "★★★☆☆", mi=6 ms=0 wanted=3.
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest6.mjs
  (re-run, serve :8095, fresh chrome-profile-play6; log
  playtest-c10-regress.log): (A1) tail tutorial — warned=true,
  recovered(hold resumed, still active)=true. (A2) hold W through —
  sawWarningBeforeFail=true, fail live "Mission failed — Lost the
  courier!". (B1) roadblock — car drove to px=-20, speed 30 → 0.9,
  never crossed x=-19, roadblock 2 / police 4 / mode play (reached
  the stop inside the 35 s window this run). (B2) Continue/save —
  Continue visible immediately after Save & quit, click → mode=play,
  pos restored (0,120); reads=[start@+0.5s, play@+1s] (the
  single-read flake once, then play — the repeated-read fix holds).
  (B3) punch/wanted — walked to 2.2 m, punch 1 landed live, wanted
  0 → 1. (C) camera pitch — touch-drag up drove camPitch 0.25 →
  0.49 (clamp), damped toward 0.25 (0.43 at log end); pointer lock
  did NOT engage headless (as in Cycles 6-9). PLAYTEST6 EXIT:0.
- Focused repros ~/workspace/makefun/dev-gta6-cycle5/repro-c8.mjs
  (re-run, serve :8099; log repro-c10.log): (B1-long) held W in
  ?shot=chase 70 s wall — car stopped at px=-20, speed 30 → 0.7,
  roadblock stayed 2 / police 4 / mode play, never crossed x=-19:
  PASS. (B3-long) walked in ?shot=foot until the nearest ped was
  1.4 m, then punch 1 landed live, wanted 0 → 1: PASS. REPRO
  EXIT:0, "ALL PASS".
- main.ts re-verified with the final screenshots: two runs
  byte-identical (diff -r clean); dossier 883,272 B (< 1.5 MiB),
  text 130,964 chars (< 163,840 cap); game/ 16 files, 800,827 B;
  index.html 7,028 B; no http/https refs in game/src + index.html.
  Screenshots in /output: 560,946 B total, 4 files.
- NOT done by this builder (parent's job): push to GitHub, submit
  round 3 (needs Arie's explicit approval).

## Verification log (Cycle 11 — third mission verb + clean-hit fix, 2026-11-20)

- Fresh 6-dimension critique of the Cycle 10 state (frames looked at
  directly): correctness 9, compliance 10, code quality 9,
  performance 8, robustness 8, judge criteria 8 (weak dimension).
  Two fixes chosen: M8 hunt/takedown (third real verb) + foot shot
  restaged to the hunt. Beach/park vista and the 9 → 7.5 m camera
  change stay rejected (Cycle 8 reasons); M6/M7 and player.js
  untouched.
- Node harness ~/workspace/makefun/dev-gta6-cycle5/harness.mjs
  (modules combat.js + police.js added to the byte-identical copy
  list; makeG gains the real combat state + punch/gunshot audio
  stubs): **159/159 PASS** (149 Cycle 10 + 10 new §30). New checks:
  M8 onStart clears inherited M7 heat (wanted 3 → 0, police cars +
  foot emptied, hunt designated); tryPunch × 4 on the hunt target —
  health 70/40/10/down, wanted 0 throughout, M8 completes + story
  +$1,200; tryPunch on a bystander still raises wanted 0 → 1 with
  the "clocked a pedestrian" toast; tryShoot on the enforcer raises
  no wanted (health 66) while tryShoot on a bystander raises wanted
  0 → 1; hurtPed down on a bystander still raises wanted.
- Headless Chromium renders
  ~/workspace/makefun/dev-gta6-cycle5/render.mjs (serve :8098,
  renders/): all 4 shots LOOKED at. Foot (NEW hunt frame): Rico
  centre-back on a downtown street, objective "The Enforcer: Take
  down Thorne's enforcer 15m · 100 HP", gold beacon + ring on the
  target ped at ~17 m, toast "The Enforcer — Take down Thorne's
  enforcer", minimap gold diamond, parked cars left (black) + right
  (purple), cross-street traffic visible, downtown towers both
  sides. Drive/chase/mission are the same compositions as Cycle 10
  (chase render byte-identical to Cycle 9's 1-chase.jpg, sha
  15c16f2c… — live timing variation, composition identical).
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest-c11.mjs
  (new, serve :8098, fresh chrome-profile-play11): (H1) ?shot=foot
  opens M8 live — mi=7 ms=0 active=true hunt=[7,84,100,"flee",0]
  mode=play, objDist "15m · 100 HP", opensRight=true. (H2) live
  takedown, FIRST RUN (before the clean-hit fix): chase closed
  24.5 m → 3.2 m, one punch landed (100 → 70 HP, wanted 0 → 1),
  then the player was WASTED at game 13.0 s — "A foot cop tackled
  you" — the first punch had summoned a foot cop + 2 cruisers that
  killed him mid-hunt. This failure is what forced the clean-hit
  fix (missions.js onStart clears M7 heat; combat.js tryPunch /
  tryShoot + pedestrians.js hurtPed raise no wanted for the
  enforcer). (H2) live takedown, RE-RUN (after the fix, new vector
  driver + punch only when fwd > 0.3): chase 16.1 m → 2.0 m, punch
  1 at game 8.8 s (100 → 70 HP, wanted 0); punch 2 at 14.7 s
  (70 → 40 HP, wanted 0); punch 3 at 15.2 s (40 → 10 HP, wanted 0);
  punch 4 at 18.4 s (down) → hunt gone, storyDone=true,
  mode=complete, obj "Story complete — free roam Solmar!" (17.6 s
  game, ~92 s wall; 6 punch attempts: 4 landed, 1
  cooldown-blocked, 1 whiff). H2 RESULT: opensRight=true punches~6
  completed=true failed=false. The first H2 run also taught the
  driver lesson: lateral-only steering overshoots (the player ran
  past the target and kept holding W north while he fled south),
  and punches at 3.2–3.5 m are outside the 2.4 m range.
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest6.mjs
  (re-run, serve :8095, fresh chrome-profile-play6): (A1) tail
  tutorial — warned=true, recovered(hold resumed, still
  active)=true. (A2) hold W through — sawWarningBeforeFail=true,
  fail live "Mission failed — Lost the courier!". (B1) roadblock —
  car drove to px=-20, speed 30 → 0.7, never crossed x=-19,
  roadblock 2 / police 4 / mode play. (B2) Continue/save —
  Continue visible immediately after Save & quit, click →
  mode=play, pos restored (0,120); reads=[start@+0.5s,
  play@+1s]. (B3, REWRITTEN — chases the nearest NON-hunt ped,
  since the foot shot now opens M8 and punching the enforcer is a
  clean hit by design) — punch landed, wanted rose=true.
  (C) camera pitch — touch-drag up drove camPitch 0.25 → 0.49
  (clamp), damped toward 0.25 (0.43 at log end); pointer lock did
  NOT engage headless (as in Cycles 6-10). PLAYTEST6: all six
  sections PASS.
- Focused repros ~/workspace/makefun/dev-gta6-cycle5/repro-c8.mjs
  (re-run, serve :8099): (B1-long) held W in ?shot=chase 70 s wall
  — car stopped at px=-20, speed 30 → 0.7, roadblock stayed 2 /
  police 4 / mode play, never crossed x=-19: PASS. (B3-long,
  REWRITTEN the same way as B3) — punch landed on a non-hunt ped,
  wanted rose=true: PASS. REPRO: "ALL PASS".
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest-c10.mjs
  (D1 re-run, serve :8097, fresh chrome-profile-play10): M7 opens
  (mi=6 ms=0 wanted=3 layLow≈25); one Space shot raised wanted
  3 → 4 and reset the clock live to 25 s with the "New trouble"
  toast (objDist "25s · 4★"); the countdown then completed live
  into step 1 ("Clean Getaway: Reach the safehouse", 278 m, wanted
  3, mode play). D1 RESULT: opensRight=false shotFired=true
  resetSeen=true completed=true — the opensRight=false is ONE stale
  clause in the D1 script (it looked for "★★★" in objDist, which
  is the short form "25s · 3★" since the Cycle 10 HUD cleanup);
  fixed to '3★' in playtest-c10.mjs, and the opening state was
  verified directly by check-c10-hud.mjs: mi=6 ms=0 wanted=3
  layLow=[24.9,3] obj="Clean Getaway: Lay low — stay clean until
  the heat dies down" objDist="25s · 3★" stars="★★★☆☆" problems=0.
  The M7 → M8 heat-clear itself is harness-verified (§30
  clean-start); the full chain was not driven live end-to-end (D1
  stops at the safehouse step, as in Cycle 10).
- main.ts re-verified with the final screenshots: two runs
  byte-identical (diff -r clean); dossier 893,880 B (< 1.5 MiB),
  text 139,391 chars (< 163,840 cap); game/ 16 files, 809,297 B;
  index.html 7,028 B; vendor/makefun-game.ts unchanged (sha256
  dc671875…, matches the kit byte-for-byte); no http/https refs in
  game/src + index.html. Screenshots in /output: 4 files
  (1-chase 133,863 B, 2-foot 145,213 B NEW, 3-drive 141,138 B,
  4-mission 142,202 B), all 1280×800 JPEG ≤ 256 KiB.
- NOT done by this builder (parent's job): push to GitHub, submit
  round 3 (needs Arie's explicit approval).

## Verification log (Cycle 12 — street props near-field + beachfront drive, 2026-11-20)

- Fresh 6-dimension critique of the Cycle 11 state (coordinator,
  looking at the actual frames): correctness 9, compliance 10, code
  quality 9, performance 8, robustness 8, judge criteria 9 (weak
  dimension). Two fixes chosen: street props / road markings in the
  near-field band (real city, buildCity) + the drive shot restaged to
  the beachfront (z=256 eastbound, M1 context intact). Camera 9 m
  unchanged; player.js and M6/M7/M8 untouched. Recording #9
  (01a1f941, PID 6679) was alive at every edit (elapsed 56m at log
  time). Kit level 27, current. Cycle 11 is the safe fallback
  snapshot for round 3.
- Node harness ~/workspace/makefun/dev-gta6-cycle5/harness.mjs
  (new §31, document stub so the REAL buildCity runs in Node):
  **190/190 PASS** (159 Cycle 11 + 31 new). New checks: 5 zebras at
  the planned intersections, flat (y 0.07); 90 manholes (5 per road),
  all on a road, one beside the mission car (3,108), one ahead of
  the chase car (-48,131), one beside the beach car (-128,259), one
  down the beach road (-48,259); 8 skid strips (4 pairs) just ahead
  of the player; 4 lane arrows in the driving lanes; 10 sidewalk
  prop meshes, none within 4 m of a staged car/ped, all on a
  sidewalk (7-11 m from a road centre); no marking inside a building
  footprint; buildings still built; total meshes < 2100 (1825).
  Beach drive geometry with the REAL player.js updateCamera + REAL
  traffic warm-up: settled camYaw = heading + PI - 0.2 (mirrored,
  no drift), camera 9 m behind the car ~1.8 m north of the road
  centre, not inside a building; warm-up puts the 3 distant cars
  40-90 m ahead, the oncoming at ~-88, the close car at ~-106 (no
  red-light stop at x=-128), all still on road z=256; every staged
  object + beach landmark inside the ~44 deg half-FOV; boat ~22 deg
  off-axis (was ~44 deg with the +0.2 orbit); boardwalk ~9 deg;
  north parked car ~31 deg; M1 garage ~325 m from the beach spawn;
  z=256 is a real road.
- Headless Chromium renders
  ~/workspace/makefun/dev-gta6-cycle5/render.mjs (serve :8093,
  renders/ — two attempts, both LOOKED at). Attempt 1 found two
  real problems, both fixed on the evidence of the frames: (a) the
  first skid marks were near-black on near-black asphalt and
  invisible in the drive/mission frames — re-done lighter than the
  road (0x4a4e54, opacity 0.7, wider) and the beach pair moved
  (-122 → -118) so it sits fully ahead of the car nose; (b) the
  first manhole pattern put one 4 m from the chase camera (-68,131)
  and it read as a giant faceted black blob at the bottom edge —
  the along value moved to -48 (~17 m out), radius 0.85 → 0.7 with
  16 segments, and a fifth along value (-128) added. Attempt 2
  frames: drive shows the beach on the right (sand, palms, ocean
  strip at the horizon, the white + blue boat small but visible at
  ~22 deg — confirmed in a zoomed crop), the zebra big ahead of the
  red car, a manhole at the bottom-right, parked cars + peds + bus
  stop + traffic, "First Gear: Go to Lena's Garage 323m", minimap
  showing the coast; chase shows the zebra filling the bottom band,
  skid strips ahead of the blue car, bench on the sidewalk,
  roadblock + cruisers + "Roadblock ahead!"; mission shows the lane
  arrow + manhole + skid bands in the bottom band, courier + ring +
  slim beacon, "25m · 20s · IN ZONE"; foot shows the hunt live
  (beacon + ring on the target, "15m · 100 HP"), the big arrow at
  the bottom-left, skid bands, trash can. No seeded gold pickup at
  any frame edge. Only console problem: favicon.ico 404 (benign).
  Debug readouts match the staging (drive camYaw 4.51, cam
  (-136,4,254), traf [-72,259]/[-46,259]/[-30,259]/[-89,253]/
  [-105,259]; chase roadblock 2 / police 4; mission tail [-3,81]
  hold 0.1; foot hunt [7,84,100,"flee"]).
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest6.mjs
  (re-run, serve :8095, fresh chrome-profile-play6):
  playtest6-c12.log. (A1) tail tutorial — warned=true, recovered
  (hold resumed, still active)=true. (A2) hold W through —
  sawWarningBeforeFail=true, fail live "Mission failed — Lost the
  courier!". (B1) roadblock — 35 s window ended at px=-39 (still
  approaching, never crossed x=-19), roadblock 2 / mode play. (B2)
  Continue/save — Continue visible immediately after Save & quit,
  click → mode=play, pos restored (0,120); reads=[play@+0.5s] (no
  flake this run). (B3) punch landed on a non-hunt ped, wanted
  rose=true. (C) camera pitch on the NEW beach drive shot —
  touch-drag up drove camPitch 0.25 → 0.49 (clamp), damped toward
  0.25 (0.42 at log end); pointer lock did NOT engage headless (as
  in Cycles 6-11); camYaw 4.51 (mirrored drive). PLAYTEST6: all six
  sections PASS.
- Focused repros ~/workspace/makefun/dev-gta6-cycle5/repro-c8.mjs
  (re-run, serve :8099; log repro-c12.log): (B1-long) held W in
  ?shot=chase 70 s wall — car stopped at px=-20, speed 30 → 0.8,
  roadblock stayed 2 / police 4 / mode play, never crossed x=-19:
  PASS. (B3-long) walked in ?shot=foot until the nearest ped was
  in range, then punch 1 landed live, wanted 0 → 1: PASS. REPRO:
  "ALL PASS".
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest-c10.mjs
  (D1 re-run, serve :8097, fresh chrome-profile-play10; log
  playtest-c10-c12.log): M7 opens (mi=6 ms=0 wanted=3 layLow≈25);
  one Space shot raised wanted 3 → 4 and reset the clock live to
  25 s with the "New trouble" toast (objDist "25s · 4★"); the
  countdown then completed live into step 1 ("Clean Getaway: Reach
  the safehouse", 272 m, wanted 3, mode play). D1 RESULT:
  opensRight=true shotFired=true resetSeen=true completed=true —
  opensRight is TRUE this time (the Cycle 11 stale clause was
  fixed to '3★' and the check passes as written now).
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest-c11.mjs
  (H1/H2 re-run, serve :8098, fresh chrome-profile-play11; log
  playtest-c11-c12.log): (H1) ?shot=foot opens M8 live — mi=7
  ms=0 active=true hunt fleeing at 100 HP, objDist "16m · 100 HP",
  opensRight=true. (H2) live takedown — chase from 16.1 m, 4
  punches landed (100 → 70 → 40 → 10 → down, 6 punch attempts),
  wanted 0 throughout, storyDone=true, mode=complete, "Story
  complete — free roam Solmar!" (24.8 s game; this run's driver
  took longer to close after the first punch — the target kept
  turning and the player overshot twice — but the hunt never
  failed and the takedown completed). H2 RESULT:
  opensRight=true punches~6 completed=true failed=false.
- main.ts re-verified with the final screenshots: two runs
  byte-identical (diff -r clean); dossier 904,287 B (< 1.5 MiB),
  text 147,946 chars (< 163,840 cap); game/ 16 files, 817,870 B;
  index.html 7,028 B; vendor/makefun-game.ts unchanged (sha256
  dc671875…, matches the kit byte-for-byte — verified in Cycle 11,
  untouched since); no http/https refs in game/src + index.html.
  Screenshots in /output: 4 files (1-chase 147,312 B, 2-foot
  148,968 B, 3-drive 124,222 B NEW beachfront, 4-mission 143,144 B),
  all 1280×800 JPEG ≤ 256 KiB.
- NOT done by this builder (parent's job): push to GitHub, submit
  round 3 (needs Arie's explicit approval).

## Verification log (Cycle 13 — toned-down zebra + bigger boat, 2026-11-20)

- Fresh 6-dimension critique of the Cycle 12 state (looking at the
  actual frames): correctness 9, compliance 10, code quality 9,
  performance 8, robustness 8, judge criteria 9 (weak dimension).
  Two polish fixes chosen, both in city.js, no new feature: the
  chase zebra dominating the cover + the boat a ~50 px speck on the
  drive horizon. player.js and M6/M7/M8 untouched; shots.js
  untouched (no staging moved). Recording #10 (01a1f993, PID 2406)
  was alive at every edit (state file mode 600, elapsed ~27m at log
  time). Kit level 27, current. Cycle 12 is the safe fallback
  snapshot for round 3.
- Recording: starting #10 first hit the 8-open-recordings cap
  (HTTP 409) — #9 (01a1f941, dead, PID 6679 gone) was still open,
  so it was sealed first to free a slot. The seal was HELD until
  the CLI's muse.db SELECT supplied 4 usage rows for 3 recorded
  Muse app sessions (appended unchanged to
  ~/.makefun/muse-usage-gta6-01.jsonl, 8 → 12 rows); then
  `record --finish 01a1f941 --muse-usage ...` sealed it at
  2026-11-20T15:29:21Z (265 chunks, 1189 leaves, head fce8d917…).
  #10 started clean immediately after.
- Before/after renders
  ~/workspace/makefun/dev-gta6-cycle5/render.mjs (serve :8093,
  renders/ — /tmp/c13-before + /tmp/c13-after, both LOOKED at).
  BEFORE: chase — 5 solid-cream bars fill the whole bottom third,
  the loudest thing in the frame; drive — the boat is a ~40 px
  white/blue speck at the horizon (~970,200), the beach reads from
  sand/palms/ocean. AFTER: chase — bars narrower + greyish-cream
  (asphalt shows through), the bottom band still reads as a
  crosswalk but the blue player car + roadblock + cruisers lead the
  frame; drive — the boat is a readable white hull + blue cabin
  (~90 px) at the horizon right of the lamppost (confirmed in a
  3x zoomed crop: hull block ~40 px → ~85 px), the beach zebra
  ahead of the red car is softer too, everything else identical
  (parked cars, peds, traffic, manhole, "First Gear: Go to Lena's
  Garage 323m", minimap showing the coast). Foot — hunt live
  (beacon + ring on the target, "15m · 100 HP"); mission —
  courier + ring + slim beacon, "25m · 20s · IN ZONE". Only
  console problem: favicon.ico 404 (benign). Debug readouts match
  Cycle 12 exactly (drive camYaw 4.51, cam (-136,4,254), traf
  [-72,259]/[-46,259]/[-30,259]/[-89,253]/[-105,259]; chase
  roadblock 2 / police 4 / wanted 3; mission tail [-3,81] hold
  0.1; foot hunt [7,84,100,"flee"]).
- Node harness ~/workspace/makefun/dev-gta6-cycle5/harness.mjs
  (new §32; the canvas stub now records fillRect calls per
  canvas, so the zebra texture is asserted from the real draws):
  **203/203 PASS** (190 Cycle 12 + 13 new). New checks: zebra
  texture draws 5 bars of 9 px (was 5 x 14 px), evenly spaced
  (12 + i*24), white coverage ~35% (was ~55%); shared material,
  transparent, opacity 0.7 (was 1.0); still 5 crossings at the
  same intersections, flat (y 0.07). Boat: PLACES.boat untouched
  (0, 332); M5 final step still targets PLACES.boat (radius 8);
  visual group still centred at (0, 346), scale 2 (was 1), hull +
  cabin still the only children; apparent width ~6.8 deg from the
  settled beach-drive camera (was ~3.4 deg); centre still inside
  the half-FOV (~22 deg off-axis); not inside a building
  footprint. All 190 older checks still PASS (the stub change
  touched no game code and no earlier assertion).
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest6.mjs
  (re-run, serve :8095, fresh chrome-profile-play6; log
  playtest6-c13.log): (A1) tail tutorial — warned=true (toast
  "Too close — he'll spot you! Back off!" at d=5.0), recovered
  (hold resumed 1.6 → 2.2, still active)=true. (A2) hold W through
  — sawWarningBeforeFail=true, fail live "Mission failed — Lost
  the courier!". (B1) roadblock — car stopped at px=-20, speed
  30 → 0.8, roadblock 2 / police 4 / mode play, never crossed
  x=-19. (B2) Continue/save — Continue visible immediately after
  Save & quit, click → mode=play, pos restored (0,120);
  reads=[start@+0.5s, play@+1s] (the known single-read flake
  once, then play — same as Cycle 11). (B3) punch landed on a
  non-hunt ped at d=1.0, wanted rose=true ("You clocked a
  pedestrian!"). (C) camera pitch on the beach drive shot —
  touch-drag up drove camPitch 0.25 → 0.49 (clamp), damped toward
  0.25 (0.42 at log end); pointer lock did NOT engage headless (as
  in Cycles 6-12); camYaw 4.51 (mirrored drive). PLAYTEST6: all
  six sections PASS.
- Focused repros ~/workspace/makefun/dev-gta6-cycle5/repro-c8.mjs
  (re-run, serve :8099; log repro-c13.log): (B1-long) held W in
  ?shot=chase 70 s wall — car stopped at px=-20, speed 30 → 0.9,
  roadblock stayed 2 / police 4 / mode play, never crossed x=-19:
  PASS. (B3-long) walked in ?shot=foot until the nearest ped was
  in range, then punch 1 landed live, wanted 0 → 1: PASS. REPRO:
  "ALL PASS".
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest-c10.mjs
  (D1 re-run, serve :8097, fresh chrome-profile-play10; log
  playtest-c10-c13.log): M7 opens (mi=6 ms=0 wanted=3 layLow≈25);
  one Space shot raised wanted 3 → 4 and reset the clock live to
  25 s with the "New trouble" toast (objDist "13s · 4★"); the
  countdown then completed live into step 1 ("Clean Getaway: Reach
  the safehouse", 272 m, wanted 3, mode play). D1 RESULT:
  opensRight=true shotFired=true resetSeen=true completed=true.
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest-c11.mjs
  (H1/H2 re-run, serve :8098, fresh chrome-profile-play11; log
  playtest-c11-c13.log): (H1) ?shot=foot opens M8 live — mi=7
  ms=0 active=true hunt fleeing at 100 HP, objDist "14m · 100 HP",
  opensRight=true. (H2) live takedown — chase from 16.1 m, 4
  punches landed (100 → 70 → 40 → 10 → down, ~9 punch attempts),
  wanted 0 throughout, storyDone=true, mode=complete, "Story
  complete — free roam Solmar!" (25.4 s game). H2 RESULT:
  opensRight=true punches~9 completed=true failed=false.
- main.ts re-verified with the final screenshots: two runs
  byte-identical (diff -r clean); dossier 902,428 B (< 1.5 MiB),
  text 148,889 chars (< 163,840 cap); game/ 16 files, 818,819 B;
  index.html 7,028 B; vendor/makefun-game.ts unchanged (sha256
  dc671875…, matches the kit byte-for-byte); no http/https refs in
  game/src + index.html. Screenshots in /output: 4 files (1-chase
  145,438 B, 2-foot 149,133 B, 3-drive 123,359 B, 4-mission
  143,598 B), all 1280×800 JPEG ≤ 256 KiB.
- NOT done by this builder (parent's job): push to GitHub, submit
  round 3 (needs Arie's explicit approval).

## Verification log (Cycle 14 — port chase cover + readable waypoint markers, 2026-11-21)
- Files changed: shots.js 17,600 → 18,832 B (chase cover restaged to
  the port: player (128,-192) heading east, cruisers (198,-198) /
  (198,-186), traffic along 200 / 232, close car 124 noTurn, peds
  (162,-201) / (150,-183), parked (136,-201) / (134,-183)),
  city.js 24,567 → 25,039 B (port markings: zebra (124,-192), skid
  (134,-189), arrow (152,-189)), missions.js 24,707 → 25,698 B
  (beacon column 10 m → 5 m, radius 0.7 → 0.6, opacity 0.3 → 0.35;
  marker cone 1.2 / 2.4 at y=8 → 0.9 / 1.8 at y=4.2, bob ±0.4;
  fare marker y 3.4 → 2.4, size 0.5 / 1.2 → 0.4 / 1.0, comment
  gold → green). vendor/makefun-game.ts untouched (sha256 dc671875…).
  LICENSE / README / .makefun/owner.json untouched. M1–M8, player.js,
  police, combat untouched.
- Fresh 6-dim critique of the Cycle 13 frames (looking at the actual
  frames): correctness 9, compliance 10, code quality 9, performance
  8, robustness 8, judge criteria 9 (weak dim) — the cover's
  objective named the port but showed downtown a third time (the port
  appeared in no frame); the 10 m beacon column still reached y~25
  in the mission render and the cone read ~150 px tall in the foot
  frame; the fare marker floated detached (y=3.4) as a green triangle
  in 3 of 4 frames. The park is still in no frame — the one known
  remaining district gap, for a future cycle.
- Recording: #11 (01a1fb66, PID 7031) alive at every game edit
  (00:06–00:07 UTC) and every render + playtest through the B1-long
  re-run; it DIED ~01:26 UTC (SIGTERM, likely a VM replacement)
  during the combined playtest-c10 + playtest-c11 run, which died
  with it. State file intact (seq 246, acked 1068, last update
  01:25 UTC) — the game edits were witnessed, no rewrite needed.
  Its seal was attempted twice and HELD (the builder session
  3c024963-… carries no usage row yet); per the coordinator the seal
  is being handled by another process — no competing seal started,
  usage file untouched. Recording #12 (01a1fbb7, PID 2284) started
  2026-11-21T01:28:00Z, state mode 600, alive for the rest of the
  cycle (c11 re-run, screenshot finalize, determinism, docs). Submit
  round 3 with BOTH recordings. Kit level 30, current.
- Node harness ~/workspace/makefun/dev-gta6-cycle5/harness.mjs:
  215/215 PASS (203 Cycle 13 + 12 new §33; log harness-c14c.log).
  New: 10 containers in the port blocks (height 2.6, not towers); M4
  step 0 still targets PLACES.portPickup; pickup ~101 m from the
  port spawn (was 452 m downtown); roadblock spawns at (173,
  -192 ± 3.5) from the REAL spawnRoadblock; port traffic warm-up
  bands (~216 / ~248, no turn) + close car ~140; camera not inside
  a building; yard + pickup inside the ~44 deg half-FOV; fare marker
  small + green + y≈2.4. Updated, not new: §19/§20 beacon values
  (5 m / 0.6 / 0.35, marker cone 0.9 / 1.8 at y=4.2), §21 chase
  geometry → port spots, §31/§32 zebra 5 → 6, skid 8 → 10 strips,
  arrows 4 → 5. One harness lesson, in §33: the stub city has no
  traffic lights, so nsGreen defaults to phase 0 and an x-road car
  at a light always sees red at t<5 s — the close car stopped at
  along 126.5 in the harness but drives through in the real game
  (the port light (128,-192) has phase -1, green for eastbound
  during warm-up); the §33 warm-up now populates the real 81-light
  list before warming up.
- Headless Chromium renders (CDP driver, serve :8093, 1280×800,
  JPEG q88, 1.2 s wait after __solmarReady; log render-c14.log):
  all 4 shots re-rendered and LOOKED at (before/after + zoomed
  beacon crops).
  - 1-chase.jpg 127,961 B: the port reads — orange/green/blue
    containers + tan yard on the left, 2 cruisers closing at ~18 m
    (debug pc (149,-194)/(149,-190)) + roadblock pair at ~42 m
    (rb (173,-195)/(173,-188)) + close car at ~11 m (traf
    (142,-189)) + 2 parked cars + 2 peds + zebra in the bottom band
    + 3 stars + "The Drop: Pick up the crate at the port 96m" +
    toast "Roadblock ahead!". Debug: px=131 pz=-192, cam
    (121,4,-190), camYaw 4.91, wanted 3, police 4, meshes 1833
    (+4 vs Cycle 13: 1 zebra + 2 skid strips + 1 arrow). The road
    ahead ends at the city edge in grass + fog (emptier horizon
    than downtown's towers); the south parked car is half-cut at
    the right edge (~37 deg off-axis, same edge-crop as the old
    cover's parked car). No console problems.
  - 2-foot.jpg 148,686 B: beacon cone is now a small pointer
    (~55 px) on a short stub with clear sky above it (was a ~150 px
    triangle + a column to the top edge); target ped inside the
    ring, "15m · 100 HP"; the green fare triangle sits small just
    above its ped. Hunt [7,84,100,"flee",0]. Only console problem:
    favicon.ico 404 (benign).
  - 3-drive.jpg 122,388 B: same composition as Cycle 13 (beach,
    sand + palms + ocean strip, boat at the horizon, "First Gear:
    Go to Lena's Garage 322m", camYaw 4.51). No console problems.
  - 4-mission.jpg 143,706 B: beacon is a short stub + small cone
    over the courier (was a slab to y~25); courier + ring clear at
    ~25 m, "25m · 20s · IN ZONE". Tail [-3,81,0.2,0,0]. No console
    problems.
  - First render attempt failed (Chrome slow to come up under VM
    load — waitHttp 10 s timed out, orphaned Chrome + serve killed
    by port, re-ran clean). Same for the first c11 attempt.
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest6.mjs
  (re-run, serve :8095, fresh chrome-profile-play6; log
  playtest6-c14.log): (A1) tail tutorial — warned=true, recovered
  (hold resumed, still active)=true. (A2) hold W through — sawWarningBeforeFail=true, fail live "Mission failed — Lost
  the courier!". (B1) roadblock smoke — 35 s window ended at
  px=148 (still approaching, never crossed x=173), roadblock 2 /
  police 4 / mode play. (B2) Continue/save — Continue visible
  immediately after Save & quit, click → mode=play, pos restored
  (0,120); reads=[start@+0.5s, play@+1s] (the known single-read
  flake once, then play). (B3) punch landed on a non-hunt ped at
  d=1.0, wanted rose=true ("You clocked a pedestrian!"). (C) camera
  pitch on the beach drive shot — touch-drag up drove camPitch
  0.25 → 0.49 (clamp), damped toward 0.25 (0.43 at log end);
  pointer lock did NOT engage headless (as in Cycles 6-13); camYaw
  4.51 (mirrored drive). PLAYTEST6: all six sections PASS.
- Focused repros ~/workspace/makefun/dev-gta6-cycle5/repro-c8.mjs
  (re-run, serve :8099; logs repro-c14.log + repro-c14-b1b.log):
  (B1-long) held W in ?shot=chase — the first 70 s run ended
  MID-DECAY at px=172, speed 30 → 7.8 (the car reached the port
  roadblock at +65 s wall; headless game time advances only ~0.08 s
  per wall second under load, so the speed had no time to decay —
  machine load, not a game bug). The window was extended to 110 s
  (22 x 5 s) and the re-run stopped at px=172, speed 30 → 0.7
  (30 → 4.3 → 1.8 → 1.0 → 0.7), roadblock stayed 2 / police 4 /
  mode play, never crossed x=173: PASS. (B3-long) walked in
  ?shot=foot until the nearest ped was in range, then punch 1
  landed live, wanted 0 → 1: PASS. REPRO: "ALL PASS".
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest-c10.mjs
  (D1 re-run, serve :8097, fresh chrome-profile-play10; log
  playtest-c10-c14.log): M7 opens (mi=6 ms=0 wanted=3 layLow≈25);
  one Space shot raised wanted 3 → 4 and reset the clock live to
  25 s with the "New trouble" toast; the countdown then completed
  live into step 1 ("Clean Getaway: Reach the safehouse", 275 m,
  wanted 3, mode play). D1 RESULT: opensRight=true shotFired=true
  resetSeen=true completed=true.
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest-c11.mjs
  (H1/H2 re-run, serve :8098, fresh chrome-profile-play11; log
  playtest-c11-c14.log): (H1) ?shot=foot opens M8 live — mi=7
  ms=0 active=true hunt fleeing at 100 HP, opensRight=true. (H2)
  live takedown — 4 punches landed (~9 punch attempts), wanted 0
  throughout, storyDone=true, mode=complete, "Story complete —
  free roam Solmar!". H2 RESULT: opensRight=true punches~9
  completed=true failed=false. (The first c11 attempt never ran:
  the combined c10+c11 command was SIGTERMed by the VM replacement
  that killed recording #11; the re-run was clean.)
- main.ts re-verified with the final screenshots: two runs
  byte-identical (diff -r clean); dossier 880,115 B (< 1.5 MiB),
  text 151,569 chars (< 163,840 cap); game/ 16 files, 821,514 B;
  index.html 7,028 B; vendor/makefun-game.ts unchanged (sha256
  dc671875…, matches the kit byte-for-byte); no http/https refs in
  game/src + index.html. Screenshots in /output: 4 files (1-chase
  127,961 B, 2-foot 148,686 B, 3-drive 122,388 B, 4-mission
  143,706 B), all 1280×800 JPEG ≤ 256 KiB.
- NOT done by this builder (parent's job): push to GitHub, submit
  round 3 (needs Arie's explicit approval).

## Verification log (Cycle 15 — park in the foot frame, 2026-11-21)
- RECORDING (langkah 1): recording #11 (01a1fb66) witnessed the Cycle
  14 game edits but its seal is BLOCKED — no usage row for the builder
  session (it sent no message while #11 lived; #11 died before the
  builder finished), so the seal will always be HELD; do NOT retry it.
  city.js, missions.js and shots.js were therefore RE-WRITTEN
  byte-identical under recording #12 (01a1fbb7-a95d-7336-96bf-
  a5be3d8526e7, PID 2284, alive at every edit) FIRST, via full writes:
  hashes verified unchanged afterwards (city e104c166… 25,039 B;
  missions f6bc39ee… 25,698 B; shots f3c2a4fd… 18,832 B). The step-2
  restage then changed shots.js (19,830 B, sha 05cc9d0f…) under #12;
  city.js and missions.js were not changed in step 2.
- Files changed: shots.js 18,832 → 19,830 B (foot restaged to the
  park's edge: player (-128,224) heading north on road x=-128, park
  block x -182..-138 / z 138..182 on the left; peds/parked/cross
  traffic translated from the Cycle 11 staging; hunt geometry
  unchanged). city.js, missions.js, player.js, police, combat, M6/M7/
  M8 untouched. vendor/makefun-game.ts unchanged (sha256 dc671875…).
  LICENSE / README / .makefun/owner.json untouched.
- All 14 modules node --check clean.
- Node harness (dev-gta6-cycle5/harness.mjs, log harness-c15.log):
  224/224 PASS (215 Cycle 14 + 9 new §34: no building overlaps the
  park block, lawn samples are open ground, park east edge ~6–11 deg
  / centre ~24 deg off-axis from the settled foot camera, camera not
  in a building). The §21(b)/§26–30 foot checks were translated to
  the new street; the §30 punch/shot tests needed their hardcoded
  player positions moved (0,92) → (-128,220) — with the old spots
  the punches whiffed 6 m short of the target (health stayed 100).
- Headless Chromium renders (CDP driver, serve :8093, 1280×800 JPEG
  q88, 1.2 s wait; log render-c15.log), all 4 shots LOOKED at:
  - 2-foot.jpg 146,122 B (NEW): the park IS in the frame — a bright-
    green lawn band with 5 palms on the left beyond the z=192 cross
    street (proved by a zoomed crop of the left-mid region); hunt
    live ("15m · 100 HP", beacon + ring on the target at (-121,212),
    14 m in the debug readout), both cross cars visible (blue left
    at (-148,195), red centre at (-113,189)), both parked cars
    (-119,216)/(-137,214), downtown towers ahead. Debug: player
    (-128,224), cam (-128,3,232), camYaw 6.28 settled, peds
    (-133,206)/(-130,217)/(-121,212)/(-125,214)/(-121,198),
    fareMarker (-130,217), meshes 1828. Only console problem:
    favicon.ico 404 (benign).
  - 1-chase.jpg 128,455 B: same composition as Cycle 14 (port
    containers + yard, roadblock 2 at (173,-195)/(173,-188) +
    cruisers closing, "The Drop: Pick up the crate at the port 96m",
    3 stars). Debug: police 4, roadblock 2, px=132.
  - 3-drive.jpg 123,345 B: same composition as Cycle 14 (beach,
    boat, "First Gear: Go to Lena's Garage 323m"). Debug: 324 m.
  - 4-mission.jpg 143,706 B: BYTE-IDENTICAL to Cycle 14 (courier +
    ring + slim beacon, "25m · 20s · IN ZONE").
  The z=192-east alternative for the foot shot was NOT tried:
  attempt 1 already shows the park clearly, and it would have lost
  the downtown towers ahead for a longer park frontage.
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest6.mjs
  (re-run, serve :8095, fresh chrome-profile-play6; log
  playtest6-c15.log): (A1) tail tutorial — warned=true, recovered
  (hold resumed, still active)=true. (A2) hold W through —
  sawWarningBeforeFail=true, fail live "Mission failed — Lost the
  courier!". (B1) roadblock smoke — 35 s window ended at px=164
  (still approaching, never crossed x=173), roadblock 2 / police 4 /
  mode play. (B2) Continue/save — Continue visible immediately after
  Save & quit, click → mode=play, pos restored (0,120);
  reads=[play@+0.5s] (no flake this run). (B3) punch landed on a
  non-hunt ped, wanted rose=true. (C) camera pitch on the beach
  drive shot — touch-drag up drove camPitch 0.25 → 0.49 (clamp),
  damped toward 0.25 (final 0.42); pointer lock did NOT engage
  headless (as in Cycles 6-14); camYaw 4.51 (mirrored drive).
  PLAYTEST6: all six sections PASS.
- Focused repros ~/workspace/makefun/dev-gta6-cycle5/repro-c8.mjs
  (re-run, serve :8099; log repro-c15.log): (B1-long) held W in
  ?shot=chase — car accelerated to 30, stopped at px=172, speed
  30 → 0.7 (30 → 3.2 at +35 s, 0.7 at +40 s), roadblock stayed 2 /
  police 4 / mode play, never crossed x=173: PASS. (B3-long) at the
  NEW foot location (px=-128, pz=224) — chased the nearest non-hunt
  ped (d 8.2 → 4.5), punch 1 landed live, wanted 0 → 1: PASS.
  REPRO: "ALL PASS".
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest-c10.mjs
  (D1 re-run, serve :8097, fresh chrome-profile-play10; log
  playtest-c10-c15.log): M7 opens (mi=6 ms=0 wanted=3 layLow≈25);
  one Space shot raised wanted 3 → 4 and reset the clock live to
  25 s with the "New trouble" toast; the countdown then completed
  live into step 1 ("Clean Getaway: Reach the safehouse", 270 m,
  wanted 3, mode play). D1 RESULT: opensRight=true shotFired=true
  resetSeen=true completed=true.
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest-c11.mjs
  (H1/H2 re-run, serve :8098, fresh chrome-profile-play11; log
  playtest-c11-c15.log): (H1) ?shot=foot opens M8 live — mi=7
  ms=0 active=true hunt fleeing at 100 HP, opensRight=true ("14m ·
  100 HP"). (H2) live takedown — 4 punches landed (~10 punch
  attempts), wanted 0 throughout, storyDone=true, mode=complete,
  "Story complete — free roam Solmar!". H2 took ~167 s wall (Cycle
  14: ~92 s) because the target fled north-east across the park
  block instead of straight north — the mechanic is unchanged, only
  the chase line moved. H2 RESULT: opensRight=true punches~10
  completed=true failed=false.
- main.ts re-verified with the final screenshots: two runs
  byte-identical (diff -r clean); dossier 879,646 B (< 1.5 MiB),
  text 152,557 chars (< 163,840 cap); game/ 16 files, 822,512 B;
  index.html 7,028 B; vendor/makefun-game.ts unchanged (sha256
  dc671875…, matches the kit byte-for-byte); no http/https refs in
  game/src + index.html (only the relative meta refresh
  url=./game/). Screenshots in /output: 4 files (1-chase
  128,455 B, 2-foot 146,122 B, 3-drive 123,345 B, 4-mission
  143,706 B), all 1280×800 JPEG ≤ 256 KiB.
- NOT done by this builder (parent's job): push to GitHub, submit
  round 3 (needs Arie's explicit approval).

## Verification log (Cycle 16 — port horizon cranes + stacks, 2026-11-21)
- RECORDING: #13 (01a1fc23-67db-73a2-a54c-f3b02f74034e, PID 1868) alive
  at every edit, render and playtest (state file mode 600). Kit level
  30 local; kit status this cycle reports the site at level 32 — NOT
  re-downloaded (task instruction); parent to decide. can_submit YES
  (verified live: `makefun status` — "can submit now: yes", entries
  left today 3 of 3, left under hard limit 18 of 20).
- Files changed: city.js 25,039 → 29,276 B (port horizon: apron +
  2 gantry cranes + 5 stacked containers, all fixed geometry, no rng;
  legs + stacks are collision AABBs). shots.js, missions.js,
  player.js, police, combat, M6/M7/M8 untouched. vendor/makefun-game.ts
  unchanged (sha256 dc671875…). LICENSE / README / .makefun/owner.json
  untouched.
- All 14 modules node --check clean.
- Node harness (dev-gta6-cycle5/harness.mjs, log harness-c16b.log):
  236/236 PASS (224 Cycle 15 + 12 new §35: 19 crane meshes (11 main
  + 8 second) + 1 apron (84x64 at (332,-192)) + 5 stacked containers
  at (300,-214)/(300,-170)/(344,-216); 8 leg AABBs (4 x 30 m main,
  4 x 26 m second), legs clear of the road; no rng shift — port yard
  still exactly 10 containers; meshes < 2100; main crane ~200 m from
  the settled chase camera, before the 240 m fog start; crane top
  ~8 deg above the horizon line, inside the frame; main crane +
  stacks within 8 deg of the road-end angle, second crane ~1 deg
  off-axis). Two harness drafts failed first on the CHECKS, not the
  game: the crane count is 19 (11 main + 8 second, the draft said
  20) and the road axis sits ~11 deg off the camera axis (the +0.2
  orbit), so the crane must be checked against the road-end angle —
  both fixed in the check, game untouched.
- Headless Chromium renders (CDP driver, serve :8093, 1280×800 JPEG
  q88, 1.2 s wait; logs render-c16.log + render-c16b.log), all 4 shots
  LOOKED at (attempt 1 → attempt 2):
  - 1-chase.jpg 131,260 B (NEW, attempt 2): TWO yellow gantry cranes
    + container stacks + concrete apron fill the horizon band at the
    end of the port road; main crane portal fully in frame with sky
    above it, clear of the objective bar; jib + hanging cable + hook
    visible; second crane left of it. Roadblock 2 at (173,-195)/
    (173,-188) + cruisers closing, close car, parked cars, peds,
    "The Drop: Pick up the crate at the port 97m", 3 stars.
    Attempt 1 (38 m crane) had the top beam touching the objective
    bar — lowered to 30 m and re-rendered. Debug: player (129,-192),
    cam (120,4,-190), camYaw 4.91 settled, police 4, traf [216,-189]/
    [254,-189]/[141,-189] — traffic[1] at along 254 did NOT turn at
    the x=256 intersection, meshes 1858. Only console problem:
    favicon.ico 404 (benign).
  - 2-foot.jpg 146,150 B: same composition as Cycle 15 (park lawn +
    palms left, hunt live "15m · 100 HP", both cross cars, both
    parked cars, towers ahead). Debug: player (-128,224), hunt
    (-121,212,100 flee), meshes 1853.
  - 3-drive.jpg 123,370 B: same composition as Cycle 15 (beach,
    boat, "First Gear: Go to Lena's Garage 323m"). Debug: 324 m.
  - 4-mission.jpg 143,422 B: same composition as Cycle 15 (courier
    + ring + slim beacon, "25m · 20s · IN ZONE"). Debug: tail
    (-3,81,0.1,0,0).
  Foot/drive/mission hashes differ from Cycle 15 by live timing only
  (Cycle 8/9 lesson: composition is the check, hash is not).
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest6.mjs
  (re-run, serve :8095, fresh chrome-profile-play6; log
  playtest6-c16.log): (A1) tail tutorial — warned=true, recovered
  (hold resumed, still active)=true. (A2) hold W through —
  sawWarningBeforeFail=true, fail live "Mission failed — Lost the
  courier!". (B1) roadblock — car stopped at px=172, speed 30 → 0.7,
  roadblock 2 / police 4 / mode play, never crossed x=173. (B2)
  Continue/save — Continue visible immediately after Save & quit,
  click → mode=play, pos restored (0,120); reads=[start@+0.5s,
  play@+1s] (the known single-read flake once, then play). (B3)
  punch landed on a non-hunt ped, wanted rose=true. (C) camera pitch
  on the beach drive shot — touch-drag up drove camPitch 0.25 → 0.49
  (clamp), damped toward 0.25 (final 0.42); pointer lock did NOT
  engage headless (as in Cycles 6-15); camYaw 4.51 (mirrored drive).
  PLAYTEST6: all six sections PASS.
- Focused repros ~/workspace/makefun/dev-gta6-cycle5/repro-c8.mjs
  (re-run, serve :8099; log repro-c16.log): (B1-long) held W in
  ?shot=chase — car accelerated to 30, stopped at px=172, speed
  30 → 0.7, roadblock stayed 2 / police 4 / mode play, never crossed
  x=173: PASS. (B3-long) at the foot location (px=-128, pz=224) —
  punch 1 landed live, wanted 0 → 1: PASS. REPRO: "ALL PASS".
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest-c10.mjs
  (D1 re-run, serve :8097, fresh chrome-profile-play10; log
  playtest-c10-c16.log): M7 opens (mi=6 ms=1 wanted=3 layLow≈25);
  one Space shot raised wanted 3 → 4 and reset the clock live to
  25 s with the "New trouble" toast; the countdown then completed
  live into step 1 ("Clean Getaway: Reach the safehouse", 282 m,
  wanted 3, mode play). D1 RESULT: opensRight=true shotFired=true
  resetSeen=true completed=true.
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest-c11.mjs
  (H1/H2 re-run, serve :8098, fresh chrome-profile-play11; log
  playtest-c11-c16.log): (H1) ?shot=foot opens M8 live — mi=7
  ms=0 active=true hunt fleeing at 100 HP, opensRight=true. (H2)
  live takedown — 4 punches landed (~5 punch attempts), wanted 0
  throughout, storyDone=true, mode=complete, "Story complete —
  free roam Solmar!". H2 RESULT: opensRight=true punches~5
  completed=true failed=false.
- main.ts re-verified with the final screenshots: two runs
  byte-identical (diff -r clean); dossier 887,409 B (< 1.5 MiB),
  text 156,788 chars (< 163,840 cap); game/ 16 files, 826,749 B;
  index.html 7,028 B; vendor/makefun-game.ts unchanged (sha256
  dc671875…, matches the kit byte-for-byte); no http/https refs in
  game/src + index.html (only the relative meta refresh
  url=./game/). Screenshots in /output: 4 files (1-chase
  131,260 B, 2-foot 146,150 B, 3-drive 123,370 B, 4-mission
  143,422 B), all 1280×800 JPEG ≤ 256 KiB.
- NOT done by this builder (parent's job): push to GitHub, submit
  round 3 (needs Arie's explicit approval).

## Verification log (Cycle 17 — M9 "Boardwalk Rush" street race, 2026-11-21)
- RECORDING: #14 (01a1fca5-bdbf-7035-a519-df5ebf5da261, PID 3943) alive
  at every edit, render and playtest (checked repeatedly, last at
  ~08:23 WIB; started 21 Nov ~12:47 WIB, before this session began,
  so this session's work is witnessed). Builder session id
  ac5ecf86-74a3-40ea-a191-982321252226. Kit level 32 (current —
  `makefun status` showed no level warning; no refresh). can_submit
  YES (verified 21 Nov 12:31 WIB).
- Files changed: missions.js 25,698 → 30,501 B (new step type
  `race`, M9 definition, race state + markers + beacon branch +
  stepTime helper); hud.js 9,150 → 9,755 B (race HUD line +
  raceTarget import); shots.js 19,830 → 20,433 B (drive shot
  restaged to M9 race step); main.js 13,366 → 13,456 B (?debug=1
  race readout); README.md "nine chained jobs / four verbs";
  screenshots/3-drive.jpg 123,370 → 132,206 B (NEW — the race).
  M6/M7/M8 mechanics, player.js, police.js, combat.js untouched.
  vendor/makefun-game.ts unchanged (sha256 dc671875…).
- All 14 modules node --check clean.
- Node harness (dev-gta6-cycle5/harness.mjs, log harness-c17.log):
  272/272 PASS (236 Cycle 16 + 36 new/updated §36: M9 data — 5
  points on z=256, spacing 80–110 m, radius 7, time 30; race start
  (timer 30, beacon on CP1, 5 rings placed/visible); checkpoint
  advance + radius boundary (7.5 m no, 6 m yes); full 5-checkpoint
  completion (+$1500, storyDone); timer fail ("Out of time!",
  markers/beacon hidden); retry via R (restarts at needCar,
  re-entering car re-opens race with full 30 s); M8→M9 chaining +
  save/load mid-M9; drive geometry — all 5 checkpoints inside ~44
  deg half-FOV from the settled drive camera, CP1 40 m ahead ~11
  deg off-axis, none inside a building, rings clear of staged
  parked cars). The harness caught a real bug first: the task spec
  nests `time` inside `race: {...}` but the step.time machine reads
  `step.time`, so the timer stayed 0 (5 failures) — fixed with a
  stepTime(step) helper (`step.time || step.race.time`) used in
  startMission, startMissionStep, completeStep and the per-frame
  tick; the single source of truth remains race.time. §27/§30
  updated (M8 takedown completes M8 + starts M9, story NOT done).
- Headless Chromium renders (CDP driver, serve :8093, 1280×800 JPEG
  q88, 1.2 s wait; log render-c17.log), all 4 shots LOOKED at:
  - 3-drive.jpg 132,206 B (NEW): player red car three-quarter,
    beach right (sand/ocean/palms), towers left, gold beacon column
    + large gold ring on the road at CP1 ~40 m ahead (confirmed by
    a 2x zoomed crop), traffic ahead, boat region byte-identical to
    Cycle 16; objective "Boardwalk Rush: Race the boardwalk — hit
    all 5 checkpoints / Checkpoint 1/5 · 30s".
  - 1-chase.jpg 131,260 B: same composition as Cycle 16 (port
    cranes + roadblock 2 + "The Drop … 98m").
  - 2-foot.jpg 146,150 B: same composition as Cycle 16 (park +
    hunt live "14m · 100 HP").
  - 4-mission.jpg 143,422 B: same composition as Cycle 16 (courier
    "25m · 20s · IN ZONE").
  Only 3-drive.jpg was replaced; the other three are the Cycle 16
  files (new renders differ by hash only from live timing, same
  composition). Only console problem: favicon.ico 404 (benign,
  pre-existing).
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest-c17.mjs
  (new script, serve :8100, debug :9230, profile
  chrome-profile-play17; logs playtest-c17-r1.log +
  playtest-c17-r2.log): (R1) LIVE RACE COMPLETED — opens mi=8
  ms=1 active=true race=[0,29.9], "Checkpoint 1/5 · 30s"; driver v3
  (steer by the car's heading angle, lookahead (px+60, 256),
  position-based reverse-turn unstick) cleared all 5 checkpoints
  live: CP1 game 3.7 s / timer 28.2 s (px=-94, pz=256, speed 29.9),
  CP2 game 7.0 s / 24.9 s (px=5), CP3 game 10.2 s / 21.8 s (px=98),
  CP4 game 13.4 s / 18.6 s (px=195), finish ~16 s game with ~16 s
  left (last read game 15.8 s, timer 16.2 s, px=266, CP5 d=14);
  race gone, storyDone=true, mode=complete, "Story complete — free
  roam Solmar!". R1 RESULT: opensRight=true completed=true
  failed=false. R1 wall time 867 s. Two driver versions failed
  first: v1 (steer at the checkpoint by camera vectors) weaved
  across the road (pz 245–262) and wedged at (74,231); v2 (steer
  at a centreline lookahead by camera vectors) wedged at (11,235).
  Root cause: the drive camera's -0.2 orbit tilts its axis ~11
  deg south, so a due-east target reads LEFT of the camera axis
  and the driver held A (north) constantly. v3 steers by
  status.angle (no orbit bias) and tracked pz=256 exactly the
  whole run (fwd=1.00 throughout) — a test-driver failure, not a
  game failure. (R2) LIVE TIMEOUT FAIL — fresh drive shot, no
  input: timer ticked 29.9 → 0 over 1,999 s wall (game 2.3 s →
  31 s), then "Mission failed — Out of time! Press R to retry."
  (brief "Out of time! Press R to retry.", mode=play); pressing R
  re-opened the race live (mi=8 ms=1 race=[0,29.9], objDist
  "Checkpoint 1/5 · 30s"). R2 RESULT: sawFail=true retried=true.
  Note: the first r2-only run crashed immediately (ReferenceError:
  st is not defined — the R1 guard block-scoped `let st, tx`);
  fixed by hoisting `let st = null, tx = null;` above the guard,
  and the R2 poll cap was raised 130 → 500 (30 s of game time is
  ~2,000 s wall at headless fps under VM load 9–16).
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest6.mjs
  (re-run, serve :8095; log playtest6-c17.log): (A1) tail tutorial
  — warned=true, recovered (hold resumed, still active)=true. (A2)
  hold W through — sawWarningBeforeFail=true, fail live "Mission
  failed — Lost the courier!". (B1) roadblock — car stopped at
  px=164, speed 30, roadblock 2 / police 4 / mode play, never
  crossed x=173. (B2) Continue/save — Continue visible immediately
  after Save & quit, click → mode=play, pos restored (0,120);
  reads=[start@+0.5s, play@+1s]. (B3) punch landed on a non-hunt
  ped, wanted rose=true. (C) camera pitch on the race drive shot
  — touch-drag up drove camPitch 0.25 → 0.48 (clamp), damped toward
  0.25 (final 0.42); pointer lock did NOT engage headless (as in
  Cycles 6-16). PLAYTEST6: all six sections PASS.
- Focused repros ~/workspace/makefun/dev-gta6-cycle5/repro-c8.mjs
  (re-run, serve :8099; log repro-c8-c17.log): (B1-long) held W in
  ?shot=chase — car accelerated to 30, stopped at px=172, speed
  30 → 0.9, roadblock stayed 2 / police 4 / mode play, never
  crossed x=173: PASS. (B3-long) at the foot location (px=-128,
  pz=224) — punch landed live, wanted 0 → 1: PASS. REPRO: "ALL
  PASS".
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest-c10.mjs
  (D1 re-run, serve :8097; log playtest-c10-c17.log): M7 opens
  (mi=6 ms=0 active=true wanted=3 layLow=[24.9,3]); one Space shot
  raised wanted 3 → 4 and reset the clock live to 25 s with the
  "New trouble" toast; the countdown then completed live into step
  1 ("Clean Getaway: Reach the safehouse", 271 m, wanted 3, mode
  play). D1 RESULT: opensRight=true shotFired=true resetSeen=true
  completed=true.
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest-c11.mjs
  (H1/H2 re-run, serve :8098; log playtest-c11-c17.log): (H1)
  ?shot=foot opens M8 live — mi=7 ms=0 active=true hunt fleeing at
  100 HP, opensRight=true. (H2) live takedown — ~8 punches landed
  (HP 100 → 70 → 40 → 10 → gone), wanted 0 throughout, and the
  takedown STARTED M9 live (mi=8 ms=0 active=true storyDone=false,
  obj "Boardwalk Rush: Steal a car (press E near one)", objDist
  "find a car"). H2 RESULT: opensRight=true punches~8
  completed(M9 started)=true failed=false.
- main.ts re-verified with the final screenshots: two runs
  byte-identical (diff -r clean); dossier 905,428 B, text 163,248
  chars (< 163,840 cap — margin only 592 B; no further code growth
  is possible without removing something first); game/ 16 files,
  832,850 B; index.html 7,028 B; vendor/makefun-game.ts unchanged
  (sha256 dc671875…, matches the kit byte-for-byte); no http/https
  refs in game/src + index.html. Screenshots in /output: 4 files
  (1-chase 131,260 B, 2-foot 146,150 B, 3-drive 132,206 B,
  4-mission 143,422 B), all 1280×800 JPEG ≤ 256 KiB.
- NOT done by this builder (parent's job): push to GitHub, submit
  round 3 (needs Arie's explicit approval).

## Verification log (Cycle 18 — compaction + rival racer in M9, 2026-11-21)

- Compaction (compact-c18.mjs, dev-gta6-cycle5): drops full-line `//`
  comments >60 chars, strips trailing `//` comments (string-aware
  per-line scan), collapses 2+ blank lines to 1, drops dead code
  `ROAD_SPACING` (city.js, unused anywhere) and `clearSave`
  (save.js, unused anywhere). Keeps short headers (≤60 chars) and
  inline `/* */` comments. Verified on a test copy first: 46 removed
  code-with-trailing-comment lines pair exactly with 46 added
  stripped lines, 0 bad lines — only comments/blank lines/dead code
  changed. Applied to the real game dir: total game source 162,169
  → 123,676 B (38,493 B by the script; 38,275 B of dossier text).
  Dossier text 162,865 → 124,590 (margin 39,250). Harness 272/272
  PASS after compaction, two main.ts runs byte-identical, all 4
  shots re-rendered and looked at — compositions identical to
  Cycle 17. Gate PASSED by ~19x (needed ≥2,000 B).
- Rival (vehicles.js spawnRivalCar; missions.js M9 step text +
  spawn/clear + race branch; hud.js race line; main.js debug
  readout; shots.js drive staging): orange "Falco" (0xd86a2e,
  kind 'rival') spawns eagerly at the start line (-128, 259) at
  17.5 m/s, same 5 checkpoints, radius-7 rule; player must finish
  first. Not a traffic car (no lights/gap/rng, not stealable).
  Removed on complete/fail/restart. Cost 1,985 B dossier text.
  Final text 126,575 (margin 37,265). M6/M7/M8, player.js,
  police.js, combat.js untouched. vendor/makefun-game.ts unchanged
  (sha256 dc671875…).
- Harness ~/workspace/makefun/dev-gta6-cycle5/harness.mjs:
  **290/290 PASS** (harness-c18.log). §36 step-text + §12
  drive-staging updated for the rival; §37 added (18 checks):
  eager spawn (-128,259) orange/Falco/PI/2 with matching logical
  fields; in G.cars + scene; not stealable; updateTraffic never
  moves it; pace (175 m in 10 s, past CP1 ~1.9 s and CP2 ~7.4 s,
  idx 2 at 10 s); checkpoint boundary exact at dt=0 (7 m past =
  dist 7.6 no advance; 5 m past = dist 5.8 advances); rival-wins
  fail at ~23 s for an idle player (before the 30 s clock) with
  cleanup (state/G.cars/scene/markers) + retry re-opens race with
  a fresh rival at the line; player-wins (M9 + story, +$1,500,
  rival removed); drive geometry (rival ~17° off-axis, inside the
  ~44° half-FOV; nearest staged traffic 29 m from the spawn).
  Two harness-check bugs fixed during the run (both test errors,
  not game errors): pace test expected idx 0 at 10 s (actually 2);
  lose test used a float-accumulation loop that ran 229 ticks
  instead of 230 (switched to an integer loop, 235 ticks).
- Render ~/workspace/makefun/dev-gta6-cycle5/render.mjs
  (render-c18.log, exit 0): all 4 shots re-rendered to
  dev-gta6-cycle5/renders/ and the drive frame LOOKED at — orange
  rival beside the red player car at the start line, three-quarter
  view, fully in frame; objective bar "Boardwalk Rush: Race the
  boardwalk — beat the rival to the finish" + "Checkpoint 1/5 ·
  30s · Rival 1/5"; beacon + ring at CP1 ahead; beach right,
  towers left. Drive status: rival [0,-126,259] (moved 2 m in
  live frames after warm-up), traffic[4] at [-117,253] westbound,
  meshes 1856 (+1 rival group). Foot/chase/mission compositions
  unchanged vs Cycle 17 (rival null in their debug readouts).
  Only console problem: favicon.ico 404 (benign, pre-existing).
- CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest-c17.mjs
  (playtest-c17-c18.log, exit 0, 2,070 s wall):
  R1 live race completion: opensRight=true, completed=true
  (storyDone + mode complete), failed=false; CP1 3.7 s, CP2
  3.9 s, CP3 7.0 s, CP4 10.3 s, CP5 13.6 s, finish ~15.8 s game;
  the rival was ~2 checkpoints behind at the finish (x≈148,
  idx 3). R2 rival-wins fail: idle player failed live at game
  25.3 s with "Mission failed — The rival beat you to the
  finish! Press R to retry." (race null, rival null — cleanup
  live); R retry re-opened the race live (mi=8 ms=1,
  race=[0,29.9], rival=[0,-128,259], "Checkpoint 1/5 · 30s ·
  Rival 1/5"). R2 RESULT: sawFail=true retried=true.
- Regression chain (regress-c18.sh, regress-c18.log, exit 0,
  2,844 s wall):
  - CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest6.mjs
    (playtest6-c18.log, 11:44:50–12:00:15 UTC): A1 warned=true
    recovered=true; A2 sawWarningBeforeFail=true failToast
    "Mission failed — Lost the courier! Press R to retry.";
    B1 final px=154 (west of x=173) speed=28.7 roadblock=2;
    B2 after Continue mode=play px=0 pz=120; B3 punch landed,
    wanted rose=true; C touchDragRaised=true (to 0.49)
    dampedToward0.25=true final=0.42. All six sections PASS.
  - CDP playtest ~/workspace/makefun/dev-gta6-cycle5/repro-c8.mjs
    (repro-c8-c18.log, 12:00:15–12:03:47 UTC): B1-long stopped
    at roadblock=true (px=172 speed=0.7 roadblock=2 mode=play);
    B3-long punch landed, wanted rose=true. ALL PASS.
  - CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest-c10.mjs
    (playtest-c10-c18.log, 12:03:47–12:27:22 UTC): D1
    opensRight=true shotFired=true resetSeen=true completed
    (step 1 live)=true mode=play mi=6 ms=1 wanted=3 obj
    "Clean Getaway: Reach the safehouse" objDist="276m". PASS.
  - CDP playtest ~/workspace/makefun/dev-gta6-cycle5/playtest-c11.mjs
    (playtest-c11-c18.log, 12:27:22–12:32:14 UTC): H1 M8 hunt
    opens live (target fleeing at 100 HP, "14m · 100 HP");
    H2 opensRight=true punches~9 completed(M9 started)=true
    failed=false mode=play mi=8 obj "Boardwalk Rush: Steal a car
    (press E near one)". PASS (same shape as Cycle 17: 1 RESULT
    line, punches~8 then).
- main.ts re-verified with the final screenshots: two runs
  byte-identical (diff -r clean); dossier 868,796 B, text 126,575
  chars (< 163,840 cap — margin 37,265 B); game/ 16 files,
  796,343 B; index.html 7,028 B; vendor/makefun-game.ts unchanged
  (sha256 dc671875…, matches the kit byte-for-byte); no http/https
  refs in game/src + index.html. Screenshots in /output: 4 files
  (1-chase 131,260 B, 2-foot 146,150 B, 3-drive 135,916 B NEW,
  4-mission 143,422 B), all 1280×800 JPEG ≤ 256 KiB.
- Recording: #14 (01a1fca5…) sealed 2026-11-21T10:56:58Z (922
  chunks, 3445 leaves) after a VM restart killed it mid-cycle;
  #15 (01a1fdc1-a382-75e1-af1a-3bea9440a6d3) started
  2026-11-21T10:58:08Z (recorder PID 2929) AFTER this builder
  session began — a fresh session begun after #15 started must
  byte-identically re-write all Cycle 18 files under #15 before
  submit (Cycle 15 precedent). This builder's session
  (4dfaf92f-88c4-4292-a74d-34431f35f32c) usage rows will need the
  muse.db SELECT if a future seal holds on them.
- NOT done by this builder (parent's job): push to GitHub, submit
  round 3 (needs Arie's explicit approval), kit 32→33 refresh
  (piped curl blocked), the #15 witness re-write.

## Verification log (Cycle 19 — heli + dispatch + golden hour + radio, 2026-11-21)

- Files changed: police.js (heli mesh/spawn/follow/cone, callsigns,
  wanted ≥ 4 rule, clearPolice), hud.js (dispatch panel, air-unit chip,
  minimap heli blip, radio readout, N in hints), city.js (dusk sky/fog/
  sun/hemisphere, lit windows 0.35 → 0.55), audio.js (3 stations +
  cycleStation + per-station chords/steps), input.js (KeyN),
  main.js (KeyN handler, gameHour 17.69, debug heli field),
  shots.js (chase stages spawnHeli(G, true)), index.html (#dispatch,
  #airunit, #radio, clock 17:41, N in controls). M1–M9, player.js,
  combat.js, vehicles.js, pedestrians.js untouched.
  vendor/makefun-game.ts unchanged (sha256 dc671875…).
- Harness ~/workspace/makefun/dev-gta6-cycle5/harness.mjs:
  **312/312 PASS** (harness-c19f.log). §38 (18 checks): heli spawn
  (AIR-1, group + cone + pool in scene, hover 44 m ahead + 34 m left,
  9 m up), beam shaft 62% of the heli–player line, not in G.cars,
  rotor spins, spawn rule (none at 3, spawns at 4, leaves at 3/0),
  staged heli survives wanted 3 but leaves at 0, follows the player,
  clearPolice removes it, callsigns (HARBOUR-11, TANGO-7, BULWARK-1/2),
  chase-cover elevation < 8 deg + off-axis left of centre. §39 (4
  checks): dusk sky gradient texture, warm fog 0xd89070, low warm sun
  (0xffb060, 2.2, y 70), purple hemisphere. Radio radio-c19.mjs:
  **9/9 PASS** (radio-c19.log): 6 Node-side + 3 live CDP (N switches
  the readout + toast to Harbour Nights 101.4).
- Render ~/workspace/makefun/dev-gta6-cycle5/render.mjs
  (render-c19g/c19h.log, exit 0): all 4 shots re-rendered and LOOKED
  at — chase: heli + tapered beam + pool, dispatch 5 live units,
  "▲ AIR UNIT DEPLOYED", dusk cranes + lit towers, "The Drop: Pick up
  the crate at the port 97m"; drive: dusk beach + race + rival,
  "Checkpoint 1/5 · 30s · Rival 1/5", radio on one line; foot: hunt
  live at dusk ("15m · 100 HP", beacon + ring, park left); mission:
  courier + slim beacon ("25m · 20s · IN ZONE"). Render-arbiter fixes
  during the cycle: full-length cone → dome (beam now 62% + pool),
  end-on beam → faint disc (hover moved 30–34 m left, beam slants
  diagonally), balloon wide end (radius 3.2 → 2.2, opacity 0.45 →
  0.35), radio line wrapped (nowrap, 11 px). Only console problem:
  favicon.ico 404 (benign, pre-existing).
- CDP playtest-c17.mjs (race R1/R2) + regression chain (playtest6,
  repro-c8, playtest-c10, playtest-c11): ALL PASS, exit 0 throughout
  (playtest-c17-c19.log: R1 race completed live ~15.5 s game, R2
  rival-wins fail live + retry re-opened; playtest6-c19.log: A1/A2/B1/
  B2/B3/C all PASS; repro-c8-c19.log: B1-long stopped px=172 speed
  0.8, B3-long PASS, "ALL PASS"; playtest-c10-c19.log: D1 opensRight,
  shot fired, reset seen, step 1 live "Reach the safehouse" 271 m;
  playtest-c11-c19.log: H1 opensRight, H2 live takedown ~6 punches,
  M9 started). See CHANGELOG.md Cycle 19 for the numbers.
- main.ts re-verified with the final screenshots: two runs
  byte-identical (diff -r clean); dossier 882,061 B, text 137,066
  chars (< 163,840 cap — margin 26,774 B); game/ 16 files,
  806,851 B; index.html 7,614 B; vendor/makefun-game.ts unchanged
  (sha256 dc671875…, matches the kit byte-for-byte); no http/https
  refs in game/src + index.html. Screenshots in /output: 4 files
  (1-chase 148,407 B, 2-foot 138,220 B, 3-drive 137,134 B,
  4-mission 131,411 B), all 1280×800 JPEG ≤ 256 KiB.
- Recording: #16 (01a1fe8b-6308-74a4-974f-de3e05aa52e2) started
  2026-11-21 ~21:38 WIB, BEFORE this builder session began — every
  edit in this cycle is witnessed by it.
- NOT done by this builder (parent's job): push to GitHub, submit
  round 5 (needs Arie's explicit approval).

## Verification log (Cycle 20 — weapons + REP + cars + header/district/portraits, 2026-11-22)

- Files changed: combat.js (WEAPONS table, switchWeapon, magText,
  pellet spread, reload), hud.js (weapons row, REP line/bar, speed
  line with car name + COND, mission header, district label, brief
  portrait), missions.js (REP_RANKS/rankForRep/awardRep, mission
  awards, SPEAKER_LENA, missionHeader), vehicles.js (name by colour,
  condition + condTimer, enterCar reset, rival Falco Sport),
  city.js (districtAt), save.js (rep persisted), input.js
  (Digit1–4), main.js (Digit handlers, G.rep, debug weapon/rep/car
  fields), index.html (#weapons, #rep/#rep-bar, #mission-head/
  #mission-next, #district, #brief-portrait/#brief-name, toast
  bottom 64 → 116 px, 1–4 in controls). player.js, pedestrians.js,
  police.js, audio.js, shots.js, utils.js untouched.
  vendor/makefun-game.ts unchanged (sha256 dc671875…, matches the
  kit byte-for-byte).
- Harness ~/workspace/makefun/dev-gta6-cycle5/harness.mjs:
  **346/346 PASS** (harness-c20i3b.log): 312 Cycle 19 + 34 new.
  §40 (14 checks): weapon table, switch rules, P9 spend, SMG drain
  → reload → refill, shotgun 5 pellets = 70 dmg, FISTS punch,
  magText RELOADING/∞. §41 (7 checks): rank thresholds + names,
  award + rank-up toast, M1 completion pays 60 REP, save round-trip
  + old-save compat. §42 (8 checks): name by colour, condition 100,
  rival Falco Sport, enterCar reset, building hit 100→98. §43 (5
  checks): six districts + boundary, header M1/M6, speaker Lena.
  One Cycle-18 assertion updated (rival name Falco → Falco Sport);
  the random car-name rng draw is gone, so the seeded spawn stream
  shifted after spawnVehicles — city geometry untouched (buildCity
  runs first).
- Live CDP c20-live.mjs: **6/6 PASS** (c20-live.log): M1 brief
  visible with LC portrait + "Lena Cruz · Garage Owner", Digit3→SMG
  / Digit4→12G / Digit1→FISTS live, REP + district live, no console
  errors except favicon 404.
- Render ~/workspace/makefun/dev-gta6-cycle5/render.mjs
  (render-c20b.log, exit 0): all 4 shots re-rendered and LOOKED at —
  chase: heli + beam + pool + dispatch 5 units + dusk + JOB 4/9
  header + REP bar + weapons row + "38 km/h · Vagabond LX · COND
  100%"; drive: race + rival + "48 km/h · Comet GT · COND 100%" +
  "Boardwalk · Solmar", toast clear of the speed panel; foot: hunt
  live ("15m · 100 HP") + weapons row + JOB 8/9 + "Old Town ·
  Solmar"; mission: courier + slim beacon ("25m · 20s · IN ZONE") +
  "29 km/h · Sunrunner S · COND 100%" + "Downtown · Solmar".
  Render-arbiter fix during the cycle: centred toast at bottom 64 px
  covered the new weapons row and the speed number (drive "48 km/h"
  hidden, mission "29 km/h" half-hidden) — toast moved to bottom
  116 px; Boardwalk threshold 288 → 256 so the race road reads
  Boardwalk. Only console problem: favicon.ico 404 (benign,
  pre-existing).
- CDP playtest-c17.mjs (playtest-c17-c20.log, exit 0): R1 live race
  completion — opensRight=true, completed=true (storyDone + mode
  complete), failed=false; CP1 3.7 s, CP2 3.9 s, CP3 6.8 s, CP4
  10.1 s, finish ~15.5 s game. R2 rival-wins fail — idle player
  failed live at game ~25 s with "Mission failed — The rival beat
  you to the finish! Press R to retry."; R retry re-opened the race
  live (sawFail=true retried=true).
- Regression chain (exit 0 throughout): playtest6-c20.log (A1
  warn+recover, A2 warning-before-fail "Lost the courier!", B1
  roadblock final px=169 west of x=173, B2 Continue/save pos
  (0,120), B3 punch/wanted, C touch-drag 0.25 → 0.49 → 0.43);
  repro-c8-c20.log (B1-long px=172 speed 0.7, B3-long punch +
  wanted, "ALL PASS"); playtest-c10-c20.log (D1 opensRight,
  shotFired, resetSeen, step 1 live "Reach the safehouse" 272 m,
  wanted 3); playtest-c11-c20.log (H1 opensRight, H2 ~8 punches,
  wanted 0 throughout, M9 started). Note: the chain was killed once
  by a runtime restart mid-playtest-c10 (no failure — log ends
  mid-phase); part 2 (regress-c20b.sh) re-ran c10/c11/c17 clean.
- main.ts re-verified with the final screenshots: two runs
  byte-identical (diff -r clean); dossier 984,033 B, text 147,399
  chars (< 163,840 cap — margin 16,441 B); game/ 16 files,
  817,001 B; index.html 9,367 B; no http/https refs in game/src +
  index.html. Screenshots in /output: 4 files (1-chase 168,184 B,
  2-foot 152,286 B, 3-drive 153,648 B, 4-mission 149,910 B), all
  1280×800 JPEG ≤ 256 KiB.
- Recording: #17 (01a20167-dc95-7470-863e-644fb5aa7ec1) started
  BEFORE this builder session began — every edit in this cycle is
  witnessed by it. Recording NOT stopped by this builder.
- NOT done by this builder (parent's job): push to GitHub, submit
  round 5 (needs Arie's explicit approval).

## Cycle 21 checklist (MUST/SHOULD/WOW — written BEFORE building, 2026-11-22)
BIG LEAP per Arie ("nothing is impossible"): two NEW system dimensions, not polish.
- MUST: (1) "Sunset Shells" — 12 ORIGINAL fixed collectibles (beach/park/port/downtown), HUD counter "SHELLS n/12", pickup pays REAL +$25 cash +10 REP each, no respawn; (2) stunt jumps — 5 marked ramp spots, air-time >0.6 s over one pays REAL +$50, HUD counter "JUMPS n/5", real ballistic air (vy + gravity, not a timer fake); (3) LoS search zone at wanted ≥3 — HUD chip "IN SIGHT" (red) vs "HIDDEN" (green), red search circle on the minimap, wanted decays FASTER while HIDDEN (5 s period vs 10 s, first decay 12 s vs 25 s); LoS = segment sampling vs building footprints (pointInBuilding), verified LIVE, not just harness — if the approximation looks wrong, ship distance-only status and SAY SO in the log.
- MUST: dossier text ≤163,840 B — Cycle 20 baseline 147,399 B, margin 16,441 B; track after EVERY edit; stop if margin <1 KB. 4 screenshots ≤256 KiB, 1280×800 JPEG q88, real renders, LOOKED at. Determinism: 2× `node main.ts` byte-identical (durable dir under ~/workspace/makefun/, NOT /tmp). Harness stays 346/346 + new §44+ tests. Live CDP playtest proving shell pickup, a stunt jump, the LoS chip live + the existing regression chain, no failures.
- SHOULD: shells/jumps visible in the 4 frames (shell at the foot spawn + mission spawn + race road; ramp wedge on the race road; LoS chip + search circle in the chase cover at wanted 3). No new missions, no garage/shops, no title-screen swap, no stats screen (idea 12 deferred — costs a gameplay frame).
- WOW: the chase cover now reads heli + dispatch + LoS chip + search circle; the foot/mission/drive frames carry the SHELLS/JUMPS counters as a second exploration layer.
- MUST NOT: touch the kit, the recording, or run `record --finish`; do NOT push, do NOT submit, do NOT message Arie. If a rule is ambiguous, STOP (BLOCKED).

## Verification log (Cycle 21 — Sunset Shells + stunt jumps + LoS search zone, 2026-11-22)
- Recording: #19 (01a202e5-82c9-70b8-b97e-f62e29eaf81b) started BEFORE
  this builder session began — every edit below is witnessed by it.
  Recording NOT stopped by this builder. NOTE (parent, 18:04 WIB):
  Cycle 20 cannot be submitted (1-chase + 4-mission screenshots
  unrecoverable) — Cycle 21 is now THE round-5 candidate.
- Files changed: missions.js (SHELL_SPOTS/JUMP_SPOTS/spawnShells/
  spawnJumps/updateShells, shellsGot/jumpsGot state) 25,329 → 28,780 B;
  vehicles.js (car y/vy/airT/jumpCd/jumpSpot, launch + ballistic
  landing, exitCar air reset) 10,686 → 12,212 B; police.js
  (lineClear/policeSeen, seen state, faster hidden decay) 14,152 →
  15,546 B; hud.js (#los chip, #side counter, minimap search circle)
  12,830 → 13,753 B; game/index.html (#los/#side + CSS) 9,367 →
  9,645 B; main.js (spawn/updateShells calls, debug shells/jumps/
  seen/decay/carY/airT) 12,994 → 13,328 B; shots.js (?shot=hide
  test staging) 7,565 → 8,427 B. player.js, combat.js, save.js,
  city.js, audio.js, input.js, pedestrians.js, utils.js untouched.
  vendor/makefun-game.ts untouched. Dev scripts: harness.mjs
  (+25 Cycle 21 checks, §44–47), render.mjs/cdp.mjs (texts() +
  side/los), c21-live.mjs, c21-live2.mjs, c21-live3.mjs,
  probe-hide.mjs (real-city spot search).
- Harness ~/workspace/makefun/dev-gta6-cycle5/harness.mjs:
  **371/371 PASS** (harness-c21b.log): 346 Cycle 20 + 25 new.
  §44 (6 checks): shells. §45 (7 checks): jumps. §46 (9 checks):
  LoS + decay. §47 (5 checks): hide geometry on the REAL seed-1
  city (tower x 86..106, z 84..103; (110,98) unseen with all 4
  cruisers in range; control (64,98) seen).
- Live CDP c21-live.mjs: **7/8 PASS** (c21-live.log): A shell
  pickup live (shells 1, $275, REP 10, toast), B stunt jump live
  (max carY 1.15 m, jumps 1/5, $325), C IN SIGHT chip live
  (wanted 3) — HIDDEN never flipped (car wedged at (164,-168),
  cruisers in clear sight; maneuver failure, not a LoS bug).
- Live CDP c21-live2.mjs: **2/4** (c21-live2.log): on-foot escape
  attempt FAILED — player WASTED at (0,67) after 5.8 s game time
  (cruiser rams + cop tackles at wanted 3 on the open road).
- Live CDP c21-live3.mjs: **4/4 PASS** (c21-live3.log): ?shot=hide
  opens wanted 3 / 4 cruisers / no roadblock; chip "○ HIDDEN" live
  1 s after ready (cruisers at the tower's west face); sight
  returned later as cruisers rounded the corners (wanted stayed 3
  — hidden window too short for the 12 s decay clock, §46 covers
  the decay). Hide frame renders/hide.jpg.
- Render ~/workspace/makefun/dev-gta6-cycle5/render.mjs
  (render-c21.log, exit 0): all 4 shots re-rendered and LOOKED at —
  chase: heli + beam + pool + dispatch 5 units + "◉ IN SIGHT" red
  + red search circle on the minimap + SHELLS 0/12 · JUMPS 0/5;
  foot: $275, REP 10/300, "SHELLS 1/12 · JUMPS 0/5" + live toast
  + hunt; drive: pink shell + orange ramp at checkpoint 1 + race
  + rival; mission: $275, REP 10, "SHELLS 1/12" + toast + courier
  "25m · 20s · IN ZONE". Only console problem: favicon.ico 404
  (benign, pre-existing).
- CDP playtest-c17.mjs + regression chain (exit 0 throughout; part 1
  killed once by a runtime restart mid-c11, part 2 re-ran c11/c17
  clean, Cycle 20 precedent): playtest6 (playtest6-c21.log): A1
  warn+recover PASS, A2 warning-before-fail PASS ("Lost the
  courier!"), B1 roadblock smoke (final px=172, never crossed
  x=173) PASS, B2 Continue/save PASS (mode=play, pos restored
  (0,120)), B3 punch/wanted PASS, C touch-drag pitch PASS (0.25 →
  0.49, damped toward 0.25, final 0.43); repro-c8 (repro-c8-c21.log):
  B1-long stopped at px=172, speed 0.7 PASS, B3-long punch landed,
  wanted rose PASS, "ALL PASS"; playtest-c10 (playtest-c10-c21.log):
  D1 opensRight=true, shotFired=true, resetSeen=true, completed
  (step 1 live)=true, mode=play, "Clean Getaway: Reach the
  safehouse" 273 m, wanted 3 PASS; playtest-c11
  (playtest-c11-c21.log): H1 opensRight=true, H2 live takedown —
  ~7 punches, wanted 0 throughout, M9 started ("Boardwalk Rush:
  Steal a car") PASS; playtest-c17 (playtest-c17-c21.log): R1 live
  race completion — opensRight=true, completed=true (storyDone +
  mode complete), failed=false PASS; R2 rival-wins fail — idle
  player failed live with "The rival beat you to the finish!", R
  retry re-opened the race live (sawFail=true retried=true) PASS.
  (Side note: the R1 race car crosses the (-88,256) ramp mid-race —
  the jump did not disturb the race; checkpoints still hit and the
  race completed.)
- main.ts re-verified with the final screenshots: two runs
  byte-identical (diff -r clean); dossier 996,410 B, text 155,305
  chars (< 163,840 cap — margin 8,535 B); game/ 16 files,
  824,907 B. Screenshots in /output: 4 files (1-chase 170,364 B,
  2-foot 152,579 B, 3-drive 153,803 B, 4-mission 149,897 B), all
  1280×800 JPEG ≤ 256 KiB.
- NOT done by this builder (parent's job): push to GitHub, submit
  round 5 (needs Arie's explicit approval).
