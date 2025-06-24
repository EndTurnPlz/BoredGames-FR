"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [gameType, setGameType] = useState("Apologies");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleStart = () => {
    console.log("sending to backend ...");
    setIsTransitioning(true);
    setTimeout(() => {
      router.push(`/joinLobby?game=${gameType}`);
    }, 500);
  };

  return (
    <main
      className={`flex flex-col items-center justify-center min-h-screen bg-green-100 space-y-6 text-black transition-all duration-500 ${
        isTransitioning ? "blur-sm pointer-events-none" : ""
      }`}
    >
      <h1 className="text-4xl font-bold">Choose a Game</h1>

      <select
        value={gameType}
        onChange={(e) => setGameType(e.target.value)}
        className="p-3 rounded-lg border border-gray-300 text-lg text-black"
      >
        <option value="Apologies">Apologies</option>
        <option value="Whitejack">Whitejack</option>
      </select>

      <button
        onClick={handleStart}
        className="px-6 py-3 bg-green-600 text-white rounded-xl text-lg hover:bg-green-700 transition"
      >
        Start Game
      </button>
    </main>
  );
}
