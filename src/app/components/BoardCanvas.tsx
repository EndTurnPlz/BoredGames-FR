"use client";
import { useEffect, useRef, useState } from "react";
import { Player } from "./Player"; // assumes Player has a draw(ctx) method
import { outerPath } from "@/utils/outerPath";

const canvasWidth = 600;
const canvasHeight = 600;
const tileSize = canvasWidth / 16;

type GameState = {
  [color: string]: { x: number; y: number }[];
};

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  const drawBoard = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw outer grid
    ctx.strokeStyle = "#000";
    for (let x = 0; x <= canvasWidth; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= canvasHeight; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // You can also draw special zones or paths here
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
