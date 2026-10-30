// Zombie Gaem - Top Down Zombie Survival Shooter
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
const game = {
    running: false,
    paused: false,
    gameOver: false,
    wave: 1,
    waveInProgress: false,
    zombiesToSpawn: 0,
    spawnTimer: 0,
    spawnInterval: 1000,
    time: 0,
    screenShake: 0,
    screenShakeIntensity: 0
};

// Player
const player = {
    x: 0, y: 0,
    width: 32, height: 32,
    speed: 220,
    maxHealth: 100,
    health: 100,
    angle: 0,
    money: 0,
    kills: 0,
    killStreak: 0,
    maxStreak: 0,
    lastKillTime: 0,
    streakTimeout: 3000,
    invulnerable: 0,
    invulnTime: 0.5,
    // Weapons
    weapon: 'pistol',
    weapons: {
        pistol: { damage: 25, fireRate: 300, spread: 0.05, range: 600, bulletSpeed: 800, maxAmmo: 90, ammo: 90, reloadTime: 1500, reloading: false, reloadTimer: 0, bulletsPerShot: 1, pierce: 0, knockback: 100, color: '#ffd700', name: 'PISTOL' },
        smg: { damage: 18, fireRate: 80, spread: 0.15, range: 400, bulletSpeed: 900, maxAmmo: 150, ammo: 150, reloadTime: 2000, reloading: false, reloadTimer: 0, bulletsPerShot: 1, pierce: 0, knockback: 50, color: '#00ffff', name: 'SMG' },
        shotgun: { damage: 12, fireRate: 800, spread: 0.4, range: 300, bulletSpeed: 600, maxAmmo: 32, ammo: 32, reloadTime: 2500, reloading: false, reloadTimer: 0, bulletsPerShot: 8, pierce: 1, knockback: 200, color: '#ff6b35', name: 'SHOTGUN' },
        rifle: { damage: 55, fireRate: 600, spread: 0.02, range: 800, bulletSpeed: 1200, maxAmmo: 40, ammo: 40, reloadTime: 2200, reloading: false, reloadTimer: 0, bulletsPerShot: 1, pierce: 2, knockback: 150, color: '#ff3333', name: 'RIFLE' },
        minigun: { damage: 22, fireRate: 50, spread: 0.12, range: 550, bulletSpeed: 1000, maxAmmo: 300, ammo: 300, reloadTime: 4000, reloading: false, reloadTimer: 0, bulletsPerShot: 1, pierce: 1, knockback: 80, color: '#ffaa00', name: 'MINIGUN' }
    },
    fireTimer: 0,
    autoFire: false,
    // Upgrades
    upgrades: {
        health: 0, // +25 max health per level
        speed: 0,  // +15% speed per level
        damage: 0, // +15% damage per level
        fireRate: 0, // -10% fire rate per level
        ammo: 0,   // +25% max ammo per level
        regen: 0,  // health regen per second
        lifesteal: 0, // % damage healed
        pierce: 0, // +1 pierce
        spread: 0, // -15% spread per level
        knockback: 0, // +50% knockback
        xpGain: 0  // +20% money per kill
    }
};

// Input
const keys = {};
const mouse = { x: 0, y: 0, down: false, worldX: 0, worldY: 0 };

// Entities
const bullets = [];
const zombies = [];
const particles = [];
const moneyPopups = [];
const killFeed = [];

// Camera
const camera = { x: 0, y: 0, zoom: 1, targetZoom: 1 };

