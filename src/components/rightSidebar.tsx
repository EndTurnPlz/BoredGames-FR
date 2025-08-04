// File: components/GameSidebarRight.tsx
"use client";
import { indexToColor } from "@/utils/config";
import MoveLog from "./Apologies/moveLog";

export default function GameSidebarRight({
  players,
  gameStarted,
  isHost,
  hostName,
  handleStart,
  enoughPlayers,
  moveLog = [],
}: {
  players: string[];
  gameStarted: boolean;
  isHost: boolean;
  hostName: string;
  handleStart: () => void;
  enoughPlayers: (length: number) => boolean;
  moveLog?: string[];
}) {
  return (
    <div className="w-80 bg-slate-800/80 backdrop-blur-lg border-2 border-cyan-500/30 p-6 flex flex-col rounded-2xl shadow-lg shadow-cyan-900/20 my-2 z-90">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-cyan-100 mb-3">Players</h3>
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
              {name == hostName && (
                <span className="text-xs bg-cyan-400/20 text-cyan-300 px-2 py-1 rounded-full">
                  Host
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <MoveLog moveLog={moveLog} />
      <div className="mt-auto space-y-3">
        {!gameStarted && isHost && enoughPlayers(players.length) && (
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
