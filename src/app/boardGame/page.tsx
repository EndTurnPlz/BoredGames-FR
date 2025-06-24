"use client";

import { useSearchParams } from "next/navigation";
import BoardCanvas from "../components/BoardCanvas";

export default function BoardGamePage() {
  const searchParams = useSearchParams();
  const gameType = searchParams.get("game");
  const username = searchParams.get("username");

  let GameCanvas;

  switch (gameType) {
    case "Apologies":
      GameCanvas = BoardCanvas;
      break;
    case "blackjack":
      GameCanvas =  () => <p>Unknown game type: {gameType}</p>;
      break;
    default:
      GameCanvas = () => <p>Unknown game type: {gameType}</p>;
  }

  return (
    <main className="min-h-screen bg-green-200 p-6 text-black">
      <h1 className="text-2xl font-semibold mb-4">
        {gameType} — Player: {username}
      </h1>
      <GameCanvas gameType={gameType} username={username} />
    </main>
  );
}
