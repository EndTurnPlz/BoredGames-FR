import { Player } from "@/components/UpsAndDowns/Player/Player";
import React, { useRef, useEffect, RefObject } from "react";
import { canvasWidth, font_px, number_rows, tileSize } from "./config";
import { Warp } from "../adapters";

interface BoardProps {
  size?: number; // canvas size in pixels
  rows?: number;
  cols?: number;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  players: Player[];
  warps: Warp[];
}
export const coordsMap: Record<number, { x: number; y: number }> = {};

const UpsAndDownsCanvas: React.FC<BoardProps> = ({ size = canvasWidth, rows = number_rows, cols = number_rows, canvasRef, players, warps }) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${font_px}px Arial`;
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
        ctx.font = `${tileSize / 4}px Arial`;
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(`${number}`, x + 4, y + 4);
        const warp = warps.find((w) => parseInt(w.Tile) === number);
        if (warp) {
          const from = parseInt(warp.Tile);
          const to = parseInt(warp.Dest);
          const isUp = to > from;

          const arrow = isUp ? "↑" : "↓";
          const color = isUp ? "green" : "red";
          const label = warp.Dest

          const smallFontSize = tileSize / 4;
          ctx.font = `bold ${smallFontSize}px Arial`;
          ctx.fillStyle = color;
          ctx.textAlign = "left";
          ctx.textBaseline = "top";

          // Draw arrow
          ctx.fillText(`${arrow} ${label}`, x + tileSize / 2, y + 4);
        }
      }
    }
    coordsMap[0] = {x: coordsMap[1].x - tileSize, y: coordsMap[1].y}
  }, [size, canvasRef, players]);

  return <canvas ref={canvasRef} width={size} height={size} />;
};

export default UpsAndDownsCanvas;
