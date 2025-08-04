// File: components/ApologiesRulesModal.tsx
"use client";

import { HiArrowRight, HiArrowLeft, HiOutlineBookOpen } from "react-icons/hi";

export default function UpsAndDownsRulesModal({
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
      className="fixed inset-0 z-[1101] bg-transparent bg-opacity-30 flex items-center justify-center"
      onClick={() => {
        setShowRules(false);
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
              }}
              className="flex items-center space-x-2"
              aria-label="Show Cards"
            >
            </button>
          </div>
        )}

        {/* Rules Section */}
        {showRules && (
          <>
            <h2 className="text-3xl font-bold mb-4 text-center flex items-center justify-center gap-2">
              <HiOutlineBookOpen className="text-cyan-300 text-2xl" />
              <span>Ups And Downs Game Rules</span>
            </h2>
            <div className="space-y-4 text-lg">
                <p>
                    🎯 <strong>Objective:</strong> Be the first player to reach the final tile.
                </p>
                <p>
                    🎲 <strong>Gameplay:</strong> Players take turns rolling a die. The number on the die determines how many tiles the player moves forward.
                </p>
                <p>
                    🪜 <strong>Ups:</strong> If you land on an up warp, you move up to its top tile, gaining a shortcut.
                </p>
                <p>
                    🕳️ <strong>Downs:</strong> If you land on a down warp, you slide down to its tail tile, losing progress.
                </p>
                <p>
                    🚫 <strong>Exact Roll:</strong> You must roll the exact number needed to land on the final tile. If you roll a higher number, you stay in place.
                </p>
                </div>

          </>
        )}
      </div>
    </div>
  );
}
