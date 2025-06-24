"use client";
import { useEffect, useRef, useState } from "react";
import { Player } from "./Player"; // assumes Player has a draw(ctx) method
import {
  drawCircle,
  fillTile,
  drawStripWithTriangleAndCircle,
  drawCard,
  drawTurnButton,
  drawAllCircles,
  drawSafetyWord,
} from "@/utils/drawUtils";
import { coordStringToPixel } from "@/utils/outerPath";
import { tileSize, canvasWidth, canvasHeight, numberDict, colorToAngleDict } from "@/utils/config";
import { getRotationAngleForColor } from "@/utils/rotation";
import { mockCardResponse2 } from "../mockData/moveset2";
import { mockCardResponse11 } from "../mockData/moveset11";
import { mockCardResponse7 } from "../mockData/moveset7";
import { coordMap, getUnrotatedMousePosition } from "@/utils/outerPath";
import { radius } from "@/utils/config";
import { match } from "assert";

type GameState = {
  [color: string]: string[];
};
type Piece = {
  x: number;
  y: number;
  color: string;
  radius: number;
  id: string;
};

type BoardCanvasProps = {
  gameType: string | null;
  username: string | null;
  playerColor: string
};

type DrawnPiece = Piece & { drawX: number; drawY: number };
type Card = { x: number; y: number; height: number; width: number };

