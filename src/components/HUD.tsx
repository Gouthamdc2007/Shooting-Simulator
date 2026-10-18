// ─── HUD Component ────────────────────────────────────────────────────────────
import React from 'react';
import type { GameState } from '../game/types';
import { WEAPON_LABELS, WEAPON_COLORS } from '../game/types';
import { getWaveLabel } from '../game/waves';
import { clamp } from '../game/utils';

interface HUDProps {
  state: GameState;
}

export const HUD: React.FC<HUDProps> = ({ state }) => {
  const { player, score, wave, enemiesKilled, shotsFired, shotsHit } = state;
  const accuracy = shotsFired > 0 ? Math.round((shotsHit / shotsFired) * 100) : 0;
  const hpPct = clamp(player.hp / player.maxHp, 0, 1) * 100;
  const bombPct = clamp(1 - player.gravBombCooldown / player.gravBombMaxCooldown, 0, 1) * 100;
  const weaponColor = WEAPON_COLORS[player.weapon];

  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between px-4 pt-3 gap-4">
        {/* Left: HP */}
        <div className="flex flex-col gap-1 min-w-[160px]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-cyan-400 font-mono tracking-widest">HULL</span>
            <span className="text-xs text-white font-mono">{Math.max(0, player.hp)}/{player.maxHp}</span>
          </div>
          <div className="w-40 h-3 bg-gray-900 border border-cyan-900 rounded-sm overflow-hidden">
            <div
              className="h-full transition-all duration-100 rounded-sm"
              style={{
                width: `${hpPct}%`,
                backgroundColor: hpPct > 50 ? '#22c55e' : hpPct > 25 ? '#f97316' : '#ef4444',
                boxShadow: `0 0 8px ${hpPct > 50 ? '#22c55e' : '#ef4444'}`,
              }}
            />
          </div>
        </div>

        {/* Center: Wave + Score */}
        <div className="flex flex-col items-center gap-0.5">
          <span
            className="text-xs font-mono tracking-[0.3em] uppercase"
            style={{ color: wave % 3 === 0 ? '#cc44ff' : '#00ffff' }}
          >
            {getWaveLabel(wave)}
          </span>
          <span className="text-2xl font-mono text-white tabular-nums">
            {score.toLocaleString()}
          </span>
          <span className="text-[10px] text-gray-500 font-mono">SCORE</span>
        </div>

        {/* Right: Stats */}
        <div className="flex flex-col items-end gap-0.5 text-[10px] font-mono text-gray-400 min-w-[120px]">
          <span>KILLS: <span className="text-white">{enemiesKilled}</span></span>
          <span>ACC: <span className="text-yellow-400">{accuracy}%</span></span>
          <span>HI: <span className="text-cyan-400">{state.highScore.toLocaleString()}</span></span>
        </div>
      </div>

      {/* Bottom bar: Weapon + Bomb */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-4 pb-3">
        {/* Weapon */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono text-gray-500 tracking-widest">WEAPON</span>
          <div
            className="px-3 py-1 rounded border font-mono text-xs tracking-widest"
            style={{
              color: weaponColor,
              borderColor: weaponColor,
              boxShadow: `0 0 10px ${weaponColor}44`,
              backgroundColor: `${weaponColor}11`,
            }}
          >
            {WEAPON_LABELS[player.weapon]}
          </div>
        </div>

        {/* Gravity Bomb */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-mono text-gray-500 tracking-widest">
            GRAVITY BOMB {player.gravBombCooldown > 0 ? `[${Math.ceil(player.gravBombCooldown / 60)}s]` : '[READY]'}
          </span>
          <div className="w-36 h-3 bg-gray-900 border border-purple-900 rounded-sm overflow-hidden">
            <div
              className="h-full rounded-sm transition-all duration-100"
              style={{
                width: `${bombPct}%`,
                backgroundColor: bombPct >= 100 ? '#a855f7' : '#6b21a8',
                boxShadow: bombPct >= 100 ? '0 0 10px #a855f7' : 'none',
              }}
            />
          </div>
          <span className="text-[9px] font-mono text-purple-400">SPACE to detonate</span>
        </div>
      </div>
    </div>
  );
};
