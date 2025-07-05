"use client";
import { useEffect, useRef, useState } from "react";
import { Player } from "../../components/Player"; // assumes Player has a draw(ctx) method
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
import { mockCardResponse2 } from "../mockData/moveset2";
import { mockCardResponse11 } from "../mockData/moveset11";
import { mockCardResponse7 } from "../mockData/moveset7";
import { coordMap, getUnrotatedMousePosition } from "@/utils/outerPath";
import { drawPiecesWithOffset } from "@/utils/drawUtils";
import { useSearchParams } from "next/navigation";
import CardControls from "@/components/CardControls";
import OverlayHighlights from "@/components/OverlayHighlights";
import EffectPopup from "@/components/EffectPopup";
import LoadingOverlay from "@/components/loadingOverlay";
import ZoomedCard from "@/components/zoomedCard";
import PiecesLayer from "@/components/piecesLayer";
import { drawWithRotation } from "@/utils/canvasUtils";
import { applyGameState, getTurnPhaseForPlayer } from "@/utils/gameUtils";
import { useSyncedRef } from "@/hooks/useSyncedRef";
import { useGameSelections } from "@/hooks/useGameSelections";
import { GameState } from "@/utils/gameUtils";

export type Piece = {
  x: number;
  y: number;
  color: string;
  isActive: boolean;
  id: string;
};
export type MoveSet = {
  pawn: string;
  move: Move[];
};
export type Move = {
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

  const [drawnPieces, setDrawnPieces] = useState<DrawnPiece[]>([]);

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

  const [highlightedTiles, setHighlightedTiles] = useState<Move[]>([]);

  const [selectedPiece, setSelectedPiece] = useState<number>(-1);
  const selectedPieceRef = useRef<number>(-1);

  const [secondSelectedPiece, setSecondSelectedPiece] = useState<number>(-1);
  const secondSelectedPieceRef = useRef<number>(-1);

  const [destination, setdestination] = useState<string | null>(null);
  const destinationRef = useRef<string | null>(null);

  const [possibleEffects, setPossibleEffects] = useState<number[]>([]);

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

  const { resetSelections, resetAllSelections } = useGameSelections({
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
  });

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

    setDrawnPieces(drawPiecesWithOffset(allPawns));
  };

  const handleConfirmMoveClick = async () => {
    if (destinationRef.current && !pullGameState) {
      if (!isPlayerTurn) {
        console.log("Not your turn!");
        return true;
      }
      console.log("hello");
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
                From: drawnPieces[secondSelectedPieceRef.current].id,
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

  const handleSecondPawnClick = (move: Move) => {
    const new_idx = drawnPieces.findIndex((p) => p.id == move.from);
    setSecondDestination(move.to);
    setSecondSelectedPiece(new_idx);
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
        x: coords.x + tileSize / 2,
        y: coords.y - (3 * tileSize) / 2,
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
        console.log(piece, selectedEffect, PossibleMovesRef.current);
        if (PossibleMovesRef.current && drawnPieces[selectedPiece] !== piece) {
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
      console.log("possible Second", possibleSeconds)
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

  useEffect(() => {
    drawPieces(playerColorRef.current);
    selectedPieceRef.current = selectedPiece;
  }, [selectedPiece]);

  useEffect(() => {
    console.log("color change: " + playerColor);
    if (canvasRef.current) {
      drawWithRotation(canvasRef.current, playerColor, playerColorRef.current);
    }
    setAngle(colorToAngleDict[playerColor]);
    if (playerColor != "") {
      playerColorRef.current = playerColor;
      setIsPlayerTurn(getTurnPhaseForPlayer(gamePhase, playerColorRef.current));
      drawPieces(playerColor);
    }
  }, [playerColor]);

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
        colorToPieces[color] = pieces[row];
      }
      console.log(
        colorToIndex[playerColorRef.current],
        playerColorRef.current,
        gameState.gamePhase
      );
      setIsPlayerTurn(getTurnPhaseForPlayer(gameState.gamePhase, playerColorRef.current));
      const players = applyGameState(colorToPieces);
      setPlayers(players);
      setTurnOrder(gameState.turnOrder);
      setLocalTurnOrder(gameState.turnOrder);
      setGamePhase(gameState.gamePhase);
      if (gameState.gamePhase == 9) {
        setGameOver(true)
      }
    } catch (err) {
      console.error("Error fetching game state:", err);
      return null;
    }
  };

  useEffect(() => {
    if (devMode) return;
    const playerId = localStorage.getItem("userId" + randomId) ?? ""; 
    console.log(GET_GAMESTREAM(playerId));
    const eventSource = new EventSource(GET_GAMESTREAM(playerId));

    eventSource.onmessage = (event) => {
      if (event.data != viewRef.current) {
        setPullGamestate(true);
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
      if (canvasRef.current) {
        drawWithRotation(canvasRef.current, playerColor, playerColorRef.current);
      }
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
    destinationRef.current = destination;
    drawPieces(playerColorRef.current);
  }, [destination]);

  useEffect(() => {
    secondSelectedPieceRef.current = secondSelectedPiece;
    drawPieces(playerColorRef.current);
  }, [secondSelectedPiece]);

  useEffect(() => {
    secondSelectedDestinationRef.current = secondDestination;
    drawPieces(playerColorRef.current);
  }, [secondDestination]);

  useEffect(() => {
    if (isPlayerTurn == "wait") {
      resetAllSelections();
    }
  }, [isPlayerTurn]);

  useSyncedRef(loadingRef, loading);
  useSyncedRef(PossibleMovesRef, possibleMoves);
  useSyncedRef(destinationRef, destination);
  useSyncedRef(currentCardRef, currentCard);
  useSyncedRef(topCardPathRef, topCardPath);
  useSyncedRef(currentDistanceref, currentDistance);

  useEffect(() => {
    if (!devMode) return;

    const dummyGameState: GameState = {
      red: ["b_14", "d_S", "d_S", "d_S"],
      blue: ["a_S", "a_S", "a_S", "a_S"],
      yellow: ["c_s1", "c_s2", "d_11", "a_4"],
      green: ["c_S", "c_8", "c_S", "c_S"],
    };

    setGameStarted(true);
    setPossibleMoves(mockCardResponse11.movesets);
    playerColorRef.current = "red";
    applyGameState(dummyGameState);
    setCurrentCard(11)
    setIsPlayerTurn("move");
    // setCurrentCard(7)
    const nextDummyGameState: GameState = {
      red: ["b_14", "c_8", "d_S", "d_S"],
      blue: ["a_S", "a_S", "a_S", "a_S"],
      yellow: ["c_s1", "c_s2", "d_11", "a_4"],
      green: ["c_S", "c_S", "c_S", "c_S"],
    };

    // Optional: trigger an animation after mount
    setTimeout(() => {
      setTopCardPath(card_path("eleven"));
      applyGameState(nextDummyGameState)
    }, 3000);

  }, []);

  const handlePieceSelection = (piece: DrawnPiece, idx: number) => {
    if (piece.color !== playerColorRef.current) return false;
    resetSelections();
    setSelectedPiece(idx);

    const matching = PossibleMovesRef.current?.find((m) => m.pawn === piece.id);

    console.log(matching);
    console.log(PossibleMovesRef.current, piece.id);

    setHighlightedTiles(matching?.move ?? []);
  };
  return (
    <div className="flex flex-col items-center">
      <div className="min-h-screen flex items-center justify-center bg-black-200">
        <div
          className={`relative ${loading ? "blur-sm pointer-events-none" : ""}`}
          style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
          onClick={() => {
            resetSelections();
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className={`absolute top-0 left-0 z-0 pointer-events-none`}
            style={{ display: "block" }}
          />
          <PiecesLayer
            drawnPieces={drawnPieces}
            selectedPiece={selectedPiece}
            secondSelectedPiece={secondSelectedPiece}
            playerColor={playerColorRef.current}
            onPieceSelect={handlePieceSelection}
          />
          <OverlayHighlights
            highlightedTiles={highlightedTiles}
            destination={destination}
            playerColor={playerColorRef.current}
            onTileClick={handleTileHighlightClick}
            secondDestination={secondDestination}
            possibleSecondPawns={possibleSecondPawns}
            secondSelectedPiece={secondSelectedPiece}
            onSecondPawnClick={handleSecondPawnClick}
          />
          <CardControls
            onDeckClick={handleDeckClick}
            onTopCardClick={handleTopCardClick}
            topCardPath={topCardPath}
            isPlayerTurn={isPlayerTurn}
            gamePhase={gamePhase}
            localTurnOrder={localTurnOrder}
            handleConfirmMoveClick={handleConfirmMoveClick}
          />
          {effectPopupPosition && possibleEffects.length > 1 && (
            <EffectPopup
              position={effectPopupPosition}
              effects={possibleEffects}
              selectedEffect={selectedEffect}
              onSelectEffect={(eff) => setSecondSelectedEffect(eff)}
              onClickEffect={(eff) => {
                setSelectedEffect(eff);
              }}
            />
          )}

        </div>
      </div>

      {loading && <LoadingOverlay />}

      {showZoomedCard && (
        <ZoomedCard imageSrc={topCardPath} onClose={() => setShowZoomedCard(false)} />
      )}
    </div>
  );
}
