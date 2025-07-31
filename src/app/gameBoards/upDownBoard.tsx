"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import UpsAndDownsCanvas, { coordsMap } from "@/utils/UpAndDown/canvasUtils";
import { GameStats } from "../boardGame/page";
import { indexToColor } from "@/utils/config";
import { GET_GAMESTREAM } from "@/utils/config";
import { UpsAndDownsGameResponseAdapter, Warp } from "@/utils/adapters";
import ReconnectOverlay from "@/components/Apologies/Overlays/ReconnectOverlay";
import { Player } from "@/components/UpsAndDowns/Player/Player";
import { SUBMIT_MOVE } from "@/utils/UpAndDown/config";
import PiecesLayer from "@/components/UpsAndDowns/Pieces/piecesLayer";
import RollOverlay from "@/components/UpsAndDowns/RollOverlay";

type BoardCanvasProps = {
  playerColor: string;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  setTurnOrder: React.Dispatch<React.SetStateAction<string[]>>;
  setGameStarted: React.Dispatch<React.SetStateAction<boolean>>;
  setMoveLog: React.Dispatch<React.SetStateAction<string[]>>;
  setGameStats: React.Dispatch<React.SetStateAction<GameStats>>;
  setWinner: React.Dispatch<React.SetStateAction<string>>;
};

