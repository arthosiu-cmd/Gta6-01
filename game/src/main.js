import * as THREE from 'three';
import { makeRng, readUrlParams, clamp } from './utils.js';
import { buildCity } from './city.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { saveGame, loadSave, applySave } from './save.js';
import { createPlayerState, updatePlayerOnFoot, updateCamera, snapCamera } from './player.js';
import { spawnVehicles, updateTraffic, updatePlayerCar, nearestCar, enterCar, exitCar } from './vehicles.js';
import { spawnPedestrians, updatePedestrians, scarePeds } from './pedestrians.js';
import { createPoliceState, updatePolice, clearPolice } from './police.js';
import { createCombatState, tryPunch, tryShoot, switchWeapon, updateCombat } from './combat.js';
import { createMissionsState, startMission, updateMissions, restartMission, spawnPickups, updatePickups, spawnShells, updateShells, spawnJumps, spawnFareCustomer, updateFare } from './missions.js';
import { createHud, updateHud } from './hud.js';
import { applyShotMode, warmUpWorld } from './shots.js';

const params = readUrlParams();
const rng = makeRng(params.seed);

const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 1500);
camera.position.set(0, 6, 112);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const G = {
  scene, camera, renderer, rng, seed: params.seed,
  time: 0,
  gameHour: 17.69,
  mode: 'start',
  money: 250,
  health: 100,
  rep: 0,
  wanted: 0,
  camYaw: Math.PI,
  camOrbit: 0,
  camPitch: 0.25,
  city: null,
  player: null,
  cars: [],
  peds: [],
  police: createPoliceState(),
  combat: null,
  missions: null,
  input: createInput(canvas),
  audio: createAudio(),
  hud: null,
};

G.toast = (text) => G.hud.toast(text);
G.save = () => saveGame(G);
G.addWanted = (stars, reason) => {
  const before = G.wanted;
  G.wanted = clamp(G.wanted + stars, 0, 5);
  G.police.decayTimer = 0;
  if (G.wanted > before) G.toast(reason || `Wanted level ${G.wanted}`);
};
G.damagePlayer = (amount, reason) => {
  if (G.mode !== 'play') return;
  G.health -= amount;
  if (G.health <= 0) {
    G.health = 0;
    G.wasted(reason);
  }
};
G.busted = () => {
  if (G.mode !== 'play') return;
  G.mode = 'busted';
  G.audio.bustedSting();
  showEndScreen('BUSTED', 'The Solmar PD caught you. You lose $100 bail and your heat is gone — but the debt is still there.');
  G.money = Math.max(0, G.money - 100);
  G.wanted = 0;
  clearPolice(G);
  G.save();
};
G.wasted = (reason) => {
  if (G.mode !== 'play') return;
  G.mode = 'wasted';
  G.audio.failBuzz();
  showEndScreen('WASTED', `${reason || 'You went down.'} The hospital patched you up for $150.`);
  G.money = Math.max(0, G.money - 150);
  G.health = 100;
  G.wanted = 0;
  clearPolice(G);
  G.save();
};
G.storyComplete = () => {
  G.mode = 'complete';
  G.audio.missionJingle();
  showEndScreen('DEBT PAID', 'Thorne\'s money is yours, the boat is waiting, and Solmar is wide open. Rico Vega is free — free roam continues, keep the fares coming.');
  G.save();
};
G.updateTrafficOnly = (dt) => updateTraffic(G, dt);
G.updatePedsOnly = (dt) => updatePedestrians(G, dt);
G.updatePoliceOnly = (dt) => updatePolice(G, dt);

G.city = buildCity(scene, rng);
G.player = createPlayerState(scene);
G.combat = createCombatState(scene);
G.missions = createMissionsState(scene);
G.hud = createHud();
spawnVehicles(G);
spawnPedestrians(G, 26);
spawnPickups(G, 12);
spawnShells(G);
spawnJumps(G);
spawnFareCustomer(G);

const startScreen = document.getElementById('start-screen');
const pauseScreen = document.getElementById('pause-screen');
const endScreen = document.getElementById('end-screen');
const endTitle = document.getElementById('end-title');
const endText = document.getElementById('end-text');

function showEndScreen(title, text) {
  endTitle.textContent = title;
  endText.textContent = text;
  endScreen.style.display = 'flex';
  G.hud.root.style.display = 'none';
  if (document.pointerLockElement) document.exitPointerLock();
}

function startGame(fromSave) {
  G.audio.init();
  if (fromSave) {
    const data = loadSave();
    if (data) {
      applySave(G, data);
      G.toast('Save loaded — welcome back to Solmar');
    }
  }
  G.mode = 'play';
  G.health = Math.max(G.health, 50);
  startScreen.style.display = 'none';
  endScreen.style.display = 'none';
  G.hud.root.style.display = 'block';
  snapCamera(G);
  if (!G.missions.active && !G.missions.storyDone) {
    startMission(G, G.missions.index);
  }
}

