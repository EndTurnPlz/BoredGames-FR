"use client";

type PlayerPromptProps = {
  isPlayerTurn: string;
  cardY: number;
  cardH: number;
  cardX1: number;
  cardX2: number;
  canvasWidth: number;
  canvasHeight: number;
  tileSize: number;
  localTurnOrder: string[];
  gamePhase: number;
};

export default function PlayerPrompt({
  isPlayerTurn,
  cardY,
  cardH,
  cardX1,
  cardX2,
  canvasWidth,
  canvasHeight,
  tileSize,
  localTurnOrder,
  gamePhase,
}: PlayerPromptProps) {
  const text =
    isPlayerTurn === "wait"
      ? `${localTurnOrder[Math.floor(gamePhase / 2)]} is playing...`
      : "Click Deck to Draw Card";

  return (
    <div
      style={{
        position: "absolute",
        top: cardY + cardH + 0.3 * tileSize,
        left: (cardX1 + cardX2) / 2,
        transform: "translateX(-25%)",
        fontSize: canvasHeight * 0.03,
        color: "white",
        fontWeight: "bold",
        zIndex: 20,
        userSelect: "none",
        textShadow: "0 0 5px rgba(0,0,0,0.7)",
        padding: `0 ${canvasWidth * 0.01}px`,
      }}
    >
      {text}
    </div>
  );
}
