import * as THREE from 'three';
import { hurtPed, scarePeds } from './pedestrians.js';
import { hurtCop } from './police.js';
import { dist2D } from './utils.js';

// Weapon slots: 1 FISTS (melee), 2 P9 pistol, 3 SMG, 4 12G shotgun.
// Same infinite-reserve model as the pistol: a magazine count that
// refills on reload (no ammo-pickup economy). Damage/rate/spread are
// per weapon; the shotgun fires 5 pellets with fixed (deterministic)
// spread offsets, never rng.
export const WEAPONS = [
  { key: '1', name: 'FISTS', mag: Infinity, damage: 30, rate: 0.45, pellets: 1, spread: 0, melee: true },
  { key: '2', name: 'P9', mag: 12, damage: 34, rate: 0.28, pellets: 1, spread: 0 },
  { key: '3', name: 'SMG', mag: 30, damage: 18, rate: 0.09, pellets: 1, spread: 0.05 },
  { key: '4', name: '12G', mag: 6, damage: 14, rate: 0.8, pellets: 5, spread: 0.12 },
];

export function createCombatState(scene) {
  const flash = new THREE.PointLight(0xffd27a, 0, 18);
  scene.add(flash);
  const tracerMat = new THREE.LineBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0 });
  const tracerGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const tracer = new THREE.Line(tracerGeo, tracerMat);
  tracer.frustumCulled = false;
  scene.add(tracer);
  return {
    flash, tracer, tracerTimer: 0,
    punchTimer: 0,
    shootTimer: 0,
    punchAnim: 0,
    weapon: 1,
    mags: WEAPONS.map((w) => w.mag),
    reloadTimer: 0,
  };
}

export function switchWeapon(G, index) {
  const c = G.combat;
  if (index < 0 || index >= WEAPONS.length || index === c.weapon) return false;
  c.weapon = index;
  c.reloadTimer = 0;
  const w = WEAPONS[index];
  const mag = Number.isFinite(w.mag) ? `${c.mags[index]}/${w.mag}` : '∞';
  G.toast(`${w.name} ready — ${mag}`);
  return true;
}

export function magText(G) {
  const c = G.combat;
  const w = WEAPONS[c.weapon];
  if (c.reloadTimer > 0) return 'RELOADING';
  if (!Number.isFinite(w.mag)) return '∞';
  return `${c.mags[c.weapon]}/${w.mag}`;
}

function nearestTarget(G, range) {
  const p = G.player.pos;
  const fx = Math.sin(G.player.angle), fz = Math.cos(G.player.angle);
  let best = null, bd = range;
  const consider = (obj, kind) => {
    const d = dist2D(p.x, p.z, obj.pos.x, obj.pos.z);
    if (d >= bd) return;
    const dx = obj.pos.x - p.x, dz = obj.pos.z - p.z;
    const dot = (dx * fx + dz * fz) / (d || 1);
    if (dot < 0.2) return;
    bd = d; best = { obj, kind };
  };
  for (const ped of G.peds) {
    if (ped.state === 'down' || ped.state === 'gone' || ped.state === 'riding') continue;
    consider(ped, 'ped');
  }
  for (const cop of G.police.foot) {
    if (cop.state === 'down') continue;
    consider(cop, 'cop');
  }
  return best;
}

export function tryPunch(G) {
  const c = G.combat;
  if (c.punchTimer > 0) return;
  c.punchTimer = 0.45;
  c.punchAnim = 0.25;
  G.audio.punch();
  const target = nearestTarget(G, 2.4);
  if (target) {
    // went down (hurtPed/hurtCop already raised it then) — no
    // double-count. Without the exception the hunt would be
    // after one punch, before the other three could land).
    const isHunt = target.kind === 'ped' && G.missions && G.missions.hunt && G.missions.hunt.ped === target.obj;
    let down = false;
    if (target.kind === 'ped') down = hurtPed(G, target.obj, 30, G.player.pos.x, G.player.pos.z);
    else down = hurtCop(G, target.obj, 30);
    if (!down && !isHunt) G.addWanted(1, 'You assaulted someone — the police were called');
    scarePeds(G, G.player.pos.x, G.player.pos.z, 14);
    G.toast(isHunt ? 'Clean hit — the enforcer is going down!' : (target.kind === 'ped' ? 'You clocked a pedestrian!' : 'You hit a cop!'));
  }
}

