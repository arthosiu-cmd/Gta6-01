import * as THREE from 'three';
import { buildCarMesh } from './vehicles.js';
import { collideBuildings, clampToCity, nearestRoadCoord, pointInBuilding } from './city.js';
import { clamp, dist2D, turnToward } from './utils.js';

export function createPoliceState() {
  return {
    cars: [],
    foot: [],
    heli: null,
    nextCall: 0,
    bustTimer: 0,
    quietTimer: 0,
    decayTimer: 0,
    seen: false,
  };
}

// Line of sight: sample the straight segment between two points
// against building footprints (pointInBuilding). 12 samples is
// enough to catch every mid-block building on a <=70 m segment.
export function lineClear(G, x1, z1, x2, z2) {
  for (let i = 1; i < 12; i++) {
    const t = i / 12;
    if (pointInBuilding(G.city, x1 + (x2 - x1) * t, z1 + (z2 - z1) * t)) return false;
  }
  return true;
}

// IN SIGHT when the helicopter is up (its spotlight sees everything)
// or any cruiser/foot cop within 70 m has a clear segment to the
// player; otherwise HIDDEN. Only meaningful at wanted >= 3.
export function policeSeen(G) {
  if (G.police.heli) return true;
  const px = G.player.pos.x, pz = G.player.pos.z;
  const units = [...G.police.cars.map((c) => c.mesh.position), ...G.police.foot.map((c) => c.pos)];
  for (const u of units) {
    const d = Math.hypot(u.x - px, u.z - pz);
    if (d < 70 && lineClear(G, px, pz, u.x, u.z)) return true;
  }
  return false;
}

const CALLSIGNS = ['HARBOUR-11', 'TANGO-7', 'MARINA-3', 'PIER-9', 'DOCK-5', 'BAY-2', 'REEF-8', 'SURF-4'];
function nextCallsign(G) {
  const n = G.police.nextCall || 0;
  G.police.nextCall = n + 1;
  return CALLSIGNS[n % CALLSIGNS.length];
}

// Air unit: low-poly helicopter with a spotlight cone that tracks the
// player. It flies, so it never collides with roadblocks or traffic.
function buildHeliMesh() {
  const group = new THREE.Group();
  const white = new THREE.MeshLambertMaterial({ color: 0xf0f0f0 });
  const blue = new THREE.MeshLambertMaterial({ color: 0x1c4ed8 });
  const dark = new THREE.MeshLambertMaterial({ color: 0x1c2733 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.3, 4.6), white);
  group.add(body);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.35, 4.62), blue);
  stripe.position.y = -0.1;
  group.add(stripe);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1.2), dark);
  nose.position.set(0, 0.15, 2.4);
  group.add(nose);
  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 3.4), white);
  boom.position.set(0, 0.3, -3.6);
  group.add(boom);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.4, 1.0), blue);
  fin.position.set(0, 0.9, -5.0);
  group.add(fin);
  const skidGeo = new THREE.BoxGeometry(0.18, 0.18, 3.6);
  for (const s of [-1, 1]) {
    const skid = new THREE.Mesh(skidGeo, dark);
    skid.position.set(s * 0.9, -0.95, 0.3);
    group.add(skid);
  }
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 6), dark);
  mast.position.y = 0.9;
  group.add(mast);
  const rotor = new THREE.Group();
  rotor.position.y = 1.2;
  const bladeGeo = new THREE.BoxGeometry(7.2, 0.08, 0.5);
  rotor.add(new THREE.Mesh(bladeGeo, dark));
  const blade2 = new THREE.Mesh(bladeGeo, dark);
  blade2.rotation.y = Math.PI / 2;
  rotor.add(blade2);
  const blur = new THREE.Mesh(
    new THREE.CircleGeometry(3.6, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false }),
  );
  blur.rotation.x = -Math.PI / 2;
  rotor.add(blur);
  group.add(rotor);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfff2b0 }));
  lamp.position.set(0, -0.8, 1.6);
  lamp.name = 'searchlight';
  group.add(lamp);
  group.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { group, rotor };
}

function heliTarget(G) {
  // Ahead + to the player's left: the beam then slants diagonally
  // across the chase camera's view instead of running straight down
  // the view axis (where it collapses into a faint disc).
  const a = G.player.angle;
  const fx = Math.sin(a), fz = Math.cos(a);
  const lx = Math.cos(a), lz = -Math.sin(a);
  return {
    x: G.player.pos.x + fx * 44 + lx * 34,
    z: G.player.pos.z + fz * 44 + lz * 34,
    y: 9,
  };
}

