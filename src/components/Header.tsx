import React from "react";
import Link from "next/link";

const Header: React.FC = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 p-4 pointer-events-auto">
      <Link
        href="/"
        className="text-2xl font-bold text-white tracking-wide hover:text-cyan-100 transition-colors duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {/* Temporary logo image */}
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          BoredGames
        </div>
      </Link>
    </header>
  );
};

export default Header;
