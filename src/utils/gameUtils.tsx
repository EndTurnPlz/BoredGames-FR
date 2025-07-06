import { Player } from "@/components/Player/Player";
import { coordStringToPixel } from "./outerPath";
import { tileSize, colorToIndex } from "./config";

export type GameState = {
  [color: string]: string[];
};

export function applyGameState(
  gameState: GameState
): Player[] {
  const newPlayers: Player[] = [];

  for (const color in gameState) {
    const coordStrings = gameState[color];
    const positions = coordStrings.map((coord) =>
      coordStringToPixel(coord, tileSize)
    );
    const player = new Player(color, positions);
    newPlayers.push(player);
  }

  return newPlayers;
}

export function getTurnPhaseForPlayer(
  phase: number,
  index: number
): "draw" | "move" | "wait" {
  if (phase === index * 2) return "draw";
  if (phase === index * 2 + 1) return "move";
  return "wait";
}

export function generateMoveString(
  phase: number,
  turnOrder: string[]
): string {
  return "hello"
}