"use client";
import { HiShare, HiOutlineBookOpen } from "react-icons/hi";

export default function GameSidebarLeft({
  gameType,
  username,
  shareLink,
  copied,
  setCopied,
  gameStarted,
  setShowRules,
}: {
  gameType: string | null;
  username: string | null;
  shareLink: string;
  copied: boolean;
  setCopied: (v: boolean) => void;
  gameStarted: boolean;
  setShowRules: (v: boolean) => void;
}) {
  return (
    <div className="w-80 bg-slate-800/80 backdrop-blur-lg border-2 border-cyan-500/30 p-6 flex flex-col rounded-2xl shadow-lg shadow-cyan-900/20 my-2 z-90">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-cyan-100">{gameType}</h1>
          <button
            onClick={() => setShowRules(true)}
            className="px-3 py-2 bg-slate-700/80 hover:bg-slate-700/90 rounded-lg transition-colors duration-200 border border-cyan-400/30 shadow-sm flex items-center gap-2 text-sm"
            aria-label="Show game rules"
          >
            <HiOutlineBookOpen className="text-cyan-300 text-lg" />
            <span className="text-cyan-100 font-medium">Rules</span>
          </button>
        </div>
        <p className="text-cyan-200/80">Player: {username}</p>
      </div>

        {shareLink && !gameStarted && (
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-cyan-100 mb-3 flex items-center gap-2">
                <HiShare className="w-5 h-5 text-cyan-300" />
                Share this game
                </h3>
                <div className="space-y-3">
                    <div className="bg-slate-700/80 border border-cyan-400/40 p-3 rounded-xl text-sm shadow-inner">
                    <p className="text-cyan-200 break-all">{shareLink}</p>
                    </div>
                    <button
                    onClick={() => {
                        navigator.clipboard.writeText(shareLink);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:scale-105 transition-all duration-200"
                    >
                    {copied ? "Copied!" : "Copy"}
                    </button>
                </div>
            </div>
        )}
    </div>
  );
}