// Shop items
const shopItems = [
    { id: 'smg', name: 'SMG', price: 500, desc: 'High fire rate, low damage. Great for crowds.', weapon: 'smg', owned: false },
    { id: 'shotgun', name: 'SHOTGUN', price: 800, desc: 'Devastating close range. Multiple pellets.', weapon: 'shotgun', owned: false },
    { id: 'rifle', name: 'RIFLE', price: 1500, desc: 'High damage, long range. Precision weapon.', weapon: 'rifle', owned: false },
    { id: 'minigun', name: 'MINIGUN', price: 3000, desc: 'Shreds everything. Massive ammo capacity.', weapon: 'minigun', owned: false },
    { id: 'health', name: 'MAX HEALTH', price: 300, desc: '+25 max health per level.', upgrade: 'health', maxLevel: 5, owned: false },
    { id: 'speed', name: 'MOVEMENT SPEED', price: 400, desc: '+15% movement speed per level.', upgrade: 'speed', maxLevel: 5, owned: false },
    { id: 'damage', name: 'DAMAGE BOOST', price: 500, desc: '+15% weapon damage per level.', upgrade: 'damage', maxLevel: 5, owned: false },
    { id: 'fireRate', name: 'FIRE RATE', price: 450, desc: '-10% delay between shots per level.', upgrade: 'fireRate', maxLevel: 5, owned: false },
    { id: 'ammo', name: 'AMMO CAPACITY', price: 350, desc: '+25% max ammo per level.', upgrade: 'ammo', maxLevel: 5, owned: false },
    { id: 'regen', name: 'HEALTH REGEN', price: 600, desc: 'Regenerate 2 HP/sec per level.', upgrade: 'regen', maxLevel: 3, owned: false },
    { id: 'lifesteal', name: 'LIFESTEAL', price: 1000, desc: 'Heal for 5% of damage dealt per level.', upgrade: 'lifesteal', maxLevel: 3, owned: false },
    { id: 'pierce', name: 'BULLET PIERCE', price: 800, desc: 'Bullets pierce +1 zombie per level.', upgrade: 'pierce', maxLevel: 3, owned: false },
    { id: 'spread', name: 'ACCURACY', price: 400, desc: '-15% bullet spread per level.', upgrade: 'spread', maxLevel: 5, owned: false },
    { id: 'knockback', name: 'KNOCKBACK', price: 350, desc: '+50% knockback force per level.', upgrade: 'knockback', maxLevel: 3, owned: false },
    { id: 'xpGain', name: 'MONEY MULTIPLIER', price: 1200, desc: '+20% money per kill per level.', upgrade: 'xpGain', maxLevel: 5, owned: false }
];

// Zombie types
const zombieTypes = {
    walker: { health: 50, speed: 60, damage: 10, size: 28, color: '#4a7c59', xp: 10, knockbackResist: 1, score: 10 },
    runner: { health: 30, speed: 140, damage: 8, size: 22, color: '#8fbc8f', xp: 15, knockbackResist: 0.5, score: 15 },
    tank: { health: 200, speed: 35, damage: 25, size: 40, color: '#2d5a3d', xp: 50, knockbackResist: 2, score: 50 },
    spitter: { health: 40, speed: 50, damage: 0, size: 26, color: '#6b8e6b', xp: 20, knockbackResist: 1, score: 20, ranged: true, projectileSpeed: 300, projectileDamage: 15, attackRange: 400, attackCooldown: 2000 },
    exploder: { health: 35, speed: 80, damage: 40, size: 24, color: '#c0392b', xp: 30, knockbackResist: 0.8, score: 30, explosive: true, explosionRadius: 100, explosionDamage: 50 },
    boss: { health: 1000, speed: 30, damage: 40, size: 60, color: '#1a1a2e', xp: 500, knockbackResist: 5, score: 500, boss: true }
};

// Wave configurations
const waveConfigs = [
    { walker: 8 },
    { walker: 12 },
    { walker: 10, runner: 4 },
    { walker: 15, runner: 5 },
    { walker: 12, runner: 6, tank: 1 },
    { walker: 18, runner: 8, spitter: 2 },
    { walker: 15, runner: 10, tank: 2, spitter: 3 },
    { walker: 20, runner: 12, tank: 2, spitter: 4, exploder: 2 },
    { walker: 25, runner: 15, tank: 3, spitter: 5, exploder: 3 },
    { walker: 30, runner: 18, tank: 4, spitter: 6, exploder: 4, boss: 1 }
];

// Initialize
function init() {
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', (e) => { keys[e.code] = true; if (e.code === 'Space') e.preventDefault(); });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('mousedown', (e) => { if (e.button === 0) { mouse.down = true; player.autoFire = true; } });
    canvas.addEventListener('mouseup', (e) => { if (e.button === 0) { mouse.down = false; player.autoFire = false; } });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('wheel', (e) => {
        camera.targetZoom = Math.max(0.5, Math.min(2, camera.targetZoom - e.deltaY * 0.001));
    }, { passive: true });

    // Shop handle hover
    const shop = document.getElementById('shop');
    const handle = document.getElementById('shop-handle');
    handle.addEventListener('mouseenter', () => shop.classList.add('open'));
    shop.addEventListener('mouseleave', () => shop.classList.remove('open'));

    // Shop items
    const shopItemsContainer = document.getElementById('shop-items');
    shopItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.dataset.id = item.id;
        div.innerHTML = `
            <div class="shop-item-header">
                <span class="shop-item-name">${item.name}</span>
                <span class="shop-item-price">$${item.price}</span>
            </div>
            <div class="shop-item-desc">${item.desc}</div>
            ${item.maxLevel ? `<div class="shop-item-stats"><span class="shop-stat">LEVEL: <span class="shop-stat-value" data-level>0</span> / ${item.maxLevel}</span></div>` : ''}
        `;
        div.addEventListener('click', () => buyItem(item.id));
        shopItemsContainer.appendChild(div);
    });

    // Restart button
    document.getElementById('restart-btn').addEventListener('click', startGame);

    // Prevent scroll on mobile
    document.body.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

    startGame();
    requestAnimationFrame(gameLoop);
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = canvas.width / 2 / camera.zoom;
    player.y = canvas.height / 2 / camera.zoom;
}

