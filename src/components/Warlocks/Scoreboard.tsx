"use client";

type ScoreboardProps = {
  localTurnOrder: string[];
  playerPoints: number[];
  round: number;
  className?: string; // optional for positioning
};

export default function Scoreboard({ localTurnOrder, playerPoints, round, className }: ScoreboardProps) {
  return (
    <div className={`absolute top-2 left-2 ${className ?? ""}`}>
      <div className="bg-black/30 p-2 rounded">
        <h2 className="font-bold">Scoreboard</h2>
        <table className="border-collapse border border-white text-sm">
          <thead>
            <tr>
              <th className="border border-white px-2">Round</th>
              {localTurnOrder.map(p => (
                <th key={p} className="border border-white px-2">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-white px-2">{round}</td>
              {playerPoints.map((p, index) => (
                <td key={index} className="border border-white px-2">{p}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
