"use client";
import { useEffect, useRef, useState } from "react";
import { Player } from "./Player"; // assumes Player has a draw(ctx) method
import {
  drawCircle,
  fillTile,
  drawStripWithTriangleAndCircle,
  drawAllCircles,
  drawSafetyWord,
} from "@/utils/drawUtils";
import { coordStringToPixel, findPath } from "@/utils/outerPath";
import { tileSize, canvasWidth, canvasHeight, numberDict, colorToAngleDict, GET_HEARTBEAT, GET_GAMESTATE, DRAW_CARD, indexToColor, MOVE_PAWN, colorToIndex, deck_card, card_path } from "@/utils/config";
import { getRotationAngleForColor } from "@/utils/rotation";
import { mockCardResponse2 } from "../mockData/moveset2";
import { mockCardResponse11 } from "../mockData/moveset11";
import { mockCardResponse7 } from "../mockData/moveset7";
import { coordMap, getUnrotatedMousePosition } from "@/utils/outerPath";
import { drawPiecesWithOffset } from "@/utils/drawUtils";
import { cardH, cardW, cardX1, cardX2, cardY, radius, darkColorMap } from "@/utils/config";
import { useSearchParams } from "next/navigation";

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
type MoveSet = {
  pawn: string;
  move: Move[];
}
type Move = {
  from: string;
  to: string;
  effects: number[];
};

type BoardCanvasProps = {
  gameType: string | null;
  username: string | null;
  playerColor: string;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  setTurnOrder: React.Dispatch<React.SetStateAction<string[]>>;
  setGameStarted: React.Dispatch<React.SetStateAction<boolean>>;
};

type FloatingCard = {
  oldSrc: string
  newSrc: string;
  x: number;
  y: number;
  phase: "start" | "animate" | "done";
};

export type DrawnPiece = Piece & { drawX: number; drawY: number };
type Card = { x: number; y: number; height: number; width: number };

