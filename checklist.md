# SOLMAR — gta6-01 checklist (Cycle 1 — DONE 2026-11-18)

## MUST (gate + judge criterion 1)
- [x] game/ static files only, no network refs, index.html ≤ 1 MiB (7,028 B), game/ ≤ 993 files / 48 MiB (19 entries, 770,574 B after Cycle 3)
- [x] main.ts (Node 22 stdlib only) copies game/ + screenshots/ to /output, writes dossier.json via buildDossier (text 163840, shots max 4 / 262144 B, game 993 / 48 MiB); deterministic (two runs byte-identical, diff -r clean; re-verified Cycle 3: dossier 739,074 B)
- [x] 4 screenshots, each ≤ 256 KiB (110–129 KB), 1280×800 (long 1280, short 800), first by name = cover (1-chase.jpg); real headless-Chromium renders of this game, unedited
- [x] .makefun/owner.json {"wallet": "5FGhpCb28E2Vq9d5DwMhKEBk3HoBpJHwDCKDtUb7YREV"}; LICENSE (MIT, kit copy)
- [x] City explorable on foot AND by car (enter/exit with E, steal parked/traffic cars)
- [x] Traffic cars (road AI, stop at red lights) + pedestrians (sidewalks, flee)
- [x] Wanted 1–5 stars, police cars + foot cops chase, busted / wasted states
- [x] Missions: 5-chapter story chain with waypoint + objective + reward
- [x] Combat: punch (F) + pistol (click/Space), health; Cycle 3: a punch that lands now raises wanted +1 like a shot (was 0 stars; no double-count when the target goes down)
- [x] HUD: health, money, wanted stars, minimap canvas, objective + distance, speed, clock, controls hint
- [x] Start screen + pause (Esc) + busted/wasted screens; save/load via localStorage (Cycle 2: Continue now appears immediately after Save & quit — was only after reload)
- [x] ?shot=foot|drive|chase|mission|start & ?seed= staged deterministic scenes, HUD + minimap visible in every shot
- [x] All JS modules node --check clean; no http/https src in index.html; bare "three" only via import map

## SHOULD (criteria 2–3: depth, feel)
- [x] Side activities: cash pickups + fare job (pick up pedestrian, drive to waypoint)
- [x] Procedural WebAudio: engine hum, siren, gunshot, punch, pickup chime, mission jingle, ambient music; M mute
- [x] Third-person chase camera, mouse orbit; sprint (Shift); R restart mission; Cycle 3: pitch half as sensitive (0.0012), capped at 0.5, and eases back to default 0.25 when the mouse is still (was 0.0022, cap 0.7, accumulated with no reset)
- [x] Seeded RNG deterministic city per ?seed=
- [x] Distinct districts: beach, port/industrial, park, downtown towers

## WOW (criteria 4–5: look, structure)
- [x] Sun-soaked coastal art direction: warm sun, sky + fog, shadows, facade textures, palms, ocean, clouds
- [x] Original names/story: Rico Vega, Lena Cruz, Marcus Thorne — nothing from Rockstar/GTA
- [x] One clear job per file, names that read as the outline (city/player/vehicles/pedestrians/police/missions/combat/hud/audio/input/save/shots)
- [x] Cover screenshot shows chase + wanted + minimap + mission objective in one frame (1-chase.jpg: 2 cruisers ahead, 3 stars, "The Drop" brief + 453m, minimap blips)

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
