// CardControls.tsx
import CardButton from "@/components/Card";
import { cardX1, cardX2, cardY, deck_card, tileSize, cardH, canvasHeight, canvasWidth } from "@/utils/config";
import SubmitMoveButton from "./submitMoveButton";
import PlayerPrompt from "./PlayerPrompt";

export default function CardControls({
  onDeckClick,
  onTopCardClick,
  topCardPath,
  isPlayerTurn,
  gamePhase,
  localTurnOrder,
  handleConfirmMoveClick,
}: {
  onDeckClick: () => void;
  onTopCardClick: () => void;
  topCardPath: string;
  isPlayerTurn: string;
  gamePhase: number;
  localTurnOrder: string[];
  handleConfirmMoveClick: () => void;
}) {
  return (
    <>
      {/* Deck Button */}
      <CardButton
        onClick={onDeckClick}
        x={cardX1}
        y={cardY}
        src={deck_card}
        label="Draw from deck"
        animate={false} // <- no transition
      />

      {/* Top Card (with animation) */}
      <CardButton
        onClick={onTopCardClick}
        x={cardX2}
        y={cardY}
        src={topCardPath}
        label="View top card"
        animate={true}
      />

      {/* Submit Move Button */}
      {isPlayerTurn == "move" && (
        <SubmitMoveButton
            onClick={handleConfirmMoveClick}
            top={cardY + cardH + 0.3 * tileSize}
            left={(cardX1 + cardX2) / 2 - 0.15 * tileSize}
            width={canvasWidth * 0.2}
            height={canvasHeight * 0.06}
            fontSize={canvasHeight * 0.03}
            borderRadius={canvasHeight * 0.02}
        />
        )}

        {isPlayerTurn !== "move" && (
            <PlayerPrompt
                isPlayerTurn={isPlayerTurn}
                cardY={cardY}
                cardH={cardH}
                cardX1={cardX1}
                cardX2={cardX2}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                tileSize={tileSize}
                localTurnOrder={localTurnOrder}
                gamePhase={gamePhase}
            />
        )}

    </>
  );
}
