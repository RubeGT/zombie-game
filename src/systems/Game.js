import { Player } from '../entities/Player.js';
import { Zombie } from '../entities/Zombie.js';
import { Shop } from '../ui/Shop.js';
import { distance, randomBetween, randomInt, choose } from '../utils/math.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // World
    this.worldWidth = 3000;
    this.worldHeight = 2000;

    // Camera
    this.camera = { x: 0, y: 0 };
    this.screenShake = 0;
    this.screenShakeDecay = 0.9;

    // Game state
    this.running = false;
    this.gameOver = false;
    this.paused = false;

    // Entities
    this.player = null;
    this.zombies = [];
    this.projectiles = [];
    this.effects = [];
    this.pickups = [];
    this.damageNumbers = [];

    // Wave system
    this.wave = 1;
    this.waveTimer = 0;
    this.waveDuration = 60000; // 60 seconds per wave
    this.waveTransition = false;
    this.waveTransitionTimer = 0;
    this.zombiesToSpawn = 0;
    this.spawnTimer = 0;
    this.maxZombies = 50;

    // Stats
    this.money = 0;
    this.kills = 0;
    this.killStreak = 0;
    this.killStreakMultiplier = 1.0;
    this.lastKillTime = 0;
    this.streakTimeout = 3000; // 3 seconds to maintain streak
    this.highestStreak = 0;

    // XP/Money multipliers
    this.xpMultiplierTimer = 0;
    this.moneyMultiplierTimer = 0;

    // Input
    this.input = {
      keys: {},
      mouse: { x: 0, y: 0, down: false }
    };

    // Shop
    this.shop = new Shop(this);

    // Background
    this.backgroundPattern = null;
    this.createBackground();

    // Bind events
    this.bindEvents();
  }

  createBackground() {
    // Create a procedural background pattern
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 100;
    patternCanvas.height = 100;
    const pctx = patternCanvas.getContext('2d');

    pctx.fillStyle = '#0d0d0d';
    pctx.fillRect(0, 0, 100, 100);

    // Grid lines
    pctx.strokeStyle = '#1a1a1a';
    pctx.lineWidth = 1;
    for (let i = 0; i <= 100; i += 20) {
      pctx.beginPath();
      pctx.moveTo(i, 0);
      pctx.lineTo(i, 100);
      pctx.stroke();
      pctx.beginPath();
      pctx.moveTo(0, i);
      pctx.lineTo(100, i);
      pctx.stroke();
    }

    // Random noise
    pctx.fillStyle = '#151515';
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 2 + 1;
      pctx.fillRect(x, y, size, size);
    }

    this.backgroundPattern = this.ctx.createPattern(patternCanvas, 'repeat');
  }

  bindEvents() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.input.keys[e.key.toLowerCase()] = true;

      // Number keys for consumables
      if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        const consumables = ['healthPack', 'ammoPack', 'speedBoost', 'damageBoost', 'fireRateBoost', 'shield', 'nuke', 'xpBoost', 'moneyBoost'];
        if (consumables[index]) {
          this.shop.useConsumable(consumables[index]);
        }
      }

      // Tab to toggle shop
      if (e.key === 'Tab') {
        e.preventDefault();
        this.shop.toggle();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.input.keys[e.key.toLowerCase()] = false;
    });

    // Mouse
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.input.mouse.x = e.clientX - rect.left + this.camera.x;
      this.input.mouse.y = e.clientY - rect.top + this.camera.y;

      // Update crosshair
      const crosshair = document.getElementById('crosshair');
      crosshair.style.left = e.clientX + 'px';
      crosshair.style.top = e.clientY + 'px';
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.input.mouse.down = true;
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.input.mouse.down = false;
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Window resize
    window.addEventListener('resize', () => this.resize());

    // Restart button
    document.getElementById('restart-btn').addEventListener('click', () => this.restart());

    // Prevent right-click context menu on canvas
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start() {
    this.running = true;
    this.gameOver = false;

    // Create player at center
    this.player = new Player(this.worldWidth / 2, this.worldHeight / 2, this);

    // Reset stats
    this.money = 0;
    this.kills = 0;
    this.killStreak = 0;
    this.killStreakMultiplier = 1.0;
    this.wave = 1;
    this.waveTimer = 0;
    this.zombies = [];
    this.projectiles = [];
    this.effects = [];
    this.pickups = [];
    this.damageNumbers = [];

    // Hide game over screen
    document.getElementById('game-over').classList.remove('show');

    // Start first wave
    this.startWave();

    // Start game loop
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  restart() {
    this.shop.close();
    this.start();
  }

  gameLoop(time) {
    if (!this.running) return;

    const dt = time - this.lastTime;
    this.lastTime = time;

    // Cap dt
    const cappedDt = Math.min(dt, 50);

    this.update(cappedDt);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    if (this.gameOver) return;

    // Update screen shake
    this.screenShake *= this.screenShakeDecay;
    if (this.screenShake < 0.5) this.screenShake = 0;

    // Update timers
    if (this.xpMultiplierTimer > 0) this.xpMultiplierTimer -= dt;
    if (this.moneyMultiplierTimer > 0) this.moneyMultiplierTimer -= dt;

    // Update kill streak
    if (this.killStreak > 0 && Date.now() - this.lastKillTime > this.streakTimeout) {
      this.killStreak = 0;
      this.killStreakMultiplier = 1.0;
    }

    // Update shop
    this.shop.update(dt, this.input.mouse.x - this.camera.x, this.input.mouse.y - this.camera.y, this.canvas.getBoundingClientRect());

    // Update player
    this.player.update(dt, this.input);

    // Update camera to follow player
    this.camera.x = this.player.x - this.canvas.width / 2;
    this.camera.y = this.player.y - this.canvas.height / 2;

    // Clamp camera to world bounds
    this.camera.x = Math.max(0, Math.min(this.worldWidth - this.canvas.width, this.camera.x));
    this.camera.y = Math.max(0, Math.min(this.worldHeight - this.canvas.height, this.camera.y));

    // Update zombies
    this.updateZombies(dt);

    // Update projectiles
    this.updateProjectiles(dt);

    // Update effects
    this.updateEffects(dt);

    // Update pickups
    this.updatePickups(dt);

    // Update damage numbers
    this.updateDamageNumbers(dt);

    // Wave management
    this.updateWave(dt);

    // Update UI
    this.updateUI();
  }

  updateZombies(dt) {
    // Update existing zombies
    for (const zombie of this.zombies) {
      zombie.update(dt);

      // Check collision with player
      if (!zombie.isDead) {
        const dist = distance(zombie.x, zombie.y, this.player.x, this.player.y);
        if (dist < zombie.radius + this.player.radius) {
          this.player.takeDamage(zombie.damage, zombie.x, zombie.y);
          zombie.stunned = 200;
        }
      }
    }

    // Remove dead zombies (after death animation)
    this.zombies = this.zombies.filter(z => !z.isDead || z.deathAnim < 1000);

    // Check projectile-zombie collisions
    for (const proj of this.projectiles) {
      if (proj.life <= 0) continue;

      for (const zombie of this.zombies) {
        if (zombie.isDead) continue;

        const dist = distance(proj.x, proj.y, zombie.x, zombie.y);
        if (dist < zombie.radius + proj.radius) {
          const isCrit = proj.isCrit;
          const knockback = this.player.knockback;
          const killed = zombie.takeDamage(proj.damage, proj.x, proj.y, isCrit, knockback);

          if (killed) {
            this.onZombieKilled(zombie);
          }

          // Pierce logic
          if (proj.pierce > 0) {
            proj.pierce--;
          } else {
            proj.life = 0;
          }
          break;
        }
      }
    }

    // Remove dead projectiles
    this.projectiles = this.projectiles.filter(p => p.life > 0);
  }

  updateProjectiles(dt) {
    for (const proj of this.projectiles) {
      proj.update(dt);
    }
  }

  updateEffects(dt) {
    for (const effect of this.effects) {
      effect.update(dt);
    }
    this.effects = this.effects.filter(e => !e.isDead());
  }

  updatePickups(dt) {
    for (const pickup of this.pickups) {
      pickup.update(dt);
    }
    this.pickups = this.pickups.filter(p => !p.isDead());
  }

  updateDamageNumbers(dt) {
    for (const dn of this.damageNumbers) {
      dn.life -= dt;
      dn.y -= 50 * dt / 1000;
    }
    this.damageNumbers = this.damageNumbers.filter(dn => dn.life > 0);
  }

  updateWave(dt) {
    if (this.waveTransition) {
      this.waveTransitionTimer -= dt;
      if (this.waveTransitionTimer <= 0) {
        this.waveTransition = false;
        this.startWave();
      }
      return;
    }

    this.waveTimer += dt;

    // Spawn zombies
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.zombiesToSpawn > 0 && this.zombies.length < this.maxZombies) {
      this.spawnZombie();
      this.zombiesToSpawn--;
      this.spawnTimer = randomBetween(500, 2000) / (1 + this.wave * 0.1);
    }

    // Wave complete
    if (this.zombiesToSpawn <= 0 && this.zombies.length === 0) {
      this.completeWave();
    }

    // Time-based wave progression
    if (this.waveTimer >= this.waveDuration) {
      this.forceCompleteWave();
    }
  }

  startWave() {
    this.waveTransition = false;
    this.waveTimer = 0;
    this.zombiesToSpawn = 10 + this.wave * 5 + Math.floor(this.wave * 1.5);
    this.maxZombies = 30 + this.wave * 5;
    this.spawnTimer = 1000;

    // Show wave announcement
    this.showWaveAnnouncement();

    // Spawn boss every 5 waves
    if (this.wave % 5 === 0) {
      this.zombiesToSpawn++; // Extra slot for boss
    }
  }

  completeWave() {
    this.wave++;
    this.waveTransition = true;
    this.waveTransitionTimer = 3000;

    // Wave completion bonus
    const bonus = 100 * this.wave * this.player.moneyMultiplier;
    this.addMoney(Math.floor(bonus));
    this.addPickupNotification(`WAVE COMPLETE! Bonus: $${Math.floor(bonus)}`);

    // Heal player slightly
    this.player.heal(20);
  }

  forceCompleteWave() {
    // Kill remaining zombies without rewards
    for (const zombie of this.zombies) {
      if (!zombie.isDead) {
        zombie.isDead = true;
        zombie.createDeathParticles();
      }
    }
    this.completeWave();
  }

  spawnZombie() {
    // Spawn at random edge of screen
    const side = randomInt(0, 3);
    let x, y;
    const margin = 100;

    switch (side) {
      case 0: // Top
        x = randomBetween(margin, this.worldWidth - margin);
        y = -margin;
        break;
      case 1: // Right
        x = this.worldWidth + margin;
        y = randomBetween(margin, this.worldHeight - margin);
        break;
      case 2: // Bottom
        x = randomBetween(margin, this.worldWidth - margin);
        y = this.worldHeight + margin;
        break;
      case 3: // Left
        x = -margin;
        y = randomBetween(margin, this.worldHeight - margin);
        break;
    }

    // Determine zombie type based on wave
    let type = 'normal';
    const rand = Math.random();

    if (this.wave % 5 === 0 && this.zombiesToSpawn === 1) {
      type = 'boss';
    } else if (this.wave >= 10 && rand < 0.1) {
      type = 'tank';
    } else if (this.wave >= 5 && rand < 0.15) {
      type = 'spitter';
    } else if (this.wave >= 3 && rand < 0.2) {
      type = 'exploder';
    } else if (this.wave >= 2 && rand < 0.25) {
      type = 'fast';
    }

    this.zombies.push(new Zombie(x, y, type, this, this.wave));
  }

  onZombieKilled(zombie) {
    this.kills++;
    this.lastKillTime = Date.now();
    this.killStreak++;
    this.highestStreak = Math.max(this.highestStreak, this.killStreak);

    // Streak multiplier
    this.killStreakMultiplier = 1 + Math.min(this.killStreak * 0.1, 3.0);

    // Add kill feed
    this.addKillFeed(`${zombie.type.toUpperCase()} killed`, this.killStreak > 2);
  }

  addMoney(amount) {
    let mult = this.player.moneyMultiplier;
    if (this.moneyMultiplierTimer > 0) mult *= 2;
    this.money += Math.floor(amount * mult * this.killStreakMultiplier);
  }

  addKillFeed(text, isStreak) {
    const feed = document.getElementById('kill-feed');
    const entry = document.createElement('div');
    entry.className = 'kill-entry' + (isStreak ? ' streak' : '');
    entry.textContent = text + (isStreak ? ` ×${this.killStreakMultiplier.toFixed(1)}` : '');
    feed.appendChild(entry);

    // Limit entries
    while (feed.children.length > 10) {
      feed.removeChild(feed.firstChild);
    }
  }

  addPickupNotification(text) {
    // Remove existing
    const existing = document.querySelector('.pickup-notification');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.className = 'pickup-notification';
    notif.textContent = text;
    document.getElementById('ui-layer').appendChild(notif);

    setTimeout(() => notif.remove(), 2500);
  }

  addDamageNumber(x, y, amount, isCrit) {
    this.damageNumbers.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      amount: Math.floor(amount),
      isCrit,
      life: 800
    });
  }

  addEffect(effect) {
    this.effects.push(effect);
  }

  showWaveAnnouncement() {
    const el = document.getElementById('wave-announcement');
    el.textContent = `WAVE ${this.wave}`;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
  }

  gameOver() {
    this.gameOver = true;
    this.running = false;

    // Show game over screen
    document.getElementById('final-wave').textContent = this.wave;
    document.getElementById('final-kills').textContent = this.kills;
    document.getElementById('final-money').textContent = `$${this.money}`;
    document.getElementById('final-streak').textContent = this.highestStreak;
    document.getElementById('game-over').classList.add('show');
  }

  updateUI() {
    document.getElementById('wave-stat').textContent = this.wave;
    document.getElementById('kills-stat').textContent = this.kills;
    document.getElementById('money-stat').textContent = `$${this.money}`;
    document.getElementById('health-stat').textContent = `${Math.ceil(this.player.health)}/${this.player.maxHealth}`;
    document.getElementById('level-stat').textContent = this.player.level;
    document.getElementById('xp-stat').textContent = `${Math.floor(this.player.xp)}/${this.player.xpToNext}`;

    // Health bar
    const healthPercent = (this.player.health / this.player.maxHealth) * 100;
    document.getElementById('health-bar').style.width = healthPercent + '%';
    document.getElementById('health-bar').classList.toggle('low', healthPercent < 30);

    // XP bar
    const xpPercent = (this.player.xp / this.player.xpToNext) * 100;
    document.getElementById('xp-bar').style.width = xpPercent + '%';

    // Level display
    document.getElementById('level-display').textContent = `LVL ${this.player.level}`;

    // Power-up indicators
    this.updatePowerUpIndicators();
  }

  updatePowerUpIndicators() {
    const container = document.getElementById('power-up-indicator');
    container.innerHTML = '';

    const player = this.player;
    for (const [key, pu] of Object.entries(player.powerUps)) {
      if (pu.active) {
        const div = document.createElement('div');
        div.className = `power-up ${key}`;
        if (pu.time < 3000) div.classList.add('expire');

        const icons = { speed: '💨', damage: '💥', fireRate: '⚡', shield: '🛡️' };
        const names = { speed: 'SPEED BOOST', damage: 'DAMAGE BOOST', fireRate: 'RAPID FIRE', shield: 'ENERGY SHIELD' };

        div.innerHTML = `
          <div class="power-up-icon">${icons[key]}</div>
          <div class="power-up-info">
            <div class="power-up-name">${names[key]}</div>
            <div class="power-up-timer">${(pu.time / 1000).toFixed(1)}s</div>
          </div>
        `;
        container.appendChild(div);
      }
    }

    // Global multipliers
    if (this.xpMultiplierTimer > 0) {
      const div = document.createElement('div');
      div.className = 'power-up';
      div.style.borderColor = '#8844ff';
      div.innerHTML = `
        <div class="power-up-icon">✨</div>
        <div class="power-up-info">
          <div class="power-up-name">2X XP</div>
          <div class="power-up-timer">${(this.xpMultiplierTimer / 1000).toFixed(1)}s</div>
        </div>
      `;
      container.appendChild(div);
    }

    if (this.moneyMultiplierTimer > 0) {
      const div = document.createElement('div');
      div.className = 'power-up';
      div.style.borderColor = '#ffd700';
      div.innerHTML = `
        <div class="power-up-icon">💰</div>
        <div class="power-up-info">
          <div class="power-up-name">2X MONEY</div>
          <div class="power-up-timer">${(this.moneyMultiplierTimer / 1000).toFixed(1)}s</div>
        </div>
      `;
      container.appendChild(div);
    }
  }

  render() {
    const ctx = this.ctx;
    const canvas = this.canvas;

    // Clear
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background pattern
    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);
    ctx.fillStyle = this.backgroundPattern;
    ctx.fillRect(this.camera.x, this.camera.y, canvas.width, canvas.height);
    ctx.restore();

    // World bounds
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 4;
    ctx.strokeRect(-this.camera.x, -this.camera.y, this.worldWidth, this.worldHeight);

    // Apply camera transform
    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);

    // Screen shake
    if (this.screenShake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * this.screenShake * 2,
        (Math.random() - 0.5) * this.screenShake * 2
      );
    }

    // Draw pickups
    for (const pickup of this.pickups) {
      pickup.render(ctx);
    }

    // Draw zombies
    for (const zombie of this.zombies) {
      zombie.render(ctx);
    }

    // Draw projectiles
    for (const proj of this.projectiles) {
      proj.render(ctx);
    }

    // Draw effects
    for (const effect of this.effects) {
      effect.render(ctx);
    }

    // Draw player
    this.player.render(ctx);

    // Draw damage numbers
    for (const dn of this.damageNumbers) {
      ctx.save();
      ctx.translate(dn.x, dn.y);
      ctx.globalAlpha = dn.life / 800;
      ctx.fillStyle = dn.isCrit ? '#ffd700' : '#e94560';
      ctx.font = `bold ${dn.isCrit ? 24 : 18}px monospace`;
      ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      ctx.lineWidth = 3;
      ctx.strokeText(dn.amount, 0, 0);
      ctx.fillText(dn.amount, 0, 0);
      ctx.restore();
    }

    ctx.restore();

    // Draw crosshair in screen space
    this.renderCrosshair(ctx);
  }

  renderCrosshair(ctx) {
    const mx = this.input.mouse.x - this.camera.x;
    const my = this.input.mouse.y - this.camera.y;

    ctx.save();
    ctx.translate(mx, my);
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#e94560';
    ctx.shadowBlur = 10;

    const size = 15;
    const gap = 8;

    // Outer rotating crosshair
    const rotation = Date.now() * 0.001;
    ctx.save();
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.moveTo(-size * 1.5, 0);
    ctx.lineTo(-gap, 0);
    ctx.moveTo(gap, 0);
    ctx.lineTo(size * 1.5, 0);
    ctx.moveTo(0, -size * 1.5);
    ctx.lineTo(0, -gap);
    ctx.moveTo(0, gap);
    ctx.lineTo(0, size * 1.5);
    ctx.stroke();
    ctx.restore();

    // Inner static crosshair
    ctx.beginPath();
    ctx.moveTo(-gap, 0);
    ctx.lineTo(-4, 0);
    ctx.moveTo(4, 0);
    ctx.lineTo(gap, 0);
    ctx.moveTo(0, -gap);
    ctx.lineTo(0, -4);
    ctx.moveTo(0, 4);
    ctx.lineTo(0, gap);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = '#e94560';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}