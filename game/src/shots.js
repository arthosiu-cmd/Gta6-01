// shots.js — deterministic staged scenes for screenshots.
import { PLACES } from './city.js';
import { spawnPlayerCar, updatePlayerCar, enterCar, exitCar } from './vehicles.js';
import { spawnPoliceCarAt, spawnHeli } from './police.js';
import { startMission, startMissionStep, updateMissions, updateShells, SHELL_SPOTS } from './missions.js';
import { updateStats, resyncStats } from './stats.js';

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
  G.mode = 'play';
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('hud').style.display = 'block';
  if (shot === 'foot') {
    G.player.pos.set(-128, 0, 224);
    G.player.angle = Math.PI;
    G.camYaw = Math.PI * 2;
    G.camOrbit = 0;
    G.camPitch = 0.1;
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
    if (traffic[0]) { traffic[0].axis = 'x'; traffic[0].fixed = 192; traffic[0].along = -164; traffic[0].dir = 1; traffic[0].speed = 8; }
    if (traffic[1]) { traffic[1].axis = 'x'; traffic[1].fixed = 192; traffic[1].along = -92; traffic[1].dir = -1; traffic[1].speed = 8; }
    parkCar(G, -119, 216, 0);
    parkCar(G, -137, 214, Math.PI);
    startMissionStep(G, 7, 0);
    hideBriefForShot(G);
    return true;
  }
  if (shot === 'drive') {
    spawnPlayerCar(G, -128, 256, Math.PI / 2, 0xc83a2e);
    G.player.car.speed = 16;
    G.camYaw = Math.PI / 2 + Math.PI - 0.2;
    G.camOrbit = -0.2;
    const traffic = G.cars.filter((c) => c.kind === 'traffic');
    const driveSpots = [-88, -68, -52];
    driveSpots.forEach((along, i) => {
      const car = traffic[i];
      if (!car) return;
      car.axis = 'x'; car.fixed = 256; car.along = along; car.dir = 1; car.speed = 8;
    });
    if (traffic[3]) {
      const car = traffic[3];
      car.axis = 'x'; car.fixed = 256; car.along = -72; car.dir = -1; car.cruise = 8; car.speed = 8; car.noTurn = true;
    }
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
    parkCar(G, -116, 247, Math.PI / 2);
    parkCar(G, -112, 265, -Math.PI / 2);
    if (traffic[4]) {
      const car = traffic[4];
      car.axis = 'x'; car.fixed = 256; car.along = -100; car.dir = -1; car.cruise = 8; car.speed = 8; car.noTurn = true;
    }
    startMissionStep(G, 8, 1);
    hideBriefForShot(G);
    return true;
  }
  if (shot === 'chase') {
    spawnPlayerCar(G, 128, -192, Math.PI / 2, 0x2e7fc8);
    G.player.car.speed = 14;
    G.camYaw = Math.PI / 2 + Math.PI + 0.2;
    G.camOrbit = 0.2;
    G.wanted = 3;
    spawnPoliceCarAt(G, 198, -198, 12);
    spawnPoliceCarAt(G, 198, -186, 12);
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
    parkCar(G, 136, -201, Math.PI / 2);
    parkCar(G, 134, -183, -Math.PI / 2);
    if (traffic[2]) {
      const car = traffic[2];
      car.axis = 'x'; car.fixed = -192; car.along = 124; car.dir = 1; car.cruise = 8; car.speed = 8; car.noTurn = true;
    }
    startMission(G, 3);
    G.toast('Police on your tail — lose them!');
    spawnHeli(G, true);
    hideBriefForShot(G);
    return true;
  }
  if (shot === 'mission') {
    spawnPlayerCar(G, 0, 107, Math.PI, 0xe8c832);
    G.player.car.speed = 10;
    G.camYaw = Math.PI * 2 + 0.2;
    G.camOrbit = 0.2;
    G.peds.slice(0, 2).forEach((ped, i) => {
      const x = i === 0 ? -8 : 8;
      const z = i === 0 ? 97 : 87;
      ped.pos.set(x, 0, z);
      ped.target = { x, z: z - 30 };
      ped.state = 'walk';
    });
    parkCar(G, 9, 100, 0);
    parkCar(G, -9, 102, Math.PI);
    startMissionStep(G, 5, 1);
    hideBriefForShot(G);
    return true;
  }
  if (shot === 'pause') {
    // Career staging: scripted session through the real systems
    // (steal, drive, shells, jobs) so every pause number is tracked.
    spawnPlayerCar(G, 0, 107, Math.PI, 0xe8c832);
    G.camYaw = Math.PI * 2 + 0.2;
    G.camOrbit = 0.2;
    const tp = (x, z) => {
      const c = G.player.car;
      if (c) { c.mesh.position.set(x, 0, z); c.angle = Math.PI; }
      G.player.pos.set(x, 0, z);
      G.player.angle = Math.PI;
      resyncStats(G);
    };
    const parked = parkCar(G, 9, 100, 0);
    exitCar(G);
    if (parked) enterCar(G, parked);
    tp(0, 107);
    G.input.keys.KeyW = true;
    for (let i = 0; i < 120; i++) {
      G.time += 0.05;
      updatePlayerCar(G, 0.05);
      updateStats(G, 0.05);
    }
    G.input.keys.KeyW = false;
    for (const [x, z] of SHELL_SPOTS.slice(0, 3)) {
      G.time += 4;
      tp(x, z);
      updateShells(G, 0.1);
      updateStats(G, 4);
    }
    // Jobs 1-3 (two ticks per stop: needCar, then position).
    const go = (x, z) => {
      G.time += 12;
      tp(x, z);
      updateMissions(G, 0.1);
      updateMissions(G, 0.1);
      updateStats(G, 12);
    };
    startMission(G, 0);
    go(44, -20);
    go(-160, 96);
    go(160, -160);
    go(-224, 224);
    tp(0, -20);
    spawnPoliceCarAt(G, 64, -32, 12);
    hideBriefForShot(G);
    G.mode = 'paused';
    document.getElementById('pause-screen').style.display = 'flex';
    document.getElementById('hud').style.display = 'none';
    G.hud.showPause(G);
    return true;
  }
  if (shot === 'hide') {
    spawnPlayerCar(G, 110, 98, Math.PI / 2, 0x2e7fc8);
    G.camYaw = Math.PI / 2 + Math.PI;
    G.camOrbit = 0;
    G.wanted = 3;
    spawnPoliceCarAt(G, 64, 64, 0);
    spawnPoliceCarAt(G, 64, 96, 0);
    spawnPoliceCarAt(G, 64, 128, 0);
    spawnPoliceCarAt(G, 96, 64, 0);
    hideBriefForShot(G);
    return true;
  }
  if (shot === 'escape') {
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
