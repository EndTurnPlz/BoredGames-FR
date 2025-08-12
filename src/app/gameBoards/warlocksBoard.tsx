"use client";
import { WarlocksResponseAdapter } from "@/utils/adapters";
import { GameInProgress, GET_GAMESTREAM } from "@/utils/config";
import { SUBMIT_BET, width } from "@/utils/Warlocks/config";
import { adapter } from "next/dist/server/web/adapter";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
type BoardCanvasProps = {
  playerColor: string;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  setTurnOrder: React.Dispatch<React.SetStateAction<string[]>>;
  setGameStarted: React.Dispatch<React.SetStateAction<boolean>>;
  setMoveLog: React.Dispatch<React.SetStateAction<string[]>>;
  setWinner: React.Dispatch<React.SetStateAction<string>>;
  setHost: React.Dispatch<React.SetStateAction<string>>;
};

export default function WizardBoard({
  setGameOver,
  setTurnOrder,
  setGameStarted,
  setMoveLog,
  setWinner,
  setHost,
}: BoardCanvasProps) {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const randomId = searchParams.get("randomId");

  const [players] = useState([]);
  const [trump, setTrump] = useState("None");
  const [hand, setHand] = useState<string[]>([])
  const [round, setRound] = useState(0);
  const [currentTrick, setCurrentTrick] = useState([]);
  const [gameState, setGameState] = useState("");
  const [bid, setBid] = useState(0)

  const devMode = false

    useEffect(() => {
      if (!devMode) return;
  
  
      setGameStarted(true);
      // setCurrentCard(7)
    }, []);
  

  useEffect(() => {
    if (devMode) return;

    const playerId = localStorage.getItem("userId" + randomId) ?? "";
    const lobbyId = localStorage.getItem("lobbyId") ?? "";
    console.log(GET_GAMESTREAM(lobbyId, playerId));

    const eventSource = new EventSource(GET_GAMESTREAM(lobbyId, playerId));

    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data); // If your server sends JSON
        updateGameState(data);
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

  function handleRoomState(turnOrder: string[], players: string[], state: string, viewNum: number): boolean {
    setHost(players[0])
    if (state == GameInProgress) {
      setTurnOrder(turnOrder);
      setGameStarted(true);
    }
    return true
  }

  const updateGameState = (data: any) => {
    const response = new WarlocksResponseAdapter(data)
    console.log(response)
    const turnOrder = response.turnOrder
    const player_names = response.players
    const state = response.state
    const viewNum = response.viewNum
    
    const gameState = response.gameState
    const round = response.roundNumber
    setGameState(gameState)
    setRound(round)
    if (!handleRoomState(turnOrder, player_names, state, viewNum)) {
      return;
    }
    return;
  }

  const handleSubmitBet = async () => {
    try {
      let player_Id = localStorage.getItem("userId" + randomId) ?? "";
      let lobbyId = localStorage.getItem("lobbyId") ?? "";
      // console.log(DRAW_CARD(player_Id))
      const res = await fetch(SUBMIT_BET(lobbyId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Player-Key": player_Id
        },
        body: JSON.stringify({
          Bid: bid, // whatever value you want to send
        }),
      });

      return true;
    } catch (err) {
      console.error("Error fetching game state:", err);
      return null;
    }
  }

  return (
    <div
      className="flex flex-col bg-green-700 text-white p-4"
      style={{ width: `${width}px`, height: `${width}px` }}
    >
      {/* Top Row: Player 1 + Scoreboard */}
      <div className="flex justify-between">
        <div className="bg-black/30 p-2 rounded">
          <h2 className="font-bold">Scoreboard</h2>
          <table className="border-collapse border border-white text-sm">
            <thead>
              <tr>
                <th className="border border-white px-2">Round</th>
                {players.map(p => (
                  <th key={p} className="border border-white px-2">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-white px-2">1</td>
                {players.map(p => (
                  <td key={p} className="border border-white px-2">0</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Middle: Play Area */}
      <div className="flex-1 flex flex-col justify-center items-center space-y-4">
        <div className="text-xl">Trump: {trump}</div>
        <div className="flex space-x-4">
          {currentTrick.length === 0 ? (
            <div className="text-gray-300">No cards played yet</div>
          ) : (
            currentTrick.map((card, i) => (
              <div key={i} className="bg-white text-black w-12 h-16 flex items-center justify-center rounded">
                {card}
              </div>
            ))
          )}
        </div>
        <div>Round {round}</div>
      </div>
      {/* Slider + Input for BID state */}
      {gameState === "Bid" && (
        <div className="flex flex-col items-center space-y-4 bg-black/30 p-6 rounded-lg">
          <label className="text-lg font-bold">
            How many tricks will you win?
          </label>

          {/* Slider */}
          <input
            type="range"
            min="0"
            max={round}
            step="1"
            value={bid}
            onChange={(e) => setBid(Number(e.target.value))}
            className="w-64"
          />


          {/* Manual number input */}
          <input
            type="number"
            min="0"
            max={round}
            value={bid}
            onChange={(e) => {
              let val = Number(e.target.value);
              if (val < 0) val = 0;
              if (val > round) val = round;
              setBid(val);
            }}
            className="w-24 text-black rounded p-2 text-center text-xl"
          />
          <button
            onClick={() => {
              handleSubmitBet();
              // TODO: send bid to server
            }}
            className="mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:scale-105 transition"
          >
            Submit Bid
          </button>
        </div>
        
      )}


      {/* Bottom Row: Player Hand */}
      <div className="flex justify-center space-x-2">
        {hand.map((card, i) => (
          <div key={i} className="bg-white text-black w-12 h-16 flex items-center justify-center rounded cursor-pointer hover:scale-105 transition">
            {card}
          </div>
        ))}
      </div>
    </div>
  );
}
