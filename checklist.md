# SOLMAR — gta6-01 checklist (Cycle 1 — DONE 2026-11-18)

## MUST (gate + judge criterion 1)
- [x] game/ static files only, no network refs, index.html ≤ 1 MiB (7,028 B), game/ ≤ 993 files / 48 MiB (19 entries, 769,646 B)
- [x] main.ts (Node 22 stdlib only) copies game/ + screenshots/ to /output, writes dossier.json via buildDossier (text 163840, shots max 4 / 262144 B, game 993 / 48 MiB); deterministic (two runs byte-identical, diff -r clean)
- [x] 4 screenshots, each ≤ 256 KiB (110–129 KB), 1280×800 (long 1280, short 800), first by name = cover (1-chase.jpg); real headless-Chromium renders of this game, unedited
- [x] .makefun/owner.json {"wallet": "5FGhpCb28E2Vq9d5DwMhKEBk3HoBpJHwDCKDtUb7YREV"}; LICENSE (MIT, kit copy)
- [x] City explorable on foot AND by car (enter/exit with E, steal parked/traffic cars)
- [x] Traffic cars (road AI, stop at red lights) + pedestrians (sidewalks, flee)
- [x] Wanted 1–5 stars, police cars + foot cops chase, busted / wasted states
- [x] Missions: 5-chapter story chain with waypoint + objective + reward
- [x] Combat: punch (F) + pistol (click/Space), health
- [x] HUD: health, money, wanted stars, minimap canvas, objective + distance, speed, clock, controls hint
- [x] Start screen + pause (Esc) + busted/wasted screens; save/load via localStorage
- [x] ?shot=foot|drive|chase|mission|start & ?seed= staged deterministic scenes, HUD + minimap visible in every shot
- [x] All JS modules node --check clean; no http/https src in index.html; bare "three" only via import map

## SHOULD (criteria 2–3: depth, feel)
- [x] Side activities: cash pickups + fare job (pick up pedestrian, drive to waypoint)
- [x] Procedural WebAudio: engine hum, siren, gunshot, punch, pickup chime, mission jingle, ambient music; M mute
- [x] Third-person chase camera, mouse orbit; sprint (Shift); R restart mission
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
