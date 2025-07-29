"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import UpsAndDownsCanvas from "@/utils/UpAndDown/canvasUtils";
import { GameStats } from "../boardGame/page";
import { canvasHeight, canvasWidth } from "@/utils/Apologies/config";
import { GET_GAMESTREAM } from "@/utils/config";
import { UpsAndDownsGameResponseAdapter } from "@/utils/Apologies/adapters";

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


//   const [players, setPlayers] = useState<Player[]>([]);
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

  const updateGameState = async (response: any) => {
    const adapter = new UpsAndDownsGameResponseAdapter(response);
    const playerId = localStorage.getItem("userId" + randomId) ?? "";
    const lobbyId = localStorage.getItem("lobbyId") ?? "";

    const viewNum = adapter.viewNum
    const player_names = adapter.players
    const state = adapter.state
    const playerConnectionStatus = adapter.playerConnectionStatus
    const BoardLayout = adapter.BoardLayout
    const lastDieRoll = adapter.lastDieRoll
    const player_locations = adapter.playerLocations

    if (!handleRoomState(player_names, state, viewNum)) {
      return;
    }
    

    setPlayerConnectivity(playerConnectionStatus);
    setView(viewNum)
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

  return (
    <div className="flex flex-col items-center">
      <div className="min-h-screen flex items-center justify-center bg-white-200">
        <div>
          <div>
            <UpsAndDownsCanvas size={600} canvasRef={canvasRef} />
            </div>
        </div>
      </div>
    </div>
  );
}
