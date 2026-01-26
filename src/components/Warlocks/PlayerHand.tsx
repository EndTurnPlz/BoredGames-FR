"use client";

import CardObject from "@/components/Warlocks/Card";
import { CardInfo, Trick } from "@/utils/adapters";

type PlayerHandProps = {
  hand: CardInfo[];
  selectedIndex: number;
  isPlayerTurn: boolean;
  localTurnOrder: string[];
  currentTrick?: Trick | null;
  handleToggle: (index: number) => void;
  handleChooseCard: () => void;
  gameState: string;
};

export default function PlayerHand({
  hand,
  selectedIndex,
  isPlayerTurn,
  localTurnOrder,
  currentTrick,
  handleToggle,
  handleChooseCard,
  gameState,
}: PlayerHandProps) {
  const cardOverlap = 40; // px overlap between cards

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Player Turn Indicator */}
      {gameState !== "Bid" && (
        isPlayerTurn ? (
          <div className="text-yellow-300 font-bold mb-1">
            It's your turn! Select a card to play.
          </div>
        ) : (
          <div className="text-red-300 font-bold mb-1">
            It's {localTurnOrder[currentTrick?.CurrentPlayerIndex ?? 0]}'s turn. Wait for them to play a card.
          </div>
        )
      )}

      {/* Player Hand */}
      <div className="flex justify-center">
        {hand.map((card, i) => (
          <div
            key={i}
            className="relative"
            style={{ marginLeft: i === 0 ? 0 : `-${cardOverlap}px` }}
          >
            <CardObject
              card={card}
              selected={selectedIndex === i && isPlayerTurn}
              onToggle={() => handleToggle(i)}
            />
          </div>
        ))}
      </div>

      {/* Choose Card Button */}
      {selectedIndex !== -1 && isPlayerTurn && (
        <button
          onClick={handleChooseCard}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:scale-105 transition"
        >
          Choose Card
        </button>
      )}
    </div>
  );
}
