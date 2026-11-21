// shots.js — deterministic staged scenes for screenshots.
import { PLACES } from './city.js';
import { spawnPlayerCar } from './vehicles.js';
import { spawnPoliceCarAt } from './police.js';
import { startMission, startMissionStep } from './missions.js';

// staging, never from the live game).
function hideBriefForShot(G) {
  G.hud.brief.style.display = 'none';
  G.hud.briefTimer = 0;
}

function parkCar(G, x, z, angle) {
  const car = G.cars.find((c) => c.kind === 'parked' && !c.staged);
  if (!car) return null;
  car.staged = true;
  car.mesh.position.set(x, 0, z);
  car.mesh.rotation.y = angle;
  car.angle = angle;
  return car;
}

export function applyShotMode(G, shot) {
  if (!shot || shot === 'start') return false;
  G.audio.init();
  // Every shot mode starts the game immediately, HUD on.
  G.mode = 'play';
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('hud').style.display = 'block';
  if (shot === 'foot') {
    // mechanic in progress, not a walk.
    G.player.pos.set(-128, 0, 224);
    G.player.angle = Math.PI;
    // settles at 2*PI.
    G.camYaw = Math.PI * 2;
    G.camOrbit = 0;
    G.camPitch = 0.1;
    // moved to the park's edge.)
    const pedSpots = [
      { x: -136, z: 208, tx: -120, tz: 200 },
      { x: -132, z: 218, tx: -122, tz: 208 },
      { x: -128, z: 218, tx: -128, tz: 206 },
      { x: -123, z: 216, tx: -135, tz: 206 },
      { x: -119, z: 200, tx: -130, tz: 192 },
    ];
    G.peds.slice(0, 5).forEach((ped, i) => {
      const s = pedSpots[i];
      ped.pos.set(s.x, 0, s.z);
      ped.target = { x: s.tx, z: s.tz };
      ped.state = 'walk';
    });
    const traffic = G.cars.filter((c) => c.kind === 'traffic');
    // north), not on z=96: at fixed=96 the cars sat ~57 degrees
    if (traffic[0]) { traffic[0].axis = 'x'; traffic[0].fixed = 192; traffic[0].along = -164; traffic[0].dir = 1; traffic[0].speed = 8; }
    if (traffic[1]) { traffic[1].axis = 'x'; traffic[1].fixed = 192; traffic[1].along = -92; traffic[1].dir = -1; traffic[1].speed = 8; }
    parkCar(G, -119, 216, 0);
    parkCar(G, -137, 214, Math.PI);
    // stays hidden in staged shots, as in every other mode.
    startMissionStep(G, 7, 0);
    hideBriefForShot(G);
    return true;
  }
  if (shot === 'drive') {
    // the frame shows the first gold ring + beacon, the live
    // through instead of an empty road.
    spawnPlayerCar(G, -128, 256, Math.PI / 2, 0xc83a2e);
    G.player.car.speed = 16;
    // +0.2. With +0.2 the view axis tilts north and the boat at
    G.camYaw = Math.PI / 2 + Math.PI - 0.2;
    G.camOrbit = -0.2;
    // none of them turns off the road during warm-up.
    const traffic = G.cars.filter((c) => c.kind === 'traffic');
    const driveSpots = [-88, -68, -52];
    driveSpots.forEach((along, i) => {
      const car = traffic[i];
      if (!car) return;
      car.axis = 'x'; car.fixed = 256; car.along = along; car.dir = 1; car.speed = 8;
    });
    // Staged at -88 it would meet the player nose-to-nose at
    // noTurn so the frame stays deterministic.
    if (traffic[3]) {
      const car = traffic[3];
      car.axis = 'x'; car.fixed = 256; car.along = -72; car.dir = -1; car.cruise = 8; car.speed = 8; car.noTurn = true;
    }
    // Two pedestrians on the sidewalks ahead.
    G.peds.slice(0, 2).forEach((ped, i) => {
      const x = i === 0 ? -80 : -64;
      const z = i === 0 ? 247 : 265;
      ped.pos.set(x, 0, z);
      ped.target = { x: x + 30, z };
      ped.state = 'walk';
    });
    G.peds.slice(2, 4).forEach((ped, i) => {
      const x = i === 0 ? -112 : -108;
      const z = i === 0 ? 247 : 265;
      ped.pos.set(x, 0, z);
      ped.target = { x: x + 30, z };
      ped.state = 'walk';
    });
    // in frame.
    parkCar(G, -116, 247, Math.PI / 2);
    parkCar(G, -112, 265, -Math.PI / 2);
    // so there is no overlap on the way.
    if (traffic[4]) {
      const car = traffic[4];
      car.axis = 'x'; car.fixed = 256; car.along = -100; car.dir = -1; car.cruise = 8; car.speed = 8; car.noTurn = true;
    }
    // checkpoint 1 sits 40 m ahead under its gold beacon.
    startMissionStep(G, 8, 1);
    hideBriefForShot(G);
    return true;
  }
  if (shot === 'chase') {
    // the city edge (x~296, fading into the fog), with mid-rise
    // bottom band keeps the Cycle 12 fill.
    spawnPlayerCar(G, 128, -192, Math.PI / 2, 0x2e7fc8);
    G.player.car.speed = 14;
    // arbiter (Cycle 8 lesson: check the frame edges for seeded
    // pickups the old angle kept out).
    G.camYaw = Math.PI / 2 + Math.PI + 0.2;
    G.camOrbit = 0.2;
    G.wanted = 3;
    // exactly as they did downtown.
    spawnPoliceCarAt(G, 198, -198, 12);
    spawnPoliceCarAt(G, 198, -186, 12);
    // updatePolice during warm-up, once wanted is 3.)
    const traffic = G.cars.filter((c) => c.kind === 'traffic');
    if (traffic[0]) { traffic[0].axis = 'x'; traffic[0].fixed = -192; traffic[0].along = 200; traffic[0].dir = 1; traffic[0].speed = 8; }
    if (traffic[1]) { traffic[1].axis = 'x'; traffic[1].fixed = -192; traffic[1].along = 232; traffic[1].dir = 1; traffic[1].speed = 8; }
    G.peds.slice(0, 1).forEach((ped) => {
      ped.pos.set(162, 0, -201);
      ped.target = { x: 202, z: -201 };
      ped.state = 'walk';
    });
    G.peds.slice(1, 2).forEach((ped) => {
      ped.pos.set(150, 0, -183);
      ped.target = { x: 190, z: -183 };
      ped.state = 'walk';
    });
    // roadblock (45 m ahead).
    parkCar(G, 136, -201, Math.PI / 2);
    parkCar(G, 134, -183, -Math.PI / 2);
    // during warm-up and must not turn onto the cross street.
    if (traffic[2]) {
      const car = traffic[2];
      car.axis = 'x'; car.fixed = -192; car.along = 124; car.dir = 1; car.cruise = 8; car.speed = 8; car.noTurn = true;
    }
    startMission(G, 3);
    G.toast('Police on your tail — lose them!');
    hideBriefForShot(G);
    return true;
  }
  if (shot === 'mission') {
    // the tail is already counting.
    spawnPlayerCar(G, 0, 107, Math.PI, 0xe8c832);
    G.player.car.speed = 10;
    // kept out).
    G.camYaw = Math.PI * 2 + 0.2;
    G.camOrbit = 0.2;
    // x=0 could slow it down or steal the frame from it.
    G.peds.slice(0, 2).forEach((ped, i) => {
      const x = i === 0 ? -8 : 8;
      const z = i === 0 ? 97 : 87;
      ped.pos.set(x, 0, z);
      ped.target = { x, z: z - 30 };
      ped.state = 'walk';
    });
    // clear of the peds and of the courier's lane (x=-3).
    parkCar(G, 9, 100, 0);
    parkCar(G, -9, 102, Math.PI);
    startMissionStep(G, 5, 1);
    hideBriefForShot(G);
    return true;
  }
  if (shot === 'escape') {
    // punch, a shot, another theft) restarts the 25 s clock.
    spawnPlayerCar(G, 0, 107, Math.PI, 0x2e7fc8);
    G.player.car.speed = 10;
    G.camYaw = Math.PI * 2;
    G.camOrbit = 0;
    G.peds.slice(0, 2).forEach((ped, i) => {
      const x = i === 0 ? -8 : 8;
      const z = i === 0 ? 97 : 87;
      ped.pos.set(x, 0, z);
      ped.target = { x, z: z - 30 };
      ped.state = 'walk';
    });
    parkCar(G, 9, 100, 0);
    parkCar(G, -9, 102, Math.PI);
    // adds wanted 3, so the heat is on from the first frame.
    startMissionStep(G, 6, 0);
    hideBriefForShot(G);
    return true;
  }
  return false;
}

export function warmUpWorld(G, seconds = 2) {
  const step = 1 / 30;
  for (let t = 0; t < seconds; t += step) {
    G.time += step;
    G.updateTrafficOnly(step);
    G.updatePedsOnly(step);
    if (G.wanted > 0) G.updatePoliceOnly(step);
  }
}
