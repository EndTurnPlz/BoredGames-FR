"use client";

import { width } from "@/utils/Warlocks/config";
import { User } from "lucide-react";

type PlayerCircleProps = {
  players: string[];
  currentPlayerIndex: number; // don't show an icon for this player
};

export default function PlayerCircle({ players, currentPlayerIndex }: PlayerCircleProps) {
  const radius = width / 3;

  // Get other players (skip current player)
  const otherPlayers = players.filter((_, i) => i !== currentPlayerIndex);

  // Spread evenly from 0° (top) to 180° (top-left to top-right)
  const angles = otherPlayers.map((_, i) => {
    return (i / (otherPlayers.length - 1 || 1)) * 180; // avoid division by 0
  });

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {otherPlayers.map((player, i) => {
        const rad = ((angles[i] - 180) * Math.PI) / 180; // rotate so 0° is top
        const x = radius * Math.cos(rad);
        const y = radius * Math.sin(rad);

        return (
          <div
            key={i}
            className="absolute flex flex-col items-center"
            style={{
              left: `50%`,
              top: `50%`,
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
            }}
          >
            <User className="w-10 h-10 text-black-500" />
            <span className="text-sm mt-1 text-white">{player}</span>
          </div>
        );
      })}
    </div>
  );
}
