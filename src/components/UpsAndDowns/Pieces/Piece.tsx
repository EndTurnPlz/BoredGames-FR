export class Piece {
  location: number;
  x: number;
  y: number;
  color: string;


  constructor(location: number, x: number, y : number, color: string) {
    this.location = location
    this.color = color
    this.x = x
    this.y = y
  }
}