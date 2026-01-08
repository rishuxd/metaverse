class Resources {
  constructor() {
    this.toLoad = {
      map1: "/assets/maps/map1.png",
      hero: "/assets/sprites/hero-sheet.png",
      shadow: "/assets/sprites/shadow.png",
    };

    this.images = {};

    Object.keys(this.toLoad).forEach((key) => {
      const img = new Image();
      img.src = this.toLoad[key];
      this.images[key] = {
        image: img,
        isLoaded: false,
      };
      img.onload = () => {
        this.images[key].isLoaded = true;
      };
    });
  }
}
export const resources = new Resources();