function startGame() {
    game.running = true;
    game.gameOver = false;
    game.wave = 1;
    game.waveInProgress = false;
    game.zombiesToSpawn = 0;
    game.spawnTimer = 0;
    game.time = 0;
    game.screenShake = 0;

    player.x = canvas.width / 2 / camera.zoom;
    player.y = canvas.height / 2 / camera.zoom;
    player.health = player.maxHealth;
    player.money = 0;
    player.kills = 0;
    player.killStreak = 0;
    player.maxStreak = 0;
    player.lastKillTime = 0;
    player.invulnerable = 0;
    player.weapon = 'pistol';
    Object.keys(player.weapons).forEach(w => {
        player.weapons[w].ammo = getMaxAmmo(w);
        player.weapons[w].reloading = false;
        player.weapons[w].reloadTimer = 0;
    });
    Object.keys(player.upgrades).forEach(u => player.upgrades[u] = 0);

    bullets.length = 0;
    zombies.length = 0;
    particles.length = 0;
    moneyPopups.length = 0;
    killFeed.length = 0;
    document.getElementById('kill-feed').innerHTML = '';

    shopItems.forEach(item => {
        item.owned = false;
        if (item.maxLevel) item.level = 0;
    });
    updateShopUI();

    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('wave-transition').classList.add('hidden');

    startWave();
    updateUI();
}

function getMaxAmmo(weaponId) {
    const base = player.weapons[weaponId].maxAmmo;
    return Math.floor(base * (1 + player.upgrades.ammo * 0.25));
}

function getWeaponStats(weaponId) {
    const base = player.weapons[weaponId];
    const dmgMult = 1 + player.upgrades.damage * 0.15;
    const fireRateMult = 1 / (1 + player.upgrades.fireRate * 0.1);
    const spreadMult = 1 / (1 + player.upgrades.spread * 0.15);
    const knockbackMult = 1 + player.upgrades.knockback * 0.5;
    const pierce = base.pierce + player.upgrades.pierce;
    return {
        damage: base.damage * dmgMult,
        fireRate: base.fireRate * fireRateMult,
        spread: base.spread * spreadMult,
        range: base.range,
        bulletSpeed: base.bulletSpeed,
        maxAmmo: getMaxAmmo(weaponId),
        reloadTime: base.reloadTime,
        bulletsPerShot: base.bulletsPerShot,
        pierce,
        knockback: base.knockback * knockbackMult,
        color: base.color,
        name: base.name
    };
}

function startWave() {
    game.waveInProgress = true;
    const config = waveConfigs[Math.min(game.wave - 1, waveConfigs.length - 1)];
    game.zombiesToSpawn = 0;
    Object.entries(config).forEach(([type, count]) => {
        game.zombiesToSpawn += count;
    });
    game.spawnTimer = 0;
    game.spawnInterval = Math.max(300, 1000 - game.wave * 50);

    showWaveTransition();
}

function showWaveTransition() {
    const el = document.getElementById('wave-transition');
    document.getElementById('wave-text').textContent = `WAVE ${game.wave}`;
    const bonus = game.wave * 50;
    document.getElementById('wave-bonus').textContent = `WAVE BONUS: $${bonus}`;
    el.classList.remove('hidden');
    player.money += bonus;
    updateUI();
    setTimeout(() => el.classList.add('hidden'), 2500);
}

