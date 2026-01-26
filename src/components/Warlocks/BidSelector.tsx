"use client";

import CardObject from "@/components/Warlocks/Card";
import { Card } from "@/utils/adapters";

type BidSelectorProps = {
  beforeHand: Card[];
  round: number;
  bid: number;
  setBid: (value: number) => void;
  handleSubmitBet: () => void;
};

export default function BidSelector({
  beforeHand,
  round,
  bid,
  setBid,
  handleSubmitBet,
}: BidSelectorProps) {
  const cardOverlap = 40; // px overlap between cards

  return (
    <div className="flex flex-col items-center space-y-4 bg-black/30 p-6 rounded-lg">
      <div className="flex justify-center">
        {beforeHand.map((card, i) => (
          <div
            key={i}
            className="relative"
            style={{ marginLeft: i === 0 ? 0 : `-${cardOverlap}px` }}
          >
            <CardObject card={{ Card: card, IsPlayable: true }} selected={false} onToggle={() => {}} />
          </div>
        ))}
      </div>

      <label className="text-lg font-bold">How many tricks will you win?</label>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={round}
        step={1}
        value={bid}
        onChange={(e) => setBid(Number(e.target.value))}
        className="w-64"
      />

      {/* Manual number input */}
      <input
        type="number"
        min={0}
        max={round}
        value={bid}
        onChange={(e) => {
          let val = Number(e.target.value);
          if (val < 0) val = 0;
          if (val > round) val = round;
          setBid(val);
        }}
        className="w-24 text-black rounded p-2 text-center text-xl"
      />

      <button
        onClick={handleSubmitBet}
        className="mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:scale-105 transition"
      >
        Submit Bid
      </button>
    </div>
  );
}