export default function GameCanvas({ gameType, username, playerColor = "red", setGameOver, setTurnOrder, setGameStarted }: BoardCanvasProps) {
  const searchParams = useSearchParams();
  const randomId = searchParams.get("randomId");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const piecesCanvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true); 

  const [topCardPath, setTopCardPath] = useState<string>(deck_card);
  const topCardPathRef = useRef<string>(deck_card);

  const [currentCard, setCurrentCard] = useState<number>(0);
  const currentCardRef = useRef<number | null>(null);

  const [players, setPlayers] = useState<Player[]>([]);
  const playersref = useRef<Player[]>([]);
  const playerColorRef = useRef<string>("green")

  const drawnPiecesRef = useRef<DrawnPiece[]>([]);

  const deckRef = useRef<Card | null>(null);
  const topCardRef = useRef<Card | null>(null);

  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  
  const [localTurnOrder, setLocalTurnOrder] = useState<string[]>([])
  const [gamePhase, setGamePhase] = useState<number>(8);

  let devMode = false

  const [view, setView] = useState(-1)
  const viewRef = useRef<number | null>(null)

  const [pullGameState, setPullGamestate] = useState(false)

  const [possibleMoves, setPossibleMoves] = useState<
   MoveSet[]
  >([]);
  const PossibleMovesRef = useRef<
   MoveSet[] | null
  >(null);

  const [possibleSecondPawns, setPossibleSecondPawns] = useState<
    { piece: DrawnPiece; move: Move }[]
  >([]);
  const possibleSecondPawnsRef = useRef<
    { piece: DrawnPiece; move: Move }[] | null
  >(null);

  const [floatingCard, setFloatingCard] = useState<FloatingCard | null>(null);


  const [highlightedTiles, setHighlightedTiles] = useState<Move[]>([]);
  const highlightedTilesRef = useRef<Move[] | null>(null);

  const [selectedPiece, setSelectedPiece] = useState<DrawnPiece | null>(null);
  const selectedPieceRef = useRef<DrawnPiece | null>(null);

  const [secondSelectedPiece, setSecondSelectedPiece] =
    useState<DrawnPiece | null>(null);
  const secondSelectedPieceRef = useRef<DrawnPiece | null>(null);

  const [destination, setdestination] = useState<string | null>(null);
  const destinationRef = useRef<string | null>(null);

  const [possibleEffects, setPossibleEffects] = useState<number[]>([]);
  const possibleEffectsRef = useRef<number[]>([])

  const [effectPopupPosition, setEffectPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<number | null>(null);

  const [secondEffect, setSecondSelectedEffect] = useState<number | null>(null)


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



    // drawCard(ctx, cardX1, cardY, cardW, cardH, deckPath);
    // drawCard(ctx, cardX2, cardY, cardW, cardH, topCardPathRef.current);

    // deckRef.current = { x: cardX1, y: cardY, width: cardW, height: cardH };
    // topCardRef.current = { x: cardX2, y: cardY, width: cardW, height: cardH };
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
        highlights.push({ coord: coord.to, color: "#FF00FF" });
      });
    } else {
      highlightedTiles.forEach((coord) => {
        if (destination === coord.to) {
          highlights.push({ coord: coord.to, color: "#008000" });
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
  

const applyGameState = async (gameState: GameState) => {
  const oldPlayers = playersref.current

  const newPlayers: Player[] = [];
  const animationPromises: Promise<void>[] = [];

  for (const color in gameState) {
    const coordStrings = gameState[color];
    const oldPlayer = oldPlayers.find((player) => player.color === color)
    const positions = coordStrings.map((coord) =>
      coordStringToPixel(coord, tileSize)
    );
    const player = new Player(color, positions);
    newPlayers.push(player);

    for (let i = 0; i < positions.length; i++) {
      const target = positions[i];
      const pieceId = oldPlayer?.pieces[i].id ?? "";
      const currentPiece = oldPlayer?.pieces[i];
      if (currentPiece && (pieceId != target.id)) {
        // console.log(currentPiece, pieceId, target.id)
        animationPromises.push(
          animatePieceAlongPath(pieceId, findPath(pieceId, target.id))
        );
      }
    }
  }
  await Promise.all(animationPromises); 
  setPlayers(newPlayers);
};


  useEffect(() => {
    const canvas = piecesCanvasRef.current;
    if (!canvas) return;

    const handleClick = async (event: MouseEvent) => {
      if (loadingRef.current || pullGameState) return;

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

      resetSelections();
    };

    canvas.addEventListener("click", handleClick);
    return () => {
      canvas.removeEventListener("click", handleClick);
    };
  }, []);

  const handleConfirmMoveClick = async () => {
    if (destinationRef.current && !pullGameState) {
      if (!isPlayerTurn) {
        console.log("Not your turn!");
        return true;
      }

      if (currentCardRef.current === 7 && currentDistanceref.current !== 7) {
        return true;
      }
      try {
        let player_Id = localStorage.getItem("userId" + randomId) ?? ""
        const body = secondSelectedDestinationRef.current
      ? {
          Move: {
            From: selectedPieceRef.current?.id,
            To: destinationRef.current,
            Effect: selectedEffect
          },
          SplitMove: {
            From: secondSelectedPieceRef.current?.id,
            To: secondSelectedDestinationRef.current,
            Effect: secondEffect
          },
        }
      : {
          Move: {
            From: selectedPieceRef.current?.id,
            To: destinationRef.current,
            Effect: selectedEffect
          },
        };
        console.log(body)

        const res = await fetch(MOVE_PAWN(player_Id),  {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body)
        })
        if (!res.ok) {
          throw Error("failed to post move")
        }
        
        setLoading(false)
        resetSelections();
        return true;
      }
      catch(err) {
        console.error("Error fetching game state:", err);
        setLoading(false)
        return false;
      }
    }
    return false;
  };
  const handleSecondPawnClick = (x: number, y: number) => {
    if (!possibleSecondPawnsRef.current) return false;
    for (const tile of possibleSecondPawnsRef.current) {
      const dx = x - tile.piece.drawX;
      const dy = y - tile.piece.drawY;
      if (Math.sqrt(dx * dx + dy * dy) <= radius) {
        setSecondDestination(tile.move.to);
        setSecondSelectedPiece(tile.piece);
        setSecondSelectedEffect(tile.move.effects[0])
        const distance = findPath(tile.move.from, tile.move.to).length - 1;
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
      const pixel = coordMap[tile.to];
      const dx = x - pixel.x;
      const dy = y - pixel.y;
      if (Math.sqrt(dx * dx + dy * dy) <= radius) {
        if (!selectedPieceRef.current) return false;

        setdestination(tile.to);
        if (tile.effects.length > 1) {
          setPossibleEffects(tile.effects);

          // Position the popup near the clicked tile
          let coords = getUnrotatedMousePosition(coordMap[tile.to].x, coordMap[tile.to].y, colorToAngleDict[playerColorRef.current]);
          setEffectPopupPosition({
            x: coords.x,
            y: coords.y - tileSize,
          });
        } else {
          // Auto-select the only effect
          setSelectedEffect(tile.effects[0]);
          setEffectPopupPosition(null);
        }

        if (currentCardRef.current === 7) {
          const current = findPath(tile.from, tile.to).length - 1
          console.log(current, findPath(tile.from, tile.to));
          setCurrentDistance(current);
          const target = 7 - current;
          const possibleSeconds = [];

          for (const piece of drawnPiecesRef.current) {
            if (
              PossibleMovesRef.current &&
              selectedPieceRef.current !== piece
            ) {
              const matching = PossibleMovesRef.current.find(
                (m) => m.pawn === piece.id
              );
              const canBeSecond = matching?.move?.find(
                (m) => (findPath(m.from, m.to).length - 1) === target
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
         console.log(x, y, piece.color)
        if (piece.color != playerColorRef.current) return;
        setSelectedPiece(piece);

        const matching = PossibleMovesRef.current?.find(
          (m) => m.pawn === piece.id
        );
        console.log(matching)
        console.log(PossibleMovesRef.current, piece.id)
        setHighlightedTiles(matching?.move ?? []);
        return true;
      }
    }

    return false;
  };

  const handleDeckClick = async () => {
    console.log("Deck clicked! Sending to backend...");
    setLoading(true);
    try {
      let player_Id = localStorage.getItem("userId" + randomId) ?? ""
      const res = await fetch(DRAW_CARD(player_Id),  {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
    })
      const response = await res.json()
      if (!res.ok) {
        throw Error("failed to draw card")
      }
      console.log(response)
      setPossibleMoves(response.movesets);
      localStorage.setItem("drawCard", JSON.stringify(response))
      animateCardSwap(deck_card, card_path(numberDict[response.cardDrawn]))
      setCurrentCard(response.cardDrawn);
      setView(response.view)
      setLoading(false)
      return true;
    }
    catch(err) {
      console.error("Error fetching game state:", err);
      setLoading(false)
      return null;
    }
  };

  const handleTopCardClick = () => {
    console.log("top card clicked! zooming in...");
    console.log(topCardPath)
    setShowZoomedCard(true);
    return true;
  };

  const resetSelections = () => {
    setSelectedPiece(null);
    setdestination(null);
    setHighlightedTiles([]);
    setSecondDestination(null);
    setPossibleSecondPawns([]);
    setSecondSelectedPiece(null);
    setSelectedEffect(null);
    setSecondSelectedEffect(null);
    setPossibleEffects([]);
    setEffectPopupPosition(null);
  };

  useEffect(() => {
    drawPieces(playerColorRef.current);
    selectedPieceRef.current = selectedPiece;
  }, [selectedPiece]);

  useEffect(() => {
    console.log("color change: " + playerColor)
    drawWithRotation(playerColor)
    setAngle(colorToAngleDict[playerColor])
    drawPieces(playerColor)
    if (playerColor != "") {
      playerColorRef.current = playerColor
      if ((gamePhase == colorToIndex[playerColorRef.current]*2) || (gamePhase == (colorToIndex[playerColorRef.current]*2 + 1))) {
        setIsPlayerTurn(true);
      } else {
        setIsPlayerTurn(false)
      }
    }
  }, [playerColor]);

  useEffect(() => {
    console.log("changed view", view)
    viewRef.current = view
  }, [view]);

  const fetchGameState = async (playerId: string) => {
    try {
      const res = await fetch(GET_GAMESTATE(playerId));

      if (!res.ok) {
        throw new Error("Failed to pull game state");
      }

      const gameState = await res.json();
      console.log("Game State:", gameState, gameState.currentView);
      if (gameState.gamePhase != 8) {
        setGameStarted(true)
      }
      setView(gameState.currentView)
      if (gameState.lastDrawnCard in numberDict && !isPlayerTurn) {
        animateCardSwap(deck_card, card_path(numberDict[gameState.lastDrawnCard]))
        setCurrentCard(gameState.lastDrawnCard)
      }
      let pieces = gameState.pieces
      const colorOrder = ["blue", "yellow", "green", "red"];
      const colorToPieces: Record<string, string[]> = {};
      for (let row = 0; row < pieces.length; row++) {
        const color = colorOrder[row];
        colorToPieces[color] = pieces[row].slice(); 
      }
      console.log(colorToIndex[playerColorRef.current], playerColorRef.current, gameState.gamePhase)
      if ((gameState.gamePhase == colorToIndex[playerColorRef.current]*2) || ( gameState.gamePhase == (colorToIndex[playerColorRef.current]*2 + 1))) {
        setIsPlayerTurn(true);
      } else {
        setIsPlayerTurn(false)
      }
      applyGameState(colorToPieces)
      setTurnOrder(gameState.turnOrder)
      setLocalTurnOrder(gameState.turnOrder)
      setGamePhase(gameState.gamePhase)
    } catch (err) {
      console.error("Error fetching game state:", err);
      return null;
    }
  };

  // Simulate fetching the gameState from backend
  const heartbeat = async (playerId: string) => {
    if (devMode) return;
    try {
      if (pullGameState) return;
      // console.log(GET_HEARTBEAT(playerId))
      console.log(viewRef)
      const res = await fetch(GET_HEARTBEAT(playerId), {
        method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(viewRef.current)
        });
      console.log(res)
      if (!res.ok) {
        setPullGamestate(true)
      }

      // applyGameState(gameState);
    } catch (err) {
      console.error("Error fetching game state:", err);
      return null;
    }
  };

  const animateCardSwap = (oldSrc: string, newSrc: string) => {
    setFloatingCard({ oldSrc, newSrc, x:cardX1, y: cardY, phase: "start" });
  };
  
const animatePieceAlongPath = (
  pieceId: string,
  path: string[],
  speed: number = 300
): Promise<void> => {
  return new Promise((resolve) => {
    // console.log(path)
    const allPlayers = [...playersref.current];
    const targetPlayer = allPlayers.find(p => p.pieces.some(pc => pc.id === pieceId));
    if (!targetPlayer)  {
      resolve(); 
      return;
    }
    const pieceIndex = targetPlayer.pieces.findIndex(pc => pc.id === pieceId);
    if (pieceIndex === -1) {
      resolve();
      return;
    }

    let stepIndex = 1;

    const moveToNext = () => {
      // console.log(stepIndex)
      if (stepIndex >= path.length) {
        // Final update to state after full path
        setPlayers(allPlayers);
        resolve();
        return;
      }

      const coord = path[stepIndex];
      const pixel = coordMap[coord];
      // console.log(pixel, coord)
      if (!pixel) {
        return;
        resolve();
      }

      // Update the logical position
      targetPlayer.pieces[pieceIndex].x = pixel.x;
      targetPlayer.pieces[pieceIndex].y = pixel.y;
      // console.log(allPlayers)
      setPlayers([...allPlayers]); // trigger state update for redraw

      stepIndex++;
      setTimeout(moveToNext, speed);
    };

    moveToNext();
  });
};


useEffect(() => {
  const cardPaths = Object.values(numberDict).map(n => `/Cards/FaceCards/${n}.png`);
  cardPaths.forEach(path => {
    const img = new Image();
    img.src = path;
  });
}, []);

  useEffect(() => {
    let userId = localStorage.getItem("userId" + randomId)
    if (pullGameState) {
      fetchGameState(userId ?? "")
    }
    setPullGamestate(false)
  }, [pullGameState])

  useEffect(() => {
    if (devMode) return;
    console.log("refreshed")
    const storedId = localStorage.getItem("userId" + randomId);
    const interval = setInterval(async () => {
      await heartbeat(storedId ?? "");
    }, 4000); 
    const refresh = async () => {
      drawWithRotation(playerColorRef.current);
      setAngle(colorToAngleDict[playerColorRef.current])
      drawPieces(playerColorRef.current);
      console.log("start fetch")
      await fetchGameState(storedId ?? "")
      console.log("end fetch")
      const storedResponse = JSON.parse(localStorage.getItem("drawCard") || "{}");
      console.log(storedResponse)
      setPossibleMoves(storedResponse.movesets)
      if (storedResponse.cardDrawn in numberDict) {
        setTopCardPath(card_path(numberDict[storedResponse.cardDrawn]))
        setCurrentCard(storedResponse.cardDrawn)
      }
    }
    refresh();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    playersref.current = players
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
    console.log(topCardPath)
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

  useEffect(() => {
    possibleEffectsRef.current = possibleEffects;
  }, [possibleEffects]);

  useEffect(() => {
    if (!devMode) return;

    const dummyGameState: GameState = {
      red: ["d_4", "d_S", "d_S", "d_S"],
      blue: ["d_15", "a_S", "a_8", "a_S"],
      yellow: ["b_S", "b_S", "b_S", "b_S"],
      green: ["c_S", "c_S", "c_S", "c_S"]
    };

    setGameStarted(true);
    setPossibleMoves(mockCardResponse11.movesets)
    applyGameState(dummyGameState);
    setIsPlayerTurn(true)
    playerColorRef.current = "red"
    // const nextDummyGameState: GameState = {
    //   red: ["d_S", "d_S", "d_S", "d_S"],
    //   blue: ["a_S", "a_S", "a_S", "a_S"],
    //   yellow: ["b_S", "b_S", "b_S", "b_S"],
    //   green: ["c_S", "c_S", "c_S", "c_S"]
    // };

    // Optional: trigger an animation after mount
    setTimeout(() => {
      // applyGameState(nextDummyGameState)
      // animateCardSwap("Cards/deck.png", "/Cards/FaceCards/two.png")
    }, 3000);
  }, []);

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
    {/* Deck Button */}
<button
  onClick={async () => {
    if (loadingRef.current || pullGameState || !isPlayerTurn) return;
    await handleDeckClick();
  }}
  style={{
    position: "absolute",
    top: cardY,
    left: cardX1,
    width: cardW,
    height: cardH,
    border: "none",
    cursor: "pointer",
    padding: 0,
    overflow: "hidden",
    zIndex: 30,
    background: `url(${deck_card}) no-repeat center/contain`,
  }}
  aria-label="Draw from deck"
  className="relative group"
>
  <div
    className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-30 transition-opacity duration-200 rounded"
    style={{ pointerEvents: "none" }}
  />
</button>

{/* Top Card Button */}
<button
  onClick={() => {
    if (loadingRef.current || pullGameState) return;
    handleTopCardClick();
  }}
  style={{
    position: "absolute",
    top: cardY,
    left: cardX2,
    width: cardW,
    height: cardH,
    border: "none",
    cursor: "pointer",
    padding: 0,
    overflow: "hidden",
    zIndex: 30,
    background: `url(${topCardPath}) no-repeat center/contain`,
  }}
  aria-label="view top card"
  className="relative group"
>
  <div
    className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-30 transition-opacity duration-200 rounded"
    style={{ pointerEvents: "none" }}
  />
</button>
    {isPlayerTurn && (
     <button
      onClick={handleConfirmMoveClick}
      className="absolute font-bold z-20 shadow-md transition-colors duration-200 
                bg-white text-black hover:bg-yellow-300"
      style={{
        top: cardY + cardH + 0.3 * tileSize,
        left: (cardX1 + cardX2) / 2 - 0.15 * tileSize,
        width: canvasWidth * 0.2,
        height: canvasHeight * 0.06,
        fontSize: canvasHeight * 0.03,
        borderRadius: canvasHeight * 0.02,
      }}
    >
      Your Turn
    </button>
    )}
{effectPopupPosition && possibleEffects.length > 1 && (
  <div
    style={{
      position: "absolute",
      left: effectPopupPosition.x,
      top: effectPopupPosition.y,
      zIndex: 100,
      backgroundColor: "black",
      border: "1px solid black",
      borderRadius: "8px",
      padding: "0.5rem",
      boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
    }}
  >
    {possibleEffects.map((eff) => (
      <div
        key={eff}
        onClick={() => {
          setSecondSelectedEffect(eff); // just select, don't close
        }}
        style={{
          padding: "0.25rem 0.5rem",
          cursor: "pointer",
          borderBottom: "1px solid #ccc",
          backgroundColor: eff === selectedEffect ? "#444" : "transparent", // 👈 highlight
          color: eff === selectedEffect ? "white" : "lightgray",
          borderRadius: "4px"
        }}
      >
        <button
          style={{
            background: "none",
            border: "none",
            color: "inherit",
            fontWeight: "bold",
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.stopPropagation(); // prevent bubbling to parent div
            setSelectedEffect(eff);
          }}
        >
          {eff === 4 ? "Swap" : "Move"}
        </button>
      </div>
    ))}
  </div>
)}

{floatingCard && (
  <div
    style={{
      position: "absolute",
      left: floatingCard.x,
      top: floatingCard.y,
      width: cardW,
      height: cardH,
      pointerEvents: "none",
      zIndex: 1000,
    }}
  >
    {/* Old card: rising and fading out */}
<img
  src={floatingCard.oldSrc}
  alt="Old card"
  style={{
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: floatingCard.phase === "animate" ? 0 : 1,
    animation:
      floatingCard.phase === "start"
        ? "riseThenRight 2s forwards ease-in-out"
        : (floatingCard.phase === "animate" ? "fallThenLeft 2s forwards ease-in-out" : "none"),
  }}
  onAnimationEnd={() => {
    if (floatingCard.phase === "start") {
      setFloatingCard((prev) => {
        if (!prev) return null;
        return { ...prev, oldSrc: prev.newSrc, phase: "animate" };
      });
    }
    if (floatingCard.phase === "animate") {
      setTopCardPath(floatingCard.oldSrc);
      setFloatingCard(null);
    }
  }}
/>
  </div>
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
        {localTurnOrder[(gamePhase  - (gamePhase % 2)) / 2]} is playing...
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
            src={topCardPath}
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