function spawnZombie() {
    if (game.zombiesToSpawn <= 0) return;

    const config = waveConfigs[Math.min(game.wave - 1, waveConfigs.length - 1)];
    const availableTypes = Object.keys(config).filter(t => config[t] > 0);
    if (availableTypes.length === 0) return;

    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    config[type]--;
    game.zombiesToSpawn--;

    const zType = zombieTypes[type];
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(canvas.width, canvas.height) / camera.zoom * 0.6 + 100;
    const x = player.x + Math.cos(angle) * dist;
    const y = player.y + Math.sin(angle) * dist;

    zombies.push({
        x, y,
        width: zType.size,
        height: zType.size,
        health: zType.health * (1 + game.wave * 0.1),
        maxHealth: zType.health * (1 + game.wave * 0.1),
        speed: zType.speed,
        damage: zType.damage,
        color: zType.color,
        xp: zType.xp,
        score: zType.score,
        knockbackResist: zType.knockbackResist,
        type: type,
        ranged: zType.ranged || false,
        projectileSpeed: zType.projectileSpeed || 0,
        projectileDamage: zType.projectileDamage || 0,
        attackRange: zType.attackRange || 0,
        attackCooldown: zType.attackCooldown || 0,
        attackTimer: 0,
        explosive: zType.explosive || false,
        explosionRadius: zType.explosionRadius || 0,
        explosionDamage: zType.explosionDamage || 0,
        boss: zType.boss || false,
        hitFlash: 0,
        stuckTimer: 0
    });
}

