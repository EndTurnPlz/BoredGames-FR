// utils/outerPath.ts
import { tileSize } from "./config";
import { canvasHeight, canvasWidth } from "./config";
const letters = ["a", "b", "c", "d"];
export const coordMap: Record<string, { x: number; y: number }> = {};

export const coordStringToPixel = (coord: string, tileSize: number): { x: number; y: number, id: string } => {
  const [letter, rowStr] = coord.split("_");
  let col = 0;

  let row = 0;
  if (/^\d+$/.test(rowStr)) {
    // Regular tile, like "a_5"
    let number = parseInt(rowStr, 10);
    if (letter == "a") {
      row = number;
      col = 15;
    } else if (letter == "b") {
      row = 15;
      col = 15 - number;
    } else if (letter == "c") {
      row = 15 - number;
      col = 0;
    } else {
      row = 0;
      col = number;
    }
  } else if (/^s\d+$/.test(rowStr)) {
    // Safety tile, like "a_s3"
    if (letter == "a") {
      row = 2;
      col = 15 - parseInt(rowStr.slice(1), 10)
    } else if (letter == "b") {
      row = 15 - parseInt(rowStr.slice(1), 10);
      col = 13;
    } else if (letter == "c") {
      row = 13;
      col = parseInt(rowStr.slice(1), 10);
    } else {
      row = parseInt(rowStr.slice(1), 10);
      col = 2;
    }
  } else if (rowStr === "H") {
    // Home tile
    if (letter == "a") {
      row = 2;
      col = 8
    } else if (letter == "b") {
      row = 8;
      col = 13;
    } else if (letter == "c") {
      row = 13;
      col = 7;
    } else {
      row = 7;
      col = 2;
    }

  } else {
    if (letter == "a") {
      row = 4;
      col = 13
    } else if (letter == "b") {
      row = 13;
      col = 11;
    } else if (letter == "c") {
      row = 11;
      col = 2;
    } else {
      row = 2;
      col = 4;
    }
  }
  return {
    x: col * tileSize + tileSize / 2,
    y: row * tileSize + tileSize / 2,
    id: coord
  };
};

// Outer path tiles
for (const letter of letters) {
  for (let i = 0; i <= 15; i++) {
    const key = `${letter}_${i}`;
    const { x, y } = coordStringToPixel(key, tileSize);
    coordMap[key] = { x, y };
  }
}

// Safety tiles (s1 to s5 for each player)
for (const letter of letters) {
  for (let i = 1; i <= 5; i++) {
    const key = `${letter}_s${i}`;
    const { x, y } = coordStringToPixel(key, tileSize);
    coordMap[key] = { x, y };
  }
}

// Home tile
for (const letter of letters) {
  const key = `${letter}_H`;
  const { x, y } = coordStringToPixel(key, tileSize);
  coordMap[key] = { x, y };
}

for (const letter of letters) {
  const key = `${letter}_S`;
  const { x, y } = coordStringToPixel(key, tileSize);
  coordMap[key] = { x, y };
}


export const getUnrotatedMousePosition = (
  mouseX: number,
  mouseY: number,
  rotationDegrees: number
): { x: number; y: number } => {
  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;

  const dx = mouseX - cx;
  const dy = mouseY - cy;

  const angleRad = (rotationDegrees * Math.PI) / 180;

  // Unrotate
  const unrotatedX = dx * Math.cos(-angleRad) - dy * Math.sin(-angleRad);
  const unrotatedY = dx * Math.sin(-angleRad) + dy * Math.cos(-angleRad);
  if (rotationDegrees % 180 == 0) {
    return {
      x: unrotatedX + cx,
      y: unrotatedY + cy,
    };
  }
  return {
      x: canvasWidth - (unrotatedX + cx),
      y: canvasHeight - (unrotatedY + cy),
    };
}

const mainLoop = [
  ...Array.from({ length: 15 }, (_, i) => `a_${i + 1}`),
  ...Array.from({ length: 15 }, (_, i) => `b_${i + 1}`),
  ...Array.from({ length: 15 }, (_, i) => `c_${i + 1}`),
  ...Array.from({ length: 15 }, (_, i) => `d_${i + 1}`),
];

const buildBoardGraph = () => {
  const graph: Record<string, string[]> = {};

  const colors = ["a", "b", "c", "d"];
  const nextColor: Record<string, string> = {
    "a": "b",
    "b": "c",
    "c": "d",
    "d": "a"
  };

  const addEdge = (a: string, b: string) => {
    if (!graph[a]) graph[a] = [];
    if (!graph[b]) graph[b] = [];
    graph[a].push(b);
    graph[b].push(a);
  };

  for (const color of colors) {
    for (let i = 1; i <= 15; i++) {
      const current = `${color}_${i}`;
      const next = i === 15 ? `${nextColor[color]}_1` : `${color}_${i + 1}`;
      addEdge(current, next);
    }

    // Start to entry
    addEdge(`${color}_S`, `${color}_4`);

    // Fork to safety from _2
    addEdge(`${color}_2`, `${color}_s1`);

    // Safety zone
    for (let i = 1; i < 5; i++) {
      addEdge(`${color}_s${i}`, `${color}_s${i + 1}`);
    }

    // Last safety to home
    addEdge(`${color}_s5`, `${color}_H`);
  }

  return graph;
};

export function findPath(start: string, end: string): string[] {
  const graph = buildBoardGraph();
  const queue: [string, string[]][] = [[start, [start]]];
  const visited = new Set<string>();
  while (queue.length > 0) {
    const [node, path] = queue.shift()!;
    console.log(node, path)
    if (node === end) return path;

    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, [...path, neighbor]]);
      }
    }
  }

  return []; // No path
}
  