import { tileSize } from "@/utils/UpAndDown/config";
import { Piece } from "./Piece";

interface PiecesLayerProps {
  pieces: Piece[];
}

export default function PiecesLayer({ pieces }: PiecesLayerProps) {
  // Step 1: Group pieces by location
  const groupedByLocation: { [loc: number]: Piece[] } = {};
  pieces.forEach((piece) => {
    if (!groupedByLocation[piece.location]) {
      groupedByLocation[piece.location] = [];
    }
    groupedByLocation[piece.location].push(piece);
  });

  return (
    <>
      {pieces.map((piece) => {
        const group = groupedByLocation[piece.location];
        const indexInGroup = group.findIndex((p) => p === piece);
        const spread = 10; // pixels of offset between stacked pieces

        // Compute offset based on index within group
        const angle = (indexInGroup / group.length) * 2 * Math.PI;
        const offsetX = group.length > 1 ? Math.cos(angle) * spread : 0;
        const offsetY = group.length > 1 ? Math.sin(angle) * spread : 0;

        return (
          <button
            key={`${piece.location}-${indexInGroup}`}
            style={{
              position: "absolute",
              top: piece.y - 3* tileSize / 8 + offsetY,
              left: piece.x - 3* tileSize / 8 + offsetX,
              backgroundColor: piece.color,
              width: `${3* tileSize / 4}px`,
              height: `${3*tileSize / 4}px`,
              borderRadius: "50%",
              border: "2px solid black",
              cursor: "pointer",
              zIndex: 10,
            }}
            // onClick={() => alert(`Clicked piece at location ${piece.location}`)}
          />
        );
      })}
    </>
  );
}
