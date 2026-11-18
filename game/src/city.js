// city.js — procedural Solmar: streets, buildings, beach, port, park, props.
// The city is a 9x9 road grid (spacing 64, road width 12) with districts:
// downtown towers in the middle, a beach + ocean on the south edge, a port
// full of containers in the north-east, and a green park in the south-west.
import * as THREE from 'three';
import { clamp } from './utils.js';

export const ROAD_SPACING = 64;
export const ROAD_WIDTH = 12;
export const ROAD_COORDS = [-256, -192, -128, -64, 0, 64, 128, 192, 256];
export const CITY_HALF = 288;

// Fixed story places (world x,z). The missions module reads these.
export const PLACES = {
  garage: { x: 44, z: -20, name: "Lena's Garage" },
  packageA: { x: -160, z: 96, name: 'Package pickup' },
  deliverA: { x: 160, z: -160, name: 'Drop-off' },
  safehouse: { x: -224, z: 224, name: 'Safehouse' },
  portPickup: { x: 224, z: -224, name: 'Port warehouse' },
  boardwalk: { x: 64, z: 288, name: 'Boardwalk' },
  thorneTower: { x: 128, z: 128, name: 'Thorne Tower' },
  boat: { x: 0, z: 332, name: 'Escape boat' },
  plaza: { x: 0, z: 0, name: 'Solmar Plaza' },
};

function facadeTexture(rng, baseColor, litRatio) {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 128, 256);
  // Slight vertical shade so towers read as tall, not flat.
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, 'rgba(255,255,255,0.14)');
  grad.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 256);
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 6; col++) {
      const lit = rng.next() < litRatio;
      ctx.fillStyle = lit ? '#ffe9a8' : 'rgba(20,30,45,0.85)';
      ctx.fillRect(8 + col * 20, 12 + row * 20, 13, 11);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makePalm(rng) {
  const group = new THREE.Group();
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8a6a44 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 5.2, 6), trunkMat);
  trunk.position.y = 2.6;
  trunk.rotation.z = rng.range(-0.12, 0.12);
  trunk.castShadow = true;
  group.add(trunk);
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x3aa855, side: THREE.DoubleSide });
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.7), leafMat);
    const a = (i / 7) * Math.PI * 2;
    // Drooping fronds: each leaf points outward from the trunk top.
    leaf.position.set(Math.cos(a) * 1.1, 5.3, Math.sin(a) * 1.1);
    leaf.rotation.order = 'YXZ';
    leaf.rotation.y = -a + Math.PI / 2;
    leaf.rotation.x = 0.6;
    leaf.castShadow = true;
    group.add(leaf);
  }
  return group;
}

