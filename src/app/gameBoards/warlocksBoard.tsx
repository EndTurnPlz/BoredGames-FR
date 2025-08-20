"use client";
import ReconnectOverlay from "@/components/Apologies/Overlays/ReconnectOverlay";
import CardObject from "@/components/Warlocks/Card";
import BiddingOverlay from "@/components/Warlocks/Overlays/BiddingOverlay";
import TrickOverlay from "@/components/Warlocks/Overlays/TrickOverlay";
import TrickWinnerOverlay from "@/components/Warlocks/Overlays/TrickWinnerOverlay";
import PlayerCircle from "@/components/Warlocks/PlayerOval";
import PlayerOval from "@/components/Warlocks/PlayerOval";
import { Card, CardInfo, LastTrick, Trick, WarlocksResponseAdapter } from "@/utils/adapters";
import { GameEnd, GameInProgress, GET_GAMESTREAM } from "@/utils/config";
import { CHOOSE_CARD, SUBMIT_BET, suitEmojis, width } from "@/utils/Warlocks/config";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
type BoardCanvasProps = {
  playerColor: string;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  setTurnOrder: React.Dispatch<React.SetStateAction<string[]>>;
  setGameStarted: React.Dispatch<React.SetStateAction<boolean>>;
  setMoveLog: React.Dispatch<React.SetStateAction<string[]>>;
  setGameStats: React.Dispatch<React.SetStateAction<number[]>>;
  setWinner: React.Dispatch<React.SetStateAction<string[]>>;
  setHost: React.Dispatch<React.SetStateAction<string>>;
};

