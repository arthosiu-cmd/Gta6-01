import * as THREE from 'three';
import { PLACES } from './city.js';
import { dist2D } from './utils.js';
import { clearPolice } from './police.js';
import { spawnRivalCar } from './vehicles.js';
import { noteMissionStart, noteMissionComplete } from './stats.js';

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
  {
    id: 6, title: 'Shadow the Courier', reward: 800,
    brief: "Lena: 'Thorne's courier runs cash up the main drag every morning. Tail him — stay 12–45 metres back for 20 seconds and I'll know his route. Closer than 8 metres and he'll spot you; further than 55 and you'll lose him.'",
    steps: [
      { text: 'Steal a car (press E near one)', pos: null, radius: 0, needCar: true },
      { text: 'Tail the courier — stay 12–45 m back', tail: true, onStart: (G) => designateCourier(G) },
    ],
  },
  {
    id: 7, title: 'Clean Getaway', reward: 1000,
    brief: "Lena: 'Thorne's courier route is mapped — but the car you stole it in is hot, and every cop in Solmar is looking for it. Stay clean for 25 seconds — no new trouble, or the clock starts over — then slip back to the safehouse.'",
    steps: [
      { text: 'Lay low — stay clean until the heat dies down', layLow: 25, onStart: (G) => { G.addWanted(3, 'The stolen car is hot — the whole PD is after you'); } },
      { text: 'Reach the safehouse', pos: PLACES.safehouse, radius: 8 },
    ],
  },
  {
    id: 8, title: 'The Enforcer', reward: 1200,
    brief: "Lena: 'Thorne's enforcer runs his street crews — and he's the one who torched your old garage. Run him down on foot and put him on the ground before he slips away. Fists or pistol, your call — the cops won't lift a finger for him, it's between you and him. But if he gets away, the trail goes cold.'",
    steps: [
      { text: "Take down Thorne's enforcer", hunt: true, onStart: (G) => { G.wanted = 0; clearPolice(G); designateTarget(G); } },
    ],
  },
  {
    id: 9, title: 'Boardwalk Rush', reward: 1500,
    brief: "Lena: 'Thorne's crew races for pink slips down the boardwalk every night — winner takes the cars, loser walks home. Beat them at their own game, Rico: steal a car, then hit all 5 checkpoints before the clock runs out and the prize is ours.'",
    steps: [
      { text: 'Steal a car (press E near one)', pos: null, radius: 0, needCar: true },
      { text: 'Race the boardwalk — beat the rival to the finish', race: { points: [{ x: -88, z: 256 }, { x: 8, z: 256 }, { x: 104, z: 256 }, { x: 200, z: 256 }, { x: 280, z: 256 }], radius: 7, time: 30 } },
    ],
  },
];

// REP ladder: a mission pays 50 + reward/10 REP; M7 escape +25.
export const REP_RANKS = [
  { xp: 0, name: 'ROOKIE' },
  { xp: 300, name: 'GETAWAY DRIVER' },
  { xp: 800, name: 'STREET HUSTLER' },
  { xp: 1600, name: 'BAY RUNNER' },
  { xp: 2600, name: 'SOLMAR LEGEND' },
];

export function rankForRep(rep) {
  let rank = 0;
  for (let i = 0; i < REP_RANKS.length; i++) {
    if (rep >= REP_RANKS[i].xp) rank = i;
  }
  const next = REP_RANKS[rank + 1] || null;
  return {
    rank, name: REP_RANKS[rank].name, xp: rep, floor: REP_RANKS[rank].xp,
    next: next ? next.xp : null, nextName: next ? next.name : null,
  };
}

export function awardRep(G, xp) {
  const before = rankForRep(G.rep || 0).rank;
  G.rep = (G.rep || 0) + xp;
  const r = rankForRep(G.rep);
  if (r.rank > before) G.toast(`Rank up — you are now ${r.name}!`);
  return r;
}

