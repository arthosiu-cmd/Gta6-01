// police blips, traffic dots, fare marker).
import { currentMission, currentStep, fareDestination, tailTarget, tailZone, huntTarget, raceTarget, rankForRep, missionHeader, MISSIONS } from './missions.js';
import { districtAt, PLACES } from './city.js';
import { WEAPONS, magText } from './combat.js';
import { dist2D } from './utils.js';
import { completionPct, fmtTime } from './stats.js';
import { loadSave } from './save.js';

export function createHud() {
  const el = (id) => document.getElementById(id);
  const hud = {
    root: el('hud'),
    healthFill: el('health-fill'),
    healthText: el('health-text'),
    money: el('money'),
    rep: el('rep'),
    repFill: el('rep-fill'),
    stars: el('stars'),
    objective: el('objective-text'),
    objectiveDist: el('objective-dist'),
    missionHead: el('mission-head'),
    missionNext: el('mission-next'),
    district: el('district'),
    speed: el('speed'),
    clock: el('clock'),
    radio: el('radio'),
    hint: el('hint'),
    toastEl: el('toast'),
    brief: el('brief'),
    briefTitle: el('brief-title'),
    briefText: el('brief-text'),
    briefPortrait: el('brief-portrait'),
    briefName: el('brief-name'),
    minimap: el('minimap'),
    crosshair: el('crosshair'),
    dispatch: el('dispatch'),
    dispatchHead: el('dispatch-head'),
    dispatchRows: el('dispatch-rows'),
    airunit: el('airunit'),
    los: el('los'),
    side: el('side'),
    weapons: el('weapons'),
    pauseComplete: el('pause-complete'),
    pauseStats: el('pause-stats'),
    pauseRatings: el('pause-ratings'),
    pauseMap: el('pause-map'),
    toastTimer: 0,
    briefTimer: 0,
  };
  hud.minimapCtx = hud.minimap.getContext('2d');
  hud.toast = (text) => {
    hud.toastEl.textContent = text;
    hud.toastEl.style.opacity = '1';
    hud.toastTimer = 3.5;
  };
  hud.showBrief = (title, text, speaker) => {
    hud.briefTitle.textContent = title;
    hud.briefText.textContent = text;
    if (speaker) {
      hud.briefPortrait.style.display = 'flex';
      hud.briefPortrait.textContent = speaker.initials;
      hud.briefPortrait.style.background = speaker.color;
      hud.briefName.style.display = 'block';
      hud.briefName.textContent = `${speaker.name} · ${speaker.role}`;
    } else {
      hud.briefPortrait.style.display = 'none';
      hud.briefName.style.display = 'none';
    }
    hud.brief.style.display = 'block';
    hud.briefTimer = 7;
  };
  // Pause / career screen: real tracked numbers only, plus the map.
  hud.showPause = (G) => {
    const S = G.stats;
    if (!S) return;
    const done = Object.keys(S.ratings).length;
    hud.pauseComplete.textContent = `${completionPct(S, G.missions.shellsGot, G.missions.jumpsGot, MISSIONS.length)}% COMPLETE`;
    hud.pauseStats.textContent = [
      `CARS STOLEN ${S.cars} · COPS ESCAPED ${S.cops}`,
      `DISTANCE ${(S.dist / 1000).toFixed(1)} km · LONGEST JUMP ${S.longest.toFixed(1)}s`,
      `SHELLS ${G.missions.shellsGot}/12 · JUMPS ${G.missions.jumpsGot}/5`,
      `JOBS DONE ${done}/9 · MONEY EARNED $${Math.round(S.earned).toLocaleString('en-US')}`,
      `REP ${Math.round(G.rep || 0)} · TIME PLAYED ${fmtTime(Math.round(S.time))}`,
    ].join('\n');
    hud.pauseRatings.textContent = MISSIONS.map((m) => {
      const r = S.ratings[m.id];
      return r ? `JOB ${m.id} ${m.title} — ${r.medal} ${fmtTime(r.time)}` : `JOB ${m.id} ${m.title} — —`;
    }).join('\n');
    for (let i = 1; i <= 3; i++) {
      const b = document.getElementById(`slot-${i}`);
      const d = loadSave(i);
      b.textContent = d ? `SLOT ${i} — $${Math.round(d.money).toLocaleString('en-US')} · JOB ${d.missionIndex + 1}/9` : `SLOT ${i} — EMPTY`;
    }
    drawPauseMap(G);
  };
  return hud;
}

