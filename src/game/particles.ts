// ─── Particle Engine ──────────────────────────────────────────────────────────
import type { Particle } from './types';
import { randomBetween } from './utils';

export function spawnExplosion(
  particles: Particle[],
  x: number,
  y: number,
  count: number,
  colorMain: string,
  large = false,
): void {
  const sparkColors = [colorMain, '#ffffff', '#ffff00', '#ff8800'];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomBetween(large ? 2 : 0.5, large ? 8 : 4);
    const life = randomBetween(20, large ? 60 : 40);
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      maxLife: life,
      radius: randomBetween(large ? 3 : 1, large ? 6 : 3),
      color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
      type: 'spark',
      alpha: 1,
    });
  }

  // debris rings for large explosions
  if (large) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = randomBetween(1, 3);
      const life = randomBetween(30, 50);
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        radius: randomBetween(4, 8),
        color: '#ff4400',
        type: 'debris',
        alpha: 1,
      });
    }
    // smoke
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const life = randomBetween(40, 80);
      particles.push({
        x, y,
        vx: Math.cos(angle) * 0.5,
        vy: Math.sin(angle) * 0.5,
        life,
        maxLife: life,
        radius: randomBetween(10, 20),
        color: '#666666',
        type: 'smoke',
        alpha: 0.5,
      });
    }
    // shockwave ring
    particles.push({
      x, y,
      vx: 0, vy: 0,
      life: 20, maxLife: 20,
      radius: 5,
      color: '#ffffff',
      type: 'ring',
      alpha: 0.8,
    });
  }
}

export function spawnImpactSparks(
  particles: Particle[],
  x: number,
  y: number,
  angle: number,
  color: string,
): void {
  for (let i = 0; i < 5; i++) {
    const spread = (Math.random() - 0.5) * 1.5;
    const speed = randomBetween(1, 3);
    const life = randomBetween(8, 18);
    particles.push({
      x, y,
      vx: Math.cos(angle + Math.PI + spread) * speed,
      vy: Math.sin(angle + Math.PI + spread) * speed,
      life, maxLife: life,
      radius: randomBetween(1, 2.5),
      color,
      type: 'spark',
      alpha: 1,
    });
  }
}

export function spawnGravBombEffect(
  particles: Particle[],
  cx: number,
  cy: number,
): void {
  for (let i = 0; i < 80; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomBetween(3, 12);
    const life = randomBetween(30, 70);
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life, maxLife: life,
      radius: randomBetween(2, 6),
      color: i % 2 === 0 ? '#aa00ff' : '#00ffff',
      type: 'spark',
      alpha: 1,
    });
  }
  // Big ring
  for (let i = 0; i < 3; i++) {
    particles.push({
      x: cx, y: cy,
      vx: 0, vy: 0,
      life: 25 + i * 8,
      maxLife: 25 + i * 8,
      radius: 5 + i * 10,
      color: '#aa00ff',
      type: 'ring',
      alpha: 1,
    });
  }
}

export function updateParticles(particles: Particle[]): Particle[] {
  return particles.filter((p) => {
    p.life -= 1;
    if (p.life <= 0) return false;

    const t = p.life / p.maxLife;
    p.alpha = t;

    if (p.type === 'spark' || p.type === 'debris') {
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.x += p.vx;
      p.y += p.vy;
    } else if (p.type === 'smoke') {
      p.x += p.vx;
      p.y += p.vy;
      p.radius += 0.3;
      p.alpha = t * 0.3;
    } else if (p.type === 'ring') {
      p.radius += 4;
      p.alpha = t * 0.6;
    }

    return true;
  });
}

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
): void {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);

    if (p.type === 'ring') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (p.type === 'smoke') {
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
