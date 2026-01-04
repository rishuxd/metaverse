import { GameObject } from "./GameObject.js";
import { events } from "./Events.js";
import { Vector2 } from "./Vector2.js";

export class Camera extends GameObject {
  constructor(canvasWidth, canvasHeight, mapWidth, mapHeight) {
    super({});

    this.zoom = 1.0;
    this.minZoom = 0.5;
    this.maxZoom = 2.0;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.mapWidth = mapWidth * 16; // Convert grid cells to pixels
    this.mapHeight = mapHeight * 16;
    this.isFollowingHero = true;
    this.manualOffset = new Vector2(0, 0);
    this.isPanning = false;
    this.panStartPos = { x: 0, y: 0 };
    this.lastHeroPosition = null;

    events.on("HERO_POSITION", this, (heroPosition) => {
      const personHalf = 8;
      const halfWidth = -personHalf + this.canvasWidth / 2;
      const halfHeight = -personHalf + this.canvasHeight / 2;

      const targetX = -heroPosition.x + halfWidth;
      const targetY = -heroPosition.y + halfHeight;

      // Check if hero moved (if user is controlling the character)
      if (this.lastHeroPosition &&
          (this.lastHeroPosition.x !== heroPosition.x || this.lastHeroPosition.y !== heroPosition.y)) {
        // Hero moved! Resume following with smooth transition
        this.isFollowingHero = true;
      }

      this.lastHeroPosition = { x: heroPosition.x, y: heroPosition.y };

      if (this.isFollowingHero) {
        // When actively following, center camera on hero with smooth interpolation
        if (!this.position) {
          this.position = new Vector2(targetX, targetY);
        } else {
          const smoothing = 0.05; // Smooth transition (0.05 = very smooth, 1 = instant)
          this.position.x += (targetX - this.position.x) * smoothing;
          this.position.y += (targetY - this.position.y) * smoothing;
        }
      }
    });
  }

  adjustZoom(direction) {
    // Snap to specific zoom levels for pixel-perfect rendering
    const zoomLevels = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

    // Find current zoom index
    const currentIndex = zoomLevels.findIndex(level => level === this.zoom);

    // Move to next or previous zoom level
    let newIndex = currentIndex + direction;
    newIndex = Math.max(0, Math.min(zoomLevels.length - 1, newIndex));

    this.zoom = zoomLevels[newIndex];
  }

  startPan(x, y) {
    this.isPanning = true;
    this.isFollowingHero = false;
    this.panStartPos = { x, y };
  }

  updatePan(x, y) {
    if (!this.isPanning) return;

    const dx = (x - this.panStartPos.x) / this.zoom;
    const dy = (y - this.panStartPos.y) / this.zoom;

    this.position.x += dx;
    this.position.y += dy;

    this.panStartPos = { x, y };
  }

  endPan() {
    this.isPanning = false;
  }

  resetToHero() {
    this.isFollowingHero = true;
    this.manualOffset = new Vector2(0, 0);
  }
}
