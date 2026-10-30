export class Shop {
  constructor(game) {
    this.game = game;
    this.isOpen = false;
    this.hoverTimer = 0;
    this.hoverDelay = 300; // ms to hover before opening
    this.activeTab = 'weapons';

    // Initialize tabs once
    this.initTabs();

    // Shop items
    this.weapons = [
      { id: 'pistol', name: 'Pistol', desc: 'Reliable starter weapon', cost: 0, baseDamage: 25, baseFireRate: 300, baseMagSize: 30, baseReloadTime: 1500, maxLevel: 5, icon: '🔫' },
      { id: 'smg', name: 'SMG', desc: 'High fire rate, low damage', cost: 500, baseDamage: 15, baseFireRate: 80, baseMagSize: 40, baseReloadTime: 2000, maxLevel: 5, icon: '🔫' },
      { id: 'shotgun', name: 'Shotgun', desc: 'Devastating close range', cost: 1500, baseDamage: 80, baseFireRate: 1000, baseMagSize: 8, baseReloadTime: 3000, basePierce: 2, baseSpread: 0.3, maxLevel: 5, icon: '🔫' },
      { id: 'rifle', name: 'Assault Rifle', desc: 'Balanced all-rounder', cost: 3000, baseDamage: 35, baseFireRate: 150, baseMagSize: 30, baseReloadTime: 2500, maxLevel: 5, icon: '🔫' },
      { id: 'sniper', name: 'Sniper Rifle', desc: 'One shot, one kill', cost: 5000, baseDamage: 200, baseFireRate: 2000, baseMagSize: 5, baseReloadTime: 3500, baseProjectileSpeed: 40, maxLevel: 5, icon: '🎯' },
      { id: 'minigun', name: 'Minigun', desc: 'Shred everything', cost: 10000, baseDamage: 40, baseFireRate: 40, baseMagSize: 200, baseReloadTime: 5000, maxLevel: 3, icon: '💥' },
      { id: 'plasma', name: 'Plasma Rifle', desc: 'Energy burns through', cost: 15000, baseDamage: 60, baseFireRate: 100, baseMagSize: 50, baseReloadTime: 2000, basePierce: 5, baseBurn: true, maxLevel: 3, icon: '⚡' },
      { id: 'railgun', name: 'Railgun', desc: 'Pierces infinite enemies', cost: 25000, baseDamage: 500, baseFireRate: 3000, baseMagSize: 3, baseReloadTime: 4000, basePierce: 999, baseProjectileSpeed: 60, maxLevel: 2, icon: '🚀' }
    ];

    this.upgrades = [
      { id: 'maxHealth', name: 'Max Health', desc: 'Increase maximum health', baseCost: 100, costMult: 1.5, maxLevel: 10, value: 20, icon: '❤️' },
      { id: 'speed', name: 'Movement Speed', desc: 'Move faster', baseCost: 150, costMult: 1.5, maxLevel: 10, value: 0.3, icon: '👟' },
      { id: 'damage', name: 'Damage', desc: 'Increase all damage', baseCost: 200, costMult: 1.6, maxLevel: 10, value: 5, icon: '💥' },
      { id: 'fireRate', name: 'Fire Rate', desc: 'Shoot faster', baseCost: 250, costMult: 1.6, maxLevel: 10, value: 20, icon: '⚡' },
      { id: 'reloadTime', name: 'Reload Speed', desc: 'Reload faster', baseCost: 200, costMult: 1.5, maxLevel: 10, value: 100, icon: '🔄' },
      { id: 'magSize', name: 'Magazine Size', desc: 'More ammo per mag', baseCost: 150, costMult: 1.5, maxLevel: 10, value: 5, icon: '📦' },
      { id: 'critChance', name: 'Crit Chance', desc: 'Chance for double damage', baseCost: 300, costMult: 1.7, maxLevel: 10, value: 0.03, icon: '💥' },
      { id: 'critDamage', name: 'Crit Damage', desc: 'Critical hit multiplier', baseCost: 400, costMult: 1.6, maxLevel: 10, value: 0.25, icon: '💥' },
      { id: 'knockback', name: 'Knockback', desc: 'Push enemies back', baseCost: 200, costMult: 1.5, maxLevel: 10, value: 2, icon: '💨' },
      { id: 'pierce', name: 'Piercing', desc: 'Bullets pass through', baseCost: 500, costMult: 1.8, maxLevel: 5, value: 1, icon: '🎯' },
      { id: 'spread', name: 'Accuracy', desc: 'Reduce bullet spread', baseCost: 300, costMult: 1.5, maxLevel: 10, value: 0.01, icon: '🎯' },
      { id: 'projectileSpeed', name: 'Bullet Speed', desc: 'Faster projectiles', baseCost: 200, costMult: 1.5, maxLevel: 10, value: 2, icon: '🚀' },
      { id: 'lifesteal', name: 'Lifesteal', desc: 'Heal on damage dealt', baseCost: 1000, costMult: 2.0, maxLevel: 5, value: 0.05, icon: '🩸' },
      { id: 'armor', name: 'Armor', desc: 'Reduce incoming damage', baseCost: 800, costMult: 1.8, maxLevel: 10, value: 2, icon: '🛡️' },
      { id: 'regen', name: 'Health Regen', desc: 'Passive health regeneration', baseCost: 1200, costMult: 1.8, maxLevel: 5, value: 1, icon: '💚' },
      { id: 'xpMultiplier', name: 'XP Boost', desc: 'Gain more experience', baseCost: 2000, costMult: 2.0, maxLevel: 5, value: 0.1, icon: '✨' },
      { id: 'moneyMultiplier', name: 'Money Boost', desc: 'Earn more money', baseCost: 2000, costMult: 2.0, maxLevel: 5, value: 0.1, icon: '💰' }
    ];

    this.consumables = [
      { id: 'healthPack', name: 'Health Pack', desc: 'Instantly restore 50 health', cost: 100, maxStock: 99, icon: '💊' },
      { id: 'ammoPack', name: 'Ammo Pack', desc: 'Refill current weapon', cost: 50, maxStock: 99, icon: '📦' },
      { id: 'speedBoost', name: 'Speed Boost', desc: '50% speed for 15 seconds', cost: 200, maxStock: 5, icon: '💨' },
      { id: 'damageBoost', name: 'Damage Boost', desc: '2x damage for 15 seconds', cost: 300, maxStock: 5, icon: '💥' },
      { id: 'fireRateBoost', name: 'Fire Rate Boost', desc: '2x fire rate for 15 seconds', cost: 300, maxStock: 5, icon: '⚡' },
      { id: 'shield', name: 'Energy Shield', desc: 'Absorb 50 damage', cost: 400, maxStock: 3, icon: '🛡️' },
      { id: 'nuke', name: 'Nuke', desc: 'Kill all zombies on screen', cost: 1000, maxStock: 1, icon: '☢️' },
      { id: 'xpBoost', name: 'XP Booster', desc: '2x XP for 30 seconds', cost: 500, maxStock: 3, icon: '✨' },
      { id: 'moneyBoost', name: 'Money Booster', desc: '2x Money for 30 seconds', cost: 500, maxStock: 3, icon: '💰' }
    ];

    // Track owned/upgraded items
    this.ownedWeapons = new Set(['pistol']);
    this.currentWeapon = 'pistol';
    this.upgradeLevels = {};
    this.consumableStock = {};

    // Initialize upgrade levels
    for (const u of this.upgrades) {
      this.upgradeLevels[u.id] = 0;
    }
    for (const c of this.consumables) {
      this.consumableStock[c.id] = 0;
    }
  }

  update(dt, mouseX, mouseY, canvasRect) {
    // Check if mouse is on left edge
    const isOnLeftEdge = mouseX < 50;

    if (isOnLeftEdge) {
      this.hoverTimer += dt;
      if (this.hoverTimer >= this.hoverDelay && !this.isOpen) {
        this.open();
      }
    } else {
      this.hoverTimer = 0;
      if (this.isOpen && mouseX > 320) {
        this.close();
      }
    }

    // Update UI
    this.updateUI();
  }

  initTabs() {
    const tabButtons = document.querySelectorAll('.shop-tab');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.switchTab(button.dataset.tab);
      });
    });
  }

  switchTab(tabName) {
    this.activeTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.shop-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update panels
    document.querySelectorAll('.shop-panel-content').forEach(panel => {
      panel.classList.toggle('active', panel.id === `${tabName}-items`);
    });
  }

  open() {
    this.isOpen = true;
    const panel = document.getElementById('shop-panel');
    if (panel) panel.classList.add('open');
    const tab = document.getElementById('shop-handle');
    if (tab) tab.classList.add('hidden');
  }

  close() {
    this.isOpen = false;
    const panel = document.getElementById('shop-panel');
    if (panel) panel.classList.remove('open');
    const tab = document.getElementById('shop-handle');
    if (tab) tab.classList.remove('hidden');
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  updateUI() {
    // Update money display
    document.getElementById('money-display').textContent = this.game.money;

    // Update streak display
    const streakEl = document.getElementById('streak-display');
    const streakMultEl = document.getElementById('streak-multiplier');
    if (this.game.killStreak > 1) {
      streakEl.style.display = 'inline';
      streakMultEl.textContent = this.game.killStreakMultiplier.toFixed(1);
    } else {
      streakEl.style.display = 'none';
    }

    // Render weapon items
    this.renderItems('weapon-items', this.weapons, (item) => this.buyWeapon(item));

    // Render upgrade items
    this.renderItems('upgrade-items', this.upgrades, (item) => this.buyUpgrade(item));

    // Render consumable items
    this.renderItems('consumable-items', this.consumables, (item) => this.buyConsumable(item));
  }

  renderItems(containerId, items, buyCallback) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    for (const item of items) {
      const level = this.upgradeLevels[item.id] || 0;
      const isWeapon = item.baseDamage !== undefined;
      const owned = isWeapon ? this.ownedWeapons.has(item.id) : level > 0;
      const current = isWeapon ? this.currentWeapon === item.id : false;
      const cost = this.getItemCost(item);
      const canAfford = this.game.money >= cost;
      const maxed = level >= item.maxLevel;
      const soldOut = item.maxStock !== undefined && this.consumableStock[item.id] >= item.maxStock;

      const div = document.createElement('div');
      div.className = 'shop-item' + (maxed || soldOut || !canAfford ? ' sold-out' : '');
      if (current) div.style.borderColor = '#00d4ff';

      let levelText = '';
      if (isWeapon) {
        if (owned) levelText = `<span class="item-level">OWNED</span>`;
      } else if (item.maxStock !== undefined) {
        levelText = `<span class="item-level">${this.consumableStock[item.id]}/${item.maxStock}</span>`;
      } else {
        levelText = `<span class="item-level">LVL ${level}/${item.maxLevel}</span>`;
      }

      div.innerHTML = `
        <div class="item-name">${item.icon} ${item.name} ${levelText}</div>
        <div class="item-desc">${item.desc}</div>
        <div class="item-cost">$${cost}${maxed ? ' (MAXED)' : soldOut ? ' (SOLD OUT)' : ''}</div>
      `;

      div.addEventListener('click', () => {
        if (!maxed && !soldOut && canAfford) {
          buyCallback(item);
          this.updateUI();
        }
      });

      container.appendChild(div);
    }
  }

  getItemCost(item) {
    if (item.baseDamage !== undefined) {
      // Weapon
      return this.ownedWeapons.has(item.id) ? 0 : item.cost;
    } else if (item.maxStock !== undefined) {
      // Consumable
      return item.cost;
    } else {
      // Upgrade
      const level = this.upgradeLevels[item.id] || 0;
      return Math.floor(item.baseCost * Math.pow(item.costMult, level));
    }
  }

  buyWeapon(weapon) {
    if (this.ownedWeapons.has(weapon.id)) {
      // Switch to this weapon
      this.equipWeapon(weapon);
      return;
    }

    const cost = weapon.cost;
    if (this.game.money < cost) return;

    this.game.money -= cost;
    this.ownedWeapons.add(weapon.id);
    this.equipWeapon(weapon);
    this.game.addPickupNotification(`Purchased ${weapon.name}!`);
  }

  equipWeapon(weapon) {
    this.currentWeapon = weapon.id;
    const player = this.game.player;

    // Apply weapon stats
    player.baseDamage = weapon.baseDamage;
    player.baseFireRate = weapon.baseFireRate;
    player.baseMagSize = weapon.baseMagSize;
    player.baseReloadTime = weapon.baseReloadTime;
    player.basePierce = weapon.basePierce || 0;
    player.baseSpread = weapon.baseSpread || 0.05;
    player.baseProjectileSpeed = weapon.baseProjectileSpeed || 20;

    // Special properties
    player.burnDamage = weapon.baseBurn ? 20 : 0;

    player.ammo = player.magSize;
    player.recalculateStats();

    this.game.addPickupNotification(`Equipped ${weapon.name}!`);
  }

  buyUpgrade(upgrade) {
    const level = this.upgradeLevels[upgrade.id] || 0;
    if (level >= upgrade.maxLevel) return;

    const cost = this.getItemCost(upgrade);
    if (this.game.money < cost) return;

    this.game.money -= cost;
    this.upgradeLevels[upgrade.id] = level + 1;

    // Apply upgrade
    this.game.player.applyUpgrade(upgrade.id, upgrade.value);
    this.game.addPickupNotification(`Upgraded ${upgrade.name} to level ${level + 1}!`);
  }

  buyConsumable(consumable) {
    if (this.consumableStock[consumable.id] >= consumable.maxStock) return;

    const cost = consumable.cost;
    if (this.game.money < cost) return;

    this.game.money -= cost;
    this.consumableStock[consumable.id]++;
    this.game.addPickupNotification(`Bought ${consumable.name}!`);
  }

  useConsumable(id) {
    if (this.consumableStock[id] <= 0) return false;

    const item = this.consumables.find(c => c.id === id);
    if (!item) return false;

    this.consumableStock[id]--;
    const player = this.game.player;

    switch (id) {
      case 'healthPack':
        player.heal(50);
        this.game.addPickupNotification('Health restored!');
        break;
      case 'ammoPack':
        player.ammo = player.magSize;
        this.game.addPickupNotification('Ammo refilled!');
        break;
      case 'speedBoost':
        player.activatePowerUp('speed', 15000);
        this.game.addPickupNotification('Speed Boost activated!');
        break;
      case 'damageBoost':
        player.activatePowerUp('damage', 15000);
        this.game.addPickupNotification('Damage Boost activated!');
        break;
      case 'fireRateBoost':
        player.activatePowerUp('fireRate', 15000);
        this.game.addPickupNotification('Fire Rate Boost activated!');
        break;
      case 'shield':
        player.activatePowerUp('shield', 15000);
        player.powerUps.shield.value = 50;
        this.game.addPickupNotification('Shield activated!');
        break;
      case 'nuke':
        this.nuke();
        this.game.addPickupNotification('NUKE LAUNCHED!');
        break;
      case 'xpBoost':
        this.game.xpMultiplierTimer = 30000;
        this.game.addPickupNotification('2x XP for 30s!');
        break;
      case 'moneyBoost':
        this.game.moneyMultiplierTimer = 30000;
        this.game.addPickupNotification('2x Money for 30s!');
        break;
    }

    this.updateUI();
    return true;
  }

  nuke() {
    for (const zombie of this.game.zombies) {
      if (!zombie.isDead) {
        zombie.die();
        this.game.addEffect(new NukeEffect(zombie.x, zombie.y));
      }
    }
    this.game.screenShake = 30;
  }

  getCurrentWeapon() {
    return this.weapons.find(w => w.id === this.currentWeapon);
  }

  getUpgradeLevel(id) {
    return this.upgradeLevels[id] || 0;
  }

  getWeaponStats() {
    const weapon = this.getCurrentWeapon();
    if (!weapon) return {};

    const player = this.game.player;
    return {
      damage: player.damage,
      fireRate: player.fireRate,
      magSize: player.magSize,
      reloadTime: player.reloadTime,
      pierce: player.pierce,
      spread: player.spread,
      projectileSpeed: player.projectileSpeed
    };
  }
}

class NukeEffect {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.life = 500;
    this.maxRadius = 150;
  }

  update(dt) {
    this.life -= dt;
  }

  render(ctx) {
    const progress = 1 - this.life / 500;
    const radius = this.maxRadius * progress;
    const alpha = 1 - progress;

    ctx.save();
    ctx.translate(this.x, this.y);

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, `rgba(255, 215, 0, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(255, 107, 53, ${alpha * 0.5})`);
    gradient.addColorStop(1, 'rgba(233, 69, 96, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}