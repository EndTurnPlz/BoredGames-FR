// File: components/WaitingOverlays.tsx
"use client";

export default function WaitingOverlays({
  players,
  enoughPlayers,
  gameStarted,
  isHost,
}: {
  players: string[];
  enoughPlayers: ((length: number) => boolean)
  gameStarted: boolean;
  isHost: boolean;
}) {
  const allJoined = enoughPlayers(players.length);

  if (allJoined && gameStarted) return null;

  return (
    <>
      {/* Waiting for more players */}
      {!allJoined && !gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-slate-800/90 backdrop-blur-lg border-2 border-cyan-500/30 p-8 rounded-3xl shadow-2xl shadow-cyan-500/20 text-white text-center space-y-4 max-w-lg">
            <p className="text-xl font-bold text-cyan-100">
              Waiting for players to join...
            </p>
          </div>
        </div>
      )}

      {/* All joined, host view */}
      {allJoined && !gameStarted && isHost && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-slate-800/90 backdrop-blur-lg border-2 border-cyan-500/30 p-8 rounded-3xl shadow-2xl shadow-cyan-500/20 text-xl font-bold text-cyan-100 text-center space-y-4">
            <p>All players have joined!</p>
          </div>
        </div>
      )}

      {/* All joined, non-hosts view */}
      {allJoined && !gameStarted && isHost && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-slate-800/90 backdrop-blur-lg border-2 border-cyan-500/30 p-8 rounded-3xl shadow-2xl shadow-cyan-500/20 text-xl font-bold text-cyan-100 text-center">
            Waiting for host to start the game...
          </div>
        </div>
      )}
    </>
  );
}
