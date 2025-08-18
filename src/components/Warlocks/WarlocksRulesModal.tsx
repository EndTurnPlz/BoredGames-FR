// File: components/ApologiesRulesModal.tsx
"use client";

import { HiArrowLeft, HiOutlineBookOpen } from "react-icons/hi";

export default function WarlocksRulesModal({
  showRules,
  showCards,
  setShowRules,
}: {
  showRules: boolean;
  showCards: boolean;
  setShowRules: (v: boolean) => void;
}) {
  if (!showRules && !showCards) return null;

  return (
    <div
      className="fixed inset-0 z-[1101] bg-black/40 flex items-center justify-center"
      onClick={() => setShowRules(false)}
    >
      <div
        className="relative bg-slate-800/95 text-white rounded-2xl p-6 shadow-2xl max-w-2xl w-full border-2 border-cyan-500/40 max-h-[70vh] overflow-y-auto pr-2 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation Buttons */}
        {showCards && (
          <button
            onClick={() => setShowRules(true)}
            className="flex justify-center space-x-2 mb-4 text-cyan-300 hover:text-white"
            aria-label="Show Rules"
          >
            <HiArrowLeft />
            <span>Show Rules</span>
          </button>
        )}

        {showRules && (
          <div className="w-full flex justify-end mb-4">
            <button
              onClick={() => setShowRules(false)}
              className="flex items-center space-x-2 text-cyan-300 hover:text-white"
              aria-label="Close Rules"
            >
              Close
            </button>
          </div>
        )}

        {/* Rules Section */}
        {showRules && (
          <>
            <h2 className="text-3xl font-bold mb-4 text-center flex items-center justify-center gap-2">
              <HiOutlineBookOpen className="text-cyan-300 text-2xl" />
              <span>Warlocks Game Rules</span>
            </h2>
            <div className="space-y-3 text-sm sm:text-base">


              <h3 className="font-semibold mt-2">Cards</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li>Four suits: Spades, Clubs, Hearts, Diamonds</li>
                    <li>Strongest card in each suit: 13, weakest: 1</li>
                    <li>Four Wizards are always Trump, higher than all</li>
                    <li>Four Fools are never Trump, lower than all</li>
                </ul>

              <h3 className="font-semibold mt-2">Gameplay</h3>
              <p>
                Players receive increasing numbers of cards each round, starting with 1 in round 1, 2 in round 2, and so on.
                The top card of the undealt deck sets the Trump color. If it's a Fool, there's no Trump.
              </p>

              <h3 className="font-semibold mt-2">Bidding</h3>
              <p>
                After looking at their hand, each Apprentice predicts how many tricks they will win. 
              </p>
              <h3 className="font-semibold mt-2">Playing Tricks</h3>
              <p>
                The player left of the dealer leads. Others must follow suit if possible; otherwise, they may play any card or Trump. Wizards and Fools may always be played.
              </p>
              <p>Highest card wins the trick: first Wizard, highest Trump, or highest led color.</p>

              <h3 className="font-semibold mt-2">Special Rules</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Opening with a Wizard allows any following card.</li>
                <li>Opening with a Fool allows any card; the second card determines the color to follow.</li>
                <li>Fools always lose, except if only Fools are played; the first Fool wins.</li>
              </ul>

              <h3 className="font-semibold mt-2">Scoring</h3>
              <p>
                Correct prediction: 20 points + 10 per trick won.<br/>
                Missed prediction: lose 10 points per trick over or under.
              </p>

              <h3 className="font-semibold mt-2">End of Game</h3>
              <p>
                Play until all cards are dealt. The Apprentice with the highest Experience score wins.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
