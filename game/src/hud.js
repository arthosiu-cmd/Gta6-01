// hud.js — the Solmar HUD: health bar, money, wanted stars, mission
// objective + distance, speed, clock, controls hint, toasts, and the
// top-down minimap canvas (roads, buildings, player arrow, waypoint,
// police blips, traffic dots, fare marker).
import { currentMission, currentStep, fareDestination } from './missions.js';
import { dist2D } from './utils.js';

export function createHud() {
  const el = (id) => document.getElementById(id);
  const hud = {
    root: el('hud'),
    healthFill: el('health-fill'),
    healthText: el('health-text'),
    money: el('money'),
    stars: el('stars'),
    objective: el('objective-text'),
    objectiveDist: el('objective-dist'),
    speed: el('speed'),
    clock: el('clock'),
    hint: el('hint'),
    toastEl: el('toast'),
    brief: el('brief'),
    briefTitle: el('brief-title'),
    briefText: el('brief-text'),
    minimap: el('minimap'),
    crosshair: el('crosshair'),
    toastTimer: 0,
    briefTimer: 0,
  };
  hud.minimapCtx = hud.minimap.getContext('2d');
  hud.toast = (text) => {
    hud.toastEl.textContent = text;
    hud.toastEl.style.opacity = '1';
    hud.toastTimer = 3.5;
  };
  hud.showBrief = (title, text) => {
    hud.briefTitle.textContent = title;
    hud.briefText.textContent = text;
    hud.brief.style.display = 'block';
    hud.briefTimer = 7;
  };
  return hud;
}

function drawMinimap(G) {
  const ctx = G.hud.minimapCtx;
  const S = 190; // canvas pixels
  const W = 800; // world units shown (city + beach)
  const toMap = (x, z) => [((x + W / 2) / W) * S, ((z + W / 2) / W) * S];
  ctx.clearRect(0, 0, S, S);
  ctx.fillStyle = 'rgba(20, 40, 30, 0.92)';
  ctx.fillRect(0, 0, S, S);
  // Ocean strip at the bottom (south).
  const [, oceanY] = toMap(0, 300);
  ctx.fillStyle = '#2a7fae';
  ctx.fillRect(0, oceanY, S, S - oceanY);
  // Sand.
  ctx.fillStyle = '#e8d49a';
  ctx.fillRect(0, oceanY - 8, S, 8);
  // Park.
  const [px, py] = toMap(-192, 160);
  ctx.fillStyle = '#3f7d33';
  ctx.fillRect(px, py, 14, 14);
  // Buildings.
  ctx.fillStyle = '#6a7076';
  for (const b of G.city.buildings) {
    const [x1, y1] = toMap(b.minX, b.minZ);
    const [x2, y2] = toMap(b.maxX, b.maxZ);
    ctx.fillRect(x1, y1, Math.max(1, x2 - x1), Math.max(1, y2 - y1));
  }
  // Roads.
  ctx.strokeStyle = '#c8ccd0';
  ctx.lineWidth = 2;
  for (const c of G.city.roadCoords) {
    const [ax] = toMap(c, 0);
    ctx.beginPath(); ctx.moveTo(ax, 0); ctx.lineTo(ax, S); ctx.stroke();
    const [, ay] = toMap(0, c);
    ctx.beginPath(); ctx.moveTo(0, ay); ctx.lineTo(S, ay); ctx.stroke();
  }
  // Traffic dots.
  ctx.fillStyle = '#ffd23e';
  for (const car of G.cars) {
    if (car.kind !== 'traffic') continue;
    const [x, y] = toMap(car.mesh.position.x, car.mesh.position.z);
    ctx.fillRect(x - 1, y - 1, 2, 2);
  }
  // Police blips (red/blue flashing).
  ctx.fillStyle = Math.floor(G.time * 3) % 2 === 0 ? '#ff2a2a' : '#2a6aff';
  for (const car of G.police.cars) {
    const [x, y] = toMap(car.mesh.position.x, car.mesh.position.z);
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
  }
  for (const cop of G.police.foot) {
    const [x, y] = toMap(cop.pos.x, cop.pos.z);
    ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
  }
  // Fare destination / waypoint (gold diamond).
  const step = currentStep(G);
  const fareDest = fareDestination(G);
  const target = fareDest || (G.missions.active && step && step.pos ? step.pos : null);
  if (target) {
    const [x, y] = toMap(target.x, target.z);
    const pulse = 4 + Math.sin(G.time * 4) * 1.5;
    ctx.fillStyle = '#ffd23e';
    ctx.beginPath();
    ctx.moveTo(x, y - pulse); ctx.lineTo(x + pulse, y);
    ctx.lineTo(x, y + pulse); ctx.lineTo(x - pulse, y);
    ctx.closePath(); ctx.fill();
  }
  // Player arrow (white, points along facing).
  const [px2, py2] = toMap(G.player.pos.x, G.player.pos.z);
  ctx.save();
  ctx.translate(px2, py2);
  ctx.rotate(Math.atan2(Math.sin(G.player.angle), Math.cos(G.player.angle)) + Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -6); ctx.lineTo(4.5, 5); ctx.lineTo(-4.5, 5);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  // North tick.
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('N', S - 12, 12);
}

