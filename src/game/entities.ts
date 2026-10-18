// ─── Entity Manager ───────────────────────────────────────────────────────────
// Handles creation, spawning, and rendering of Player, Enemies, Bullets, Pickups

import type {
  Player, Enemy, Bullet, WeaponPickup, EnemyType, WeaponType,
} from './types';
import { CANVAS_W, CANVAS_H, WEAPON_COLORS } from './types';
import { nextId, randomBetween, angleTo, normalize } from './utils';

// ── Player ───────────────────────────────────────────────────────────────────

export function createPlayer(): Player {
  return {
    x: CANVAS_W / 2,
    y: CANVAS_H - 100,
    vx: 0, vy: 0,
    angle: -Math.PI / 2,
    radius: 18,
    hp: 100,
    maxHp: 100,
    weapon: 'single',
    weaponTimer: 0,
    gravBombCooldown: 0,
    gravBombMaxCooldown: 300,
    invincibleFrames: 0,
  };
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  p: Player,
  frame: number,
): void {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle + Math.PI / 2);

  if (p.invincibleFrames > 0 && Math.floor(frame / 3) % 2 === 0) {
    ctx.restore();
    return;
  }

  // Engine glow
  const engineGlow = ctx.createRadialGradient(0, 12, 0, 0, 12, 20);
  engineGlow.addColorStop(0, 'rgba(0,200,255,0.8)');
  engineGlow.addColorStop(1, 'rgba(0,200,255,0)');
  ctx.fillStyle = engineGlow;
  ctx.beginPath();
  ctx.arc(0, 14, 16, 0, Math.PI * 2);
  ctx.fill();

  // Ship body
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 14;
  ctx.strokeStyle = '#00ffff';
  ctx.fillStyle = '#003344';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -20);       // nose
  ctx.lineTo(14, 14);       // right wing
  ctx.lineTo(6, 8);         // right indent
  ctx.lineTo(0, 14);        // center back
  ctx.lineTo(-6, 8);        // left indent
  ctx.lineTo(-14, 14);      // left wing
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cockpit
  ctx.fillStyle = WEAPON_COLORS[p.weapon];
  ctx.shadowColor = WEAPON_COLORS[p.weapon];
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.ellipse(0, -6, 4, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ── Bullets ───────────────────────────────────────────────────────────────────

export function createPlayerBullets(
  player: Player,
  mouseAngle: number,
): Bullet[] {
  const bullets: Bullet[] = [];
  const color = WEAPON_COLORS[player.weapon];
  const speed = 14;
  const cos = Math.cos(mouseAngle);
  const sin = Math.sin(mouseAngle);

  const base: Omit<Bullet, 'id' | 'x' | 'y' | 'vx' | 'vy' | 'angle'> = {
    radius: 4,
    active: true,
    damage: 15,
    fromPlayer: true,
    color,
    life: 60,
    maxLife: 60,
  };

  switch (player.weapon) {
    case 'single':
      bullets.push({
        ...base, id: nextId(),
        x: player.x + cos * player.radius,
        y: player.y + sin * player.radius,
        vx: cos * speed, vy: sin * speed,
        angle: mouseAngle,
      });
      break;

    case 'double': {
      const perp = mouseAngle + Math.PI / 2;
      const offset = 8;
      for (const sign of [-1, 1]) {
        bullets.push({
          ...base, id: nextId(),
          x: player.x + Math.cos(perp) * offset * sign + cos * player.radius,
          y: player.y + Math.sin(perp) * offset * sign + sin * player.radius,
          vx: cos * speed, vy: sin * speed,
          angle: mouseAngle,
        });
      }
      break;
    }

    case 'spread': {
      for (const spread of [-0.25, -0.1, 0, 0.1, 0.25]) {
        const a = mouseAngle + spread;
        bullets.push({
          ...base, id: nextId(),
          x: player.x + cos * player.radius,
          y: player.y + sin * player.radius,
          vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
          angle: a, damage: 10, radius: 3,
        });
      }
      break;
    }

    case 'rapid':
      bullets.push({
        ...base, id: nextId(),
        x: player.x + cos * player.radius,
        y: player.y + sin * player.radius,
        vx: cos * (speed + 2), vy: sin * (speed + 2),
        angle: mouseAngle, damage: 10, radius: 3,
      });
      break;
  }

  return bullets;
}

export function createEnemyBullet(
  ex: number, ey: number, targetX: number, targetY: number,
): Bullet {
  const angle = angleTo(ex, ey, targetX, targetY);
  const speed = 5;
  return {
    id: nextId(),
    x: ex, y: ey,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    angle, radius: 4,
    active: true,
    damage: 10,
    fromPlayer: false,
    color: '#ff4444',
    life: 90, maxLife: 90,
  };
}

export function updateBullets(
  bullets: Bullet[],
): Bullet[] {
  return bullets.filter((b) => {
    b.x += b.vx;
    b.y += b.vy;
    b.life -= 1;
    if (!b.active || b.life <= 0) return false;
    if (b.x < -20 || b.x > CANVAS_W + 20 || b.y < -20 || b.y > CANVAS_H + 20) return false;
    return true;
  });
}

export function drawBullets(
  ctx: CanvasRenderingContext2D,
  bullets: Bullet[],
): void {
  for (const b of bullets) {
    ctx.save();
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = b.color;
    // Draw as elongated bolt
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle);
    ctx.beginPath();
    const len = b.fromPlayer ? 12 : 8;
    ctx.ellipse(0, 0, b.radius * 0.6, len * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Bright core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, b.radius * 0.3, len * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Enemies ───────────────────────────────────────────────────────────────────

const ENEMY_CONFIGS: Record<EnemyType, Partial<Enemy>> = {
  drone: {
    radius: 14, hp: 30, maxHp: 30,
    shieldHp: 0, maxShieldHp: 0,
    speed: 2.2, shootInterval: 90, scoreValue: 50, dropWeapon: false,
  },
  heavy: {
    radius: 22, hp: 80, maxHp: 80,
    shieldHp: 40, maxShieldHp: 40,
    speed: 0.9, shootInterval: 60, scoreValue: 150, dropWeapon: true,
  },
  boss: {
    radius: 42, hp: 500, maxHp: 500,
    shieldHp: 200, maxShieldHp: 200,
    speed: 0.6, shootInterval: 35, scoreValue: 1000, dropWeapon: true,
  },
};

export function createEnemy(type: EnemyType, wave: number): Enemy {
  const cfg = ENEMY_CONFIGS[type];
  const hpScale = 1 + wave * 0.12;
  const edge = Math.floor(Math.random() * 3); // spawn from top/left/right edges
  let x = 0, y = 0;
  if (edge === 0) { x = randomBetween(40, CANVAS_W - 40); y = -60; }
  else if (edge === 1) { x = -60; y = randomBetween(40, CANVAS_H / 2); }
  else { x = CANVAS_W + 60; y = randomBetween(40, CANVAS_H / 2); }

  return {
    id: nextId(),
    x, y,
    vx: 0, vy: 0,
    angle: 0,
    active: true,
    shootTimer: Math.floor(Math.random() * 60),
    ...cfg,
    hp: Math.floor((cfg.hp ?? 30) * hpScale),
    maxHp: Math.floor((cfg.hp ?? 30) * hpScale),
    shieldHp: Math.floor((cfg.shieldHp ?? 0) * hpScale),
    maxShieldHp: Math.floor((cfg.shieldHp ?? 0) * hpScale),
    radius: cfg.radius ?? 14,
    speed: (cfg.speed ?? 2) + wave * 0.05,
    shootInterval: Math.max(20, (cfg.shootInterval ?? 80) - wave * 3),
    scoreValue: cfg.scoreValue ?? 50,
    dropWeapon: cfg.dropWeapon ?? false,
    type,
  } as Enemy;
}

export function updateEnemy(
  enemy: Enemy,
  playerX: number,
  playerY: number,
  newBullets: Bullet[],
  frame: number,
): void {
  const toPlayerAngle = angleTo(enemy.x, enemy.y, playerX, playerY);
  enemy.angle = toPlayerAngle;

  switch (enemy.type) {
    case 'drone': {
      // Zigzag dash toward player
      const zigzag = Math.sin(frame * 0.08 + enemy.id) * 1.5;
      const perp = toPlayerAngle + Math.PI / 2;
      enemy.vx += Math.cos(toPlayerAngle) * 0.15 + Math.cos(perp) * zigzag * 0.1;
      enemy.vy += Math.sin(toPlayerAngle) * 0.15 + Math.sin(perp) * zigzag * 0.1;
      const spd = Math.sqrt(enemy.vx ** 2 + enemy.vy ** 2);
      if (spd > enemy.speed) {
        enemy.vx = (enemy.vx / spd) * enemy.speed;
        enemy.vy = (enemy.vy / spd) * enemy.speed;
      }
      break;
    }
    case 'heavy': {
      const [nx, ny] = normalize(playerX - enemy.x, playerY - enemy.y);
      enemy.vx = nx * enemy.speed;
      enemy.vy = ny * enemy.speed;
      break;
    }
    case 'boss': {
      // Circular orbit + slow pursuit
      const orbit = Math.sin(frame * 0.02 + enemy.id * 0.5) * 2;
      const perp = toPlayerAngle + Math.PI / 2;
      const [nx, ny] = normalize(playerX - enemy.x, playerY - enemy.y);
      enemy.vx = nx * enemy.speed + Math.cos(perp) * orbit * 0.3;
      enemy.vy = ny * enemy.speed + Math.sin(perp) * orbit * 0.3;
      break;
    }
  }

  enemy.x += enemy.vx;
  enemy.y += enemy.vy;

  // Shooting
  enemy.shootTimer -= 1;
  if (enemy.shootTimer <= 0) {
    enemy.shootTimer = enemy.shootInterval;
    if (enemy.type === 'boss') {
      // Burst of 3 aimed at player
      for (let i = -1; i <= 1; i++) {
        const a = toPlayerAngle + i * 0.25;
        const spd = 5;
        newBullets.push({
          id: nextId(),
          x: enemy.x + Math.cos(a) * enemy.radius,
          y: enemy.y + Math.sin(a) * enemy.radius,
          vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
          angle: a, radius: 5,
          active: true, damage: 15, fromPlayer: false,
          color: '#ff00ff', life: 90, maxLife: 90,
        });
      }
    } else {
      newBullets.push(createEnemyBullet(enemy.x, enemy.y, playerX, playerY));
    }
  }
}

export function drawEnemy(
  ctx: CanvasRenderingContext2D,
  e: Enemy,
): void {
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.rotate(e.angle + Math.PI / 2);

  if (e.type === 'drone') {
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#ff4444';
    ctx.fillStyle = '#330000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -e.radius);
    ctx.lineTo(e.radius * 0.7, e.radius * 0.6);
    ctx.lineTo(0, e.radius * 0.3);
    ctx.lineTo(-e.radius * 0.7, e.radius * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Core dot
    ctx.fillStyle = '#ff6666';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

  } else if (e.type === 'heavy') {
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 16;
    ctx.strokeStyle = '#ffaa00';
    ctx.fillStyle = '#221100';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -e.radius);
    ctx.lineTo(e.radius * 0.9, 0);
    ctx.lineTo(e.radius * 0.6, e.radius);
    ctx.lineTo(-e.radius * 0.6, e.radius);
    ctx.lineTo(-e.radius * 0.9, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Shield visual
    if (e.shieldHp > 0) {
      const shieldAlpha = e.shieldHp / e.maxShieldHp;
      ctx.strokeStyle = `rgba(80,160,255,${shieldAlpha * 0.8})`;
      ctx.shadowColor = '#4488ff';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, e.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

  } else {
    // Boss
    ctx.shadowColor = '#aa00ff';
    ctx.shadowBlur = 30;
    const outerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, e.radius);
    outerGrad.addColorStop(0, '#330055');
    outerGrad.addColorStop(1, '#110022');
    ctx.fillStyle = outerGrad;
    ctx.strokeStyle = '#cc44ff';
    ctx.lineWidth = 2.5;
    // Main hex body
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      if (i === 0) ctx.moveTo(Math.cos(a) * e.radius, Math.sin(a) * e.radius);
      else ctx.lineTo(Math.cos(a) * e.radius, Math.sin(a) * e.radius);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Inner ring
    ctx.beginPath();
    ctx.arc(0, 0, e.radius * 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff44ff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Core
    ctx.fillStyle = '#ff88ff';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    // Shield
    if (e.shieldHp > 0) {
      const sa = e.shieldHp / e.maxShieldHp;
      ctx.strokeStyle = `rgba(100,200,255,${sa * 0.9})`;
      ctx.shadowColor = '#66ccff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, e.radius + 14, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();

  // HP bar above enemy
  drawEnemyHPBar(ctx, e);
}

function drawEnemyHPBar(ctx: CanvasRenderingContext2D, e: Enemy): void {
  const barW = e.radius * 2.2;
  const barH = 4;
  const bx = e.x - barW / 2;
  const by = e.y - e.radius - 14;

  // Background
  ctx.fillStyle = '#222';
  ctx.fillRect(bx, by, barW, barH);

  // HP
  const hpRatio = Math.max(0, e.hp / e.maxHp);
  ctx.fillStyle = hpRatio > 0.5 ? '#44ff44' : hpRatio > 0.25 ? '#ffaa00' : '#ff4444';
  ctx.fillRect(bx, by, barW * hpRatio, barH);

  // Shield (on top)
  if (e.maxShieldHp > 0) {
    const sRatio = Math.max(0, e.shieldHp / e.maxShieldHp);
    ctx.fillStyle = 'rgba(80,160,255,0.9)';
    ctx.fillRect(bx, by - 5, barW * sRatio, 3);
  }
}

// ── Weapon Pickups ────────────────────────────────────────────────────────────

const WEAPON_ORDER: WeaponType[] = ['double', 'spread', 'rapid'];

export function createWeaponPickup(x: number, y: number): WeaponPickup {
  const weapon = WEAPON_ORDER[Math.floor(Math.random() * WEAPON_ORDER.length)];
  return {
    id: nextId(), x, y, vx: 0, vy: 0,
    radius: 14, active: true, weapon,
    life: 300,
  };
}

export function updatePickups(pickups: WeaponPickup[]): WeaponPickup[] {
  return pickups.filter((p) => {
    p.life -= 1;
    return p.active && p.life > 0;
  });
}

export function drawPickups(
  ctx: CanvasRenderingContext2D,
  pickups: WeaponPickup[],
  frame: number,
): void {
  for (const p of pickups) {
    const pulse = 1 + Math.sin(frame * 0.1) * 0.15;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(pulse, pulse);
    const color = WEAPON_COLORS[p.weapon];
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = color;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = 'bold 8px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WPN', 0, 0);
    ctx.restore();
  }
}