// Shared map base for the minimap and the pause full map: land,
// ocean, park, buildings, roads, job target. Returns toMap.
function drawMapBase(G, ctx, S) {
  const W = 800;
  const toMap = (x, z) => [((x + W / 2) / W) * S, ((z + W / 2) / W) * S];
  ctx.clearRect(0, 0, S, S);
  ctx.fillStyle = '#14281e';
  ctx.fillRect(0, 0, S, S);
  const [, oceanY] = toMap(0, 300);
  ctx.fillStyle = '#2a7fae';
  ctx.fillRect(0, oceanY, S, S - oceanY);
  ctx.fillStyle = '#e8d49a';
  ctx.fillRect(0, oceanY - 8, S, 8);
  const [px, py] = toMap(-192, 160);
  ctx.fillStyle = '#3f7d33';
  ctx.fillRect(px, py, 14, 14);
  ctx.fillStyle = '#6a7076';
  for (const b of G.city.buildings) {
    const [x1, y1] = toMap(b.minX, b.minZ);
    const [x2, y2] = toMap(b.maxX, b.maxZ);
    ctx.fillRect(x1, y1, Math.max(1, x2 - x1), Math.max(1, y2 - y1));
  }
  ctx.strokeStyle = '#c8ccd0';
  ctx.lineWidth = 2;
  for (const c of G.city.roadCoords) {
    const [ax] = toMap(c, 0);
    ctx.beginPath(); ctx.moveTo(ax, 0); ctx.lineTo(ax, S); ctx.stroke();
    const [, ay] = toMap(0, c);
    ctx.beginPath(); ctx.moveTo(0, ay); ctx.lineTo(S, ay); ctx.stroke();
  }
  const step = currentStep(G);
  const target = fareDestination(G) || tailTarget(G) || huntTarget(G) || raceTarget(G) || (G.missions.active && step && step.pos ? step.pos : null);
  if (target) {
    const [x, y] = toMap(target.x, target.z);
    const r = 4 + Math.sin(G.time * 4) * 1.5;
    ctx.fillStyle = '#ffd23e';
    ctx.beginPath();
    ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y);
    ctx.closePath(); ctx.fill();
  }
  return toMap;
}