export default function WizardBoard({
  setGameOver,
  setTurnOrder,
  setGameStarted,
  setMoveLog,
  setGameStats,
  setWinner,
  setHost,
}: BoardCanvasProps) {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const randomId = searchParams.get("randomId");

  const [players, setPlayers] = useState<string[]>([]);
  const [playerConnectivity, setPlayerConnectivity] = useState<boolean[]>([]);
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
      setGameState("Bid")
      setBeforeHand([{Rank: "Eight", Suit: "Spades"}, {Rank: "Eight", Suit: "Spades"}, {Rank: "Eight", Suit: "Spades"}, {Rank: "Eight", Suit: "Spades"}, {Rank: "Eight", Suit: "Spades"}, {Rank: "Eight", Suit: "Spades"}, {Rank: "Eight", Suit: "Spades"}, {Rank: "Eight", Suit: "Spades"}, {Rank: "Eight", Suit: "Spades"}, {Rank: "Eight", Suit: "Spades"}, {Rank: "Eight", Suit: "Spades"}, {Rank: "Eight", Suit: "Spades"}, {Rank: "Eight", Suit: "Spades"}, {Rank: "Eight", Suit: "Spades"}, {Rank: "Eight", Suit: "Spades"}, {Rank: "Eight", Suit: "Spades"}, {Rank: "Eight", Suit: "Spades"}]);

      // setCurrentTrick({CardsPlayed: [{Rank: "Eight", Suit: "Spades"}], LeadSuit: "Spades", TrickLeader: 0, CurrentPlayerIndex: 0})
      // setHand([{Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}, {Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}, {Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}, {Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}, {Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}, {Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}, {Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}, {Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}, {Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}, {Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}, {Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}, {Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}, {Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}, {Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}, {Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}, {Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}, {Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}, {Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}, {Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}, {Card: {Rank: "Eight", Suit: "Spades"}, IsPlayable: true}])
      setTimeout(() => {
        setCurrentTrick({CardsPlayed: [{Rank: "Eight", Suit: "Spades"}, {Rank: "Eight", Suit: "Spades"}], LeadSuit: "Spades", TrickLeader: 0, CurrentPlayerIndex: 0})
      }, 2000);
      // setCurrentCard(7)
    }, []);
  

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

  function getCardDescription(cardsPlayed: Card[]): string {
    const lastCard = cardsPlayed[cardsPlayed.length - 1]
    if (lastCard.Rank == "Joker" || lastCard.Rank == "Warlock") {
      return`${lastCard.Rank}`
    }
    return `${lastCard.Rank} of ${lastCard.Suit}`
  }
  function generateMoveDescription(lastTrick: LastTrick, trick: Trick, roundNumber: number, turnOrder: string[], phase: string, length: number): string[] {
    if (phase === "Bid") {
      return [
       ...(lastTrick
          ? [
              `${turnOrder[(lastTrick.Leader + turnOrder.length - 1) % turnOrder.length]} played ${getCardDescription(lastTrick.Cards)}`,
              `${turnOrder[lastTrick.Winner]} won the trick`,
            ]
          : []),
          `round ${roundNumber} start`
      ];
    } else if (trick.CardsPlayed.length != 0) {
      return [`${turnOrder[(trick.CurrentPlayerIndex + turnOrder.length - 1) % turnOrder.length]} played ${getCardDescription(trick.CardsPlayed)}`]
    } else if (lastTrick && trick.CardsPlayed.length == 0 && lastTrick.Num <= roundNumber - length) {
      return [`${turnOrder[(lastTrick.Leader + turnOrder.length - 1) % turnOrder.length]} played ${getCardDescription(lastTrick.Cards)}`, 
      `${turnOrder[lastTrick.Winner]} won the trick`]
    }
    return [""]
  }
  function updateMoveLog(lastTrick: LastTrick, trick: Trick, roundNumber: number, turnOrder: string[], phase: string, length: number) {
    setMoveLog((prev) => {
      const new_moves = generateMoveDescription(lastTrick, trick, roundNumber, turnOrder, phase, length)
        let newLog = [];
        newLog.push(...prev);
        const lastEntries = prev.slice(-new_moves.length);

        const isDuplicate = lastEntries.length === new_moves.length &&
          lastEntries.every((move, i) => move === new_moves[i]);

        if (isDuplicate) return prev; // don’t add duplicate moves

        new_moves.forEach((move) => {
          if (move.length > 0 && move != prev[prev.length - 1]) {
            newLog.push(move)
          }
        });
        return newLog

    })
  }


  function handleRoomState(turnOrder: string[], players: string[], state: string, playerIndex: number, playerPoints: number[]) {
    setHost(players[0])
    setPlayers(players)
    setLocalTurnOrder(turnOrder)
    console.log(username, playerIndex)
    setPlayerIndex(playerIndex)
    setTurnOrder(turnOrder);
    if (state == GameInProgress) {
      setGameStarted(true);
    } else if (state == GameEnd) {
      setGameOver(true)
      const maxScore = Math.max(...playerPoints);
      const winnerIndexes = playerPoints
        .map((score, i) => (score === maxScore ? i : -1))
        .filter(i => i !== -1);

      const winners = winnerIndexes.map(i => turnOrder[i]);

      console.log(winners, playerPoints);
      setWinner(winners);
      setGameStats(playerPoints)
    }
  }

  function getIsPlayerTurn(playingPlayerIndex: number, thisPlayersIndex: number) {
    setIsPlayerTurn(thisPlayersIndex == playingPlayerIndex)
  }

  const updateGameState = (data: any) => {
    const response = new WarlocksResponseAdapter(data)
    console.log(response)
    const newTurnOrder = response.turnOrder
    const player_names = response.players
    const state = response.state
    
    const newGameState = response.gameState
    const roundNumber = response.roundNumber
    const bidState = response.hasPlayerBid
    const playerBids = response.playerBids
    const playerHand = response.thisPlayerHandWithInfo
    const prePlayerHand = response.thisPlayerHand
    const playerConn = response.playerConnectionStatus

    const trumpSuite = response.trumpSuite
    const playerScores = response.playerPoints
    const playingPlayerIndex = response.currentTrick.CurrentPlayerIndex
    const currentTrick = response.currentTrick
    const lastTrickResult = response.lastTrickResults

    const thisPlayerIndex: number = newTurnOrder.indexOf(username ?? "")
    handleRoomState(newTurnOrder, player_names, state, thisPlayerIndex, playerScores)
    setGameState(newGameState)
    setRound(roundNumber)
    setHasBid(bidState[thisPlayerIndex])
    setPlayerBids(playerBids)
    setBeforeHand(prePlayerHand)
    setHand(playerHand)
    setTrump(suitEmojis[trumpSuite])
    setLead(suitEmojis[currentTrick.LeadSuit])
    setPlayerPoints(playerScores)
    getIsPlayerTurn(playingPlayerIndex, thisPlayerIndex)
    setCurrentTrick(currentTrick)
    setPlayerConnectivity(playerConn)
    console.log("turonder: ", playerPoints)
    updateMoveLog(lastTrickResult, currentTrick, roundNumber, newTurnOrder, newGameState, playerHand.length)
    if (playerHand.length != roundNumber) {
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
          {localTurnOrder.map(p => (
            <th key={p} className="border border-white px-2">{p}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {localTurnOrder.map((p, index) => (
            <td key={p} className="border border-white px-2">
              {playerBids[index] ?? "-"}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
      {/* Top Row: Player 1 + Scoreboard */}
      <div className="absolute top-2  left-2 justify-between">
        <div className="bg-black/30 p-2 rounded">
          <h2 className="font-bold">Scoreboard</h2>
          <table className=" border-collapse border border-white text-sm">
            <thead>
              <tr>
                <th className="border border-white px-2">Round</th>
                {localTurnOrder.map(p => (
                  <th key={p} className="border border-white px-2">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-white px-2">{round}</td>
                {playerPoints.map((p, index) => (
                  <td key={index} className="border border-white px-2">{playerPoints[index]}</td>
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
      <div className="relative flex justify-center">
        <div
          className="relative p-2 rounded-lg"
          style={{
            width: `${80 + (currentTrick.CardsPlayed.length - 1) * 30}px`, // total pile width
            height: "90px", // card height
          }}
        >
          {currentTrick.CardsPlayed.map((card, i) => (
            <div
              key={i}
              className="absolute top-0"
              style={{
                left: i * 30, 
                zIndex: i,
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
      </div>
    )}

    </div>


      {/* Slider + Input for BID state */}
      {gameState === "Bid" && !hasBid && (
        <div className="flex flex-col items-center space-y-4 bg-black/30 p-6 rounded-lg">
          <div className="flex justify-center space-x-2">
          {beforeHand.map((card, i) => (
            <div
              key={i}
              className={`relative`}
              style={{ marginLeft: i === 0 ? 0 : '-40px' }} // overlap by ~1/3
            >
            <CardObject
              key={i}
              card={{Card: card, IsPlayable: true}}
              selected={false}
              onToggle={() => {}}
            />
            </div>
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
      {/* Player Turn Indicator */}
        {gameState !== "Bid" && (
          isPlayerTurn ? (
            <div className="text-yellow-300 font-bold mb-1">
              It's your turn! Select a card to play.
            </div>
          ) : (
            <div className="text-red-300 font-bold mb-1">
              It's {localTurnOrder[currentTrick?.CurrentPlayerIndex ?? 0]}'s turn. Wait for them to play a card.
            </div>
          )
        )}
        <div className="flex justify-center space-x-2">
          {hand.map((card, i) => (
             <div
              key={i}
              className={`relative`}
              style={{ marginLeft: i === 0 ? 0 : '-40px' }} // overlap by ~1/3
            >
              <CardObject
                key={i}
                card={card}
                selected={selectedIndex === i && isPlayerTurn}
                onToggle={() => handleToggle(i)}
              />
             </div>
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
       <ReconnectOverlay
          playerConnectivity={playerConnectivity}
          players={players}
        />
        {gameState != "Bid" && (
          <PlayerCircle players={localTurnOrder} currentPlayerIndex={playerIndex} />
          )
        }
    
</div>
  );
}
