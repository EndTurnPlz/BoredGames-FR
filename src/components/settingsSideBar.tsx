// File: components/GameSidebarRight.tsx
"use client";
import { indexToColor } from "@/utils/config";
import MoveLog from "./Apologies/moveLog";

export default function GameSidebarRight({
}: {
}) {
  return (
    <div className="w-80 bg-slate-800/80 backdrop-blur-lg border-2 border-cyan-500/30 p-6 flex flex-col rounded-2xl shadow-lg shadow-cyan-900/20 my-2 z-90">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cyan-100">Game Settings</h1>
      </div>
    </div>
  );
}
