import { GameObject } from "@/utils/GameObject.js";
import { Vector2 } from "@/utils/Vector2.js";
import { resources } from "@/utils/Resource";
import { events } from "@/utils/Events";
import { Sprite } from "@/utils/Sprite";

export class Rod extends GameObject {
  constructor(x, y) {
    console.log("Rod constructor");
    super({
      name: "Rod",
      position: new Vector2(x, y),
    });
    const sprite = new Sprite({
      resource: resources.images.rod,
      position: new Vector2(0, -5), // nudge upwards visually
    });
    this.addChild(sprite);
  }

  ready() {
    events.on("HERO_POSITION", this, (pos) => {
      // detect overlap...
      const roundedHeroX = Math.round(pos.x);
      const roundedHeroY = Math.round(pos.y);
      if (
        roundedHeroX === this.position.x &&
        roundedHeroY === this.position.y
      ) {
        this.onCollideWithHero();
      }
    });
  }

  onCollideWithHero() {
    // Remove this instance from the scene
    this.destroy();

    // Alert other things that we picked up a rod
    events.emit("HERO_PICKS_UP_ITEM", {
      type: "ROD",
      image: resources.images.rod,
      position: this.position,
    });
  }
}
