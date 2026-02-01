"use client";

import React from "react";
import { createPortal } from "react-dom";

type RentInfo = {
  base: number;
  oneHouse: number;
  twoHouse: number;
  threeHouse: number;
  fourHouse: number;
  hotel: number;
};

type Rotation = 0 | 90 | 180 | 270;

type TileOverlayProps = {
  rent: RentInfo;
  rotation: Rotation;
  anchorRect: DOMRect;
  isVisible: boolean;
};

export default function TileOverlay({
  rent,
  rotation,
  anchorRect,
  isVisible,
}: TileOverlayProps) {
  const { overlayStyle, arrowStyle } = getOverlayStyle(rotation, anchorRect);

  return createPortal(
    <div style={overlayStyle} onClick={(e) => e.stopPropagation()}>
      <div style={arrowStyle} />
      <div
        style={{
          background: "#111",
          borderRadius: 8,
          padding: 12,
          color: "white",
          fontSize: 12,
          boxShadow: "0 12px 35px rgba(0,0,0,0.6)",
          transformOrigin: "center",
          animation: isVisible
            ? "overlayIn 160ms ease-out forwards"
            : "overlayOut 160ms ease-in forwards"
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Rent</div>
        <div>Base: ${rent.base}</div>
        <div>1 House: ${rent.oneHouse}</div>
        <div>2 Houses: ${rent.twoHouse}</div>
        <div>3 Houses: ${rent.threeHouse}</div>
        <div>4 Houses: ${rent.fourHouse}</div>
        <div>Hotel: ${rent.hotel}</div>
      </div>
    </div>,
    document.body
    );
}

/* ───────── styles ───────── */

function getOverlayStyle(
  rotation: Rotation,
  rect: DOMRect
) : {
  overlayStyle: React.CSSProperties;
  arrowStyle: React.CSSProperties;
}  {
  const base: React.CSSProperties = {
    position: "fixed",
    width: 170,
    padding: 12,
    background: "#111", 
    color: "white",
    borderRadius: 8,
    fontSize: 12,
    zIndex: 9999,
    animation: "overlayIn 1s fade-out",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
  };


  const baseArrow: React.CSSProperties = {
    position: "absolute",
    width: 10,
    height: 10,
    background: "#111",
    transform: "rotate(45deg)"
  };


  switch (rotation) {
    case 0:
      return  {
        overlayStyle: {
            ...base,
            top: rect.top,
            left: rect.right,
            transform: "translate(-75%, -100%)"
        },
        arrowStyle: {
          ...baseArrow,
          bottom: -10,
          left: "50%",
          transform: "translateY(-50%) rotate(135deg)"
        }
    };
    case 90:
      return {
        overlayStyle: {
            ...base,
            top: rect.top,
            left: rect.left,
            transform: "translate(50%, -25%)"
        },
        arrowStyle: {
            ...baseArrow,
            left: -10,
            top: "50%",
            transform: "translateX(50%) rotate(45deg)"
        }
    };
    case 180:
      return { 
        overlayStyle: {
            ...base,
            top: rect.top,
            left: rect.left,
            transform: "translate(-25%, 50%)"
        },
        arrowStyle: {
            ...baseArrow,
            top: -10,
            right: "50%",
            transform: "translateY(50%) rotate(45deg)"
        }
      };
    case 270:
      return  {
        overlayStyle: {
            ...base,
            top: rect.bottom,
            left: rect.left,
            transform: "translate(-100%, -75%)"
        },
        arrowStyle: {
          ...baseArrow,
          right: -10,
          top: "50%",
          transform: "translateX(-50%) rotate(45deg)"
        }
      };
  }
}
const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 6,
  fontWeight: 700,
  borderBottom: "1px solid rgba(255,255,255,0.2)",
  paddingBottom: 4
};