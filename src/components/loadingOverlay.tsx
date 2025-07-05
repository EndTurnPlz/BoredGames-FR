"use client";

export default function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className="text-6xl font-bold text-black animate-pulse">
        ...
      </div>
    </div>
  );
}
