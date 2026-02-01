"use client";

import { DEFAULT_RENT, sideHeightRatio } from "@/utils/Slumlords/config";
import BoardTile from "./buttonTile";

type Tile = {
  id: number;
  name: string;
  price?: number;
  color?: string;
};

type BoardProps = {
  boardSize?: number; // in pixels
  length?: number
};

export default function SlumlordCanvas({ boardSize = 600, length = 11 }: BoardProps) {
  const sideWidth = boardSize / (length - 2);

  const sideHeight = sideHeightRatio * boardSize
  const cornerSize = sideHeight

  const difference = sideHeight - sideWidth
  const tileNames = [
    // Top row (left → right)
    "Street Corner", "Tin Roof", "Broken Alley", "Community Pot", "Rusty Lane",
    "Abandoned Tracks", "Open Drain", "Chance Hustle", "Crowded Crossing", "Market Shacks",
    "Detention Cell",

    // Right column (top → bottom)
    "Brick Yard", "Power Hook", "Concrete Block", "Water Tap",
    "Bus Depot", "Pawn Shop", "Community Pot", "Food Stall",
    "Crowded Flats", "Main Bazaar",

    // Bottom row (right → left)
    "Open Ground", "Metal Lane", "Chance Hustle", "Flooded Road",
    "Garbage Dump", "Freight Tracks", "Street Market",
    "Rain Shelter", "Water Line", "Power Cut Zone",

    // Left column (bottom → top)
    "Police Raid", "Back Alley", "Community Pot", "Construction Camp",
    "Wage Corner", "Public Toilet", "Tea Stall",
    "Rickshaw Stand", "Chance Hustle", "Night Shelter"
  ];


  const colors = [
    "#fefefe","#8B4513","#fefefe","#8B4513","#fefefe",
    "#000","#ADD8E6","#fefefe","#ADD8E6","#ADD8E6",
    "#fefefe","#FF69B4","#fefefe","#FF69B4","#FF69B4",
    "#000","#FFA500","#fefefe","#FFA500","#FFA500",
    "#fefefe","#FF0000","#fefefe","#FF0000","#FF0000",
    "#000","#FFFF00","#FFFF00","#fefefe","#FFFF00",
    "#fefefe","#00FF00","#00FF00","#fefefe","#00FF00",
    "#000","#fefefe","#1E90FF","#fefefe","#1E90FF",
    "#000","#fefefe","#1E90FF","#fefefe"
  ];

  const prices = [
    0,60,0,60,200,200,100,0,100,120,
    0,140,150,140,160,200,180,0,180,200,
    0,220,0,220,240,200,260,260,150,280,
    0,300,300,0,320,200,0,350,100,400,
    0,350,100,400
  ];

  const tiles: Tile[] = Array.from({ length: length * length - 4 }, (_, i) => ({
    id: i,
    name: tileNames[i],
    price: prices[i],
    color: colors[i]
  }));


  return (
    <div style={{ position: "relative", width: boardSize, height: boardSize, background: "#1a1a1a" }}>
        {tiles.slice(0, 1).map((tile, idx) => (
        <BoardTile
          key={tile.id}
          {...tile}
          rotation={90}
          rent={DEFAULT_RENT}
          style={{
            position: "absolute",
            top: -cornerSize,
            left: -cornerSize,
            width: cornerSize,
            height: cornerSize
          }}
        />
      ))}
      {/* Top Row */}
      {tiles.slice(1, length - 1).map((tile, idx) => (
        <BoardTile
          key={tile.id}
          {...tile}
          rotation={180}
          rent={DEFAULT_RENT}
          style={{
            position: "absolute",
            top: -cornerSize,
            left: (idx) * sideWidth,
            width: sideWidth,
            height: cornerSize
          }}
        />
      ))}

      {tiles.slice(length - 1, length).map((tile, idx) => (
        <BoardTile
          key={tile.id}
          {...tile}
          rotation={180}
          style={{
            position: "absolute",
            top: -cornerSize,
            left: (length - 2) * sideWidth,
            width: cornerSize,
            height: cornerSize
          }}
        />
      ))}

      {/* Right Column */}
      {tiles.slice(2* length - 1, 3 * length - 3).map((tile, idx) => (
        <BoardTile
          key={tile.id}
          {...tile}
          rotation={270}
          rent={DEFAULT_RENT}
          style={{
            position: "absolute",
            top:  (idx) * sideWidth - difference / 2,
            left:  (length - 2) * sideWidth + difference / 2,
            width: sideWidth,
            height: sideHeight
          }}
        />
      ))}

      {tiles.slice(3 * length - 3, 3 * length - 2).map((tile, idx) => (
        <BoardTile
          key={tile.id}
          {...tile}
          rotation={270}
          rent={DEFAULT_RENT}
          style={{
            position: "absolute",
            top:  (length - 2) * sideWidth,
            left: (length - 2) * sideWidth,
            width: cornerSize,
            height: cornerSize
          }}
        />
      ))}

      {/* Bottom Row */}
      {tiles.slice(3 * length - 2, 4 * length - 4).map((tile, idx) => (
        <BoardTile
          key={tile.id}
          {...tile}
          rotation={0}
          rent={DEFAULT_RENT}
          style={{
            position: "absolute",
            top: (length - 2) * sideWidth,
            left:  (idx) * sideWidth,
            width: sideWidth,
            height: cornerSize
          }}
        />
      ))}

      {tiles.slice(2 * length - 2, 2 * length - 1).map((tile, idx) => (
        <BoardTile
          key={tile.id}
          {...tile}
          rotation={0}
          style={{
            position: "absolute",
            top: (length - 2) * sideWidth,
            left: -cornerSize,
            width: cornerSize,
            height: cornerSize
          }}
        />
      ))}

      {/* Left Column */}
      {tiles.slice(length, 2 * length - 2).map((tile, idx) => (
        <BoardTile
          key={tile.id}
          {...tile}
          rotation={90}
          rent={DEFAULT_RENT}
          style={{
            position: "absolute",
            top: idx * sideWidth - difference / 2,
            left: -cornerSize + difference / 2,
            width: sideWidth,
            height: sideHeight
          }}
        />
      ))}
    </div>
  );
}
