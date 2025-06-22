// utils/outerPath.ts
import { tileSize } from "./config";
const letters = ["a", "b", "c", "d"];
export const coordMap: Record<string, { x: number; y: number }> = {};

export const coordStringToPixel = (coord: string, tileSize: number): { x: number; y: number, id: string } => {
  const [letter, rowStr] = coord.split("_");
  let col = 0;

  let row = 0;

  if (/^\d+$/.test(rowStr)) {
    // Regular tile, like "a_5"
    let number = parseInt(rowStr, 10);
    if (letter == "a") {
      row = number;
      col = 15;
    } else if (letter == "b") {
      row = 15;
      col = 15 - number;
    } else if (letter == "c") {
      row = 15 - number;
      col = 0;
    } else {
      row = 0;
      col = number;
    }
  } else if (/^s\d+$/.test(rowStr)) {
    // Safety tile, like "a_s3"
    if (letter == "a") {
      row = 2;
      col = 15 - parseInt(rowStr.slice(1), 10)
    } else if (letter == "b") {
      row = 15 - parseInt(rowStr.slice(1), 10);
      col = 13;
    } else if (letter == "c") {
      row = 13;
      col = parseInt(rowStr.slice(1), 10);
    } else {
      row = parseInt(rowStr.slice(1), 10);
      col = 2;
    }
  } else if (rowStr === "H") {
    // Home tile
    if (letter == "a") {
      row = 2;
      col = 8
    } else if (letter == "b") {
      row = 8;
      col = 13;
    } else if (letter == "c") {
      row = 13;
      col = 7;
    } else {
      row = 7;
      col = 2;
    }

  } else {
    if (letter == "a") {
      row = 4;
      col = 13
    } else if (letter == "b") {
      row = 13;
      col = 11;
    } else if (letter == "c") {
      row = 11;
      col = 2;
    } else {
      row = 2;
      col = 4;
    }
  }

  return {
    x: col * tileSize + tileSize / 2,
    y: row * tileSize + tileSize / 2,
    id: coord
  };
};

// Outer path tiles
for (const letter of letters) {
  for (let i = 0; i <= 15; i++) {
    const key = `${letter}_${i}`;
    const { x, y } = coordStringToPixel(key, tileSize);
    coordMap[key] = { x, y };
  }
}

// Safety tiles (s1 to s5 for each player)
for (const letter of letters) {
  for (let i = 1; i <= 5; i++) {
    const key = `${letter}_s${i}`;
    const { x, y } = coordStringToPixel(key, tileSize);
    coordMap[key] = { x, y };
  }
}

// Home tile
for (const letter of letters) {
  const key = `${letter}_H`;
  const { x, y } = coordStringToPixel(key, tileSize);
  coordMap[key] = { x, y };
}

for (const letter of letters) {
  const key = `${letter}_S'`;
  const { x, y } = coordStringToPixel(key, tileSize);
  coordMap[key] = { x, y };
}
  