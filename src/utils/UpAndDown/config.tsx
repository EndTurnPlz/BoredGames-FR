import { API_STRING } from "../config"

export const canvasWidth = 600;
export const canvasHeight = 600;
export const tileSize = canvasWidth / 16;

export const radius = tileSize / 2 - 3;

export const font_px = canvasWidth / 40;

export const SUBMIT_MOVE = (roomID: string) => {
    return `${API_STRING}/api/game/${roomID}/action/move`
}

export const indexToColor: Record<number, string> = {
  0: "blue",
  1: "yellow",
  2: "green",
  3: "red",
};