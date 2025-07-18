// File: app/BoardGamePage.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import GameSidebarLeft from "@/components/leftSidebar";
import GameBoardCenter from "@/components/gameCenter";
import GameSidebarRight from "@/components/rightSidebar";
import WaitingOverlays from "@/components/WaitingOverlays";
import RulesModal from "@/components/rulesModal";
import GameOverOverlay from "@/components/GameOverOverlay";

import BoardCanvas from "../gameBoards/sorryBoard";
import {
  API_STRING,
  START_GAME,
  JOIN_LOBBY,
  indexToColor,
} from "@/utils/config";

export type GameStats = {
  movesMade: number[];
  pawnsKilled: number[];
  gameTimeElapsed: number;
};

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
  const [moveLog, setMoveLog] = useState<string[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>();
  const [winner, setWinner] = useState<string>("");

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

  const handleStart = async () => {
    try {
      const lobbyId = localStorage.getItem("lobbyId");
      const res = await fetch(API_STRING + "/" + playerId + START_GAME, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lobbyId),
      });

      if (!res.ok) return;
      setGameStarted(true);
    } catch (err) {
      console.error("Error contacting backend:", err);
    }
  };

  const GameComponent =
    gameType === "Apologies"
      ? BoardCanvas
      : () => <p>Unknown game type: {gameType}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-blue-800 to-slate-600">
      <Header />
      <main className="flex h-screen pt-20 px-4 gap-4">
        <GameSidebarLeft
          gameType={gameType}
          username={username}
          shareLink={shareLink}
          copied={copied}
          setCopied={setCopied}
          gameStarted={gameStarted}
          setShowRules={setShowRules}
        />

        <GameBoardCenter
          gameStarted={gameStarted}
          gameOver={gameOver}
          GameComponent={GameComponent}
          gameType={gameType}
          playerColor={playerColor}
          setGameOver={setGameOver}
          setWinner={setWinner}
          setPlayers={setPlayers}
          setGameStarted={setGameStarted}
          setMoveLog={setMoveLog}
          setGameStats={setGameStats}
        />

        <GameSidebarRight
          players={players}
          gameStarted={gameStarted}
          hostId={hostId}
          handleStart={handleStart}
          moveLog={moveLog}
        />

        <WaitingOverlays
          players={players}
          gameStarted={gameStarted}
          hostId={hostId}
        />

        <RulesModal
          showRules={showRules}
          showCards={showCards}
          setShowRules={setShowRules}
          setShowCards={setShowCards}
        />

        <GameOverOverlay
          gameOver={gameOver}
          winner={winner}
          gameStats={gameStats}
          players={players}
          onRestart={() => {
            window.location.href = "/";
          }}
        />
      </main>
    </div>
  );
}
