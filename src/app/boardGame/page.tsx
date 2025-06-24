"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import BoardCanvas from "../components/BoardCanvas";

export default function BoardGamePage() {
  const searchParams = useSearchParams();
  const gameType = searchParams.get("game");
  const username = searchParams.get("username");
  const playerColor = searchParams.get("playercolor") ?? "red";

  const [allPlayersJoined, setAllPlayersJoined] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [hostName, setHostName] = useState("");

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
      setHostName("Rohit")
    }, 3000); // fake wait for 3s
    return () => clearTimeout(timeout);
  }, []);

  return (
  <main className="relative min-h-screen bg-green-200 p-6 text-black">
    <h1 className="text-2xl font-semibold mb-4">
      {gameType} — Player: {username}
    </h1>

    {/* Game board */}
    <div className={`relative ${!gameStarted ? "pointer-events-none blur-sm" : ""}`}>
      <BoardCanvas
        gameType={gameType}
        username={username}
        playerColor={playerColor}
        allPlayersJoined={allPlayersJoined}
      />
    </div>

    {/* Overlay: Waiting for players */}
    {!allPlayersJoined && (
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <div className="bg-white bg-opacity-80 p-8 rounded-xl shadow-xl text-xl font-bold text-black">
          Waiting for 4 players to join...
        </div>
      </div>
    )}

    {/* Overlay: Start button (host only) */}
    {allPlayersJoined && !gameStarted && (hostName == username) && (
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <div className="bg-white bg-opacity-80 p-8 rounded-xl shadow-xl text-xl font-bold text-black text-center">
          <p className="mb-4">All players have joined!</p>
          <button
            onClick={() => setGameStarted(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700"
          >
            Start Game
          </button>
        </div>
      </div>
    )}

    {/* Overlay for non-hosts waiting */}
    {allPlayersJoined && !gameStarted  && (hostName != username) && (
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <div className="bg-white bg-opacity-80 p-8 rounded-xl shadow-xl text-xl font-bold text-black">
          Waiting for host to start the game...
        </div>
      </div>
    )}
  </main>
);

}
