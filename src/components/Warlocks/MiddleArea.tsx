"use client";

import CardObject from "@/components/Warlocks/Card";
import { Card, Trick } from "@/utils/adapters";

type PlayAreaProps = {
  trump: string;
  lead: string;
  currentTrick: Trick | null;
};

export default function PlayArea({ trump, lead, currentTrick }: PlayAreaProps) {
  const cardOverlap = 30; // px overlap between cards
  const cardHeight = 90; // px card height

  return (
    <div className="flex-1 flex flex-col justify-center items-center space-y-6">
      <div className="text-2xl font-bold mb-4">Trump: {trump}</div>
      <div className="text-2xl font-bold mb-4">Lead: {lead}</div>

      {/* Current Trick */}
      {!currentTrick || currentTrick.CardsPlayed.length === 0 ? (
        <div className="text-gray-300 text-center w-full">No cards played yet</div>
      ) : (
        <div className="relative flex justify-center">
          <div
            className="relative p-2 rounded-lg"
            style={{
              width: `${80 + (currentTrick.CardsPlayed.length - 1) * cardOverlap}px`,
              height: `${cardHeight}px`,
            }}
          >
            {currentTrick.CardsPlayed.map((card: Card, i: number) => (
              <div
                key={i}
                className="absolute top-0"
                style={{
                  left: i * cardOverlap,
                  zIndex: i,
                }}
              >
                <CardObject
                  card={{ Card: card, IsPlayable: true }}
                  selected={false}
                  onToggle={() => {}}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
