import ReconnectOverlay from "@/components/Apologies/Overlays/ReconnectOverlay";
import Player from "@/components/Slumlords/Player";
import SlumlordCanvas from "@/components/Slumlords/slumlordsCanvas";
import { GET_GAMESTREAM } from "@/utils/config";
import { boardSize, playerCircleSize, sideHeightRatio } from "@/utils/Slumlords/config";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PlayerData } from "@/utils/Slumlords/types";
import { tempPlayers } from "@/utils/Slumlords/tempPlayers";

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
    const [players, setPlayers] = useState<PlayerData[]>([]);
    const [length, setLength] = useState<number>(11);

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
        setPlayers(tempPlayers);
        if (!devMode) return;

        const playerId = localStorage.getItem("userId" + randomId) ?? "";
        const lobbyId = localStorage.getItem("lobbyId") ?? "";
        setGameStarted(true)
    

    }, []);

    function getPlayerOffsets(players: PlayerData[], player: PlayerData) {
        // Get all players on the same tile
        const sameTile = players.filter((p) => p.position === player.position);

        if (!sameTile || sameTile.length == 1) {
            return { xOffset: 0, yOffset: 0 };
        }

        // Index of this player in that group
        const index = sameTile.findIndex((p) => p.id === player.id);

        // Offset spacing in pixels
        const spacing = playerCircleSize / 2;

        // Example: spread players in a circle around tile center
        const angle = (index / sameTile.length) * Math.PI * 2; // angle in radians
        const radius = playerCircleSize / 2; // distance from tile center

        const xOffset = Math.cos(angle) * radius;
        const yOffset = Math.sin(angle) * radius;

        return { xOffset, yOffset };
    }

    function getTileXY(position: number, boardLength: number, circleSize: number) {
        const tileWidth = boardSize / (boardLength - 2);
        const tileHeight = sideHeightRatio * boardSize;
        const offset = circleSize / 2;

        const right = 2 * tileHeight + tileWidth * (length - 2);
        const bottom = 2 * tileHeight + (length - 2) * tileWidth;
        if (position == 0) {
            return { x: tileHeight / 2 - offset , y: tileHeight / 2 - offset}
        } else if (position < length - 1) {
            return { x: (position - 1) * tileWidth + tileHeight + tileWidth / 2 - offset, y: tileHeight / 2 - offset};
        } else if (position == length - 1) {
            return { x: (length - 2) * tileWidth + tileHeight * 3 / 2 - offset, y: tileHeight / 2 - offset};
        } else if (position < 2 * length - 2) {
            return { x: tileHeight + tileWidth * (length - 2) + tileHeight / 2 - offset, y: tileHeight + (position - length) * tileWidth + tileWidth / 2 - offset};
        } else if (position == 2 * length - 2) {
            return { x: right - tileHeight / 2 - offset, y: bottom - tileHeight / 2 - offset};
        } else if (position < 3 * length - 3) {
            return { x: right - tileHeight - (position - (2 * length - 2) - 1) * tileWidth - tileWidth / 2 - offset, y: bottom - tileHeight / 2 - offset};
        } else if (position == 3 * length - 3) {
            return { x: tileHeight / 2 - offset, y: bottom - tileHeight / 2 - offset};
        } else {
            return { x: tileHeight / 2 - offset, y: bottom - tileHeight - (position - (3 * length - 3) - 1) * tileWidth - tileWidth / 2 - offset};
        }
    }

    return (
        <div className="flex flex-col items-center">
            <div className="min-h-screen flex items-center justify-center bg-white-200">
            <div>
                {/* 🔧 This is the key wrapper */}

                <SlumlordCanvas boardSize={boardSize} length={length}/>
                {players.map((p) => {
                    const { x, y } = getTileXY(p.position, length, playerCircleSize / 2);
                    const { xOffset, yOffset } = getPlayerOffsets(players, p);

                    return (
                        <Player
                        key={p.id}
                        player={p}
                        x={x + xOffset}
                        y={y + yOffset}
                        size={playerCircleSize}
                        />
                    );
                })}
                
            </div>
        </div>
            <ReconnectOverlay
            playerConnectivity={playerConnectivity}
            players={localTurnOrder}
            />
        </div>
    )
}