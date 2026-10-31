import { distance, angleBetween, normalize, randomBetween } from '../utils/math.js';

export const WEAPONS = {
    pistol: {
        id: 'pistol',
        name: 'Pistol',
        icon: '🔫',
        baseDamage: 25,
        baseFireRate: 300,
        baseMagSize: 30,
        baseReloadTime: 1500,
        basePierce: 0,
        baseSpread: 0.05,
        baseProjectileSpeed: 20,
        maxLevel: 5,
        cost: 0,
        description: 'Reliable starter weapon'
    },
    smg: {
        id: 'smg',
        name: 'SMG',
        icon: '🔫',
        baseDamage: 15,
        baseFireRate: 80,
        baseMagSize: 40,
        baseReloadTime: 2000,
        basePierce: 0,
        baseSpread: 0.15,
        baseProjectileSpeed: 22,
        maxLevel: 5,
        cost: 500,
        description: 'High fire rate, low damage'
    },
    shotgun: {
        id: 'shotgun',
        name: 'Shotgun',
        icon: '💥',
        baseDamage: 80,
        baseFireRate: 1000,
        baseMagSize: 8,
        baseReloadTime: 3000,
        basePierce: 2,
        baseSpread: 0.4,
        baseProjectileSpeed: 18,
        maxLevel: 5,
        cost: 1500,
        description: 'Devastating close range'
    },
    rifle: {
        id: 'rifle',
        name: 'Assault Rifle',
        icon: '🔫',
        baseDamage: 35,
        baseFireRate: 150,
        baseMagSize: 30,
        baseReloadTime: 2500,
        basePierce: 1,
        baseSpread: 0.08,
        baseProjectileSpeed: 25,
        maxLevel: 5,
        cost: 3000,
        description: 'Balanced all-rounder'
    },
    sniper: {
        id: 'sniper',
        name: 'Sniper Rifle',
        icon: '🎯',
        baseDamage: 200,
        baseFireRate: 2000,
        baseMagSize: 5,
        baseReloadTime: 3500,
        basePierce: 3,
        baseSpread: 0.01,
        baseProjectileSpeed: 40,
        maxLevel: 5,
        cost: 5000,
        description: 'One shot, one kill'
    },
    minigun: {
        id: 'minigun',
        name: 'Minigun',
        icon: '💣',
        baseDamage: 40,
        baseFireRate: 40,
        baseMagSize: 200,
        baseReloadTime: 5000,
        basePierce: 1,
        baseSpread: 0.2,
        baseProjectileSpeed: 22,
        maxLevel: 3,
        cost: 10000,
        description: 'Shred everything'
    },
    plasma: {
        id: 'plasma',
        name: 'Plasma Rifle',
        icon: '⚡',
        baseDamage: 60,
        baseFireRate: 100,
        baseMagSize: 50,
        baseReloadTime: 2000,
        basePierce: 5,
        baseSpread: 0.05,
        baseProjectileSpeed: 24,
        baseBurn: true,
        maxLevel: 3,
        cost: 15000,
        description: 'Energy burns through'
    },
    railgun: {
        id: 'railgun',
        name: 'Railgun',
        icon: '🚀',
        baseDamage: 500,
        baseFireRate: 3000,
        baseMagSize: 3,
        baseReloadTime: 4000,
        basePierce: 999,
        baseSpread: 0,
        baseProjectileSpeed: 60,
        maxLevel: 2,
        cost: 25000,
        description: 'Pierces infinite enemies'
    }
};

