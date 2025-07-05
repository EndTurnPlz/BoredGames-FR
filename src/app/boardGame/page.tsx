"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import BoardCanvas from "../components/BoardCanvas";
import {
  HiArrowRight,
  HiArrowLeft,
  HiShare,
  HiOutlineBookOpen,
} from "react-icons/hi";
import {
  API_STRING,
  START_GAME,
  JOIN_LOBBY,
  indexToColor,
} from "@/utils/config";
import Header from "@/components/Header";

export default function BoardGamePage() {
  const searchParams = useSearchParams();
  const gameType = searchParams.get("game");
  const username = searchParams.get("username");
  const randomId = searchParams.get("randomId");
  const [playerColor, setPlayerColor] = useState("");
  const [players, setPlayers] = useState([
    "Player 1",
    "Player 2",
    "Player 3",
    "Player 4",
  ]);
  const [gameStarted, setGameStarted] = useState(false);
  const [hostId, setHostId] = useState(-1);
  const [showRules, setShowRules] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState("");

  // Define components with display names
  const UnknownGameComponent = ({ gameType }: { gameType: string | null }) => (
    <p>Unknown game type: {gameType}</p>
  );
  UnknownGameComponent.displayName = "UnknownGameComponent";

  // Select the appropriate game component
  let GameComponent;
  switch (gameType) {
    case "Apologies":
      GameComponent = BoardCanvas;
      break;
    default:
      GameComponent = UnknownGameComponent;
  }

  const handleStart = async () => {
    try {
      const lobbyId = localStorage.getItem("lobbyId");
      const res = await fetch(API_STRING + "/" + playerId + START_GAME, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lobbyId), // Note: not an object, just a GUID string
      });

      if (!res.ok) {
        return;
      }

      // fake wait for 3s
      setGameStarted(true);
    } catch (err) {
      console.error("Error contacting backend:", err);
    }
  };

  useEffect(() => {
    const playerId = localStorage.getItem("userId" + randomId) ?? "";
    setPlayerId(playerId);
    const lobbyId = localStorage.getItem("lobbyId") ?? "";
    if (lobbyId) {
      const link = `${JOIN_LOBBY}${lobbyId}`;
      setShareLink(link);
    }
  }, [randomId]);

  useEffect(() => {
    const index = players.indexOf(username ?? "");
    setHostId(index);
    if (index != -1 && playerColor == "") {
      setPlayerColor(indexToColor[index]);
    }
  }, [players, playerColor, username]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800">
      <Header />

      <main className="flex h-screen pt-20 px-4 gap-4">
        {/* Left Sidebar - Game Info & Chat */}
        <div className="w-80 bg-slate-800/80 backdrop-blur-lg border-2 border-cyan-500/30 p-6 flex flex-col rounded-2xl shadow-lg shadow-cyan-900/20 my-2 z-90">
          {/* Game Title */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-cyan-100">{gameType}</h1>
              <button
                onClick={() => setShowRules(true)}
                className="px-3 py-2 bg-slate-700/80 hover:bg-slate-700/90 rounded-lg transition-colors duration-200 border border-cyan-400/30 shadow-sm flex items-center gap-2 text-sm"
                aria-label="Show game rules"
              >
                <HiOutlineBookOpen className="text-cyan-300 text-lg" />
                <span className="text-cyan-100 font-medium">Rules</span>
              </button>
            </div>
            <p className="text-cyan-200/80">Player: {username}</p>
          </div>

          {/* Share Game Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-cyan-100 mb-3 flex items-center gap-2">
              <HiShare className="w-5 h-5 text-cyan-300" />
              Share this game
            </h3>
            {shareLink && !gameStarted && (
              <div className="space-y-3">
                <div className="bg-slate-700/80 border border-cyan-400/40 p-3 rounded-xl text-sm shadow-inner">
                  <p className="text-cyan-200 break-all">{shareLink}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:scale-105 transition-all duration-200"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center Area - Game Board */}
        <div className="flex-1 flex items-center justify-center p-4 relative">
          <div
            className={`${
              !gameStarted || gameOver ? "pointer-events-none blur-sm" : ""
            }`}
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

        {/* Right Sidebar - Players & Rules */}
        <div className="w-80 bg-slate-800/80 backdrop-blur-lg border-2 border-cyan-500/30 p-6 flex flex-col rounded-2xl shadow-lg shadow-cyan-900/20 my-2 z-90">
          {/* Players Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-cyan-100 mb-3">
              Players
            </h3>
            <div className="space-y-3">
              {players.map((name, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700/80 border border-cyan-400/20 shadow-sm hover:bg-slate-700/90 transition-colors duration-200"
                >
                  <div
                    className="w-4 h-4 rounded-full shadow-sm border border-white/20"
                    style={{ backgroundColor: indexToColor[index] }}
                  ></div>
                  <span className="text-cyan-200 flex-1">{name}</span>
                  {index === 0 && (
                    <span className="text-xs bg-cyan-400/20 text-cyan-300 px-2 py-1 rounded-full">
                      Host
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Game Actions */}
          <div className="mt-auto space-y-3">
            {!gameStarted && hostId === 0 && players.length === 4 && (
              <button
                onClick={handleStart}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Start Game
              </button>
            )}
          </div>
        </div>

        {/* Overlay: Waiting for players */}
        {players.length != 4 && !gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events: none">
            <div className="bg-slate-800/90 backdrop-blur-lg border-2 border-cyan-500/30 p-8 rounded-3xl shadow-2xl shadow-cyan-500/20 text-white text-center space-y-4 max-w-lg">
              <p className="text-xl font-bold text-cyan-100">
                Waiting for 4 players to join...
              </p>
            </div>
          </div>
        )}

        {/* Overlay: Start button (host only) */}
        {players.length == 4 && !gameStarted && hostId == 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <div className="bg-slate-800/90 backdrop-blur-lg border-2 border-cyan-500/30 p-8 rounded-3xl shadow-2xl shadow-cyan-500/20 text-xl font-bold text-cyan-100 text-center space-y-4">
              <p>All players have joined!</p>
            </div>
          </div>
        )}

        {/* Overlay for non-hosts waiting */}
        {players.length == 4 && !gameStarted && hostId != 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <div className="bg-slate-800/90 backdrop-blur-lg border-2 border-cyan-500/30 p-8 rounded-3xl shadow-2xl shadow-cyan-500/20 text-xl font-bold text-cyan-100 text-center">
              Waiting for host to start the game...
            </div>
          </div>
        )}
        {(showRules || showCards) && (
          <div
            className="fixed inset-0 z-[1101] bg-transparent bg-opacity-30 flex items-center justify-center"
            onClick={() => {
              setShowRules(false);
              setShowCards(false);
            }}
          >
            <div
              className="relative bg-slate-800/95 text-white rounded-2xl p-6 shadow-2xl max-w-xl w-full border-2 border-cyan-500/40 max-h-[60vh] overflow-y-auto pr-2 backdrop-blur-md"
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
                  <h2 className="text-3xl font-bold mb-4 text-center flex items-center justify-center gap-2">
                    <HiOutlineBookOpen className="text-cyan-300 text-2xl" />
                    <span>Apologies! Game Rules</span>
                  </h2>
                  <div className="space-y-4 text-lg">
                    <p>
                      🎯 <strong>Objective:</strong> Be the first to move all
                      four of your pawns from Start to Home.
                    </p>
                    <p>
                      🃏 Draw cards to determine how many spaces to move your
                      pawns.
                    </p>
                    <p>
                      🚪 You can only move a pawn out of Start if you draw a 1
                      or 2.
                    </p>
                    <p>
                      ❗ If a pawn lands on another player&apos;s pawn, that
                      pawn is sent back to Start.
                    </p>
                    <p>
                      🚪 You can only enter the safety zone with an exact count.
                    </p>
                    <p>🙃 If you can&apos;t move, your turn is skipped.</p>
                  </div>
                </>
              )}
              {showCards && (
                <div>
                  <h2 className="text-3xl font-bold mb-4 text-center">
                    Card Effects
                  </h2>

                  <div className="flex justify-center">
                    <ul className="space-y-6 text-lg w-full max-w-md text-left">
                      {[1, 2, 3, 4, 5, 7, 8, 10, 11, 12, "APOLOGIES!"].map(
                        (num) => (
                          <li key={num}>
                            <div className="text-xl font-bold">{num}</div>
                            <div className="mt-1">
                              {
                                {
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
                                }[num]
                              }
                            </div>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 z-80 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-slate-800/90 backdrop-blur-lg border-2 border-cyan-500/30 rounded-3xl p-8 shadow-2xl shadow-cyan-500/20 max-w-md w-full text-center space-y-6">
              <h2 className="text-4xl font-bold text-cyan-100">Game Over</h2>
              <h2 className="text-4xl font-bold text-yellow-400">
                🏆 Rohit Won
              </h2>

              <div className="text-lg space-y-3 text-cyan-200 bg-slate-700/70 p-4 rounded-xl border border-cyan-400/30 shadow-inner">
                <p>
                  <strong className="text-cyan-100">Moves made:</strong> 42
                </p>
                <p>
                  <strong className="text-cyan-100">Pawns sent back:</strong> 3
                </p>
                <p>
                  <strong className="text-cyan-100">Time played:</strong> 12m
                  30s
                </p>
              </div>
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:scale-105 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                🔁 Play Again
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
