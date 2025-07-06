import { Player } from "@/components/Player/Player";
import { coordStringToPixel, findPath } from "./outerPath";
import { tileSize, colorToIndex, indexToColor, numberDict } from "./config";
import { Move } from "@/app/gameBoards/sorryBoard";

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

function getStepInfo(from: string, to: string): number {
  const steps = findPath(from, to).length - 1;
  return steps;
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

function generateMoveDescription(username: string, move: Part, steps: number): string {
  const effect = move.effect
  const to = move.to
  if (to.includes("_H")) {
    return `${username} moved pawn to home`
  }
  switch (effect) {
    case 0: // Forward
      return `${username} moved pawn ${steps} ${ steps == 1 ? "step" : "steps"} forward`;
    case 2: // ExitStart
      return `${username} moved pawn out of start`;
    case 1: // Backward
      return `${username} moved pawn ${steps} ${ steps == 1 ? "step" : "steps"} backward`;
    case 3: // Apologies
      return ``;
    case 4: // Swap
      return ``;
    case 5: case 6: case 7: case 8: case 9: case 10: // Split1 to Split6
      return `${username} moved pawn ${steps} ${ steps == 1 ? "step" : "steps"} forward`;
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
      return `${mainUsername} apologized and sent ${affectedUsername}'s pawn back to start.`;
    case 4: // Swap
      return `${mainUsername} swapped places with ${affectedUsername}.`;
    default:
      return `${mainUsername} killed ${affectedUsername}'s pawn.`;
  }
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
    const oldP = old_players[p];
    const newP = new_players[p];

    for (let i = 0; i < oldP.pieces.length; i++) {
      const oldPos = oldP.pieces[i].id;
      const newPos = newP.pieces[i].id;
      const steps = getStepInfo(oldPos, newPos);
      const pieceColor = oldP.pieces[i].color;
      const isMainMove = oldPos === from;
      const isSplitMove = oldPos === secondFrom;
      const moved = oldPos !== newPos;

      if (pieceColor === color) {
        // This is the current player's piece
        if (moved && isMainMove && lastCompletedMove?.move) {
          let description = generateMoveDescription(username, lastCompletedMove.move, steps)
          if (description.length > 0) {
            moves.push(description);
          }
        } else if (moved && isSplitMove && lastCompletedMove?.splitMove) {
          let description = generateMoveDescription(username, lastCompletedMove.splitMove, steps)
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

  if (moves.length === 0) {
    return `${color} (${username}) could not move.`;
  }

  return `${color} (${username}) moved: ${moves.join(", ")}`;
}
