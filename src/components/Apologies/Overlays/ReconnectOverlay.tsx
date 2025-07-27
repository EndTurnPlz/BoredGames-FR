"use client";

export default function ReconnectOverlay({
  playerConnectivity,
  players,
}: {
  playerConnectivity: boolean[];
  players: string[];
}) {
  const disconnectedPlayers = players.filter(
    (_, idx) => playerConnectivity[idx] === false
  );

  if (disconnectedPlayers.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className="text-white text-xl bg-slate-800 p-6 rounded-2xl border border-cyan-300 shadow-lg space-y-2 text-center">
        <p>
          Waiting for player{disconnectedPlayers.length > 1 ? "s" : ""} to
          reconnect:
        </p>
        <ul className="font-semibold text-cyan-300">
          {disconnectedPlayers.map((name, i) => (
            <li key={i}>{name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
