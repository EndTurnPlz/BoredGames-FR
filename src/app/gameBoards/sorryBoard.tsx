"use client";
import { useEffect, useRef, useState } from "react";
import { Player } from "../../components/Player/Player"; // assumes Player has a draw(ctx) method
import { findPath } from "@/utils/outerPath";
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
  GET_GAMESTATS,
} from "@/utils/config";
import { mockCardResponse2 } from "../mockData/moveset2";
import { mockCardResponse11 } from "../mockData/moveset11";
import { mockCardResponse7 } from "../mockData/moveset7";
import { coordMap, getUnrotatedMousePosition } from "@/utils/outerPath";
import { drawPiecesWithOffset } from "@/utils/drawUtils";
import { useSearchParams } from "next/navigation";
import CardControls from "@/components/Cards/CardControls";
import OverlayHighlights from "@/components/Pieces/OverlayHighlights";
import EffectPopup from "@/components/Effects/EffectPopup";
import LoadingOverlay from "@/components/Overlays/loadingOverlay";
import ZoomedCard from "@/components/Cards/zoomedCard";
import PiecesLayer from "@/components/Pieces/piecesLayer";
import { drawWithRotation } from "@/utils/canvasUtils";
import { applyGameState, generateMoveString, getTurnPhaseForPlayer } from "@/utils/gameUtils";
import { useSyncedRef } from "@/hooks/useSyncedRef";
import { useGameSelections } from "@/hooks/useGameSelections";
import { GameState } from "@/utils/gameUtils";
import { GameStats } from "../boardGame/page";
import ReconnectOverlay from "@/components/Overlays/ReconnectOverlay";

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
  setMoveLog: React.Dispatch<React.SetStateAction<string[]>>;
  setGameStats: React.Dispatch<React.SetStateAction<GameStats>>;
  setWinner: React.Dispatch<React.SetStateAction<string>>;
};

export type DrawnPiece = Piece & { drawX: number; drawY: number };

export type MoveState = {
  selectedIdx: number;
  destination: string | null;
  effect: number | null;
  possibleMoves: MoveSet[];
  highlightedTiles: Move[];
  possibleEffects: number[];
  effectPopup: { x: number; y: number } | null,
};

// Type for secondMove
export type SecondMoveState = {
  possibleSecondPawns: { piece: DrawnPiece; move: Move }[];
  selectedIdx: number;
  destination: string | null;
  effect: number | null;
};

