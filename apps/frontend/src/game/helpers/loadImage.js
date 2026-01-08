export const loadImage = async (url) => {
  console.log("loadImage", url);
  const img = new Image();

  return new Promise((resolve) => {
    img.onload = () => {
      resolve({
        image: img,
        isLoaded: true,
      });
    };

    img.onerror = () => {
      resolve({
        image: img,
        isLoaded: false,
        error: `Failed to load image: ${url}`,
      });
    };

    img.src = url;
  });
};
