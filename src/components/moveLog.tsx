"use client";

import { useEffect, useRef, useState } from "react";

interface MoveLogProps {
  moveLog: string[];
}

export default function MoveLog({ moveLog }: MoveLogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Track manual scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < 50);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    handleScroll(); // initial check
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // 👇 New: Handle new moves
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isUserAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    if (isUserAtBottom) {
      jumpToBottom()
    } else {
      setIsAtBottom(false);
    }
  }, [moveLog]);

  if (!moveLog.length) return null;

  const jumpToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      setIsAtBottom(true);
    }
  };

  return (
    <div className="mb-6 relative">
      <h3 className="text-lg font-semibold text-cyan-100 mb-3">Move Log</h3>
      <div
        ref={containerRef}
        className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-cyan-600 scrollbar-track-slate-700"
      >
        {moveLog.map((entry, index) => (
          <div
            key={index}
            className="text-sm text-cyan-200 bg-slate-700/70 px-3 py-2 rounded-md border border-cyan-400/20 shadow-sm"
          >
            {entry}
          </div>
        ))}
      </div>

      {!isAtBottom && (
        <button
          onClick={jumpToBottom}
          className="absolute bottom-0 right-2 mb-1 px-3 py-1 bg-cyan-600 text-white rounded-md text-sm shadow-lg hover:bg-cyan-700 transition"
        >
          Jump to Latest
        </button>
      )}
    </div>
  );
}
