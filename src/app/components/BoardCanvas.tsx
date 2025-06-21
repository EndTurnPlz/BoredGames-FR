"use client";
import { useEffect, useRef, useState } from "react";
import { Player } from "./Player"; // assumes Player has a draw(ctx) method
import { outerPath } from "@/utils/outerPath";

const canvasWidth = 800;
const canvasHeight = 800;
const tileSize = canvasWidth / 16;

type GameState = {
  [color: string]: { x: number; y: number }[];
};

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [players, setPlayers] = useState<Player[]>([]);
const drawBoard = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  const circleRadius = 1.4 * tileSize
  const numCols = canvasWidth / tileSize;
  const numRows = canvasHeight / tileSize;
  const redSafetyZone = [[1,2], [2,2], [3,2], [4,2]]
  const yellowSafetyZone = [[14,13], [13,13], [12,13], [11,13]]
  const blueSafetyZone = [[2,14], [2,13], [2,12], [2,11]]
  const greenSafetyZone = [[13,1], [13,2], [13,3], [13, 4]]
  ctx.beginPath();
  ctx.arc(tileSize * 2.5, tileSize * 6.3, circleRadius, 0, 2 * Math.PI); // (x, y, radius, startAngle, endAngle)
  ctx.fillStyle = "#D32F2F"; // choose your color
  ctx.fill();
  ctx.stroke()

  ctx.beginPath();
  ctx.arc(tileSize * 4.5, tileSize * 2.3, circleRadius, 0, 2 * Math.PI); // (x, y, radius, startAngle, endAngle)
  ctx.fillStyle = "#D32F2F"; // choose your color
  ctx.fill();
  ctx.stroke()

  ctx.beginPath();
  ctx.arc(tileSize * 13.5, tileSize * 9.7, circleRadius, 0, 2 * Math.PI); // (x, y, radius, startAngle, endAngle)
  ctx.fillStyle = "#FBC02D"; // choose your color
  ctx.fill();
  ctx.stroke()

  ctx.beginPath();
  ctx.arc(tileSize * 11.5, tileSize * 13.7, circleRadius, 0, 2 * Math.PI); // (x, y, radius, startAngle, endAngle)
  ctx.fillStyle = "#FBC02D"; // choose your color
  ctx.fill();
  ctx.stroke()

  ctx.beginPath();
  ctx.arc(tileSize * 9.7, tileSize * 2.5, circleRadius, 0, 2 * Math.PI); // (x, y, radius, startAngle, endAngle)
  ctx.fillStyle = "#1976D2"; // choose your color
  ctx.fill();
  ctx.stroke()

  ctx.beginPath();
  ctx.arc(tileSize * 13.7, tileSize * 4.5, circleRadius, 0, 2 * Math.PI); // (x, y, radius, startAngle, endAngle)
  ctx.fillStyle = "#1976D2"; // choose your color
  ctx.fill();
  ctx.stroke()

  ctx.beginPath();
  ctx.arc(tileSize * 6.3, tileSize * 13.5, circleRadius, 0, 2 * Math.PI); // (x, y, radius, startAngle, endAngle)
  ctx.fillStyle = "#388E3C"; // choose your color
  ctx.fill();
  ctx.stroke()

  ctx.beginPath();
  ctx.arc(tileSize * 2.3, tileSize * 11.5, circleRadius, 0, 2 * Math.PI); // (x, y, radius, startAngle, endAngle)
  ctx.fillStyle = "#388E3C"; // choose your color
  ctx.fill();
  ctx.stroke()
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const isOuterRow = row === 0 || row === numRows - 1;
      const isOuterCol = col === 0 || col === numCols - 1;

      if (isOuterRow || isOuterCol) {
        ctx.fillStyle = "#e2e8f0"; // light gray fill
        ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }

      if (redSafetyZone.some(([r, c]) => r === row && c === col)) {
        ctx.fillStyle = "#D32F2F";
        ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }

      if (yellowSafetyZone.some(([r, c]) => r === row && c === col)) {
        ctx.fillStyle = "#FBC02D"; 
        ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }

      if (blueSafetyZone.some(([r, c]) => r === row && c === col)) {
        ctx.fillStyle = "#1976D2"; 
        ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }

      if (greenSafetyZone.some(([r, c]) => r === row && c === col)) {
        ctx.fillStyle = "#388E3C"; 
        ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }

      // Draw the grid line
    }
  }
};

  const drawAll = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    drawBoard(ctx);
    players.forEach(p => p.draw(ctx));
  };

  const applyGameState = (gameState: GameState) => {
    const newPlayers: Player[] = [];

    for (const color in gameState) {
      const positions = gameState[color];
      newPlayers.push(new Player(color, positions));
    }

    setPlayers(newPlayers);
  };

  // Simulate fetching the gameState from backend
  useEffect(() => {
    const simulatedGameState: GameState = {
      red: [ { x: 7 * tileSize, y: 3 * tileSize }, { x: 7 * tileSize, y: 4 * tileSize } ],
      blue: [ { x: 1 * tileSize, y: 1 * tileSize } ],
      green: [ { x: 13 * tileSize, y: 13 * tileSize } ],
      yellow: [ { x: 14 * tileSize, y: 2 * tileSize } ]
    };

    applyGameState(simulatedGameState);
  }, []);

  useEffect(() => {
    drawAll();
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
