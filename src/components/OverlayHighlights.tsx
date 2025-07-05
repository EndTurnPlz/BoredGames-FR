import { AnimatedOverlayCircle } from "@/components/animatedOverlay";
import { Move, DrawnPiece } from "@/app/gameBoards/sorryBoard";
import { coordMap, getUnrotatedMousePosition } from "@/utils/outerPath";
import { colorToAngleDict, tileSize } from "@/utils/config";

type OverlayHighlightsProps = {
  highlightedTiles: Move[];
  destination: string | null;
  playerColor: string;
  onTileClick: (tile: Move) => void;
  secondDestination: string | null;
  possibleSecondPawns: { piece: DrawnPiece; move: Move }[];
  secondSelectedPiece: number;
  onSecondPawnClick: (move: Move) => void;
};

export default function OverlayHighlights({
  highlightedTiles,
  destination,
  playerColor,
  onTileClick,
  secondDestination,
  possibleSecondPawns,
  secondSelectedPiece,
  onSecondPawnClick,
}: OverlayHighlightsProps) {
  return (
    <>
      {highlightedTiles
        .filter((move) => !destination || destination === move.to)
        .map((move, index) => (
          <AnimatedOverlayCircle
            key={`highlight-${index}`}
            coord={move.to}
            playerColor={playerColor}
            borderColor="purple"
            backgroundColor={destination === move.to ? "purple" : "transparent"}
            onClick={() => onTileClick(move)}
            zIndex={1000}
            animatePulse={!destination}
            selected={destination === move.to}
          />
        ))}

      {possibleSecondPawns.map(({ piece, move }, index) => {
        if (secondSelectedPiece === -1) {
          return (
            <AnimatedOverlayCircle
              key={`second-${index}`}
              coord={piece.id}
              playerColor={playerColor}
              borderColor="purple"
              onClick={() => onSecondPawnClick(move)}
              zIndex={1099}
              selected={false}
              animatePulse={true}
            />
          );
        }
        return null;
      })}

      {secondDestination && (
        <AnimatedOverlayCircle
          key={`destination-${secondDestination}`}
          coord={secondDestination}
          playerColor={playerColor}
          borderColor="purple"
          backgroundColor="purple"
          onClick={() => {}}
          zIndex={1100}
          selected={true}
          animatePulse={false}
        />
      )}
    </>
  );
}
