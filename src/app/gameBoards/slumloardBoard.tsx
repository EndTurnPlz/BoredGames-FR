import ReconnectOverlay from "@/components/Apologies/Overlays/ReconnectOverlay";
import SlumloardCanvas from "@/components/Slumlords/slumlordsCanvas";
import SlumloradCanvas from "@/components/Slumlords/slumlordsCanvas";
import { Player } from "@/components/UpsAndDowns/Player/Player";
import { GET_GAMESTREAM } from "@/utils/config";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type SlumlordProps = {
  playerColor: string;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  setTurnOrder: React.Dispatch<React.SetStateAction<string[]>>;
  setGameStarted: React.Dispatch<React.SetStateAction<boolean>>;
  setMoveLog: React.Dispatch<React.SetStateAction<string[]>>;
  setGameStats: React.Dispatch<React.SetStateAction<string[]>>;
  setWinner: React.Dispatch<React.SetStateAction<string[]>>;
  setHost: React.Dispatch<React.SetStateAction<string>>;
};

export default function SlumlordBoard({
  setGameOver,
  setTurnOrder,
  setGameStarted,
  setMoveLog,
  setGameStats,
  setWinner,
  setHost,
}: SlumlordProps) {
    const searchParams = useSearchParams();
    const username = searchParams.get("username");
    const randomId = searchParams.get("randomId");
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [loading, setLoading] = useState(false);
    const loadingRef = useRef(false);

    const [localTurnOrder, setLocalTurnOrder] = useState<string[]>([]);
    const [gamePhase, setGamePhase] = useState<number>(8);
    const gamePhaseRef = useRef<number>(8)

    let devMode = true;

    const [view, setView] = useState(-1);
    const viewRef = useRef<number | null>(null);

    const [playerConnectivity, setPlayerConnectivity] = useState<boolean[]>([]);

    function handleRoomState(players: string[], turnOrder: string[], state: string, viewNum: number): boolean {
        setTurnOrder(turnOrder);
        setLocalTurnOrder(turnOrder);
        setHost(players[0])
        if (state == "WaitingForPlayers") {
        setTurnOrder(players);
        setView(viewNum)
        return false;
        } else if (state == "GameInProgress") {
        setTurnOrder(turnOrder);
        setGameStarted(true);
        }
        return true
    }

    const updateGameState = async (response: any) =>  {

    }

    function setGameWinner() {

    }

    useEffect(() => {
        if (devMode) return;

        const playerId = localStorage.getItem("userId" + randomId) ?? "";
        const lobbyId = localStorage.getItem("lobbyId") ?? "";
        let eventSource: EventSource | null = null;
        let retryTimeout: NodeJS.Timeout | null = null;

        const connect = () => {
        console.log("Connecting SSE:", GET_GAMESTREAM(lobbyId, playerId));
        eventSource = new EventSource(GET_GAMESTREAM(lobbyId, playerId));

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                updateGameState(data);
                } catch (err) {
                console.error("Failed to process event data:", err);
                }
            };

            eventSource.onerror = (err) => {
                console.error("SSE error, will retry:", err);
                eventSource?.close();
                // retry in 2 seconds
                retryTimeout = setTimeout(connect, 2000);
            };
        };

        connect();

        return () => {
            eventSource?.close();
            if (retryTimeout) clearTimeout(retryTimeout);
        };
    }, []);


    useEffect(() => {
        if (!devMode) return;

        const playerId = localStorage.getItem("userId" + randomId) ?? "";
        const lobbyId = localStorage.getItem("lobbyId") ?? "";
        setGameStarted(true)
    

    }, []);

    return (
        <div className="flex flex-col items-center">
            <div className="min-h-screen flex items-center justify-center bg-white-200">
            <div>
                {/* 🔧 This is the key wrapper */}
                <div style={{ position: "relative", width: 600, height: 600 }}>

                <SlumloardCanvas/>
                
                </div>
            </div>
        </div>
            <ReconnectOverlay
            playerConnectivity={playerConnectivity}
            players={localTurnOrder}
            />
        </div>
    )
}