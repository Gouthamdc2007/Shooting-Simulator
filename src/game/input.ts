// ─── Input Manager ────────────────────────────────────────────────────────────
// Captures keyboard and mouse state, exposed as a plain object (no React state)

export interface InputState {
  keys: Set<string>;
  mouseX: number;
  mouseY: number;
  mouseDown: boolean;
  canvasOffsetX: number;
  canvasOffsetY: number;
}

export function createInputState(): InputState {
  return {
    keys: new Set<string>(),
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    canvasOffsetX: 0,
    canvasOffsetY: 0,
  };
}

export function attachInputListeners(
  canvas: HTMLCanvasElement,
  state: InputState,
): () => void {
  const onKeyDown = (e: KeyboardEvent) => {
    state.keys.add(e.code);
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
      e.preventDefault();
    }
  };
  const onKeyUp = (e: KeyboardEvent) => state.keys.delete(e.code);
  const onMouseMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    state.mouseX = e.clientX - rect.left;
    state.mouseY = e.clientY - rect.top;
  };
  const onMouseDown = (e: MouseEvent) => {
    if (e.button === 0) state.mouseDown = true;
  };
  const onMouseUp = (e: MouseEvent) => {
    if (e.button === 0) state.mouseDown = false;
  };
  const onContextMenu = (e: MouseEvent) => e.preventDefault();

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('contextmenu', onContextMenu);

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('mouseup', onMouseUp);
    canvas.removeEventListener('contextmenu', onContextMenu);
  };
}

export function isMoving(input: InputState): { left: boolean; right: boolean; up: boolean; down: boolean } {
  return {
    left: input.keys.has('KeyA') || input.keys.has('ArrowLeft'),
    right: input.keys.has('KeyD') || input.keys.has('ArrowRight'),
    up: input.keys.has('KeyW') || input.keys.has('ArrowUp'),
    down: input.keys.has('KeyS') || input.keys.has('ArrowDown'),
  };
}

export function isGravBomb(input: InputState): boolean {
  return input.keys.has('Space');
}

export function isShooting(input: InputState): boolean {
  return input.mouseDown || input.keys.has('KeyZ');
}
