// missions.js — the story of Solmar: Rico Vega owes a debt to developer
// and crime boss Marcus Thorne; Lena Cruz's garage jobs pay it off.
// Five chained missions with waypoints, timers and rewards, plus the
// side activities: scattered cash pickups and the taxi fare job.
import * as THREE from 'three';
import { PLACES } from './city.js';
import { dist2D } from './utils.js';

export const MISSIONS = [
  {
    id: 1, title: 'First Gear', reward: 100,
    brief: "Lena Cruz: 'Rico. You're back. Thorne owns your debt now — $2,000. I got work. First: come to my garage, let's see if you can still drive.'",
    steps: [
      { text: 'Go to Lena\'s Garage', pos: PLACES.garage, radius: 6 },
    ],
  },
  {
    id: 2, title: 'Pickup', reward: 250,
    brief: "Lena: 'A package is waiting near the park. Grab it, then drop it off across town. Fast — the buyer hates waiting.'",
    steps: [
      { text: 'Pick up the package', pos: PLACES.packageA, radius: 4 },
      { text: 'Deliver the package — timed!', pos: PLACES.deliverA, radius: 6, time: 100 },
    ],
  },
  {
    id: 3, title: 'Getaway', reward: 400,
    brief: "Lena: 'Thorne's boys want the car you boosted last year. Take any car, lose the cops, and bring it to the safehouse. Don't get caught.'",
    steps: [
      { text: 'Steal a car (press E near one)', pos: null, radius: 0, needCar: true, onStart: (G) => { G.addWanted(2, 'Theft reported — police are coming'); } },
      { text: 'Reach the safehouse — lose the heat', pos: PLACES.safehouse, radius: 8 },
    ],
  },
  {
    id: 4, title: 'The Drop', reward: 600,
    brief: "Lena: 'Big one. A crate at the port warehouse, straight to the boardwalk. The moment you touch it, every cop in Solmar will know. Drive like you mean it.'",
    steps: [
      { text: 'Pick up the crate at the port', pos: PLACES.portPickup, radius: 5 },
      { text: 'Deliver to the boardwalk — police on your tail!', pos: PLACES.boardwalk, radius: 8, onStart: (G) => { G.addWanted(3, 'The drop is hot — police converging'); } },
    ],
  },
  {
    id: 5, title: 'Bayfront Heist', reward: 1500,
    brief: "Lena: 'Last job. Thorne keeps his cash in his tower downtown. Take it, run for the boat at the beach, and your debt is gone. This is the one, Rico.'",
    steps: [
      { text: 'Grab the loot at Thorne Tower', pos: PLACES.thorneTower, radius: 6 },
      { text: 'Escape to the boat at the beach!', pos: PLACES.boat, radius: 8, onStart: (G) => { G.addWanted(4, 'Heist alarm — maximum police response'); } },
    ],
  },
];

