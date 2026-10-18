// ─── App ──────────────────────────────────────────────────────────────────────
import { useState, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { WaveClearBanner } from './components/WaveClearBanner';
import type { GameState } from './game/types';
import { CANVAS_W, CANVAS_H } from './game/types';

type AppPhase = 'start' | 'playing' | 'game_over';

export default function App() {
  const [appPhase, setAppPhase] = useState<AppPhase>('start');
  const [gameKey, setGameKey] = useState(0);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [highScore, setHighScore] = useState<number>(
    () => parseInt(localStorage.getItem('zerog_highscore') ?? '0', 10),
  );

  const handleStateChange = useCallback((s: GameState) => {
    setGameState(s);
    if (s.phase === 'game_over' && appPhase === 'playing') {
      setHighScore(s.highScore);
      setAppPhase('game_over');
    }
  }, [appPhase]);

  const handleStart = () => {
    setGameKey((k) => k + 1);
    setGameState(null);
    setAppPhase('playing');
  };

  const handleRestart = () => {
    setGameKey((k) => k + 1);
    setGameState(null);
    setAppPhase('playing');
  };

  return (
    <div className="flex items-center justify-center w-full h-full bg-black">
      {/* Canvas container */}
      <div
        className="relative overflow-hidden"
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          boxShadow: '0 0 40px #00ffff22, 0 0 80px #00ffff11',
          border: '1px solid #00ffff22',
        }}
      >
        {/* Always render canvas (keeps starfield alive on start screen) */}
        {(appPhase === 'playing' || appPhase === 'game_over') && (
          <GameCanvas
            key={gameKey}
            gameKey={gameKey}
            onStateChange={handleStateChange}
          />
        )}

        {/* Starfield-only canvas for start screen */}
        {appPhase === 'start' && <StartCanvas />}

        {/* HUD layer (playing only) */}
        {appPhase === 'playing' && gameState && (
          <HUD state={gameState} />
        )}

        {/* Wave clear banner */}
        {appPhase === 'playing' && gameState?.phase === 'wave_clear' && (
          <WaveClearBanner nextWave={gameState.wave + 1} />
        )}

        {/* Start screen overlay */}
        {appPhase === 'start' && (
          <StartScreen highScore={highScore} onStart={handleStart} />
        )}

        {/* Game over overlay */}
        {appPhase === 'game_over' && gameState && (
          <GameOverScreen state={gameState} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
}

// Lightweight animated starfield for the start screen
import { useEffect, useRef } from 'react';
import { createStars, updateStars, drawStarfield } from './game/starfield';

function StartCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const stars = createStars(220);
    let raf: number;
    const draw = () => {
      updateStars(stars, 0.3);
      ctx.fillStyle = '#000005';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      drawStarfield(ctx, stars);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="block"
    />
  );
}
