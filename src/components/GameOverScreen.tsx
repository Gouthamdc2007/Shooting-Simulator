// ─── Game Over Screen ─────────────────────────────────────────────────────────
import React from 'react';
import type { GameState } from '../game/types';

interface GameOverProps {
  state: GameState;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverProps> = ({ state, onRestart }) => {
  const isNewHigh = state.score >= state.highScore && state.score > 0;
  const accuracy = state.shotsFired > 0
    ? Math.round((state.shotsHit / state.shotsFired) * 100)
    : 0;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm animate-slide-in">
      <div
        className="text-5xl font-mono font-bold tracking-[0.2em] uppercase mb-2"
        style={{ color: '#ff4444', textShadow: '0 0 30px #ff4444, 0 0 60px #ff444488' }}
      >
        HULL BREACH
      </div>
      <div className="text-sm font-mono text-gray-500 tracking-widest uppercase mb-8">
        Ship destroyed
      </div>

      {isNewHigh && (
        <div
          className="mb-4 px-6 py-2 rounded border font-mono text-sm tracking-widest animate-pulse-glow"
          style={{ color: '#ffcc00', borderColor: '#ffcc00', backgroundColor: '#ffcc0011' }}
        >
          ★ NEW HIGH SCORE ★
        </div>
      )}

      {/* Stats grid */}
      <div className="mb-8 font-mono text-sm w-64">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-red-700 to-transparent mb-4" />
        <div className="space-y-2">
          <StatRow label="Score" value={state.score.toLocaleString()} color="#ffffff" />
          <StatRow label="High Score" value={state.highScore.toLocaleString()} color="#ffcc00" />
          <StatRow label="Wave Reached" value={String(state.wave)} color="#00ffff" />
          <StatRow label="Enemies Killed" value={String(state.enemiesKilled)} color="#ff8844" />
          <StatRow label="Accuracy" value={`${accuracy}%`} color="#88ff88" />
        </div>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-red-700 to-transparent mt-4" />
      </div>

      {/* Restart */}
      <button
        onClick={onRestart}
        className="pointer-events-auto px-10 py-3 font-mono text-lg tracking-[0.3em] uppercase rounded border-2 transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          color: '#00ffff',
          borderColor: '#00ffff',
          backgroundColor: '#00ffff11',
          boxShadow: '0 0 20px #00ffff44, inset 0 0 20px #00ffff11',
        }}
      >
        RESPAWN
      </button>
    </div>
  );
};

const StatRow: React.FC<{ label: string; value: string; color: string }> = ({
  label, value, color,
}) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-500">{label}</span>
    <span style={{ color }}>{value}</span>
  </div>
);
