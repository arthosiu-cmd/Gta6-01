import * as THREE from 'three';
import { ROAD_COORDS, nsGreen, nearestRoadCoord, collideBuildings, clampToCity } from './city.js';
import { clamp, damp, turnToward, dist2D } from './utils.js';

const CAR_COLORS = [0xc83a2e, 0x2e7fc8, 0xe8c832, 0x3a9e4e, 0xe8e8e8, 0x2c2f33, 0xd86a2e, 0x7a4ec8];
// Model name is fixed by paint colour, so the same car always has the
// same name (original names — no leader's model names).
const CAR_NAMES = ['Comet GT', 'Vagabond LX', 'Sunrunner S', 'Marlin Coupe', 'Paseo Classic', 'Dune Runner', 'Falco Sport', 'Breeze Cabrio'];

export function buildCarMesh(color, isPolice = false) {
  const group = new THREE.Group();
  const paint = new THREE.MeshLambertMaterial({ color: isPolice ? 0xf0f0f0 : color });
  const dark = new THREE.MeshLambertMaterial({ color: 0x1c2733 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2, 0.62, 4.4), paint);
  body.position.y = 0.55;
  group.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.55, 2.2), dark);
  cabin.position.set(0, 1.1, -0.2);
  group.add(cabin);
  const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.3, 10);
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x141414 });
  for (const [x, z] of [[-0.95, 1.4], [0.95, 1.4], [-0.95, -1.4], [0.95, -1.4]]) {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.36, z);
    group.add(wheel);
  }
  if (isPolice) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.2, 4.42), new THREE.MeshLambertMaterial({ color: 0x1c4ed8 }));
    stripe.position.y = 0.62;
    group.add(stripe);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.16, 0.3), new THREE.MeshBasicMaterial({ color: 0xff2a2a }));
    bar.position.set(0, 1.48, -0.2);
    bar.name = 'lightbar';
    group.add(bar);
  }
  group.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return group;
}

function makeCar(G, x, z, angle, color, kind) {
  const mesh = buildCarMesh(color, kind === 'police');
  mesh.position.set(x, 0, z);
  mesh.rotation.y = angle;
  G.scene.add(mesh);
  return {
    mesh, angle, speed: 0, kind,
    color, name: CAR_NAMES[CAR_COLORS.indexOf(color)],
    // CONDITION %: 100 fresh, falls with collisions/rams, resets to
    // 100 when you steal a fresh car (enterCar). condTimer rate-limits
    // the damage so one long scrape is one hit, not one per frame.
    condition: 100, condTimer: 0,
    // Stunt-jump air state (player car only): y/vy integrate in
    // updatePlayerCar; airT is the airborne time of the current hop.
    y: 0, vy: 0, airT: 0, jumpCd: 0, jumpSpot: null,
    // Traffic AI state:
    axis: 'x', fixed: 0, along: 0, dir: 1, cruise: G.rng.range(7, 11),
    stopped: false, driver: null,
    health: 100,
  };
}

export function spawnVehicles(G) {
  G.cars = [];
  for (let i = 0; i < 14; i++) {
    const axis = G.rng.chance(0.5) ? 'x' : 'z';
    const fixed = G.rng.pick(ROAD_COORDS);
    const along = G.rng.range(-256, 256);
    const dir = G.rng.chance(0.5) ? 1 : -1;
    const car = makeCar(G, 0, 0, 0, G.rng.pick(CAR_COLORS), 'traffic');
    car.axis = axis; car.fixed = fixed; car.along = along; car.dir = dir;
    car.speed = car.cruise;
    placeTrafficCar(car);
    G.cars.push(car);
  }
  for (let i = 0; i < 8; i++) {
    const road = G.rng.pick(ROAD_COORDS);
    const along = G.rng.range(-240, 240);
    const side = G.rng.chance(0.5) ? 1 : -1;
    const x = side > 0 ? road + 9 : along;
    const z = side > 0 ? along : road + 9;
    const angle = side > 0 ? 0 : Math.PI / 2;
    const car = makeCar(G, x, z, angle, G.rng.pick(CAR_COLORS), 'parked');
    car.speed = 0;
    G.cars.push(car);
  }
  return G.cars;
}

function placeTrafficCar(car) {
  const lane = car.dir > 0 ? 3 : -3;
  if (car.axis === 'x') {
    car.mesh.position.set(car.along, 0, car.fixed + lane);
    car.angle = car.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
  } else {
    car.mesh.position.set(car.fixed + lane, 0, car.along);
    car.angle = car.dir > 0 ? 0 : Math.PI;
  }
  car.mesh.rotation.y = car.angle;
}

function nextIntersection(car) {
  const step = 64;
  if (car.dir > 0) return (Math.floor(car.along / step) + 1) * step;
  return Math.ceil(car.along / step - 1) * step;
}

