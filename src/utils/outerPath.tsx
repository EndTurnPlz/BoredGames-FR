// utils/outerPath.ts

const alphaToIndex = (letter: string): number => {
  return letter.toLowerCase().charCodeAt(0) - "a".charCodeAt(0); // "a" => 0
};

export const coordStringToPixel = (coord: string, tileSize: number): { x: number; y: number } => {
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
      col = 9
    } else if (letter == "b") {
      row = 9;
      col = 13;
    } else if (letter == "c") {
      row = 13;
      col = 6;
    } else {
      row = 6;
      col = 2;
    }

  } else {
   
  }

  return {
    x: col * tileSize + tileSize / 2,
    y: row * tileSize + tileSize / 2,
  };
};
  