"use client";
import { useEffect, useRef, useState } from "react";
import { Player } from "../../components/Apologies/Player/Player"; // assumes Player has a draw(ctx) method
import { findPath } from "@/utils/Apologies/outerPath";
import { ApologiesGameResponseAdapter, GameStatsAdapter } from "@/utils/adapters";
import {
  tileSize,
  canvasWidth,
  canvasHeight,
  numberDict,
  colorToAngleDict,
  DRAW_CARD,
  MOVE_PAWN,
  deck_card,
  card_path,
  GET_GAMESTATS,
  stringDict,
} from "@/utils/Apologies/config";
import { mockCardResponse2 } from "../mockData/moveset2";
import { mockCardResponse11 } from "../mockData/moveset11";
import { mockCardResponse7 } from "../mockData/moveset7";
import { coordMap, getUnrotatedMousePosition } from "@/utils/Apologies/outerPath";
import { drawPiecesWithOffset } from "@/utils/Apologies/drawUtils";
import { useSearchParams } from "next/navigation";
import CardControls from "@/components/Apologies/Cards/CardControls";
import OverlayHighlights from "@/components/Apologies/Pieces/OverlayHighlights";
import EffectPopup from "@/components/Apologies/Effects/EffectPopup";
import LoadingOverlay from "@/components/Apologies/Overlays/loadingOverlay";
import ZoomedCard from "@/components/Apologies/Cards/zoomedCard";
import PiecesLayer from "@/components/Apologies/Pieces/piecesLayer";
import { drawWithRotation } from "@/utils/Apologies/canvasUtils";
import {
  applyGameState,
  generateMoveString,
  getTurnPhaseForPlayer,
  Request,
} from "@/utils/Apologies/gameUtils";
import { useSyncedRef } from "@/hooks/useSyncedRef";
import { useGameSelections } from "@/hooks/useGameSelections";
import { GameState } from "@/utils/Apologies/gameUtils";
import { GameStats } from "../boardGame/page";
import ReconnectOverlay from "@/components/Apologies/Overlays/ReconnectOverlay";
import { GET_GAMESTREAM } from "@/utils/config";

export type Piece = {
  x: number;
  y: number;
  color: string;
  isActive: boolean;
  id: string;
};
export type MoveSet = {
  pawn: string;
  opts: Move[];
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
  effectPopup: { x: number; y: number } | null;
};

// Type for secondMove
export type SecondMoveState = {
  possibleSecondPawns: { piece: DrawnPiece; move: Move }[];
  selectedIdx: number;
  destination: string | null;
  effect: number | null;
};