export function updateHud(G, dt) {
  const hud = G.hud;
  hud.healthFill.style.width = `${Math.max(0, G.health)}%`;
  hud.healthFill.style.background = G.health > 50 ? '#37d67a' : G.health > 25 ? '#ffb02e' : '#ff3b30';
  hud.healthText.textContent = `${Math.round(G.health)}`;
  hud.money.textContent = `$${Math.round(G.money).toLocaleString('en-US')}`;
  let stars = '';
  for (let i = 0; i < 5; i++) stars += i < G.wanted ? '★' : '☆';
  hud.stars.textContent = stars;
  hud.stars.style.color = G.wanted > 0 ? '#ff3b30' : '#888888';
  const mission = currentMission(G);
  const step = currentStep(G);
  if (G.missions.storyDone) {
    hud.objective.textContent = 'Story complete — free roam Solmar!';
    hud.objectiveDist.textContent = '';
  } else if (G.missions.active && mission && step) {
    hud.objective.textContent = `${mission.title}: ${step.text}`;
    if (step.pos) {
      const d = Math.round(dist2D(G.player.pos.x, G.player.pos.z, step.pos.x, step.pos.z));
      hud.objectiveDist.textContent = `${d}m`;
    } else if (step.needCar) {
      hud.objectiveDist.textContent = 'find a car';
    } else {
      hud.objectiveDist.textContent = '';
    }
    if (step.time) {
      hud.objectiveDist.textContent = `${Math.ceil(G.missions.timer)}s · ${hud.objectiveDist.textContent}`;
    }
  } else {
    hud.objective.textContent = 'Free roam — press R for the next job';
    hud.objectiveDist.textContent = '';
  }
  const fare = fareDestination(G);
  if (fare) {
    hud.objective.textContent = `Fare: drive your passenger to the marker`;
    hud.objectiveDist.textContent = `${Math.round(dist2D(G.player.pos.x, G.player.pos.z, fare.x, fare.z))}m`;
  }
  const speed = G.player.onFoot
    ? Math.round(G.player.speed * 3.6)
    : Math.round(Math.abs(G.player.car ? G.player.car.speed : 0) * 3.6);
  hud.speed.textContent = G.player.onFoot ? `${speed} km/h on foot` : `${speed} km/h`;
  const hours = Math.floor(G.gameHour) % 24;
  const minutes = Math.floor((G.gameHour % 1) * 60);
  hud.clock.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  hud.hint.textContent = G.player.onFoot
    ? 'WASD move · Shift sprint · E enter car · F punch · Click/Space shoot · Q fare · R mission · M mute · Esc pause'
    : 'W/S drive · A/D steer · E exit car · Click/Space shoot · Q fare · R mission · M mute · Esc pause';
  if (hud.toastTimer > 0) {
    hud.toastTimer -= dt;
    if (hud.toastTimer <= 0) hud.toastEl.style.opacity = '0';
  }
  if (hud.briefTimer > 0) {
    hud.briefTimer -= dt;
    if (hud.briefTimer <= 0) hud.brief.style.display = 'none';
  }
  drawMinimap(G);
}
