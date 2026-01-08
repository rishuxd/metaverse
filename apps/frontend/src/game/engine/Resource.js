class Resources {
  constructor() {
    this.toLoad = {
      map1: "/maps/map1.png",
      map2: "/maps/map2.png",
      hero: "/sprites/hero-sheet.png",
      shadow: "/sprites/shadow.png",
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