export function buildCity(scene, rng) {
  const city = {
    buildings: [], // { minX, maxX, minZ, maxZ, height } for collision
    trafficLights: [], // { x, z, phase } — one per intersection
    roadCoords: ROAD_COORDS,
    bounds: CITY_HALF,
  };

  // --- Sky, sun, light -------------------------------------------------
  scene.background = new THREE.Color(0x87bfe8);
  scene.fog = new THREE.Fog(0x9fc8e8, 240, 780);
  const sun = new THREE.DirectionalLight(0xfff1c4, 2.6);
  sun.position.set(180, 260, 120);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -340; sun.shadow.camera.right = 340;
  sun.shadow.camera.top = 340; sun.shadow.camera.bottom = -340;
  sun.shadow.camera.far = 900;
  sun.shadow.bias = -0.0006;
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xbfe3ff, 0x8a7a5a, 0.9));

  // --- Ground: grass base, asphalt roads, sand beach, ocean -----------
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1100, 1100),
    new THREE.MeshLambertMaterial({ color: 0x7fae62 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const roadMat = new THREE.MeshLambertMaterial({ color: 0x3a3d42 });
  const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0x9aa0a3 });
  for (const c of ROAD_COORDS) {
    for (const [w, l, x, z] of [
      [ROAD_WIDTH + 8, 2 * CITY_HALF + 16, c, 0],
      [2 * CITY_HALF + 16, ROAD_WIDTH + 8, 0, c],
    ]) {
      const walk = new THREE.Mesh(new THREE.PlaneGeometry(w, l), sidewalkMat);
      walk.rotation.x = -Math.PI / 2;
      walk.position.set(x, 0.02, z);
      walk.receiveShadow = true;
      scene.add(walk);
    }
    for (const [w, l, x, z] of [
      [ROAD_WIDTH, 2 * CITY_HALF + 16, c, 0],
      [2 * CITY_HALF + 16, ROAD_WIDTH, 0, c],
    ]) {
      const road = new THREE.Mesh(new THREE.PlaneGeometry(w, l), roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(x, 0.04, z);
      road.receiveShadow = true;
      scene.add(road);
    }
  }
  // Dashed centre lines on every road.
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xf5e9c8 });
  const dashGeo = new THREE.PlaneGeometry(0.5, 4);
  for (const c of ROAD_COORDS) {
    for (let t = -CITY_HALF; t < CITY_HALF; t += 12) {
      for (const [x, z, rot] of [[c, t, 0], [t, c, Math.PI / 2]]) {
        const dash = new THREE.Mesh(dashGeo, lineMat);
        dash.rotation.x = -Math.PI / 2;
        dash.rotation.z = rot;
        dash.position.set(x, 0.06, z);
        scene.add(dash);
      }
    }
  }

  // Beach (south edge) and ocean beyond it.
  const sand = new THREE.Mesh(
    new THREE.PlaneGeometry(1100, 90),
    new THREE.MeshLambertMaterial({ color: 0xe8d49a }),
  );
  sand.rotation.x = -Math.PI / 2;
  sand.position.set(0, 0.03, 332);
  sand.receiveShadow = true;
  scene.add(sand);
  const ocean = new THREE.Mesh(
    new THREE.PlaneGeometry(1100, 320),
    new THREE.MeshLambertMaterial({ color: 0x2a7fae }),
  );
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(0, 0.02, 540);
  scene.add(ocean);
  // Gentle white surf line where water meets sand.
  const surf = new THREE.Mesh(
    new THREE.PlaneGeometry(1100, 3),
    new THREE.MeshBasicMaterial({ color: 0xeaf7ff }),
  );
  surf.rotation.x = -Math.PI / 2;
  surf.position.set(0, 0.05, 378);
  scene.add(surf);

  // --- Buildings -------------------------------------------------------
  const palette = ['#e8b48a', '#d98a7a', '#a8c8d8', '#e8d8a8', '#c8a8d8', '#f0e0c8', '#88a8c8', '#d8b090'];
  const facadeCache = palette.map((c) => facadeTexture(rng, c, 0.35));
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x5a5f66 });
  for (let bx = 0; bx < ROAD_COORDS.length - 1; bx++) {
    for (let bz = 0; bz < ROAD_COORDS.length - 1; bz++) {
      const x0 = ROAD_COORDS[bx] + ROAD_WIDTH / 2 + 4;
      const x1 = ROAD_COORDS[bx + 1] - ROAD_WIDTH / 2 - 4;
      const z0 = ROAD_COORDS[bz] + ROAD_WIDTH / 2 + 4;
      const z1 = ROAD_COORDS[bz + 1] - ROAD_WIDTH / 2 - 4;
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      // Park block: south-west, no buildings, just green + trees.
      if (bx === 1 && bz === 6) {
        const lawn = new THREE.Mesh(
          new THREE.PlaneGeometry(x1 - x0 + 8, z1 - z0 + 8),
          new THREE.MeshLambertMaterial({ color: 0x5da24a }),
        );
        lawn.rotation.x = -Math.PI / 2;
        lawn.position.set(cx, 0.05, cz);
        lawn.receiveShadow = true;
        scene.add(lawn);
        for (let i = 0; i < 10; i++) {
          const tree = makePalm(rng);
          tree.position.set(rng.range(x0, x1), 0, rng.range(z0, z1));
          scene.add(tree);
        }
        continue;
      }
      // Port block: north-east, containers instead of buildings.
      if (bx >= 6 && bz === 0) {
        const yard = new THREE.Mesh(
          new THREE.PlaneGeometry(x1 - x0 + 8, z1 - z0 + 8),
          new THREE.MeshLambertMaterial({ color: 0x8a8578 }),
        );
        yard.rotation.x = -Math.PI / 2;
        yard.position.set(cx, 0.05, cz);
        yard.receiveShadow = true;
        scene.add(yard);
        const contColors = [0xc8552e, 0x2e7fc8, 0x3a9e4e, 0xd8b02e];
        for (let i = 0; i < 5; i++) {
          const cont = new THREE.Mesh(
            boxGeo,
            new THREE.MeshLambertMaterial({ color: contColors[i % 4] }),
          );
          cont.scale.set(rng.range(8, 14), 2.6, 3);
          cont.position.set(rng.range(x0 + 6, x1 - 6), 1.3, rng.range(z0 + 4, z1 - 4));
          cont.rotation.y = rng.chance(0.5) ? 0 : Math.PI / 2;
          cont.castShadow = true;
          scene.add(cont);
          city.buildings.push({
            minX: cont.position.x - 7, maxX: cont.position.x + 7,
            minZ: cont.position.z - 7, maxZ: cont.position.z + 7, height: 2.6,
          });
        }
        continue;
      }
      const downtown = Math.abs(cx) < 130 && Math.abs(cz) < 130;
      const count = downtown && rng.chance(0.4) ? 1 : rng.int(1, 3);
      for (let i = 0; i < count; i++) {
        const w = rng.range(14, Math.min(30, (x1 - x0) / count - 4));
        const d = rng.range(14, 26);
        const h = downtown ? rng.range(26, 62) : rng.range(8, 24);
        const px = x0 + ((i + 0.5) / count) * (x1 - x0) + rng.range(-3, 3);
        const pz = cz + rng.range(-8, 8);
        const mat = new THREE.MeshLambertMaterial({ map: facadeCache[rng.int(0, facadeCache.length - 1)] });
        const b = new THREE.Mesh(boxGeo, mat);
        b.scale.set(w, h, d);
        b.position.set(px, h / 2, pz);
        b.castShadow = true;
        b.receiveShadow = true;
        scene.add(b);
        const roof = new THREE.Mesh(boxGeo, roofMat);
        roof.scale.set(w + 0.6, 0.5, d + 0.6);
        roof.position.set(px, h + 0.25, pz);
        scene.add(roof);
        city.buildings.push({
          minX: px - w / 2, maxX: px + w / 2,
          minZ: pz - d / 2, maxZ: pz + d / 2, height: h,
        });
      }
    }
  }

  // --- Street props: lamps, traffic lights, trees, palms on the beach --
  const lampMat = new THREE.MeshLambertMaterial({ color: 0x2c2f33 });
  const lampHeadMat = new THREE.MeshBasicMaterial({ color: 0xffe9a8 });
  for (const ix of ROAD_COORDS) {
    for (const iz of ROAD_COORDS) {
      city.trafficLights.push({ x: ix, z: iz, phase: (ix + iz) / 64 });
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6, 6), lampMat);
      pole.position.set(ix + 8, 3, iz + 8);
      pole.castShadow = true;
      scene.add(pole);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), lampHeadMat);
      head.position.set(ix + 8, 6.1, iz + 8);
      scene.add(head);
      // Traffic-light post on the opposite corner.
      const tlPole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 5, 6), lampMat);
      tlPole.position.set(ix - 8, 2.5, iz - 8);
      scene.add(tlPole);
      const tlBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1.8, 0.7),
        new THREE.MeshLambertMaterial({ color: 0x1c1e20 }),
      );
      tlBox.position.set(ix - 8, 5.6, iz - 8);
      scene.add(tlBox);
      const tlLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0x37d67a }),
      );
      tlLight.position.set(ix - 8, 5.9, iz - 7.6);
      tlLight.name = `tl-${ix}-${iz}`;
      scene.add(tlLight);
    }
  }
  for (let i = 0; i < 16; i++) {
    const palm = makePalm(rng);
    palm.position.set(-280 + i * 37, 0, 306);
    scene.add(palm);
  }
  // Fluffy low-poly clouds drifting high above the city.
  const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  for (let i = 0; i < 12; i++) {
    const cloud = new THREE.Group();
    for (let j = 0; j < 3; j++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(rng.range(6, 12), 8, 6), cloudMat);
      puff.position.set(j * 9 - 9, rng.range(-1, 1), rng.range(-3, 3));
      puff.scale.y = 0.45;
      cloud.add(puff);
    }
    cloud.position.set(rng.range(-300, 300), rng.range(90, 130), rng.range(-300, 300));
    scene.add(cloud);
  }

  // Lena's garage: a low teal building with a sign block, at the fixed place.
  const garage = new THREE.Mesh(
    boxGeo,
    new THREE.MeshLambertMaterial({ color: 0x2e8f86 }),
  );
  garage.scale.set(26, 7, 16);
  garage.position.set(PLACES.garage.x, 3.5, PLACES.garage.z);
  garage.castShadow = true;
  scene.add(garage);
  city.buildings.push({
    minX: PLACES.garage.x - 13, maxX: PLACES.garage.x + 13,
    minZ: PLACES.garage.z - 8, maxZ: PLACES.garage.z + 8, height: 7,
  });
  // Escape boat at the beach.
  const boat = new THREE.Group();
  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(10, 2.2, 4),
    new THREE.MeshLambertMaterial({ color: 0xf0f0f0 }),
  );
  hull.position.y = 1;
  boat.add(hull);
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2, 3),
    new THREE.MeshLambertMaterial({ color: 0x2e6fc8 }),
  );
  cabin.position.set(-1, 3, 0);
  boat.add(cabin);
  boat.position.set(PLACES.boat.x, 0.4, PLACES.boat.z + 14);
  scene.add(boat);

  return city;
}