function update(dt) {
    if (!game.running || game.gameOver) return;

    game.time += dt;

    // Screen shake
    if (game.screenShake > 0) {
        game.screenShake -= dt;
        camera.x = (Math.random() - 0.5) * game.screenShakeIntensity * (game.screenShake / 0.3);
        camera.y = (Math.random() - 0.5) * game.screenShakeIntensity * (game.screenShake / 0.3);
    } else {
        camera.x = 0;
        camera.y = 0;
    }

    camera.zoom += (camera.targetZoom - camera.zoom) * 0.1;

    // Player invulnerability
    if (player.invulnerable > 0) {
        player.invulnerable -= dt;
    }

    // Health regen
    if (player.upgrades.regen > 0 && player.health < player.maxHealth) {
        player.health = Math.min(player.maxHealth, player.health + player.upgrades.regen * 2 * dt / 1000);
        updateUI();
    }

    // Kill streak timeout
    if (player.killStreak > 0 && game.time - player.lastKillTime > player.streakTimeout) {
        player.killStreak = 0;
        updateUI();
    }

    // Weapon reload
    const weapon = getWeaponStats(player.weapon);
    const weaponBase = player.weapons[player.weapon];
    if (weaponBase.reloading) {
        weaponBase.reloadTimer -= dt;
        if (weaponBase.reloadTimer <= 0) {
            weaponBase.reloading = false;
            weaponBase.ammo = weapon.maxAmmo;
            updateUI();
        }
    }

    // Fire timer
    if (player.fireTimer > 0) player.fireTimer -= dt;

    // Player movement
    let moveX = 0, moveY = 0;
    if (keys['KeyW'] || keys['ArrowUp']) moveY -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveY += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

    if (moveX !== 0 || moveY !== 0) {
        const len = Math.hypot(moveX, moveY);
        moveX /= len;
        moveY /= len;
        const speedMult = 1 + player.upgrades.speed * 0.15;
        player.x += moveX * player.speed * speedMult * dt / 1000;
        player.y += moveY * player.speed * speedMult * dt / 1000;
    }

    // Player aim
    const centerX = canvas.width / 2 / camera.zoom;
    const centerY = canvas.height / 2 / camera.zoom;
    player.angle = Math.atan2(mouse.y / camera.zoom - centerY + camera.y, mouse.x / camera.zoom - centerX + camera.x);

    // World mouse position
    mouse.worldX = mouse.x / camera.zoom - canvas.width / 2 / camera.zoom + player.x - camera.x;
    mouse.worldY = mouse.y / camera.zoom - canvas.height / 2 / camera.zoom + player.y - camera.y;

    // Auto fire
    if (player.autoFire && player.fireTimer <= 0 && !weaponBase.reloading && weaponBase.ammo > 0) {
        fireWeapon();
    }

    // Manual reload (R key)
    if (keys['KeyR'] && !weaponBase.reloading && weaponBase.ammo < weapon.maxAmmo) {
        weaponBase.reloading = true;
        weaponBase.reloadTimer = weapon.reloadTime;
    }

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += Math.cos(b.angle) * b.speed * dt / 1000;
        b.y += Math.sin(b.angle) * b.speed * dt / 1000;
        b.life -= dt;
        b.distance += b.speed * dt / 1000;

        if (b.life <= 0 || b.distance > b.range || b.pierce < 0) {
            bullets.splice(i, 1);
            continue;
        }

        // Bullet-zombie collision
        for (let j = zombies.length - 1; j >= 0; j--) {
            const z = zombies[j];
            const dx = b.x - z.x;
            const dy = b.y - z.y;
            const dist = Math.hypot(dx, dy);
            if (dist < z.width / 2 + 4) {
                z.health -= b.damage;
                z.hitFlash = 0.1;

                // Knockback
                const kb = b.knockback / z.knockbackResist;
                z.x += Math.cos(b.angle) * kb * dt / 1000;
                z.y += Math.sin(b.angle) * kb * dt / 1000;

                // Hit particles
                for (let k = 0; k < 5; k++) {
                    particles.push({
                        x: b.x, y: b.y,
                        vx: (Math.random() - 0.5) * 200,
                        vy: (Math.random() - 0.5) * 200,
                        life: 0.3, maxLife: 0.3,
                        color: z.color, size: Math.random() * 3 + 2
                    });
                }

                b.pierce--;
                if (b.pierce < 0) {
                    bullets.splice(i, 1);
                }
                break;
            }
        }
    }

    // Update zombies
    for (let i = zombies.length - 1; i >= 0; i--) {
        const z = zombies[i];

        if (z.hitFlash > 0) z.hitFlash -= dt;

        // AI
        const dx = player.x - z.x;
        const dy = player.y - z.y;
        const dist = Math.hypot(dx, dy);

        if (z.ranged && dist < z.attackRange) {
            // Ranged attack
            z.attackTimer -= dt;
            if (z.attackTimer <= 0) {
                z.attackTimer = z.attackCooldown;
                const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.2;
                bullets.push({
                    x: z.x, y: z.y,
                    angle,
                    speed: z.projectileSpeed,
                    damage: z.projectileDamage,
                    range: z.attackRange,
                    pierce: 0,
                    knockback: 0,
                    life: z.attackRange / z.projectileSpeed * 1000,
                    distance: 0,
                    color: '#ff3333',
                    enemy: true
                });
            }
        } else {
            // Move toward player
            if (dist > 0) {
                z.x += (dx / dist) * z.speed * dt / 1000;
                z.y += (dy / dist) * z.speed * dt / 1000;
            }
        }

        // Zombie-zombie separation
        for (let j = i - 1; j >= 0; j--) {
            const z2 = zombies[j];
            const dx2 = z.x - z2.x;
            const dy2 = z.y - z2.y;
            const dist2 = Math.hypot(dx2, dy2);
            const minDist = (z.width + z2.width) / 2;
            if (dist2 < minDist && dist2 > 0) {
                const push = (minDist - dist2) * 0.5;
                z.x += (dx2 / dist2) * push;
                z.y += (dy2 / dist2) * push;
                z2.x -= (dx2 / dist2) * push;
                z2.y -= (dy2 / dist2) * push;
            }
        }

        // Player collision
        const playerDist = Math.hypot(player.x - z.x, player.y - z.y);
        if (playerDist < (player.width + z.width) / 2 * 0.8) {
            if (player.invulnerable <= 0) {
                player.health -= z.damage * dt / 1000;
                player.invulnerable = player.invulnTime;
                game.screenShake = 0.3;
                game.screenShakeIntensity = 10;

                // Knockback player
                const angle = Math.atan2(player.y - z.y, player.x - z.x);
                player.x += Math.cos(angle) * 200 * dt / 1000;
                player.y += Math.sin(angle) * 200 * dt / 1000;

                if (player.health <= 0) {
                    gameOver();
                }
                updateUI();
            }
        }

        // Death
        if (z.health <= 0) {
            onZombieKilled(z, i);
        }
    }

    // Enemy bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        if (!b.enemy) continue;

        const dx = player.x - b.x;
        const dy = player.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < player.width / 2) {
            if (player.invulnerable <= 0) {
                player.health -= b.damage;
                player.invulnerable = player.invulnTime;
                game.screenShake = 0.2;
                game.screenShakeIntensity = 8;
                if (player.health <= 0) gameOver();
                updateUI();
            }
            bullets.splice(i, 1);
        }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt / 1000;
        p.y += p.vy * dt / 1000;
        p.life -= dt;
        p.vx *= 0.98;
        p.vy *= 0.98;
        if (p.life <= 0) particles.splice(i, 1);
    }

    // Update money popups
    for (let i = moneyPopups.length - 1; i >= 0; i--) {
        const p = moneyPopups[i];
        p.life -= dt;
        if (p.life <= 0) moneyPopups.splice(i, 1);
    }

    // Wave spawning
    if (game.waveInProgress) {
        game.spawnTimer += dt;
        if (game.spawnTimer >= game.spawnInterval && game.zombiesToSpawn > 0) {
            spawnZombie();
            game.spawnTimer = 0;
        }

        if (game.zombiesToSpawn <= 0 && zombies.length === 0) {
            game.waveInProgress = false;
            game.wave++;
            setTimeout(startWave, 1000);
        }
    }
}

