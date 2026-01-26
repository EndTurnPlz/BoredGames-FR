"use client";
import ReconnectOverlay from "@/components/Apologies/Overlays/ReconnectOverlay";
import BidsPanel from "@/components/Warlocks/BidBoard";
import BidSelector from "@/components/Warlocks/BidSelector";
import CardObject from "@/components/Warlocks/Card";
import PlayArea from "@/components/Warlocks/MiddleArea";
import BiddingOverlay from "@/components/Warlocks/Overlays/BiddingOverlay";
import TrickOverlay from "@/components/Warlocks/Overlays/TrickOverlay";
import TrickWinnerOverlay from "@/components/Warlocks/Overlays/TrickWinnerOverlay";
import PlayerHand from "@/components/Warlocks/PlayerHand";
import PlayerCircle from "@/components/Warlocks/PlayerOval";
import PlayerOval from "@/components/Warlocks/PlayerOval";
import Scoreboard from "@/components/Warlocks/Scoreboard";
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
    const playerHand = [...response.thisPlayerHandWithInfo].sort((a, b) => {
      if (!a.IsPlayable && b.IsPlayable) return -1; // a goes before b
      if (a.IsPlayable && !b.IsPlayable) return 1;  // b goes before a
      return 0; // preserve order if both are same
    });
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
    <BidsPanel localTurnOrder={localTurnOrder} playerBids={playerBids} />
    <Scoreboard
      localTurnOrder={localTurnOrder}
      playerPoints={playerPoints}
      round={round}
    />


     <PlayArea trump={trump} lead={lead} currentTrick={currentTrick} />


      {gameState === "Bid" && !hasBid && (
        <BidSelector
          beforeHand={beforeHand}
          round={round}
          bid={bid}
          setBid={setBid}
          handleSubmitBet={handleSubmitBet}
        />
      )}


     {/* Bottom Row: Player Hand */}
      <PlayerHand
        hand={hand}
        selectedIndex={selectedIndex}
        isPlayerTurn={isPlayerTurn}
        localTurnOrder={localTurnOrder}
        currentTrick={currentTrick}
        handleToggle={handleToggle}
        handleChooseCard={handleChooseCard}
        gameState={gameState}
      />

      <BiddingOverlay round={round} show={showBiddingOverlay} />
      <TrickWinnerOverlay winner={localTurnOrder[lastTrick?.Winner ?? -1]} show={showWinnerOverlay} />
      <TrickOverlay
        round={round}
        trickNumber={(lastTrick?.Num ?? 0) + 1}
        show={showTrickOverlay}
      />
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
