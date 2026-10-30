export class ObjectPool {
    constructor(createFn, resetFn, initialSize = 50) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.available = [];
        this.inUse = new Set();
        this.expand(initialSize);
    }

    expand(count) {
        for (let i = 0; i < count; i++) {
            this.available.push(this.createFn());
        }
    }

    acquire() {
        let obj;
        if (this.available.length > 0) {
            obj = this.available.pop();
        } else {
            obj = this.createFn();
        }
        this.inUse.add(obj);
        return obj;
    }

    release(obj) {
        if (this.inUse.has(obj)) {
            this.inUse.delete(obj);
            this.resetFn(obj);
            this.available.push(obj);
        }
    }

    releaseAll() {
        for (const obj of this.inUse) {
            this.resetFn(obj);
            this.available.push(obj);
        }
        this.inUse.clear();
    }

    getInUse() {
        return Array.from(this.inUse);
    }

    getAvailableCount() {
        return this.available.length;
    }

    getInUseCount() {
        return this.inUse.size;
    }

    forEachInUse(fn) {
        for (const obj of this.inUse) {
            fn(obj);
        }
    }
}

export class ParticlePool extends ObjectPool {
    constructor(initialSize = 500) {
        super(
            () => ({
                x: 0, y: 0,
                vx: 0, vy: 0,
                color: '#fff',
                size: 1,
                life: 1,
                maxLife: 1,
                gravity: 0,
                fade: true,
                type: 'default'
            }),
            (p) => {
                p.x = p.y = p.vx = p.vy = 0;
                p.color = '#fff';
                p.size = 1;
                p.life = p.maxLife = 1;
                p.gravity = 0;
                p.fade = true;
                p.type = 'default';
            },
            initialSize
        );
    }

    spawn(x, y, options = {}) {
        const p = this.acquire();
        p.x = x;
        p.y = y;
        p.vx = options.vx || 0;
        p.vy = options.vy || 0;
        p.color = options.color || '#fff';
        p.size = options.size || 1;
        p.life = p.maxLife = options.life || 1;
        p.gravity = options.gravity || 0;
        p.fade = options.fade !== false;
        p.type = options.type || 'default';
        p.rotation = options.rotation || 0;
        p.vRotation = options.vRotation || 0;
        return p;
    }
}

export class ProjectilePool extends ObjectPool {
    constructor(initialSize = 100) {
        super(
            () => ({
                x: 0, y: 0,
                vx: 0, vy: 0,
                damage: 10,
                penetration: 0,
                maxPenetration: 0,
                life: 1,
                maxLife: 1,
                radius: 3,
                color: '#fff',
                trailColor: '#fff',
                source: null,
                hitEntities: new Set()
            }),
            (p) => {
                p.x = p.y = p.vx = p.vy = 0;
                p.damage = 10;
                p.penetration = 0;
                p.maxPenetration = 0;
                p.life = p.maxLife = 1;
                p.radius = 3;
                p.color = '#fff';
                p.trailColor = '#fff';
                p.source = null;
                p.hitEntities.clear();
            },
            initialSize
        );
    }

    spawn(x, y, angle, options = {}) {
        const p = this.acquire();
        const speed = options.speed || 800;
        p.x = x;
        p.y = y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.damage = options.damage || 10;
        p.penetration = options.penetration || 0;
        p.maxPenetration = options.penetration || 0;
        p.life = p.maxLife = options.life || 1;
        p.radius = options.radius || 3;
        p.color = options.color || '#fff';
        p.trailColor = options.trailColor || options.color || '#fff';
        p.source = options.source || null;
        p.hitEntities.clear();
        return p;
    }
}

export class ZombiePool extends ObjectPool {
    constructor(initialSize = 100) {
        super(
            () => ({
                x: 0, y: 0,
                vx: 0, vy: 0,
                type: 'walker',
                health: 10,
                maxHealth: 10,
                speed: 50,
                radius: 16,
                damage: 10,
                attackCooldown: 1,
                attackTimer: 0,
                color: '#888',
                variant: 0,
                state: 'idle',
                targetX: 0,
                targetY: 0,
                knockbackResistance: 0,
                armor: 0,
                scoreValue: 10,
                moneyValue: 10
            }),
            (z) => {
                z.x = z.y = z.vx = z.vy = 0;
                z.type = 'walker';
                z.health = z.maxHealth = 10;
                z.speed = 50;
                z.radius = 16;
                z.damage = 10;
                z.attackCooldown = 1;
                z.attackTimer = 0;
                z.color = '#888';
                z.variant = 0;
                z.state = 'idle';
                z.targetX = z.targetY = 0;
                z.knockbackResistance = 0;
                z.armor = 0;
                z.scoreValue = 10;
                z.moneyValue = 10;
            },
            initialSize
        );
    }
}

export class FloatingTextPool extends ObjectPool {
    constructor(initialSize = 50) {
        super(
            () => ({
                x: 0, y: 0,
                text: '',
                color: '#fff',
                size: 16,
                life: 1,
                maxLife: 1,
                vy: -30,
                type: 'damage'
            }),
            (t) => {
                t.x = t.y = 0;
                t.text = '';
                t.color = '#fff';
                t.size = 16;
                t.life = t.maxLife = 1;
                t.vy = -30;
                t.type = 'damage';
            },
            initialSize
        );
    }

    spawn(x, y, text, options = {}) {
        const t = this.acquire();
        t.x = x;
        t.y = y;
        t.text = text;
        t.color = options.color || '#fff';
        t.size = options.size || 16;
        t.life = t.maxLife = options.life || 1;
        t.vy = options.vy || -30;
        t.type = options.type || 'damage';
        return t;
    }
}