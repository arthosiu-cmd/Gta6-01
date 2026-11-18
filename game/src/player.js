// player.js — Rico Vega on foot: the character mesh, WASD movement
// relative to the camera, sprint, and the third-person chase camera.
// Driving lives in vehicles.js; this file owns the on-foot half.
import * as THREE from 'three';
import { clamp, damp } from './utils.js';
import { collideBuildings, clampToCity, pointInBuilding } from './city.js';

const SKIN = 0xc98d64;
const JACKET = 0x2e3a4e;
const JEANS = 0x3a5a8c;

export function createPlayerMesh() {
  const group = new THREE.Group();
  const skin = new THREE.MeshLambertMaterial({ color: SKIN });
  const jacket = new THREE.MeshLambertMaterial({ color: JACKET });
  const jeans = new THREE.MeshLambertMaterial({ color: JEANS });
  const hair = new THREE.MeshLambertMaterial({ color: 0x1a1210 });

  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.8, 0.24), jeans);
  legs.position.y = 0.4;
  group.add(legs);
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.62, 0.3), jacket);
  torso.position.y = 1.11;
  group.add(torso);
  // Open jacket stripe, for a readable silhouette at a distance.
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.32), new THREE.MeshLambertMaterial({ color: 0xd8b02e }));
  stripe.position.y = 1.11;
  group.add(stripe);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.32), skin);
  head.position.y = 1.62;
  group.add(head);
  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.14, 0.36), hair);
  hairTop.position.y = 1.84;
  group.add(hairTop);
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.6, 0.16), jacket);
  armL.position.set(-0.36, 1.12, 0);
  armL.name = 'armL';
  group.add(armL);
  const armR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.6, 0.16), jacket);
  armR.position.set(0.36, 1.12, 0);
  armR.name = 'armR';
  group.add(armR);
  // Pistol in the right hand, visible when armed.
  const gun = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.1, 0.42),
    new THREE.MeshLambertMaterial({ color: 0x1c1e20 }),
  );
  gun.position.set(0.36, 0.95, 0.2);
  gun.name = 'gun';
  gun.visible = false;
  group.add(gun);
  group.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return group;
}

export function createPlayerState(scene) {
  const mesh = createPlayerMesh();
  scene.add(mesh);
  return {
    mesh,
    pos: new THREE.Vector3(0, 0, 120),
    angle: Math.PI, // facing north, toward the plaza
    onFoot: true,
    car: null, // the vehicle object currently driven, or null
    speed: 0,
    walkPhase: 0,
    armed: true, // Rico always carries his pistol
  };
}

// Move on foot. camYaw is the camera orbit yaw; movement is relative to it.
export function updatePlayerOnFoot(G, dt) {
  const p = G.player;
  const input = G.input;
  const fwdX = -Math.sin(G.camYaw), fwdZ = -Math.cos(G.camYaw);
  const rightX = Math.cos(G.camYaw), rightZ = -Math.sin(G.camYaw);
  let mx = 0, mz = 0;
  if (input.isDown('KeyW')) { mx += fwdX; mz += fwdZ; }
  if (input.isDown('KeyS')) { mx -= fwdX; mz -= fwdZ; }
  if (input.isDown('KeyD')) { mx += rightX; mz += rightZ; }
  if (input.isDown('KeyA')) { mx -= rightX; mz -= rightZ; }
  const len = Math.hypot(mx, mz);
  const sprint = input.isDown('ShiftLeft') || input.isDown('ShiftRight');
  const targetSpeed = len > 0 ? (sprint ? 8.5 : 5) : 0;
  p.speed = damp(p.speed, targetSpeed, 8, dt);
  if (len > 0) {
    mx /= len; mz /= len;
    p.angle = Math.atan2(mx, mz);
    const nx = p.pos.x + mx * p.speed * dt;
    const nz = p.pos.z + mz * p.speed * dt;
    const fixed = collideBuildings(G.city, nx, nz, 0.7);
    p.pos.x = clampToCity(fixed.x);
    p.pos.z = clampToCity(fixed.z);
    p.walkPhase += dt * p.speed * 1.6;
  }
  p.pos.y = 0;
  p.mesh.position.copy(p.pos);
  p.mesh.rotation.y = p.angle;
  // Simple walk swing on the arms.
  const swing = len > 0 ? Math.sin(p.walkPhase) * 0.5 : 0;
  const armL = p.mesh.getObjectByName('armL');
  const armR = p.mesh.getObjectByName('armR');
  if (armL) armL.rotation.x = swing;
  if (armR) armR.rotation.x = -swing;
  p.mesh.getObjectByName('gun').visible = p.armed;
}

// Snap the camera straight to its chase position (no fly-in). Used when
// a shot mode stages a scene and when a game starts, so the first frame
// already frames the player instead of the camera's spawn point.
export function snapCamera(G) {
  const p = G.player;
  const target = p.onFoot ? p.pos : p.car.mesh.position;
  const dist = p.onFoot ? 8 : 9;
  const height = 2.8 + G.camPitch * 5;
  G.camera.position.set(
    target.x + Math.sin(G.camYaw) * dist,
    Math.max(target.y + height, 1.6),
    target.z + Math.cos(G.camYaw) * dist,
  );
  G.camera.lookAt(target.x, target.y + (p.onFoot ? 1.6 : 1.2), target.z);
}

// Third-person chase camera: sits behind the player (or the driven car),
// smoothed, mouse orbits it. Never goes under the ground.
export function updateCamera(G, dt) {
  const p = G.player;
  const target = p.onFoot ? p.pos : p.car.mesh.position;
  const heading = p.onFoot ? p.angle : p.car.angle;
  // Camera yaw follows the heading unless the mouse orbited it recently.
  const desiredYaw = heading + Math.PI + G.camOrbit;
  G.camYaw = damp(G.camYaw, desiredYaw, 1.6, dt);
  // Mouse orbit accumulates into camOrbit; the yaw damps toward
  // heading + PI + orbit, so the camera follows but lets you look around.
  G.camOrbit = clamp(G.camOrbit - G.input.mouseDX * 0.0032, -Math.PI, Math.PI);
  G.camPitch = clamp(G.camPitch - G.input.mouseDY * 0.0022, -0.15, 0.7);
  const baseDist = p.onFoot ? 8 : 9;
  const height = 2.8 + G.camPitch * 5;
  // Pull the camera in when a building stands between it and the player,
  // so the view never ends up inside a wall or a roof.
  let dist = baseDist;
  let cx = target.x + Math.sin(G.camYaw) * dist;
  let cz = target.z + Math.cos(G.camYaw) * dist;
  while (dist > 3.5 && pointInBuilding(G.city, cx, cz)) {
    dist -= 0.6;
    cx = target.x + Math.sin(G.camYaw) * dist;
    cz = target.z + Math.cos(G.camYaw) * dist;
  }
  const cy = Math.max(target.y + height, 1.6);
  G.camera.position.set(
    damp(G.camera.position.x, cx, 8, dt),
    damp(G.camera.position.y, cy, 8, dt),
    damp(G.camera.position.z, cz, 8, dt),
  );
  G.camera.lookAt(target.x, target.y + (p.onFoot ? 1.6 : 1.2), target.z);
}