export function createMissionsState(scene) {
  // Waypoint beacon: a glowing column + ring at the current objective.
  const beacon = new THREE.Group();
  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.6, 60, 12, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffd23e, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false }),
  );
  column.position.y = 30;
  beacon.add(column);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(2.2, 3, 24),
    new THREE.MeshBasicMaterial({ color: 0xffd23e, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.15;
  ring.name = 'ring';
  beacon.add(ring);
  const marker = new THREE.Mesh(
    new THREE.ConeGeometry(1.2, 2.4, 4),
    new THREE.MeshBasicMaterial({ color: 0xffd23e }),
  );
  marker.position.y = 8;
  marker.rotation.x = Math.PI;
  marker.name = 'marker';
  beacon.add(marker);
  beacon.visible = false;
  scene.add(beacon);
  return {
    index: 0, // mission in MISSIONS
    step: 0,
    active: false,
    timer: 0,
    storyDone: false,
    beacon,
    // Cash pickups and the fare job live here too.
    pickups: [],
    fare: { state: 'waiting', ped: null, dest: null, timer: 0 },
    fareMarker: null,
  };
}

export function currentMission(G) {
  return MISSIONS[G.missions.index] || null;
}

export function currentStep(G) {
  const m = currentMission(G);
  return m ? m.steps[G.missions.step] : null;
}

export function startMission(G, index) {
  const m = MISSIONS[index];
  if (!m) return;
  G.missions.index = index;
  G.missions.step = 0;
  G.missions.active = true;
  G.missions.timer = 0;
  const step = m.steps[0];
  if (step.onStart) step.onStart(G);
  if (step.time) G.missions.timer = step.time;
  G.toast(`${m.title} — ${m.steps[0].text}`);
  G.hud.showBrief(m.title, m.brief);
  updateBeacon(G);
}

export function updateBeacon(G) {
  const step = currentStep(G);
  const beacon = G.missions.beacon;
  if (!G.missions.active || !step || !step.pos) {
    beacon.visible = false;
    return;
  }
  beacon.visible = true;
  beacon.position.set(step.pos.x, 0, step.pos.z);
}

function completeStep(G) {
  const m = currentMission(G);
  const step = currentStep(G);
  G.audio.pickup();
  if (G.missions.step + 1 < m.steps.length) {
    G.missions.step++;
    const next = currentStep(G);
    if (next.onStart) next.onStart(G);
    if (next.time) G.missions.timer = next.time;
    G.toast(next.text);
    updateBeacon(G);
    return;
  }
  // Mission complete.
  G.money += m.reward;
  G.audio.missionJingle();
  G.toast(`${m.title} complete! +$${m.reward}`);
  G.hud.showBrief(`${m.title} complete`, `Lena paid you $${m.reward}.`);
  G.save();
  if (G.missions.index + 1 < MISSIONS.length) {
    startMission(G, G.missions.index + 1);
  } else {
    G.missions.active = false;
    G.missions.storyDone = true;
    updateBeacon(G);
    G.storyComplete();
  }
}

export function updateMissions(G, dt) {
  const ms = G.missions;
  // Beacon pulse.
  if (ms.beacon.visible) {
    const ring = ms.beacon.getObjectByName('ring');
    const marker = ms.beacon.getObjectByName('marker');
    const s = 1 + Math.sin(G.time * 3) * 0.15;
    ring.scale.set(s, s, 1);
    marker.position.y = 8 + Math.sin(G.time * 2) * 0.8;
    marker.rotation.y += dt * 2;
  }
  if (!ms.active) return;
  const step = currentStep(G);
  if (!step) return;
  if (step.time) {
    ms.timer -= dt;
    if (ms.timer <= 0) {
      failMission(G, 'Out of time!');
      return;
    }
  }
  if (step.needCar) {
    if (!G.player.onFoot) completeStep(G);
    return;
  }
  if (step.pos) {
    const d = dist2D(G.player.pos.x, G.player.pos.z, step.pos.x, step.pos.z);
    if (d < step.radius) completeStep(G);
  }
}

export function failMission(G, reason) {
  G.audio.failBuzz();
  G.missions.active = false;
  G.missions.timer = 0;
  updateBeacon(G);
  G.hud.showBrief('Mission failed', `${reason} Press R to retry.`);
  G.toast(`Mission failed — ${reason} Press R to retry.`);
}

export function restartMission(G) {
  const m = currentMission(G);
  if (!m) return;
  startMission(G, G.missions.index);
  G.toast(`Restarted: ${m.title}`);
}

// --- Cash pickups ------------------------------------------------------
export function spawnPickups(G, count = 12) {
  const ms = G.missions;
  const geo = new THREE.OctahedronGeometry(0.9);
  const mat = new THREE.MeshLambertMaterial({ color: 0xffd23e, emissive: 0x8a6d00 });
  for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(geo, mat);
    const road = G.city.roadCoords[G.rng.int(0, G.city.roadCoords.length - 1)];
    const along = G.rng.range(-240, 240);
    const x = G.rng.chance(0.5) ? road + 8 : along;
    const z = G.rng.chance(0.5) ? along : road + 8;
    mesh.position.set(x, 1.4, z);
    G.scene.add(mesh);
    ms.pickups.push({ mesh, respawn: 0 });
  }
}

