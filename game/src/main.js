// main.js — SOLMAR bootstrap + game loop. Builds the world (city, cars,
// pedestrians, police, missions, HUD, audio) and runs the frame loop:
// input → player/vehicle → traffic → pedestrians → police → combat →
// missions → HUD → camera. Screenshot modes stage scenes via shots.js.
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
import { createCombatState, tryPunch, tryShoot, updateCombat } from './combat.js';
import { createMissionsState, startMission, updateMissions, restartMission, spawnPickups, updatePickups, spawnFareCustomer, updateFare } from './missions.js';
import { createHud, updateHud } from './hud.js';
import { applyShotMode, warmUpWorld } from './shots.js';

const params = readUrlParams();
const rng = makeRng(params.seed);

// --- Renderer / scene ---------------------------------------------------
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

// --- Game state ---------------------------------------------------------
const G = {
  scene, camera, renderer, rng, seed: params.seed,
  time: 0,
  gameHour: 9.5, // sunny morning in Solmar
  mode: 'start', // 'start' | 'play' | 'paused' | 'busted' | 'wasted' | 'complete'
  money: 250,
  health: 100,
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

// Shared helpers the systems call back into (kept on G to avoid cycles).
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
// Warm-up wrappers used by shots.js (advance traffic/peds/police only).
G.updateTrafficOnly = (dt) => updateTraffic(G, dt);
G.updatePedsOnly = (dt) => updatePedestrians(G, dt);
G.updatePoliceOnly = (dt) => updatePolice(G, dt);

// --- Build the world ----------------------------------------------------
G.city = buildCity(scene, rng);
G.player = createPlayerState(scene);
G.combat = createCombatState(scene);
G.missions = createMissionsState(scene);
G.hud = createHud();
spawnVehicles(G);
spawnPedestrians(G, 26);
spawnPickups(G, 12);
spawnFareCustomer(G);

// --- Screens ------------------------------------------------------------
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
  // Show Continue whenever a save exists. Checked live, not just at
  // page load — a save made in this session must show it at once.
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

// --- Screenshot staging -------------------------------------------------
const shotActive = applyShotMode(G, params.shot);
if (shotActive) {
  snapCamera(G);
  warmUpWorld(G, 2);
  snapCamera(G); // re-snap: warm-up moved traffic/police, not the player
}

// --- Frame loop ---------------------------------------------------------
const clock = new THREE.Clock();
let saveTimer = 0;

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (G.mode === 'play') {
    G.time += dt;
    G.gameHour = (G.gameHour + dt / 240) % 24; // a full day in 4 minutes of play
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

    // Movement.
    if (G.player.onFoot) updatePlayerOnFoot(G, dt);
    else updatePlayerCar(G, dt);

    updateTraffic(G, dt);
    updatePedestrians(G, dt);
    updatePolice(G, dt);
    updateCombat(G, dt);
    updateMissions(G, dt);
    updatePickups(G, dt);
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
    // Slow cinematic orbit over the plaza behind the start screen.
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
// Signal for automated screenshots: the first frame has rendered.
window.__solmarReady = true;
// Debug readout for headless verification: ?debug=1 writes live state
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
      speed: car ? +car.speed.toFixed(1) : 0,
      wanted: G.wanted,
      police: G.police.cars.length,
      time: +G.time.toFixed(1),
    });
  }, 500);
}
