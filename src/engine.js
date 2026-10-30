import { Vec2 } from './utils/math.js';
import { ParticlePool, ProjectilePool, ZombiePool, FloatingTextPool } from './utils/pool.js';

export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = new Set();
        this.mouse = { x: 0, y: 0, worldX: 0, worldY: 0, down: false, justPressed: false, justReleased: false };
        this.wheel = 0;
        this.touch = null;

        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
            if (e.code === 'Space') e.preventDefault();
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.mouse.down = true;
                this.mouse.justPressed = true;
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.mouse.down = false;
                this.mouse.justReleased = true;
            }
        });

        this.canvas.addEventListener('wheel', (e) => {
            this.wheel = e.deltaY > 0 ? 1 : -1;
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    update(camera) {
        this.mouse.worldX = this.mouse.x + camera.x;
        this.mouse.worldY = this.mouse.y + camera.y;
        this.mouse.justPressed = false;
        this.mouse.justReleased = false;
        this.wheel = 0;
    }

    isKeyDown(code) {
        return this.keys.has(code);
    }

    isKeyJustPressed(code) {
        return false;
    }

    getMovementVector() {
        let x = 0, y = 0;
        if (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')) y -= 1;
        if (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')) y += 1;
        if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) x -= 1;
        if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) x += 1;
        const len = Math.sqrt(x * x + y * y);
        if (len > 0) { x /= len; y /= len; }
        return { x, y };
    }

    getMouseWorldPos() {
        return { x: this.mouse.worldX, y: this.mouse.worldY };
    }

    getMouseScreenPos() {
        return { x: this.mouse.x, y: this.mouse.y };
    }

    isMouseDown() {
        return this.mouse.down;
    }

    isMouseJustPressed() {
        return this.mouse.justPressed;
    }

    getWheelDelta() {
        return this.wheel;
    }
}

export class Camera {
    constructor(canvasWidth, canvasHeight) {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.lerpFactor = 0.1;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeTime = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        this.zoom = 1;
        this.targetZoom = 1;
        this.bounds = null;
    }

    setTarget(x, y) {
        this.targetX = x - this.canvasWidth / (2 * this.zoom);
        this.targetY = y - this.canvasHeight / (2 * this.zoom);

        if (this.bounds) {
            this.targetX = Math.max(this.bounds.x, Math.min(this.targetX, this.bounds.x + this.bounds.w - this.canvasWidth / this.zoom));
            this.targetY = Math.max(this.bounds.y, Math.min(this.targetY, this.bounds.y + this.bounds.h - this.canvasHeight / this.zoom));
        }
    }

    update(dt) {
        this.x = Vec2.lerp({ x: this.x, y: this.y }, { x: this.targetX, y: this.targetY }, this.lerpFactor * 60 * dt).x;
        this.y = Vec2.lerp({ x: this.x, y: this.y }, { x: this.targetX, y: this.targetY }, this.lerpFactor * 60 * dt).y;

        this.zoom = lerp(this.zoom, this.targetZoom, 5 * dt);

        if (this.shakeTime > 0) {
            this.shakeTime -= dt;
            const progress = 1 - this.shakeTime / this.shakeDuration;
            const currentIntensity = this.shakeIntensity * (1 - progress);
            this.shakeOffsetX = (Math.random() - 0.5) * 2 * currentIntensity;
            this.shakeOffsetY = (Math.random() - 0.5) * 2 * currentIntensity;
        } else {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
        }
    }

    shake(intensity, duration = 0.3) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
        this.shakeDuration = Math.max(this.shakeDuration, duration);
        this.shakeTime = Math.max(this.shakeTime, duration);
    }

    getRenderOffset() {
        return {
            x: -this.x + this.shakeOffsetX,
            y: -this.y + this.shakeOffsetY
        };
    }

    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.shakeOffsetX) / this.zoom + this.x,
            y: (screenY - this.shakeOffsetY) / this.zoom + this.y
        };
    }

    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.x) * this.zoom - this.shakeOffsetX,
            y: (worldY - this.y) * this.zoom - this.shakeOffsetY
        };
    }

    setBounds(x, y, w, h) {
        this.bounds = { x, y, w, h };
    }

    isVisible(entity, margin = 50) {
        const screenPos = this.worldToScreen(entity.x, entity.y);
        return screenPos.x > -margin - entity.radius &&
               screenPos.x < this.canvasWidth + margin + entity.radius &&
               screenPos.y > -margin - entity.radius &&
               screenPos.y < this.canvasHeight + margin + entity.radius;
    }
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

