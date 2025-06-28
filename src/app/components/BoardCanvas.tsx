"use client";
import { useEffect, useRef, useState } from "react";
import { Player } from "./Player"; // assumes Player has a draw(ctx) method
import {
  drawCircle,
  fillTile,
  drawStripWithTriangleAndCircle,
  drawCard,
  drawAllCircles,
  drawSafetyWord,
} from "@/utils/drawUtils";
import { coordStringToPixel } from "@/utils/outerPath";
import { tileSize, canvasWidth, canvasHeight, numberDict, colorToAngleDict, GET_HEARTBEAT, GET_GAMESTATE, DRAW_CARD, indexToColor } from "@/utils/config";
import { getRotationAngleForColor } from "@/utils/rotation";
import { mockCardResponse2 } from "../mockData/moveset2";
import { mockCardResponse11 } from "../mockData/moveset11";
import { mockCardResponse7 } from "../mockData/moveset7";
import { coordMap, getUnrotatedMousePosition } from "@/utils/outerPath";
import { drawPiecesWithOffset } from "@/utils/drawUtils";
import { cardH, cardW, cardX1, cardX2, cardY, radius, darkColorMap } from "@/utils/config";

type GameState = {
  [color: string]: string[];
};
export type Piece = {
  x: number;
  y: number;
  color: string;
  radius: number;
  id: string;
};

type BoardCanvasProps = {
  gameType: string | null;
  username: string | null;
  playerColor: string;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  setTurnOrder: React.Dispatch<React.SetStateAction<string[]>>;
  setGameStarted: React.Dispatch<React.SetStateAction<boolean>>;
};

export type DrawnPiece = Piece & { drawX: number; drawY: number };
type Card = { x: number; y: number; height: number; width: number };

