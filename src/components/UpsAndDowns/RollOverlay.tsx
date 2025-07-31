"use client";
import { useState } from "react";

export default function RollOverlay({ isMyTurn, onRoll, currentPlayerName, rolling }: {
  isMyTurn: boolean,
  onRoll: () => void,
  rolling: boolean,
  currentPlayerName: string
}) {

  const handleRoll = () => {
    onRoll(); // call parent's roll logic
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-clear bg-opacity-60">
      {isMyTurn ? (
        <button
          onClick={handleRoll}
          disabled={rolling}
          className="bg-black p-8 rounded-2xl shadow-xl text-2xl font-bold hover:bg-black-200 transition-all"
        >
          {rolling ? "Rolling..." : "🎲 Roll"}
        </button>
      ) : (
        <div className="text-black text-3xl font-semibold">
          {currentPlayerName} is rolling...
        </div>
      )}
    </div>
  );
}
