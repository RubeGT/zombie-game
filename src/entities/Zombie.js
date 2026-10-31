import { distance, angleBetween, normalize, randomBetween, randomInt } from '../utils/math.js';

export class Zombie {
  constructor(x, y, type, game, wave) {
    this.x = x;
    this.y = y;
    this.game = game;
    this.type = type;
    this.wave = wave;

    // Base stats by type
    const stats = this.getTypeStats(type);
    this.maxHealth = stats.health * (1 + wave * 0.1);
    this.health = this.maxHealth;
    this.speed = stats.speed * (1 + wave * 0.02);
    this.damage = stats.damage * (1 + wave * 0.05);
    this.xpValue = stats.xp * (1 + wave * 0.1);
    this.moneyValue = stats.money * (1 + wave * 0.1);
    this.radius = stats.radius;
    this.color = stats.color;
    this.bodyColor = stats.bodyColor;
    this.outlineColor = stats.outlineColor;

    // State
    this.angle = 0;
    this.knockback = { x: 0, y: 0 };
    this.knockbackDecay = 0.9;
    this.stunned = 0;
    this.slowed = 0;
    this.burning = 0;
    this.burnDamage = 0;
    this.lastAttack = 0;
    this.attackCooldown = 1000;

    // Animation
    this.walkCycle = 0;
    this.hitFlash = 0;
    this.deathAnim = 0;
    this.isDead = false;
    this.deathParticles = [];

    // AI
    this.targetX = 0;
    this.targetY = 0;
    this.pathTimer = 0;
    this.wanderAngle = Math.random() * Math.PI * 2;
    this.idleTimer = 0;

    // Visual variation
    this.bodyOffset = randomBetween(-2, 2);
    this.eyeOffset = randomBetween(-1, 1);
    this.sizeVariation = randomBetween(0.9, 1.1);
  }

  getTypeStats(type) {
    const types = {
      normal: {
        health: 50, speed: 1.5, damage: 10, xp: 10, money: 5,
        radius: 18, color: '#444', bodyColor: '#333', outlineColor: '#666'
      },
      fast: {
        health: 30, speed: 3.5, damage: 8, xp: 15, money: 8,
        radius: 14, color: '#00ff88', bodyColor: '#00cc6a', outlineColor: '#00ffaa'
      },
      tank: {
        health: 200, speed: 0.8, damage: 25, xp: 30, money: 20,
        radius: 28, color: '#666', bodyColor: '#555', outlineColor: '#888'
      },
      spitter: {
        health: 40, speed: 1.2, damage: 15, xp: 20, money: 12,
        radius: 16, color: '#8844ff', bodyColor: '#6633cc', outlineColor: '#aa66ff'
      },
      exploder: {
        health: 35, speed: 1.8, damage: 40, xp: 25, money: 15,
        radius: 20, color: '#ff6b35', bodyColor: '#cc5522', outlineColor: '#ff8844'
      },
      boss: {
        health: 1000, speed: 0.6, damage: 50, xp: 200, money: 100,
        radius: 50, color: '#e94560', bodyColor: '#c73659', outlineColor: '#ff6b7a'
      }
    };
    return types[type] || types.normal;
  }

  update(dt) {
    if (this.isDead) {
      this.deathAnim += dt;
      for (const p of this.deathParticles) {
        p.x += p.vx * dt / 1000;
        p.y += p.vy * dt / 1000;
        p.vy += 300 * dt / 1000;
        p.life -= dt;
        p.size *= 0.995;
      }
      this.deathParticles = this.deathParticles.filter(p => p.life > 0);
      return;
    }

    // Update status effects
    if (this.stunned > 0) this.stunned -= dt;
    if (this.slowed > 0) this.slowed -= dt;
    if (this.burning > 0) {
      this.burning -= dt;
      this.health -= this.burnDamage * dt / 1000;
      if (this.health <= 0) this.die();
    }
    if (this.hitFlash > 0) this.hitFlash -= dt;

    // Knockback decay
    this.knockback.x *= this.knockbackDecay;
    this.knockback.y *= this.knockbackDecay;

    // AI Behavior
    this.updateAI(dt);

    // Movement
    this.move(dt);

    // Animation
    this.walkCycle += dt * 0.015 * (this.speed / 1.5);
  }

