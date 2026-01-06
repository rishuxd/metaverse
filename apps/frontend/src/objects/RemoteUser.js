import { GameObject } from "@/utils/GameObject.js";
import { Vector2 } from "@/utils/Vector2.js";
import { DOWN, LEFT, RIGHT, UP } from "@/utils/Input.js";
import { Sprite } from "@/utils/Sprite.js";
import { resources } from "@/utils/Resource.js";
import { Animations } from "@/utils/Animations.js";
import { FrameIndexPattern } from "@/utils/FrameIndexPattern.js";
import {
  STAND_DOWN,
  STAND_LEFT,
  STAND_RIGHT,
  STAND_UP,
  WALK_DOWN,
  WALK_LEFT,
  WALK_RIGHT,
  WALK_UP,
} from "./Hero/heroAnimations.js";
import { moveTowards } from "@/helpers/moveTowards.js";

export class RemoteUser extends GameObject {
  constructor(x, y, userId, username, avatar) {
    super({
      position: new Vector2(x, y),
    });

    this.userId = userId;
    this.username = username;
    this.avatar = avatar;
    this.destinationPosition = this.position.duplicate(); // Target position for movement
    this.facingDirection = DOWN; // Default facing direction

    // Add shadow sprite
    const shadow = new Sprite({
      resource: resources.images.shadow,
      frameSize: new Vector2(32, 32),
      position: new Vector2(-8, -19),
    });
    this.addChild(shadow);

    // Add body sprite with animations
    this.body = new Sprite({
      resource: this.avatar,
      frameSize: new Vector2(32, 32),
      hFrames: 3,
      vFrames: 8,
      frame: 1,
      position: new Vector2(-8, -20),
      animations: new Animations({
        walkDown: new FrameIndexPattern(WALK_DOWN),
        walkUp: new FrameIndexPattern(WALK_UP),
        walkLeft: new FrameIndexPattern(WALK_LEFT),
        walkRight: new FrameIndexPattern(WALK_RIGHT),
        standDown: new FrameIndexPattern(STAND_DOWN),
        standUp: new FrameIndexPattern(STAND_UP),
        standLeft: new FrameIndexPattern(STAND_LEFT),
        standRight: new FrameIndexPattern(STAND_RIGHT),
      }),
    });
    this.addChild(this.body);
  }

  // Update position based on server updates
  updatePosition(x, y) {
    this.destinationPosition.x = x;
    this.destinationPosition.y = y;
  }

  // Step method to handle animations and position updates
  step(delta, root) {
    // Move towards the destination position
    const distance = moveTowards(this, this.destinationPosition, 2);

    // Check if the user has arrived at the destination
    if (distance <= 2) {
      this.playIdleAnimation();
      return;
    }

    // Move towards the target position with animations
    const dx = this.destinationPosition.x - this.position.x;
    const dy = this.destinationPosition.y - this.position.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Move horizontally
      if (dx > 0) {
        this.body.animations.play("walkRight");
        this.facingDirection = RIGHT; // Update facing direction
      } else if (dx < 0) {
        this.body.animations.play("walkLeft");
        this.facingDirection = LEFT; // Update facing direction
      }
    } else {
      // Move vertically
      if (dy > 0) {
        this.body.animations.play("walkDown");
        this.facingDirection = DOWN; // Update facing direction
      } else if (dy < 0) {
        this.body.animations.play("walkUp");
        this.facingDirection = UP; // Update facing direction
      }
    }
  }

  // Play idle animations based on facing direction
  playIdleAnimation() {
    switch (this.facingDirection) {
      case LEFT:
        this.body.animations.play("standLeft");
        break;
      case RIGHT:
        this.body.animations.play("standRight");
        break;
      case UP:
        this.body.animations.play("standUp");
        break;
      case DOWN:
        this.body.animations.play("standDown");
        break;
    }
  }
}
