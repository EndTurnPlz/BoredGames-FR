import { useCallback } from "react";

type Setters = {
  setSelectedPiece: (v: number) => void;
  setdestination: (v: string | null) => void;
  setHighlightedTiles: (v: any[]) => void;
  setSecondDestination: (v: string | null) => void;
  setPossibleSecondPawns: (v: any[]) => void;
  setSecondSelectedPiece: (v: number) => void;
  setSelectedEffect: (v: number | null) => void;
  setSecondSelectedEffect: (v: number | null) => void;
  setPossibleEffects: (v: number[]) => void;
  setEffectPopupPosition: (v: { x: number; y: number } | null) => void;
  setPossibleMoves?: (v: any[]) => void; // optional
};

export function useGameSelections(setters: Setters) {
  const {
    setSelectedPiece,
    setdestination,
    setHighlightedTiles,
    setSecondDestination,
    setPossibleSecondPawns,
    setSecondSelectedPiece,
    setSelectedEffect,
    setSecondSelectedEffect,
    setPossibleEffects,
    setEffectPopupPosition,
    setPossibleMoves,
  } = setters;

  const resetSelections = useCallback(() => {
    setSelectedPiece(-1);
    setdestination(null);
    setHighlightedTiles([]);
    setSecondDestination(null);
    setPossibleSecondPawns([]);
    setSecondSelectedPiece(-1);
    setSelectedEffect(null);
    setSecondSelectedEffect(null);
    setPossibleEffects([]);
    setEffectPopupPosition(null);
  }, [
    setSelectedPiece,
    setdestination,
    setHighlightedTiles,
    setSecondDestination,
    setPossibleSecondPawns,
    setSecondSelectedPiece,
    setSelectedEffect,
    setSecondSelectedEffect,
    setPossibleEffects,
    setEffectPopupPosition,
  ]);

  const resetAllSelections = useCallback(() => {
    resetSelections();
    if (setPossibleMoves) setPossibleMoves([]);
  }, [resetSelections, setPossibleMoves]);

  return { resetSelections, resetAllSelections };
}
