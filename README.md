[![make.fun](https://make.fun/badge/gta6-01.svg)](https://make.fun/c/gta6-01)
[![rank](https://make.fun/badge/gta6-01/arthosiu-cmd/gta6-01/rank.svg)](https://make.fun/c/gta6-01)
[![reward](https://make.fun/badge/gta6-01/arthosiu-cmd/gta6-01/reward.svg)](https://make.fun/c/gta6-01)

# SOLMAR — an open-world crime story

A complete open-world crime game in the browser, built for the make.fun
gta6-01 bounty. You are **Rico Vega**, ex-getaway driver. You owe $2,000
to **Marcus Thorne**, the developer who owns the city — and your debt.
**Lena Cruz** runs the garage on 4th Street, and her jobs are the only
way out. Explore the sun-soaked coastal city of Solmar on foot or by car,
steal cars, lose the cops, run fares, grab cash, and finish all five jobs
to pay the debt and take the boat out.

Everything is original: the city, characters, story, art and sounds are
ours — nothing from any commercial game.

## Play it

Serve `game/` with any static server and open `index.html` in desktop
Chrome. No build step, no network — every file the game loads lives
under `game/` (three.js r160 is vendored at `game/vendor/`).

```sh
node serve.ts        # serves game/ at http://localhost:8080
```

Or: `python3 -m http.server -d game 8080`.

## Controls

| Key | Action |
| --- | ------ |
| WASD | Move on foot / drive |
| Shift | Sprint |
| E | Enter / exit car (steal parked or traffic cars) |
| F | Punch |
| Click / Space | Shoot pistol |
| Q | Take a fare (in a car, near a waiting customer) |
| R | Restart current mission |
| M | Mute sound |
| Esc | Pause |
| Mouse | Click the game to look around (pointer lock) |

## What's in the game

- **City** — a seeded, deterministic 9×9 street grid: downtown towers,
  a beach with ocean and palms, a port full of containers, a park,
  streetlights, traffic lights, clouds and a warm sun.
- **Driving & traffic** — arcade driving, traffic cars that follow roads
  and stop at red lights, parked cars to steal.
- **Pedestrians** — walkers on the sidewalks who flee when scared.
- **Wanted system** — 1–5 stars, police cars that chase and ram, foot
  cops who chase and bust you; busted and wasted screens.
- **Story missions** — five chained jobs from Lena, each with a waypoint
  beacon, objective text, distance, timer where it matters, and a payout.
- **Side activities** — scattered cash pickups and a fare job (drive a
  passenger to their destination).
- **Combat** — punch and pistol (hitscan with muzzle flash and tracer).
- **HUD** — health, money, wanted stars, objective + distance, speed,
  clock, controls hint, and a live top-down minimap.
- **Sound** — fully procedural WebAudio: engine hum, two-tone siren,
  gunshots, punches, pickup chimes, mission jingles and a quiet chord
  loop. No audio files.
- **Save** — progress (money, missions, health, position) autosaves to
  localStorage; Continue on the start screen picks it up.
- **Screenshots** — `?shot=foot|drive|chase|mission|start&seed=N` stages
  a deterministic scene for capture, HUD and minimap included.

## Structure

```
game/index.html        page, HUD DOM, import map, loads src/main.js
game/src/main.js       bootstrap + game loop + ties systems together
game/src/utils.js      seeded RNG, math helpers
game/src/city.js       procedural city: roads, buildings, beach, port, park
game/src/player.js     on-foot character + movement + chase camera
game/src/vehicles.js   cars: traffic AI, parked cars, driving, enter/exit
game/src/pedestrians.js walkers, fleeing
game/src/police.js     wanted level, pursuit, busted/wasted
game/src/missions.js   mission chain + story + cash pickups + fare job
game/src/combat.js     punch/shoot, health, damage
game/src/hud.js        HUD + minimap canvas
game/src/audio.js      procedural WebAudio
game/src/input.js      keyboard + mouse
game/src/save.js       localStorage save/load
game/src/shots.js      screenshot modes via ?shot= + ?seed=
game/vendor/           three.js r160 (vendored, not our source)
main.ts                hands the entry in (copies game/ + screenshots/,
                       writes dossier.json via vendor/makefun-game.ts)
```

## Known limits

- Physics is arcade, not simulated: cars slide around buildings via
  push-out, police chase in straight lines and slide around corners.
- Traffic cars turn at intersections but never park or reverse.
- Sound starts only after a click (browser autoplay rule); the game
  plays silent until then.
- The city is one fixed layout per seed; interiors do not exist.