export default function GameCanvas({ gameType, username, playerColor = "red", setGameOver, setTurnOrder, setGameStarted }: BoardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const piecesCanvasRef = useRef<HTMLCanvasElement>(null);

  const [angle, setAngle] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true); 

  const deckPath = "Cards/deck.png";
  const [topCardPath, setTopCardPath] = useState<string>("/Cards/FaceCards/one.png");
  const topCardPathRef = useRef<string>("/Cards/FaceCards/one.png");

  const [currentCard, setCurrentCard] = useState<number>(0);
  const currentCardRef = useRef<number | null>(null);

  const [players, setPlayers] = useState<Player[]>([]);
  const playerColorRef = useRef<string>("red")

  const drawnPiecesRef = useRef<DrawnPiece[]>([]);

  const deckRef = useRef<Card | null>(null);
  const topCardRef = useRef<Card | null>(null);

  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  const [view, setView] = useState(-1)
  const viewRef = useRef<number | null>(null)

  const [pullGameState, setPullGamestate] = useState(false)

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
      { x: 2.5, y: 7.3, color: darkColorMap["red"], text: "Home" },
      { x: 4.5, y: 2.3, color: darkColorMap["red"], text: "Start" },
      { x: 13.5, y: 8.7, color: darkColorMap["yellow"], text: "Home" },
      { x: 11.5, y: 13.7, color: darkColorMap["yellow"], text: "Start" },
      { x: 8.7, y: 2.5, color: darkColorMap["blue"], text: "Home" },
      { x: 13.7, y: 4.5, color: darkColorMap["blue"], text: "Start" },
      { x: 7.3, y: 13.5, color: darkColorMap["green"], text: "Home" },
      { x: 2.3, y: 11.5, color: darkColorMap["green"], text: "Start" },
    ];

    zones.forEach(({ x, y, color, text }) =>
      drawCircle(ctx, x, y, circleRadius, color, tileSize, text, angle, playerColorRef.current)
    );

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const isOuter =
          row === 0 || row === numRows - 1 || col === 0 || col === numCols - 1;
        if (isOuter) {
          fillTile(ctx, row, col, "black", tileSize);
          continue;
        }

        const zones: number[][][] = [
          redSafetyZone,
          yellowSafetyZone,
          blueSafetyZone,
          greenSafetyZone,
        ];
        const colors = [darkColorMap["red"], darkColorMap["yellow"], darkColorMap["blue"], darkColorMap["green"]];

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
        color: darkColorMap["green"],
        direction: "down",
      },
      {
        x: tileSize / 4,
        y: 11.5 * tileSize,
        width: tileSize / 2,
        height: 3 * tileSize,
        color: darkColorMap["green"],
        direction: "down",
      },

      {
        x: 15 * tileSize + tileSize / 4,
        y: 9.5 * tileSize,
        width: tileSize / 2,
        height: 4 * tileSize,
        color: darkColorMap["blue"],
        direction: "up",
      },
      {
        x: 15 * tileSize + tileSize / 4,
        y: 1.5 * tileSize,
        width: tileSize / 2,
        height: 3 * tileSize,
        color: darkColorMap["blue"],
        direction: "up",
      },

      {
        x: 8.5 * tileSize,
        y: tileSize / 4,
        width: tileSize / 2,
        height: 4 * tileSize,
        color: darkColorMap["red"],
        direction: "right",
      },
      {
        x: 1.5 * tileSize,
        y: tileSize / 4,
        width: tileSize / 2,
        height: 3 * tileSize,
        color: darkColorMap["red"],
        direction: "right",
      },

      {
        x: 11.5 * tileSize,
        y: 15 * tileSize + tileSize / 4,
        width: tileSize / 2,
        height: 3 * tileSize,
        color: darkColorMap["yellow"],
        direction: "left",
      },
      {
        x: 2.5 * tileSize,
        y: 15 * tileSize + tileSize / 4,
        width: tileSize / 2,
        height: 4 * tileSize,
        color: darkColorMap["yellow"],
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



    drawCard(ctx, cardX1, cardY, cardW, cardH, deckPath);
    drawCard(ctx, cardX2, cardY, cardW, cardH, topCardPathRef.current);

    deckRef.current = { x: cardX1, y: cardY, width: cardW, height: cardH };
    topCardRef.current = { x: cardX2, y: cardY, width: cardW, height: cardH };
  };

  const drawWithRotation = (color: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0,0, canvasWidth, canvasHeight)
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
  const oldPieces = drawnPiecesRef.current;

  const newPlayers: Player[] = [];

  for (const color in gameState) {
    const coordStrings = gameState[color];
    const positions = coordStrings.map((coord) =>
      coordStringToPixel(coord, tileSize)
    );
    const player = new Player(color, positions);
    newPlayers.push(player);

    for (let i = 0; i < positions.length; i++) {
      const target = positions[i];
      const pieceId = player.pieces[i].id;
      const currentPiece = oldPieces.find(p => p.id === pieceId);

      if (currentPiece && (pieceId != target.id)) {
        animatePieceMove(pieceId, target.x, target.y);
      }
    }
  }
  console.log()
  setPlayers(newPlayers); // Update logical positions
};


  useEffect(() => {
    const canvas = piecesCanvasRef.current;
    if (!canvas) return;

    const handleClick = async (event: MouseEvent) => {
      if (loadingRef.current) return;

      const rect = canvas.getBoundingClientRect();

      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      let unrotatedCoords = getUnrotatedMousePosition(
        mouseX,
        mouseY,
        colorToAngleDict[playerColorRef.current] 
      );

      if (handleSecondPawnClick(unrotatedCoords.x, unrotatedCoords.y)) return;
      if (handleTileHighlightClick(unrotatedCoords.x, unrotatedCoords.y)) return;
      if (handlePieceSelection(unrotatedCoords.x, unrotatedCoords.y)) return;
      if (await handleDeckClick(mouseX, mouseY)) return;
      if (handleTopCardClick(mouseX, mouseY)) return;

      resetSelections();
    };

    canvas.addEventListener("click", handleClick);
    return () => {
      canvas.removeEventListener("click", handleClick);
    };
  }, []);

  const handleConfirmMoveClick = () => {
    if (destinationRef.current) {
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
        if (piece.color != playerColorRef.current) return;
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

  const handleDeckClick = async (x: number, y: number) => {
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
      try {
        let player_Id = localStorage.getItem("userId") ?? ""
        const res = await fetch(DRAW_CARD(player_Id))
        const response = await res.json()

        setPossibleMoves(response.movesets);
        setCurrentCard(response.lastDrawnCard);
        setTopCardPath(`/Cards/FaceCards/${numberDict[response.lastDrawnCard]}.png`)
        setLoading(false)
        return true;
      }
      catch(err) {
        console.error("Error fetching game state:", err);
        setLoading(false)
        return null;
        }
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
    drawPieces(playerColorRef.current);
    selectedPieceRef.current = selectedPiece;
  }, [selectedPiece]);

  useEffect(() => {
    // console.log("color change: " + playerColor)
    drawWithRotation(playerColor)
    drawPieces(playerColor)
    if (playerColor != "") {
      playerColorRef.current = playerColor
    }
  }, [playerColor]);

  useEffect(() => {
    viewRef.current = view
  }, [view]);

  function rotateUntilLast(arr: string[], playerColor: string): string[] {
    let result = [...arr];
    while (result[result.length - 1] !== playerColor) {
      console.log(result, playerColor)
      const first = result.shift(); // remove first element
      if (first !== undefined) {
        result.push(first);         // add it to the end
      }
    }
    return result;
  }

  const fetchGameState = async (playerId: string) => {
    try {
      const res = await fetch(GET_GAMESTATE(playerId));

      if (!res.ok) {
        throw new Error("Failed to pull game state");
      }

      const gameState = await res.json();
      console.log("Game State:", gameState, gameState.currentView);
      if (gameState.gamePhase == 0) {
        setGameStarted(true)
      }
      setView(gameState.currentView)
      setTopCardPath(`/Cards/FaceCards/${numberDict[gameState.lastDrawnCard]}.png`)
      let pieces = gameState.pieces
      const colorOrder = ["blue", "yellow", "green", "red"];
      const colorToPieces: Record<string, string[]> = {};
      for (let row = 0; row < pieces.length; row++) {
        const color = colorOrder[row];
        colorToPieces[color] = pieces[row].slice(); 
      }
      console.log(colorToPieces)
      applyGameState(colorToPieces)
      setTurnOrder(gameState.turnOrder)
    } catch (err) {
      console.error("Error fetching game state:", err);
      return null;
    }
  };

  // Simulate fetching the gameState from backend
  const heartbeat = async (playerId: string) => {
    try {
      console.log(GET_HEARTBEAT(playerId))
      console.log(viewRef)
      const res = await fetch(GET_HEARTBEAT(playerId), {
        method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(viewRef.current)
        });
      console.log(res)
      // if (res.ok) {
        setPullGamestate(true)
      // }

      // applyGameState(gameState);
    } catch (err) {
      console.error("Error fetching game state:", err);
      return null;
    }
  };

  const animatePieceMove = (
  pieceId: string,
  targetX: number,
  targetY: number,
  duration = 500
) => {
  const piece = drawnPiecesRef.current.find(p => p.id === pieceId);
  if (!piece) return;

  const startX = piece.drawX;
  const startY = piece.drawY;
  const startTime = performance.now();

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    piece.drawX = startX + (targetX - startX) * progress;
    piece.drawY = startY + (targetY - startY) * progress;

    drawPieces(playerColorRef.current);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

  useEffect(() => {
    let userId = localStorage.getItem("userId")
    if (pullGameState) {
      fetchGameState(userId ?? "")
    }
    setPullGamestate(false)
  }, [pullGameState])

  useEffect(() => {
    // console.log(playerColorRef.current)
    const storedId = localStorage.getItem("userId");
    const interval = setInterval(() => {
      heartbeat(storedId ?? "");
    }, 10000); // every 2 seconds

    drawWithRotation(playerColorRef.current);
    setAngle(colorToAngleDict[playerColor])
    drawPieces(playerColorRef.current);
  }, []);

  useEffect(() => {
    drawPieces(playerColorRef.current);
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
    drawPieces(playerColorRef.current);
  }, [destination]);

  useEffect(() => {
    currentCardRef.current = currentCard;
  }, [currentCard]);

  useEffect(() => {
    topCardPathRef.current = topCardPath
    drawWithRotation(playerColorRef.current)
  }, [topCardPath]);

  useEffect(() => {
    currentDistanceref.current = currentDistance;
  }, [currentDistance]);

  useEffect(() => {
    secondSelectedPieceRef.current = secondSelectedPiece;
    drawPieces(playerColorRef.current);
  }, [secondSelectedPiece]);

  useEffect(() => {
    secondSelectedDestinationRef.current = secondDestination;
    drawPieces(playerColorRef.current);
  }, [secondDestination]);

  useEffect(() => {
    possibleSecondPawnsRef.current = possibleSecondPawns;
  }, [possibleSecondPawns]);

  return (
    <div className="flex flex-col items-center">
    <div className="min-h-screen flex items-center justify-center bg-black-200">
  <div
    className={`relative ${loading ? "blur-sm pointer-events-none" : ""}`}
    style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
  >
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className= {`absolute top-0 left-0 z-0 pointer-events-none`}
      style={{ display: "block" }}
    />
    <canvas
      ref={piecesCanvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className={`absolute top-0 left-0 z-10`}
      style={{ pointerEvents: "auto" }}
    />
    {isPlayerTurn && (
       <button
    onClick={handleConfirmMoveClick}
    style={{
      position: "absolute",
      top: cardY + cardH + 0.3 * tileSize,       // halfway down canvas
      left: (cardX1 + cardX2) / 2 - 0.15 * tileSize,       // halfway across canvas
      // transform: "translate(-50%, -50%)", // offset to center button on this point
      width: canvasWidth * 0.2,    // 30% of canvas width
      height: canvasHeight * 0.06, // 8% of canvas height
      fontSize: canvasHeight * 0.03,
      borderRadius: canvasHeight * 0.02,
      backgroundColor: "white",
      color: "black",
      fontWeight: "bold",
      zIndex: 20,
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
      transition: "background 0.2s ease",
    }}
    className="hover:bg-gray-100 z-20"
  >
    Your Turn
  </button>
    )}
    {!isPlayerTurn && (
      <div
        style={{
          position: "absolute",
          top: cardY + cardH + 0.3 * tileSize,
          left: (cardX1 + cardX2) / 2,
          transform: "translateX(-25%)",
          fontSize: canvasHeight * 0.03,
          color: "white",
          fontWeight: "bold",
          zIndex: 20,
          userSelect: "none",
          textShadow: "0 0 5px rgba(0,0,0,0.7)",
          // whiteSpace: "nowrap", // prevent wrapping
          padding: `0 ${canvasWidth * 0.01}px`, // some horizontal padding if you want
        }}
      >
        Rohit is playing...
      </div>

    )}
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
