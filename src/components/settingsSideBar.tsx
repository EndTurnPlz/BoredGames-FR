// File: components/GameSidebarRight.tsx
"use client";
import { indexToColor } from "@/utils/config";
import MoveLog from "./Apologies/moveLog";

export default function GameSidebarRight({
  enoughPlayers,
  isHost,
  handleStart,
}: {
   enoughPlayers: boolean;
  isHost: boolean;
  handleStart: () => void;
}) {
  return (
    <div className="w-80 bg-slate-800/80 backdrop-blur-lg border-2 border-cyan-500/30 p-6 flex flex-col rounded-2xl shadow-lg shadow-cyan-900/20 my-2 z-90">
      <div className="mb-6">

      </div>
      <div className="mt-auto space-y-3">
        {isHost && enoughPlayers && (
          <button
            onClick={handleStart}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Start Game
          </button>
        )}
      </div>
    </div>
  );
}
