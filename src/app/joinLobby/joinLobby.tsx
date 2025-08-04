"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GET_JOIN } from "@/utils/config";
import Header from "@/components/Apologies/Header";

export default function JoinLobbyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameType = searchParams.get("game") || "unknown";
  const lobbyID = searchParams.get("lobbyId") || "unkown";

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleJoin = async () => {
    if (!username.trim() || username.length < 2) {
      setError("Please enter a valid username more than 1 character");
      return;
    }
    try {
      setIsTransitioning(true);
      const res = await fetch(GET_JOIN(lobbyID), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(username), // Note: not an object, just a GUID string
      });

      if (!res.ok) {
        setError("Failed to connect to server");
        setIsTransitioning(false);
        return;
      }

      const data = await res.json();
      setError("");
      const randomId = Math.random().toString(36).substring(2, 10);
      localStorage.setItem("userId" + randomId, data.playerId);
      setTimeout(() => {
        router.push(
          `/boardGame?game=${gameType}&username=${encodeURIComponent(
            username
          )}&randomId=${randomId}`
        );
      }, 500);
    } catch (err) {
      setIsTransitioning(false);
      console.error("Error contacting backend:", err);
      // Optionally show an error message
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow alphanumeric and underscores, remove everything else
    const raw = e.target.value;
    const sanitized = raw.replace(/[^a-zA-Z0-9_]/g, '') // limit to 20 characters
    setUsername(sanitized);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800">
      <Header />

      <main
        className={`flex flex-col items-center justify-start min-h-screen px-4 pt-24 pb-8 ${
          isTransitioning ? "blur-sm pointer-events-none" : ""
        }`}
      >
        {/* Join Lobby Card */}
        <div className="bg-slate-800/60 backdrop-blur-lg rounded-3xl shadow-2xl shadow-cyan-500/10 p-10 flex flex-col items-center w-full max-w-md space-y-8 border border-cyan-400/20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-cyan-100 mb-2">
              Join Lobby
            </h1>
            <p className="text-cyan-200/80">
              Game: <span className="font-bold">{gameType}</span>
            </p>
          </div>

          <div className="w-full flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => handleUsernameChange(e)}
              className="p-3 rounded-xl border-2 border-cyan-400/30 bg-slate-800/60 text-lg text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition placeholder-cyan-300/50"
              autoComplete="off"
            />
          </div>

          {error && (
            <p className="text-red-400 font-semibold text-center">{error}</p>
          )}

          <button
            onClick={handleJoin}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl text-lg shadow-lg hover:scale-105 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 border border-gray-600"
          >
            Join Game
          </button>
        </div>

        <footer className="mt-8 text-white/40 text-sm">
          &copy; {new Date().getFullYear()} BoredGames. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
