"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import BoardCanvas from "../components/BoardCanvas";

export default function BoardGamePage() {
  const searchParams = useSearchParams();
  const gameType = searchParams.get("game");
  const username = searchParams.get("username");
  const playerColor = searchParams.get("playercolor") ?? "red";

  const [allPlayersJoined, setAllPlayersJoined] = useState(false); // initially false

  let GameCanvas;

  switch (gameType) {
    case "Apologies":
      GameCanvas = BoardCanvas;
      break;
    case "blackjack":
      GameCanvas = () => <p>Unknown game type: {gameType}</p>;
      break;
    default:
      GameCanvas = () => <p>Unknown game type: {gameType}</p>;
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAllPlayersJoined(true);
    }, 3000); // fake wait for 3s
    return () => clearTimeout(timeout);
  }, []);

  return (
    <main className="relative min-h-screen bg-green-200 p-6 text-black">
      <h1 className="text-2xl font-semibold mb-4">
        {gameType} — Player: {username}
      </h1>

      {/* Wrapper to allow blurring */}
      <div className={`relative ${!allPlayersJoined ? "pointer-events-none blur-sm" : ""}`}>
        <BoardCanvas
          gameType={gameType}
          username={username}
          playerColor={playerColor}
          allPlayersJoined={allPlayersJoined}
        />
      </div>

      {!allPlayersJoined && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-80 p-8 rounded-xl shadow-xl text-xl font-bold text-black">
            Waiting for all players to join...
          </div>
        </div>
      )}
    </main>
  );
}
