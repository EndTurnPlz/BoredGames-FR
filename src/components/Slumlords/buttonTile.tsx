"use client";

import React from "react";

const tileStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.3)",
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
  fontSize: 12,
  userSelect: "none",
  position: "relative",
  overflow: "hidden",
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

type BoardTileProps = {
  name: string;
  price?: number;
  color?: string;
  rotation?: Rotation;
  onClick?: () => void;
  style?: React.CSSProperties;
};

export default function BoardTile({
  name,
  price,
  color,
  rotation = 0,
  onClick,
  style
}: BoardTileProps) {
  return (
    <button
      onClick={onClick}
      style={{
        ...tileStyle,
        transform: `rotate(${rotation}deg)`,
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(6px)",
        ...style
      }}
    >
      {/* Color band at the top */}
      {color && <div style={{ ...colorBand, backgroundColor: color }} />}

      {/* Text content */}
      <div style={contentStyle}>
        <div style={nameStyle}>{name}</div>
        {price !== undefined && <div style={priceStyle}>${price}</div>}
      </div>
    </button>
  );
}
