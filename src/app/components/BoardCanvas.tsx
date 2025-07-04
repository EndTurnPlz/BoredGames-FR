"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "./Player"; // assumes Player has a draw(ctx) method
import {
  drawCircle,
  fillTile,
  drawStripWithTriangleAndCircle,
  drawAllCircles,
  drawSafetyWord,
} from "@/utils/drawUtils";
import { coordStringToPixel, findPath } from "@/utils/outerPath";
import {
  tileSize,
  canvasWidth,
  canvasHeight,
  numberDict,
  colorToAngleDict,
  GET_GAMESTATE,
  DRAW_CARD,
  MOVE_PAWN,
  colorToIndex,
  deck_card,
  card_path,
  GET_GAMESTREAM,
} from "@/utils/config";
import { getRotationAngleForColor } from "@/utils/rotation";
import { mockCardResponse2 } from "../mockData/moveset2";
import { mockCardResponse11 } from "../mockData/moveset11";
import { mockCardResponse7 } from "../mockData/moveset7";
import { coordMap, getUnrotatedMousePosition } from "@/utils/outerPath";
import { drawPiecesWithOffset } from "@/utils/drawUtils";
import {
  cardH,
  cardW,
  cardX1,
  cardX2,
  cardY,
  darkColorMap,
} from "@/utils/config";
import { useSearchParams } from "next/navigation";

type GameState = {
  [color: string]: string[];
};
export type Piece = {
  x: number;
  y: number;
  color: string;
  isActive: boolean;
  id: string;
};
type MoveSet = {
  pawn: string;
  move: Move[];
};
type Move = {
  from: string;
  to: string;
  effects: number[];
};

type BoardCanvasProps = {
  playerColor: string;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  setTurnOrder: React.Dispatch<React.SetStateAction<string[]>>;
  setGameStarted: React.Dispatch<React.SetStateAction<boolean>>;
};

export type DrawnPiece = Piece & { drawX: number; drawY: number };
type Card = { x: number; y: number; height: number; width: number };

