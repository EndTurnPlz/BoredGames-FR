"use client";

export default function GameOverOverlay({
  gameOver,
  onRestart,
}: {
  gameOver: boolean;
  onRestart: () => void;
}) {
  if (!gameOver) return null;

  return (
    <div className="absolute inset-0 z-80 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-slate-800/90 backdrop-blur-lg border-2 border-cyan-500/30 rounded-3xl p-8 shadow-2xl shadow-cyan-500/20 max-w-md w-full text-center space-y-6">
        <h2 className="text-4xl font-bold text-cyan-100">Game Over</h2>
        <h2 className="text-4xl font-bold text-yellow-400">🏆 Rohit Won</h2>

        <div className="text-lg space-y-3 text-cyan-200 bg-slate-700/70 p-4 rounded-xl border border-cyan-400/30 shadow-inner">
          <p>
            <strong className="text-cyan-100">Moves made:</strong> 42
          </p>
          <p>
            <strong className="text-cyan-100">Pawns sent back:</strong> 3
          </p>
          <p>
            <strong className="text-cyan-100">Time played:</strong> 12m 30s
          </p>
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
