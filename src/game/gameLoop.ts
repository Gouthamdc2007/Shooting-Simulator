// ─── Game Loop ────────────────────────────────────────────────────────────────
// Pure update logic — no rendering. Called once per frame (60fps via rAF).

import type { GameState, Bullet } from './types';
import { CANVAS_W, CANVAS_H, FIRE_RATES } from './types';
import { dist, angleTo } from './utils';
import type { InputState } from './input';
import { isMoving, isShooting, isGravBomb } from './input';
import {
  createPlayerBullets, updateBullets, updateEnemy,
  createWeaponPickup, updatePickups,
} from './entities';
import {
  spawnExplosion, spawnImpactSparks, spawnGravBombEffect, updateParticles,
} from './particles';
import { updateStars } from './starfield';
import { isWaveClear, spawnWave } from './waves';

const DRAG = 0.88;           // antigravity inertia drag factor
const THRUST = 0.38;         // acceleration per frame

export function tickGame(
  state: GameState,
  input: InputState,
  frame: number,
  onShot: () => void,
  onHit: () => void,
): void {
  if (state.phase !== 'playing') {
    if (state.phase === 'wave_clear') {
      state.waveClearTimer -= 1;
      if (state.waveClearTimer <= 0) {
        state.wave += 1;
        state.enemies = spawnWave(state.wave);
        state.phase = 'playing';
      }
    }
    return;
  }

  // ── Starfield ──
  updateStars(state.stars, 0.4);

  // ── Player movement (antigravity inertia) ──
  const p = state.player;
  const move = isMoving(input);
  if (move.left)  p.vx -= THRUST;
  if (move.right) p.vx += THRUST;
  if (move.up)    p.vy -= THRUST;
  if (move.down)  p.vy += THRUST;

  // Clamp max speed
  const maxSpeed = 6;
  const spd = Math.sqrt(p.vx ** 2 + p.vy ** 2);
  if (spd > maxSpeed) {
    p.vx = (p.vx / spd) * maxSpeed;
    p.vy = (p.vy / spd) * maxSpeed;
  }

  // Apply antigravity drag (inertia drift)
  p.vx *= DRAG;
  p.vy *= DRAG;
  p.x += p.vx;
  p.y += p.vy;

  // Bounce off walls
  if (p.x < p.radius) { p.x = p.radius; p.vx = Math.abs(p.vx) * 0.3; }
  if (p.x > CANVAS_W - p.radius) { p.x = CANVAS_W - p.radius; p.vx = -Math.abs(p.vx) * 0.3; }
  if (p.y < p.radius) { p.y = p.radius; p.vy = Math.abs(p.vy) * 0.3; }
  if (p.y > CANVAS_H - p.radius) { p.y = CANVAS_H - p.radius; p.vy = -Math.abs(p.vy) * 0.3; }

  // Player aim angle (toward mouse cursor)
  p.angle = angleTo(p.x, p.y, input.mouseX, input.mouseY);

  // ── Weapon timer ──
  if (p.weaponTimer > 0) p.weaponTimer -= 1;

  // ── Shooting ──
  if (isShooting(input) && p.weaponTimer <= 0) {
    const newBullets = createPlayerBullets(p, p.angle);
    state.bullets.push(...newBullets);
    p.weaponTimer = FIRE_RATES[p.weapon];
    state.shotsFired += newBullets.length > 1 ? 1 : 1; // count as 1 shot attempt
    onShot();
  }

  // ── Gravity Bomb ──
  if (p.gravBombCooldown > 0) p.gravBombCooldown -= 1;
  if (isGravBomb(input) && p.gravBombCooldown <= 0) {
    p.gravBombCooldown = p.gravBombMaxCooldown;
    spawnGravBombEffect(state.particles, p.x, p.y);
    state.screenShake = 25;
    // Damage all enemies
    for (const e of state.enemies) {
      const damage = 120;
      if (e.shieldHp > 0) {
        const shieldDmg = Math.min(e.shieldHp, damage);
        e.shieldHp -= shieldDmg;
      } else {
        e.hp -= damage;
      }
      spawnExplosion(state.particles, e.x, e.y, 10, '#aa00ff', false);
    }
    state.enemies = state.enemies.filter((e) => e.hp > 0);
  }

  // ── Update bullets ──
  state.bullets = updateBullets(state.bullets);

  // ── Enemy AI + bullet spawning ──
  const newEnemyBullets: Bullet[] = [];
  for (const e of state.enemies) {
    updateEnemy(e, p.x, p.y, newEnemyBullets, frame);
  }
  state.bullets.push(...newEnemyBullets);

  // ── Collision: player bullets vs enemies ──
  const bulletsToRemove = new Set<number>();
  const enemiesToRemove = new Set<number>();

  for (const b of state.bullets) {
    if (!b.fromPlayer || bulletsToRemove.has(b.id)) continue;
    for (const e of state.enemies) {
      if (enemiesToRemove.has(e.id)) continue;
      if (dist(b.x, b.y, e.x, e.y) < b.radius + e.radius) {
        // Hit!
        if (e.shieldHp > 0) {
          const shieldDmg = Math.min(e.shieldHp, b.damage);
          e.shieldHp -= shieldDmg;
          spawnImpactSparks(state.particles, b.x, b.y, b.angle, '#4488ff');
        } else {
          e.hp -= b.damage;
          spawnImpactSparks(state.particles, b.x, b.y, b.angle, b.color);
        }
        bulletsToRemove.add(b.id);
        onHit();
        state.shotsHit += 1;

        if (e.hp <= 0) {
          enemiesToRemove.add(e.id);
          state.score += e.scoreValue * state.wave;
          state.enemiesKilled += 1;
          spawnExplosion(
            state.particles, e.x, e.y,
            e.type === 'boss' ? 60 : e.type === 'heavy' ? 30 : 15,
            e.type === 'boss' ? '#aa00ff' : e.type === 'heavy' ? '#ffaa00' : '#ff4444',
            e.type !== 'drone',
          );
          state.screenShake = e.type === 'boss' ? 30 : e.type === 'heavy' ? 15 : 5;

          if (e.dropWeapon) {
            state.pickups.push(createWeaponPickup(e.x, e.y));
          }
        }
        break;
      }
    }
  }

  state.bullets = state.bullets.filter(
    (b) => !bulletsToRemove.has(b.id),
  );
  state.enemies = state.enemies.filter(
    (e) => !enemiesToRemove.has(e.id),
  );

  // ── Collision: enemy bullets vs player ──
  if (p.invincibleFrames <= 0) {
    const hitBullets = new Set<number>();
    for (const b of state.bullets) {
      if (b.fromPlayer) continue;
      if (dist(b.x, b.y, p.x, p.y) < b.radius + p.radius) {
        hitBullets.add(b.id);
        p.hp -= b.damage;
        p.invincibleFrames = 45;
        state.screenShake = 12;
        spawnImpactSparks(state.particles, b.x, b.y, b.angle, '#ff4444');
      }
    }
    state.bullets = state.bullets.filter((b) => !hitBullets.has(b.id));
  } else {
    p.invincibleFrames -= 1;
  }

  // ── Collision: enemy body vs player ──
  if (p.invincibleFrames <= 0) {
    for (const e of state.enemies) {
      if (dist(p.x, p.y, e.x, e.y) < p.radius + e.radius * 0.8) {
        p.hp -= 20;
        p.invincibleFrames = 60;
        state.screenShake = 18;
        spawnExplosion(state.particles, p.x, p.y, 10, '#ff4444');
      }
    }
  }

  // ── Pickup collection ──
  state.pickups = updatePickups(state.pickups);
  for (const pu of state.pickups) {
    if (dist(p.x, p.y, pu.x, pu.y) < p.radius + pu.radius) {
      p.weapon = pu.weapon;
      pu.active = false;
    }
  }
  state.pickups = state.pickups.filter((pu) => pu.active);

  // ── Particles ──
  state.particles = updateParticles(state.particles);

  // ── Screen shake decay ──
  if (state.screenShake > 0) state.screenShake -= 1;

  // ── Player death ──
  if (p.hp <= 0) {
    spawnExplosion(state.particles, p.x, p.y, 60, '#00ffff', true);
    state.screenShake = 40;
    if (state.score > state.highScore) {
      state.highScore = state.score;
      localStorage.setItem('zerog_highscore', String(state.highScore));
    }
    state.phase = 'game_over';
    return;
  }

  // ── Wave clear check ──
  if (isWaveClear(state)) {
    state.phase = 'wave_clear';
    state.waveClearTimer = 120; // 2 seconds at 60fps
  }
}