document.getElementById('start-btn').addEventListener('click', () => startGame(false));
const continueBtn = document.getElementById('continue-btn');
function refreshContinueButton() {
  continueBtn.style.display = loadSave() ? 'inline-block' : 'none';
}
continueBtn.addEventListener('click', () => startGame(true));
refreshContinueButton();
document.getElementById('resume-btn').addEventListener('click', () => {
  G.mode = 'play';
  pauseScreen.style.display = 'none';
  G.hud.root.style.display = 'block';
});
document.getElementById('restart-mission-btn').addEventListener('click', () => {
  restartMission(G);
  G.mode = 'play';
  pauseScreen.style.display = 'none';
  G.hud.root.style.display = 'block';
});
document.getElementById('quit-to-start-btn').addEventListener('click', () => {
  G.save();
  refreshContinueButton();
  G.mode = 'start';
  pauseScreen.style.display = 'none';
  startScreen.style.display = 'flex';
  G.hud.root.style.display = 'none';
});
document.getElementById('end-retry-btn').addEventListener('click', () => {
  // Respawn at Lena's garage, patched up, heat gone.
  G.player.pos.set(44, 0, -8);
  G.player.angle = Math.PI;
  if (G.player.car) {
    G.player.car.kind = 'parked';
    G.player.car = null;
    G.player.onFoot = true;
    G.player.mesh.visible = true;
  }
  endScreen.style.display = 'none';
  G.hud.root.style.display = 'block';
  G.mode = 'play';
  if (G.mode === 'complete') { /* story stays done */ }
  G.toast("Back on your feet at Lena's Garage.");
});

const shotActive = applyShotMode(G, params.shot);
if (shotActive) {
  snapCamera(G);
  warmUpWorld(G, 2);
  snapCamera(G);
}

const clock = new THREE.Clock();
let saveTimer = 0;

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (G.mode === 'play') {
    G.time += dt;
    G.gameHour = (G.gameHour + dt / 240) % 24;
    const input = G.input;
    // Pause.
    if (input.wasPressed('Escape')) {
      G.mode = 'paused';
      pauseScreen.style.display = 'flex';
      G.hud.root.style.display = 'none';
      if (document.pointerLockElement) document.exitPointerLock();
      G.save();
    }
    // Mute.
    if (input.wasPressed('KeyM')) {
      G.audio.setMuted(!G.audio.muted);
      G.toast(G.audio.muted ? 'Sound off (M to turn back on)' : 'Sound on');
    }
    // Radio station.
    if (input.wasPressed('KeyN')) {
      G.audio.cycleStation();
      const st = G.audio.currentStation();
      G.toast(`Radio: SOLMAR FM ${st.freq} · ${st.name} — '${st.track}'`);
    }
    // Restart the current mission.
    if (input.wasPressed('KeyR')) restartMission(G);

    // Enter / exit cars.
    if (input.wasPressed('KeyE')) {
      if (G.player.onFoot) {
        const car = nearestCar(G, 4);
        if (car) enterCar(G, car);
      } else {
        exitCar(G);
      }
    }
    // Combat.
    if (input.wasPressed('KeyF')) tryPunch(G);
    if (input.clicked || input.isDown('Space')) tryShoot(G);
    // Weapon slots 1–4.
    for (let i = 0; i < 4; i++) {
      if (input.wasPressed(`Digit${i + 1}`)) switchWeapon(G, i);
    }

    // Movement.
    if (G.player.onFoot) updatePlayerOnFoot(G, dt);
    else updatePlayerCar(G, dt);

    updateTraffic(G, dt);
    updatePedestrians(G, dt);
    updatePolice(G, dt);
    updateCombat(G, dt);
    updateMissions(G, dt);
    updatePickups(G, dt);
    updateShells(G, dt);
    updateFare(G, dt);

    // Slow health regen when nobody is after you.
    if (G.wanted === 0 && G.health < 100) G.health = Math.min(100, G.health + dt * 1.5);
    // Siren loudness by nearest police car.
    let siren = 0;
    for (const car of G.police.cars) {
      const d = Math.hypot(car.mesh.position.x - G.player.pos.x, car.mesh.position.z - G.player.pos.z);
      siren = Math.max(siren, clamp(1 - d / 90, 0, 1));
    }
    const speed = G.player.onFoot ? G.player.speed : Math.abs(G.player.car ? G.player.car.speed : 0);
    G.audio.update(speed, siren, dt);

    updateHud(G, dt);
    updateCamera(G, dt);

    // Autosave every 20 seconds.
    saveTimer += dt;
    if (saveTimer > 20) { saveTimer = 0; G.save(); }
  } else if (G.mode === 'paused') {
    if (G.input.wasPressed('Escape')) {
      G.mode = 'play';
      pauseScreen.style.display = 'none';
      G.hud.root.style.display = 'block';
    }
  } else if (G.mode === 'start') {
    G.time += dt;
    const t = G.time * 0.05;
    camera.position.set(Math.sin(t) * 90, 26, Math.cos(t) * 90);
    camera.lookAt(0, 6, 0);
    updateTraffic(G, dt);
    updatePedestrians(G, dt);
    renderer.render(scene, camera);
    G.input.endFrame();
    return;
  }

  renderer.render(scene, camera);
  G.input.endFrame();
}

