import { API_STRING } from "../config";
export const canvasWidth = 800;
export const canvasHeight = 800;
export const tileSize = canvasWidth / 16;

export const radius = tileSize / 2 - 3;

export const font_px = canvasWidth / 40;

export const numberDict: { [key: number]: string } = {
  0: "apologies",
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  7: "seven",
  8: "eight",
  10: "ten",
  11: "eleven",
  12: "twelve"
};

export const stringDict: { [key: string]: number } = {
  "apologies": 0,
  "one": 1,
  "two": 2,
  "three": 3,
  "four": 4,
  "five": 5,
  "seven": 7,
  "eight": 8,
  "ten": 10,
  "eleven": 11,
  "twelve": 12
};


export const colorToAngleDict: { [key: string]: number } = {
    "yellow": 0,
    "green": 270,
    "red": 180,
    "blue": 90
} 

export const wordToAngleDict: { [key: string]: number } = {
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
const prefix = "/api/game/"

export const GET_START = (roomId: string)  => {
  return `${API_STRING}${prefix}${roomId}/start`
}

export const GET_GAMESTATS = (roomId: string)  => {
  return `${API_STRING}${prefix}${roomId}/action`
}

export const DRAW_CARD = (roomId: string)  => {
  return `${API_STRING}${prefix}${roomId}/action/draw`
}

export const MOVE_PAWN = (roomId: string)  => {
  return `${API_STRING}${prefix}${roomId}/action/move`
}

export const colorToIndex: Record<string, number> = {
  "blue": 0,
 "yellow": 1,
  "green": 2,
  "red": 3
};

export const deck_card = "/BoredGames-FR/Cards/deck.png"

export const card_path = (id: string) => {
  return `/BoredGames-FR/Cards/FaceCards/${id}.png`
}

export const zoneToColor: Record<string, string> = {
    a: "blue",
    b: "yellow",
    c: "green",
    d: "red",
  };

