"use client";
// pages/lobby.tsx
import Lobby from "@/components/Lobby";
import { ApologiesGameResponseAdapter } from "@/utils/adapters";
import { GET_START } from "@/utils/Apologies/config";
import { GameInProgress, GET_GAMESTREAM, GET_LOBBY, maxPlayers } from "@/utils/config";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LobbyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameType = searchParams.get("game") ?? "";
    const username = searchParams.get("username") ?? "";
    const randomId = searchParams.get("randomId");

    const devMode = false
    
    const [players, setPlayers] = useState<string []>([])
    const [loading, SetLoading] = useState(false);

    
    useEffect(()=> {
       if (devMode) {
          router.push(
            `/boardGame?game=${gameType}&username=${encodeURIComponent(
              username
            )}&randomId=${randomId}`
          );
          return;
        }
    }, [])
    const handleStart = async () => {
      try {
        SetLoading(true)
        const lobbyId = localStorage.getItem("lobbyId")  ?? "";
        const playerId = localStorage.getItem("userId" + randomId) ?? "";
        const res = await fetch(GET_START(lobbyId), {
          method: "POST",
          headers: 
          { 
            "Content-Type": "application/json",
            "X-Player-Key": playerId
          },
        });
        if (!res.ok) return;
      } catch (err) {
        SetLoading(false)
        console.error("Error contacting backend:", err);
      }
    };


    useEffect(() => {
    
        const playerId = localStorage.getItem("userId" + randomId) ?? "";
        const lobbyId = localStorage.getItem("lobbyId") ?? "";
        // console.log(GET_GAMESTREAM(lobbyId, playerId));
    
        const eventSource = new EventSource(GET_GAMESTREAM(lobbyId, playerId));
    
        eventSource.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data); // If your server sends JSON
            updateLobbyState(data)
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

      const updateLobbyState = (response: any) => {
        const adapter = new ApologiesGameResponseAdapter(response);
        setPlayers(adapter.players)
        
        const phase = adapter.state
        if (phase == GameInProgress) {
          setTimeout(() => {
            router.push(
              `/boardGame?game=${gameType}&username=${encodeURIComponent(
                username
              )}&randomId=${randomId}`
            );
          }, 500);
        }
        console.log(phase)
      }
    return (
  <div
    style={{
      filter: loading ? "blur(4px)" : "none",
      pointerEvents: loading ? "none" : "auto",
      transition: "filter 0.3s ease"
    }}
  >
    <Lobby
      gameName={gameType}
      players={players}
      maxPlayers={maxPlayers[gameType]}
      playerName={username}
      handleStart={handleStart}
    />
  </div>
);
}