export const UPGRADES = {
    maxHealth: { id: 'maxHealth', name: 'Max Health', desc: 'Increase maximum health', baseCost: 100, costMult: 1.5, maxLevel: 10, value: 20, icon: '❤️' },
    speed: { id: 'speed', name: 'Movement Speed', desc: 'Move faster', baseCost: 150, costMult: 1.5, maxLevel: 10, value: 0.3, icon: '👟' },
    damage: { id: 'damage', name: 'Damage', desc: 'Increase all damage', baseCost: 200, costMult: 1.6, maxLevel: 10, value: 5, icon: '💥' },
    fireRate: { id: 'fireRate', name: 'Fire Rate', desc: 'Shoot faster', baseCost: 250, costMult: 1.6, maxLevel: 10, value: 20, icon: '⚡' },
    reloadTime: { id: 'reloadTime', name: 'Reload Speed', desc: 'Reload faster', baseCost: 200, costMult: 1.5, maxLevel: 10, value: 100, icon: '🔄' },
    magSize: { id: 'magSize', name: 'Magazine Size', desc: 'More ammo per mag', baseCost: 150, costMult: 1.5, maxLevel: 10, value: 5, icon: '📦' },
    critChance: { id: 'critChance', name: 'Crit Chance', desc: 'Chance for double damage', baseCost: 300, costMult: 1.7, maxLevel: 10, value: 0.03, icon: '💥' },
    critDamage: { id: 'critDamage', name: 'Crit Damage', desc: 'Critical hit multiplier', baseCost: 400, costMult: 1.6, maxLevel: 10, value: 0.25, icon: '💣' },
    knockback: { id: 'knockback', name: 'Knockback', desc: 'Push enemies back', baseCost: 200, costMult: 1.5, maxLevel: 10, value: 2, icon: '💨' },
    pierce: { id: 'pierce', name: 'Piercing', desc: 'Bullets pass through', baseCost: 500, costMult: 1.8, maxLevel: 5, value: 1, icon: '🎯' },
    spread: { id: 'spread', name: 'Accuracy', desc: 'Reduce bullet spread', baseCost: 300, costMult: 1.5, maxLevel: 10, value: 0.01, icon: '🎯' },
    projectileSpeed: { id: 'projectileSpeed', name: 'Bullet Speed', desc: 'Faster projectiles', baseCost: 200, costMult: 1.5, maxLevel: 10, value: 2, icon: '🚀' },
    lifesteal: { id: 'lifesteal', name: 'Lifesteal', desc: 'Heal on damage dealt', baseCost: 1000, costMult: 2.0, maxLevel: 5, value: 0.05, icon: '🩸' },
    armor: { id: 'armor', name: 'Armor', desc: 'Reduce incoming damage', baseCost: 800, costMult: 1.8, maxLevel: 10, value: 2, icon: '🛡️' },
    regen: { id: 'regen', name: 'Health Regen', desc: 'Passive health regeneration', baseCost: 1200, costMult: 1.8, maxLevel: 5, value: 1, icon: '💚' },
    xpMultiplier: { id: 'xpMultiplier', name: 'XP Boost', desc: 'Gain more experience', baseCost: 2000, costMult: 2.0, maxLevel: 5, value: 0.1, icon: '✨' },
    moneyMultiplier: { id: 'moneyMultiplier', name: 'Money Boost', desc: 'Earn more money', baseCost: 2000, costMult: 2.0, maxLevel: 5, value: 0.1, icon: '💰' }
};

export class Player {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.game = game;
        this.radius = 20;

        // Core stats
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.baseSpeed = 3.5;
        this.speed = this.baseSpeed;
        this.angle = 0;

        // Weapon system
        this.currentWeaponId = 'pistol';
        this.ownedWeapons = new Set(['pistol']);
        this.weaponLevels = { pistol: 1 };
        this.ammo = 30;
        this.magSize = 30;
        this.reserveAmmo = 120;
        this.reloading = false;
        this.reloadTimer = 0;
        this.fireTimer = 0;
        this.lastFireTime = 0;

        // Base weapon stats (set by Shop.js equipWeapon)
        this.baseDamage = 25;
        this.baseFireRate = 300;
        this.baseMagSize = 30;
        this.baseReloadTime = 1500;
        this.basePierce = 0;
        this.baseSpread = 0.05;
        this.baseProjectileSpeed = 20;
        this.baseBurn = false;
        this.burnDamage = 0;

        // Upgrade system
        this.upgradeLevels = {};
        for (const key of Object.keys(UPGRADES)) {
            this.upgradeLevels[key] = 0;
        }
        this.recalculateStats();

        // XP and Level
        this.level = 1;
        this.xp = 0;
        this.xpToNext = 100;
        this.xpMultiplier = 1;

        // Money multiplier
        this.moneyMultiplier = 1;

        // Kill streak
        this.killStreak = 0;
        this.killStreakMultiplier = 1.0;
        this.lastKillTime = 0;
        this.streakTimeout = 3000;