function fireWeapon() {
    const weapon = getWeaponStats(player.weapon);
    const weaponBase = player.weapons[player.weapon];

    for (let i = 0; i < weapon.bulletsPerShot; i++) {
        const spread = (Math.random() - 0.5) * 2 * weapon.spread;
        bullets.push({
            x: player.x + Math.cos(player.angle) * 20,
            y: player.y + Math.sin(player.angle) * 20,
            angle: player.angle + spread,
            speed: weapon.bulletSpeed,
            damage: weapon.damage,
            range: weapon.range,
            pierce: weapon.pierce,
            knockback: weapon.knockback,
            life: weapon.range / weapon.bulletSpeed * 1000,
            distance: 0,
            color: weapon.color,
            enemy: false
        });
    }

    // Muzzle flash particles
    for (let i = 0; i < 3; i++) {
        particles.push({
            x: player.x + Math.cos(player.angle) * 20,
            y: player.y + Math.sin(player.angle) * 20,
            vx: Math.cos(player.angle) * weapon.bulletSpeed * 0.3 + (Math.random() - 0.5) * 100,
            vy: Math.sin(player.angle) * weapon.bulletSpeed * 0.3 + (Math.random() - 0.5) * 100,
            life: 0.1, maxLife: 0.1,
            color: weapon.color, size: Math.random() * 6 + 4
        });
    }

    // Recoil
    player.x -= Math.cos(player.angle) * weapon.knockback * 0.01;
    player.y -= Math.sin(player.angle) * weapon.knockback * 0.01;

    weaponBase.ammo--;
    player.fireTimer = weapon.fireRate;
    updateUI();

    if (weaponBase.ammo <= 0) {
        weaponBase.reloading = true;
        weaponBase.reloadTimer = weapon.reloadTime;
    }
}

function onZombieKilled(z, index) {
    // Money calculation with streak
    let moneyEarned = z.score;
    const streakMult = 1 + Math.min(player.killStreak, 20) * 0.1;
    const upgradeMult = 1 + player.upgrades.xpGain * 0.2;
    moneyEarned = Math.floor(moneyEarned * streakMult * upgradeMult);

    player.money += moneyEarned;
    player.kills++;
    player.killStreak++;
    player.maxStreak = Math.max(player.maxStreak, player.killStreak);
    player.lastKillTime = game.time;

    // Lifesteal
    if (player.upgrades.lifesteal > 0) {
        const heal = z.maxHealth * 0.05 * player.upgrades.lifesteal;
        player.health = Math.min(player.maxHealth, player.health + heal);
    }

    // Money popup
    const screenX = canvas.width / 2 + (z.x - player.x) * camera.zoom;
    const screenY = canvas.height / 2 + (z.y - player.y) * camera.zoom;
    moneyPopups.push({
        x: screenX, y: screenY,
        text: `+$${moneyEarned}`,
        life: 1,
        streak: player.killStreak > 3
    });

    // Kill feed
    addKillFeed(z.type, moneyEarned, player.killStreak);

    // Death particles
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 200 + 100;
        particles.push({
            x: z.x, y: z.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.8, maxLife: 0.8,
            color: z.color, size: Math.random() * 4 + 2
        });
    }

    // Exploder explosion
    if (z.explosive) {
        game.screenShake = 0.5;
        game.screenShakeIntensity = 20;
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 300 + 200;
            particles.push({
                x: z.x, y: z.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1, maxLife: 1,
                color: ['#ff6b35', '#ffd700', '#ff3333'][Math.floor(Math.random() * 3)],
                size: Math.random() * 6 + 4
            });
        }
        // Damage nearby zombies
        zombies.forEach(z2 => {
            const dx = z2.x - z.x;
            const dy = z2.y - z.y;
            const dist = Math.hypot(dx, dy);
            if (dist < z.explosionRadius) {
                z2.health -= z.explosionDamage * (1 - dist / z.explosionRadius);
                z2.hitFlash = 0.2;
            }
        });
        // Damage player
        const pdx = player.x - z.x;
        const pdy = player.y - z.y;
        const pdist = Math.hypot(pdx, pdy);
        if (pdist < z.explosionRadius) {
            if (player.invulnerable <= 0) {
                player.health -= z.explosionDamage * (1 - pdist / z.explosionRadius);
                player.invulnerable = player.invulnTime;
                if (player.health <= 0) gameOver();
                updateUI();
            }
        }
    }

    // Screen shake on kill
    game.screenShake = 0.15;
    game.screenShakeIntensity = 5 + Math.min(player.killStreak, 10);

    zombies.splice(index, 1);
    updateUI();
}