export class EntityManager {
    constructor() {
        this.entities = [];
        this.toAdd = [];
        this.toRemove = new Set();
        this.player = null;
        this.zombies = [];
        this.projectiles = [];
        this.particles = null;
        this.floatingTexts = null;
    }

    setPools(particles, floatingTexts) {
        this.particles = particles;
        this.floatingTexts = floatingTexts;
    }

    add(entity) {
        this.toAdd.push(entity);
    }

    remove(entity) {
        this.toRemove.add(entity);
    }

    update(dt) {
        for (const entity of this.toAdd) {
            this.entities.push(entity);
            if (entity.isZombie) this.zombies.push(entity);
            else if (entity.isProjectile) this.projectiles.push(entity);
        }
        this.toAdd.length = 0;

        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            if (this.toRemove.has(entity) || entity.shouldRemove) {
                this.entities.splice(i, 1);
                const zIndex = this.zombies.indexOf(entity);
                if (zIndex !== -1) this.zombies.splice(zIndex, 1);
                const pIndex = this.projectiles.indexOf(entity);
                if (pIndex !== -1) this.projectiles.splice(pIndex, 1);
                this.toRemove.delete(entity);
            } else if (entity.active !== false) {
                entity.update(dt);
            }
        }
    }

    render(ctx, camera) {
        for (const entity of this.entities) {
            if (entity.active !== false && entity.render) {
                entity.render(ctx, camera);
            }
        }
    }

    getZombies() {
        return this.zombies;
    }

    getProjectiles() {
        return this.projectiles;
    }

    getNearbyEntities(x, y, radius, filterFn = null) {
        const results = [];
        const radiusSq = radius * radius;
        for (const entity of this.entities) {
            if (entity.active === false) continue;
            if (filterFn && !filterFn(entity)) continue;
            const dx = entity.x - x;
            const dy = entity.y - y;
            if (dx * dx + dy * dy <= radiusSq) {
                results.push(entity);
            }
        }
        return results;
    }

    clear() {
        this.entities.length = 0;
        this.zombies.length = 0;
        this.projectiles.length = 0;
        this.toAdd.length = 0;
        this.toRemove.clear();
        this.player = null;
    }
}