// Push a circle (x,z,r) out of every building AABB it overlaps.
// Returns true when a push happened.
export function collideBuildings(city, x, z, r) {
  let hit = false;
  for (const b of city.buildings) {
    if (x + r < b.minX || x - r > b.maxX || z + r < b.minZ || z - r > b.maxZ) continue;
    const dxl = x + r - b.minX, dxr = b.maxX - (x - r);
    const dzl = z + r - b.minZ, dzr = b.maxZ - (z - r);
    const m = Math.min(dxl, dxr, dzl, dzr);
    if (m === dxl) x = b.minX - r;
    else if (m === dxr) x = b.maxX + r;
    else if (m === dzl) z = b.minZ - r;
    else z = b.maxZ + r;
    hit = true;
  }
  return { x, z, hit };
}

// True when the NS road at this intersection has a green light.
export function nsGreen(city, ix, iz, time) {
  const light = city.trafficLights.find((l) => l.x === ix && l.z === iz);
  const phase = light ? light.phase : 0;
  return (Math.floor(time / 5 + phase) % 2) === 0;
}

// True when the point (x,z) is inside any building footprint.
export function pointInBuilding(city, x, z) {
  for (const b of city.buildings) {
    if (x > b.minX - 0.5 && x < b.maxX + 0.5 && z > b.minZ - 0.5 && z < b.maxZ + 0.5) return true;
  }
  return false;
}

export function nearestRoadCoord(v) {
  let best = ROAD_COORDS[0], bd = Infinity;
  for (const c of ROAD_COORDS) {
    const d = Math.abs(v - c);
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}

export function clampToCity(v) {
  return clamp(v, -CITY_HALF - 40, 380);
}