export function updatePickups(G, dt) {
  for (const p of G.missions.pickups) {
    if (!p.mesh.visible) {
      p.respawn -= dt;
      if (p.respawn <= 0) {
        p.mesh.visible = true;
        const road = G.city.roadCoords[G.rng.int(0, G.city.roadCoords.length - 1)];
        const along = G.rng.range(-240, 240);
        p.mesh.position.set(G.rng.chance(0.5) ? road + 8 : along, 1.4, G.rng.chance(0.5) ? along : road + 8);
      }
      continue;
    }
    p.mesh.rotation.y += dt * 2.5;
    p.mesh.position.y = 1.4 + Math.sin(G.time * 2 + p.mesh.position.x) * 0.25;
    if (dist2D(G.player.pos.x, G.player.pos.z, p.mesh.position.x, p.mesh.position.z) < 2.4) {
      p.mesh.visible = false;
      p.respawn = 30;
      G.money += 50;
      G.audio.pickup();
      G.toast('Cash pickup +$50');
    }
  }
}

// --- Fare job ----------------------------------------------------------
// A waiting pedestrian with a fare: press Q in a car nearby to take them.
export function spawnFareCustomer(G) {
  const ms = G.missions;
  if (ms.fare.state !== 'waiting' || !G.peds.length) return;
  const candidates = G.peds.filter((p) => p.state === 'walk');
  if (!candidates.length) return;
  const ped = candidates[G.rng.int(0, candidates.length - 1)];
  ped.state = 'fare';
  ms.fare.ped = ped;
  ms.fare.state = 'offered';
  const road = G.city.roadCoords[G.rng.int(0, G.city.roadCoords.length - 1)];
  const along = G.rng.range(-240, 240);
  ms.fare.dest = { x: G.rng.chance(0.5) ? road : along, z: G.rng.chance(0.5) ? along : road };
  G.toast('A fare is waiting — drive up and press Q');
}

export function updateFare(G, dt) {
  const fare = G.missions.fare;
  if (fare.state === 'offered' && fare.ped) {
    const ped = fare.ped;
    // Floating "!" above the customer: a small gold cone that bobs.
    if (!G.missions.fareMarker) {
      const marker = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1.2, 4),
        new THREE.MeshBasicMaterial({ color: 0x37d67a }),
      );
      G.scene.add(marker);
      G.missions.fareMarker = marker;
    }
    const marker = G.missions.fareMarker;
    marker.visible = true;
    marker.position.set(ped.pos.x, 3.4 + Math.sin(G.time * 3) * 0.3, ped.pos.z);
    marker.rotation.y += dt * 2;
    const d = dist2D(G.player.pos.x, G.player.pos.z, ped.pos.x, ped.pos.z);
    if (!G.player.onFoot && d < 7 && G.input.wasPressed('KeyQ')) {
      fare.state = 'riding';
      ped.state = 'riding';
      ped.mesh.visible = false;
      marker.visible = false;
      G.toast('Fare aboard — drive them to the green marker!');
      G.audio.pickup();
    }
  } else if (fare.state === 'riding') {
    const d = dist2D(G.player.pos.x, G.player.pos.z, fare.dest.x, fare.dest.z);
    if (d < 7) {
      fare.state = 'done';
      fare.timer = 20;
      G.money += 80;
      G.audio.missionJingle();
      G.toast('Fare complete! +$80');
    }
  } else if (fare.state === 'done') {
    fare.timer -= dt;
    if (fare.timer <= 0) {
      fare.state = 'waiting';
      fare.ped = null;
      spawnFareCustomer(G);
    }
  }
}

export function fareDestination(G) {
  const fare = G.missions.fare;
  return fare.state === 'riding' ? fare.dest : null;
}
