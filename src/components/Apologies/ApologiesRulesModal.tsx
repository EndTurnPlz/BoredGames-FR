// File: components/ApologiesRulesModal.tsx
"use client";

import { HiArrowRight, HiArrowLeft, HiOutlineBookOpen } from "react-icons/hi";

export default function ApologiesRulesModal({
  showRules,
  showCards,
  setShowRules,
  setShowCards,
}: {
  showRules: boolean;
  showCards: boolean;
  setShowRules: (v: boolean) => void;
  setShowCards: (v: boolean) => void;
}) {
  if (!showRules && !showCards) return null;

  return (
    <div
      className="fixed inset-0 z-[1101] bg-transparent bg-opacity-30 flex items-center justify-center"
      onClick={() => {
        setShowRules(false);
        setShowCards(false);
      }}
    >
      <div
        className="relative bg-slate-800/95 text-white rounded-2xl p-6 shadow-2xl max-w-xl w-full border-2 border-cyan-500/40 max-h-[60vh] overflow-y-auto pr-2 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation Buttons */}
        {showCards && (
          <button
            onClick={() => {
              setShowCards(false);
              setShowRules(true);
            }}
            className="flex justify-center space-x-8 mb-4"
            aria-label="Show Rules"
          >
            <div className="flex items-center space-x-2">
              <HiArrowLeft />
              <span>Show Rules</span>
            </div>
          </button>
        )}

        {showRules && (
          <div className="w-full flex justify-end mb-4">
            <button
              onClick={() => {
                setShowRules(false);
                setShowCards(true);
              }}
              className="flex items-center space-x-2"
              aria-label="Show Cards"
            >
              <span>Show Cards</span>
              <HiArrowRight />
            </button>
          </div>
        )}

        {/* Rules Section */}
        {showRules && (
          <>
            <h2 className="text-3xl font-bold mb-4 text-center flex items-center justify-center gap-2">
              <HiOutlineBookOpen className="text-cyan-300 text-2xl" />
              <span>Apologies! Game Rules</span>
            </h2>
            <div className="space-y-4 text-lg">
              <p>
                🎯 <strong>Objective:</strong> Be the first to move all four of your pawns from Start to Home.
              </p>
              <p>🃏 Draw cards to determine how many spaces to move your pawns.</p>
              <p>🚪 You can only move a pawn out of Start if you draw a 1 or 2.</p>
              <p>❗ If a pawn lands on another player&apos;s pawn, that pawn is sent back to Start.</p>
              <p>🚪 You can only enter the safety zone with an exact count.</p>
              <p>🙃 If you can&apos;t move, your turn is skipped.</p>
            </div>
          </>
        )}

        {/* Cards Section */}
        {showCards && (
          <div>
            <h2 className="text-3xl font-bold mb-4 text-center">Card Effects</h2>
            <div className="flex justify-center">
              <ul className="space-y-6 text-lg w-full max-w-md text-left">
                {[1, 2, 3, 4, 5, 7, 8, 10, 11, 12, "APOLOGIES!"].map((num) => (
                  <li key={num}>
                    <div className="text-xl font-bold">{num}</div>
                    <div className="mt-1">
                      {{
                        1: "Move forward 1 space",
                        2: "Move forward 2 spaces and draw again",
                        3: "Move forward 3 spaces",
                        4: "Move backward 4 spaces",
                        5: "Move forward 5 spaces",
                        7: "Split move between up to two pawns totaling 7 spaces",
                        8: "Move forward 8 spaces",
                        10: "Move forward 10 spaces or backward 1 space",
                        11: "Move one pawn forward 11 places or swap any one of your pawns with an opponent's pawn",
                        12: "Move forward 12 spaces",
                        "APOLOGIES!":
                          "Take one pawn from Start and swap it with any opponent's pawn on the board, sending that pawn back to Start.",
                      }[num]}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