export default function GameCanvas({
  playerColor = "red",
  setGameOver,
  setTurnOrder,
  setGameStarted,
}: BoardCanvasProps) {
  const searchParams = useSearchParams();
  const randomId = searchParams.get("randomId");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [angle, setAngle] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState("draw");

  const [topCardPath, setTopCardPath] = useState<string>(deck_card);
  const topCardPathRef = useRef<string>(deck_card);

  const [currentCard, setCurrentCard] = useState<number>(0);
  const currentCardRef = useRef<number | null>(null);

  const [players, setPlayers] = useState<Player[]>([]);
  const playersref = useRef<Player[]>([]);
  const playerColorRef = useRef<string>("green");

  const [drawnPieces, setDrawnPieces] = useState<DrawnPiece[]>([])
  const drawnPiecesRef = useRef<DrawnPiece[]>([]);

  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  const [localTurnOrder, setLocalTurnOrder] = useState<string[]>([]);
  const [gamePhase, setGamePhase] = useState<number>(8);

  let devMode = false;

  const [view, setView] = useState(-1);
  const viewRef = useRef<number | null>(null);

  const [pullGameState, setPullGamestate] = useState(false);

  const [possibleMoves, setPossibleMoves] = useState<MoveSet[]>([]);
  const PossibleMovesRef = useRef<MoveSet[] | null>(null);

  const [possibleSecondPawns, setPossibleSecondPawns] = useState<
    { piece: DrawnPiece; move: Move }[]
  >([]);
  const possibleSecondPawnsRef = useRef<
    { piece: DrawnPiece; move: Move }[] | null
  >(null);

  const [highlightedTiles, setHighlightedTiles] = useState<Move[]>([]);
  const highlightedTilesRef = useRef<Move[] | null>(null);

  const [selectedPiece, setSelectedPiece] = useState<number>(-1);
  const selectedPieceRef = useRef<number>(-1);

  const [secondSelectedPiece, setSecondSelectedPiece] =
    useState<number>(-1);
  const secondSelectedPieceRef = useRef<number>(-1);

  const [destination, setdestination] = useState<string | null>(null);
  const destinationRef = useRef<string | null>(null);

  const [possibleEffects, setPossibleEffects] = useState<number[]>([]);
  const possibleEffectsRef = useRef<number[]>([]);

  const [effectPopupPosition, setEffectPopupPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<number | null>(null);

  const [secondEffect, setSecondSelectedEffect] = useState<number | null>(null);

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
      drawCircle(
        ctx,
        x,
        y,
        circleRadius,
        color,
        tileSize,
        text,
        angle,
        playerColorRef.current
      )
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
        const colors = [
          darkColorMap["red"],
          darkColorMap["yellow"],
          darkColorMap["blue"],
          darkColorMap["green"],
        ];

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
        x: 9.5 * tileSize,
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
      {
        zone: redSafetyZone,
        angle: 90,
        offsetX: 2 * tileSize,
        offsetY: tileSize / 2,
      },
      { zone: blueSafetyZone, angle: 360, offsetX: 1.5 * tileSize, offsetY: 0 },
      {
        zone: greenSafetyZone,
        angle: 180,
        offsetX: 0.5 * tileSize,
        offsetY: -2 * tileSize,
      },
      {
        zone: yellowSafetyZone,
        angle: 270,
        offsetX: 0,
        offsetY: 1.5 * tileSize,
      },
    ];

    safetyConfigs.forEach(({ zone, angle, offsetX, offsetY }) => {
      drawSafetyWord(ctx, zone, angle, offsetX, offsetY);
    });
  };

  const drawWithRotation = (color: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
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

    const allPawns = players.flatMap((p) =>
      p.pieces.map((piece) => ({
        x: piece.x,
        y: piece.y,
        color: p.color,
        isActive: false,
        id: piece.id,
      }))
    );

    setDrawnPieces(drawPiecesWithOffset(allPawns))
  };

  const applyGameState = async (gameState: GameState) => {
    const oldPlayers = playersref.current;

    const newPlayers: Player[] = [];
    const animationPromises: Promise<void>[] = [];

    for (const color in gameState) {
      const coordStrings = gameState[color];
      const oldPlayer = oldPlayers.find((player) => player.color === color);
      const positions = coordStrings.map((coord) =>
        coordStringToPixel(coord, tileSize)
      );
      const player = new Player(color, positions);
      newPlayers.push(player);
    }
    await Promise.all(animationPromises);
    setPlayers(newPlayers);
  };

  const handleConfirmMoveClick = async () => {
    if (destinationRef.current && !pullGameState) {
      if (!isPlayerTurn) {
        console.log("Not your turn!");
        return true;
      }
      console.log("hello")
      if (currentCardRef.current === 7 && currentDistanceref.current !== 7) {
        return true;
      }
      try {

        let player_Id = localStorage.getItem("userId" + randomId) ?? "";
        const body = secondSelectedDestinationRef.current
          ? {
              Move: {
                From: drawnPieces[selectedPiece].id,
                To: destinationRef.current,
                Effect: selectedEffect,
              },
              SplitMove: {
                From: possibleSecondPawns[secondSelectedPieceRef.current].piece.id,
                To: secondSelectedDestinationRef.current,
                Effect: secondEffect,
              },
            }
          : {
              Move: {
                From: drawnPieces[selectedPiece].id,
                To: destinationRef.current,
                Effect: selectedEffect,
              },
            };
        console.log(body);

        const res = await fetch(MOVE_PAWN(player_Id), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          throw Error("failed to post move");
        }

        setLoading(false);
        resetSelections();
        return true;
      } catch (err) {
        console.error("Error fetching game state:", err);
        setLoading(false);
        return false;
      }
    }
    return false;
  };

  const handleSecondPawnClick = (move: Move, idx: number) => {
    console.log()
    setSecondDestination(move.to);
    setSecondSelectedPiece(idx);
    setSecondSelectedEffect(move.effects[0]);
    const distance = findPath(move.from, move.to).length - 1;
    const current = currentDistanceref.current ?? 0;
    setCurrentDistance(current + distance);
    return true;
  };

  const handleTileHighlightClick = (tile: Move) => {
    if (selectedPieceRef.current == -1) return false;

    setdestination(tile.to);

    if (tile.effects.length > 1) {
      setPossibleEffects(tile.effects);

      // Calculate popup position near tile
      let coords = getUnrotatedMousePosition(
        coordMap[tile.to].x,
        coordMap[tile.to].y,
        colorToAngleDict[playerColorRef.current]
      );
      setEffectPopupPosition({
        x: coords.x + tileSize/2,
        y: coords.y - 3*tileSize/2,
      });
    } else {
      setSelectedEffect(tile.effects[0]);
      setEffectPopupPosition(null);
    }
    if (currentCardRef.current === 7) {
      const current = findPath(tile.from, tile.to).length - 1;
      setCurrentDistance(current);

      const target = 7 - current;
      const possibleSeconds = [];

      for (const piece of drawnPieces) {
        console.log(piece, selectedEffect, PossibleMovesRef.current)
        if (
          PossibleMovesRef.current &&
          drawnPieces[selectedPiece] !== piece
        ) {
          const matching = PossibleMovesRef.current.find(
            (m) => m.pawn === piece.id
          );
          const canBeSecond = matching?.move?.find(
            (m) => findPath(m.from, m.to).length - 1 === target
          );
          if (canBeSecond) {
            possibleSeconds.push({ piece, move: canBeSecond });
          }
        }
      }
      console.log(possibleSeconds)
      setPossibleSecondPawns(possibleSeconds);
    }

    return true;
  };


  const handleDeckClick = async () => {
    console.log("Deck clicked! Sending to backend...");
    setLoading(true);
    try {
      let player_Id = localStorage.getItem("userId" + randomId) ?? "";
      const res = await fetch(DRAW_CARD(player_Id), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const response = await res.json();
      if (!res.ok) {
        throw Error("failed to draw card");
      }
      console.log(response);
      setPossibleMoves(response.movesets);
      localStorage.setItem("drawCard", JSON.stringify(response));
      setTopCardPath(card_path(numberDict[response.cardDrawn]));
      setCurrentCard(response.cardDrawn);
      setView(response.view);
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Error fetching game state:", err);
      setLoading(false);
      return null;
    }
  };

  const handleTopCardClick = () => {
    console.log("top card clicked! zooming in...");
    console.log(topCardPath);
    setShowZoomedCard(true);
    return true;
  };

  const setPlayerTurn = (phase: number) => {
    if (phase == colorToIndex[playerColorRef.current] * 2) {
      setIsPlayerTurn("draw");
    } else if (phase == colorToIndex[playerColorRef.current] * 2 + 1) {
      setIsPlayerTurn("move");
    } else {
      setIsPlayerTurn("wait");
    }
  };

  const resetAllSelections = () => {
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
    setPossibleMoves([])
  };

  const resetSelections = () => {
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
  };

  useEffect(() => {
    drawPieces(playerColorRef.current);
    selectedPieceRef.current = selectedPiece;
  }, [selectedPiece]);

  useEffect(() => {
    console.log("color change: " + playerColor);
    drawWithRotation(playerColor);
    setAngle(colorToAngleDict[playerColor]);
    if (playerColor != "") {
      playerColorRef.current = playerColor;
      setPlayerTurn(gamePhase);
      drawPieces(playerColor);
    }
  }, [playerColor]);

  useEffect(() => {
    console.log("changed view", view);
    viewRef.current = view;
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
        setGameStarted(true);
      }
      setView(gameState.currentView);
      if (gameState.lastDrawnCard in numberDict && isPlayerTurn != "move") {
        setTopCardPath(card_path(numberDict[gameState.lastDrawnCard]));
        setCurrentCard(gameState.lastDrawnCard);
      }
      let pieces = gameState.pieces;
      const colorOrder = ["blue", "yellow", "green", "red"];
      const colorToPieces: Record<string, string[]> = {};
      for (let row = 0; row < pieces.length; row++) {
        const color = colorOrder[row];
        colorToPieces[color] = pieces[row].slice();
      }
      console.log(
        colorToIndex[playerColorRef.current],
        playerColorRef.current,
        gameState.gamePhase
      );
      setPlayerTurn(gameState.gamePhase);
      applyGameState(colorToPieces);
      setTurnOrder(gameState.turnOrder);
      setLocalTurnOrder(gameState.turnOrder);
      setGamePhase(gameState.gamePhase);
    } catch (err) {
      console.error("Error fetching game state:", err);
      return null;
    }
  };

  useEffect(() => {
    const playerId = localStorage.getItem("userId" + randomId) ?? ""; 
    console.log(GET_GAMESTREAM(playerId));
    const eventSource = new EventSource(GET_GAMESTREAM(playerId));

    eventSource.onmessage = (event) => {
      if (event.data != viewRef.current) {
        setPullGamestate(true)
      }
      console.log("Received:", event.data); // You will get the viewNum here

    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close(); // Clean up when the component unmounts
    };
  }, []);

  useEffect(() => {
    const cardPaths = Object.values(numberDict).map(
      (n) => `/Cards/FaceCards/${n}.png`
    );
    cardPaths.forEach((path) => {
      const img = new Image();
      img.src = path;
    });
  }, []);

  useEffect(() => {
    let userId = localStorage.getItem("userId" + randomId);
    if (pullGameState) {
      fetchGameState(userId ?? "");
    }
    setPullGamestate(false);
  }, [pullGameState]);

  useEffect(() => {
    if (devMode) return;
    console.log("refreshed");
    const storedId = localStorage.getItem("userId" + randomId);

    const refresh = async () => {
      drawWithRotation(playerColorRef.current);
      setAngle(colorToAngleDict[playerColorRef.current]);
      drawPieces(playerColorRef.current);
      console.log("start fetch");
      await fetchGameState(storedId ?? "");
      console.log("end fetch");
      const storedResponse = JSON.parse(
        localStorage.getItem("drawCard") || "{}"
      );
      console.log(storedResponse);
      setPossibleMoves(storedResponse.movesets);
      if (storedResponse.cardDrawn in numberDict) {
        setTopCardPath(card_path(numberDict[storedResponse.cardDrawn]));
        setCurrentCard(storedResponse.cardDrawn);
      }
    };

    refresh();

  }, []);

  useEffect(() => {
    playersref.current = players;
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
    console.log(topCardPath);
    topCardPathRef.current = topCardPath;
    drawWithRotation(playerColorRef.current);
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
    if (isPlayerTurn == "wait") {
      resetAllSelections();
    }
  }, [isPlayerTurn]);

  useEffect(() => {
    if (!devMode) return;

    const dummyGameState: GameState = {
      red: ["d_4", "d_3", "d_S", "d_S"],
      blue: ["d_15", "a_S", "a_8", "a_S"],
      yellow: ["b_S", "b_S", "b_S", "b_S"],
      green: ["c_S", "c_S", "c_S", "c_S"],
    };

    setGameStarted(true);
    setPossibleMoves(mockCardResponse7.movesets);
    playerColorRef.current = "red";
    applyGameState(dummyGameState);
    setIsPlayerTurn("move");
    setCurrentCard(7)
    // const nextDummyGameState: GameState = {
    //   red: ["d_S", "d_S", "d_S", "d_S"],
    //   blue: ["a_S", "a_S", "a_S", "a_S"],
    //   yellow: ["b_S", "b_S", "b_S", "b_S"],
    //   green: ["c_S", "c_S", "c_S", "c_S"]
    // };

    // Optional: trigger an animation after mount
    setTimeout(() => {
      // applyGameState(nextDummyGameState)
    }, 3000);
  }, []);
  
