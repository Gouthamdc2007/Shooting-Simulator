// ─── Start Screen ─────────────────────────────────────────────────────────────
import React from 'react';

interface StartScreenProps {
  highScore: number;
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ highScore, onStart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-slide-in">
      {/* Title */}
      <div className="mb-2 text-center">
        <div
          className="text-6xl font-mono font-bold tracking-[0.15em] uppercase animate-pulse-glow"
          style={{ color: '#00ffff', textShadow: '0 0 30px #00ffff, 0 0 60px #00ffff88' }}
        >
          ZERO-G
        </div>
        <div
          className="text-3xl font-mono tracking-[0.4em] uppercase mt-1"
          style={{ color: '#aa44ff', textShadow: '0 0 20px #aa44ff' }}
        >
          ANTIGRAVITY
        </div>
        <div className="text-sm font-mono tracking-[0.6em] text-cyan-600 mt-2 uppercase">
          Space Shooter
        </div>
      </div>

      {/* Divider */}
      <div className="w-64 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent my-8" />

      {/* Controls */}
      <div className="mb-8 text-center font-mono text-sm space-y-2">
        <div className="text-gray-400 tracking-widest text-xs mb-4 uppercase">Controls</div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-left">
          <span className="text-cyan-500">WASD</span><span className="text-gray-300">Move (with inertia drift)</span>
          <span className="text-cyan-500">Mouse</span><span className="text-gray-300">Aim 360°</span>
          <span className="text-cyan-500">LMB / Z</span><span className="text-gray-300">Fire weapon</span>
          <span className="text-cyan-500">SPACE</span><span className="text-gray-300">Gravity Bomb (AoE)</span>
        </div>
      </div>

      {/* High score */}
      {highScore > 0 && (
        <div className="mb-6 font-mono text-sm">
          <span className="text-gray-500">HIGH SCORE: </span>
          <span className="text-yellow-400">{highScore.toLocaleString()}</span>
        </div>
      )}

      {/* Start button */}
      <button
        onClick={onStart}
        className="pointer-events-auto px-10 py-3 font-mono text-lg tracking-[0.3em] uppercase rounded border-2 transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          color: '#00ffff',
          borderColor: '#00ffff',
          backgroundColor: '#00ffff11',
          boxShadow: '0 0 20px #00ffff44, inset 0 0 20px #00ffff11',
          textShadow: '0 0 10px #00ffff',
        }}
      >
        LAUNCH
      </button>

      <div className="mt-6 text-[10px] font-mono text-gray-600 tracking-widest text-center">
        BOSS EVERY 3 WAVES · COLLECT WEAPON DROPS · SURVIVE
      </div>
    </div>
  );
};
