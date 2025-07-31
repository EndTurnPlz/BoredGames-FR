"use client";
import { tileSize } from "@/utils/UpAndDown/config";
import { Piece } from "./Piece";
import { motion, AnimatePresence } from "framer-motion";

interface PiecesLayerProps {
  pieces: Piece[];
}

export default function PiecesLayer({ pieces }: PiecesLayerProps) {
  const groupedByLocation: { [loc: number]: Piece[] } = {};
  pieces.forEach((piece) => {
    if (!groupedByLocation[piece.location]) {
      groupedByLocation[piece.location] = [];
    }
    groupedByLocation[piece.location].push(piece);
  });

  return (
    <>
      <AnimatePresence>
        {pieces.map((piece) => {
          const group = groupedByLocation[piece.location];
          const indexInGroup = group.findIndex((p) => p === piece);
          const spread = 10;

          const angle = (indexInGroup / group.length) * 2 * Math.PI;
          const offsetX = group.length > 1 ? Math.cos(angle) * spread : 0;
          const offsetY = group.length > 1 ? Math.sin(angle) * spread : 0;

          return (
            <motion.div
              key={`${piece.location}-${indexInGroup}`} // stable key
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                position: "absolute",
                top: piece.y - (3 * tileSize) / 8 + offsetY,
                left: piece.x - (3 * tileSize) / 8 + offsetX,
                backgroundColor: piece.color,
                width: `${(3 * tileSize) / 4}px`,
                height: `${(3 * tileSize) / 4}px`,
                borderRadius: "50%",
                border: "2px solid black",
                cursor: "pointer",
                zIndex: 10,
              }}
            />
          );
        })}
      </AnimatePresence>
    </>
  );
}
