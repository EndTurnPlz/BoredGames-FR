import ReconnectOverlay from "@/components/Apologies/Overlays/ReconnectOverlay";
import Player from "@/components/Slumlords/Player";
import SlumlordCanvas from "@/components/Slumlords/slumlordsCanvas";
import { GET_GAMESTREAM } from "@/utils/config";
import { boardSize, playerCircleSize, sideHeightRatio } from "@/utils/Slumlords/config";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PlayerData } from "@/utils/Slumlords/types";
import { tempPlayers } from "@/utils/Slumlords/tempPlayers";
import PropertyDecisionOverlay, { Property } from "@/components/Slumlords/buyOverlay";

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

    const [propertyDecisionOpen, setPropertyDecisionOpen] = useState(false);
    const [activeProperty, setActiveProperty] = useState<Property | null>(null);

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

    function movePlayer(playerName: string, targetPosition: number) {
        setPlayers((prevPlayers) => {
            const player = prevPlayers.find((p) => p.name === playerName);
            if (!player) return prevPlayers;

            const currentPosition = player.position;
            if (currentPosition === targetPosition) return prevPlayers; // done

            const step = currentPosition < targetPosition ? 1 : -1;

            // increment by 1
            const newPlayers = prevPlayers.map((p) =>
                p.name === playerName ? { ...p, position: currentPosition + step } : p
            );

            // schedule next step
            setTimeout(() => {
                // call movePlayer again with the same target
                movePlayer(playerName, targetPosition);
            }, 1); // 0.5s per step

            return newPlayers;
        });
    }


    useEffect(() => {
        //Moving animation test
        if (players.length === 0 || !devMode) return; // wait until players exist

        const timer = setTimeout(() => {
        setActiveProperty({
            name: "Park Place",
            price: 350,
            rent: 35,
            color: "#1e40af",
            });
            setPropertyDecisionOpen(true);
        }, 4000);

        return () => clearTimeout(timer);
    }, [players]);

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

    function getTileXYPercent(position: number, length: number, circleSize: number) {
        const tileWidthPct = 100 / (length - 2);
        const sideHeightPct = sideHeightRatio * 100;

        const right = (length - 2) * tileWidthPct + sideHeightPct * 0.5;
        const bottom = (length - 2) * tileWidthPct + sideHeightPct / 2;

        if (position === 0) return { x: -sideHeightPct / 2, y: -sideHeightPct / 2 };
        if (position < length - 1) return { x: (position - 1) * tileWidthPct + tileWidthPct / 2, y: -sideHeightPct / 2 };
        if (position === length - 1) return { x: right, y: -sideHeightPct / 2 };
        if (position < 2 * length - 2) return { x: right, y: (position - length) * tileWidthPct + tileWidthPct / 2 };
        if (position === 2 * length - 2) return { x: right, y: bottom };
        if (position < 3 * length - 3) return { x: right - 0.5 * sideHeightPct - (position - (2 * length - 2) - 1) * tileWidthPct - tileWidthPct / 2, y: bottom };
        if (position === 3 * length - 3) return { x: -sideHeightPct / 2, y: bottom };
        return { x: -sideHeightPct / 2, y: bottom - 0.5 * sideHeightPct - (position - (3 * length - 3) - 1) * tileWidthPct - tileWidthPct / 2 };
        }


    return (
        <div className="flex flex-col items-center">
           <div className="flex flex-col items-center min-h-screen justify-center bg-white-200">
                <div className="relative w-[80vw] max-w-[600px] aspect-square">
                    <SlumlordCanvas length={length} />
                    
                    {players.map((p) => {
                        const { x, y } = getTileXYPercent(p.position, length, playerCircleSize);
                        const { xOffset, yOffset } = getPlayerOffsets(players, p);
                        
                        // Convert offsets to % of board
                        const xPctOffset = (xOffset / boardSize) * 100;
                        const yPctOffset = (yOffset / boardSize) * 100;
                        
                        return (
                            <Player
                            key={p.id}
                            player={p}
                            x={x + xPctOffset}
                            y={y + yPctOffset}
                            size={playerCircleSize}
                            />
                        );
                    })}
                    {propertyDecisionOpen && activeProperty && (
                        <PropertyDecisionOverlay
                            property={activeProperty}
                            canBuy={true}
                            canSell={true}
                            onBuy={() => {
                                console.log("BUY", activeProperty);
                                setPropertyDecisionOpen(false);
                            }}
                            onSell={() => {
                                console.log("SELL", activeProperty);
                                setPropertyDecisionOpen(false);
                            }}
                            onClose={() => setPropertyDecisionOpen(false)}
                        />
                    )}
                </div>
            </div>
            <ReconnectOverlay
            playerConnectivity={playerConnectivity}
            players={localTurnOrder}
            />
        </div>
    )
}