export default function GameCanvas({ gameType, username, playerColor = "red" }: BoardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const piecesCanvasRef = useRef<HTMLCanvasElement>(null);

  let angle = colorToAngleDict[playerColor]
  let isPlayerTurn = true;
  let buttonBounds = { x: 0, y: 0, width: 0, height: 0 };
  const deckPath = "Cards/deck.png";
  const [topCardPath, setTopCardPath] = useState<string>("/Cards/FaceCards/one.png");
  const topCardPathRef = useRef<string>("/Cards/FaceCards/one.png");

  const [currentCard, setCurrentCard] = useState<number>(0);
  const currentCardRef = useRef<number | null>(null);

  const [players, setPlayers] = useState<Player[]>([]);

  const drawnPiecesRef = useRef<DrawnPiece[]>([]);

  const deckRef = useRef<Card | null>(null);
  const topCardRef = useRef<Card | null>(null);

  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  const [possibleMoves, setPossibleMoves] = useState<
    { piece: string; moves: string[][] }[]
  >([]);
  const PossibleMovesRef = useRef<
    { piece: string; moves: string[][] }[] | null
  >(null);

  const [possibleSecondPawns, setPossibleSecondPawns] = useState<
    { piece: DrawnPiece; move: string[] }[]
  >([]);
  const possibleSecondPawnsRef = useRef<
    { piece: DrawnPiece; move: string[] }[] | null
  >(null);

  const [highlightedTiles, setHighlightedTiles] = useState<string[][]>([]);
  const highlightedTilesRef = useRef<string[][] | null>(null);

  const [selectedPiece, setSelectedPiece] = useState<DrawnPiece | null>(null);
  const selectedPieceRef = useRef<DrawnPiece | null>(null);

  const [secondSelectedPiece, setSecondSelectedPiece] =
    useState<DrawnPiece | null>(null);
  const secondSelectedPieceRef = useRef<DrawnPiece | null>(null);

  const [destination, setdestination] = useState<string | null>(null);
  const destinationRef = useRef<string | null>(null);

  const [secondDestination, setSecondDestination] = useState<string | null>(
    null
  );
  const secondSelectedDestinationRef = useRef<string | null>(null);

  const [currentDistance, setCurrentDistance] = useState<number>(0);
  const currentDistanceref = useRef<number | null>(null);

  const [showZoomedCard, setShowZoomedCard] = useState(false);

  const drawBoard = (ctx: CanvasRenderingContext2D, tileSize: number) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const circleRadius = 1.4 * tileSize;
    const numCols = canvasWidth / tileSize;
    const numRows = canvasHeight / tileSize;

    const redSafetyZone = [
      [1, 2],
      [2, 2],
      [3, 2],
      [4, 2],
      [5, 2],
    ];
    const yellowSafetyZone = [
      [14, 13],
      [13, 13],
      [12, 13],
      [11, 13],
      [10, 13],
    ];
    const blueSafetyZone = [
      [2, 14],
      [2, 13],
      [2, 12],
      [2, 11],
      [2, 10],
    ];
    const greenSafetyZone = [
      [13, 1],
      [13, 2],
      [13, 3],
      [13, 4],
      [13, 5],
    ];

    const zones = [
      { x: 2.5, y: 7.3, color: "#D32F2F", text: "Home" },
      { x: 4.5, y: 2.3, color: "#D32F2F", text: "Start" },
      { x: 13.5, y: 8.7, color: "#FBC02D", text: "Home" },
      { x: 11.5, y: 13.7, color: "#FBC02D", text: "Start" },
      { x: 8.7, y: 2.5, color: "#1976D2", text: "Home" },
      { x: 13.7, y: 4.5, color: "#1976D2", text: "Start" },
      { x: 7.3, y: 13.5, color: "#388E3C", text: "Home" },
      { x: 2.3, y: 11.5, color: "#388E3C", text: "Start" },
    ];

    zones.forEach(({ x, y, color, text }) =>
      drawCircle(ctx, x, y, circleRadius, color, tileSize, text, angle)
    );

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const isOuter =
          row === 0 || row === numRows - 1 || col === 0 || col === numCols - 1;
        if (isOuter) {
          fillTile(ctx, row, col, "#e2e8f0", tileSize);
          continue;
        }

        const zones: number[][][] = [
          redSafetyZone,
          yellowSafetyZone,
          blueSafetyZone,
          greenSafetyZone,
        ];
        const colors = ["#D32F2F", "#FBC02D", "#1976D2", "#388E3C"];

        zones.forEach((zone, i) => {
          if (zone.some(([r, c]) => r === row && c === col)) {
            fillTile(ctx, row, col, colors[i], tileSize);
          }
        });
      }
    }
    const stripConfigs = [
      {
        x: tileSize / 4,
        y: 2.5 * tileSize,
        width: tileSize / 2,
        height: 4 * tileSize,
        color: "#388E3C",
        direction: "down",
      },
      {
        x: tileSize / 4,
        y: 11.5 * tileSize,
        width: tileSize / 2,
        height: 3 * tileSize,
        color: "#388E3C",
        direction: "down",
      },

      {
        x: 15 * tileSize + tileSize / 4,
        y: 9.5 * tileSize,
        width: tileSize / 2,
        height: 4 * tileSize,
        color: "#1976D2",
        direction: "up",
      },
      {
        x: 15 * tileSize + tileSize / 4,
        y: 1.5 * tileSize,
        width: tileSize / 2,
        height: 3 * tileSize,
        color: "#1976D2",
        direction: "up",
      },

      {
        x: 8.5 * tileSize,
        y: tileSize / 4,
        width: tileSize / 2,
        height: 4 * tileSize,
        color: "#D32F2F",
        direction: "right",
      },
      {
        x: 1.5 * tileSize,
        y: tileSize / 4,
        width: tileSize / 2,
        height: 3 * tileSize,
        color: "#D32F2F",
        direction: "right",
      },

      {
        x: 11.5 * tileSize,
        y: 15 * tileSize + tileSize / 4,
        width: tileSize / 2,
        height: 3 * tileSize,
        color: "#FBC02D",
        direction: "left",
      },
      {
        x: 2.5 * tileSize,
        y: 15 * tileSize + tileSize / 4,
        width: tileSize / 2,
        height: 4 * tileSize,
        color: "#FBC02D",
        direction: "left",
      },
    ];

    stripConfigs.forEach((cfg) =>
      drawStripWithTriangleAndCircle(
        ctx,
        cfg.x,
        cfg.y,
        cfg.width,
        cfg.height,
        cfg.color,
        cfg.direction
      )
    );

    const safetyConfigs = [
      { zone: redSafetyZone, angle: 90, offsetX: 2 * tileSize, offsetY: tileSize / 2 },
      { zone: blueSafetyZone, angle: 360, offsetX: 1.5 * tileSize, offsetY: 0 },
      { zone: greenSafetyZone, angle: 180, offsetX: 0.5 * tileSize, offsetY: -2 * tileSize },
      { zone: yellowSafetyZone, angle: 270, offsetX: 0, offsetY: 1.5 * tileSize },
    ];

    safetyConfigs.forEach(({ zone, angle, offsetX, offsetY }) => {
      drawSafetyWord(ctx, zone, angle, offsetX, offsetY);
    });


    const cardX1 = canvasWidth / 2 - 3 * tileSize;
    const cardX2 = cardX1 + 3.5 * tileSize;
    const cardY = canvasHeight / 2 - 2.5 * tileSize;
    const cardW = 3 * tileSize;
    const cardH = 5 * tileSize;
    const buttonW = cardW;
    const buttonH = tileSize * 0.8;
    const gap = tileSize * 0.3; // gap between card and button

    const buttonY = cardY + cardH + gap;

    const opponent = "ritij";

    drawCard(ctx, cardX1, cardY, cardW, cardH, deckPath);
    drawCard(ctx, cardX2, cardY, cardW, cardH, topCardPathRef.current);

    deckRef.current = { x: cardX1, y: cardY, width: cardW, height: cardH };
    topCardRef.current = { x: cardX2, y: cardY, width: cardW, height: cardH };

    buttonBounds = drawTurnButton({
      ctx,
      x: (cardX1 + cardX2) / 2,
      y: buttonY,
      width: buttonW,
      height: buttonH,
      isPlayerTurn,
      opponent,
      angle
    });
  };

  const drawWithRotation = (color: string) => {
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
    // Restore canvas state
    ctx.restore();
  };

  const drawPieces = (color: string) => {
    const canvas = piecesCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const angle = getRotationAngleForColor(color);
    // Save current state
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Move origin to center, rotate, then move back
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    const allPawns = players.flatMap((p) =>
      p.pieces.map((piece) => ({
        x: piece.x,
        y: piece.y,
        color: p.color,
        radius: radius,
        id: piece.id,
      }))
    );

    drawnPiecesRef.current = drawPiecesWithOffset(ctx, allPawns, selectedPiece);
    let highlights = [];
    if (!destinationRef.current) {
      highlightedTiles.forEach((coord) => {
        highlights.push({ coord: coord[0], color: "#FF00FF" });
      });
    } else {
      highlightedTiles.forEach((coord) => {
        if (destination === coord[0]) {
          highlights.push({ coord: coord[0], color: "#008000" });
        }
      });
    }

    if (!secondSelectedPieceRef.current) {
      possibleSecondPawns.forEach((coord) => {
        highlights.push({ coord: coord.piece.id, color: "#FF00FF" });
      });
    } else {
      highlights.push({
        coord: secondSelectedPieceRef.current.id,
        color: "gold",
      });
      if (secondDestination) {
        highlights.push({ coord: secondDestination, color: "#008000" });
      }
    }

    drawAllCircles(ctx, tileSize, highlights);
    ctx.restore();
  }

  const applyGameState = (gameState: GameState) => {
    const newPlayers: Player[] = [];

    for (const color in gameState) {
      const coordStrings = gameState[color];
      const positions = coordStrings.map((coord) =>
        coordStringToPixel(coord, tileSize)
      );
      newPlayers.push(new Player(color, positions));
    }

    setPlayers(newPlayers);
  };

  useEffect(() => {
    const canvas = piecesCanvasRef.current;
    if (!canvas) return;

    const handleClick = (event: MouseEvent) => {
      if (loadingRef.current) return;

      const rect = canvas.getBoundingClientRect();

      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      let unrotatedCoords = getUnrotatedMousePosition(
        mouseX,
        mouseY,
        angle 
      );

      if (handleConfirmMoveClick(mouseX, mouseY)) return;
      if (handleSecondPawnClick(unrotatedCoords.x, unrotatedCoords.y)) return;
      if (handleTileHighlightClick(unrotatedCoords.x, unrotatedCoords.y)) return;
      if (handlePieceSelection(unrotatedCoords.x, unrotatedCoords.y)) return;
      if (handleDeckClick(mouseX, mouseY)) return;
      if (handleTopCardClick(mouseX, mouseY)) return;

      resetSelections();
    };

    canvas.addEventListener("click", handleClick);
    return () => {
      canvas.removeEventListener("click", handleClick);
    };
  }, []);

  const handleConfirmMoveClick = (x: number, y: number) => {
    console.log(x,y)
    if (
      destinationRef.current &&
      x >= buttonBounds.x &&
      x <= buttonBounds.x + buttonBounds.width &&
      y >= buttonBounds.y &&
      y <= buttonBounds.y + buttonBounds.height
    ) {
      if (!isPlayerTurn) {
        console.log("Not your turn!");
        return true;
      }

      if (currentCardRef.current === 7 && currentDistanceref.current !== 7) {
        return true;
      }

      console.log(
        "Button clicked! It's your turn.",
        selectedPieceRef.current?.id,
        destinationRef.current,
        secondSelectedPieceRef.current,
        secondSelectedDestinationRef.current
      );
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        console.log("Backend response received!");
      }, 2000);

      resetSelections();
      return true;
    }
    return false;
  };
  const handleSecondPawnClick = (x: number, y: number) => {
    if (!possibleSecondPawnsRef.current) return false;
    for (const tile of possibleSecondPawnsRef.current) {
      const dx = x - tile.piece.drawX;
      const dy = y - tile.piece.drawY;
      if (Math.sqrt(dx * dx + dy * dy) <= radius) {
        setSecondDestination(tile.move[0]);
        setSecondSelectedPiece(tile.piece);

        const distance = parseInt(tile.move[1], 10);
        const current = currentDistanceref.current ?? 0;
        setCurrentDistance(current + distance);
        return true;
      }
    }

    return false;
  };

  const handleTileHighlightClick = (x: number, y: number) => {
    if (!highlightedTilesRef.current) return false;
    for (const tile of highlightedTilesRef.current) {
      const pixel = coordMap[tile[0]];
      const dx = x - pixel.x;
      const dy = y - pixel.y;
      if (Math.sqrt(dx * dx + dy * dy) <= radius) {
        if (!selectedPieceRef.current) return false;

        setdestination(tile[0]);

        if (currentCardRef.current === 7) {
          const current = parseInt(tile[1], 10);
          setCurrentDistance(current);
          const target = 7 - current;
          const possibleSeconds = [];

          for (const piece of drawnPiecesRef.current) {
            if (
              PossibleMovesRef.current &&
              selectedPieceRef.current !== piece
            ) {
              const matching = PossibleMovesRef.current.find(
                (m) => m.piece === piece.id
              );
              const canBeSecond = matching?.moves?.find(
                (m) => parseInt(m[1], 10) === target
              );
              if (canBeSecond) {
                possibleSeconds.push({ piece, move: canBeSecond });
              }
            }
          }

          setPossibleSecondPawns(possibleSeconds);
        }

        return true;
      }
    }

    return false;
  };

  const handlePieceSelection = (x: number, y: number) => {
    for (const piece of drawnPiecesRef.current) {
      const dx = x - piece.drawX;
      const dy = y - piece.drawY;
      if (Math.sqrt(dx * dx + dy * dy) <= radius) {
        setSelectedPiece(piece);

        const matching = PossibleMovesRef.current?.find(
          (m) => m.piece === piece.id
        );
        setHighlightedTiles(matching?.moves ?? []);
        return true;
      }
    }

    return false;
  };

  const handleDeckClick = (x: number, y: number) => {
    const deck = deckRef.current;
    if (!deck) return false;
    if (
      x >= deck.x &&
      x <= deck.x + deck.width &&
      y >= deck.y &&
      y <= deck.y + deck.height
    ) {
      console.log("Deck clicked! Sending to backend...");
      setLoading(true);

      setTimeout(() => {
        console.log("Backend response received!");
        setPossibleMoves(mockCardResponse7.moveset);
        setCurrentCard(mockCardResponse7.card);
        setTopCardPath(`/Cards/FaceCards/${numberDict[mockCardResponse7.card]}.png`)
        setLoading(false);
      }, 2000);

      return true;
    }

    return false;
  };

  const handleTopCardClick = (x: number, y: number) => {
    const topCard = topCardRef.current;
    if (!topCard) return false;
    if (
      x >= topCard.x &&
      x <= topCard.x + topCard.width &&
      y >= topCard.y &&
      y <= topCard.y + topCard.height
    ) {
      console.log("top card clicked! zooming in...");
      setShowZoomedCard(true);
      return true;
    }

    return false;
  };

  const resetSelections = () => {
    setSelectedPiece(null);
    setdestination(null);
    setHighlightedTiles([]);
    setSecondDestination(null);
    setPossibleSecondPawns([]);
    setSecondSelectedPiece(null);
  };

  useEffect(() => {
    drawPieces(playerColor);
    selectedPieceRef.current = selectedPiece;
  }, [selectedPiece]);

  // Simulate fetching the gameState from backend
  useEffect(() => {
    const simulatedGameState: GameState = {
      red: ["d_3", "d_4", "d_7", "d_10"],
      blue: ["a_S", "c_10", "a_9", "a_H"],
      green: ["c_H", "c_H", "c_H", "c_H"],
      yellow: ["c_3", "b_H", "b_H", "b_H"],
    };

    applyGameState(simulatedGameState);
    drawWithRotation(playerColor);
    drawPieces(playerColor);
  }, []);

  useEffect(() => {
    drawPieces(playerColor);
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
    drawPieces(playerColor);
  }, [destination]);

  useEffect(() => {
    currentCardRef.current = currentCard;
  }, [currentCard]);

  useEffect(() => {
    topCardPathRef.current = topCardPath
    console.log(currentCard, topCardPath)
    drawWithRotation(playerColor)
  }, [topCardPath]);

  useEffect(() => {
    currentDistanceref.current = currentDistance;
  }, [currentDistance]);

  useEffect(() => {
    secondSelectedPieceRef.current = secondSelectedPiece;
    drawPieces(playerColor);
  }, [secondSelectedPiece]);

  useEffect(() => {
    secondSelectedDestinationRef.current = secondDestination;
    drawPieces(playerColor);
  }, [secondDestination]);

  useEffect(() => {
    possibleSecondPawnsRef.current = possibleSecondPawns;
  }, [possibleSecondPawns]);

  return (
    <div className="flex flex-col items-center">
    <div className="min-h-screen flex items-center justify-center bg-green-200">
  <div
    className="relative"
    style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
  >
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className= {`absolute top-0 left-0 z-0 pointer-events-none ${
          loading ? "blur-sm" : ""}`}
      style={{ display: "block" }}
    />
    <canvas
      ref={piecesCanvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className={`absolute top-0 left-0 z-10 ${
          loading ? "blur-sm" : ""}`}
      style={{ pointerEvents: "auto" }}
    />
  </div>
</div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div
            className="text-6xl fo
      nt-bold text-black"
          >
            ...
          </div>
        </div>
      )}
      {showZoomedCard && (
        <div
          onClick={() => setShowZoomedCard(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <img
            src={topCardPathRef.current}
            alt="Zoomed Card"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "8px",
              boxShadow: "0 0 20px rgba(0,0,0,0.3)",
            }}
          />
        </div>
      )}
    </div>
  );
}

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
