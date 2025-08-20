"use client";

type BidsPanelProps = {
  localTurnOrder: string[];
  playerBids: (number | null)[];
  className?: string; // optional, allows customizing position
};

export default function BidsPanel({ localTurnOrder, playerBids, className }: BidsPanelProps) {
  return (
    <div className={`absolute top-2 right-2 bg-black/40 p-2 rounded shadow-md ${className ?? ""}`}>
      <h2 className="font-bold text-sm mb-1">Bids</h2>
      <table className="border-collapse border border-white text-xs">
        <thead>
          <tr>
            {localTurnOrder.map(p => (
              <th key={p} className="border border-white px-2">{p}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {localTurnOrder.map((p, index) => (
              <td key={p} className="border border-white px-2">
                {playerBids[index] ?? "-"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
