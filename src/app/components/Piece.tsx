// Piece.ts
import { tileSize } from "@/utils/config";
export class Piece {
  x: number;
  y: number;
  color: string;
  radius: number = tileSize/2 - 3;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.color = color;
  }
}
