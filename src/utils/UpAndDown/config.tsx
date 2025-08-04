import { API_STRING } from "../config"

export const canvasWidth = 600;
export const canvasHeight = 600;
export const number_rows = 10
export const tileSize = canvasWidth / number_rows;

export const radius = tileSize / 2 - 3;

export const font_px = canvasWidth / 40;

export const SUBMIT_MOVE = (roomID: string) => {
    return `${API_STRING}/api/game/${roomID}/action/move`
}