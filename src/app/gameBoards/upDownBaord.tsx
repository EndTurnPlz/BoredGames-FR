"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import UpsAndDownsCanvas from "@/utils/UpAndDown/canvasUtils";
import { GameStats } from "../boardGame/page";
import { canvasHeight, canvasWidth } from "@/utils/Apologies/config";

type BoardCanvasProps = {
  playerColor: string;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  setTurnOrder: React.Dispatch<React.SetStateAction<string[]>>;
  setGameStarted: React.Dispatch<React.SetStateAction<boolean>>;
  setMoveLog: React.Dispatch<React.SetStateAction<string[]>>;
  setGameStats: React.Dispatch<React.SetStateAction<GameStats>>;
  setWinner: React.Dispatch<React.SetStateAction<string>>;
};

export default function UpAndDownBaord({
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



//   useEffect(() => {
//     if (devMode) return;

//     const playerId = localStorage.getItem("userId" + randomId) ?? "";
//     const lobbyId = localStorage.getItem("lobbyId") ?? "";
//     // console.log(GET_GAMESTREAM(lobbyId, playerId));

//     const eventSource = new EventSource(GET_GAMESTREAM(lobbyId, playerId));

//     eventSource.onmessage = async (event) => {
//       try {
//         const data = JSON.parse(event.data); // If your server sends JSON
//         if (data.ViewNum !== viewRef.current) {
//         //   await updateGameState(data);
//         }
//         // console.log("Received:", data.ViewNum, viewRef.current);
//       } catch (err) {
//         console.error("Failed to process event data:", err);
//       }
//     };

//     eventSource.onerror = (err) => {
//       console.error("SSE error:", err);
//       eventSource.close();
//     };

//     return () => {
//       eventSource.close();
//     };
//   }, []);
  useEffect(() => {
    setGameStarted(true)
  })

  return (
    <div className="flex flex-col items-center">
      <div className="min-h-screen flex items-center justify-center bg-black-200">
        <div>
          <div>
            <UpsAndDownsCanvas size={600} canvasRef={canvasRef} />
            </div>
        </div>
      </div>
    </div>
  );
}
