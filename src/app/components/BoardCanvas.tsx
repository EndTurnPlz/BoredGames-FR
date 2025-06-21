"use client";
import { useEffect, useRef, useState } from "react";
import { Player } from "./Player"; // assumes Player has a draw(ctx) method
import { drawCircle, fillTile, drawStripWithTriangleAndCircle } from "@/utils/drawUtils";
import { coordStringToPixel } from "@/utils/outerPath";
import { tileSize, canvasWidth, canvasHeight } from "@/utils/config";
import { getRotationAngleForColor } from "@/utils/rotation";



type GameState = {
  [color: string]: string[];
};

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const drawBoard = (ctx: CanvasRenderingContext2D, tileSize: number) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const circleRadius = 1.4 * tileSize;
    const numCols = canvasWidth / tileSize;
    const numRows = canvasHeight / tileSize;

    const redSafetyZone = [[1,2], [2,2], [3,2], [4,2], [5,2]];
    const yellowSafetyZone = [[14,13], [13,13], [12,13], [11,13], [10,13]];
    const blueSafetyZone = [[2,14], [2,13], [2,12], [2,11], [2, 10]];
    const greenSafetyZone = [[13,1], [13,2], [13,3], [13,4], [13,5]];

    const zones = [
      { x: 2.5, y: 7.3, color: "#D32F2F" },
      { x: 4.5, y: 2.3, color: "#D32F2F" },
      { x: 13.5, y: 8.7, color: "#FBC02D" },
      { x: 11.5, y: 13.7, color: "#FBC02D" },
      { x: 8.7, y: 2.5, color: "#1976D2" },
      { x: 13.7, y: 4.5, color: "#1976D2" },
      { x: 7.3, y: 13.5, color: "#388E3C" },
      { x: 2.3, y: 11.5, color: "#388E3C" },
    ];

    zones.forEach(({ x, y, color }) =>
      drawCircle(ctx, x, y, circleRadius, color, tileSize)
    );

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const isOuter = row === 0 || row === numRows - 1 || col === 0 || col === numCols - 1;
        if (isOuter) {
          fillTile(ctx, row, col, "#e2e8f0", tileSize);
          continue;
        }

        const zones: [number, number][][] = [redSafetyZone, yellowSafetyZone, blueSafetyZone, greenSafetyZone];
        const colors = ["#D32F2F", "#FBC02D", "#1976D2", "#388E3C"];

        zones.forEach((zone, i) => {
          if (zone.some(([r, c]) => r === row && c === col)) {
            fillTile(ctx, row, col, colors[i], tileSize);
          }
        });
      }
    }
  const stripConfigs = [
  { x: tileSize / 4, y: 2.5 * tileSize, width: tileSize / 2, height: 4 * tileSize, color: "#388E3C", direction: "down" },
  { x: tileSize / 4, y: 11.5 * tileSize, width: tileSize / 2, height: 3 * tileSize, color: "#388E3C", direction: "down" },

  { x: 15 * tileSize + tileSize / 4, y: 9.5 * tileSize, width: tileSize / 2, height: 4 * tileSize, color: "#1976D2", direction: "up" },
  { x: 15 * tileSize + tileSize / 4, y: 1.5 * tileSize, width: tileSize / 2, height: 3 * tileSize, color: "#1976D2", direction: "up" },

  { x: 8.5 * tileSize, y: tileSize / 4, width: tileSize / 2, height: 4 * tileSize, color: "#D32F2F", direction: "right" },
  { x: 1.5 * tileSize, y: tileSize / 4, width: tileSize / 2, height: 3 * tileSize, color: "#D32F2F", direction: "right" },

  { x: 11.5 * tileSize, y: 15 * tileSize + tileSize / 4, width: tileSize / 2, height: 3 * tileSize, color: "#FBC02D", direction: "left" },
  { x: 2.5 * tileSize, y: 15 * tileSize + tileSize / 4, width: tileSize / 2, height: 4 * tileSize, color: "#FBC02D", direction: "left" },
];

stripConfigs.forEach(cfg =>
  drawStripWithTriangleAndCircle(ctx, cfg.x, cfg.y, cfg.width, cfg.height, cfg.color, cfg.direction)
);

  };

  const drawAll = (color: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const angle = getRotationAngleForColor(color);

    // Save current state
    ctx.save();

    // Move origin to center, rotate, then move back
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw after rotation
    drawBoard(ctx, tileSize);
    const allPawns = players.flatMap(p =>
      p.pieces.map(piece => ({
        x: piece.x,
        y: piece.y,
        color: p.color,
        radius: piece.radius
      }))
    );

    drawPiecesWithOffset(ctx, allPawns);

    // Restore canvas state
    ctx.restore();
  };

  const applyGameState = (gameState: GameState) => {
    const newPlayers: Player[] = [];

    for (const color in gameState) {
      const coordStrings = gameState[color];
      const positions = coordStrings.map(coord => coordStringToPixel(coord, tileSize));
      newPlayers.push(new Player(color, positions));
    }

    setPlayers(newPlayers);
  };

  // Simulate fetching the gameState from backend
  useEffect(() => {
    const simulatedGameState: GameState = {
      red: [ "d_H", "d_H", "d_H", "d_H" ],
      blue: [ "a_H", "a_H", "a_H", "a_H"],
      green: ["c_H", "c_H", "c_H", "c_H"],
      yellow: ["b_H", "b_H", "b_H", "b_H" ]
    };

    applyGameState(simulatedGameState);
  }, []);

  useEffect(() => {
    drawAll("yellow");
  }, [players]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border-4 border-black"
      />
    </div>
  );
}


function drawPiecesWithOffset(ctx: CanvasRenderingContext2D, allPieces: { x: number, y: number, color: string, radius: number }[]) {
  const tileGroups: Record<string, { x: number, y: number, color: string, radius: number }[]> = {};

  for (const piece of allPieces) {
    const key = `${Math.round(piece.x)}_${Math.round(piece.y)}`;
    if (!tileGroups[key]) tileGroups[key] = [];
    tileGroups[key].push(piece);
  }

  const offsetDistance = tileSize * 0.5;

  for (const group of Object.values(tileGroups)) {
    const centerX = group[0].x;
    const centerY = group[0].y;
    let radius = group[0].radius

    group.forEach((piece, i) => {
      let offsetX = 0;
      let offsetY = 0;

      // Spread in a circular pattern if more than 1 piece
      if (group.length > 1) {
        const angle = (2 * Math.PI * i) / group.length;
        offsetX = Math.cos(angle) * offsetDistance;
        offsetY = Math.sin(angle) * offsetDistance;
      }

      ctx.beginPath();
      ctx.arc(centerX + offsetX, centerY + offsetY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = piece.color;
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.stroke();
    });
  }
}
