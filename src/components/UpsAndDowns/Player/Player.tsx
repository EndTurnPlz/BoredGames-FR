import { Piece } from "../Pieces/Piece"

export class Player {
  piece: Piece

  constructor(location: number, x: number, y: number, color: string) {
    this.piece = new Piece(location, x, y, color)
  }
}