export class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.input = new InputManager(canvas);
        this.camera = new Camera(canvas.width, canvas.height);
        this.entities = new EntityManager();

        this.particlePool = new ParticlePool(1000);
        this.projectilePool = new ProjectilePool(200);
        this.zombiePool = new ZombiePool(200);
        this.floatingTextPool = new FloatingTextPool(100);

        this.entities.setPools(this.particlePool, this.floatingTextPool);

        this.running = false;
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedTimeStep = 1 / 60;
        this.maxSubSteps = 5;
        this.timeScale = 1;

        this.screenShakeClass = false;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.scale(dpr, dpr);
        this.camera.canvasWidth = rect.width;
        this.camera.canvasHeight = rect.height;
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    stop() {
        this.running = false;
    }

    gameLoop(time) {
        if (!this.running) return;

        const dt = Math.min((time - this.lastTime) / 1000, 0.1) * this.timeScale;
        this.lastTime = time;

        this.accumulator += dt;

        let subSteps = 0;
        while (this.accumulator >= this.fixedTimeStep && subSteps < this.maxSubSteps) {
            this.fixedUpdate(this.fixedTimeStep);
            this.accumulator -= this.fixedTimeStep;
            subSteps++;
        }

        const alpha = this.accumulator / this.fixedTimeStep;
        this.update(dt);
        this.render(alpha);

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    fixedUpdate(dt) {
        this.input.update(this.camera);
        this.entities.update(dt);
        this.particlePool.forEachInUse((p) => this.updateParticle(p, dt));
        this.floatingTextPool.forEachInUse((t) => this.updateFloatingText(t, dt));
        this.camera.update(dt);
    }

    update(dt) {
    }

    updateParticle(p, dt) {
        p.life -= dt;
        if (p.life <= 0) {
            this.particlePool.release(p);
            return;
        }
        p.vy += p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.vRotation * dt;
    }

    updateFloatingText(t, dt) {
        t.life -= dt;
        if (t.life <= 0) {
            this.floatingTextPool.release(t);
            return;
        }
        t.y += t.vy * dt;
    }

    render(alpha) {
        const ctx = this.ctx;
        const { width, height } = this.canvas;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const offset = this.camera.getRenderOffset();
        ctx.save();
        ctx.translate(offset.x, offset.y);

        this.renderBackground(ctx);
        this.entities.render(ctx, this.camera);
        this.renderParticles(ctx);
        this.renderFloatingTexts(ctx);

        ctx.restore();

        if (this.screenShakeClass) {
            this.canvas.classList.add('screen-shake');
            this.screenShakeClass = false;
            setTimeout(() => this.canvas.classList.remove('screen-shake'), 400);
        }
    }

    renderBackground(ctx) {
        const { x, y } = this.camera;
        const { canvasWidth, canvasHeight } = this.camera;
        const zoom = this.camera.zoom;

        const gridSize = 50;
        const startX = Math.floor(x / gridSize) * gridSize;
        const startY = Math.floor(y / gridSize) * gridSize;
        const endX = startX + canvasWidth / zoom + gridSize;
        const endY = startY + canvasHeight / zoom + gridSize;

        ctx.strokeStyle = 'rgba(0, 255, 136, 0.03)';
        ctx.lineWidth = 1;

        for (let gx = startX; gx <= endX; gx += gridSize) {
            ctx.beginPath();
            ctx.moveTo(gx, startY);
            ctx.lineTo(gx, endY);
            ctx.stroke();
        }
        for (let gy = startY; gy <= endY; gy += gridSize) {
            ctx.beginPath();
            ctx.moveTo(startX, gy);
            ctx.lineTo(endX, gy);
            ctx.stroke();
        }

        const centerX = canvasWidth / (2 * zoom) + x;
        const centerY = canvasHeight / (2 * zoom) + y;
        const maxRadius = Math.max(canvasWidth, canvasHeight) / zoom;

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
        gradient.addColorStop(0, 'rgba(10, 10, 15, 0)');
        gradient.addColorStop(0.7, 'rgba(10, 10, 15, 0.3)');
        gradient.addColorStop(1, 'rgba(5, 5, 8, 0.8)');
        ctx.fillStyle = gradient;
        ctx.fillRect(startX, startY, endX - startX, endY - startY);
    }

    renderParticles(ctx) {
        for (const p of this.particlePool.getInUse()) {
            const lifeRatio = p.life / p.maxLife;
            const alpha = p.fade ? lifeRatio : 1;
            const size = p.size * lifeRatio;

            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;

            if (p.type === 'blood') {
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, size, size * 0.6, p.rotation, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'muzzle') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'spark') {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillRect(-size, -size * 0.2, size * 2, size * 0.4);
                ctx.restore();
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }

    renderFloatingTexts(ctx) {
        for (const t of this.floatingTextPool.getInUse()) {
            const lifeRatio = t.life / t.maxLife;
            const alpha = lifeRatio;
            const scale = 1 + (1 - lifeRatio) * 0.5;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = `bold ${t.size * scale}px Arial`;
            ctx.fillStyle = t.color;
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.lineWidth = 3;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (t.type === 'crit') {
                ctx.shadowColor = t.color;
                ctx.shadowBlur = 10;
            }

            ctx.strokeText(t.text, t.x, t.y);
            ctx.fillText(t.text, t.x, t.y);
            ctx.restore();
        }
    }

    triggerScreenShake() {
        this.screenShakeClass = true;
    }

    spawnParticles(x, y, count, options) {
        for (let i = 0; i < count; i++) {
            const angle = options.angle !== undefined ? options.angle + (Math.random() - 0.5) * (options.spread || Math.PI * 2) : Math.random() * Math.PI * 2;
            const speed = options.speed || randomRange(50, 150);
            this.particlePool.spawn(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: options.color || '#fff',
                size: options.size || randomRange(2, 6),
                life: options.life || randomRange(0.3, 1),
                gravity: options.gravity || 0,
                fade: options.fade !== false,
                type: options.type || 'default',
                rotation: Math.random() * Math.PI * 2,
                vRotation: (Math.random() - 0.5) * 10
            });
        }
    }

    spawnFloatingText(x, y, text, options = {}) {
        this.floatingTextPool.spawn(x, y, text, options);
    }

    getProjectilePool() {
        return this.projectilePool;
    }

    getZombiePool() {
        return this.zombiePool;
    }
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}