export default function ApologiesBoard({
  playerColor = "red",
  setGameOver,
  setTurnOrder,
  setGameStarted,
  setMoveLog,
  setGameStats,
  setWinner,
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
  const gamePhaseRef = useRef<number>(8)

  let devMode = false;

  const [view, setView] = useState(-1);
  const viewRef = useRef<number | null>(null);

  const [playerConnectivity, setPlayerConnectivity] = useState<boolean[]>([]);

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
    setSecondMove,
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
    if (moveRef.current.destination) {
      if (!isPlayerTurn) {
        console.log("Not your turn!");
        return true;
      }
      // console.log("hello");
      if (currentCardRef.current === 7 && currentDistanceref.current !== 7) {
        return true;
      }
      try {
        let player_Id = localStorage.getItem("userId" + randomId) ?? "";
        let lobbyId = localStorage.getItem("lobbyId") ?? "";
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
        // console.log(body);

        const res = await fetch(MOVE_PAWN(lobbyId), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Player-Key": player_Id
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
    });
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
        },
      });
    } else {
      setMove({
        ...moveRef.current,
        destination: tile.to,
        effect: tile.effects[0],
        effectPopup: null,
      });
    }
    // console.log("current Card", currentCardRef.current)
    if (currentCardRef.current === 7) {
      const current = findPath(tile.from, tile.to).length - 1;
      setCurrentDistance(current);

      const target = 7 - current;
      const possibleSeconds = [];

      for (const piece of drawnPieces) {
        // console.log(
        //   piece,
        //   moveRef.current.effect,
        //   moveRef.current.possibleMoves
        // );
        if (
          moveRef.current.possibleMoves &&
          drawnPieces[moveRef.current.selectedIdx] !== piece
        ) {
          const matching = moveRef.current.possibleMoves.find(
            (m) => m.pawn === piece.id
          );
          const canBeSecond = matching?.opts?.find(
            (m) => findPath(m.from, m.to).length - 1 === target
          );
          if (canBeSecond) {
            possibleSeconds.push({ piece, move: canBeSecond });
          }
        }
      }
      // console.log("possible Second", possibleSeconds);
      setSecondMove({
        ...secondMoveRef.current,
        possibleSecondPawns: possibleSeconds,
      });
    }

    return true;
  };

  const handleDeckClick = async () => {
    // console.log("Deck clicked! Sending to backend...");
    setLoading(true);
    try {
      let player_Id = localStorage.getItem("userId" + randomId) ?? "";
      let lobbyId = localStorage.getItem("lobbyId") ?? "";
      // console.log(DRAW_CARD(player_Id))
      const res = await fetch(DRAW_CARD(lobbyId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Player-Key": player_Id
        }
      });

      const response = await res.json();
      if (!res.ok) {
        throw Error("failed to draw card");
      }
      // console.log(response);
      if (
        response.movesets.length == 1 &&
        response.movesets[0].opts.length === 1
      ) {
        const move = response.movesets[0].opts[0];
        const idx = drawnPieces.findIndex((p) => p.id === move.from);
        if (move.effects.length > 1) {
          // Calculate popup position near tile
          let coords = getUnrotatedMousePosition(
            coordMap[move.to].x,
            coordMap[move.to].y,
            colorToAngleDict[playerColorRef.current]
          );
          setMove({
            ...moveRef.current,
            destination: move.to,
            highlightedTiles: [move],
            possibleEffects: move.effects,
            possibleMoves: response.movesets,
            selectedIdx: idx,
            effectPopup: {
              x: coords.x + tileSize / 2,
              y: coords.y - (3 * tileSize) / 2,
            },
          });
        } else {
          setMove({
            ...moveRef.current,
            destination: move.to,
            effect: move.effects[0],
            highlightedTiles: [move],
            possibleMoves: response.movesets,
            selectedIdx: idx,
            effectPopup: null,
          });
          const distance = findPath(move.from, move.to).length - 1;
          setCurrentDistance(distance)
        }
      } else if (
        response.cardDrawn == 7 &&
        response.movesets.length == 2 &&
        response.movesets[0].opts.length === 1 && 
        response.movesets[1].opts.length === 1 &&
        response.movesets[0].opts[0].effects[0] >=5
      ) {
        const move = response.movesets[0].opts[0];
        const splitMove = response.movesets[1].opts[0];

        const idx = drawnPieces.findIndex((p) => p.id === move.from);
        const secondIdx = drawnPieces.findIndex((p) => p.id === splitMove.from);
        setMove({
          ...moveRef.current,
          destination: move.to,
          effect: move.effects[0],
          highlightedTiles: [move],
          possibleMoves: response.movesets,
          selectedIdx: idx,
          effectPopup: null,
        });
        setSecondMove({
          ...secondMoveRef.current,
          selectedIdx: secondIdx,
          destination: splitMove.to,
          effect: splitMove.effects[0],
        });
        setCurrentDistance(7)

      } else {
        setMove({
          ...moveRef.current,
          possibleMoves: response.movesets,
        });
      }
      localStorage.setItem("drawCard", JSON.stringify(response));
      setCurrentCard(response.cardDrawn)
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Error fetching game state:", err);
      setLoading(false);
      return null;
    }
  };

  const handleTopCardClick = () => {
    // console.log("top card clicked! zooming in...");
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

  function phaseToInt(phase: string) {
    if (phase === "P1Draw") return 0;
    if (phase === "P1Move") return 1;
    if (phase === "P2Draw") return 2;
    if (phase === "P2Move") return 3;
    if (phase === "P3Draw") return 4;
    if (phase === "P3Move") return 5;
    if (phase === "P4Draw") return 6;
    if (phase === "P4Move") return 7;
    if (phase === "End") return 9;
    return 8;
  }

  async function setGameWinner(phase: number, pieces: string[][], turnOrder: string[], gameStats: GameStatsAdapter) {
    setGamePhase(phase);
    // console.log("This is phase:", phase, gamePhase == 9)
    if (phase == 9) {
      setGameOver(true);
      // console.log("fetching stats")
      setGameStats(gameStats.toGameStats());
      const rowAllEndWithH = pieces.findIndex(
        (row: string[]) =>
          row.length > 0 && row.every((str) => str.endsWith("_H"))
      );
      // console.log(rowAllEndWithH, statsRes)
      setWinner(turnOrder[rowAllEndWithH]);
    }
  }

  function getNewPlayers(pieces:string[][]) {
      const colorOrder = ["blue", "yellow", "green", "red"];
      const colorToPieces: Record<string, string[]> = {};
      for (let row = 0; row < pieces.length; row++) {
        const color = colorOrder[row];
        colorToPieces[color] = pieces[row];
      }
      return applyGameState(colorToPieces)
  }

  function getIsPlayerTurn(turnOrder: string[], phase: string, username: string | null) {
    const index = turnOrder.indexOf(username ?? "");

    setIsPlayerTurn(getTurnPhaseForPlayer(phaseToInt(phase), index));
    // console.log(
    //   "turn phase",
    //   getTurnPhaseForPlayer(phaseToInt(phase), index),
    //   index
    // );
  }

  function handleRoomState(players: string[], state: string, viewNum: number): boolean {
    setTurnOrder(players);
    setLocalTurnOrder(players);
    if (state == "WaitingForPlayers") {
      setView(viewNum)
      return false;
    } else if (state == "GameInProgress") {
      setGameStarted(true);
    }
    return true
  }

  function handleNewMove(prevLog: string[], old_players: Player[], new_players: Player[], newGamePhase: number, player_names: string[], lastDrawnCard: number, lastCompletedMove: Request): string[] {
    let newLog = [];
    newLog.push(...prevLog);
    console.log("phases:", gamePhase, newGamePhase)
    // Then generate the move string for current move
    if (newGamePhase != 8) {
      const new_move = generateMoveString(
        gamePhaseRef.current,
        newGamePhase,
        player_names,
        old_players,
        new_players,
        lastDrawnCard,
        lastCompletedMove
      );
      if (new_move.length > 0) {
        newLog.push(new_move);
      }
    }
    // Add new move only if non-empty and not duplicate
    newLog = newLog.filter((msg) => !msg.includes("undefined"));
    console.log(newLog)
    return newLog
  }

  function getCardPaths(lastDrawnCard: string): number {
    let card_string = lastDrawnCard.toLowerCase()
    if (card_string in stringDict) {
      const card_number = stringDict[card_string]
      setTopCardPath(card_path(card_string));
      setCurrentCard(card_number);
      return card_number
    }
    return -1
  }
  
  const updateGameState = async (response: any) => {
    const adapter = new ApologiesGameResponseAdapter(response);
    const playerId = localStorage.getItem("userId" + randomId) ?? "";
    const lobbyId = localStorage.getItem("lobbyId") ?? "";
    console.log("reponse:", adapter);

    const viewNum = adapter.viewNum
    const player_names = adapter.players
    const state = adapter.state

    const gameSnapshot = adapter.gameSnapshot
    const turnOrder = adapter.turnOrder
    const gameState = adapter.gameState
    console.log("gamesetate", gameState)
    const pieces = adapter.pieces
    const playerConnectionStatus = adapter.playerConnectionStatus
    const lastDrawnCard = adapter.lastDrawnCard
    const lastCompletedMove = adapter.lastCompletedMove
    const gamePhase = phaseToInt(gameState)

    const gameStats = new GameStatsAdapter(adapter.gameStats)

    if (!handleRoomState(player_names, state, viewNum)) {
      return;
    }
    

    console.log(gameSnapshot)
    const card_number = getCardPaths(lastDrawnCard)

    const old_players = playersref.current
    const new_players = getNewPlayers(pieces)
    console.log(new_players, old_players)
    getIsPlayerTurn(turnOrder, gameState, username)

    setMoveLog((prevLog) => {
        return handleNewMove(prevLog, old_players, new_players, gamePhase, player_names, card_number, lastCompletedMove)
    });


    await setGameWinner(gamePhase, pieces, turnOrder, gameStats)
    setPlayers(new_players)
    setPlayerConnectivity(playerConnectionStatus);
    setView(viewNum)
  }

  useEffect(() => {
    if (devMode) return;

    const playerId = localStorage.getItem("userId" + randomId) ?? "";
    const lobbyId = localStorage.getItem("lobbyId") ?? "";
    // console.log(GET_GAMESTREAM(lobbyId, playerId));

    const eventSource = new EventSource(GET_GAMESTREAM(lobbyId, playerId));

    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data); // If your server sends JSON
        if (data.ViewNum !== viewRef.current) {
          await updateGameState(data);
        }
        // console.log("Received:", data.ViewNum, viewRef.current);
      } catch (err) {
        console.error("Failed to process event data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
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
    if (devMode) return;
    // console.log("refreshed");
    const refresh = async () => {
      if (canvasRef.current) {
        drawWithRotation(
          canvasRef.current,
          playerColor,
          playerColorRef.current
        );
      }
      setAngle(colorToAngleDict[playerColorRef.current]);
      drawPieces();
      const storedResponse = JSON.parse(
        localStorage.getItem("drawCard") || "{}"
      );
      // console.log(storedResponse);
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
      // console.log("reset on accident");
      resetAllSelections();
    }
  }, [isPlayerTurn]);

  useSyncedRef(loadingRef, loading);
  useSyncedRef(gamePhaseRef, gamePhase);
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
      possibleMoves: mockCardResponse7.movesets,
    });
    playerColorRef.current = "red";
    const newPlayers = applyGameState(dummyGameState);
    setPlayers(newPlayers);
    setCurrentCard(7);
    setIsPlayerTurn("move");
    // setCurrentCard(7)
    setGameOver(true);
    setWinner("Rohit");
    setGameStats({
      movesMade: [1, 1, 1, 2],
      pawnsKilled: [0, 3, 4, 2],
      gameTimeElapsed: 6200000000,
    });
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

    // console.log(matching);
    // console.log(move);
    setMove((prev) => ({
      ...prev,
      selectedIdx: idx,
      highlightedTiles: matching?.opts ?? [],
      effect: null,
      effectPopup: null,
      destination: null,
      possibleEffects: [],
    }));
    setSecondMove({
      possibleSecondPawns: [],
      selectedIdx: -1,
      destination: null,
      effect: null,
    });
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
            selected={
              move.destination === null ||
              (currentCard === 7 &&
                currentDistance != 7)
            }
          />
          {move.effectPopup && move.possibleEffects.length > 1 && (
            <EffectPopup
              position={move.effectPopup}
              effects={move.possibleEffects}
              selectedEffect={move.effect}
              onSelectEffect={(eff) =>
                setMove((prev) => ({
                  ...prev,
                  effect: eff,
                }))
              }
              onClickEffect={(eff) => {
                setMove((prev) => ({
                  ...prev,
                  effect: eff,
                }));
              }}
            />
          )}
        </div>
      </div>

      {loading && <LoadingOverlay />}

      {showZoomedCard && (
        <ZoomedCard
          imageSrc={topCardPath}
          onClose={() => setShowZoomedCard(false)}
        />
      )}
      <ReconnectOverlay
        playerConnectivity={playerConnectivity}
        players={localTurnOrder}
      />
    </div>
  );
}
