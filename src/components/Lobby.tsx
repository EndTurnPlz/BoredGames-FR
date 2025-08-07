import { useEffect, useState } from "react";
import Header from "./Apologies/Header";
import GameSettingsSidebar from "./settingsSideBar";
import { GET_START } from "@/utils/Apologies/config";
import GameSidebarLeft from "./leftSidebar";
import { GET_LOBBY } from "@/utils/config";
import RulesModal from "./rulesModal";

type LobbyProps = {
  playerName: string;
  gameName: string;
  players: string[];
  maxPlayers: number;
  handleStart: () => void;
};

export default function Lobby({ gameName, players, maxPlayers, playerName, handleStart }: LobbyProps) {
  const filledSpots = Array.from({ length: maxPlayers }, (_, i) =>
    players[i] ? players[i] : null
  );

  // inside your component
  const [settings, setSettings] = useState({
    isPrivate: false,
  });
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [showCards, setShowCards] = useState(false);

  const enoughPlayers = (length: number) => {
    if (gameName === "Apologies" && length == 4) {
      return true;
    } else if (gameName === "UpsAndDowns" && 2 <= length && length <= 8) {
      return true;
    }
    return false
  }

  useEffect(() => {
    const lobbyId = localStorage.getItem("lobbyId") ?? "";
    if (lobbyId) {
      console.log()
      const link = GET_LOBBY(gameName ?? "", lobbyId);
      setShareLink(link);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-950 text-white">
      <Header />

      <main className="flex pt-24 px-4 h-[calc(100vh-4rem)]">
        <GameSidebarLeft
          gameType={gameName}
          username={playerName}
          shareLink={shareLink}
          gameStarted={players.length == maxPlayers}
          copied={copied}
          setCopied={setCopied}
          setShowRules={setShowRules}
        />
        <RulesModal
          showRules={showRules}
          showCards={showCards}
          setShowRules={setShowRules}
          setShowCards={setShowCards}
          gameType={gameName}
        />
        {/* Main Content (center) */}
        <div className="flex-1 flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-8 text-center">{gameName}</h1>
          <div className="grid grid-cols-2 gap-4 max-w-md w-full">
            {filledSpots.map((player, index) => (
              <div
                key={index}
                className="bg-white text-black rounded-xl shadow p-4 text-center text-lg font-medium"
              >
                {player || <span className="text-gray-400">Waiting...</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <GameSettingsSidebar handleStart={handleStart} enoughPlayers={enoughPlayers(players.length)} isHost={playerName == players[0]} />
      </main>
    </div>
  );

}