const CardButton = ({ onClick, x, y, src, label }: { onClick: () => void, x: number, y: number, src: string, label: string }) => {
  const hasMounted = useRef(false);
  const [prevSrc, setPrevSrc] = useState(src);

  useEffect(() => {
    if (hasMounted.current) {
      setPrevSrc(src);
    } else {
      hasMounted.current = true;
    }
  }, [src]);

  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        position: "absolute",
        top: y,
        left: x,
        width: cardW,
        height: cardH,
        border: "none",
        padding: 0,
        cursor: "pointer",
        overflow: "hidden",
        zIndex: 30,
        background: "none",
      }}
      className="relative group hover:ring-2 hover:ring-yellow-400 hover:ring-offset-2 transition-all duration-200"
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={src}
          src={src}
          alt="Card"
          initial={hasMounted.current ? { opacity: 0, scale: 0.95 } : false}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3 }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </AnimatePresence>
    </button>
  );
};

const handlePieceSelection = (piece: DrawnPiece, idx: number) => {
  if (piece.color !== playerColorRef.current) return false;

  setSelectedPiece(idx);

  const matching = PossibleMovesRef.current?.find(m => m.pawn === piece.id);

  console.log(matching);
  console.log(PossibleMovesRef.current, piece.id);

  setHighlightedTiles(matching?.move ?? []);

}
  return (
    <div className="flex flex-col items-center">
      <div className="min-h-screen flex items-center justify-center bg-black-200">
        <div
          className={`relative ${loading ? "blur-sm pointer-events-none" : ""}`}
          style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
          onClick={() => {
                    resetSelections()
                  }}
        >
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className={`absolute top-0 left-0 z-0 pointer-events-none`}
            style={{ display: "block" }}
          />
          {drawnPieces.map((piece, idx) => {
            const x = piece.drawX;
            const y = piece.drawY;
            const { x: new_x, y: new_y } = getUnrotatedMousePosition(x, y, colorToAngleDict[playerColorRef.current]);
            return (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); handlePieceSelection(piece, idx)}} // define this handler
                style={{
                  position: "absolute",
                  top: new_y - tileSize/2,
                  left: new_x - tileSize/2,
                  width: tileSize,
                  height: tileSize,
                  backgroundColor: piece.color,
                  borderRadius: "50%",
                  border: (selectedPiece == idx) ? "3px solid gold" : "2px solid white",
                  transition: "top 0.3s ease, left 0.3s ease, border 0.3s ease",
                  zIndex: 1000,
                  cursor: "pointer",
                }}
                aria-label={`Piece at row ${piece.y}, column ${piece.x}`}
              />
            );
          })}
          {highlightedTiles
          .filter((move) => !destination || destination === move.to)
          .map((move, index) => {
            const { x: rawX, y: rawY } = coordStringToPixel(move.to, tileSize);
            const { x, y } = getUnrotatedMousePosition(rawX, rawY, colorToAngleDict[playerColorRef.current]);
            return (
              <div
                key={index}
                onClick={(e) => { e.stopPropagation(); handleTileHighlightClick(move)}} // define this handler
                style={{
                  position: "absolute",
                  top: y - tileSize / 2,
                  left: x - tileSize / 2,
                  width: tileSize,
                  height: tileSize,
                  borderRadius: "50%",
                  border: "3px solid purple",
                  backgroundColor: destination === move.to ? "purple" : "transparent",
                  pointerEvents: "auto",
                  zIndex: 1000,
                }}
              />
            );
          })}
          {possibleSecondPawns.map(({piece, move}, index) => {
            const { x: rawX, y: rawY } = coordStringToPixel(piece.id, tileSize);
            const { x, y } = getUnrotatedMousePosition(rawX, rawY, colorToAngleDict[playerColorRef.current]);
            return (
              <div
                key={index}
                onClick={(e) => { e.stopPropagation(); handleSecondPawnClick(move, index)}} // define this handler
                style={{
                  position: "absolute",
                  top: y - tileSize / 2,
                  left: x - tileSize / 2,
                  width: tileSize,
                  height: tileSize,
                  borderRadius: "50%",
                  border: secondDestination === move.to ?  "3px solid gold" : "3px solid purple",
                  backgroundColor: "transparent",
                  pointerEvents: "auto",
                  zIndex: 1100,
                }}
              />
            );
          })}
          {secondDestination && (() => {
            const { x: rawX, y: rawY } = coordStringToPixel(secondDestination, tileSize);
            const { x, y } = getUnrotatedMousePosition(
              rawX,
              rawY,
              colorToAngleDict[playerColorRef.current]
            );

            return (
              <div
                style={{
                  position: "absolute",
                  top: y - tileSize / 2,
                  left: x - tileSize / 2,
                  width: tileSize,
                  height: tileSize,
                  borderRadius: "50%",
                  border: "3px solid purple", // color to indicate second destination
                  backgroundColor: "purple",
                  pointerEvents: "none",
                  zIndex: 999,
                }}
              />
            );
          })()}
          {/* Deck Button */}
          <CardButton onClick={handleDeckClick} x={cardX1} y={cardY} src={deck_card} label="Draw from deck" />
          {/* Top Card Button */}
          <CardButton onClick={handleTopCardClick} x={cardX2} y={cardY} src={topCardPath} label="View top card" />
          {isPlayerTurn == "move" && (
            <button
              onClick={ (e) => {
                e.stopPropagation(); handleConfirmMoveClick()
              }}
              className="absolute font-bold z-20 shadow-md transition-colors duration-200 
                bg-white text-black hover:bg-yellow-300"
              style={{
                top: cardY + cardH + 0.3 * tileSize,
                left: (cardX1 + cardX2) / 2 - 0.15 * tileSize,
                width: canvasWidth * 0.2,
                height: canvasHeight * 0.06,
                fontSize: canvasHeight * 0.03,
                borderRadius: canvasHeight * 0.02,
                pointerEvents: "auto",
              }}
            >
              Submit Move
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
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
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
                    backgroundColor:
                      eff === selectedEffect ? "#444" : "transparent", // 👈 highlight
                    color: eff === selectedEffect ? "white" : "lightgray",
                    borderRadius: "4px",
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
          {isPlayerTurn != "move" && (
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
              {isPlayerTurn == "wait"
                ? `${localTurnOrder[Math.floor(gamePhase / 2)]} is playing...`
                : "Click Deck to Draw Card"}
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
