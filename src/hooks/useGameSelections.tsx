import { MoveState, SecondMoveState } from "@/app/gameBoards/sorryBoard";
import { useCallback } from "react";

type UseGameSelectionsProps = {
  setMove: React.Dispatch<React.SetStateAction<MoveState>>;
  setSecondMove: React.Dispatch<React.SetStateAction<SecondMoveState>>;
};

export function useGameSelections({
  setMove,
  setSecondMove,
}: UseGameSelectionsProps) {
  const resetSelections = useCallback(() => {
    setMove((prev) => ({
      ...prev,
      selectedIdx: -1,
      destination: null,
      effect: null,
      possibleEffects: [],
      highlightedTiles: [],
      effectPopup: null
    }));

    setSecondMove({
      selectedIdx: -1,
      destination: null,
      effect: null,
      possibleSecondPawns: [],
    });
  }, [setMove, setSecondMove]);

  const resetAllSelections = useCallback(() => {
    setMove({
      selectedIdx: -1,
      destination: null,
      effect: null,
      possibleMoves: [],
      highlightedTiles: [],
      possibleEffects: [],
      effectPopup: null
    });

    setSecondMove({
      selectedIdx: -1,
      destination: null,
      effect: null,
      possibleSecondPawns: [],
    });
  }, [setMove, setSecondMove]);

  return { resetSelections, resetAllSelections };
}