export function tryShoot(G) {
  const c = G.combat;
  if (c.shootTimer > 0 || c.reloadTimer > 0) return;
  const w = WEAPONS[c.weapon];
  if (w.melee) { tryPunch(G); return; }
  if (Number.isFinite(w.mag) && c.mags[c.weapon] <= 0) {
    c.reloadTimer = 0.9;
    G.audio.gunshot();
    G.toast('Reloading…');
    return;
  }
  c.shootTimer = w.rate;
  if (Number.isFinite(w.mag)) c.mags[c.weapon]--;
  G.audio.gunshot();
  const origin = G.player.pos.clone();
  origin.y += 1.4;
  const baseDir = new THREE.Vector3();
  G.camera.getWorldDirection(baseDir);
  const up = new THREE.Vector3(0, 1, 0);
  let hitPoint = origin.clone().add(baseDir.clone().multiplyScalar(60));
  let bestD = 60;
  let hitKind = null;
  // One pellet per loop: the shotgun's 5 pellets fan out with fixed
  // offsets (deterministic — no rng), the SMG/pistol fire straight.
  for (let i = 0; i < w.pellets; i++) {
    const off = (i - (w.pellets - 1) / 2) * w.spread;
    const dir = baseDir.clone().applyAxisAngle(up, off);
    const end = origin.clone().add(dir.clone().multiplyScalar(60));
    let pelletHit = end;
    let pelletKind = null;
    let pelletD = 60;
    const checkTarget = (obj, kind) => {
      const to = new THREE.Vector3(obj.pos.x - origin.x, 1.2 - origin.y, obj.pos.z - origin.z);
      const along = to.dot(dir);
      if (along < 0 || along > 60) return;
      const perp = to.clone().addScaledVector(dir, -along).length();
      if (perp < 1.6 && along < pelletD) {
        pelletD = along;
        pelletHit = origin.clone().addScaledVector(dir, along);
        pelletKind = { obj, kind };
      }
    };
    for (const ped of G.peds) {
      if (ped.state === 'down' || ped.state === 'gone' || ped.state === 'riding') continue;
      checkTarget(ped, 'ped');
    }
    for (const cop of G.police.foot) {
      if (cop.state === 'down') continue;
      checkTarget(cop, 'cop');
    }
    if (pelletKind) {
      if (pelletKind.kind === 'ped') hurtPed(G, pelletKind.obj, w.damage, G.player.pos.x, G.player.pos.z);
      else hurtCop(G, pelletKind.obj, w.damage);
      if (pelletD < bestD) { bestD = pelletD; hitPoint = pelletHit; hitKind = pelletKind; }
    }
  }
  c.flash.position.copy(origin);
  c.flash.intensity = 60;
  const positions = c.tracer.geometry.attributes.position;
  positions.setXYZ(0, origin.x, origin.y, origin.z);
  positions.setXYZ(1, hitPoint.x, hitPoint.y, hitPoint.z);
  positions.needsUpdate = true;
  c.tracer.material.opacity = 0.9;
  c.tracerTimer = 0.08;
  // is loud enough for someone to call the police.
  const hitHunt = hitKind && hitKind.kind === 'ped' && G.missions && G.missions.hunt && G.missions.hunt.ped === hitKind.obj;
  if (!hitHunt) G.addWanted(1, 'Shots fired — someone called the police');
  scarePeds(G, G.player.pos.x, G.player.pos.z, 30);
}

export function updateCombat(G, dt) {
  const c = G.combat;
  c.punchTimer = Math.max(0, c.punchTimer - dt);
  c.shootTimer = Math.max(0, c.shootTimer - dt);
  if (c.reloadTimer > 0) {
    c.reloadTimer -= dt;
    if (c.reloadTimer <= 0) {
      c.reloadTimer = 0;
      const w = WEAPONS[c.weapon];
      if (Number.isFinite(w.mag)) c.mags[c.weapon] = w.mag;
    }
  }
  c.punchAnim = Math.max(0, c.punchAnim - dt);
  c.flash.intensity = Math.max(0, c.flash.intensity - dt * 500);
  if (c.tracerTimer > 0) {
    c.tracerTimer -= dt;
    if (c.tracerTimer <= 0) c.tracer.material.opacity = 0;
  }
  // Punch swing: right arm raises briefly.
  const armR = G.player.mesh.getObjectByName('armR');
  if (armR) armR.rotation.x = c.punchAnim > 0 ? -1.4 : 0;
}
