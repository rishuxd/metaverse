import { GameObject } from "./GameObject.js";
import { events } from "./Events.js";
import { Vector2 } from "./Vector2.js";

export class Camera extends GameObject {
  constructor(canvasWidth, canvasHeight, zoom = 1) {
    super({});
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.zoom = zoom;
    this.position = new Vector2(0, 0);
    this.targetPosition = new Vector2(0, 0);
    this.mapWidth = 0;
    this.mapHeight = 0;

    this.speed = 0.08;
    this.followHero = false;
    this.heroPosition = null;
    this.boundaryThreshold = 0.3;
    this.dampening = 0.85;
    this.velocity = new Vector2(0, 0);
    this.maxPanSpeed = 1.5;
    this.panSensitivity = 0.8;
    this.followOffset = new Vector2(0, 0);
    this.minVelocityThreshold = 0.05;

    events.on("HERO_POSITION", this, (heroPosition) => {
      this.heroPosition = heroPosition;
      if (!this.followHero) {
        this.checkBoundaries();
      }
    });
  }

  setMapSize(width, height) {
    this.mapWidth = width;
    this.mapHeight = height;
  }

  checkBoundaries() {
    if (!this.heroPosition || !this.mapWidth || !this.mapHeight) return;

    // Convert hero position to map relative coordinates
    const heroX = this.heroPosition.x;
    const heroY = this.heroPosition.y;

    // Calculate visible area boundaries
    const visibleLeft = -this.position.x;
    const visibleRight = -this.position.x + this.mapWidth;
    const visibleTop = -this.position.y;
    const visibleBottom = -this.position.y + this.mapHeight;

    // Calculate threshold distance from edges
    const thresholdX = this.mapWidth * this.boundaryThreshold;
    const thresholdY = this.mapHeight * this.boundaryThreshold;

    const nearBoundary =
      heroX < visibleLeft + thresholdX ||
      heroX > visibleRight - thresholdX ||
      heroY < visibleTop + thresholdY ||
      heroY > visibleBottom - thresholdY;

    if (nearBoundary) {
      this.enableFollowHero();
    }
  }

  checkIfCanStopFollowing() {
    if (!this.heroPosition || !this.mapWidth || !this.mapHeight) return;

    // Calculate safe zone boundaries (40% from edges)
    const safeZoneX = this.mapWidth * 0.4;
    const safeZoneY = this.mapHeight * 0.4;

    // Convert hero position to map relative coordinates
    const heroX = this.heroPosition.x;
    const heroY = this.heroPosition.y;

    // Calculate visible area center
    const visibleCenterX = -this.position.x + this.mapWidth / 2;
    const visibleCenterY = -this.position.y + this.mapHeight / 2;

    const inSafeZone =
      Math.abs(heroX - visibleCenterX) < safeZoneX / 2 &&
      Math.abs(heroY - visibleCenterY) < safeZoneY / 2;

    if (inSafeZone) {
      this.disableFollowHero();
    }
  }

  constrainToBounds(mapWidth, mapHeight) {
    const minX = -(mapWidth - this.mapWidth);
    const minY = -(mapHeight - this.mapHeight);
    const maxX = 0;
    const maxY = 0;

    this.position.x = Math.max(minX, Math.min(maxX, this.position.x));
    this.position.y = Math.max(minY, Math.min(maxY, this.position.y));
  }

  worldToScreen(worldPos) {
    return new Vector2(
      Math.round((worldPos.x + this.position.x) * this.zoom),
      Math.round((worldPos.y + this.position.y) * this.zoom)
    );
  }

  calculateTargetPosition() {
    const halfWidth = this.mapWidth / 2;
    const halfHeight = this.mapHeight / 2;

    return new Vector2(
      -this.heroPosition.x + halfWidth,
      -this.heroPosition.y + halfHeight
    );
  }

  update(delta) {
    if (this.followHero && this.heroPosition) {
      const targetPos = this.calculateTargetPosition();
      this.smoothMoveTo(targetPos, delta);
    }

    const scaledDelta = delta * 0.04;

    this.position.x += this.velocity.x * scaledDelta;
    this.position.y += this.velocity.y * scaledDelta;

    this.position.x = Math.round(this.position.x * 10) / 10;
    this.position.y = Math.round(this.position.y * 10) / 10;

    this.velocity.x *= this.dampening;
    this.velocity.y *= this.dampening;

    if (Math.abs(this.velocity.x) < this.minVelocityThreshold) {
      this.velocity.x = 0;
    }
    if (Math.abs(this.velocity.y) < this.minVelocityThreshold) {
      this.velocity.y = 0;
    }

    if (this.mapWidth && this.mapHeight) {
      this.constrainToBounds(this.mapWidth, this.mapHeight);
    }

    if (this.followHero) {
      this.checkIfCanStopFollowing();
    }
  }

  smoothMoveTo(targetPos, delta) {
    const dx = targetPos.x - this.position.x;
    const dy = targetPos.y - this.position.y;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const speedMultiplier = Math.min(distance / 100, 1);

    this.velocity.x += dx * this.speed * delta * speedMultiplier;
    this.velocity.y += dy * this.speed * delta * speedMultiplier;

    this.velocity.x = Math.max(
      -this.maxPanSpeed,
      Math.min(this.maxPanSpeed, this.velocity.x)
    );
    this.velocity.y = Math.max(
      -this.maxPanSpeed,
      Math.min(this.maxPanSpeed, this.velocity.y)
    );
  }

  handlePan(dx, dy) {
    const dpr = window.devicePixelRatio || 1;
    const adjustedDx = (dx * this.panSensitivity) / (this.zoom * dpr);
    const adjustedDy = (dy * this.panSensitivity) / (this.zoom * dpr);

    this.velocity.x += adjustedDx * 0.5;
    this.velocity.y += adjustedDy * 0.5;

    this.velocity.x = Math.max(
      -this.maxPanSpeed,
      Math.min(this.maxPanSpeed, this.velocity.x)
    );
    this.velocity.y = Math.max(
      -this.maxPanSpeed,
      Math.min(this.maxPanSpeed, this.velocity.y)
    );
  }

  setZoom(zoomLevel) {
    this.zoom = Math.max(0.1, Math.min(zoomLevel, 5));
  }

  setPosition(x, y) {
    this.position = new Vector2(Math.round(x), Math.round(y));
    this.velocity = new Vector2(0, 0);
  }

  enableFollowHero() {
    this.followHero = true;
  }

  disableFollowHero() {
    this.followHero = false;
  }
}
