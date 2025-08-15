"use client";
import CardObject from "@/components/Warlocks/Card";
import BiddingOverlay from "@/components/Warlocks/Overlays/BiddingOverlay";
import TrickOverlay from "@/components/Warlocks/Overlays/TrickOverlay";
import TrickWinnerOverlay from "@/components/Warlocks/Overlays/TrickWinnerOverlay";
import { useSyncedRef } from "@/hooks/useSyncedRef";
import { Card, CardInfo, LastTrick, Trick, WarlocksResponseAdapter } from "@/utils/adapters";
import { GameInProgress, GET_GAMESTREAM } from "@/utils/config";
import { CHOOSE_CARD, formatCard, SUBMIT_BET, suitEmojis, width } from "@/utils/Warlocks/config";
import { adapter } from "next/dist/server/web/adapter";
import { useSearchParams } from "next/navigation";
import { before } from "node:test";
import { useEffect, useRef, useState } from "react";
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

  const [players, setPlayers] = useState<string[]>([]);
  const [localTurnOrder, setLocalTurnOrder] = useState<string[]>([]);

  const [trump, setTrump] = useState("None");
  const [lead, setLead] = useState("");
  const [hand, setHand] = useState<CardInfo[]>([])
  const [beforeHand, setBeforeHand] = useState<Card[]>([])
  const [round, setRound] = useState(0);
  const [currentTrick, setCurrentTrick] = useState<Trick | null>(null);
  const [gameState, setGameState] = useState("");

  const [bid, setBid] = useState(0)
  const [hasBid, setHasBid] = useState(false)

  const [playerBids, setPlayerBids] = useState<number[]>([])
  const [playerPoints, setPlayerPoints] = useState<number[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  
  const [playerIndex, setPlayerIndex] = useState<number>(-1)
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(false)

  const [showTrickOverlay, setShowTrickOverlay] = useState(false);
  const [lastTrick, setLastTrick] = useState<LastTrick | null>( null);
  const [showWinnerOverlay, setShowWinnerOverlay] = useState(false);
  const [showBiddingOverlay, setShowBiddingOverlay] = useState(false);

  useEffect(() => {
  if (
    currentTrick &&
    currentTrick.CardsPlayed.length === 0
  ) {
    handleTrickEnd()
  }
  if (gameState === "Bid") {
    if (lastTrick) {
      setShowWinnerOverlay(true);
      setTimeout(() => {
        setShowWinnerOverlay(false);

        setShowBiddingOverlay(true);

        const timer = setTimeout(() => setShowBiddingOverlay(false), 2000);
        return () => clearTimeout(timer);
      }, 2000);
    } else {
      // Then show the round/trick overlay for 2 seconds
      setShowBiddingOverlay(true);

      const timer = setTimeout(() => setShowBiddingOverlay(false), 2000);
      return () => clearTimeout(timer);
    }
  }
}, [gameState, currentTrick, round]);


const handleTrickEnd = () => {
  console.log(lastTrick)
  if (lastTrick) {
    setShowWinnerOverlay(true);
    setTimeout(() => {
      setShowWinnerOverlay(false);

      setShowTrickOverlay(true);
      setTimeout(() => setShowTrickOverlay(false), 2000);
    }, 2000);
  } else {
    // Then show the round/trick overlay for 2 seconds
    setShowTrickOverlay(true);
    setTimeout(() => setShowTrickOverlay(false), 2000);
  }

};

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

  function handleRoomState(turnOrder: string[], players: string[], state: string, playerIndex: number) {
    setHost(players[0])
    setPlayers(players)
    setLocalTurnOrder(turnOrder)
    console.log(username, playerIndex)
    setPlayerIndex(playerIndex)
    if (state == GameInProgress) {
      setTurnOrder(turnOrder);
      setGameStarted(true);
    }
  }

  function getIsPlayerTurn(playingPlayerIndex: number, thisPlayersIndex: number) {
    setIsPlayerTurn(thisPlayersIndex == playingPlayerIndex)
  }

  const updateGameState = (data: any) => {
    const response = new WarlocksResponseAdapter(data)
    console.log(response)
    const turnOrder = response.turnOrder
    const player_names = response.players
    const state = response.state
    
    const gameState = response.gameState
    const round = response.roundNumber
    const bidState = response.hasPlayerBid
    const playerBids = response.playerBids
    const playerHand = response.thisPlayerHandWithInfo
    const prePlayerHand = response.thisPlayerHand

    const trumpSuite = response.trumpSuite
    const playerScores = response.playerPoints
    const playingPlayerIndex = response.currentTrick.CurrentPlayerIndex
    const currentTrick = response.currentTrick
    const lastTrickResult = response.lastTrickResults

    const thisPlayerIndex: number = turnOrder.indexOf(username ?? "")
    handleRoomState(turnOrder, player_names, state, thisPlayerIndex)
    setGameState(gameState)
    setRound(round)
    setHasBid(bidState[thisPlayerIndex])
    setPlayerBids(playerBids)
    setBeforeHand(prePlayerHand)
    setHand(playerHand)
    setTrump(suitEmojis[trumpSuite])
    setLead(suitEmojis[currentTrick.LeadSuit])
    setPlayerPoints(playerScores)
    getIsPlayerTurn(playingPlayerIndex, thisPlayerIndex)
    setCurrentTrick(currentTrick)
    if (playerHand.length != round) {
      setLastTrick(lastTrickResult)
    } else {
      setLastTrick(null)
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

   const handleChooseCard = async () => {
    try {
      let player_Id = localStorage.getItem("userId" + randomId) ?? "";
      let lobbyId = localStorage.getItem("lobbyId") ?? "";
      // console.log(DRAW_CARD(player_Id))
      const res = await fetch(CHOOSE_CARD(lobbyId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Player-Key": player_Id
        },
        body: JSON.stringify({
          Card: hand[selectedIndex].Card, // whatever value you want to send
        }),
      });

      return true;
    } catch (err) {
      console.error("Error fetching game state:", err);
      return null;
    }
  }

  const handleToggle = (index: number) => {
    setSelectedIndex(prev => (prev === index ? -1 : index));
  };

  return (
    <div
      className="flex flex-col bg-green-700 text-white p-4 relative"
      style={{ width: `${width}px`, height: `${width}px` }}
      onClick={() => {
        setSelectedIndex(-1)
      }}
    > 
    <div className="absolute top-2 right-2 bg-black/40 p-2 rounded shadow-md">
    <h2 className="font-bold text-sm mb-1">Bids</h2>
    <table className="border-collapse border border-white text-xs">
      <thead>
        <tr>
          {players.map(p => (
            <th key={p} className="border border-white px-2">{p}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {players.map((p, index) => (
            <td key={p} className="border border-white px-2">
              {playerBids[index] ?? "-"}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
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
                <td className="border border-white px-2">{round}</td>
                {players.map((p, index) => (
                  <td key={p} className="border border-white px-2">{playerPoints[index]}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Middle: Play Area */}
    <div className="flex-1 flex flex-col justify-center items-center space-y-6">
      <div className="text-2xl font-bold mb-4">Trump: {trump}</div>
      <div className="text-2xl font-bold mb-4">Lead: {lead}</div>

      {/* Current Trick */}
        {!currentTrick || currentTrick.CardsPlayed.length === 0 ? (
          <div className="text-gray-300 text-center w-full">No cards played yet</div>
        ) : (
          <div
            className="relative inline-block p-2 rounded-lg"
            style={{
              width: `${80 * (currentTrick?.CardsPlayed.length ?? 1 - 1) + 80}px`, 
              height: "90px", // or whatever the card height is
            }}
          >{
          currentTrick.CardsPlayed.map((card, i) => (
            <div
              key={i}
              className="absolute top-0"
              style={{
                left: i * 30, // shift each card to the right
                zIndex: i,    // later cards on top
              }}
            >
              <CardObject
                card={{ Card: card, IsPlayable: true }}
                selected={false}
                onToggle={() => {}}
              />
            </div>
          ))}
          </div>
        )}
    </div>



      {/* Slider + Input for BID state */}
      {gameState === "Bid" && !hasBid && (
        <div className="flex flex-col items-center space-y-4 bg-black/30 p-6 rounded-lg">
          <div className="flex justify-center space-x-2">
          {beforeHand.map((card, i) => (
            <CardObject
              key={i}
              card={{Card: card, IsPlayable: true}}
              selected={false}
              onToggle={() => {}}
            />
          ))}
        </div>
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
      <div className="flex flex-col items-center space-y-2">
        {/* Player Turn Indicator */}
        {isPlayerTurn && (
          <div className="text-yellow-300 font-bold mb-1">
            It's your turn! Select a card to play.
          </div>
        )}

        <div className="flex justify-center space-x-2">
          {hand.map((card, i) => (
            <CardObject
              key={i}
              card={card}
              selected={selectedIndex === i && isPlayerTurn}
              onToggle={() => handleToggle(i)}
            />
          ))}
        </div>


        {/* Choose Card Button */}
        {selectedIndex !== -1 && isPlayerTurn && (
          <button
            onClick={handleChooseCard}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:scale-105 transition"
          >
            Choose Card
          </button>
        )}
      <BiddingOverlay round={round} show={showBiddingOverlay} />
      <TrickWinnerOverlay winner={localTurnOrder[lastTrick?.Winner ?? -1]} show={showWinnerOverlay} />
      <TrickOverlay
        round={round}
        trickNumber={(lastTrick?.Num ?? 0) + 1}
        show={showTrickOverlay}
      />
      </div>
    </div>
  );
}
