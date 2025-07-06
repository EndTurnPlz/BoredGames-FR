"use client";
import dynamic from "next/dynamic";

export default function GameBoardCenter({
  gameStarted,
  gameOver,
  GameComponent,
  gameType,
  playerColor,
  setGameOver,
  setPlayers,
  setGameStarted,
}: {
  gameStarted: boolean;
  gameOver: boolean;
  GameComponent: any;
  gameType: string | null;
  playerColor: string;
  setGameOver: (v: boolean) => void;
  setPlayers: (v: string[]) => void;
  setGameStarted: (v: boolean) => void;
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
        />
      </div>
    </div>
  );
}
