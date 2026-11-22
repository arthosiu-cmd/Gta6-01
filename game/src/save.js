// save.js — localStorage save/load for Solmar.
const SAVE_KEY = 'solmar-save-v1';

export function saveGame(state) {
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
    };
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    return false;
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
}
