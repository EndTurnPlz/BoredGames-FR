"use client";
import { useEffect, useRef, useState } from "react";
import { Player } from "./Player"; // assumes Player has a draw(ctx) method
import { drawCircle, fillTile, drawStripWithTriangleAndCircle, drawCard, drawTurnButton } from "@/utils/drawUtils";
import { coordStringToPixel } from "@/utils/outerPath";
import { tileSize, canvasWidth, canvasHeight } from "@/utils/config";
import { getRotationAngleForColor } from "@/utils/rotation";
import { mockCardResponse2 } from "../mockData/moveset2";
import { mockCardResponse11 } from "../mockData/moveset11";
import { mockCardResponse7 } from "../mockData/moveset7";
import { coordMap } from "@/utils/outerPath";
import { radius } from "@/utils/config";
import { match } from "assert";



type GameState = {
  [color: string]: string[];
};
type Piece = { x: number; y: number; color: string; radius: number; id: string };
type DrawnPiece = Piece & { drawX: number; drawY: number };
type Card = { x: number; y: number, height: number, width: number };

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let isPlayerTurn = true
  let buttonBounds = {x: 0, y: 0, width: 0, height: 0};
  const [currentCard, setCurrentCard] = useState<number>(0);
  const currentCardRef = useRef<number | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const drawnPiecesRef = useRef<DrawnPiece[]>([]); // Store drawn pieces here
  const deckRef = useRef<Card | null>(null);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const [possibleMoves, setPossibleMoves] = useState<{ piece: string; moves: string[][] }[] >([]);
  const [possibleSecondPawns, setPossibleSecondPawns] = useState<{ piece: DrawnPiece; move: string; }[] >([]);
  const [highlightedTiles, setHighlightedTiles] = useState<string[][]>([]);
  const highlightedTilesRef = useRef<string[][] | null>(null);
  const PossibleMovesRef = useRef<{ piece: string; moves: string[][] }[] |null>(null);
  const [selectedPiece, setSelectedPiece] = useState<DrawnPiece | null>(null);
  const [secondSelectedPiece, setSecondSelectedPiece] = useState<DrawnPiece | null>(null);
  const [destination, setdestination] = useState<string | null>(null);
  const [secondDestination, setSecondDestination] = useState<string | null>(null);
  const destinationRef = useRef<string | null>(null);
  const selectedPieceRef = useRef<DrawnPiece | null>(null);
  const secondSelectedPieceRef = useRef<DrawnPiece | null>(null);
  const secondSelectedDestinationRef = useRef<string | null>(null);
  const possibleSecondPawnsRef = useRef<{ piece: DrawnPiece; move: string; }[] | null>(null);
  const [currentDistance, setCurrentDistance] = useState<number>(0);
  const currentDistanceref = useRef<number | null>(null);
  const drawBoard = (ctx: CanvasRenderingContext2D, tileSize: number) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const circleRadius = 1.4 * tileSize;
    const numCols = canvasWidth / tileSize;
    const numRows = canvasHeight / tileSize;

    const redSafetyZone = [[1,2], [2,2], [3,2], [4,2], [5,2]];
    const yellowSafetyZone = [[14,13], [13,13], [12,13], [11,13], [10,13]];
    const blueSafetyZone = [[2,14], [2,13], [2,12], [2,11], [2, 10]];
    const greenSafetyZone = [[13,1], [13,2], [13,3], [13,4], [13,5]];

    const zones = [
      { x: 2.5, y: 7.3, color: "#D32F2F" },
      { x: 4.5, y: 2.3, color: "#D32F2F" },
      { x: 13.5, y: 8.7, color: "#FBC02D" },
      { x: 11.5, y: 13.7, color: "#FBC02D" },
      { x: 8.7, y: 2.5, color: "#1976D2" },
      { x: 13.7, y: 4.5, color: "#1976D2" },
      { x: 7.3, y: 13.5, color: "#388E3C" },
      { x: 2.3, y: 11.5, color: "#388E3C" },
    ];

    zones.forEach(({ x, y, color }) =>
      drawCircle(ctx, x, y, circleRadius, color, tileSize)
    );

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const isOuter = row === 0 || row === numRows - 1 || col === 0 || col === numCols - 1;
        if (isOuter) {
          fillTile(ctx, row, col, "#e2e8f0", tileSize);
          continue;
        }

        const zones: number[][][] = [redSafetyZone, yellowSafetyZone, blueSafetyZone, greenSafetyZone];
        const colors = ["#D32F2F", "#FBC02D", "#1976D2", "#388E3C"];

        zones.forEach((zone, i) => {
          if (zone.some(([r, c]) => r === row && c === col)) {
            fillTile(ctx, row, col, colors[i], tileSize);
          }
        });
      }
    }
  const stripConfigs = [
  { x: tileSize / 4, y: 2.5 * tileSize, width: tileSize / 2, height: 4 * tileSize, color: "#388E3C", direction: "down" },
  { x: tileSize / 4, y: 11.5 * tileSize, width: tileSize / 2, height: 3 * tileSize, color: "#388E3C", direction: "down" },

  { x: 15 * tileSize + tileSize / 4, y: 9.5 * tileSize, width: tileSize / 2, height: 4 * tileSize, color: "#1976D2", direction: "up" },
  { x: 15 * tileSize + tileSize / 4, y: 1.5 * tileSize, width: tileSize / 2, height: 3 * tileSize, color: "#1976D2", direction: "up" },

  { x: 8.5 * tileSize, y: tileSize / 4, width: tileSize / 2, height: 4 * tileSize, color: "#D32F2F", direction: "right" },
  { x: 1.5 * tileSize, y: tileSize / 4, width: tileSize / 2, height: 3 * tileSize, color: "#D32F2F", direction: "right" },

  { x: 11.5 * tileSize, y: 15 * tileSize + tileSize / 4, width: tileSize / 2, height: 3 * tileSize, color: "#FBC02D", direction: "left" },
  { x: 2.5 * tileSize, y: 15 * tileSize + tileSize / 4, width: tileSize / 2, height: 4 * tileSize, color: "#FBC02D", direction: "left" },
];

