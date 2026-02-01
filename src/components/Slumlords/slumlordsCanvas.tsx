"use client";

import BoardTile from "./buttonTile";

type Tile = {
  id: number;
  name: string;
  price?: number;
  color?: string;
};

type BoardProps = {
  boardSize?: number; // in pixels
};

export default function MonopolyBoard({ boardSize = 600 }: BoardProps) {
  const cornerSize = 80;
  const sideWidth = 55;
  const sideHeight = 80;

  const tileNames = [
    "Go","Mediterranean Ave","Community Chest","Baltic Ave","Income Tax",
    "Reading Railroad","Oriental Ave","Chance","Vermont Ave","Connecticut Ave",
    "Jail","St. Charles Place","Electric Company","States Ave","Virginia Ave",
    "Pennsylvania Railroad","St. James Place","Community Chest","Tennessee Ave","New York Ave",
    "Free Parking","Kentucky Ave","Chance","Indiana Ave","Illinois Ave",
    "B&O Railroad","Atlantic Ave","Ventnor Ave","Water Works","Marvin Gardens",
    "Go To Jail","Pacific Ave","North Carolina Ave","Community Chest","Pennsylvania Ave",
    "Short Line","Chance","Park Place","Luxury Tax","Boardwalk"
  ];

  const colors = [
    "#fefefe","#8B4513","#fefefe","#8B4513","#fefefe",
    "#000","#ADD8E6","#fefefe","#ADD8E6","#ADD8E6",
    "#fefefe","#FF69B4","#fefefe","#FF69B4","#FF69B4",
    "#000","#FFA500","#fefefe","#FFA500","#FFA500",
    "#fefefe","#FF0000","#fefefe","#FF0000","#FF0000",
    "#000","#FFFF00","#FFFF00","#fefefe","#FFFF00",
    "#fefefe","#00FF00","#00FF00","#fefefe","#00FF00",
    "#000","#fefefe","#1E90FF","#fefefe","#1E90FF"
  ];

  const prices = [
    0,60,0,60,200,200,100,0,100,120,
    0,140,150,140,160,200,180,0,180,200,
    0,220,0,220,240,200,260,260,150,280,
    0,300,300,0,320,200,0,350,100,400
  ];

  const tiles: Tile[] = Array.from({ length: 40 }, (_, i) => ({
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
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: cornerSize,
            height: cornerSize
          }}
        />
      ))}
      {/* Top Row */}
      {tiles.slice(1, 10).map((tile, idx) => (
        <BoardTile
          key={tile.id}
          {...tile}
          rotation={180}
          style={{
            position: "absolute",
            top: 0,
            left: cornerSize + (idx) * sideWidth,
            width: idx === 10 ? cornerSize : sideWidth,
            height: cornerSize
          }}
        />
      ))}

      {tiles.slice(10, 11).map((tile, idx) => (
        <BoardTile
          key={tile.id}
          {...tile}
          rotation={180}
          style={{
            position: "absolute",
            top: 0,
            left: cornerSize + (9) * sideWidth,
            width: cornerSize,
            height: cornerSize
          }}
        />
      ))}

      {/* Right Column */}
      {tiles.slice(21, 30).map((tile, idx) => (
        <BoardTile
          key={tile.id}
          {...tile}
          rotation={270}
          style={{
            position: "absolute",
            top: cornerSize + (idx) * sideWidth - 12.5,
            left: cornerSize + (9) * sideWidth + 12.5,
            width: sideWidth,
            height: sideHeight
          }}
        />
      ))}

      {tiles.slice(30, 31).map((tile, idx) => (
        <BoardTile
          key={tile.id}
          {...tile}
          rotation={270}
          style={{
            position: "absolute",
            top: cornerSize + (9) * sideWidth,
            left: cornerSize + (9) * sideWidth,
            width: cornerSize,
            height: cornerSize
          }}
        />
      ))}

      {/* Bottom Row */}
      {tiles.slice(31, 40).map((tile, idx) => (
        <BoardTile
          key={tile.id}
          {...tile}
          rotation={0}
          style={{
            position: "absolute",
            bottom: -sideHeight + 25,
            left: cornerSize + (idx) * sideWidth,
            width: sideWidth,
            height: cornerSize
          }}
        />
      ))}

      {tiles.slice(20,21).map((tile, idx) => (
        <BoardTile
          key={tile.id}
          {...tile}
          rotation={0}
          style={{
            position: "absolute",
            bottom: -sideHeight + 25,
            left: 0,
            width: cornerSize,
            height: cornerSize
          }}
        />
      ))}

      {/* Left Column */}
      {tiles.slice(11, 20).map((tile, idx) => (
        <BoardTile
          key={tile.id}
          {...tile}
          rotation={90}
          style={{
            position: "absolute",
            top: cornerSize + idx * sideWidth-12.5,
            left: 12.5,
            width: sideWidth,
            height: sideHeight
          }}
        />
      ))}
    </div>
  );
}
