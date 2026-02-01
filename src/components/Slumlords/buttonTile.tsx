"use client";

import React, { useEffect, useRef, useState } from "react";
import TileOverlay from "./buttonOverlay";

const tileStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.3)",
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
  fontSize: 12,
  userSelect: "none",
  position: "relative",
  overflow: "visible",
  justifyContent: "flex-start",
  alignItems: "center",
  borderRadius: 4,
  padding: 0,
  boxSizing: "border-box"
};

const colorBand: React.CSSProperties = {
  height: 20,
  width: "100%"
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: "4px"
};

const nameStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "white",
  fontSize: 12,
  textShadow: "1px 1px 2px rgba(0,0,0,0.7)"
};

const priceStyle: React.CSSProperties = {
  fontSize: 10,
  color: "white",
  textShadow: "1px 1px 2px rgba(0,0,0,0.7)"
};

type Rotation = 0 | 90 | 180 | 270;

type RentInfo = {
  base: number;
  oneHouse: number;
  twoHouse: number;
  threeHouse: number;
  fourHouse: number;
  hotel: number;
};

type BoardTileProps = {
  name: string;
  price?: number;
  color?: string;
  rotation?: Rotation;
  rent?: RentInfo;
  style?: React.CSSProperties;
};

export default function BoardTile({
  name,
  price,
  color,
  rotation = 0,
  rent,
  style
}: BoardTileProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [renderOverlay, setRenderOverlay] = useState(false);

  const tileRef = useRef<HTMLButtonElement>(null);

  function openOverlay() {
    setRenderOverlay(true);
    setShowOverlay(true);
  }

  function closeOverlay() {
    setShowOverlay(false);
    setTimeout(() => setRenderOverlay(false), 160); // match animation duration
  }

  useEffect(() => {
    if (!showOverlay) return;

    function handleClickOutside(e: MouseEvent) {
      if (!tileRef.current) return;

      if (!tileRef.current.contains(e.target as Node)) {
        closeOverlay();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOverlay]);

  return (
    <button
      ref={tileRef}
      onClick={() => openOverlay()}
      style={{
        ...tileStyle,
        transform: `rotate(${rotation}deg)`,
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(6px)",
        ...style
      }}
    >
      {color && <div style={{ ...colorBand, backgroundColor: color }} />}

      <div style={contentStyle}>
        <div style={nameStyle}>{name}</div>
        {price !== undefined && <div style={priceStyle}>${price}</div>}
      </div>

      {renderOverlay && rent && tileRef.current && (
        <TileOverlay
          rent={rent}
          rotation={rotation}
          anchorRect={tileRef.current.getBoundingClientRect()}
          isVisible={showOverlay}
        />
      )}

    </button>
  );
}
