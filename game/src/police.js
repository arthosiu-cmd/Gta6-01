import * as THREE from 'three';
import { buildCarMesh } from './vehicles.js';
import { collideBuildings, clampToCity, nearestRoadCoord } from './city.js';
import { clamp, dist2D, turnToward } from './utils.js';

export function createPoliceState() {
  return {
    cars: [],
    foot: [],
    bustTimer: 0,
    quietTimer: 0,
    decayTimer: 0,
  };
}

export function spawnPoliceCarAt(G, x, z, speed = 12) {
  const mesh = buildCarMesh(0xf0f0f0, true);
  mesh.position.set(x, 0, z);
  G.scene.add(mesh);
  const car = {
    mesh,
    angle: Math.atan2(G.player.pos.x - x, G.player.pos.z - z),
    speed, kind: 'police', health: 100,
    sirenPhase: G.rng.range(0, 1),
  };
  G.police.cars.push(car);
  G.cars.push(car);
  return car;
}

export function spawnRoadblock(G) {
  if (G.police.cars.some((c) => c.roadblock)) return null;
  const fx = Math.sin(G.player.angle), fz = Math.cos(G.player.angle);
  const alongX = Math.abs(fx) > Math.abs(fz);
  const road = alongX ? nearestRoadCoord(G.player.pos.z) : nearestRoadCoord(G.player.pos.x);
  const offRoad = alongX ? Math.abs(G.player.pos.z - road) : Math.abs(G.player.pos.x - road);
  if (offRoad > 10) return null;
  const ahead = 45;
  const ax = alongX ? clampToCity(G.player.pos.x + fx * ahead) : road;
  const az = alongX ? road : clampToCity(G.player.pos.z + fz * ahead);
  const angle = alongX ? 0 : Math.PI / 2;
  const cars = [];
  for (const side of [-3.5, 3.5]) {
    const mesh = buildCarMesh(0xf0f0f0, true);
    const x = alongX ? ax : road + side;
    const z = alongX ? road + side : az;
    mesh.position.set(x, 0, z);
    mesh.rotation.y = angle;
    G.scene.add(mesh);
    const car = {
      mesh, angle, speed: 0, kind: 'police', health: 100,
      sirenPhase: G.rng.range(0, 1), roadblock: true,
    };
    G.police.cars.push(car);
    G.cars.push(car);
    cars.push(car);
  }
  G.toast('Roadblock ahead!');
  return cars;
}

function removeRoadblock(G) {
  const rb = G.police.cars.filter((c) => c.roadblock);
  if (rb.length === 0) return;
  for (const car of rb) {
    G.scene.remove(car.mesh);
    const i = G.cars.indexOf(car);
    if (i >= 0) G.cars.splice(i, 1);
  }
  G.police.cars = G.police.cars.filter((c) => !c.roadblock);
}

function spawnPoliceCar(G) {
  const angle = G.rng.range(0, Math.PI * 2);
  const dist = 42;
  const x = clampToCity(G.player.pos.x + Math.cos(angle) * dist);
  const z = clampToCity(G.player.pos.z + Math.sin(angle) * dist);
  const mesh = buildCarMesh(0xf0f0f0, true);
  mesh.position.set(x, 0, z);
  G.scene.add(mesh);
  const car = {
    mesh, angle: Math.atan2(G.player.pos.x - x, G.player.pos.z - z),
    speed: 0, kind: 'police', health: 100,
    sirenPhase: G.rng.range(0, 1),
  };
  G.police.cars.push(car);
  G.cars.push(car);
  return car;
}

function spawnFootCop(G) {
  const group = new THREE.Group();
  const navy = new THREE.MeshLambertMaterial({ color: 0x1c2f5e });
  const skin = new THREE.MeshLambertMaterial({ color: 0xc98d64 });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.62, 0.3), navy);
  torso.position.y = 1.11;
  group.add(torso);
  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.8, 0.24), new THREE.MeshLambertMaterial({ color: 0x141c2e }));
  legs.position.y = 0.4;
  group.add(legs);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.32), skin);
  head.position.y = 1.62;
  group.add(head);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.1, 0.36), navy);
  cap.position.y = 1.84;
  group.add(cap);
  group.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  const angle = G.rng.range(0, Math.PI * 2);
  const x = clampToCity(G.player.pos.x + Math.cos(angle) * 25);
  const z = clampToCity(G.player.pos.z + Math.sin(angle) * 25);
  group.position.set(x, 0, z);
  G.scene.add(group);
  const cop = {
    mesh: group, pos: group.position, angle: 0,
    speed: 0, health: 100, punchTimer: 0, state: 'chase',
  };
  G.police.foot.push(cop);
  return cop;
}