function addKillFeed(zombieType, money, streak) {
    const feed = document.getElementById('kill-feed');
    const entry = document.createElement('div');
    entry.className = `kill-entry${streak > 3 ? ' streak' : ''}`;
    const streakText = streak > 3 ? ` <span style="color:#ffd700">STREAK x${streak}!</span>` : '';
    entry.innerHTML = `<span style="color:#e74c3c">${zombieType.toUpperCase()}</span> +$${money}${streakText}`;
    feed.appendChild(entry);
    if (feed.children.length > 8) feed.removeChild(feed.children[0]);
}

function gameOver() {
    game.running = false;
    game.gameOver = true;

    document.getElementById('final-score').textContent = player.money;
    document.getElementById('final-wave').textContent = game.wave - 1;
    document.getElementById('final-kills').textContent = player.kills;
    document.getElementById('game-over').classList.remove('hidden');
}

function buyItem(itemId) {
    const item = shopItems.find(i => i.id === itemId);
    if (!item || player.money < item.price) return;

    if (item.weapon) {
        if (item.owned) {
            // Switch weapon
            player.weapon = item.weapon;
            updateUI();
        } else if (player.money >= item.price) {
            player.money -= item.price;
            item.owned = true;
            player.weapon = item.weapon;
            player.weapons[item.weapon].ammo = getMaxAmmo(item.weapon);
            updateShopUI();
            updateUI();
        }
    } else if (item.upgrade) {
        const currentLevel = item.level || 0;
        if (currentLevel < item.maxLevel && player.money >= item.price) {
            player.money -= item.price;
            player.upgrades[item.upgrade]++;
            item.level = currentLevel + 1;
            const priceIncrease = Math.floor(item.price * 1.5);
            item.price = priceIncrease;
            updateShopUI();
            updateUI();
        }
    }
}

function updateShopUI() {
    document.querySelectorAll('.shop-item').forEach(el => {
        const item = shopItems.find(i => i.id === el.dataset.id);
        if (!item) return;

        el.classList.toggle('owned', item.owned);
        const priceEl = el.querySelector('.shop-item-price');
        if (priceEl) {
            if (item.maxLevel) {
                const levelEl = el.querySelector('[data-level]');
                if (levelEl) levelEl.textContent = item.level || 0;
                if (item.level >= item.maxLevel) {
                    priceEl.textContent = 'MAX';
                } else {
                    priceEl.textContent = `$${item.price}`;
                }
            } else {
                priceEl.textContent = item.owned ? 'OWNED' : `$${item.price}`;
            }
        }
    });
}

function updateUI() {
    document.getElementById('money').textContent = `$${player.money}`;
    document.getElementById('kills').textContent = player.kills;
    document.getElementById('streak').textContent = `x${Math.max(1, player.killStreak)}`;
    document.getElementById('wave').textContent = game.wave;

    const healthPct = player.health / player.maxHealth;
    document.getElementById('health-bar').style.width = `${healthPct * 100}%`;
    document.getElementById('health-bar').style.background = healthPct > 0.5
        ? `linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)`
        : healthPct > 0.25
        ? `linear-gradient(90deg, #f39c12 0%, #e67e22 100%)`
        : `linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)`;

    const weapon = getWeaponStats(player.weapon);
    const weaponBase = player.weapons[player.weapon];
    document.getElementById('current-ammo').textContent = weaponBase.reloading ? 'RELOAD' : weaponBase.ammo;
    document.getElementById('max-ammo').textContent = weapon.maxAmmo;
    document.getElementById('weapon-name').textContent = weapon.name;
}