stripConfigs.forEach(cfg =>
  drawStripWithTriangleAndCircle(ctx, cfg.x, cfg.y, cfg.width, cfg.height, cfg.color, cfg.direction)
);

const cardX1 = canvasWidth / 2 - 3 * tileSize;
const cardX2 = cardX1 + 3.5 * tileSize;
const cardY = canvasHeight / 2 - 2.5 * tileSize;
const cardW = 3 * tileSize;
const cardH = 5 * tileSize;
const buttonW = cardW;
const buttonH = tileSize * 0.8;
const gap = tileSize * 0.3; // gap between card and button

const buttonY = cardY + cardH + gap;

const opponent = "ritij"

drawCard(ctx, cardX1, cardY, cardW, cardH, "/file.svg");
buttonBounds = drawTurnButton({
  ctx,
  x: (cardX1 + cardX2) / 2,
  y: buttonY,
  width: buttonW,
  height: buttonH,
  isPlayerTurn,
  opponent
});

drawCard(ctx, cardX2, cardY, cardW, cardH, "/sorry_board.svg");

deckRef.current = { x: cardX1, y: cardY, width: cardW, height: cardH };
  };

  const drawAll = (color: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const angle = getRotationAngleForColor(color);
    // Save current state
    ctx.save();

    // Move origin to center, rotate, then move back
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw after rotation
    drawBoard(ctx, tileSize);
    const allPawns = players.flatMap(p =>
      p.pieces.map(piece => ({
        x: piece.x,
        y: piece.y,
        color: p.color,
        radius: radius,
        id: piece.id
      }))
    );

    drawnPiecesRef.current = drawPiecesWithOffset(ctx, allPawns, selectedPiece);
    if (!destinationRef.current) {
      highlightedTiles.forEach(coord => {
        const { x, y, id } = coordStringToPixel(coord[0], tileSize);
          ctx.beginPath();
          ctx.arc(x, y, tileSize * 0.4, 0, 2 * Math.PI);
          ctx.strokeStyle = "#FF00FF"; // highlight color
          ctx.lineWidth = 4;
          ctx.stroke();
      });
    } else {
      highlightedTiles.forEach(coord => {
        const { x, y, id } = coordStringToPixel(coord[0], tileSize);
        if (destination == coord[0]) {
          ctx.beginPath();
          ctx.arc(x, y, tileSize * 0.4, 0, 2 * Math.PI);
          ctx.strokeStyle = "#008000"; // highlight color
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      });
    }
    if (!secondSelectedPieceRef.current) {
      possibleSecondPawns.forEach(coord => {
        const { x, y, id } = coordStringToPixel(coord.piece.id, tileSize);
        ctx.beginPath();
        ctx.arc(x, y, tileSize * 0.4, 0, 2 * Math.PI);
        ctx.strokeStyle = "#FF00FF"; // highlight color
        ctx.lineWidth = 4;
        ctx.stroke();
      })
    } else {
      const { x, y, id } = coordStringToPixel(secondSelectedPieceRef.current.id, tileSize);
      ctx.beginPath();
      ctx.arc(x, y, tileSize * 0.4, 0, 2 * Math.PI);
      ctx.strokeStyle = "gold"; // highlight color
      ctx.lineWidth = 4;
      ctx.stroke();
      if (secondDestination) {
        const { x, y, id } = coordStringToPixel(secondDestination, tileSize);
        ctx.beginPath();
        ctx.arc(x, y, tileSize * 0.4, 0, 2 * Math.PI);
        ctx.strokeStyle = "#008000"; // highlight color
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    }
    // Restore canvas state
    ctx.restore();
  };

  const applyGameState = (gameState: GameState) => {
    const newPlayers: Player[] = [];

    for (const color in gameState) {
      const coordStrings = gameState[color];
      const positions = coordStrings.map(coord => coordStringToPixel(coord, tileSize));
      newPlayers.push(new Player(color, positions));
    }

    setPlayers(newPlayers);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (event: MouseEvent) => {
      if (loadingRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;


      if (destinationRef.current &&
        mouseX >= buttonBounds.x &&
        mouseX <= buttonBounds.x + buttonBounds.width &&
        mouseY >= buttonBounds.y &&
        mouseY <= buttonBounds.y + buttonBounds.height
      ) {
        if (isPlayerTurn) {
          if (currentCardRef.current == 7 && currentDistanceref.current != 7) {
            return
          }
          console.log("Button clicked! It's your turn.", selectedPieceRef.current?.id, destinationRef.current, secondSelectedPieceRef.current, secondSelectedDestinationRef.current);
          setLoading(true);

            // Simulate backend call — replace this with actual fetch()
            setTimeout(() => {
              setLoading(false);
              console.log("Backend response received!");
              // You can update game state or show a result here
            }, 2000); // simulate 2 second delay
          setSelectedPiece(null)
          setdestination(null)
          setHighlightedTiles([])
          // Do something like play a card or send a move
        } else {
          console.log("Not your turn!");
        }
        return;
      }
      if (possibleSecondPawnsRef.current) {
        for (const tile of possibleSecondPawnsRef.current) {
          const dx = mouseX - tile.piece.drawX;
          const dy = mouseY - tile.piece.drawY;
          if (Math.sqrt(dx * dx + dy * dy) <= radius) {
            setSecondDestination(tile.move)
            setSecondSelectedPiece(tile.piece);
            setCurrentDistance(currentDistance + parseInt(tile.move[1]))
            return;
          }
        }
      }
      if (highlightedTilesRef.current) {
        for (const tile of highlightedTilesRef.current) {
          const pixel = coordMap[tile[0]];
          const dx = mouseX - pixel.x;
          const dy = mouseY - pixel.y;
          if (Math.sqrt(dx * dx + dy * dy) <= radius) {
            if (selectedPieceRef.current) {
              setdestination(tile[0])
              console.log(currentCardRef.current)
              if (currentCardRef.current == 7) {
                const current = parseInt(tile[1], 10)
                setCurrentDistance(current)
                let target = 7 - current
                let possibleSeconds = []
                for (const piece of drawnPiecesRef.current) {
                  if (
                    PossibleMovesRef.current &&
                    selectedPieceRef.current !== piece
                  ) {
                    // Find matching moves for this piece
                    const matching = PossibleMovesRef.current.find(
                      (m) => m.piece === piece.id
                    );

                    if (matching?.moves) {
                      const canBeSecond = matching.moves.find(
                        (m) => parseInt(m[1], 10) === target
                      );

                      if (canBeSecond && canBeSecond.length > 0) {
                        possibleSeconds.push({piece: piece, move: canBeSecond[0]});
                      }
                    }
                  }
                }
                setPossibleSecondPawns(possibleSeconds);
              }
              return
          }
          }
        }
    }
      for (const piece of drawnPiecesRef.current) {
        const dx = mouseX - piece.drawX;
        const dy = mouseY - piece.drawY;
        if (Math.sqrt(dx * dx + dy * dy) <= radius) {
          let id = piece.id;
          if ( PossibleMovesRef.current) {
            const matching = PossibleMovesRef.current.find(m => m.piece === id);
            setSelectedPiece(piece);
            if (matching) {
              setHighlightedTiles(matching.moves); // new state
            } else {
              setHighlightedTiles([]);
            }
          }
          return;
        }
      }
      const deck = deckRef.current;
      if (
        deck &&
        mouseX >= deck.x &&
        mouseX <= deck.x + deck.width &&
        mouseY >= deck.y &&
        mouseY <= deck.y + deck.height
      ) {
        console.log("Deck clicked! Sending to backend...");
        setLoading(true);

        // Simulate backend call — replace this with actual fetch()
        setTimeout(() => {
          console.log("Backend response received!");

          setPossibleMoves(mockCardResponse7.moveset);
          setCurrentCard(mockCardResponse7.card)
          setLoading(false);
          // You can update game state or show a result here
        }, 2000); // simulate 2 second delay

        return;
      }
      if (event.type == "click") {
        setSelectedPiece(null);
        setdestination(null)
        setPossibleSecondPawns([])
        setSecondSelectedPiece(null)
        setHighlightedTiles([]);
        setSecondDestination(null)
      }
    };

    canvas.addEventListener("click", handleClick);
    return () => {
      canvas.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    drawAll("yellow");
    selectedPieceRef.current = selectedPiece
  }, [selectedPiece]);


  // Simulate fetching the gameState from backend
  useEffect(() => {
    const simulatedGameState: GameState = {
      red: [ "d_3", "d_H", "d_H", "d_H" ],
      blue: [ "a_S", "c_10", "a_9", "a_H"],
      green: ["c_H", "c_H", "c_H", "c_H"],
      yellow: ["c_3", "b_H", "b_H", "b_H" ]
    };

    applyGameState(simulatedGameState);
  }, []);

  useEffect(() => {
    drawAll("yellow");
  }, [players]);

  useEffect(() => {
  loadingRef.current = loading;
}, [loading]);

 useEffect(() => {
  PossibleMovesRef.current = possibleMoves;
}, [possibleMoves]);

useEffect(() => {
  highlightedTilesRef.current = highlightedTiles;
}, [highlightedTiles]);
useEffect(() => {
  destinationRef.current = destination;
  drawAll("yellow")
}, [destination]);

useEffect(() => {
  currentCardRef.current = currentCard;
}, [currentCard]);

useEffect(() => {
  currentDistanceref.current = currentDistance;
}, [currentDistance]);

useEffect(() => {
  secondSelectedPieceRef.current = secondSelectedPiece;
  drawAll("yellow")
}, [secondSelectedPiece]);

useEffect(() => {
  secondSelectedDestinationRef.current = secondDestination;
  drawAll("yellow")
}, [secondDestination]);

useEffect(() => {
  possibleSecondPawnsRef.current = possibleSecondPawns;
}, [possibleSecondPawns]);


  return (
    <div className="flex flex-col items-center">
     <canvas
    ref={canvasRef}
    width={canvasWidth}
    height={canvasHeight}
    className={`border-4 border-black transition duration-300 ${loading ? "blur-sm" : ""}`}
  />
     {loading && (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className="text-6xl fo
      nt-bold text-black">...</div>
    </div>
  )}
  </div>
  )
};

function drawPiecesWithOffset(
  ctx: CanvasRenderingContext2D,
  allPieces: Piece[],
  selectedPiece: DrawnPiece | null
): DrawnPiece[] {
  const tileGroups: Record<string, Piece[]> = {};

  for (const piece of allPieces) {
    const key = `${Math.round(piece.x)}_${Math.round(piece.y)}`;
    if (!tileGroups[key]) tileGroups[key] = [];
    tileGroups[key].push(piece);
  }

  const offsetDistance = tileSize * 0.5;
  const drawnPieces: DrawnPiece[] = [];

  for (const group of Object.values(tileGroups)) {
    const centerX = group[0].x;
    const centerY = group[0].y;
    const radius = group[0].radius;

    group.forEach((piece, i) => {
      let offsetX = 0;
      let offsetY = 0;

      if (group.length > 1) {
        const angle = (2 * Math.PI * i) / group.length;
        offsetX = Math.cos(angle) * offsetDistance;
        offsetY = Math.sin(angle) * offsetDistance;
      }

      const drawX = centerX + offsetX;
      const drawY = centerY + offsetY;

      // Draw filled piece
      ctx.beginPath();
      ctx.arc(drawX, drawY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = piece.color;
      ctx.fill();

      // Highlight selected piece
      const isSelected =
        selectedPiece &&
        selectedPiece.drawX === drawX &&
        selectedPiece.drawY === drawY;

      ctx.lineWidth = isSelected ? 4 : 1;
      ctx.strokeStyle = isSelected ? "gold" : "#000";
      ctx.stroke();

      drawnPieces.push({ ...piece, drawX, drawY });
    });
  }

  return drawnPieces;
}
