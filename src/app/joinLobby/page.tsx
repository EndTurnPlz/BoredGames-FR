"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function JoinLobby() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameType = searchParams.get("game") || "unknown";

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleJoin = () => {
    if (!username.trim() || username.length < 4) {
      setError("Please enter a valid username more than 3 characters");
      return;
    }

    setIsTransitioning(true);

    setTimeout(() => {
      router.push(
        `/boardGame?game=${gameType}&username=${encodeURIComponent(username)}`
      );
    }, 500);
  };

  return (
    <main
      className={`flex flex-col items-center justify-center min-h-screen bg-green-100 space-y-6 text-black p-6 transition-all duration-500 ${
        isTransitioning ? "blur-sm pointer-events-none" : ""
      }`}
    >
      <h1 className="text-3xl font-bold">Join Lobby: {gameType}</h1>

      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="p-3 rounded-lg border border-gray-300 text-lg w-64"
      />
      {error && <p className="text-red-600">{error}</p>}

      <button
        onClick={handleJoin}
        className="px-6 py-3 bg-green-600 text-white rounded-xl text-lg hover:bg-green-700 transition"
      >
        Join Game
      </button>
    </main>
  );
}