  updateAI(dt) {
    const player = this.game.player;
    const dist = distance(this.x, this.y, player.x, player.y);

    // All zombies target player when in range
    const aggroRange = this.type === 'spitter' ? 500 : 400;
    if (dist < aggroRange || this.type === 'boss') {
      this.targetX = player.x;
      this.targetY = player.y;
    } else {
      // Wander behavior
      this.idleTimer -= dt;
      if (this.idleTimer <= 0) {
        this.wanderAngle += randomBetween(-0.5, 0.5);
        this.targetX = this.x + Math.cos(this.wanderAngle) * 100;
        this.targetY = this.y + Math.sin(this.wanderAngle) * 100;
        this.idleTimer = randomBetween(1000, 3000);
      }
    }

    // Special behaviors
    if (this.type === 'spitter' && dist < 350 && dist > 100) {
      this.trySpit(dt);
    }

    if (this.type === 'exploder' && dist < 50) {
      this.explode();
    }

    if (this.type === 'boss') {
      this.bossBehavior(dt, dist);
    }
  }

  trySpit(dt) {
    if (Date.now() - this.lastAttack >= this.attackCooldown) {
      this.lastAttack = Date.now();
      const player = this.game.player;
      const angle = angleBetween(this.x, this.y, player.x, player.y);
      const speed = 8;

      this.game.projectiles.push(new EnemyProjectile(
        this.x, this.y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        this.damage,
        this.game,
        '#8844ff'
      ));

      // Spit animation
      this.stunned = 300;
    }
  }

  explode() {
    this.isDead = true;
    this.createDeathParticles();

    // Explosion damage
    for (const zombie of this.game.zombies) {
      if (zombie !== this && !zombie.isDead) {
        const dist = distance(this.x, this.y, zombie.x, zombie.y);
        if (dist < 100) {
          zombie.takeDamage(this.damage * 0.5, this.x, this.y);
        }
      }
    }

    // Player damage
    const player = this.game.player;
    const dist = distance(this.x, this.y, player.x, player.y);
    if (dist < 100) {
      player.takeDamage(this.damage, this.x, this.y);
    }

    // Explosion effect
    this.game.addEffect(new ExplosionEffect(this.x, this.y, 100, '#ff6b35'));
    this.game.screenShake = Math.max(this.game.screenShake, 15);
  }

