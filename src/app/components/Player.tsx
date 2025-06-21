import { Piece } from "./Piece";

export class Player {
  color: string;
  pieces: Piece[];

  constructor(color: string, startPositions: { x: number; y: number }[]) {
    this.color = color;
    this.pieces = startPositions.map(pos => new Piece(pos.x, pos.y, color));
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.pieces.forEach(p => p.draw(ctx));
  }
}