function render() {
    // Clear
    ctx.fillStyle = '#0d0d14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid background
    drawGrid();

    // Save context for camera
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-player.x + camera.x, -player.y + camera.y);

    // Draw zombies
    zombies.forEach(z => drawZombie(z));

    // Draw bullets
    bullets.forEach(b => drawBullet(b));

    // Draw player
    drawPlayer();

    // Draw particles
    particles.forEach(p => drawParticle(p));

    ctx.restore();

    // Draw money popups (screen space)
    moneyPopups.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.font = `bold ${p.streak ? 24 : 18}px 'Courier New'`;
        ctx.fillStyle = p.streak ? '#ff6b6b' : '#ffd700';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillText(p.text, p.x, p.y);
        ctx.restore();
    });

    // Player invulnerability flash
    if (player.invulnerable > 0 && Math.floor(player.invulnerable * 20) % 2 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function drawGrid() {
    const gridSize = 100;
    const zoom = camera.zoom;
    const offsetX = (player.x * zoom) % gridSize;
    const offsetY = (player.y * zoom) % gridSize;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1 / zoom;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-player.x, -player.y);

    const startX = Math.floor(player.x / gridSize) * gridSize - gridSize * 2;
    const endX = startX + gridSize * 5;
    const startY = Math.floor(player.y / gridSize) * gridSize - gridSize * 2;
    const endY = startY + gridSize * 5;

    for (let x = startX; x <= endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
    }
    for (let y = startY; y <= endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
    }
    ctx.restore();
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    // Body
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 16);
    gradient.addColorStop(0, '#4ecdc4');
    gradient.addColorStop(1, '#2a9d8f');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body outline
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Gun
    const weapon = getWeaponStats(player.weapon);
    ctx.fillStyle = weapon.color;
    ctx.fillRect(12, -4, 20, 8);
    ctx.fillStyle = '#fff';
    ctx.fillRect(28, -2, 4, 4);

    // Gun barrel flash when firing
    if (player.fireTimer > weapon.fireRate - 50) {
        ctx.fillStyle = weapon.color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(32, 0);
        ctx.lineTo(32 + Math.random() * 15 + 10, (Math.random() - 0.5) * 8);
        ctx.lineTo(32 + Math.random() * 15 + 10, (Math.random() - 0.5) * 8);
        ctx.closePath();
        ctx.fill();
    }

    // Health indicator on player
    if (player.health < player.maxHealth) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(-20, -25, 40, 5);
        ctx.fillStyle = player.health / player.maxHealth > 0.25 ? '#27ae60' : '#e74c3c';
        ctx.fillRect(-20, -25, 40 * (player.health / player.maxHealth), 5);
    }

    ctx.restore();
}

function drawZombie(z) {
    ctx.save();
    ctx.translate(z.x, z.y);

    // Hit flash
    if (z.hitFlash > 0) {
        ctx.globalAlpha = 0.5 + z.hitFlash * 5;
        ctx.fillStyle = '#fff';
    } else {
        ctx.globalAlpha = 1;
        ctx.fillStyle = z.color;
    }

    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, z.width / 2, z.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (glowing)
    ctx.fillStyle = z.boss ? '#ff0000' : '#ff3333';
    const eyeOffset = z.width / 4;
    ctx.beginPath();
    ctx.arc(-eyeOffset, -4, 3, 0, Math.PI * 2);
    ctx.arc(eyeOffset, -4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Boss crown
    if (z.boss) {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(-20, -25);
        ctx.lineTo(-10, -40);
        ctx.lineTo(0, -25);
        ctx.lineTo(10, -40);
        ctx.lineTo(20, -25);
        ctx.closePath();
        ctx.fill();
    }

    // Health bar
    if (z.health < z.maxHealth) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(-z.width / 2, -z.height / 2 - 10, z.width, 4);
        ctx.fillStyle = z.health / z.maxHealth > 0.25 ? '#27ae60' : '#e74c3c';
        ctx.fillRect(-z.width / 2, -z.height / 2 - 10, z.width * (z.health / z.maxHealth), 4);
    }

    ctx.restore();
}

function drawBullet(b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle);
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-10, -3);
    ctx.lineTo(-10, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawParticle(p) {
    ctx.save();
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function gameLoop(timestamp) {
    const dt = timestamp - (gameLoop.lastTime || timestamp);
    gameLoop.lastTime = timestamp;

    update(dt);
    render();

    requestAnimationFrame(gameLoop);
}

// Start
init();