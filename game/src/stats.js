// stats.js — career stats, tracked live by the game (distance, time,
// money deltas, steals, escapes, jumps, mission ratings). Never staged.
export function medalFor(t, steps) {
  return t <= 75 * steps ? 'GOLD' : t <= 150 * steps ? 'SILVER' : 'BRONZE';
}
export function createStats() {
  return { cars: 0, cops: 0, dist: 0, longest: 0, earned: 0, time: 0, ratings: {}, missionStart: 0, lastMoney: 250, lastX: null, lastZ: null };
}
export function completionPct(S, shells, jumps, total) {
  return Math.round(((Object.keys(S.ratings).length / total) + (shells / 12) + (jumps / 5)) / 3 * 100);
}
export function updateStats(G, dt) {
  const S = G.stats;
  if (!S) return;
  S.time += dt;
  if (S.lastX === null) { S.lastX = G.player.pos.x; S.lastZ = G.player.pos.z; }
  else { S.dist += Math.hypot(G.player.pos.x - S.lastX, G.player.pos.z - S.lastZ); S.lastX = G.player.pos.x; S.lastZ = G.player.pos.z; }
  if (G.money > S.lastMoney) S.earned += G.money - S.lastMoney;
  S.lastMoney = G.money;
}
// After a teleport, resync so the jump in position is not distance.
export function resyncStats(G) {
  const S = G.stats;
  if (!S) return;
  S.lastX = G.player.pos.x; S.lastZ = G.player.pos.z; S.lastMoney = G.money;
}
export function noteMissionStart(G) { if (G.stats) G.stats.missionStart = G.time; }
export function noteMissionComplete(G, m) {
  const S = G.stats;
  if (!S) return;
  const t = Math.round(G.time - S.missionStart);
  const p = S.ratings[m.id];
  if (!p || t < p.time) S.ratings[m.id] = { time: t, medal: medalFor(t, m.steps.length) };
}
export const fmtTime = (s) => `${(s / 60) | 0}:${String(s % 60).padStart(2, '0')}`;
export function statsToJSON(S) {
  return { cars: S.cars, cops: S.cops, dist: Math.round(S.dist), longest: +S.longest.toFixed(2), earned: Math.round(S.earned), time: Math.round(S.time), ratings: S.ratings };
}
export function statsFromJSON(S, d) {
  if (!d) return;
  S.cars = d.cars || 0; S.cops = d.cops || 0; S.dist = d.dist || 0; S.longest = d.longest || 0; S.earned = d.earned || 0; S.time = d.time || 0; S.ratings = d.ratings || {};
}
