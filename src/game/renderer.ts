// ─── Renderer ────────────────────────────────────────────────────────────────
// Composes all drawing calls in correct z-order

import type { GameState } from './types';
import { CANVAS_W, CANVAS_H, WEAPON_COLORS } from './types';
import { drawStarfield } from './starfield';
import { drawPlayer, drawEnemy, drawBullets, drawPickups } from './entities';
import { drawParticles } from './particles';

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  frame: number,
  mouseX: number,
  mouseY: number,
): void {
  const shake = state.screenShake > 0
    ? { x: (Math.random() - 0.5) * state.screenShake * 0.7, y: (Math.random() - 0.5) * state.screenShake * 0.7 }
    : { x: 0, y: 0 };

  ctx.save();
  ctx.translate(shake.x, shake.y);

  // Background
  ctx.fillStyle = '#000005';
  ctx.fillRect(-10, -10, CANVAS_W + 20, CANVAS_H + 20);

  // Starfield
  drawStarfield(ctx, state.stars);

  // Grid overlay (subtle)
  drawGrid(ctx);

  // Pickups
  drawPickups(ctx, state.pickups, frame);

  // Bullets (behind enemies)
  drawBullets(ctx, state.bullets);

  // Enemies
  for (const e of state.enemies) {
    drawEnemy(ctx, e);
  }

  // Particles (above enemies)
  drawParticles(ctx, state.particles);

  // Player
  if (state.phase === 'playing' || state.phase === 'wave_clear') {
    drawPlayer(ctx, state.player, frame);
  }

  // Reticle
  if (state.phase === 'playing') {
    drawReticle(ctx, mouseX, mouseY, state.player.weapon, frame);
  }

  ctx.restore();
}

function drawGrid(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(0,100,180,0.06)';
  ctx.lineWidth = 1;
  const spacing = 60;
  for (let x = 0; x < CANVAS_W; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_H);
    ctx.stroke();
  }
  for (let y = 0; y < CANVAS_H; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_W, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawReticle(
  ctx: CanvasRenderingContext2D,
  mx: number, my: number,
  weapon: string,
  frame: number,
): void {
  const color = WEAPON_COLORS[weapon as keyof typeof WEAPON_COLORS] ?? '#00ffff';
  const rotation = frame * 0.04;
  const pulse = 1 + Math.sin(frame * 0.15) * 0.1;

  ctx.save();
  ctx.translate(mx, my);
  ctx.rotate(rotation);
  ctx.scale(pulse, pulse);

  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;

  // Outer ring
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.stroke();

  // Cross hairs (4 short lines)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18);
    ctx.lineTo(Math.cos(a) * 26, Math.sin(a) * 26);
    ctx.stroke();
  }

  // Center dot
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
