"use client";
import { useEffect, useState } from "react";
type BoardCanvasProps = {
  playerColor: string;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  setTurnOrder: React.Dispatch<React.SetStateAction<string[]>>;
  setGameStarted: React.Dispatch<React.SetStateAction<boolean>>;
  setMoveLog: React.Dispatch<React.SetStateAction<string[]>>;
  setWinner: React.Dispatch<React.SetStateAction<string>>;
  setHost: React.Dispatch<React.SetStateAction<string>>;
};

export default function WizardBoard({
  setGameOver,
  setTurnOrder,
  setGameStarted,
  setMoveLog,
  setWinner,
  setHost,
}: BoardCanvasProps) {
  const [players] = useState(["Alice", "Bob", "Charlie", "Diana"]);
  const [trump, setTrump] = useState("♠");
  const [round, setRound] = useState(1);
  const [currentTrick, setCurrentTrick] = useState([]);

  const devMode = true

    useEffect(() => {
      if (!devMode) return;
  
  
      setGameStarted(true);
      // setCurrentCard(7)
    }, []);
  
  return (
    <div className="flex flex-col h-screen bg-green-700 text-white p-4">
      {/* Top Row: Player 1 + Scoreboard */}
      <div className="flex justify-between">
        <div className="flex space-x-2">
          {Array(5).fill("🂠").map((card, i) => (
            <div key={i} className="bg-white text-black w-12 h-16 flex items-center justify-center rounded">
              {card}
            </div>
          ))}
        </div>
        <div className="bg-black/30 p-2 rounded">
          <h2 className="font-bold">Scoreboard</h2>
          <table className="border-collapse border border-white text-sm">
            <thead>
              <tr>
                <th className="border border-white px-2">Round</th>
                {players.map(p => (
                  <th key={p} className="border border-white px-2">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-white px-2">1</td>
                {players.map(p => (
                  <td key={p} className="border border-white px-2">0</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Middle: Play Area */}
      <div className="flex-1 flex flex-col justify-center items-center space-y-4">
        <div className="text-xl">Trump: {trump}</div>
        <div className="flex space-x-4">
          {currentTrick.length === 0 ? (
            <div className="text-gray-300">No cards played yet</div>
          ) : (
            currentTrick.map((card, i) => (
              <div key={i} className="bg-white text-black w-12 h-16 flex items-center justify-center rounded">
                {card}
              </div>
            ))
          )}
        </div>
        <div>Round {round}</div>
      </div>

      {/* Bottom Row: Player Hand */}
      <div className="flex justify-center space-x-2">
        {["🂡", "🂱", "🃁", "🃑"].map((card, i) => (
          <div key={i} className="bg-white text-black w-12 h-16 flex items-center justify-center rounded cursor-pointer hover:scale-105 transition">
            {card}
          </div>
        ))}
      </div>
    </div>
  );
}
