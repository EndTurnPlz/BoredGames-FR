import { motion } from "framer-motion";
import { DrawnPiece } from "@/app/components/BoardCanvas";
import { tileSize, colorToAngleDict } from "@/utils/config";
import { getUnrotatedMousePosition } from "@/utils/outerPath";

type SelectablePieceProps = {
  piece: DrawnPiece;
  idx: number;
  selected: boolean;
  playerColor: string;
  handlePieceSelection: () => any;
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
  const { x: new_x, y: new_y } = getUnrotatedMousePosition(x, y, colorToAngleDict[playerColor]);

  return (
<motion.button
  key={`${piece}-${selected}`}
  onClick={(e) => { e.stopPropagation(); handlePieceSelection()}} // define this handler
  style={{
    position: "absolute",
    top: new_y - tileSize/2,
    left: new_x - tileSize/2,
    width: tileSize,
    height: tileSize,
    backgroundColor: piece.color,
    borderRadius: "50%",
    border: selected ? "3px solid gold" : "2px solid white",
    transition: "top 0.3s ease, left 0.3s ease, border 0.3s ease",
    zIndex: 1000,
    cursor: "pointer",
  }}
  aria-label={`Piece at row ${piece.y}, column ${piece.x}`}
  whileHover={
    isCurrentPlayer && !selected
      ? {
          scale: [1, 1.1, 1],
          transition: {
            duration: 0.6,
            repeat: Infinity,
            repeatType: "loop",
          },
        }
      : undefined
  }
/>

  );
};