export function updatePolice(G, dt) {
  const wanted = G.wanted;
  if (wanted <= 0) {
    // Stand down: remove units once the heat is fully gone.
    if (G.police.cars.length > 0 || G.police.foot.length > 0) {
      G.police.quietTimer += dt;
      if (G.police.quietTimer > 6) {
        for (const car of G.police.cars) {
          G.scene.remove(car.mesh);
          const i = G.cars.indexOf(car);
          if (i >= 0) G.cars.splice(i, 1);
        }
        for (const cop of G.police.foot) G.scene.remove(cop.mesh);
        G.police.cars = [];
        G.police.foot = [];
        G.police.quietTimer = 0;
      }
    }
    return;
  }
  G.police.quietTimer = 0;
  if (wanted >= 3) spawnRoadblock(G);
  else removeRoadblock(G);
  const wantCars = Math.min(wanted + 1, 5);
  const wantFoot = G.player.onFoot ? Math.min(wanted, 3) : 0;
  while (G.police.cars.length < wantCars) spawnPoliceCar(G);
  while (G.police.foot.length < wantFoot) spawnFootCop(G);

  for (const car of G.police.cars) {
    // light bars still flash so they read as police.
    if (car.roadblock) {
      const bar = car.mesh.getObjectByName('lightbar');
      if (bar) bar.material.color.setHex(Math.floor(G.time * 3) % 2 === 0 ? 0xff2a2a : 0x2a6aff);
      continue;
    }
    const dx = G.player.pos.x - car.mesh.position.x;
    const dz = G.player.pos.z - car.mesh.position.z;
    const dist = Math.hypot(dx, dz) || 1;
    const targetAngle = Math.atan2(dx, dz);
    car.angle = turnToward(car.angle, targetAngle, 2.2 * dt);
    const topSpeed = 24 + wanted * 1.5;
    car.speed = Math.min(car.speed + 10 * dt, topSpeed);
    let nx = car.mesh.position.x + Math.sin(car.angle) * car.speed * dt;
    let nz = car.mesh.position.z + Math.cos(car.angle) * car.speed * dt;
    const fixed = collideBuildings(G.city, nx, nz, 2.2);
    if (fixed.hit) car.speed *= 0.6;
    car.mesh.position.x = clampToCity(fixed.x);
    car.mesh.position.z = clampToCity(fixed.z);
    car.mesh.rotation.y = car.angle;
    // Flash the light bar red/blue.
    const bar = car.mesh.getObjectByName('lightbar');
    if (bar) bar.material.color.setHex(Math.floor(G.time * 3) % 2 === 0 ? 0xff2a2a : 0x2a6aff);
    car.ramTimer = Math.max(0, (car.ramTimer || 0) - dt);
    if (dist < 3.2 && car.ramTimer <= 0) {
      if (G.player.onFoot) G.damagePlayer(25 * dt * 4, 'Run over by a police cruiser');
      else if (car.speed > 6) {
        G.damagePlayer(10, 'A police cruiser rammed your car');
        car.speed *= 0.4;
        car.ramTimer = 1.2;
      }
    }
  }

  let anyClose = false;
  for (const cop of G.police.foot) {
    if (cop.state === 'down') continue;
    const dx = G.player.pos.x - cop.pos.x;
    const dz = G.player.pos.z - cop.pos.z;
    const dist = Math.hypot(dx, dz) || 1;
    cop.angle = Math.atan2(dx, dz);
    cop.speed = 6.4;
    const nx = cop.pos.x + Math.sin(cop.angle) * cop.speed * dt;
    const nz = cop.pos.z + Math.cos(cop.angle) * cop.speed * dt;
    const fixed = collideBuildings(G.city, nx, nz, 0.6);
    cop.pos.x = clampToCity(fixed.x);
    cop.pos.z = clampToCity(fixed.z);
    cop.mesh.position.copy(cop.pos);
    cop.mesh.rotation.y = cop.angle;
    if (dist < 1.8 && G.player.onFoot) {
      anyClose = true;
      cop.punchTimer -= dt;
      if (cop.punchTimer <= 0) {
        cop.punchTimer = 1.1;
        G.damagePlayer(12, 'A foot cop tackled you');
      }
    }
  }
  if (anyClose && G.player.onFoot) {
    G.police.bustTimer += dt;
    if (G.police.bustTimer > 1.4) G.busted();
  } else {
    G.police.bustTimer = Math.max(0, G.police.bustTimer - dt * 2);
  }

  G.police.decayTimer += dt;
  if (G.police.decayTimer > 25) {
    G.police.decayTimer = 15;
    if (G.wanted > 0) {
      G.wanted--;
      G.toast(`Heat dying down — wanted level ${G.wanted}`);
    }
  }
}

// A foot cop going down (punched or shot).
export function hurtCop(G, cop, damage) {
  cop.health -= damage;
  if (cop.health <= 0) {
    cop.state = 'down';
    cop.mesh.rotation.x = -Math.PI / 2;
    cop.mesh.position.y = 0.3;
    G.addWanted(1, 'You took down an officer — the whole city is after you now');
    return true;
  }
  return false;
}

export function clearPolice(G) {
  for (const car of G.police.cars) {
    G.scene.remove(car.mesh);
    const i = G.cars.indexOf(car);
    if (i >= 0) G.cars.splice(i, 1);
  }
  for (const cop of G.police.foot) G.scene.remove(cop.mesh);
  G.police.cars = [];
  G.police.foot = [];
  G.police.bustTimer = 0;
  G.police.quietTimer = 0;
}