export default function GameCanvas({
  playerColor = "red",
  setGameOver,
  setTurnOrder,
  setGameStarted,
  setMoveLog,
  setGameStats,
  setWinner
}: BoardCanvasProps) {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
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
  const [playerConnectivity, setPlayerConnectivity] = useState<boolean[]>([])
 
  const [move, setMove] = useState<MoveState>({
    selectedIdx: -1,
    destination: null as string | null,
    effect: null as number | null,
    possibleMoves: [] as MoveSet[],
    highlightedTiles: [] as Move[],
    possibleEffects: [] as number[],
    effectPopup: null as { x: number; y: number } | null,
  });

  const moveRef = useRef<MoveState>({
    selectedIdx: -1,
    destination: null,
    effect: null,
    possibleMoves: [],
    highlightedTiles: [],
    possibleEffects: [],
    effectPopup: null as { x: number; y: number } | null,
  });

  const secondMoveRef = useRef<SecondMoveState>({
    possibleSecondPawns: [],
    selectedIdx: -1,
    destination: null,
    effect: null,
  });

  const [secondMove, setSecondMove] = useState<SecondMoveState>({
    possibleSecondPawns: [] as { piece: DrawnPiece; move: Move }[],
    selectedIdx: -1,
    destination: null as string | null,
    effect: null as number | null,
  });

  const [currentDistance, setCurrentDistance] = useState<number>(0);
  const currentDistanceref = useRef<number | null>(null);

  const [showZoomedCard, setShowZoomedCard] = useState(false);

  const { resetSelections, resetAllSelections } = useGameSelections({
    setMove,
    setSecondMove
  });

  const drawPieces = () => {
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
    if (moveRef.current.destination && !pullGameState) {
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
        const body = secondMoveRef.current.destination
          ? {
              Move: {
                From: drawnPieces[move.selectedIdx].id,
                To: moveRef.current.destination,
                Effect: move.effect,
              },
              SplitMove: {
                From: drawnPieces[secondMoveRef.current.selectedIdx].id,
                To: secondMoveRef.current.destination,
                Effect: secondMoveRef.current.effect,
              },
            }
          : {
              Move: {
                From: drawnPieces[move.selectedIdx].id,
                To: moveRef.current.destination,
                Effect: move.effect,
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
    setSecondMove({
      ...secondMoveRef.current,
      selectedIdx: new_idx,
      destination: move.to,
      effect: move.effects[0],
    })
    const distance = findPath(move.from, move.to).length - 1;
    const current = currentDistanceref.current ?? 0;
    setCurrentDistance(current + distance);
    return true;
  };

  const handleTileHighlightClick = (tile: Move) => {
    if (moveRef.current.selectedIdx == -1) return false;

    if (tile.effects.length > 1) {

      // Calculate popup position near tile
      let coords = getUnrotatedMousePosition(
        coordMap[tile.to].x,
        coordMap[tile.to].y,
        colorToAngleDict[playerColorRef.current]
      );
       setMove({
        ...moveRef.current,
        destination: tile.to,
        possibleEffects: tile.effects,
        effectPopup: {
          x: coords.x + tileSize / 2,
          y: coords.y - (3 * tileSize) / 2,
        }
      })
    } else {
      setMove({
        ...moveRef.current,
        destination: tile.to,
        effect: tile.effects[0],
        effectPopup: null
      })
    }
    if (currentCardRef.current === 7) {
      const current = findPath(tile.from, tile.to).length - 1;
      setCurrentDistance(current);

      const target = 7 - current;
      const possibleSeconds = [];

      for (const piece of drawnPieces) {
        console.log(piece, moveRef.current.effect, moveRef.current.possibleMoves);
        if (moveRef.current.possibleMoves && drawnPieces[moveRef.current.selectedIdx] !== piece) {
          const matching = moveRef.current.possibleMoves.find(
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
      setSecondMove({
        ...secondMoveRef.current,
        possibleSecondPawns: possibleSeconds
      })
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
      setMove({
        ...moveRef.current,
        possibleMoves: response.movesets
      })
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
    if (canvasRef.current) {
      drawWithRotation(canvasRef.current, playerColor, playerColorRef.current);
    }
    setAngle(colorToAngleDict[playerColor]);
    if (playerColor != "") {
      playerColorRef.current = playerColor;
      drawPieces();
    }
  }, [playerColor]);

  const fetchGameStats = async(playerId: string) => {
    try {
      const res = await fetch(GET_GAMESTATS(playerId));

      if (!res.ok) {
        throw new Error("Failed to pull game state");
      }
      const gameStats = await res.json();
      console.log("stats: ", gameStats)
      setGameStats(gameStats)
    } catch (err) {
      console.error("Error fetching game state:", err);
      return null;
    }
  }

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
      const index = gameState.turnOrder.indexOf(username)
      console.log(
        colorToIndex[playerColorRef.current],
        playerColorRef.current,
        gameState.gamePhase
      );
      setIsPlayerTurn(getTurnPhaseForPlayer(gameState.gamePhase, index));
      console.log("turn phase", getTurnPhaseForPlayer(gameState.gamePhase, index), index)
      const old_players = players
      const new_players = applyGameState(colorToPieces);
      setMoveLog((prevLog) => {
        prevLog = prevLog.filter(msg => !msg.includes("joined the game") && !msg.includes("started the game"));
        let newLog = [];

        // Add join messages for the first 4 players from localTurnOrder if not added yet
        for (let i = 0; i < gameState.turnOrder.length; i++) {
          newLog.push(`${gameState.turnOrder[i]} joined the game`);
        }
        if (gameState.gamePhase != 8) {
          newLog.push(`${gameState.turnOrder[0]} started the game`);
        }
        newLog.push(...prevLog)

        // Then generate the move string for current move
        if (gameState.gamePhase != 8) {
          const new_move = generateMoveString(
            gamePhase, 
            gameState.gamePhase, 
            gameState.turnOrder, 
            old_players, 
            new_players, 
            gameState.lastDrawnCard, 
            gameState.lastCompletedMove
          );
          if (
            new_move.length > 0
          ) {
            newLog.push(new_move);
          }
        }
        // Add new move only if non-empty and not duplicate
        newLog = newLog.filter(msg => !msg.includes("undefined"))
        return newLog;
      });
      setPlayers(new_players);
      setTurnOrder(gameState.turnOrder);
      setLocalTurnOrder(gameState.turnOrder);
      setGamePhase(gameState.gamePhase);
      if (gameState.gamePhase == 9) {
        setGameOver(true)
        const statsRes = await fetchGameStats(playerId)
        if (!statsRes) {
           throw new Error("Failed to pull stats");
        }
        const player = localTurnOrder[(gamePhase - gamePhase % 2) / 2]
        setWinner(player)
      }
      setPlayerConnectivity(gameState.playerConnectionStatus)
      setView(gameState.currentView);
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
      drawPieces();
      console.log("start fetch");
      await fetchGameState(storedId ?? "");
      console.log("end fetch");
      const storedResponse = JSON.parse(
        localStorage.getItem("drawCard") || "{}"
      );
      console.log(storedResponse);
      setMove((prev) => ({
        ...prev,
        possibleMoves: storedResponse.movesets,
      }));
      if (storedResponse.cardDrawn in numberDict) {
        setTopCardPath(card_path(numberDict[storedResponse.cardDrawn]));
        setCurrentCard(storedResponse.cardDrawn);
      }
    };

    refresh();
  }, []);

  useEffect(() => {
    playersref.current = players;
    drawPieces();
  }, [players]);

  useEffect(() => {
    if (isPlayerTurn == "wait") {
      console.log("reset on accident")
      resetAllSelections();
    }
  }, [isPlayerTurn]);

  useSyncedRef(loadingRef, loading);
  useSyncedRef(moveRef, move);
  useSyncedRef(viewRef, view);
  useSyncedRef(secondMoveRef, secondMove);
  useSyncedRef(currentCardRef, currentCard);
  useSyncedRef(topCardPathRef, topCardPath);
  useSyncedRef(currentDistanceref, currentDistance);

  useEffect(() => {
    if (!devMode) return;

    const dummyGameState: GameState = {
      red: ["b_14", "d_3", "d_4", "d_S"],
      blue: ["a_S", "a_S", "a_S", "a_S"],
      yellow: ["c_s1", "c_s2", "d_11", "a_4"],
      green: ["c_S", "c_8", "c_S", "c_S"],
    };

    setGameStarted(true);
    setMove({
      ...moveRef.current,
      possibleMoves: mockCardResponse7.movesets
    })
    playerColorRef.current = "red";
    const newPlayers = applyGameState(dummyGameState);
    setPlayers(newPlayers);
    setCurrentCard(7)
    setIsPlayerTurn("move");
    // setCurrentCard(7)
    setGameOver(true)
    setWinner("Rohit")
    setGameStats({movesMade:[1,1,1,2], pawnsKilled: [0,3,4,2], TimeElapsed: 6200000000})
    const nextDummyGameState: GameState = {
      red: ["b_14", "c_8", "d_4", "d_S"],
      blue: ["a_S", "a_S", "a_S", "a_S"],
      yellow: ["c_s1", "c_s2", "d_11", "a_4"],
      green: ["c_S", "c_S", "c_S", "c_S"],
    };

    // Optional: trigger an animation after mount
    // setTimeout(() => {
    //   setTopCardPath(card_path("eleven"));
    //   applyGameState(nextDummyGameState)
    // }, 3000);

  }, []);

  const handlePieceSelection = (piece: DrawnPiece, idx: number) => {
    if (piece.color !== playerColorRef.current) return false;
    const matching = move.possibleMoves.find((m) => m.pawn === piece.id);

    console.log(matching);
    console.log(move);
    setMove((prev) => ({
      ...prev,
      selectedIdx: idx,
      highlightedTiles: matching?.move ?? [],
      effect: null,
      effectPopup: null,
      destination: null,
      possibleEffects: [],
    }));
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
            selectedPiece={move.selectedIdx}
            secondSelectedPiece={secondMove.selectedIdx}
            playerColor={playerColorRef.current}
            onPieceSelect={handlePieceSelection}
          />
          <OverlayHighlights
            highlightedTiles={move.highlightedTiles}
            destination={move.destination}
            playerColor={playerColorRef.current}
            onTileClick={handleTileHighlightClick}
            secondDestination={secondMove.destination}
            possibleSecondPawns={secondMove.possibleSecondPawns}
            secondSelectedPiece={secondMove.selectedIdx}
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
            selected={move.destination === null || (currentCard === 7 && secondMove.destination === null)}
          />
          {move.effectPopup && move.possibleEffects.length > 1 && (
            <EffectPopup
              position={move.effectPopup}
              effects={move.possibleEffects}
              selectedEffect={move.effect}
              onSelectEffect={(eff) => setMove((prev) => ({
                                ...prev,
                                effect: eff
                              }))}
              onClickEffect={(eff) => {
                setMove((prev) => ({
                  ...prev,
                  effect: eff
                }))
              }}
            />
          )}

        </div>
      </div>

      {loading && <LoadingOverlay />}

      {showZoomedCard && (
        <ZoomedCard imageSrc={topCardPath} onClose={() => setShowZoomedCard(false)} />
      )}
      <ReconnectOverlay
        playerConnectivity={playerConnectivity}
        players={localTurnOrder}
      />
    </div>
  );
}
