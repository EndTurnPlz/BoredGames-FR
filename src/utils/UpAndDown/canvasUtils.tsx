import { Player } from "@/components/UpsAndDowns/Player/Player";
import React, { useRef, useEffect, RefObject } from "react";

interface BoardProps {
  size?: number; // canvas size in pixels
  rows?: number;
  cols?: number;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  players: Player[];
}
export const coordsMap: Record<number, { x: number; y: number }> = {};

const UpsAndDownsCanvas: React.FC<BoardProps> = ({ size = 600, rows = 10, cols = 10, canvasRef, players }) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const tileSize = size / cols;
    const fontSize = tileSize / 3;
    ctx.clearRect(0, 0, size, size);
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let color1 = "#f0e68c"
    let color2 = "#ffffff"
    let strokeColor = "#000";
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Snake-style column position
        const actualCol = row % 2 === 0 ? cols - 1 - col : col;
        const x = actualCol * tileSize;
        const y = row * tileSize;

        // Alternate color pattern in snake order
        const index = row * cols + col;
        const isEven = index % 2 === 0;
        ctx.fillStyle = isEven ? color1 : color2; // light yellow / white
        ctx.fillRect(x, y, tileSize, tileSize);
        const number = ((100 - 10*row + 1) - (100 - index) + (9 - row) * 10)
        coordsMap[number] = {x: x + tileSize / 2, y: y + tileSize / 2}

        ctx.strokeStyle = strokeColor;
        ctx.strokeRect(x, y, tileSize, tileSize);

        ctx.fillStyle = strokeColor;
        ctx.fillText(number.toString(), x + tileSize / 2, y + tileSize / 2);
      }
    }

    players.forEach((player, index) => {
      const location = player.location; // assuming this is a number
      const coords = coordsMap[location + 1];
      console.log(coords)
      if (!coords) return;

      const {x, y} = coords;

      ctx.beginPath();
      ctx.arc(x, y, 15, 0, 2 * Math.PI); // radius 15px
      ctx.fill();
    });

  }, [size, canvasRef, players]);

  return <canvas ref={canvasRef} width={size} height={size} />;
};

export default UpsAndDownsCanvas;
