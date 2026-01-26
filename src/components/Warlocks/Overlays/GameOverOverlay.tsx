export default function WarlocksGameOverOverlay({
  gameOver,
  winner,
  gameStats,
  players,
  onRestart,
}: {
  gameOver: boolean;
  winner: string[];
  gameStats: number[];
  players: string[];
  onRestart: () => void;
}) {
  if (!gameOver) return null;

  // Combine players + points
  const playerData = players.map((player, i) => ({
    player,
    points: gameStats[i],
  }));

  // Sort by points (descending)
  playerData.sort((a, b) => b.points - a.points);

  // Group players by points
  const grouped: { points: number; players: { player: string; points: number }[] }[] = [];
  playerData.forEach((entry) => {
    const group = grouped.find((g) => g.points === entry.points);
    if (group) {
      group.players.push(entry);
    } else {
      grouped.push({ points: entry.points, players: [entry] });
    }
  });

  // Assign placements
  let currentPlace = 1;
  const rows: { place: string; player: string; points: number }[] = [];
  for (const group of grouped) {
    const prefix = group.players.length > 1 ? `t` : ``;
    for (const p of group.players) {
      rows.push({
        place: `${prefix}${currentPlace}`,
        player: p.player,
        points: p.points,
      });
    }
    currentPlace += group.players.length;
  }

  return (
    <div className="absolute inset-0 z-80 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-slate-800/90 backdrop-blur-lg border-2 border-cyan-500/30 rounded-3xl p-8 shadow-2xl shadow-cyan-500/20 max-w-xl w-full text-center space-y-6">
        <h2 className="text-4xl font-bold text-cyan-100">Game Over</h2>

        <table className="w-full text-lg text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-cyan-300">
              <th className="px-4 py-2">Place</th>
              <th className="px-4 py-2">Player</th>
              <th className="px-4 py-2">Points</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.player}
                className={`rounded-xl ${
                  winner.includes(row.player)
                    ? "bg-yellow-500/30 font-bold text-yellow-300"
                    : "bg-slate-700/50 text-cyan-100"
                }`}
              >
                <td className="px-4 py-2">{row.place}</td>
                <td className="px-4 py-2">{row.player}</td>
                <td className="px-4 py-2">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>

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
