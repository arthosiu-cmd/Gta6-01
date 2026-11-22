// save.js — localStorage save/load, 3 slots (slot 1 keeps the old key).
import { statsToJSON, statsFromJSON } from './stats.js';

const SAVE_KEYS = ['solmar-save-v1', 'solmar-save-v2', 'solmar-save-v3'];
const slotKey = (slot) => SAVE_KEYS[Math.min(Math.max(slot || 1, 1), 3) - 1];

export function saveGame(state, slot = 1) {
  try {
    const data = {
      version: 1,
      savedAt: Date.now(),
      money: Math.round(state.money),
      missionIndex: state.missions.index,
      health: Math.round(state.health),
      rep: Math.round(state.rep || 0),
      px: +state.player.pos.x.toFixed(1),
      pz: +state.player.pos.z.toFixed(1),
      angle: +state.player.angle.toFixed(2),
      storyDone: state.missions.storyDone,
      stats: state.stats ? statsToJSON(state.stats) : null,
    };
    window.localStorage.setItem(slotKey(slot), JSON.stringify(data));
    return true;
  } catch (err) {
    return false;
  }
}

export function loadSave(slot = 1) {
  try {
    const raw = window.localStorage.getItem(slotKey(slot));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.version !== 1) return null;
    return data;
  } catch (err) {
    return null;
  }
}


export function applySave(state, data) {
  state.money = data.money;
  state.health = data.health;
  state.rep = data.rep || 0;
  state.missions.index = data.missionIndex;
  state.missions.storyDone = !!data.storyDone;
  state.player.pos.x = data.px;
  state.player.pos.z = data.pz;
  state.player.angle = data.angle;
  state.player.pos.y = 0;
  if (state.stats) {
    statsFromJSON(state.stats, data.stats);
    state.stats.lastX = data.px;
    state.stats.lastZ = data.pz;
    state.stats.lastMoney = data.money;
  }
}
