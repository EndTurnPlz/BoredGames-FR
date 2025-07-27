import React, { useRef, useEffect, RefObject } from "react";

interface BoardProps {
  size?: number; // canvas size in pixels
  rows?: number;
  cols?: number;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

const UpsAndDownsCanvas: React.FC<BoardProps> = ({ size = 500, rows = 10, cols = 10, canvasRef }) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tileSize = size / cols;
    const fontSize = tileSize / 3;
    ctx.clearRect(0, 0, size, size);
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let color1 = "#f0e68c"
    let color2 = "#ffffff"
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

        ctx.strokeStyle = "#000";
        ctx.strokeRect(x, y, tileSize, tileSize);

        ctx.fillStyle = "#000";
        ctx.fillText(((100 - 10*row + 1) - (100 - index) + (9 - row) * 10).toString(), x + tileSize / 2, y + tileSize / 2);
      }
    }
  }, [size, canvasRef]);

  return <canvas ref={canvasRef} width={size} height={size} />;
};

export default UpsAndDownsCanvas;
