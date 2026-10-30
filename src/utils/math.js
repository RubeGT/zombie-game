export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

export function distanceSq(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
}

export function angleTo(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

export function angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

export function normalize(x, y) {
    const len = Math.sqrt(x * x + y * y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: x / len, y: y / len };
}

export function normalizeAngle(angle) {
    while (angle <= -Math.PI) angle += Math.PI * 2;
    while (angle > Math.PI) angle -= Math.PI * 2;
    return angle;
}

export function angleDifference(a1, a2) {
    let diff = a2 - a1;
    while (diff <= -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    return diff;
}

export function rotateTowards(current, target, maxDelta) {
    const diff = angleDifference(current, target);
    if (Math.abs(diff) <= maxDelta) return target;
    return current + Math.sign(diff) * maxDelta;
}

export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

export function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function choose(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function weightedRandom(weights) {
    const total = weights.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * total;
    for (const item of weights) {
        random -= item.weight;
        if (random <= 0) return item.value;
    }
    return weights[weights.length - 1].value;
}

export function circleCollision(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distSq = dx * dx + dy * dy;
    const radiusSum = r1 + r2;
    return distSq <= radiusSum * radiusSum;
}

export function circleRectCollision(cx, cy, radius, rx, ry, rw, rh) {
    const closestX = clamp(cx, rx, rx + rw);
    const closestY = clamp(cy, ry, ry + rh);
    return circleCollision(cx, cy, radius, closestX, closestY, 0);
}

export function pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

export function lerpAngle(a1, a2, t) {
    const diff = angleDifference(a1, a2);
    return normalizeAngle(a1 + diff * t);
}

export function approach(current, target, maxStep) {
    if (current < target) return Math.min(current + maxStep, target);
    if (current > target) return Math.max(current - maxStep, target);
    return current;
}

export function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

export function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function easeOutElastic(t) {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

export function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

export function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

export const Vec2 = {
    create(x = 0, y = 0) {
        return { x, y };
    },
    copy(v) {
        return { x: v.x, y: v.y };
    },
    add(a, b) {
        return { x: a.x + b.x, y: a.y + b.y };
    },
    sub(a, b) {
        return { x: a.x - b.x, y: a.y - b.y };
    },
    mul(v, s) {
        return { x: v.x * s, y: v.y * s };
    },
    div(v, s) {
        return { x: v.x / s, y: v.y / s };
    },
    length(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    },
    lengthSq(v) {
        return v.x * v.x + v.y * v.y;
    },
    normalize(v) {
        const len = this.length(v);
        if (len === 0) return { x: 0, y: 0 };
        return { x: v.x / len, y: v.y / len };
    },
    dot(a, b) {
        return a.x * b.x + a.y * b.y;
    },
    angle(v) {
        return Math.atan2(v.y, v.x);
    },
    fromAngle(angle, length = 1) {
        return { x: Math.cos(angle) * length, y: Math.sin(angle) * length };
    },
    lerp(a, b, t) {
        return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
    },
    clamp(v, maxLen) {
        const len = this.length(v);
        if (len > maxLen) {
            return this.mul(this.normalize(v), maxLen);
        }
        return v;
    }
};

export const Rect = {
    create(x = 0, y = 0, w = 0, h = 0) {
        return { x, y, w, h };
    },
    contains(rect, px, py) {
        return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
    },
    intersects(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    },
    center(rect) {
        return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
    }
};