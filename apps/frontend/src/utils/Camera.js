import { GameObject } from "./GameObject.js";
import { events } from "./Events.js";
import { Vector2 } from "./Vector2.js";

export class Camera extends GameObject {
  constructor(canvasWidth, canvasHeight, mapWidth, mapHeight) {
    super({});

    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.mapWidth = mapWidth * 16; // Convert grid cells to pixels
    this.mapHeight = mapHeight * 16;

    // Calculate zoom to fit entire map in viewport
    const zoomToFitWidth = canvasWidth / this.mapWidth;
    const zoomToFitHeight = canvasHeight / this.mapHeight;
    const autoFitZoom = Math.min(zoomToFitWidth, zoomToFitHeight);

    // Set initial zoom to auto-fit, but not less than 0.1
    this.zoom = Math.max(0.1, autoFitZoom);
    this.minZoom = Math.max(0.1, autoFitZoom * 0.5); // Allow zooming out to half of auto-fit
    this.maxZoom = 5.0;

    this.isFollowingHero = true;
    this.manualOffset = new Vector2(0, 0);
    this.isPanning = false;
    this.panStartPos = { x: 0, y: 0 };
    this.lastHeroPosition = null;

    events.on("HERO_POSITION", this, (heroPosition) => {
      // Camera position is now in world space, centered
      // To center hero, we need to move camera to -heroPosition
      const targetX = -heroPosition.x;
      const targetY = -heroPosition.y;

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
          const smoothing = 0.1; // Smooth transition (0.1 = smooth, 1 = instant)
          this.position.x += (targetX - this.position.x) * smoothing;
          this.position.y += (targetY - this.position.y) * smoothing;
        }
      }
    });
  }

  adjustZoom(direction) {
    // Increase or decrease zoom by 10%
    const zoomStep = 0.1;

    if (direction > 0) {
      // Zoom in
      this.zoom = Math.min(this.maxZoom, this.zoom + zoomStep);
    } else {
      // Zoom out
      this.zoom = Math.max(this.minZoom, this.zoom - zoomStep);
    }

    // Round to 2 decimal places for stability
    this.zoom = Math.round(this.zoom * 100) / 100;
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
