// ─── GameCanvas ───────────────────────────────────────────────────────────────
// The core canvas component — owns the rAF loop, game state, and input handling.
import React, { useEffect, useRef, useCallback } from 'react';
import type { GameState } from '../game/types';
import { CANVAS_W, CANVAS_H } from '../game/types';
import { createPlayer } from '../game/entities';
import { createStars } from '../game/starfield';
import { spawnWave } from '../game/waves';
import { createInputState, attachInputListeners } from '../game/input';
import { tickGame } from '../game/gameLoop';
import { renderFrame } from '../game/renderer';

interface GameCanvasProps {
  onStateChange: (state: GameState) => void;
  gameKey: number;  // increment to restart
}

function makeInitialState(highScore: number): GameState {
  return {
    player: createPlayer(),
    bullets: [],
    enemies: spawnWave(1),
    particles: [],
    pickups: [],
    stars: createStars(220),
    score: 0,
    wave: 1,
    enemiesKilled: 0,
    shotsFired: 0,
    shotsHit: 0,
    screenShake: 0,
    phase: 'playing',
    waveClearTimer: 0,
    highScore,
  };
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onStateChange, gameKey }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const inputRef = useRef(createInputState());

  const startLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const highScore = parseInt(localStorage.getItem('zerog_highscore') ?? '0', 10);
    stateRef.current = makeInitialState(highScore);

    const cleanup = attachInputListeners(canvas, inputRef.current);

    let shotsTotal = 0;

    const loop = () => {
      frameRef.current += 1;
      const frame = frameRef.current;
      const state = stateRef.current!;
      const input = inputRef.current;

      tickGame(
        state,
        input,
        frame,
        () => { shotsTotal += 1; },
        () => {},
      );

      renderFrame(ctx, state, frame, input.mouseX, input.mouseY);

      // Notify React of state snapshot for overlay renders (~10fps)
      if (frame % 6 === 0) {
        onStateChange({ ...state, player: { ...state.player } });
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return cleanup;
  }, [onStateChange]);

  useEffect(() => {
    const cleanup = startLoop();
    return () => {
      cancelAnimationFrame(rafRef.current);
      cleanup?.();
    };
  }, [startLoop, gameKey]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="block cursor-none"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
