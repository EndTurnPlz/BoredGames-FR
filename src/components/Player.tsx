import { Piece } from "./Piece";

export class Player {
  color: string;
  pieces: Piece[];

  constructor(color: string, startPositions: { x: number; y: number; id:string }[]) {
    this.color = color;
    this.pieces = startPositions.map(pos => new Piece(pos.x, pos.y, color, pos.id));
  }
}
