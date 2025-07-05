"use client";
import { SelectablePiece } from "@/components/Piece";
import { DrawnPiece } from "@/app/gameBoards/sorryBoard";

interface PiecesLayerProps {
  drawnPieces: DrawnPiece[];
  selectedPiece: number;
  secondSelectedPiece: number;
  playerColor: string;
  onPieceSelect: (piece: DrawnPiece, idx: number) => void;
}

export default function PiecesLayer({
  drawnPieces,
  selectedPiece,
  secondSelectedPiece,
  playerColor,
  onPieceSelect,
}: PiecesLayerProps) {
  return (
    <>
      {drawnPieces.map((piece, idx) => (
        <SelectablePiece
          key={idx}
          piece={piece}
          idx={idx}
          selected={selectedPiece === idx || secondSelectedPiece === idx}
          playerColor={playerColor}
          handlePieceSelection={() => onPieceSelect(piece, idx)}
        />
      ))}
    </>
  );
} 