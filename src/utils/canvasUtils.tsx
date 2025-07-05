// canvasUtils.ts
import {
  drawCircle,
  fillTile,
  drawStripWithTriangleAndCircle,
  drawSafetyWord,
} from "@/utils/drawUtils";
import { tileSize, canvasWidth, canvasHeight, darkColorMap } from "@/utils/config";
import { wordToAngleDict } from "@/utils/config";
import { getRotationAngleForColor } from "./rotation";

export function drawBoard(ctx: CanvasRenderingContext2D, playerColor: string) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  const circleRadius = 1.4 * tileSize;
  const numCols = canvasWidth / tileSize;
  const numRows = canvasHeight / tileSize;

  const redSafetyZone = [ [1, 2], [2, 2], [3, 2], [4, 2], [5, 2] ];
  const yellowSafetyZone = [ [14, 13], [13, 13], [12, 13], [11, 13], [10, 13] ];
  const blueSafetyZone = [ [2, 14], [2, 13], [2, 12], [2, 11], [2, 10] ];
  const greenSafetyZone = [ [13, 1], [13, 2], [13, 3], [13, 4], [13, 5] ];

  const zones = [
    { x: 2.5, y: 7.3, color: darkColorMap["red"], text: "Home" },
    { x: 4.5, y: 2.3, color: darkColorMap["red"], text: "Start" },
    { x: 13.5, y: 8.7, color: darkColorMap["yellow"], text: "Home" },
    { x: 11.5, y: 13.7, color: darkColorMap["yellow"], text: "Start" },
    { x: 8.7, y: 2.5, color: darkColorMap["blue"], text: "Home" },
    { x: 13.7, y: 4.5, color: darkColorMap["blue"], text: "Start" },
    { x: 7.3, y: 13.5, color: darkColorMap["green"], text: "Home" },
    { x: 2.3, y: 11.5, color: darkColorMap["green"], text: "Start" },
  ];

  zones.forEach(({ x, y, color, text }) =>
    drawCircle(
      ctx,
      x,
      y,
      circleRadius,
      color,
      tileSize,
      text,
      wordToAngleDict[playerColor],
      playerColor
    )
  );

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const isOuter = row === 0 || row === numRows - 1 || col === 0 || col === numCols - 1;
      if (isOuter) {
        fillTile(ctx, row, col, "black", tileSize);
        continue;
      }
      const zones = [redSafetyZone, yellowSafetyZone, blueSafetyZone, greenSafetyZone];
      const colors = [
        darkColorMap["red"],
        darkColorMap["yellow"],
        darkColorMap["blue"],
        darkColorMap["green"],
      ];

      zones.forEach((zone, i) => {
        if (zone.some(([r, c]) => r === row && c === col)) {
          fillTile(ctx, row, col, colors[i], tileSize);
        }
      });
    }
  }

  const stripConfigs = [
    { x: tileSize / 4, y: 2.5 * tileSize, width: tileSize / 2, height: 4 * tileSize, color: darkColorMap["green"], direction: "down" },
    { x: tileSize / 4, y: 11.5 * tileSize, width: tileSize / 2, height: 3 * tileSize, color: darkColorMap["green"], direction: "down" },
    { x: 15 * tileSize + tileSize / 4, y: 9.5 * tileSize, width: tileSize / 2, height: 4 * tileSize, color: darkColorMap["blue"], direction: "up" },
    { x: 15 * tileSize + tileSize / 4, y: 1.5 * tileSize, width: tileSize / 2, height: 3 * tileSize, color: darkColorMap["blue"], direction: "up" },
    { x: 9.5 * tileSize, y: tileSize / 4, width: tileSize / 2, height: 4 * tileSize, color: darkColorMap["red"], direction: "right" },
    { x: 1.5 * tileSize, y: tileSize / 4, width: tileSize / 2, height: 3 * tileSize, color: darkColorMap["red"], direction: "right" },
    { x: 11.5 * tileSize, y: 15 * tileSize + tileSize / 4, width: tileSize / 2, height: 3 * tileSize, color: darkColorMap["yellow"], direction: "left" },
    { x: 2.5 * tileSize, y: 15 * tileSize + tileSize / 4, width: tileSize / 2, height: 4 * tileSize, color: darkColorMap["yellow"], direction: "left" },
  ];

  stripConfigs.forEach((cfg) =>
    drawStripWithTriangleAndCircle(ctx, cfg.x, cfg.y, cfg.width, cfg.height, cfg.color, cfg.direction)
  );

  const safetyConfigs = [
    { zone: redSafetyZone, angle: 90, offsetX: 2 * tileSize, offsetY: tileSize / 2 },
    { zone: blueSafetyZone, angle: 360, offsetX: 1.5 * tileSize, offsetY: 0 },
    { zone: greenSafetyZone, angle: 180, offsetX: 0.5 * tileSize, offsetY: -2 * tileSize },
    { zone: yellowSafetyZone, angle: 270, offsetX: 0, offsetY: 1.5 * tileSize },
  ];

  safetyConfigs.forEach(({ zone, angle, offsetX, offsetY }) => {
    drawSafetyWord(ctx, zone, angle, offsetX, offsetY);
  });
}


export function drawWithRotation(
  canvas: HTMLCanvasElement,
  color: string,
  playerColorRef: string
) {
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  const angle = getRotationAngleForColor(color);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(angle);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  drawBoard(ctx, playerColorRef);
  ctx.restore();
}