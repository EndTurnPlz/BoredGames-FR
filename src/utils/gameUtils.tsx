import { Player } from "@/components/Player/Player";
import { coordStringToPixel, findPath } from "./outerPath";
import { tileSize, colorToIndex, indexToColor, numberDict, zoneToColor } from "./config";

export type GameState = {
  [color: string]: string[];
};

export function formatTicks(ticks: number): string {
  const totalSeconds = Math.floor(ticks / 10_000_000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

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

type Part = {
  from: string;
  to: string;
  effect: number;
}

type Request = {
  move: Part
  splitMove?: Part
}

function generateMoveDescription(username: string, move: Part): string {
  const effect = move.effect
  const to = move.to
  if (to.includes("_H")) {
    return `${username} moved pawn to home`
  }
  switch (effect) {
    case 1: // Backward
      return `${username} moved pawn backward`;
    case 3: // Apologies
      return ``;
    case 4: // Swap
      return ``;
    case 0: case 2: case 5: case 6: case 7: case 8: case 9: case 10: // Split1 to Split6
      return `${username} moved pawn forward`;
    default:
      return `${username} made a move`;
  }
}

function generateSideEffectDescription(
  mainUsername: string,
  affectedUsername: string,
  effect: number
): string {
  switch (effect) {
    case 3: // Apologies
      return `${mainUsername} apologized and sent ${affectedUsername}'s pawn back to start`;
    case 4: // Swap
      return `${mainUsername} swapped pawn with ${affectedUsername}'s pawn`;
    default:
      return `${affectedUsername}'s pawn was knocked back to start`;
  }
}

function getSliderString(color: string, location: string): string {
  const [zone, posStr] = location.split("_");
  const pos = parseInt(posStr);

  // Don't slide on your own color
  if (color === zoneToColor[zone]) return "";

  if (pos === 1 || pos === 9) {
    return ` landed on a slider`;
  }

  return "";
}
export function generateMoveString(
  phase: number,
  new_phase: number,
  players: string[],
  old_players: Player[],
  new_players: Player[],
  card: number,
  lastCompletedMove: Request | null,
): string {
  const from = lastCompletedMove?.move.from;
  const secondFrom = lastCompletedMove?.splitMove?.from;
  const index = Math.floor(phase / 2);
  const color = indexToColor[index];
  const username = players[index];
  const effect = lastCompletedMove?.move.effect;

  const moves: string[] = [];

  for (let p = 0; p < old_players.length; p++) {
    const oldP = old_players[(index + p) % 4];
    const newP = new_players[(index + p) % 4];

    for (let i = 0; i < oldP.pieces.length; i++) {
      const oldPos = oldP.pieces[i].id;
      const newPos = newP.pieces[i].id;
      const pieceColor = oldP.pieces[i].color;
      const isMainMove = oldPos === from;
      const isSplitMove = oldPos === secondFrom;
      const moved = oldPos !== newPos;

      if (pieceColor === color) {
        // This is the current player's piece
        if (moved && isMainMove && lastCompletedMove?.move) {
          let description = generateMoveDescription(username, lastCompletedMove.move) + getSliderString(color, lastCompletedMove.move.to)
          if (description.length > 0) {
            moves.push(description);
          }
        } else if (moved && isSplitMove && lastCompletedMove?.splitMove) {
          let description = generateMoveDescription(username, lastCompletedMove.splitMove) + getSliderString(color, lastCompletedMove.splitMove.to)
          if (description.length > 0) {
            moves.push(description);
          }
        }
      } else if (moved) {
        // This is another player's piece that was affected
        const affectedUsername = players[colorToIndex[pieceColor]];
        moves.push(generateSideEffectDescription(username, affectedUsername, effect ?? -1));
      }
    }
  }

  if (new_phase % 2 === 1) {
    const article = numberDict[card].match(/^[aeiou]/i) ? "an" : "a";
    return `${color} (${username}) drew ${article} ${numberDict[card]}.`;
  }

  if (phase != new_phase && new_phase % 2 == 0 && phase % 2 == 0) {
    return `${color} (${username}) could not move.`;
  }
  if (moves.length == 0) {
    return ''
  }

  return `${color} (${username}) moved: ${moves.join(", ")}`;
}
