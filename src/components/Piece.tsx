import { motion } from "framer-motion";
import { DrawnPiece } from "@/app/components/BoardCanvas";
import { tileSize, colorToAngleDict } from "@/utils/config";
import { getUnrotatedMousePosition } from "@/utils/outerPath";

type SelectablePieceProps = {
  piece: DrawnPiece;
  idx: number;
  selected: boolean;
  playerColor: string;
  handlePieceSelection: (piece: DrawnPiece, idx: number) => void;
};

export const SelectablePiece = ({
  piece,
  idx,
  selected,
  playerColor,
  handlePieceSelection,
}: SelectablePieceProps) => {
  const isCurrentPlayer = piece.color === playerColor;

  // get unrotated position in pixels
  const x = piece.drawX;
  const y = piece.drawY;
  const { x: new_x, y: new_y } = getUnrotatedMousePosition(
    x,
    y,
    colorToAngleDict[playerColor]
  );

  return (
    <motion.button
      key={`${piece}-${selected}`}
      onClick={(e) => {
        e.stopPropagation();
        handlePieceSelection(piece, idx);
      }} // define this handler
      style={{
        position: "absolute",
        top: new_y - tileSize / 2,
        left: new_x - tileSize / 2,
        width: tileSize,
        height: tileSize,
        backgroundColor: piece.color,
        borderRadius: "50%",
        boxShadow: `0 4px 8px rgba(0,0,0,0.3), inset 0 -4px 4px rgba(0,0,0,0.3), inset 0 4px 4px rgba(255,255,255,0.4)`,
        border: selected ? "3px solid gold" : "2px solid rgba(255,255,255,0.8)",
        transition:
          "top 0.3s ease, left 0.3s ease, border 0.3s ease, transform 0.3s ease",
        zIndex: 1000,
        cursor: "pointer",
      }}
      aria-label={`Piece at row ${piece.y}, column ${piece.x}`}
      whileHover={
        isCurrentPlayer && !selected
          ? {
              scale: [1, 1.1, 1],
              boxShadow:
                "0 6px 12px rgba(0,0,0,0.4), inset 0 -4px 4px rgba(0,0,0,0.3), inset 0 4px 4px rgba(255,255,255,0.5)",
              transition: {
                duration: 0.6,
                repeat: Infinity,
                repeatType: "loop",
              },
            }
          : undefined
      }
      animate={
        selected
          ? {
              y: -5,
              boxShadow:
                "0 8px 16px rgba(0,0,0,0.4), inset 0 -4px 4px rgba(0,0,0,0.3), inset 0 4px 4px rgba(255,255,255,0.5)",
            }
          : undefined
      }
    />
  );
};