export function updateTraffic(G, dt) {
  for (const car of G.cars) {
    if (car.kind !== 'traffic') continue;
    let target = car.cruise;
    const ix = nextIntersection(car);
    const distToLight = Math.abs(ix - car.along);
    if (distToLight < 14 && distToLight > 0) {
      const lightIx = car.axis === 'x' ? ix : car.fixed;
      const lightIz = car.axis === 'x' ? car.fixed : ix;
      const green = car.axis === 'x' ? !nsGreen(G.city, lightIx, lightIz, G.time) : nsGreen(G.city, lightIx, lightIz, G.time);
      if (!green) target = distToLight < 7 ? 0 : Math.min(target, distToLight * 0.5);
    }
    for (const other of G.cars) {
      if (other === car || other.kind === 'parked') continue;
      if (other.axis !== car.axis || other.fixed !== car.fixed || other.dir !== car.dir) continue;
      const gap = (other.along - car.along) * car.dir;
      if (gap > 0 && gap < 10) target = Math.min(target, Math.max(0, (gap - 6) * 0.8));
    }
    const prevAlong = car.along;
    car.speed = damp(car.speed, target, 3, dt);
    car.along += car.dir * car.speed * dt;
    const prevCell = Math.floor(prevAlong / 64);
    const newCell = Math.floor(car.along / 64);
    if (!car.noTurn && prevCell !== newCell && Math.abs(car.along % 64) < 4 && G.rng.chance(0.25)) {
      turnCar(car);
    }
    if (car.along > 262) { car.along = -262; }
    if (car.along < -262) { car.along = 262; }
    placeTrafficCar(car);
  }
}

function turnCar(car) {
  const ix = nearestRoadCoord(car.along);
  if (Math.abs(car.along - ix) > 4) return;
  const oldFixed = car.fixed;
  if (car.axis === 'x') {
    car.axis = 'z'; car.fixed = ix; car.along = oldFixed;
  } else {
    car.axis = 'x'; car.fixed = ix; car.along = oldFixed;
  }
  placeTrafficCar(car);
}

// Arcade driving for the car the player is in.
export function updatePlayerCar(G, dt) {
  const car = G.player.car;
  if (!car) return;
  const input = G.input;
  car.condTimer = Math.max(0, (car.condTimer || 0) - dt);
  const accel = input.isDown('KeyW') ? 14 : 0;
  const brake = input.isDown('KeyS') ? 18 : 0;
  const steerInput = (input.isDown('KeyA') ? 1 : 0) - (input.isDown('KeyD') ? 1 : 0);
  const reversing = car.speed < -0.5;
  if (accel > 0) car.speed += accel * dt;
  else if (brake > 0) car.speed -= (car.speed > 0.5 ? brake : 8) * dt;
  else car.speed = damp(car.speed, 0, 0.7, dt);
  car.speed = clamp(car.speed, -10, 30);
  const steer = steerInput * 1.9 * clamp(Math.abs(car.speed) / 8, 0, 1) * (reversing ? -1 : 1);
  car.angle += steer * dt * (car.speed >= 0 ? 1 : -1) * (car.speed > 0 ? 1 : -1);
  // Stunt jump: cross a marked ramp at 15+ m/s and the car launches
  // (vy 7, gravity 18 -> ~0.78 s airborne, over the 0.6 s bar).
  car.jumpCd = Math.max(0, (car.jumpCd || 0) - dt);
  if (car.y === 0 && Math.abs(car.speed) >= 15 && G.missions.jumps) {
    for (const j of G.missions.jumps) {
      if (!j.done && dist2D(car.mesh.position.x, car.mesh.position.z, j.x, j.z) < 4) {
        car.vy = 7; car.airT = 0; car.jumpCd = 2; car.jumpSpot = j;
        break;
      }
    }
  }
  const fx = Math.sin(car.angle), fz = Math.cos(car.angle);
  let nx = car.mesh.position.x + fx * car.speed * dt;
  let nz = car.mesh.position.z + fz * car.speed * dt;
  const fixed = collideBuildings(G.city, nx, nz, 2.2);
  if (fixed.hit) {
    car.speed *= 0.55;
    if (car.condTimer <= 0 && Math.abs(car.speed) > 2) {
      car.condition = Math.max(0, car.condition - 2);
      car.condTimer = 0.5;
    }
  }
  nx = clampToCity(fixed.x);
  nz = clampToCity(fixed.z);
  // Beach water stops cars at z > 348.
  if (nz > 348) { nz = 348; car.speed *= 0.5; }
  // route permanently.
  for (const other of G.police.cars) {
    if (!other.roadblock) continue;
    const ox = car.mesh.position.x - other.mesh.position.x;
    const oz = car.mesh.position.z - other.mesh.position.z;
    const od = Math.hypot(ox, oz);
    const dx = nx - other.mesh.position.x;
    const dz = nz - other.mesh.position.z;
    if (Math.hypot(dx, dz) < 3.6) {
      if (car.condTimer <= 0) {
        car.condition = Math.max(0, car.condition - 5);
        car.condTimer = 0.5;
      }
      if (od >= 3.6) {
        // Was outside, stepped in: reject the step.
        nx = car.mesh.position.x;
        nz = car.mesh.position.z;
      } else {
        // ahead): push out radially instead of staying stuck.
        const ux = od > 0.001 ? ox / od : -Math.sin(car.angle);
        const uz = od > 0.001 ? oz / od : -Math.cos(car.angle);
        nx = other.mesh.position.x + ux * 3.6;
        nz = other.mesh.position.z + uz * 3.6;
      }
      car.speed *= 0.5;
    }
  }
  car.mesh.position.x = nx;
  car.mesh.position.z = nz;
  car.mesh.rotation.y = car.angle;
  // Ballistic hop: gravity pulls the car back down; landing after
  // >0.6 s airborne over a marked ramp pays +$50, once per ramp.
  if (car.vy !== 0 || car.y > 0) {
    car.vy -= 18 * dt;
    car.y += car.vy * dt;
    car.airT += dt;
    car.mesh.rotation.x = clamp(-car.vy * 0.02, -0.15, 0.15);
    if (car.y <= 0) {
      car.y = 0;
      const air = car.airT;
      car.vy = 0; car.airT = 0;
      car.mesh.rotation.x = 0;
      if (G.stats && air > 0) G.stats.longest = Math.max(G.stats.longest, air);
      const j = car.jumpSpot;
      car.jumpSpot = null;
      if (j && !j.done && air > 0.6) {
        j.done = true;
        G.missions.jumpsGot++;
        G.money += 50;
        G.audio.pickup();
        G.toast(`STUNT JUMP +$50 (${G.missions.jumpsGot}/5)`);
      }
    }
  }
  car.mesh.position.y = car.y;
  // Player follows the car.
  G.player.pos.copy(car.mesh.position);
  G.player.angle = car.angle;
  // Light body roll into corners for feel.
  car.mesh.rotation.z = damp(car.mesh.rotation.z, -steerInput * 0.03 * clamp(Math.abs(car.speed) / 20, 0, 1), 6, dt);
}