function aimCone(G) {
  const heli = G.police.heli;
  if (!heli) return;
  const ax = heli.group.position.x, ay = heli.group.position.y - 0.8, az = heli.group.position.z;
  const bx = G.player.pos.x, by = 0.1, bz = G.player.pos.z;
  const dx = ax - bx, dy = ay - by, dz = az - bz;
  const len = Math.hypot(dx, dy, dz) || 1;
  // The beam stops part-way down: a full funnel to the player puts its
  // wide end 9 m from the chase camera and fills the frame as a dome.
  // The shaft + the pool disc on the player read as a spotlight instead.
  const beamLen = len * 0.62;
  heli.cone.position.set(
    ax - (dx / len) * (beamLen / 2),
    ay - (dy / len) * (beamLen / 2),
    az - (dz / len) * (beamLen / 2),
  );
  heli.cone.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(dx / len, dy / len, dz / len),
  );
  heli.cone.scale.set(1, beamLen, 1);
  heli.pool.position.set(bx, 0.12, bz);
}

export function spawnHeli(G, staged = false) {
  if (G.police.heli) return G.police.heli;
  const { group, rotor } = buildHeliMesh();
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(2.2, 1, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffe27a, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }),
  );
  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(4.5, 24),
    new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0.28, depthWrite: false }),
  );
  pool.rotation.x = -Math.PI / 2;
  G.scene.add(group);
  G.scene.add(cone);
  G.scene.add(pool);
  const heli = { group, rotor, cone, pool, callsign: 'AIR-1', staged };
  G.police.heli = heli;
  const t = heliTarget(G);
  group.position.set(t.x, t.y, t.z);
  group.rotation.y = G.player.angle;
  aimCone(G);
  G.toast('Air unit deployed — the spotlight is on you!');
  return heli;
}

function removeHeli(G) {
  const heli = G.police.heli;
  if (!heli) return;
  G.scene.remove(heli.group);
  G.scene.remove(heli.cone);
  G.scene.remove(heli.pool);
  G.police.heli = null;
}

function updateHeli(G, dt) {
  const heli = G.police.heli;
  if (!heli) return;
  const t = heliTarget(G);
  const k = 1 - Math.exp(-1.5 * dt);
  heli.group.position.x += (t.x - heli.group.position.x) * k;
  heli.group.position.y += (t.y - heli.group.position.y) * k;
  heli.group.position.z += (t.z - heli.group.position.z) * k;
  heli.group.rotation.y = G.player.angle;
  heli.rotor.rotation.y += dt * 18;
  aimCone(G);
}

export function spawnPoliceCarAt(G, x, z, speed = 12) {
  const mesh = buildCarMesh(0xf0f0f0, true);
  mesh.position.set(x, 0, z);
  G.scene.add(mesh);
  const car = {
    mesh,
    angle: Math.atan2(G.player.pos.x - x, G.player.pos.z - z),
    speed, kind: 'police', health: 100,
    sirenPhase: G.rng.range(0, 1), callsign: nextCallsign(G),
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
  for (const [i, side] of [-3.5, 3.5].entries()) {
    const mesh = buildCarMesh(0xf0f0f0, true);
    const x = alongX ? ax : road + side;
    const z = alongX ? road + side : az;
    mesh.position.set(x, 0, z);
    mesh.rotation.y = angle;
    G.scene.add(mesh);
    const car = {
      mesh, angle, speed: 0, kind: 'police', health: 100,
      sirenPhase: G.rng.range(0, 1), roadblock: true, callsign: `BULWARK-${i + 1}`,
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
    sirenPhase: G.rng.range(0, 1), callsign: nextCallsign(G),
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
    if (G.police.heli) removeHeli(G);
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
  if (wanted >= 4 && !G.police.heli) spawnHeli(G);
  else if (wanted < 4 && G.police.heli && !G.police.heli.staged) removeHeli(G);
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
  if (G.police.heli) updateHeli(G, dt);

  // Search zone: at wanted >= 3 the chip + minimap circle read the
  // LoS state, and wanted decays FASTER while HIDDEN (first decay
  // after 12 s, then every 5 s) than while IN SIGHT (25 s, then 10 s).
  if (G.wanted >= 3) G.police.seen = policeSeen(G);
  G.police.decayTimer += dt;
  const seen = G.wanted >= 3 ? G.police.seen : true;
  const first = seen ? 25 : 12, period = seen ? 10 : 5;
  if (G.police.decayTimer > first) {
    G.police.decayTimer = first - period;
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
  if (G.police.heli) removeHeli(G);
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
