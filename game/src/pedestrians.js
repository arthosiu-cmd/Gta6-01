import * as THREE from 'three';
import { ROAD_COORDS, collideBuildings, clampToCity } from './city.js';
import { clamp, dist2D } from './utils.js';

const SHIRTS = [0xe8e8e8, 0xc83a2e, 0x2e7fc8, 0xe8c832, 0x3a9e4e, 0xd86a2e, 0x7a4ec8, 0xe8a8c8];
const PANTS = [0x2c3a4e, 0x3a3a3a, 0x5a4a3a, 0x2e4e3a];

function makePedMesh(rng) {
  const group = new THREE.Group();
  const shirt = new THREE.MeshLambertMaterial({ color: SHIRTS[rng.int(0, SHIRTS.length - 1)] });
  const pants = new THREE.MeshLambertMaterial({ color: PANTS[rng.int(0, PANTS.length - 1)] });
  const skin = new THREE.MeshLambertMaterial({ color: [0xc98d64, 0x8a5a3a, 0xe8b890][rng.int(0, 2)] });
  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.75, 0.22), pants);
  legs.position.y = 0.38;
  group.add(legs);
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.28), shirt);
  torso.position.y = 1.02;
  group.add(torso);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 0.28), skin);
  head.position.y = 1.5;
  group.add(head);
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.32), new THREE.MeshLambertMaterial({ color: rng.chance(0.5) ? 0x1a1210 : 0x6a4a2a }));
  hair.position.y = 1.7;
  group.add(hair);
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.14), shirt);
  armL.position.set(-0.32, 1.02, 0);
  armL.name = 'armL';
  group.add(armL);
  const armR = armL.clone();
  armR.position.x = 0.32;
  armR.name = 'armR';
  group.add(armR);
  group.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return group;
}

function randomSidewalkTarget(rng) {
  const road = ROAD_COORDS[rng.int(0, ROAD_COORDS.length - 1)];
  const along = rng.range(-256, 256);
  if (rng.chance(0.5)) return { x: road + 8, z: along };
  return { x: along, z: road + 8 };
}

export function spawnPedestrians(G, count = 24) {
  G.peds = [];
  for (let i = 0; i < count; i++) {
    const mesh = makePedMesh(G.rng);
    const start = randomSidewalkTarget(G.rng);
    mesh.position.set(start.x, 0, start.z);
    G.scene.add(mesh);
    G.peds.push({
      mesh,
      pos: mesh.position,
      angle: G.rng.range(0, Math.PI * 2),
      target: randomSidewalkTarget(G.rng),
      speed: G.rng.range(1.0, 1.8),
      walkPhase: G.rng.range(0, 6),
      state: 'walk',
      fleeTimer: 0,
      fleeFrom: null,
      health: 100,
      downTimer: 0,
      scared: false,
    });
  }
  return G.peds;
}

export function scarePeds(G, x, z, radius) {
  for (const ped of G.peds) {
    if (ped.state === 'down' || ped.state === 'riding') continue;
    if (dist2D(ped.pos.x, ped.pos.z, x, z) < radius) {
      ped.state = 'flee';
      ped.fleeTimer = 3;
      ped.fleeFrom = { x, z };
    }
  }
}

export function updatePedestrians(G, dt) {
  for (const ped of G.peds) {
    if (ped.state === 'down') {
      ped.downTimer -= dt;
      ped.mesh.rotation.x = damp(ped.mesh.rotation.x, -Math.PI / 2, 4, dt);
      if (ped.downTimer <= 0) {
        ped.mesh.visible = false;
        ped.state = 'gone';
      }
      continue;
    }
    if (ped.state === 'gone' || ped.state === 'riding') continue;
    let tx, tz, speed;
    if (ped.state === 'flee') {
      ped.fleeTimer -= dt;
      const dx = ped.pos.x - ped.fleeFrom.x;
      const dz = ped.pos.z - ped.fleeFrom.z;
      const len = Math.hypot(dx, dz) || 1;
      tx = ped.pos.x + (dx / len) * 20;
      tz = ped.pos.z + (dz / len) * 20;
      speed = 5.5;
      if (ped.fleeTimer <= 0) { ped.state = 'walk'; ped.target = randomSidewalkTarget(G.rng); }
    } else {
      tx = ped.target.x; tz = ped.target.z;
      speed = ped.speed;
      if (dist2D(ped.pos.x, ped.pos.z, tx, tz) < 2) {
        ped.target = randomSidewalkTarget(G.rng);
      }
    }
    const dx = tx - ped.pos.x, dz = tz - ped.pos.z;
    const len = Math.hypot(dx, dz);
    if (len > 0.1) {
      const targetAngle = Math.atan2(dx, dz);
      let diff = targetAngle - ped.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      ped.angle += clamp(diff, -3 * dt, 3 * dt);
      const nx = ped.pos.x + Math.sin(ped.angle) * speed * dt;
      const nz = ped.pos.z + Math.cos(ped.angle) * speed * dt;
      const fixed = collideBuildings(G.city, nx, nz, 0.6);
      ped.pos.x = clampToCity(fixed.x);
      ped.pos.z = clampToCity(fixed.z);
      ped.walkPhase += dt * speed * 3;
    }
    ped.mesh.position.copy(ped.pos);
    ped.mesh.rotation.y = ped.angle;
    const swing = Math.sin(ped.walkPhase) * (ped.state === 'flee' ? 0.8 : 0.45);
    ped.mesh.getObjectByName('armL').rotation.x = swing;
    ped.mesh.getObjectByName('armR').rotation.x = -swing;
  }
  // Remove the ones that left the scene.
  for (let i = G.peds.length - 1; i >= 0; i--) {
    if (G.peds[i].state === 'gone') {
      G.scene.remove(G.peds[i].mesh);
      G.peds.splice(i, 1);
    }
  }
}

export function hurtPed(G, ped, damage, fromX, fromZ) {
  ped.health -= damage;
  if (ped.health <= 0) {
    ped.state = 'down';
    ped.downTimer = 6;
    const isHunt = G.missions && G.missions.hunt && G.missions.hunt.ped === ped;
    if (!isHunt) G.addWanted(1, 'A pedestrian went down — the city saw it');
    return true;
  }
  ped.state = 'flee';
  ped.fleeTimer = 4;
  ped.fleeFrom = { x: fromX, z: fromZ };
  return false;
}

function damp(current, target, rate, dt) {
  return current + (target - current) * (1 - Math.exp(-rate * dt));
}
