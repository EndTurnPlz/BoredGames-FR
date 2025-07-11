"use client";

import { GameStats } from "@/app/boardGame/page";

export default function GameOverOverlay({
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
  if (!gameOver || !gameStats) return null;
  console.log(winner, gameStats)
  const { movesMade, pawnsKilled, gameTimeElapsed } = gameStats;

  const formatTicks = (ticks: number): string => {
    console.log(gameTimeElapsed, gameStats)
    const totalSeconds = Math.floor(ticks / 10_000_000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const playerColors = ["Red", "Blue", "Green", "Yellow"];
  
  return (
    <div className="absolute inset-0 z-80 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-slate-800/90 backdrop-blur-lg border-2 border-cyan-500/30 rounded-3xl p-8 shadow-2xl shadow-cyan-500/20 max-w-xl w-full text-center space-y-6">
        <h2 className="text-4xl font-bold text-cyan-100">Game Over</h2>
        <h2 className="text-4xl font-bold text-yellow-400">🏆 {winner} Won</h2>

        <div className="text-lg text-cyan-200 bg-slate-700/70 p-4 rounded-xl border border-cyan-400/30 shadow-inner space-y-4">
          <p>
            <strong className="text-cyan-100">Time played:</strong>{" "}
            {formatTicks(gameTimeElapsed)}
          </p>

          <table className="w-full table-auto text-left border-collapse">
            <thead>
              <tr className="text-cyan-300">
                <th className="px-2 py-1">Player</th>
                <th className="px-2 py-1">Moves Made</th>
                <th className="px-2 py-1">Pawns Sent Back</th>
              </tr>
            </thead>
            <tbody>
              {playerColors.map((color, idx) => (
                <tr key={idx} className="text-cyan-100 even:bg-slate-600/30">
                  <td className="px-2 py-1">{players[idx]}</td>
                  <td className="px-2 py-1">{movesMade[idx]}</td>
                  <td className="px-2 py-1">{pawnsKilled[idx]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
