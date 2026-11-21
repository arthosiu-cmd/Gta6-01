// input.js — keyboard + mouse state for Solmar.
export function createInput(canvas) {
  const input = {
    keys: {},
    mouseDX: 0,
    mouseDY: 0,
    clicked: false,
    locked: false,
    pressed: {},
  };

  const GAME_KEYS = [
    'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight',
    'KeyE', 'KeyF', 'KeyQ', 'KeyR', 'KeyM', 'Space', 'Escape',
  ];

  window.addEventListener('keydown', (e) => {
    if (GAME_KEYS.includes(e.code)) e.preventDefault();
    if (!input.keys[e.code]) input.pressed[e.code] = true;
    input.keys[e.code] = true;
  });
  window.addEventListener('keyup', (e) => {
    input.keys[e.code] = false;
  });
  window.addEventListener('blur', () => {
    input.keys = {};
  });

  canvas.addEventListener('click', () => {
    input.clicked = true;
    if (!input.locked && document.pointerLockElement !== canvas) {
      try { canvas.requestPointerLock(); } catch (err) { /* pointer lock is optional */ }
    }
  });
  document.addEventListener('pointerlockchange', () => {
    input.locked = document.pointerLockElement === canvas;
  });
  document.addEventListener('mousemove', (e) => {
    if (input.locked) {
      input.mouseDX += e.movementX;
      input.mouseDY += e.movementY;
    }
  });
  // Touch fallback: drag on the canvas orbits the camera.
  let lastTouch = null;
  canvas.addEventListener('touchstart', (e) => {
    lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  canvas.addEventListener('touchmove', (e) => {
    if (!lastTouch) return;
    input.mouseDX += (e.touches[0].clientX - lastTouch.x) * 2;
    input.mouseDY += (e.touches[0].clientY - lastTouch.y) * 2;
    lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  input.isDown = (code) => !!input.keys[code];
  input.wasPressed = (code) => {
    const hit = !!input.pressed[code];
    if (hit) input.pressed[code] = false;
    return hit;
  };
  // Called at the end of each frame: clears per-frame deltas.
  input.endFrame = () => {
    input.mouseDX = 0;
    input.mouseDY = 0;
    input.clicked = false;
  };
  return input;
}