  bossBehavior(dt, dist) {
    // Boss has multiple attack patterns
    if (dist < 200 && Date.now() - this.lastAttack >= 2000) {
      this.lastAttack = Date.now();
      const pattern = randomInt(0, 2);

      if (pattern === 0) {
        // Spread shot
        for (let i = -2; i <= 2; i++) {
          const angle = angleBetween(this.x, this.y, this.game.player.x, this.game.player.y) + i * 0.2;
          this.game.projectiles.push(new EnemyProjectile(
            this.x, this.y,
            Math.cos(angle) * 10, Math.sin(angle) * 10,
            this.damage, this.game, '#e94560'
          ));
        }
      } else if (pattern === 1) {
        // Summon minions
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          const spawnX = this.x + Math.cos(angle) * 80;
          const spawnY = this.y + Math.sin(angle) * 80;
          this.game.zombies.push(new Zombie(spawnX, spawnY, 'normal', this.game, this.wave));
        }
      } else {
        // Charge
        this.speed *= 3;
        this.stunned = 1000;
        setTimeout(() => { this.speed /= 3; }, 1000);
      }
    }
  }

  move(dt) {
    if (this.stunned > 0) return;

    const slowMult = this.slowed > 0 ? 0.5 : 1;
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 5) {
      const { x: nx, y: ny } = normalize(dx, dy);
      this.x += nx * this.speed * slowMult * dt / 16 + this.knockback.x;
      this.y += ny * this.speed * slowMult * dt / 16 + this.knockback.y;

      // Boundary check
      const margin = this.radius;
      this.x = Math.max(margin, Math.min(this.game.worldWidth - margin, this.x));
      this.y = Math.max(margin, Math.min(this.game.worldHeight - margin, this.y));

      this.angle = Math.atan2(ny, nx);
    }
  }

  takeDamage(amount, sourceX, sourceY, isCrit = false, knockback = 0) {
    if (this.isDead) return false;

    this.health -= amount;
    this.hitFlash = 100;

    // Knockback
    if (knockback > 0 && sourceX !== undefined) {
      const angle = angleBetween(sourceX, sourceY, this.x, this.y);
      this.knockback.x = Math.cos(angle) * knockback;
      this.knockback.y = Math.sin(angle) * knockback;
    }

    // Damage number
    this.game.addDamageNumber(this.x, this.y, amount, isCrit);

    if (this.health <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  applySlow(duration) {
    this.slowed = Math.max(this.slowed, duration);
  }

  applyBurn(duration, dps) {
    this.burning = Math.max(this.burning, duration);
    this.burnDamage = Math.max(this.burnDamage, dps);
  }

  applyStun(duration) {
    this.stunned = Math.max(this.stunned, duration);
  }

  die() {
    this.isDead = true;
    this.createDeathParticles();

    // Rewards
    this.game.player.addXP(this.xpValue);
    this.game.addMoney(Math.floor(this.moneyValue * this.game.player.moneyMultiplier));
    this.game.kills++;
    this.game.addKillFeed(`${this.type.toUpperCase()} killed`, this.game.killStreak > 2);

    // Drop chance
    if (Math.random() < 0.1) {
      this.game.pickups.push(new Pickup(this.x, this.y, this.game));
    }

    // Power-up drop on boss
    if (this.type === 'boss') {
      this.game.addEffect(new BossDeathEffect(this.x, this.y));
      this.game.screenShake = 30;
    }
  }

  createDeathParticles() {
    const count = this.type === 'boss' ? 50 : 20;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 150;
      this.deathParticles.push({
        x: 0, y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: choose([this.bodyColor, this.outlineColor, '#e94560', '#ff6b35', '#fff']),
        life: 1000 + Math.random() * 1000
      });
    }
  }

  render(ctx) {
    if (this.isDead) {
      ctx.save();
      ctx.translate(this.x, this.y);
      for (const p of this.deathParticles) {
        ctx.globalAlpha = p.life / 2000;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Hit flash
    if (this.hitFlash > 0) {
      ctx.globalAlpha = 0.5 + Math.sin(this.hitFlash * 0.05) * 0.5;
    }

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(3, 5, this.radius * this.sizeVariation * 0.8, this.radius * this.sizeVariation * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    const bob = Math.sin(this.walkCycle) * 3 * this.sizeVariation;
    ctx.fillStyle = this.bodyColor;
    ctx.beginPath();
    ctx.ellipse(this.bodyOffset, bob, this.radius * this.sizeVariation, this.radius * this.sizeVariation * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body outline
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Type-specific details
    this.renderTypeDetails(ctx, bob);

    // Health bar
    if (this.health < this.maxHealth) {
      const barW = this.radius * 2;
      const barH = 4;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(-barW/2, -this.radius - 12, barW, barH);
      ctx.fillStyle = this.health > this.maxHealth * 0.3 ? '#00ff88' : '#e94560';
      ctx.fillRect(-barW/2, -this.radius - 12, barW * (this.health / this.maxHealth), barH);
    }

    // Status effects
    if (this.burning > 0) {
      ctx.fillStyle = '#ff6b35';
      for (let i = 0; i < 3; i++) {
        const angle = (Date.now() * 0.01 + i * 2) % (Math.PI * 2);
        const r = this.radius * 1.2;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r + bob, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (this.slowed > 0) {
      ctx.fillStyle = '#00d4ff';
      ctx.beginPath();
      ctx.arc(0, -this.radius - 20 + bob, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    if (this.stunned > 0) {
      ctx.fillStyle = '#ffd700';
      ctx.font = '20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★', 0, -this.radius - 25 + bob);
    }

    ctx.restore();
  }

  renderTypeDetails(ctx, bob) {
    switch (this.type) {
      case 'fast':
        // Glowing eyes
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.arc(this.radius * 0.5 + this.eyeOffset, -this.radius * 0.2 + bob, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.radius * 0.5 - this.eyeOffset, -this.radius * 0.2 + bob, 3, 0, Math.PI * 2);
        ctx.fill();
        // Speed lines
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(-this.radius - 5 - i * 5, bob + (Math.sin(this.walkCycle + i) * 5));
          ctx.lineTo(-this.radius - 15 - i * 5, bob + (Math.sin(this.walkCycle + i) * 5));
          ctx.stroke();
        }
        break;

      case 'tank':
        // Armor plates
        ctx.fillStyle = '#777';
        ctx.fillRect(-this.radius * 0.6, -this.radius * 0.5 + bob, this.radius * 1.2, this.radius * 0.8);
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.radius * 0.6, -this.radius * 0.5 + bob, this.radius * 1.2, this.radius * 0.8);
        // Single glowing eye
        ctx.fillStyle = '#e94560';
        ctx.beginPath();
        ctx.arc(this.bodyOffset, -this.radius * 0.1 + bob, 5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'spitter':
        // Acid sac
        const sacPulse = Math.sin(Date.now() * 0.005) * 2;
        ctx.fillStyle = 'rgba(136, 68, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(-this.radius * 0.3, this.radius * 0.2 + bob + sacPulse, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8844ff';
        ctx.lineWidth = 1;
        ctx.stroke();
        break;

      case 'exploder':
        // Warning pulses
        const pulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
        ctx.strokeStyle = `rgba(255, 107, 53, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, bob, this.radius * 1.5 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        // Volatile core
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.arc(this.bodyOffset, bob, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'boss':
        // Crown
        ctx.fillStyle = '#ffd700';
        for (let i = -2; i <= 2; i++) {
          const h = 15 + Math.abs(i) * 5;
          ctx.fillRect(i * 12 - 5, -this.radius - h + bob, 10, h);
        }
        // Glowing eyes
        ctx.fillStyle = '#e94560';
        ctx.beginPath();
        ctx.arc(-this.radius * 0.4, -this.radius * 0.2 + bob, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.radius * 0.4, -this.radius * 0.2 + bob, 6, 0, Math.PI * 2);
        ctx.fill();
        // Aura
        const auraPulse = Math.sin(Date.now() * 0.003) * 0.2 + 0.8;
        ctx.strokeStyle = `rgba(233, 69, 96, ${auraPulse * 0.5})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, bob, this.radius * 1.3, 0, Math.PI * 2);
        ctx.stroke();
        break;

      default:
        // Normal zombie eyes
        ctx.fillStyle = '#e94560';
        ctx.beginPath();
        ctx.arc(this.radius * 0.4 + this.eyeOffset, -this.radius * 0.2 + bob, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.radius * 0.4 - this.eyeOffset, -this.radius * 0.2 + bob, 2, 0, Math.PI * 2);
        ctx.fill();
    }
  }
}

class EnemyProjectile {
  constructor(x, y, vx, vy, damage, game, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.game = game;
    this.color = color;
    this.radius = 6;
    this.life = 3000;
    this.trail = [];
    this.maxTrail = 10;
  }

  update(dt) {
    this.trail.unshift({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) this.trail.pop();

    this.x += this.vx * dt / 16;
    this.y += this.vy * dt / 16;
    this.life -= dt;

    // Check collision with player
    const player = this.game.player;
    const dist = distance(this.x, this.y, player.x, player.y);
    if (dist < player.radius + this.radius) {
      player.takeDamage(this.damage, this.x, this.y);
      this.life = 0;
    }

    // Bounds
    if (this.x < -50 || this.x > this.game.worldWidth + 50 ||
        this.y < -50 || this.y > this.game.worldHeight + 50) {
      this.life = 0;
    }
  }

  render(ctx) {
    for (let i = 0; i < this.trail.length; i++) {
      const alpha = (1 - i / this.trail.length) * 0.5;
      const size = this.radius * (1 - i / this.trail.length);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.trail[i].x, this.trail[i].y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Glow
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

class ExplosionEffect {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.maxRadius = radius;
    this.radius = 0;
    this.color = color;
    this.life = 500;
    this.particles = [];
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 200;
      this.particles.push({
        x: 0, y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 6,
        color: choose([color, '#ffd700', '#fff', '#ff6b35'])
      });
    }
  }

  update(dt) {
    this.life -= dt;
    this.radius = this.maxRadius * (1 - this.life / 500);
    for (const p of this.particles) {
      p.x += p.vx * dt / 1000;
      p.y += p.vy * dt / 1000;
      p.vy += 200 * dt / 1000;
      p.size *= 0.99;
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Expanding ring
    ctx.globalAlpha = this.life / 500;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner glow
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Particles
    for (const p of this.particles) {
      ctx.globalAlpha = this.life / 500;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

class BossDeathEffect {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.life = 3000;
    this.particles = [];
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 300;
      this.particles.push({
        x: 0, y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 8,
        color: choose(['#e94560', '#ffd700', '#fff', '#ff6b35', '#c73659']),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1
      });
    }
    this.rings = [];
    for (let i = 0; i < 5; i++) {
      this.rings.push({ radius: 0, maxRadius: 100 + i * 50, alpha: 1 });
    }
  }

  update(dt) {
    this.life -= dt;
    for (const p of this.particles) {
      p.x += p.vx * dt / 1000;
      p.y += p.vy * dt / 1000;
      p.vy += 100 * dt / 1000;
      p.size *= 0.995;
      p.rotation += p.rotSpeed;
    }
    for (const r of this.rings) {
      r.radius += dt * 0.5;
      r.alpha = 1 - r.radius / r.maxRadius;
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Rings
    for (const r of this.rings) {
      if (r.alpha > 0) {
        ctx.globalAlpha = r.alpha * 0.5;
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Particles
    for (const p of this.particles) {
      ctx.globalAlpha = this.life / 3000;
      ctx.fillStyle = p.color;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
      ctx.restore();
    }
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

class Pickup {
  constructor(x, y, game) {
    this.x = x;
    this.y = y;
    this.game = game;
    this.type = choose(['health', 'ammo', 'money', 'xp', 'powerup']);
    this.radius = 15;
    this.life = 30000;
    this.bob = Math.random() * Math.PI * 2;
    this.color = this.getColor();
    this.icon = this.getIcon();
  }

  getColor() {
    switch (this.type) {
      case 'health': return '#00ff88';
      case 'ammo': return '#00d4ff';
      case 'money': return '#ffd700';
      case 'xp': return '#8844ff';
      case 'powerup': return '#e94560';
    }
  }

  getIcon() {
    switch (this.type) {
      case 'health': return '♥';
      case 'ammo': return '⬟';
      case 'money': return '$';
      case 'xp': return '✦';
      case 'powerup': return '⚡';
    }
  }

  update(dt) {
    this.life -= dt;
    this.bob += dt * 0.003;

    // Attract to player if close
    const player = this.game.player;
    const dist = distance(this.x, this.y, player.x, player.y);
    if (dist < 100) {
      const angle = angleBetween(this.x, this.y, player.x, player.y);
      this.x += Math.cos(angle) * 200 * dt / 1000;
      this.y += Math.sin(angle) * 200 * dt / 1000;
    }

    // Collect
    if (dist < player.radius + this.radius) {
      this.collect();
    }
  }

  collect() {
    const player = this.game.player;
    switch (this.type) {
      case 'health':
        player.heal(25);
        this.game.addPickupNotification('Health +25');
        break;
      case 'ammo':
        player.ammo = Math.min(player.magSize, player.ammo + 10);
        this.game.addPickupNotification('Ammo +10');
        break;
      case 'money':
        const amount = 50 * player.moneyMultiplier;
        this.game.addMoney(Math.floor(amount));
        this.game.addPickupNotification(`Money +$${Math.floor(amount)}`);
        break;
      case 'xp':
        player.addXP(50);
        this.game.addPickupNotification('XP +50');
        break;
      case 'powerup':
        const types = ['speed', 'damage', 'fireRate', 'shield'];
        const type = choose(types);
        player.activatePowerUp(type, 15000);
        this.game.addPickupNotification(`${type.toUpperCase()} BOOST!`);
        break;
    }
    this.life = 0;
    this.game.addEffect(new PickupEffect(this.x, this.y, this.color));
  }

  render(ctx) {
    if (this.life <= 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const bobY = Math.sin(this.bob) * 5;
    const pulse = Math.sin(this.bob * 2) * 0.2 + 0.8;

    // Glow
    const gradient = ctx.createRadialGradient(0, bobY, 0, 0, bobY, this.radius * 2);
    gradient.addColorStop(0, this.color + '80');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, bobY, this.radius * 2 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Base
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, bobY, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Icon
    ctx.fillStyle = this.color;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.icon, 0, bobY);

    // Timer ring
    if (this.life < 10000) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.5 + Math.sin(this.life * 0.01) * 0.5;
      ctx.beginPath();
      ctx.arc(0, bobY, this.radius + 5, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * this.life / 10000));
      ctx.stroke();
    }

    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

class PickupEffect {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.life = 500;
    this.particles = [];
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      this.particles.push({
        x: 0, y: 0,
        vx: Math.cos(angle) * 100,
        vy: Math.sin(angle) * 100,
        size: 4,
        color: color
      });
    }
  }

  update(dt) {
    this.life -= dt;
    for (const p of this.particles) {
      p.x += p.vx * dt / 1000;
      p.y += p.vy * dt / 1000;
      p.size *= 0.95;
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    for (const p of this.particles) {
      ctx.globalAlpha = this.life / 500;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

function choose(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}