"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";

interface GameCarouselProps {
  gameType: string;
  onGameSelect: (gameName: string) => void;
}

export default function GameCarousel({
  gameType,
  onGameSelect,
}: GameCarouselProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentGameIndex, setCurrentGameIndex] = useState(0);

  const games = useMemo(
    () => [
      {
        name: "Apologies",
        description: "A strategic board game of movement and strategy",
        icon: "😔",
        tags: ["board game", "strategy", "multiplayer"],
      },
      {
        name: "Whitejack",
        description: "A fun card game",
        icon: "🃏",
        tags: ["card game", "fun", "multiplayer"],
      },
      {
        name: "Chezz",
        description: "The classic strategy game for two players",
        icon: "♛",
        tags: ["board game", "strategy", "classic", "two player"],
      },
      {
        name: "Ups And Downs",
        description: "The classic race-to-the-finish game for all ages",
        icon: "🎲",
        tags: ["board game", "chance", "family", "multiplayer", "classic"]
      },
    ],
    []
  );

  // Fuse.js configuration for fuzzy search
  const fuseOptions = useMemo(
    () => ({
      keys: [
        { name: "name", weight: 3 },
        { name: "description", weight: 2 },
        { name: "tags", weight: 1.5 },
      ],
      threshold: 0.4, // Lower = more strict, higher = more fuzzy
      distance: 100,
      includeScore: true,
      minMatchCharLength: 1,
    }),
    []
  );

  const fuse = useMemo(
    () => new Fuse(games, fuseOptions),
    [games, fuseOptions]
  );

  // Enhanced filter with Fuse.js fuzzy search
  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) {
      return games.map((game) => ({ item: game, score: 1 }));
    }

    const results = fuse.search(searchQuery);
    return results.map((result) => ({
      item: result.item,
      score: 1 - (result.score || 0), // Convert Fuse score to our scoring system
    }));
  }, [searchQuery, fuse, games]);

  // Carousel navigation functions
  const nextGame = () => {
    setCurrentGameIndex((prev) =>
      prev + 4 >= filteredGames.length ? 0 : prev + 4
    );
  };

  const prevGame = () => {
    setCurrentGameIndex((prev) =>
      prev === 0 ? Math.max(0, filteredGames.length - 4) : prev - 4
    );
  };

  // Get visible games for carousel (4 at a time)
  const visibleGames = filteredGames.slice(
    currentGameIndex,
    currentGameIndex + 4
  );

  return (
    <div className="w-full max-w-5xl mb-16">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Game</h2>
      </div>

      {/* Search bar */}
      <div className="relative mb-6 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search games..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 rounded-xl border-2 border-cyan-400/30 bg-slate-800/60 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition pl-10 placeholder-cyan-200/50"
          autoComplete="off"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-300/80">
          🔍
        </div>
      </div>

      {/* Game carousel */}
      {filteredGames.length > 0 ? (
        <div className="relative flex items-center justify-center">
          {/* Left arrow */}
          {filteredGames.length > 4 && (
            <button
              onClick={prevGame}
              className="absolute -left-16 z-10 p-3 rounded-full bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 hover:text-cyan-200 transition-all duration-200 hover:scale-110 border border-cyan-400/30"
              disabled={currentGameIndex === 0}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Games container */}
          <div className="flex gap-6 justify-center">
            {visibleGames.map((gameResult) => {
              const game = gameResult.item;
              // Calculate opacity based on search relevance (only when searching)
              const relevanceOpacity = searchQuery.trim()
                ? Math.max(0.4, Math.min(1, gameResult.score || 1))
                : 1;

              return (
                <div
                  key={game.name}
                  onClick={() => { const gameName = game.name.replaceAll(" ", ""); onGameSelect(gameName) } }
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 w-[220px] h-[180px] flex flex-col justify-between ${
                    gameType === game.name.replaceAll(" ", "")
                      ? "bg-cyan-400/10 border-2 border-cyan-400 shadow-lg shadow-cyan-400/30"
                      : "bg-slate-800/40 border-2 border-cyan-400/20 hover:border-cyan-400/50 hover:bg-slate-800/60"
                  }`}
                  style={{ opacity: relevanceOpacity }}
                >
                  <div className="text-center flex-1 flex flex-col justify-center">
                    <div className="text-5xl mb-3 animate-bounce hover:animate-pulse">
                      {game.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {game.name}
                    </h3>
                    <p className="text-sm text-white/70 line-clamp-2">
                      {game.description}
                    </p>
                    {/* Search relevance indicator */}
                    {searchQuery.trim() &&
                      gameResult.score &&
                      gameResult.score > 0.8 && (
                        <div className="mt-2 flex justify-center">
                          <div className="px-2 py-1 bg-cyan-400/20 text-cyan-300 text-xs rounded-full">
                            Best match
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right arrow */}
          {filteredGames.length > 4 && (
            <button
              onClick={nextGame}
              className="absolute -right-16 z-10 p-3 rounded-full bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 hover:text-cyan-200 transition-all duration-200 hover:scale-110 border border-cyan-400/30"
              disabled={currentGameIndex + 4 >= filteredGames.length}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-white/60">No games found matching your search.</p>
          <p className="text-white/40 text-sm mt-1">
            Try a different search term.
          </p>
        </div>
      )}

      {/* Dots indicator for pagination */}
      {filteredGames.length > 4 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil(filteredGames.length / 4) }).map(
            (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentGameIndex(index * 4)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  Math.floor(currentGameIndex / 4) === index
                    ? "bg-cyan-400 shadow-lg shadow-cyan-400/50"
                    : "bg-cyan-400/30 hover:bg-cyan-400/60"
                }`}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
