// save.js — localStorage save/load for Solmar.
// Saves money, story progress, health and the player's position so
// Continue on the start screen picks up where the player left off.
const SAVE_KEY = 'solmar-save-v1';

export function saveGame(state) {
  try {
    const data = {
      version: 1,
      savedAt: Date.now(),
      money: Math.round(state.money),
      missionIndex: state.missions.index,
      health: Math.round(state.health),
      px: +state.player.pos.x.toFixed(1),
      pz: +state.player.pos.z.toFixed(1),
      angle: +state.player.angle.toFixed(2),
      storyDone: state.missions.storyDone,
    };
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    return false; // private mode / no storage: play on without saving
  }
}

export function loadSave() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.version !== 1) return null;
    return data;
  } catch (err) {
    return null;
  }
}

export function clearSave() {
  try { window.localStorage.removeItem(SAVE_KEY); } catch (err) { /* ignore */ }
}

export function applySave(state, data) {
  state.money = data.money;
  state.health = data.health;
  state.missions.index = data.missionIndex;
  state.missions.storyDone = !!data.storyDone;
  state.player.pos.x = data.px;
  state.player.pos.z = data.pz;
  state.player.angle = data.angle;
  state.player.pos.y = 0;
}