export default function UpAndDownBoard({
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
  const [lastDieRoll, setLastDieRoll] = useState(0);
  const [boardLayout, setBoardLayout] = useState<Warp[]>([]);

  const [players, setPlayers] = useState<Player[]>([]);
//   const playersref = useRef<Player[]>([]);

  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  const [localTurnOrder, setLocalTurnOrder] = useState<string[]>([]);
  const [gamePhase, setGamePhase] = useState<number>(8);
  const gamePhaseRef = useRef<number>(8)

  let devMode = false;

  const [view, setView] = useState(-1);
  const viewRef = useRef<number | null>(null);

  const [playerConnectivity, setPlayerConnectivity] = useState<boolean[]>([]);

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
  const updatePlayers = (players: number[]) => {
    const new_player = players.map((m, index) => { const location = coordsMap[m]; const color = indexToColor[index];  return new Player(m, location.x, location.y, color)})
    setPlayers(new_player)
  }

  const generateMoveDescription = (player_names: string[], phase: number, lastDieRoll: number): string => {
    if (phase == 9) {
      return ""
    }
    const player = player_names[phase]
    const move_description = `${player} rolled a ${lastDieRoll}`
    return move_description
  }

    function phaseToInt(phase: string) {
    if (phase === "P1Turn") return 0;
    if (phase === "P2Turn") return 1;
    if (phase === "P3Turn") return 2;
    if (phase === "P4Turn") return 3;
    if (phase === "P5Turn") return 4;
    if (phase === "P6Turn") return 5;
    if (phase === "P7Turn") return 6;
    if (phase === "P8Turn") return 7;
    if (phase === "End") return 9;
    return 8;
  }

  const updateGameState = async (response: any) =>  {
    const adapter = new UpsAndDownsGameResponseAdapter(response);
    const playerId = localStorage.getItem("userId" + randomId) ?? "";
    const lobbyId = localStorage.getItem("lobbyId") ?? "";

    const viewNum = adapter.viewNum
    const player_names = adapter.players
    const state = adapter.state
    const playerConnectionStatus = adapter.playerConnectionStatus
    const BoardLayout = adapter.BoardLayout
    console.log(BoardLayout)
    const lastDieRoll = adapter.lastDieRoll
    const player_locations = adapter.playerLocations
    const gameState = adapter.gameState
    updatePlayers(player_locations)

    if (!handleRoomState(player_names, state, viewNum)) {
      return;
    }
    setBoardLayout(BoardLayout)
    const phase = phaseToInt(gameState)
    if (lastDieRoll >= 1 && lastDieRoll <= 6) {
      await updateDie(lastDieRoll, player_names, phase)
    }
    setLastDieRoll(lastDieRoll)
    setGameWinner(phase, player_names, player_locations)
    setPlayerConnectivity(playerConnectionStatus);
    setView(viewNum)
  }

  function setGameWinner(phase: number, turnOrder: string[], player_location: number[]) {
    setGamePhase(phase);
    // console.log("This is phase:", phase, gamePhase == 9)
    if (phase == 9) {
      setGameOver(true);
      // console.log("fetching stats")
      const rowAllEndWithH = player_location.findIndex(
        (row: number) =>
          row == 100
      );
      // console.log(rowAllEndWithH, statsRes)
      setWinner(turnOrder[rowAllEndWithH]);
    }
  }

  useEffect(() => {
    if (devMode) return;

    const playerId = localStorage.getItem("userId" + randomId) ?? "";
    const lobbyId = localStorage.getItem("lobbyId") ?? "";
    console.log(GET_GAMESTREAM(lobbyId, playerId));

    const eventSource = new EventSource(GET_GAMESTREAM(lobbyId, playerId));

    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data); // If your server sends JSON
        if (data.ViewNum !== viewRef.current) {
          await updateGameState(data);
        }
        console.log("Received:", data);
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

  const updateDie = async (lastDieRoll: number, players_names: string[], phase: number) => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false);
      setMoveLog((prev) => {
        const new_move = generateMoveDescription(players_names, phase, lastDieRoll)
        let newLog = [];
        newLog.push(...prev);
        console.log(prev, new_move, prev[prev.length - 1])
        if (new_move.length > 0 && new_move != prev[prev.length - 1] && lastDieRoll >= 1 && lastDieRoll <= 6) {
          newLog.push(new_move)
        }
        return newLog
      })
    }, 1000);
  }

  const handleMoveClick = async () =>  {
    let lobbyId = localStorage.getItem("lobbyId") ?? "";
    let player_Id = localStorage.getItem("userId" + randomId) ?? "";
    const res = await fetch(SUBMIT_MOVE(lobbyId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Player-Key": player_Id
      },
    });
    if (!res.ok) {
      throw Error("failed to post move");
    }
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }

  useEffect(() => {
    if (!devMode) return;

    const playerId = localStorage.getItem("userId" + randomId) ?? "";
    const lobbyId = localStorage.getItem("lobbyId") ?? "";
    setGameStarted(true)
    console.log(coordsMap)
    const newPlayers = [
      new Player(0, coordsMap[0].x, coordsMap[0].y, indexToColor[0]),
      new Player(1, coordsMap[2].x, coordsMap[2].y, indexToColor[1]),
      new Player(2, coordsMap[3].x, coordsMap[3].y, indexToColor[2]),
      new Player(3, coordsMap[4].x, coordsMap[4].y, indexToColor[3]),
    ];
    setBoardLayout([{ Tile: "1", Dest: "38" }, { Tile: "38", Dest: "4" }]);
    setPlayers(newPlayers)

  }, []);

  return (
   <div className="flex flex-col items-center">
    <div className="min-h-screen flex items-center justify-center bg-white-200">
      <div>
        {/* 🔧 This is the key wrapper */}
        <div style={{ position: "relative", width: 600, height: 600 }}>
          <UpsAndDownsCanvas canvasRef={canvasRef} players={players} warps={boardLayout} />

          {/* Overlayed components absolutely positioned inside the relative div */}
          <PiecesLayer pieces={players.map((p) => p.piece)} />
          <RollOverlay
            isMyTurn={localTurnOrder.indexOf(username ?? "") == gamePhase}
            currentPlayerName={localTurnOrder[gamePhase]}
            onRoll={async () => {
              // Trigger roll logic
              setLoading(true)
              await handleMoveClick();
            }}
            rolling={loading}
            result={lastDieRoll}
          />
        </div>
      </div>
    </div>

    <ReconnectOverlay
      playerConnectivity={playerConnectivity}
      players={localTurnOrder}
    />
  </div>

  );
}