frame();
window.__solmarReady = true;
// into the #status element (readable via --dump-dom).
if (new URLSearchParams(window.location.search).get('debug') === '1') {
  setInterval(() => {
    const car = G.player.car;
    document.getElementById('status').textContent = JSON.stringify({
      mode: G.mode,
      px: Math.round(G.player.pos.x), pz: Math.round(G.player.pos.z),
      angle: +G.player.angle.toFixed(2),
      cam: camera.position.toArray().map((v) => Math.round(v)),
      camYaw: +G.camYaw.toFixed(2),
      camPitch: +G.camPitch.toFixed(2),
      speed: car ? +car.speed.toFixed(1) : 0,
      wanted: G.wanted,
      police: G.police.cars.length,
      heli: G.police.heli ? [Math.round(G.police.heli.group.position.x), Math.round(G.police.heli.group.position.y), Math.round(G.police.heli.group.position.z)] : null,
      pc: G.police.cars.map((c) => [Math.round(c.mesh.position.x), Math.round(c.mesh.position.z), c.roadblock ? 'rb' : 'chase']),
      peds: G.peds.slice(0, 6).map((p) => [Math.round(p.pos.x), Math.round(p.pos.z)]),
      park: G.cars.filter((c) => c.kind === 'parked').slice(0, 4).map((c) => [Math.round(c.mesh.position.x), Math.round(c.mesh.position.z)]),
      traf: G.cars.filter((c) => c.kind === 'traffic').slice(0, 6).map((c) => [Math.round(c.mesh.position.x), Math.round(c.mesh.position.z)]),
      pickups: G.missions.pickups.filter((p) => p.mesh.visible).map((p) => [Math.round(p.mesh.position.x), Math.round(p.mesh.position.z)]),
      fareMarker: G.missions.fareMarker && G.missions.fareMarker.visible ? [Math.round(G.missions.fareMarker.position.x), Math.round(G.missions.fareMarker.position.z)] : null,
      meshes: scene.children.length,
      roadblock: G.police.cars.filter((c) => c.roadblock).length,
      rb: G.police.cars.filter((c) => c.roadblock).map((c) => [Math.round(c.mesh.position.x), Math.round(c.mesh.position.z)]),
      mi: G.missions.index, ms: G.missions.step, active: G.missions.active, storyDone: G.missions.storyDone,
      tail: G.missions.tail ? [Math.round(G.missions.tail.car.mesh.position.x), Math.round(G.missions.tail.car.mesh.position.z), +G.missions.tail.hold.toFixed(1), +G.missions.tail.spot.toFixed(1), +G.missions.tail.lose.toFixed(1)] : null,
      layLow: G.missions.layLow ? [+G.missions.layLow.remain.toFixed(1), G.missions.layLow.lastWanted] : null,
      hunt: G.missions.hunt ? [Math.round(G.missions.hunt.ped.mesh.position.x), Math.round(G.missions.hunt.ped.mesh.position.z), Math.round(G.missions.hunt.ped.health), G.missions.hunt.ped.state, +G.missions.hunt.lose.toFixed(1)] : null,
      race: G.missions.race ? [G.missions.race.idx, +G.missions.timer.toFixed(1)] : null,
      rival: G.missions.rival ? [G.missions.rival.idx, Math.round(G.missions.rival.car.mesh.position.x), Math.round(G.missions.rival.car.mesh.position.z)] : null,
      weapon: G.combat.weapon,
      mag: G.combat.mags[G.combat.weapon],
      reload: +G.combat.reloadTimer.toFixed(2),
      rep: G.rep,
      shells: G.missions.shellsGot, jumps: G.missions.jumpsGot,
      seen: G.police.seen, decay: +G.police.decayTimer.toFixed(1),
      carY: car ? +car.mesh.position.y.toFixed(2) : 0,
      airT: car ? +((car.airT || 0)).toFixed(2) : 0,
      carName: G.player.car ? G.player.car.name : null,
      carCond: G.player.car ? Math.round(G.player.car.condition) : null,
      obj: document.getElementById('objective-text') ? document.getElementById('objective-text').textContent : '',
      objDist: document.getElementById('objective-dist') ? document.getElementById('objective-dist').textContent : '',
      time: +G.time.toFixed(1),
    });
  }, 500);
}
