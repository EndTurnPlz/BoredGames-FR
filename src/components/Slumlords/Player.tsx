"use client";

import React from "react";
import { PlayerData } from "@/utils/Slumlords/types";

type PlayerProps = {
  player: PlayerData;
  x: number;
  y: number;
  size?: number; // circle size in pixels
};

export default function Player({ player, x, y, size = 20 }: PlayerProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: player.color,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontSize: size * 0.5,
        fontWeight: 700,
        left: `${x}%`,
        top: `${y}%`,
        border: "2px solid white",
        boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
        cursor: "pointer",
        position: "absolute", // so we can position on the board
        transition: "left 0.4s ease, top 0.4s ease",
        transform: "translate(-50%, -50%)"
      }}
      title={`${player.name} ($${player.money})`} // tooltip
    >
      {player.name[0].toUpperCase()}
    </div>
  );
}
