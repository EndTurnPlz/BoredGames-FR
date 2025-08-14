import { CardInfo } from "@/utils/adapters";
import { formatCard } from "@/utils/Warlocks/config";
import React, { useState } from "react";

type CardProps = {
  card: CardInfo;
  selected: boolean;
  onToggle: () => void;
};

export default function Card({ card, selected, onToggle }: CardProps) {
  const imagePath = `/BoredGames-FR/WizardsCards/${formatCard(
    card.Card.Rank,
    card.Card.Suit
  )}.png`;

  return (
    <img
      src={imagePath}
      alt={`${card.Card.Rank} of ${card.Card.Suit}`}
      onClick={(e) => { e.stopPropagation(); card.IsPlayable && onToggle() } }
      className={`w-20 h-28 rounded transition-transform
        ${card.IsPlayable ? "cursor-pointer hover:scale-105" : "opacity-50 cursor-not-allowed"}
        ${selected ? "ring-4 ring-yellow-400 scale-105" : ""}
      `}
    />
  );
}