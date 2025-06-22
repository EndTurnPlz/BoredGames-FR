// Piece.ts
import { tileSize } from "@/utils/config";
export class Piece {
  x: number;
  y: number;
  color: string;
  id: string

  constructor(x: number, y: number, color: string, id: string) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.id = id
  }
}
