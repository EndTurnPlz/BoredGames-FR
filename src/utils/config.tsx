export const canvasWidth = 800;
export const canvasHeight = 800;
export const tileSize = canvasWidth / 16;

export const radius = tileSize / 2 - 3;

export const font_px = canvasWidth / 40;

export const numberDict: { [key: number]: string } = {
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
  7: "seven",
  8: "eight",
  9: "nine",
  10: "ten",
  11: "eleven"
};

export const colorToAngleDict: { [key: string]: number } = {
    "yellow": 0,
    "green": 90,
    "red": 180,
    "blue": 270
} 

export const darkColorMap: Record<string, string> = {
  red: "#8B0000",
  yellow: "#B8860B",
  blue: "#000080",
  green: "#006400",
};

export const lightColorMap: Record<string, string> = {
  red: "#D32F2F",
  yellow: "#FBC02D",
  blue: "#1976D2",
  green: "#006400",
};

export const cardX1 = canvasWidth / 2 - 3 * tileSize;
export const cardX2 = cardX1 + 3.5 * tileSize;
export const cardY = canvasHeight / 2 - 2.5 * tileSize;
export const cardW = 3 * tileSize;
export const cardH = 5 * tileSize;

export const API_STRING = "http://localhost:5000"
