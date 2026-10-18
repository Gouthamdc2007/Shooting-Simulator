// ─── Shared Types & Constants ────────────────────────────────────────────────

export type Vec2 = { x: number; y: number };

export type WeaponType = 'single' | 'double' | 'spread' | 'rapid';

export const WEAPON_LABELS: Record<WeaponType, string> = {
  single: 'LASER SINGLE',
  double: 'LASER DOUBLE',
  spread: 'SPREAD SHOT',
  rapid: 'RAPID FIRE',
};

export const WEAPON_COLORS: Record<WeaponType, string> = {
  single: '#00ffff',
  double: '#00ff88',
  spread: '#ffaa00',
  rapid: '#ff4488',
};

export type EnemyType = 'drone' | 'heavy' | 'boss';

export interface Entity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  active: boolean;
}

export interface Bullet extends Entity {
  angle: number;
  damage: number;
  fromPlayer: boolean;
  color: string;
  life: number;        // frames remaining
  maxLife: number;
}

export interface Enemy extends Entity {
  type: EnemyType;
  hp: number;
  maxHp: number;
  shieldHp: number;
  maxShieldHp: number;
  shootTimer: number;
  shootInterval: number;
  speed: number;
  angle: number;
  scoreValue: number;
  dropWeapon: boolean;
}

export interface WeaponPickup extends Entity {
  weapon: WeaponType;
  life: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  color: string;
  type: 'spark' | 'debris' | 'smoke' | 'ring';
  alpha: number;
}

export interface Star {
  x: number;
  y: number;
  z: number;  // depth (for parallax speed)
  size: number;
  brightness: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;       // direction the ship nose points (toward mouse)
  radius: number;
  hp: number;
  maxHp: number;
  weapon: WeaponType;
  weaponTimer: number; // frames until next shot allowed
  gravBombCooldown: number;
  gravBombMaxCooldown: number;
  invincibleFrames: number;
}

export interface GameState {
  player: Player;
  bullets: Bullet[];
  enemies: Enemy[];
  particles: Particle[];
  pickups: WeaponPickup[];
  stars: Star[];
  score: number;
  wave: number;
  enemiesKilled: number;
  shotsFired: number;
  shotsHit: number;
  screenShake: number;
  phase: 'playing' | 'wave_clear' | 'game_over' | 'start';
  waveClearTimer: number;
  highScore: number;
}

export const CANVAS_W = 900;
export const CANVAS_H = 650;

export const FIRE_RATES: Record<WeaponType, number> = {
  single: 10,
  double: 10,
  spread: 14,
  rapid: 5,
};