        // Dash ability
        this.dashCooldown = 0;
        this.dashDuration = 0;
        this.dashMaxDuration = 200;
        this.dashSpeed = 25;
        this.dashCooldownMax = 1200;
        this.isDashing = false;
        this.dashDirection = { x: 0, y: 0 };
        this.dashTrail = [];
        this.invincible = false;
        this.invincibleTimer = 0;
        this.hitFlashTimer = 0;

        // Power-ups
        this.powerUps = {
            speed: { active: false, time: 0, value: 1.5 },
            damage: { active: false, time: 0, value: 2 },
            fireRate: { active: false, time: 0, value: 2 },
            shield: { active: false, time: 0, value: 50 }
        };

        // Regen
        this.regen = 0;
        this.regenDelay = 0;

        // Lifesteal
        this.lifesteal = 0;

        // Armor
        this.armor = 0;

        // Visual
        this.bodyColor = '#4488ff';
        this.gunColor = '#666666';
        this.walkCycle = 0;
        this.bobOffset = 0;

        // Combat stats
        this.damage = 25;
        this.fireRate = 300;
        this.pierce = 0;
        this.spread = 0.05;
        this.projectileSpeed = 20;
        this.knockback = 0;
        this.critChance = 0;
        this.critDamage = 1;
        this.burnDamage = 0;
    }

    recalculateStats() {
        const weapon = WEAPONS[this.currentWeaponId] || WEAPONS.pistol;
        const weaponLevel = this.weaponLevels[this.currentWeaponId] || 1;
        const levelMult = 1 + (weaponLevel - 1) * 0.15;

        // Base weapon stats - use properties set by Shop.js equipWeapon, or fall back to WEAPONS data
        this.damage = (this.baseDamage || weapon.baseDamage) * levelMult;
        this.fireRate = this.baseFireRate || weapon.baseFireRate;
        this.magSize = Math.floor((this.baseMagSize || weapon.baseMagSize) * levelMult);
        this.reloadTime = this.baseReloadTime || weapon.baseReloadTime;
        this.pierce = this.basePierce !== undefined ? this.basePierce : (weapon.basePierce || 0);
        this.spread = this.baseSpread !== undefined ? this.baseSpread : (weapon.baseSpread || 0.05);
        this.projectileSpeed = this.baseProjectileSpeed || weapon.baseProjectileSpeed || 20;
        this.burnDamage = this.baseBurn ? 20 : (weapon.baseBurn ? 20 : 0);

        // Apply upgrades
        for (const [id, level] of Object.entries(this.upgradeLevels)) {
            if (level > 0) {
                const upgrade = UPGRADES[id];
                const value = upgrade.value * level;

                switch (id) {
                    case 'maxHealth':
                        const oldMax = this.maxHealth;
                        this.maxHealth = 100 + value;
                        this.health += this.maxHealth - oldMax;
                        break;
                    case 'speed':
                        this.speed = this.baseSpeed * (1 + value);
                        break;
                    case 'damage':
                        this.damage += value;
                        break;
                    case 'fireRate':
                        this.fireRate = Math.max(30, this.fireRate - value);
                        break;
                    case 'reloadTime':
                        this.reloadTime = Math.max(200, this.reloadTime - value);
                        break;
                    case 'magSize':
                        this.magSize += value;
                        break;
                    case 'critChance':
                        this.critChance = Math.min(0.5, this.critChance + value);
                        break;
                    case 'critDamage':
                        this.critDamage += value;
                        break;
                    case 'knockback':
                        this.knockback += value;
                        break;
                    case 'pierce':
                        this.pierce += value;
                        break;
                    case 'spread':
                        this.spread = Math.max(0, this.spread - value);
                        break;
                    case 'projectileSpeed':
                        this.projectileSpeed += value;
                        break;
                    case 'lifesteal':
                        this.lifesteal += value;
                        break;
                    case 'armor':
                        this.armor += value;
                        break;
                    case 'regen':
                        this.regen += value;
                        break;
                    case 'xpMultiplier':
                        this.xpMultiplier += value;
                        break;
                    case 'moneyMultiplier':
                        this.moneyMultiplier += value;
                        break;
                }
            }
        }

        // Apply power-up multipliers
        if (this.powerUps.damage.active) this.damage *= this.powerUps.damage.value;
        if (this.powerUps.fireRate.active) this.fireRate = Math.max(30, this.fireRate / this.powerUps.fireRate.value);
        if (this.powerUps.speed.active) this.speed = this.baseSpeed * (1 + (this.upgradeLevels.speed || 0) * UPGRADES.speed.value) * this.powerUps.speed.value;
    }

    update(dt, input) {
        // Update timers
        if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
            if (this.invincibleTimer <= 0) this.invincible = false;
        }
        if (this.dashCooldown > 0) this.dashCooldown -= dt;
        if (this.regenDelay > 0) this.regenDelay -= dt;

        // Update power-ups
        for (const [key, pu] of Object.entries(this.powerUps)) {
            if (pu.active) {
                pu.time -= dt;
                if (pu.time <= 0) {
                    pu.active = false;
                    this.recalculateStats();
                }
            }
        }

        // Update kill streak
        if (this.killStreak > 0 && Date.now() - this.lastKillTime > this.streakTimeout) {
            this.killStreak = 0;
            this.killStreakMultiplier = 1.0;
        }

        // Health regen
        if (this.health < this.maxHealth && this.regenDelay <= 0 && this.regen > 0) {
            this.health = Math.min(this.maxHealth, this.health + this.regen * dt / 1000);
        }

        // Handle input
        this.handleInput(dt, input);

        // Update dash
        this.updateDash(dt);

        // Update weapon
        if (this.fireTimer > 0) this.fireTimer -= dt;
        if (this.reloading) {
            this.reloadTimer -= dt;
            if (this.reloadTimer <= 0) {
                this.reloading = false;
                this.ammo = this.magSize;
            }
        }

        // Clamp to world bounds
        const margin = this.radius;
        this.x = Math.max(margin, Math.min(this.game.worldWidth - margin, this.x));
        this.y = Math.max(margin, Math.min(this.game.worldHeight - margin, this.y));

        // Update walk animation
        if (this.vx !== 0 || this.vy !== 0) {
            this.walkCycle += dt * 0.01;
            this.bobOffset = Math.sin(this.walkCycle) * 3;
        } else {
            this.bobOffset *= 0.9;
        }
    }

    handleInput(dt, input) {
        // Movement
        let moveX = 0, moveY = 0;
        if (input.keys['w'] || input.keys['arrowup']) moveY -= 1;
        if (input.keys['s'] || input.keys['arrowdown']) moveY += 1;
        if (input.keys['a'] || input.keys['arrowleft']) moveX -= 1;
        if (input.keys['d'] || input.keys['arrowright']) moveX += 1;

        const moveLen = Math.sqrt(moveX * moveX + moveY * moveY);
        if (moveLen > 0) {
            moveX /= moveLen;
            moveY /= moveLen;
        }

        // Dash
        if (input.keys[' '] && this.dashCooldown <= 0 && !this.isDashing && moveLen > 0) {
            this.startDash(moveX, moveY);
        }

        if (this.isDashing) {
            this.vx = this.dashDirection.x * this.dashSpeed;
            this.vy = this.dashDirection.y * this.dashSpeed;
        } else {
            this.vx = moveX * this.speed;
            this.vy = moveY * this.speed;
        }

        this.x += this.vx * dt / 16;
        this.y += this.vy * dt / 16;

        // Aim
        if (input.mouse) {
            this.angle = angleBetween(this.x, this.y, input.mouse.x, input.mouse.y);
        }

        // Shoot
        if (input.mouse && input.mouse.down && !this.reloading && this.fireTimer <= 0) {
            if (this.ammo > 0 || this.currentWeaponId === 'pistol') {
                this.shoot();
            } else {
                this.startReload();
            }
        }

        // Reload
        if (input.keys['r'] && !this.reloading && this.ammo < this.magSize && this.reserveAmmo > 0) {
            this.startReload();
        }

        // Weapon switch - handled by Game.js via number keys for consumables
        // Weapon switching could be added here with Tab or other keys
    }

    startDash(dirX, dirY) {
        this.isDashing = true;
        this.dashDuration = this.dashMaxDuration;
        this.dashDirection = { x: dirX, y: dirY };
        this.dashCooldown = this.dashCooldownMax;
        this.invincible = true;
        this.invincibleTimer = this.dashMaxDuration + 100;
        this.dashTrail = [];
        for (let i = 0; i < 8; i++) {
            this.dashTrail.push({ x: this.x, y: this.y, alpha: 1 - i * 0.12 });
        }
        this.game.screenShake = Math.max(this.game.screenShake, 5);
    }

    updateDash(dt) {
        if (this.isDashing) {
            this.dashDuration -= dt;
            this.dashTrail.unshift({ x: this.x, y: this.y, alpha: 1 });
            if (this.dashTrail.length > 10) this.dashTrail.pop();

            if (this.dashDuration <= 0) {
                this.isDashing = false;
                this.dashTrail = [];
            }
        } else {
            for (const trail of this.dashTrail) {
                trail.alpha -= dt * 0.005;
            }
            this.dashTrail = this.dashTrail.filter(t => t.alpha > 0);
        }
    }

    shoot() {
        const weapon = WEAPONS[this.currentWeaponId];
        if (!weapon) return;

        const isCrit = Math.random() < (this.critChance || 0);
        const damage = isCrit ? this.damage * (this.critDamage || 1) : this.damage;
        const bulletCount = this.currentWeaponId === 'shotgun' ? 8 : 1;
        const spread = this.currentWeaponId === 'shotgun' ? this.spread * 2 : this.spread;

        for (let i = 0; i < bulletCount; i++) {
            const bulletSpread = (Math.random() - 0.5) * 2 * spread;
            const angle = this.angle + bulletSpread;
            const speed = this.projectileSpeed;

            this.game.projectiles.push({
                x: this.x + Math.cos(this.angle) * 25,
                y: this.y + Math.sin(this.angle) * 25,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                damage: damage,
                pierce: this.pierce,
                isCrit: isCrit,
                color: this.getWeaponColor(),
                radius: 4,
                life: 2000,
                trail: [],
                maxTrail: 8,
                burnDamage: this.burnDamage,
                update(dt) {
                    this.trail.unshift({ x: this.x, y: this.y });
                    if (this.trail.length > this.maxTrail) this.trail.pop();
                    this.x += this.vx * dt / 16;
                    this.y += this.vy * dt / 16;
                    this.life -= dt;
                },
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
            });
        }

        this.ammo = Math.max(0, this.ammo - 1);
        this.fireTimer = this.fireRate;
        this.lastFireTime = Date.now();

        // Muzzle flash particles
        for (let i = 0; i < 3; i++) {
            const angle = this.angle + Math.PI + (Math.random() - 0.5) * 0.5;
            this.game.addEffect(new MuzzleFlash(this.x + Math.cos(this.angle) * 25, this.y + Math.sin(this.angle) * 25, angle, this.getWeaponColor()));
        }

        // Knockback
        if (this.knockback > 0) {
            this.vx -= Math.cos(this.angle) * this.knockback;
            this.vy -= Math.sin(this.angle) * this.knockback;
        }
    }

    getWeaponColor() {
        const colors = {
            pistol: '#ffff00',
            smg: '#00ffff',
            shotgun: '#ff6600',
            rifle: '#ff00ff',
            sniper: '#8844ff',
            minigun: '#ff3333',
            plasma: '#00ffff',
            railgun: '#00ffff'
        };
        return colors[this.currentWeaponId] || '#ffff00';
    }

    startReload() {
        if (this.reloading || this.ammo >= this.magSize || this.reserveAmmo <= 0) return;
        if (this.currentWeaponId === 'pistol') return; // Pistol has infinite ammo

        this.reloading = true;
        this.reloadTimer = this.reloadTime;
    }

    takeDamage(amount, sourceX, sourceY) {
        if (this.invincible) return;

        // Apply armor
        const actualDamage = Math.max(1, amount - this.armor);
        this.health -= actualDamage;
        this.regenDelay = 3000;
        this.hitFlashTimer = 150;
        this.invincible = true;
        this.invincibleTimer = 500;

        // Knockback
        if (sourceX !== undefined && sourceY !== undefined) {
            const angle = angleBetween(sourceX, sourceY, this.x, this.y);
            const knockbackForce = 8;
            this.vx += Math.cos(angle) * knockbackForce;
            this.vy += Math.sin(angle) * knockbackForce;
        }

        this.game.screenShake = Math.max(this.game.screenShake, 8);
        this.game.addEffect(new HitFlashEffect(this.x, this.y));

        if (this.health <= 0) {
            this.die();
        }
    }

    heal(amount) {
        const oldHealth = this.health;
        this.health = Math.min(this.maxHealth, this.health + amount);
        const actualHeal = this.health - oldHealth;
        if (actualHeal > 0) {
            this.game.addEffect(new HealEffect(this.x, this.y, actualHeal));
        }
    }

    addXP(amount) {
        this.xp += amount * this.xpMultiplier;
        while (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.level++;
            this.xpToNext = Math.floor(100 * Math.pow(1.4, this.level - 1));
            this.health = this.maxHealth;
            this.game.addEffect(new LevelUpEffect(this.x, this.y));
            this.game.addPickupNotification(`LEVEL UP! Reached Level ${this.level}`);
        }
    }

    addKillStreak() {
        this.killStreak++;
        this.lastKillTime = Date.now();
        this.killStreakMultiplier = 1 + Math.min(this.killStreak * 0.1, 3.0);
    }

    activatePowerUp(type, duration) {
        if (this.powerUps[type]) {
            this.powerUps[type].active = true;
            this.powerUps[type].time = duration;
            this.recalculateStats();
        }
    }

    die() {
        this.health = 0;
        this.game.screenShake = 30;
        for (let i = 0; i < 30; i++) {
            this.game.addEffect(new BloodParticle(this.x, this.y));
        }
    }

    applyUpgrade(upgradeId, value) {
        // Called from Shop.js when buying upgrade
        this.upgradeLevels[upgradeId] = (this.upgradeLevels[upgradeId] || 0) + 1;
        this.recalculateStats();
    }

    equipWeapon(weapon) {
        // Handle both weapon ID string and weapon object (from Shop.js)
        const weaponId = typeof weapon === 'string' ? weapon : weapon.id;
        if (!this.ownedWeapons.has(weaponId)) return;

        this.currentWeaponId = weaponId;

        // If weapon object provided, set base stats (Shop.js compatibility)
        if (typeof weapon === 'object') {
            this.baseDamage = weapon.baseDamage;
            this.baseFireRate = weapon.baseFireRate;
            this.baseMagSize = weapon.baseMagSize;
            this.baseReloadTime = weapon.baseReloadTime;
            this.basePierce = weapon.basePierce || 0;
            this.baseSpread = weapon.baseSpread || 0.05;
            this.baseProjectileSpeed = weapon.baseProjectileSpeed || 20;
            this.baseBurn = weapon.baseBurn || false;
        }

        this.ammo = this.magSize;
        this.recalculateStats();
    }

    render(ctx) {
        if (this.health <= 0) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Dash trail
        for (const trail of this.dashTrail) {
            ctx.globalAlpha = trail.alpha * 0.3;
            ctx.fillStyle = this.bodyColor;
            ctx.beginPath();
            ctx.ellipse(trail.x - this.x, trail.y - this.y, this.radius * 1.2, this.radius * 0.6, this.angle, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Hit flash / invincibility glow
        if (this.hitFlashTimer > 0) {
            ctx.shadowColor = '#e94560';
            ctx.shadowBlur = 20;
        } else if (this.invincible) {
            ctx.shadowColor = '#00d4ff';
            ctx.shadowBlur = 15;
        } else if (this.powerUps.shield.active) {
            ctx.shadowColor = '#00d4ff';
            ctx.shadowBlur = 10;
        }

        // Body
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.ellipse(0, this.bobOffset, this.radius, this.radius * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body highlight
        ctx.fillStyle = '#66aaff';
        ctx.beginPath();
        ctx.ellipse(-3, this.bobOffset - 4, this.radius * 0.5, this.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shield effect
        if (this.powerUps.shield.active) {
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, this.bobOffset, this.radius * 1.3, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Gun
        const weapon = WEAPONS[this.currentWeaponId];
        const gunLength = 28;
        const gunWidth = 6;
        const gunColor = this.getWeaponColor();

        ctx.fillStyle = this.gunColor;
        ctx.beginPath();
        ctx.roundRect(gunLength * 0.2, -gunWidth / 2, gunLength, gunWidth, 3);
        ctx.fill();

        ctx.fillStyle = gunColor;
        ctx.beginPath();
        ctx.roundRect(gunLength * 0.2, -gunWidth / 2 + 1, gunLength * 0.85, gunWidth - 2, 2);
        ctx.fill();

        // Muzzle flash indicator
        if (this.fireTimer > this.fireRate * 0.7 && !this.reloading) {
            ctx.fillStyle = gunColor;
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
            ctx.beginPath();
            ctx.arc(gunLength + 5, 0, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        ctx.restore();

        // Health bar above player
        if (this.health < this.maxHealth) {
            const barWidth = 50;
            const barHeight = 5;
            const healthRatio = this.health / this.maxHealth;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 15, barWidth, barHeight);
            ctx.fillStyle = healthRatio > 0.3 ? '#00ff88' : '#e94560';
            ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 15, barWidth * healthRatio, barHeight);
        }

        // Power-up indicators on player
        let indicatorY = this.y - this.radius - 25;
        for (const [key, pu] of Object.entries(this.powerUps)) {
            if (pu.active) {
                const icons = { speed: '💨', damage: '💥', fireRate: '⚡', shield: '🛡️' };
                ctx.fillStyle = '#fff';
                ctx.font = '16px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(icons[key], this.x, indicatorY);
                indicatorY -= 20;
            }
        }
    }
}

class MuzzleFlash {
    constructor(x, y, angle, color) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.color = color;
        this.life = 50;
        this.size = 8 + Math.random() * 8;
    }

    update(dt) {
        this.life -= dt;
        this.size *= 0.9;
    }

    render(ctx) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.life / 50;
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

class HitFlashEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 100;
        this.maxRadius = 30;
    }

    update(dt) {
        this.life -= dt;
    }

    render(ctx) {
        if (this.life <= 0) return;
        const progress = 1 - this.life / 100;
        const radius = this.maxRadius * progress;
        const alpha = 1 - progress;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.strokeStyle = `rgba(233, 69, 96, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

class HealEffect {
    constructor(x, y, amount) {
        this.x = x;
        this.y = y;
        this.amount = amount;
        this.life = 800;
        this.vy = -50;
    }

    update(dt) {
        this.life -= dt;
        this.y += this.vy * dt / 1000;
    }

    render(ctx) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = this.life / 800;
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 3;
        ctx.strokeText(`+${this.amount}`, 0, 0);
        ctx.fillText(`+${this.amount}`, 0, 0);
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

class LevelUpEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 1500;
        this.particles = [];
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 / 20) * i;
            this.particles.push({
                x: 0, y: 0,
                vx: Math.cos(angle) * 150,
                vy: Math.sin(angle) * 150,
                size: 4 + Math.random() * 4,
                color: ['#00ff88', '#00d4ff', '#ffd700', '#fff'][Math.floor(Math.random() * 4)],
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.2
            });
        }
        this.rings = [];
        for (let i = 0; i < 3; i++) {
            this.rings.push({ radius: 0, maxRadius: 60 + i * 30, alpha: 1 });
        }
    }

    update(dt) {
        this.life -= dt;
        for (const p of this.particles) {
            p.x += p.vx * dt / 1000;
            p.y += p.vy * dt / 1000;
            p.vy += 200 * dt / 1000;
            p.size *= 0.99;
            p.rotation += p.rotSpeed;
        }
        for (const r of this.rings) {
            r.radius += dt * 0.3;
            r.alpha = 1 - r.radius / r.maxRadius;
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        for (const r of this.rings) {
            if (r.alpha > 0) {
                ctx.globalAlpha = r.alpha * 0.5;
                ctx.strokeStyle = '#00ff88';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, r.radius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        for (const p of this.particles) {
            ctx.globalAlpha = this.life / 1500;
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

class BloodParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 200;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = 3 + Math.random() * 5;
        this.color = ['#e94560', '#c73659', '#ff6b7a', '#8b0000'][Math.floor(Math.random() * 4)];
        this.life = 1000 + Math.random() * 1000;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.1;
    }

    update(dt) {
        this.life -= dt;
        this.x += this.vx * dt / 1000;
        this.y += this.vy * dt / 1000;
        this.vy += 300 * dt / 1000;
        this.size *= 0.995;
        this.rotation += this.rotSpeed;
    }

    render(ctx) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.life / 2000;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}