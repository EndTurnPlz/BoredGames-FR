"use client";

import { GameStats } from "@/app/boardGame/boardGame";

export default function UpsAndDownsGameOverOverlay({
  gameOver,
  winner,
  gameStats,
  players,
  onRestart,
}: {
  gameOver: boolean;
  winner: string;
  gameStats: GameStats | undefined;
  players: string[]
  onRestart: () => void;
}) {
  if (!gameOver) return;
  return (
    <div className="absolute inset-0 z-80 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-slate-800/90 backdrop-blur-lg border-2 border-cyan-500/30 rounded-3xl p-8 shadow-2xl shadow-cyan-500/20 max-w-xl w-full text-center space-y-6">
        <h2 className="text-4xl font-bold text-cyan-100">Game Over</h2>
        <h2 className="text-4xl font-bold text-yellow-400">🏆 {winner} Won</h2>

        <button
          onClick={onRestart}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:scale-105 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
        >
          🔁 Play Again
        </button>
      </div>
    </div>
  );
}
