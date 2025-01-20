export const gridCells = (n) => {
  return n * 16;
};

export const isSpaceFree = (walls, x, y) => {
  const str = `${x / 16},${y / 16}`;
  const isWallPresent = walls.includes(str);
  return !isWallPresent;
};
