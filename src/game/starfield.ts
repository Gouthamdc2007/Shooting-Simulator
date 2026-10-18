// ─── Starfield Background ────────────────────────────────────────────────────
import type { Star } from './types';
import { CANVAS_W, CANVAS_H } from './types';
import { randomBetween } from './utils';

export function createStars(count = 220): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * CANVAS_W,
    y: Math.random() * CANVAS_H,
    z: randomBetween(0.1, 1.0),  // depth layer
    size: randomBetween(0.5, 2.5),
    brightness: randomBetween(0.3, 1.0),
  }));
}

export function updateStars(stars: Star[], speed = 0.3): void {
  for (const s of stars) {
    s.y += speed * s.z;  // far stars scroll slower
    if (s.y > CANVAS_H + 5) {
      s.y = -5;
      s.x = Math.random() * CANVAS_W;
    }
  }
}

export function drawStarfield(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
): void {
  for (const s of stars) {
    const alpha = s.brightness * s.z;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * s.z, 0, Math.PI * 2);
    ctx.fill();
    // occasional blue-tinted bright stars
    if (s.brightness > 0.8 && s.z > 0.7) {
      ctx.globalAlpha = alpha * 0.4;
      ctx.shadowColor = '#aaddff';
      ctx.shadowBlur = 4;
      ctx.fillStyle = '#aaddff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * s.z * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  ctx.globalAlpha = 1;
}
