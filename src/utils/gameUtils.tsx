import { Player } from "@/components/Player/Player";
import { coordStringToPixel } from "./outerPath";
import { tileSize, colorToIndex, indexToColor, numberDict } from "./config";

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
  new_phase: number,
  players: string[],
  old_players: Player[],
  new_players: Player[],
  card: number,
): string {
  if (phase === 8) {
    if (new_phase == 0) {
      return `${players[0]} has started the game`
    }
    return "";
  }
  const index = Math.floor(phase / 2)
  const color = indexToColor[index];
  const username = players[index]
  const oldPlayer = old_players.find(p => p.color === color);
  const newPlayer = new_players.find(p => p.color === color);

  if (!oldPlayer || !newPlayer) return `${color} (${username}}) has no recorded move.`;

  const moves: string[] = [];

  for (let i = 0; i < oldPlayer.pieces.length; i++) {
    const oldPos = oldPlayer.pieces[i].id;
    const newPos = newPlayer.pieces[i].id;

    if (oldPos !== newPos) {
      moves.push(`${oldPos} → ${newPos}`);
    }
  }
  if (new_phase % 2 == 1) {
    if (card != 0) {
      return `${color} (${username}) drew a ${numberDict[card]}.`;
    } else {
      return `${color} (${username}) drew an ${numberDict[card]}.`;
    }
  }
  if (moves.length === 0) {
    return `${color} (${username}) could not move.`;
  }

  return `${color} (${username}) moved: ${moves.join(", ")}`;
}
