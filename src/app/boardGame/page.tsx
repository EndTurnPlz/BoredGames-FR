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
  const [gameOver, setGameOver] = useState(false);
  let didWin = false
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
  
  useEffect(() => {
    console.log(gameOver)
  }, [gameOver]);

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
    <div className={`relative ${(!gameStarted || gameOver) ? "pointer-events-none blur-sm" : ""}`}>
      <BoardCanvas
        gameType={gameType}
        username={username}
        playerColor={playerColor}
        allPlayersJoined={allPlayersJoined}
        setGameOver={setGameOver}
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
      className="relative bg-black text-white rounded-xl p-6 shadow-2xl max-w-xl w-full border border-white max-h-[50vh] overflow-y-auto pr-2"
      onClick={(e) => e.stopPropagation()}
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
            <p>🚪 You can only move a pawn out of Start if you draw a 1 or 2.</p>
            <p>❗ If a pawn lands on another player's pawn, that pawn is sent back to Start.</p>
            <p>🚪 You can only enter the safety zone with an exact count.</p>
            <p>🙃 If you can't move, your turn is skipped.</p>
          </div>
        </>
      )}
    {showCards && (
      <div>
        <h2 className="text-3xl font-bold mb-4 text-center">Card Effects</h2>

        <div className="flex justify-center">
          <ul className="space-y-6 text-lg w-full max-w-md text-left">
            {[1, 2, 3, 4, 5, 7, 8, 10, 11, 12, "APOLOGIES!"].map((num) => (
              <li key={num}>
                <div className="text-xl font-bold">{num}</div>
                <div className="mt-1">
                  {{
                    1: "Move forward 1 space",
                    2: "Move forward 2 spaces and draw again",
                    3: "Move forward 3 spaces",
                    4: "Move backward 4 spaces",
                    5: "Move forward 5 spaces",
                    7: "Split move between up to two pawns totaling 7 spaces",
                    8: "Move forward 8 spaces",
                    10: "Move forward 10 spaces or backward 1 space",
                    11: "Move one pawn forward 11 places or swap any one of your pawns with an opponent's pawn",
                    12: "Move forward 12 spaces",
                    "APOLOGIES!":
                      "Take one pawn from Start and swap it with any opponent's pawn on the board, sending that pawn back to Start.",
                  }[num]}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )}
    </div>
  </div>
)}

 {gameOver && (
      <div className="absolute inset-0 z-80 bg-clear bg-opacity-80 flex items-center justify-center">
        <div className="bg-black text-black rounded-xl p-8 shadow-2xl max-w-md w-full text-center space-y-6 text-white">
          <h2 className="text-4xl font-bold">Game Over</h2>
          <h2 className="text-4xl font-bold">🏆 Rohit Won</h2>

          <div className="text-lg space-y-2">
            <p><strong>Moves made:</strong> 42</p>
            <p><strong>Pawns sent back:</strong> 3</p>
            <p><strong>Time played:</strong> 12m 30s</p>
          </div>
          <button
            onClick={() => {
              window.location.href = "/lobby"; 
            }}
            className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            🔁 Play Again
          </button>
        </div>
      </div>
    )}


  </main>
);

}
