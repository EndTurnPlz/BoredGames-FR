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
  let playerColor = "blue"
  let userId = "99899910000"

  const handleJoin = () => {
    if (!username.trim() || username.length < 4) {
      setError("Please enter a valid username more than 3 characters");
      return;
    }

    setIsTransitioning(true);

    setTimeout(() => {

      localStorage.setItem("userId", userId);
      router.push(
        `/boardGame?game=${gameType}&username=${encodeURIComponent(username)}&playercolor=${playerColor}`
      );
    }, 500);
  };

  return (
    <main
      className={`flex flex-col items-center justify-center min-h-screen bg-black-100 space-y-6 text-white p-6 transition-all duration-500 ${
        isTransitioning ? "blur-sm pointer-events-none" : ""
      }`}
    >
      <h1 className="text-3xl font-bold">Join Lobby: {gameType}</h1>

      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="p-3 rounded-lg border border-white-300 text-lg w-64"
      />
      {error && <p className="text-red-600">{error}</p>}

      <button
        onClick={handleJoin}
        className="px-6 py-3 bg-black-600 text-white rounded-xl text-lg hover:bg-black-700 transition border border-white-400"
      >
        Join Game
      </button>
    </main>
  );
}
