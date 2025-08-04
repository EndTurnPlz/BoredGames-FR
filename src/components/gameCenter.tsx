"use client";
import { GameStats } from "@/app/boardGame/boardGame";
import dynamic from "next/dynamic";

export default function GameBoardCenter({
  gameStarted,
  gameOver,
  GameComponent,
  gameType,
  playerColor,
  setGameOver,
  setPlayers,
  setWinner,
  setGameStarted,
  setMoveLog,
  setGameStats,
  setHost
}: {
  gameStarted: boolean;
  gameOver: boolean;
  GameComponent: any;
  gameType: string | null;
  playerColor: string;
  setGameOver: (v: boolean) => void;
  setWinner: (v: string) => void;
  setPlayers: (v: string[]) => void;
  setGameStarted: (v: boolean) => void;
  setMoveLog: (v: string[]) => void;
  setGameStats: (v: GameStats) => void;
  setHost: (v: string) => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-4 relative">
      <div
        className={`${!gameStarted || gameOver ? "pointer-events-none blur-sm" : ""}`}
      >
        <GameComponent
          gameType={gameType}
          playerColor={playerColor}
          setGameOver={setGameOver}
          setTurnOrder={setPlayers}
          setGameStarted={setGameStarted}
          setMoveLog={setMoveLog}
          setGameStats={setGameStats}
          setWinner={setWinner}
          setHost={setHost}
        />
      </div>
    </div>
  );
}
