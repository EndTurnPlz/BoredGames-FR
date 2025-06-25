"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import BoardCanvas from "../components/BoardCanvas";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { HiArrowRight, HiArrowLeft } from "react-icons/hi";



export default function BoardGamePage() {
  const searchParams = useSearchParams();
  const gameType = searchParams.get("game");
  const username = searchParams.get("username");
  const playerColor = searchParams.get("playercolor") ?? "red";

  const [allPlayersJoined, setAllPlayersJoined] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [hostName, setHostName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [hostId, setHostId] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [showCards, setShowCards] = useState(false);

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
      const storedId = localStorage.getItem("userId");
      setUserId(storedId);
      setHostId("99899910000")
    }, 3000); // fake wait for 3s
    return () => clearTimeout(timeout);
  }, []);

  return (
  <main className="relative min-h-screen bg-green-200 p-6 text-black">
    <div className="absolute top-4 right-4 z-60 pointer-events-auto">
      <button
        onClick={() => setShowRules(true)}
        aria-label="Game Rules"
        className="text-gray-700 hover:text-black text-3xl"
      >
        <HiOutlineInformationCircle />
      </button>
    </div>

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
    {allPlayersJoined && !gameStarted && (userId == hostId) && (
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
    {allPlayersJoined && !gameStarted  && (userId != hostId) && (
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <div className="bg-white bg-opacity-80 p-8 rounded-xl shadow-xl text-xl font-bold text-black">
          Waiting for host to start the game...
        </div>
      </div>
    )}
{(showRules || showCards) && (
  <div
    className="fixed inset-0 z-50 bg-transparent bg-opacity-30 flex items-center justify-center"
    onClick={() => {
      setShowRules(false);
      setShowCards(false);
    }}
  >
    <div
      className="relative bg-black text-white rounded-xl p-6 shadow-2xl max-w-xl w-full border border-white"
      onClick={(e) => e.stopPropagation()} // prevent click from closing modal
    >
      {/* Close Button (X) */}
      {/* Left Arrow (only if showing cards) */}
      {showCards && (
        <button
          onClick={() => {
            setShowCards(false);
            setShowRules(true);
          }}
          className="flex justify-center space-x-8 mb-4"
          aria-label="Show Rules"
        >
        <div className="flex items-center space-x-2">
          <HiArrowLeft />
          <span>Show Rules</span>
        </div>
        </button>
      )}

      {/* Right Arrow (only if showing rules) */}
      {showRules && (
        <div className="w-full flex justify-end mb-4">
          <button
            onClick={() => {
              setShowRules(false);
              setShowCards(true);
            }}
            className="flex items-center space-x-2"
            aria-label="Show Cards"
          >
            <span>Show Cards</span>
            <HiArrowRight />
          </button>
        </div>
      )}

      {showRules && (
        <>
          <h2 className="text-3xl font-bold mb-4 text-center">Apologies! Game Rules</h2>
          <div className="space-y-4 text-lg">
            <p>🎯 <strong>Objective:</strong> Be the first to move all four of your pawns from Start to Home.</p>
            <p>🃏 Draw cards to determine how many spaces to move your pawns.</p>
            <p>❗ If a pawn lands on another player's pawn, that pawn is sent back to Start.</p>
            <p>🚪 You can only enter the safety zone with an exact count.</p>
            <p>🙃 If you can't move, your turn is skipped.</p>
          </div>
        </>
      )}
      {showCards && (
      <div>
      <h2 className="text-3xl font-bold mb-4 text-center">Card Effects</h2>

      <ul className="space-y-3 text-lg list-disc list-inside">
        <li><strong>1:</strong> Move forward 1 space</li>
        <li><strong>2:</strong> Move forward 2 spaces and draw again</li>
        <li><strong>3:</strong> Move forward 3 spaces</li>
        <li><strong>4:</strong> Move backward 4 spaces</li>
        <li><strong>5:</strong> Move forward 5 spaces</li>
        <li><strong>7:</strong> Split move between up to two pawns totaling 7 spaces</li>
        <li><strong>8:</strong> Move forward 8 spaces</li>
        <li><strong>10:</strong> Move forward 10 spaces or backward 1 space</li>
        <li><strong>11:</strong> Swap places with an opponent's pawn</li>
        <li><strong>12:</strong> Move forward 12 spaces</li>
      </ul>
    </div>
      )}
    </div>
  </div>
)}


  </main>
);

}
