// ─── Wave Clear Banner ────────────────────────────────────────────────────────
import React from 'react';

interface WaveClearProps {
  nextWave: number;
}

export const WaveClearBanner: React.FC<WaveClearProps> = ({ nextWave }) => {
  const isBoss = nextWave % 3 === 0;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none animate-slide-in">
      <div
        className="text-4xl font-mono font-bold tracking-[0.2em] uppercase animate-pulse-glow"
        style={{
          color: '#00ffcc',
          textShadow: '0 0 20px #00ffcc, 0 0 40px #00ffcc88',
        }}
      >
        SECTOR CLEARED
      </div>
      <div
        className="mt-3 text-xl font-mono tracking-[0.3em] uppercase"
        style={{
          color: isBoss ? '#ff44ff' : '#00ffff',
          textShadow: isBoss ? '0 0 15px #ff44ff' : '0 0 15px #00ffff',
        }}
      >
        {isBoss ? `⚠ BOSS INCOMING — WAVE ${nextWave}` : `WAVE ${nextWave} APPROACHING`}
      </div>
    </div>
  );
};