// Find the nearest stealable car to the on-foot player.
export function nearestCar(G, maxDist) {
  let best = null, bd = maxDist;
  for (const car of G.cars) {
    if (car.kind === 'police') continue;
    if (car.kind === 'rival') continue;
    if (G.player.car === car) continue;
    const d = dist2D(G.player.pos.x, G.player.pos.z, car.mesh.position.x, car.mesh.position.z);
    if (d < bd) { bd = d; best = car; }
  }
  return best;
}

export function enterCar(G, car) {
  const wasTraffic = car.kind === 'traffic';
  // A first take of a car that was not yours counts as a steal.
  if (G.stats && !car.counted) { car.counted = true; G.stats.cars++; }
  car.kind = 'player';
  car.speed = 0;
  car.condition = 100;
  car.condTimer = 0;
  G.player.car = car;
  G.player.onFoot = false;
  G.player.mesh.visible = false;
  G.audio.carDoor();
  if (wasTraffic) {
    G.addWanted(1, 'Grand theft auto — you stole a moving car');
  } else {
    G.toast(`You took the ${car.name}. Drive!`);
  }
  return car;
}

export function exitCar(G) {
  const car = G.player.car;
  if (!car) return;
  car.kind = 'parked';
  car.speed = 0;
  car.y = 0; car.vy = 0; car.airT = 0; car.jumpSpot = null;
  car.mesh.position.y = 0;
  car.mesh.rotation.x = 0;
  G.player.car = null;
  G.player.onFoot = true;
  G.player.mesh.visible = true;
  // Step out to the driver's side.
  const sideX = Math.cos(car.angle), sideZ = -Math.sin(car.angle);
  G.player.pos.set(car.mesh.position.x + sideX * 2, 0, car.mesh.position.z + sideZ * 2);
  G.player.angle = car.angle;
  G.audio.carDoor();
}

// A fresh player car for shot modes and mission starts.
export function spawnRivalCar(G, x, z, color = 0xd86a2e) {
  const mesh = buildCarMesh(color);
  mesh.position.set(x, 0, z);
  mesh.rotation.y = Math.PI / 2;
  G.scene.add(mesh);
  const car = {
    mesh, angle: Math.PI / 2, speed: 0, kind: 'rival',
    color, name: 'Falco Sport',
    axis: 'x', fixed: z, along: x, dir: 1, cruise: 0,
    stopped: false, driver: null,
    health: 100, condition: 100, condTimer: 0,
  };
  G.cars.push(car);
  return car;
}

export function spawnPlayerCar(G, x, z, angle, color = 0xc83a2e) {
  const car = makeCar(G, x, z, angle, color, 'player');
  car.speed = 0;
  G.cars.push(car);
  G.player.car = car;
  G.player.onFoot = false;
  G.player.mesh.visible = false;
  G.player.pos.set(x, 0, z);
  G.player.angle = angle;
  return car;
}