function drawArrow(ctx, x, y, angle, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -s); ctx.lineTo(s * 0.75, s * 0.85); ctx.lineTo(-s * 0.75, s * 0.85);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// Full map for the pause screen: districts, places, shells, ramps.
function drawPauseMap(G) {
  const cv = G.hud.pauseMap;
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const S = 340;
  const toMap = drawMapBase(G, ctx, S);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 3;
  for (const [x, z] of [[0, 300], [220, -220], [-220, 0], [0, -220], [110, 110], [-110, 110]]) {
    const [lx, ly] = toMap(x, z);
    ctx.fillText(districtAt(x, z), lx - 28, ly);
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffd23e';
  for (const p of Object.values(PLACES)) {
    const [x, y] = toMap(p.x, p.z);
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#ff7fb0';
  for (const s of G.missions.shells) {
    if (s.taken) continue;
    const [x, y] = toMap(s.mesh.position.x, s.mesh.position.z);
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#ff8c2e';
  for (const j of G.missions.jumps) {
    if (j.done) continue;
    const [x, y] = toMap(j.x, j.z);
    ctx.fillRect(x - 2, y - 2, 4, 4);
  }
  const [qx, qy] = toMap(G.player.pos.x, G.player.pos.z);
  drawArrow(ctx, qx, qy, Math.atan2(Math.sin(G.player.angle), Math.cos(G.player.angle)) + Math.PI, 8);
}

function drawMinimap(G) {
  const ctx = G.hud.minimapCtx;
  const S = 190;
  const toMap = drawMapBase(G, ctx, S);
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
  // Air unit blip (white ring).
  if (G.police.heli) {
    const [x, y] = toMap(G.police.heli.group.position.x, G.police.heli.group.position.z);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.stroke();
  }
  // Player arrow (white, points along facing).
  const [px2, py2] = toMap(G.player.pos.x, G.player.pos.z);
  // Search zone (wanted >= 3): red circle on the minimap, centred
  // on the player, 60 m across the world.
  if (G.wanted >= 3) {
    ctx.fillStyle = 'rgba(255,42,42,0.10)';
    ctx.strokeStyle = '#ff2a2a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(px2, py2, (60 / 800) * S, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  drawArrow(ctx, px2, py2, Math.atan2(Math.sin(G.player.angle), Math.cos(G.player.angle)) + Math.PI, 6);
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
  // REP rank + XP bar (missions and fares feed it; save.js persists it).
  const rank = rankForRep(G.rep || 0);
  hud.rep.textContent = rank.next
    ? `REP ${rank.rank} · ${rank.name} — ${Math.round(G.rep || 0)} / ${rank.next} XP`
    : `REP ${rank.rank} · ${rank.name} — MAX`;
  hud.repFill.style.width = rank.next
    ? `${Math.min(100, ((G.rep - rank.floor) / (rank.next - rank.floor)) * 100)}%`
    : '100%';
  let stars = '';
  for (let i = 0; i < 5; i++) stars += i < G.wanted ? '★' : '☆';
  hud.stars.textContent = stars;
  hud.stars.style.color = G.wanted > 0 ? '#ff3b30' : '#888888';
  const mission = currentMission(G);
  const step = currentStep(G);
  // Mission header: JOB x/9, STAGE pips, NEXT step.
  const head = missionHeader(G);
  if (head) {
    hud.missionHead.textContent = `JOB ${head.job}/${head.total} · ${head.title}`;
    hud.missionNext.textContent = `STAGE ${head.stage}/${head.stages} ${'●'.repeat(head.stage)}${'○'.repeat(head.stages - head.stage)} · NEXT: ${head.next}`;
  } else if (G.missions.storyDone) {
    hud.missionHead.textContent = 'STORY COMPLETE · FREE ROAM';
    hud.missionNext.textContent = '';
  } else {
    hud.missionHead.textContent = 'FREE ROAM';
    hud.missionNext.textContent = 'Press R for the next job';
  }
  // District / street label, bottom-left.
  hud.district.textContent = `${districtAt(G.player.pos.x, G.player.pos.z)} · Solmar`;
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
  // close, too far, or on the edge.
  if (step && step.tail) {
    hud.objective.textContent = 'Shadow the Courier: stay in the zone';
    const tail = G.missions.tail;
    if (tail && tail.car) {
      const d = Math.round(dist2D(G.player.pos.x, G.player.pos.z, tail.car.mesh.position.x, tail.car.mesh.position.z));
      hud.objectiveDist.textContent = `${d}m · ${Math.ceil(20 - tail.hold)}s · ${tailZone(d)}`;
    } else {
      hud.objectiveDist.textContent = 'find the courier';
    }
  }
  // spelling it out here wrapped the bar onto a second line.
  if (step && step.layLow) {
    const ll = G.missions.layLow;
    const remain = ll ? Math.ceil(ll.remain) : step.layLow;
    hud.objectiveDist.textContent = `${remain}s · ${G.wanted}★`;
  }
  // four punches (or three shots) put him down.
  if (step && step.hunt) {
    const hunt = G.missions.hunt;
    if (hunt && hunt.ped) {
      const d = Math.round(dist2D(G.player.pos.x, G.player.pos.z, hunt.ped.mesh.position.x, hunt.ped.mesh.position.z));
      hud.objectiveDist.textContent = `${d}m · ${Math.max(0, Math.round(hunt.ped.health))} HP`;
    } else {
      hud.objectiveDist.textContent = 'find the enforcer';
    }
  }
  if (step && step.race) {
    const race = G.missions.race;
    const idx = race ? race.idx : 0;
    const rival = G.missions.rival;
    const rivalText = rival ? ` · Rival ${rival.idx + 1}/5` : '';
    hud.objectiveDist.textContent = `Checkpoint ${idx + 1}/5 · ${Math.ceil(G.missions.timer)}s${rivalText}`;
  }
  const speed = G.player.onFoot
    ? Math.round(G.player.speed * 3.6)
    : Math.round(Math.abs(G.player.car ? G.player.car.speed : 0) * 3.6);
  hud.speed.textContent = G.player.onFoot
    ? `${speed} km/h on foot`
    : (G.player.car
      ? `${speed} km/h · ${G.player.car.name} · COND ${Math.round(G.player.car.condition)}%`
      : `${speed} km/h`);
  // Dispatch panel: every live police unit by callsign, kind, live
  // distance and role (nearest first, 5 rows max, then "+n more").
  const units = [];
  for (const car of G.police.cars) {
    const d = Math.round(dist2D(G.player.pos.x, G.player.pos.z, car.mesh.position.x, car.mesh.position.z));
    const role = car.roadblock ? 'ROADBLOCK' : (d < 8 ? 'RAMMING' : 'PURSUIT');
    units.push({ call: car.callsign || 'UNIT', kind: 'CRUISER', d, role });
  }
  if (G.police.heli) {
    const h = G.police.heli.group.position;
    const d = Math.round(dist2D(G.player.pos.x, G.player.pos.z, h.x, h.z));
    units.push({ call: 'AIR-1', kind: 'AIR UNIT', d, role: 'SPOTLIGHT' });
  }
  units.sort((a, b) => a.d - b.d);
  if (units.length > 0) {
    hud.dispatch.style.display = 'block';
    hud.dispatchHead.textContent = `SOLMAR PD — ${units.length} UNITS · CODE ${G.wanted}`;
    const shown = units.slice(0, 5);
    let rows = shown.map((u) => `${u.call} ${u.kind} ${u.d}m ${u.role}`).join('\n');
    if (units.length > 5) rows += `\n+${units.length - 5} more`;
    hud.dispatchRows.textContent = rows;
  } else {
    hud.dispatch.style.display = 'none';
  }
  hud.airunit.style.display = G.police.heli ? 'block' : 'none';
  // Line-of-sight chip (wanted >= 3): IN SIGHT red, HIDDEN green.
  if (hud.los) {
    if (G.wanted >= 3) {
      hud.los.style.display = 'block';
      hud.los.textContent = G.police.seen ? '◉ IN SIGHT' : '○ HIDDEN';
      hud.los.style.color = G.police.seen ? '#ff3b30' : '#37d67a';
    } else {
      hud.los.style.display = 'none';
    }
  }
  // Exploration counters: Sunset Shells + stunt jumps, both real.
  if (hud.side) {
    hud.side.textContent = `SHELLS ${G.missions.shellsGot || 0}/12 · JUMPS ${G.missions.jumpsGot || 0}/5`;
  }
  // Weapon slots: 1–4 with magazine counts, active slot highlighted.
  if (hud.weapons) {
    hud.weapons.innerHTML = WEAPONS.map((w, i) => {
      const mag = i === G.combat.weapon ? magText(G) : (Number.isFinite(w.mag) ? `${G.combat.mags[i]}/${w.mag}` : '∞');
      const label = `${w.key} ${w.name} ${mag}`;
      return i === G.combat.weapon ? `<span class="active">[${label}]</span>` : label;
    }).join(' · ');
  }
  const hours = Math.floor(G.gameHour) % 24;
  const minutes = Math.floor((G.gameHour % 1) * 60);
  hud.clock.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const station = G.audio && G.audio.currentStation ? G.audio.currentStation() : null;
  if (station) hud.radio.textContent = `SOLMAR FM ${station.freq} · ${station.name} — '${station.track}'`;
  hud.hint.textContent = G.player.onFoot
    ? 'WASD move · Shift sprint · E enter car · F punch · Click/Space shoot · 1–4 weapons · Q fare · R mission · M mute · N radio · Esc/P pause'
    : 'W/S drive · A/D steer · E exit car · Click/Space shoot · 1–4 weapons · Q fare · R mission · M mute · N radio · Esc/P pause';
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
