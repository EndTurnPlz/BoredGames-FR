// File: app/BoardGamePage.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Header from "@/components/Apologies/Header";
import GameSidebarLeft from "@/components/leftSidebar";
import GameBoardCenter from "@/components/gameCenter";
import GameSidebarRight from "@/components/rightSidebar";
import WaitingOverlays from "@/components/Apologies/WaitingOverlays";
import RulesModal from "@/components/rulesModal";
import GameOverOverlay from "@/components/Apologies/GameOverOverlay";

import { GET_START } from "@/utils/Apologies/config";
import { APOLOGIES, GET_LOBBY, indexToColor, UPSANDDOWNS, WARLOCKS } from "@/utils/config";
import UpAndDownBoard from "../gameBoards/upDownBoard";
import ApologiesBoard from "../gameBoards/sorryBoard";
import ApologiesGameOverOverlay from "@/components/Apologies/GameOverOverlay";
import UpsAndDownsGameOverOverlay from "@/components/UpsAndDowns/GameOverOverlay";
import WizardBoard from "../gameBoards/warlocksBoard";
import WarlocksGameOverOverlay from "@/components/Warlocks/Overlays/GameOverOverlay";

export type GameStats = {
  movesMade: number[];
  pawnsKilled: number[];
  gameTimeElapsed: number;
};

export default function BoardGamePageClient() {
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

  const [host, setHost] = useState("")

  const [gameStarted, setGameStarted] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [moveLog, setMoveLog] = useState<string[]>([]);
  const [gameStats, setGameStats] = useState<any>();
  const [winner, setWinner] = useState<string[]>([]);

  useEffect(() => {
    const playerId = localStorage.getItem("userId" + randomId) ?? "";
    setPlayerId(playerId);
    const lobbyId = localStorage.getItem("lobbyId") ?? "";
    if (lobbyId) {
      console.log()
      const link = GET_LOBBY(gameType ?? "", lobbyId);
      setShareLink(link);
    }
  }, [randomId]);

  useEffect(() => {
    setIsHost(username === host);
  }, [host, username]);

  const GameComponent =
    gameType === APOLOGIES
      ? ApologiesBoard
      : gameType === UPSANDDOWNS
      ? UpAndDownBoard
      : gameType === WARLOCKS ? 
        WizardBoard :
        () => <p>Unknown game type: {gameType}</p>;

  const GameOverlayComponent = 
     gameType === APOLOGIES
      ? ApologiesGameOverOverlay
      : gameType === UPSANDDOWNS
      ? UpsAndDownsGameOverOverlay
      : gameType === WARLOCKS ? WarlocksGameOverOverlay
      : () => <p>Unknown game type: {gameType}</p>;
      
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-950">
      <Header />
      <main className="flex h-screen pt-20 px-4 gap-4">
        <GameSidebarLeft
          gameType={gameType}
          username={username}
          shareLink={shareLink}
          copied={copied}
          setCopied={setCopied}
          gameStarted={true}
          setShowRules={setShowRules}
          handleStart={() => {}} 
          enoughPlayers={false} 
          isHost={false}
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
          setHost={setHost}
        />

        <GameSidebarRight
          players={players}
          hostName={host}
          moveLog={moveLog}
        />

        <RulesModal
          showRules={showRules}
          showCards={showCards}
          setShowRules={setShowRules}
          setShowCards={setShowCards}
          gameType={gameType ?? ""}
        />

        <GameOverlayComponent
          gameOver={gameOver}
          winner={winner}
          gameStats={gameStats}
          players={players}
          onRestart={() => {
            window.location.href = "/BoredGames-FR";
          }}
        />
      </main>
    </div>
  );
}
