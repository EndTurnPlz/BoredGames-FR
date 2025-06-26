"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_STRING, CREATE_GAME } from "@/utils/config";

export default function Home() {
  const router = useRouter();
  const [gameType, setGameType] = useState("Apologies");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState("")

  const handleStart = async () => {
    console.log("Sending to backend...");

    try {
      setIsTransitioning(true);
      const res = await fetch(API_STRING + CREATE_GAME, {
        method: "PUT",
      });

      if (!res.ok) {
        setError("Failed to connect to server");
        setIsTransitioning(false);
        return;
      }

      const response = await res.json();
      localStorage.setItem("userId", response.playerId);
      localStorage.setItem("lobbyId", response.lobbyId);

      // Only after successful response
      setTimeout(() => {
        router.push(`/joinLobby?game=${gameType}`);
      }, 500);
    } catch (err) {
      setIsTransitioning(false);
      console.error("Error contacting backend:", err);
      // Optionally show an error message
    }
  };


  return (
    <main
      className={`flex flex-col items-center justify-center min-h-screen bg-black-100 space-y-6 text-black ${
        isTransitioning ? "blur-sm pointer-events-none" : ""
      }`}
    >
      <h1 className="text-4xl font-bold text-white">Choose a Game</h1>

      <select
        value={gameType}
        onChange={(e) => setGameType(e.target.value)}
        className="p-3 rounded-lg border border-white-300 text-lg text-white"
      >
        <option value="Apologies">Apologies</option>
        <option value="Whitejack">Whitejack</option>
      </select>
      {error && <p className="text-red-600">{error}</p>}
      <button
        onClick={handleStart}
        className="px-6 py-3 bg-black-600 text-white rounded-xl text-lg hover:bg-black-700 border border-white-400 transition"
      >
        Start Game
      </button>
    </main>
  );
}
