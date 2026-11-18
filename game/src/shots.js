// shots.js — deterministic staged scenes for screenshots.
// ?shot=start|foot|drive|chase|mission & ?seed=N jumps straight into a
// composed scene with the HUD and minimap visible, so a screenshot
// captures the game at its best without any clicking around.
import { PLACES } from './city.js';
import { spawnPlayerCar } from './vehicles.js';
import { spawnPoliceCarAt } from './police.js';
import { startMission } from './missions.js';

export function applyShotMode(G, shot) {
  if (!shot || shot === 'start') return false; // start screen stays up
  G.audio.init();
  // Every shot mode starts the game immediately, HUD on.
  G.mode = 'play';
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('hud').style.display = 'block';
  if (shot === 'foot') {
    // Rico on foot on a busy downtown street, peds and traffic around.
    G.player.pos.set(0, 0, 96);
    G.player.angle = Math.PI;
    G.camYaw = Math.PI;
    G.camOrbit = 0;
    G.camPitch = 0.1;
    // Stage a busy street: pull a few pedestrians onto this block and
    // put two traffic cars on the road the player stands on.
    G.peds.slice(0, 5).forEach((ped, i) => {
      ped.pos.set(-14 + i * 7, 0, 88 + (i % 2) * 14);
      ped.target = { x: 14 - i * 6, z: 104 - (i % 2) * 10 };
      ped.state = 'walk';
    });
    const traffic = G.cars.filter((c) => c.kind === 'traffic');
    if (traffic[0]) { traffic[0].axis = 'x'; traffic[0].fixed = 96; traffic[0].along = -46; traffic[0].dir = 1; traffic[0].speed = 8; }
    if (traffic[1]) { traffic[1].axis = 'x'; traffic[1].fixed = 96; traffic[1].along = 52; traffic[1].dir = -1; traffic[1].speed = 8; }
    startMission(G, 0);
    G.toast("Welcome to Solmar — follow the gold marker to Lena's Garage");
    return true;
  }
  if (shot === 'drive') {
    spawnPlayerCar(G, 0, -160, 0, 0xc83a2e);
    G.player.car.speed = 16;
    G.camYaw = Math.PI;
    G.camOrbit = 0;
    startMission(G, 0);
    return true;
  }
  if (shot === 'chase') {
    spawnPlayerCar(G, -64, 128, Math.PI / 2, 0x2e7fc8);
    G.player.car.speed = 14;
    G.camYaw = Math.PI / 2 + Math.PI;
    G.camOrbit = 0;
    G.wanted = 3;
    // Two oncoming cruisers ahead on the same road, in frame: they close
    // in during warm-up but stay ahead of the player for the shot.
    spawnPoliceCarAt(G, 6, 122, 12);
    spawnPoliceCarAt(G, 6, 134, 12);
    startMission(G, 3);
    G.toast('Police on your tail — lose them!');
    return true;
  }
  if (shot === 'mission') {
    // On road x=-128, heading north; the package waits in the park just
    // ahead on the left, waypoint gold diamond visible.
    spawnPlayerCar(G, -128, 160, Math.PI, 0xe8c832);
    G.player.car.speed = 10;
    G.camYaw = Math.PI;
    G.camOrbit = 0;
    startMission(G, 1);
    return true;
  }
  return false;
}

// After the shot scene is staged, nudge the world a few frames forward so
// traffic and pedestrians are mid-street (not all at their spawn points).
export function warmUpWorld(G, seconds = 2) {
  const step = 1 / 30;
  for (let t = 0; t < seconds; t += step) {
    G.time += step;
    G.updateTrafficOnly(step);
    G.updatePedsOnly(step);
    if (G.wanted > 0) G.updatePoliceOnly(step);
  }
}