export function createMissionsState(scene) {
  const beacon = new THREE.Group();
  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.6, 5, 12, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffd23e, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }),
  );
  column.position.y = 2.5;
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
    new THREE.ConeGeometry(0.9, 1.8, 4),
    new THREE.MeshBasicMaterial({ color: 0xffd23e }),
  );
  marker.position.y = 4.2;
  marker.rotation.x = Math.PI;
  marker.name = 'marker';
  beacon.add(marker);
  beacon.visible = false;
  scene.add(beacon);
  const raceMarkers = new THREE.Group();
  const ringGeo = new THREE.RingGeometry(4.5, 5.5, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd23e, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
  for (let i = 0; i < 5; i++) {
    const r = new THREE.Mesh(ringGeo, ringMat);
    r.rotation.x = -Math.PI / 2;
    r.position.y = 0.15;
    r.visible = false;
    raceMarkers.add(r);
  }
  scene.add(raceMarkers);
  return {
    index: 0,
    step: 0,
    active: false,
    timer: 0,
    storyDone: false,
    beacon,
    raceMarkers,
    race: null,
    rival: null,
    tail: null,
    layLow: null,
    hunt: null,
    pickups: [],
    shells: [], shellsGot: 0, jumps: [], jumpsGot: 0,
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

export function missionHeader(G) {
  const m = currentMission(G);
  const step = currentStep(G);
  if (!G.missions.active || !m || !step) return null;
  const next = m.steps[G.missions.step + 1];
  return {
    job: G.missions.index + 1, total: MISSIONS.length, title: m.title,
    stage: G.missions.step + 1, stages: m.steps.length,
    next: next ? next.text : 'Finish the job',
  };
}

// Brief speaker: Lena Cruz, garage owner (abstract disc + initials).
export const SPEAKER_LENA = { initials: 'LC', name: 'Lena Cruz', role: 'Garage Owner', color: '#2e7fc8' };

function stepTime(step) {
  return (step && (step.time || (step.race && step.race.time))) || 0;
}

export function spawnRival(G) {
  const step = currentStep(G);
  if (!step || !step.race) return;
  clearRival(G);
  const pts = step.race.points;
  const car = spawnRivalCar(G, pts[0].x - 40, pts[0].z + 3);
  G.missions.rival = { car, idx: 0, speed: 17.5 };
}

export function clearRival(G) {
  const rival = G.missions.rival;
  if (!rival) return;
  G.scene.remove(rival.car.mesh);
  const i = G.cars.indexOf(rival.car);
  if (i >= 0) G.cars.splice(i, 1);
  G.missions.rival = null;
}

export function startMission(G, index) {
  const m = MISSIONS[index];
  if (!m) return;
  G.missions.index = index;
  G.missions.step = 0;
  G.missions.active = true;
  G.missions.timer = 0;
  G.missions.tail = null;
  G.missions.layLow = null;
  G.missions.hunt = null;
  G.missions.race = null;
  clearRival(G);
  hideRaceMarkers(G);
  noteMissionStart(G);
  const step = m.steps[0];
  if (step.onStart) step.onStart(G);
  if (stepTime(step)) G.missions.timer = stepTime(step);
  if (step.race) { showRaceMarkers(G, step.race.points); spawnRival(G); }
  G.toast(`${m.title} — ${m.steps[0].text}`);
  G.hud.showBrief(m.title, m.brief, SPEAKER_LENA);
  updateBeacon(G);
}

export function startMissionStep(G, index, stepIdx) {
  const m = MISSIONS[index];
  if (!m) return;
  const step = m.steps[stepIdx];
  if (!step) return;
  G.missions.index = index;
  G.missions.step = stepIdx;
  G.missions.active = true;
  G.missions.timer = 0;
  G.missions.tail = null;
  G.missions.layLow = null;
  G.missions.hunt = null;
  G.missions.race = null;
  clearRival(G);
  hideRaceMarkers(G);
  noteMissionStart(G);
  if (step.onStart) step.onStart(G);
  if (stepTime(step)) G.missions.timer = stepTime(step);
  if (step.race) { showRaceMarkers(G, step.race.points); spawnRival(G); }
  G.toast(`${m.title} — ${step.text}`);
  G.hud.showBrief(m.title, m.brief, SPEAKER_LENA);
  updateBeacon(G);
}

export function designateCourier(G) {
  const car = G.cars.find((c) => c.kind === 'traffic');
  if (!car) return null;
  car.axis = 'z';
  car.fixed = 0;
  car.along = 100;
  car.dir = -1;
  car.cruise = 9;
  car.speed = 9;
  car.noTurn = true;
  G.missions.tail = { car, hold: 0, spot: 0, lose: 0, warnClose: false, warnFar: false };
  return car;
}

export function tailZone(d) {
  if (d >= 12 && d <= 45) return 'IN ZONE';
  if (d < 8) return 'TOO CLOSE';
  if (d > 55) return 'TOO FAR';
  return 'EDGE';
}

export function tailTarget(G) {
  const tail = G.missions.tail;
  if (!tail || !tail.car) return null;
  return { x: tail.car.mesh.position.x, z: tail.car.mesh.position.z };
}

export function designateTarget(G) {
  const p = G.player.pos;
  const fx = Math.sin(G.player.angle), fz = Math.cos(G.player.angle);
  let best = null, bestDot = 0.2, bestD = 40;
  for (const ped of G.peds) {
    if (ped.state !== 'walk') continue;
    const d = dist2D(p.x, p.z, ped.pos.x, ped.pos.z);
    if (d > 40) continue;
    const dx = ped.pos.x - p.x, dz = ped.pos.z - p.z;
    const dot = (dx * fx + dz * fz) / (d || 1);
    if (dot > bestDot || (dot === bestDot && d < bestD)) {
      best = ped; bestDot = dot; bestD = d;
    }
  }
  if (!best) {
    for (const ped of G.peds) {
      if (ped.state !== 'walk') continue;
      const d = dist2D(p.x, p.z, ped.pos.x, ped.pos.z);
      if (d < bestD) { best = ped; bestD = d; }
    }
  }
  if (!best) return null;
  best.state = 'flee';
  best.fleeTimer = 999;
  best.fleeFrom = { x: p.x, z: p.z };
  G.missions.hunt = { ped: best, lose: 0, warned: false };
  return best;
}

export function huntTarget(G) {
  const hunt = G.missions.hunt;
  if (!hunt || !hunt.ped) return null;
  return { x: hunt.ped.mesh.position.x, z: hunt.ped.mesh.position.z };
}

export function raceTarget(G) {
  const step = currentStep(G);
  const race = G.missions.race;
  if (!step || !step.race || !race) return null;
  const pt = step.race.points[race.idx];
  return pt ? { x: pt.x, z: pt.z } : null;
}

export function showRaceMarkers(G, points) {
  const idx = G.missions.race ? G.missions.race.idx : 0;
  G.missions.raceMarkers.children.forEach((r, i) => {
    r.position.set(points[i].x, 0.15, points[i].z);
    r.visible = i >= idx;
  });
}

export function hideRaceMarkers(G) {
  G.missions.raceMarkers.children.forEach((r) => { r.visible = false; });
}

export function updateBeacon(G) {
  const step = currentStep(G);
  const beacon = G.missions.beacon;
  if (!G.missions.active || !step) {
    beacon.visible = false;
    return;
  }
  if (step.tail) {
    const tail = G.missions.tail;
    if (!tail || !tail.car) {
      beacon.visible = false;
      return;
    }
    beacon.visible = true;
    beacon.position.set(tail.car.mesh.position.x, 0, tail.car.mesh.position.z);
    return;
  }
  if (step.hunt) {
    const hunt = G.missions.hunt;
    if (!hunt || !hunt.ped) {
      beacon.visible = false;
      return;
    }
    beacon.visible = true;
    beacon.position.set(hunt.ped.mesh.position.x, 0, hunt.ped.mesh.position.z);
    return;
  }
  if (step.race) {
    const idx = G.missions.race ? G.missions.race.idx : 0;
    beacon.visible = true;
    beacon.position.set(step.race.points[idx].x, 0, step.race.points[idx].z);
    return;
  }
  if (!step.pos) {
    beacon.visible = false;
    return;
  }
  beacon.visible = true;
  beacon.position.set(step.pos.x, 0, step.pos.z);
}

function completeStep(G) {
  const m = currentMission(G);
  const step = currentStep(G);
  if (step && step.tail) G.missions.tail = null;
  if (step && step.hunt) G.missions.hunt = null;
  if (step && step.race) { G.missions.race = null; clearRival(G); hideRaceMarkers(G); }
  G.audio.pickup();
  if (G.missions.step + 1 < m.steps.length) {
    G.missions.step++;
    const next = currentStep(G);
    if (next.onStart) next.onStart(G);
    if (stepTime(next)) G.missions.timer = stepTime(next);
    if (next.race) { showRaceMarkers(G, next.race.points); spawnRival(G); }
    G.toast(next.text);
    updateBeacon(G);
    return;
  }
  G.money += m.reward;
  noteMissionComplete(G, m);
  awardRep(G, 50 + Math.round(m.reward / 10) + (m.id === 7 ? 25 : 0));
  G.audio.missionJingle();
  G.toast(`${m.title} complete! +$${m.reward}`);
  G.hud.showBrief(`${m.title} complete`, `Lena paid you $${m.reward}.`, SPEAKER_LENA);
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
  if (ms.beacon.visible) {
    const ring = ms.beacon.getObjectByName('ring');
    const marker = ms.beacon.getObjectByName('marker');
    const s = 1 + Math.sin(G.time * 3) * 0.15;
    ring.scale.set(s, s, 1);
    marker.position.y = 4.2 + Math.sin(G.time * 2) * 0.4;
    marker.rotation.y += dt * 2;
  }
  if (!ms.active) return;
  const step = currentStep(G);
  if (!step) return;
  if (stepTime(step)) {
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
  if (step.tail) {
    if (!ms.tail) {
      designateCourier(G);
      return;
    }
    const courier = ms.tail.car;
    if (courier.along > 230 || courier.along < -230) courier.dir *= -1;
    const d = dist2D(G.player.pos.x, G.player.pos.z, courier.mesh.position.x, courier.mesh.position.z);
    if (d < 8) {
      if (!ms.tail.warnClose) {
        G.toast("Too close — he'll spot you! Back off!");
        ms.tail.warnClose = true;
      }
      ms.tail.spot += dt;
      ms.tail.lose = Math.max(0, ms.tail.lose - dt);
      if (ms.tail.spot > 2) {
        failMission(G, 'Spotted! The courier made you.');
        return;
      }
    } else if (d > 55) {
      if (!ms.tail.warnFar) {
        G.toast("You're losing him — speed up!");
        ms.tail.warnFar = true;
      }
      ms.tail.lose += dt;
      ms.tail.spot = Math.max(0, ms.tail.spot - dt);
      if (ms.tail.lose > 3) {
        failMission(G, 'Lost the courier!');
        return;
      }
    } else if (d >= 12 && d <= 45) {
      ms.tail.hold += dt;
      ms.tail.spot = 0;
      ms.tail.lose = 0;
      ms.tail.warnClose = false;
      ms.tail.warnFar = false;
      if (ms.tail.hold >= 20) {
        completeStep(G);
        return;
      }
    } else {
      ms.tail.spot = Math.max(0, ms.tail.spot - dt);
      ms.tail.lose = Math.max(0, ms.tail.lose - dt);
    }
    updateBeacon(G);
    return;
  }
  if (step.layLow) {
    // Only a wanted RISE resets the clock; falling never does.
    if (!ms.layLow) {
      ms.layLow = { remain: step.layLow, lastWanted: G.wanted };
      return;
    }
    if (G.wanted > ms.layLow.lastWanted) {
      ms.layLow.remain = step.layLow;
      ms.layLow.lastWanted = G.wanted;
      G.toast("New trouble — the heat's back up! Lay low again.");
      return;
    }
    ms.layLow.lastWanted = G.wanted;
    ms.layLow.remain -= dt;
    if (ms.layLow.remain <= 0) {
      ms.layLow = null;
      completeStep(G);
    }
    return;
  }
  if (step.hunt) {
    if (!ms.hunt || !ms.hunt.ped) {
      designateTarget(G);
      return;
    }
    const target = ms.hunt.ped;
    if (target.state === 'down') {
      completeStep(G);
      return;
    }
    if (target.state === 'gone' || target.state === 'riding') {
      failMission(G, 'The enforcer slipped away!');
      return;
    }
    if (target.state === 'walk') {
      target.state = 'flee';
      target.fleeTimer = 4;
      target.fleeFrom = { x: G.player.pos.x, z: G.player.pos.z };
    } else if (target.state === 'flee' && target.fleeTimer < 3) {
      target.fleeTimer = 4;
      target.fleeFrom = { x: G.player.pos.x, z: G.player.pos.z };
    }
    const d = dist2D(G.player.pos.x, G.player.pos.z, target.mesh.position.x, target.mesh.position.z);
    if (d > 55) {
      if (!ms.hunt.warned) {
        G.toast("He's getting away — run him down!");
        ms.hunt.warned = true;
      }
      ms.hunt.lose += dt;
      if (ms.hunt.lose > 3) {
        failMission(G, 'The enforcer slipped away!');
        return;
      }
    } else {
      ms.hunt.lose = Math.max(0, ms.hunt.lose - dt);
      ms.hunt.warned = false;
    }
    updateBeacon(G);
    return;
  }
  if (step.race) {
    if (!ms.race) {
      ms.race = { idx: 0 };
      showRaceMarkers(G, step.race.points);
      updateBeacon(G);
      return;
    }
    if (!ms.rival) spawnRival(G);
    const pts = step.race.points;
    const rival = ms.rival;
    if (rival) {
      rival.car.mesh.position.x += rival.speed * dt;
      rival.car.along = rival.car.mesh.position.x;
      const rd = dist2D(rival.car.mesh.position.x, rival.car.mesh.position.z, pts[rival.idx].x, pts[rival.idx].z);
      if (rd < (step.race.radius || 7)) {
        rival.idx++;
        if (rival.idx >= pts.length) {
          failMission(G, 'The rival beat you to the finish!');
          return;
        }
      }
    }
    const idx = ms.race.idx;
    const d = dist2D(G.player.pos.x, G.player.pos.z, pts[idx].x, pts[idx].z);
    if (d < (step.race.radius || 7)) {
      ms.race.idx++;
      G.audio.pickup();
      if (ms.race.idx >= pts.length) {
        ms.race = null;
        hideRaceMarkers(G);
        completeStep(G);
        return;
      }
      G.toast(`Checkpoint ${ms.race.idx + 1}/5`);
      showRaceMarkers(G, pts);
      updateBeacon(G);
    } else {
      updateBeacon(G);
    }
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
  G.missions.tail = null;
  G.missions.layLow = null;
  G.missions.hunt = null;
  G.missions.race = null;
  clearRival(G);
  hideRaceMarkers(G);
  updateBeacon(G);
  G.hud.showBrief('Mission failed', `${reason} Press R to retry.`, SPEAKER_LENA);
  G.toast(`Mission failed — ${reason} Press R to retry.`);
}

export function restartMission(G) {
  const m = currentMission(G);
  if (!m) return;
  startMission(G, G.missions.index);
  G.toast(`Restarted: ${m.title}`);
}

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

// Sunset Shells (12) pay +$25 +10 REP once each; jumps (5) pay +$50.
export const SHELL_SPOTS = [
  [-64, 320], [64, 320], [-96, 256], [-128, 224], [-192, 192],
  [192, -224], [256, -192], [0, 64], [64, 0], [-64, -64],
  [128, 128], [0, 107],
];
export const JUMP_SPOTS = [
  { x: -88, z: 256, a: Math.PI / 2 },
  { x: 0, z: 160, a: Math.PI },
  { x: 192, z: 64, a: Math.PI / 2 },
  { x: -64, z: -128, a: -Math.PI / 2 },
  { x: 128, z: -64, a: 0 },
];

export function spawnShells(G) {
  const geo = new THREE.OctahedronGeometry(0.55);
  const mat = new THREE.MeshLambertMaterial({ color: 0xff7fb0, emissive: 0x8a2a50 });
  for (const [x, z] of SHELL_SPOTS) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 1.0, z);
    G.scene.add(mesh);
    G.missions.shells.push({ mesh, taken: false });
  }
}

export function spawnJumps(G) {
  const wedgeGeo = new THREE.BoxGeometry(3.6, 0.35, 5);
  const wedgeMat = new THREE.MeshLambertMaterial({ color: 0xff8c2e });
  const plateGeo = new THREE.PlaneGeometry(5, 7);
  const plateMat = new THREE.MeshBasicMaterial({ color: 0xffd23e, transparent: true, opacity: 0.55 });
  for (const s of JUMP_SPOTS) {
    const group = new THREE.Group();
    group.position.set(s.x, 0, s.z);
    group.rotation.y = s.a;
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.rotation.x = -Math.PI / 2;
    plate.position.y = 0.06;
    group.add(plate);
    const wedge = new THREE.Mesh(wedgeGeo, wedgeMat);
    wedge.position.set(0, 0.55, 0.4);
    wedge.rotation.x = -0.32;
    wedge.castShadow = true;
    group.add(wedge);
    G.scene.add(group);
    G.missions.jumps.push({ x: s.x, z: s.z, done: false });
  }
}

export function updateShells(G, dt) {
  for (const s of G.missions.shells) {
    if (s.taken) continue;
    s.mesh.rotation.y += dt * 2;
    s.mesh.position.y = 1.0 + Math.sin(G.time * 2 + s.mesh.position.x) * 0.2;
    if (dist2D(G.player.pos.x, G.player.pos.z, s.mesh.position.x, s.mesh.position.z) < 2.4) {
      s.taken = true;
      s.mesh.visible = false;
      G.missions.shellsGot++;
      G.money += 25;
      awardRep(G, 10);
      G.audio.pickup();
      G.toast(`Sunset Shell ${G.missions.shellsGot}/12 +$25 +10 REP`);
    }
  }
}

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
    if (!G.missions.fareMarker) {
      const marker = new THREE.Mesh(
        new THREE.ConeGeometry(0.4, 1.0, 4),
        new THREE.MeshBasicMaterial({ color: 0x37d67a }),
      );
      G.scene.add(marker);
      G.missions.fareMarker = marker;
    }
    const marker = G.missions.fareMarker;
    marker.visible = true;
    marker.position.set(ped.pos.x, 2.4 + Math.sin(G.time * 3) * 0.2, ped.pos.z);
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
      awardRep(G, 10);
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
