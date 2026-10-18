// ─── Wave Manager ──────────────────────────────────────────────────────────
// Controls enemy spawn patterns, scaling, and boss waves

import type { Enemy, GameState } from './types';
import { createEnemy } from './entities';

interface WaveConfig {
  drones: number;
  heavies: number;
  hasBoss: boolean;
}

function getWaveConfig(wave: number): WaveConfig {
  const hasBoss = wave % 3 === 0;
  const base = Math.min(wave - 1, 8);
  return {
    drones: hasBoss ? 0 : 3 + base * 2,
    heavies: hasBoss ? 0 : Math.max(0, wave - 2),
    hasBoss,
  };
}

export function spawnWave(wave: number): Enemy[] {
  const cfg = getWaveConfig(wave);
  const enemies: Enemy[] = [];

  if (cfg.hasBoss) {
    enemies.push(createEnemy('boss', wave));
    // Boss escort
    const escorts = Math.floor(wave / 3);
    for (let i = 0; i < escorts; i++) {
      enemies.push(createEnemy('drone', wave));
    }
  } else {
    for (let i = 0; i < cfg.drones; i++) enemies.push(createEnemy('drone', wave));
    for (let i = 0; i < cfg.heavies; i++) enemies.push(createEnemy('heavy', wave));
  }

  return enemies;
}

export function isWaveClear(state: GameState): boolean {
  return (
    state.phase === 'playing' &&
    state.enemies.length === 0
  );
}

export function getWaveLabel(wave: number): string {
  if (wave % 3 === 0) return `BOSS WAVE ${wave}`;
  return `WAVE ${wave}`;
}
