// utils/drawUtils.ts
import { coordStringToPixel } from "./outerPath";
import { tileSize, font_px, darkColorMap } from "./config";
import { Piece } from "@/app/gameBoards/sorryBoard";
import { DrawnPiece } from "@/app/gameBoards/sorryBoard";

function colorDistance(current: string, target: string): number {
  const colorOrder = [
    darkColorMap["blue"],
    darkColorMap["yellow"],
    darkColorMap["green"],
    darkColorMap["red"],
  ];
  const currentIndex = colorOrder.indexOf(current);
  const targetIndex = colorOrder.indexOf(target);

  if (currentIndex === -1 || targetIndex === -1) {
    throw new Error("Invalid color input");
  }

  return (targetIndex - currentIndex + colorOrder.length) % colorOrder.length;
}

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  tileX: number,
  tileY: number,
  radius: number,
  color: string,
  tileSize: number,
  text: string,
  angleDegrees: number,
  playerColor: string
) => {
  const centerX = tileX * tileSize;
  const centerY = tileY * tileSize;

  // Create a gradient for a more modern look
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius
  );

  // Determine if this is a home or start circle
  const isHome = text.toLowerCase() === "home";

  // Parse color and adjust for gradient
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  // Create slightly different shades for gradient
  const lighterColor = `rgba(${Math.min(r + 30, 255)}, ${Math.min(
    g + 30,
    255
  )}, ${Math.min(b + 30, 255)}, 1)`;
  const darkerColor = `rgba(${Math.max(r - 30, 0)}, ${Math.max(
    g - 30,
    0
  )}, ${Math.max(b - 30, 0)}, 1)`;

  // Set up gradient
  gradient.addColorStop(0, lighterColor);
  gradient.addColorStop(1, darkerColor);

  // Draw main circle with gradient
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Enhanced glow effect for home circles
  if (isHome) {
    ctx.shadowColor = lighterColor;
    ctx.shadowBlur = 15;
  } else {
    // Subtle glow for start circles
    ctx.shadowColor = lighterColor;
    ctx.shadowBlur = 10;
  }

  // Create a nicer border with inner shadow effect
  const borderColor = isHome
    ? "rgba(255, 255, 255, 0.8)"
    : "rgba(255, 255, 255, 0.7)";
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = isHome ? 3 : 2.5;
  ctx.stroke();

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  // Adjust angle based on color
  angleDegrees += colorDistance(darkColorMap[playerColor], color) * 90;
  const angleRadians = (angleDegrees * Math.PI) / 180;

  ctx.save(); // Save current state
  ctx.translate(centerX, centerY); // Move origin to center of text
  ctx.rotate(angleRadians); // Rotate context by angle

  // Enhanced text rendering
  if (isHome) {
    // Create text background/halo for better readability on Home circles
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.65, 0, 2 * Math.PI);
    ctx.fill();

    // Use a bolder, more modern font for HOME
    ctx.fillStyle = "white";
    ctx.font = `bold ${1.6 * font_px}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Add text shadow for depth
    ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Draw text
    ctx.fillText(text, 0, 0);
  } else {
    // Enhanced styling for Start circles, similar to Home circles

    // Create a subtle background/halo for better readability
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.6, 0, 2 * Math.PI);
    ctx.fill();

    // Use a bold, modern font for START, similar to HOME
    ctx.fillStyle = "white";
    ctx.font = `bold ${1.5 * font_px}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Add text shadow for depth, slightly lighter than home
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Draw text
    ctx.fillText(text, 0, 0);
  }

  ctx.restore(); // Restore to previous state
};

export const fillTile = (
  ctx: CanvasRenderingContext2D,
  row: number,
  col: number,
  color: string,
  tileSize: number
) => {
  const x = col * tileSize;
  const y = row * tileSize;

  // Save current drawing state
  ctx.save();

  // Check if this tile is likely part of a safety zone
  const isSafetyZoneTile =
    // Red safety zone
    (row === 2 && col >= 1 && col <= 5) ||
    // Yellow safety zone
    (row === 13 && col >= 10 && col <= 14) ||
    // Blue safety zone
    (col === 2 && row >= 10 && row <= 14) ||
    // Green safety zone
    (col === 13 && row >= 1 && row <= 5);

  if (color === "black") {
    // Enhanced styling for the black squares like in modern digital board games

    // Main dark navy background - deeper color for more contrast
    ctx.fillStyle = "#0F1029"; // Very dark navy blue
    ctx.fillRect(x, y, tileSize, tileSize);

    // Subtle inner glow effect
    ctx.strokeStyle = "#232848"; // Slightly lighter than the fill for depth
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

    // Add a more pronounced top highlight for 3D effect
    const topGradient = ctx.createLinearGradient(x, y, x, y + tileSize / 3);
    topGradient.addColorStop(0, "rgba(255, 255, 255, 0.15)"); // Brighter highlight
    topGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = topGradient;
    ctx.fillRect(x, y, tileSize, tileSize / 3);

    // Add a very subtle bottom shadow for depth
    const bottomGradient = ctx.createLinearGradient(
      x,
      y + tileSize * 0.7,
      x,
      y + tileSize
    );
    bottomGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    bottomGradient.addColorStop(1, "rgba(0, 0, 0, 0.3)");
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(x, y + tileSize * 0.7, tileSize, tileSize * 0.3);

    // Add a subtle corner highlight for polish
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + tileSize / 10, y);
    ctx.lineTo(x, y + tileSize / 10);
    ctx.closePath();
    ctx.fill();
  } else if (isSafetyZoneTile) {
    // Special treatment for safety zone tiles

    // Create a gradient for the tile
    const gradient = ctx.createRadialGradient(
      x + tileSize / 2,
      y + tileSize / 2,
      tileSize / 6,
      x + tileSize / 2,
      y + tileSize / 2,
      tileSize
    );

    // Parse and get a brighter version of the color
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // Safety zone colors are brighter
    const brighterColor = `rgba(${Math.min(r + 20, 255)}, ${Math.min(
      g + 20,
      255
    )}, ${Math.min(b + 20, 255)}, 1)`;
    const originalColor = color;
    const darkerColor = `rgba(${Math.max(r - 40, 0)}, ${Math.max(
      g - 40,
      0
    )}, ${Math.max(b - 40, 0)}, 1)`;

    gradient.addColorStop(0, brighterColor);
    gradient.addColorStop(0.7, originalColor);
    gradient.addColorStop(1, darkerColor);

    ctx.fillStyle = gradient;

    // Add a subtle glow effect
    ctx.shadowColor = brighterColor;
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw rounded corners for the safety zone tiles
    roundRect(ctx, x + 1, y + 1, tileSize - 2, tileSize - 2, 3, true, false);

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Add a border with inner glow effect
    ctx.strokeStyle = brighterColor;
    ctx.lineWidth = 1.5;
    roundRect(ctx, x + 1, y + 1, tileSize - 2, tileSize - 2, 3, false, true);

    // Add diagonal lines pattern for safety zone tiles
    ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 2);
    ctx.lineTo(x + tileSize - 2, y + tileSize - 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + tileSize - 2, y + 2);
    ctx.lineTo(x + 2, y + tileSize - 2);
    ctx.stroke();
  } else {
    // Handle other colors with enhanced styling
    ctx.fillStyle = color;
    ctx.fillRect(x, y, tileSize, tileSize);

    // Add black outlines to all tiles for better differentiation
    ctx.strokeStyle = "rgba(0, 0, 0, 0.8)"; // Strong black outline
    ctx.lineWidth = 1.5; // Slightly thicker line for visibility
    ctx.strokeRect(x, y, tileSize, tileSize);

    // Add inner border for depth effect
    if (color === "white") {
      // For white tiles, use a light gray inner border
      ctx.strokeStyle = "#CCCCCC";
    } else {
      // For colored tiles, use a darker shade
      ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    }
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

    // Add a subtle highlight to the top of colored tiles too
    if (color !== "white") {
      const gradient = ctx.createLinearGradient(x, y, x, y + tileSize / 5);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.1)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, tileSize, tileSize / 5);
    }
  }

  // Restore drawing state
  ctx.restore();
};

export const drawStripWithTriangleAndCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  direction: string
) => {
  // Save the current context state
  ctx.save();

  // Draw the main strip with enhanced styling
  const rectX = x;
  const rectY = y;
  let rectWidth = width,
    rectHeight = height;

  if (direction === "left" || direction === "right") {
    rectWidth = height;
    rectHeight = width;
  }

  // Create a darker background for the strip
  const stripBgColor = "#0F1029"; // Same dark background as black squares
  ctx.fillStyle = stripBgColor;
  ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

  // Add colored border that matches the player color
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

  // Add a subtle inner glow using the player color
  const alpha = 0.25;
  ctx.fillStyle = color.startsWith("rgba")
    ? color
    : `${color}${alpha.toString(16).padStart(2, "0")}`;
  const padding = 2;
  ctx.fillRect(
    rectX + padding,
    rectY + padding,
    rectWidth - padding * 2,
    rectHeight - padding * 2
  );

  // Add a top highlight for 3D effect
  const gradient = ctx.createLinearGradient(
    rectX,
    rectY,
    rectX,
    rectY + rectHeight * 0.3
  );
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.15)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(rectX, rectY, rectWidth, rectHeight * 0.3);

  // Calculate triangle dimensions for a more modern look
  const triangleWidth = width * 1.4; // Slightly smaller than original
  const triangleHeight = height * 0.18; // Slightly taller

  // Coordinates for triangle
  let tipX = x + width / 2;
  let tipY = 0;
  let baseLeftX = 0;
  let baseLeftY = 0;
  let baseRightX = 0;
  let baseRightY = 0;

  if (direction === "up") {
    // Triangle BELOW the strip (tip pointing up)
    tipY = y + triangleHeight;
    baseLeftX = x - (triangleWidth - width) / 2;
    baseLeftY = y;
    baseRightX = x + width + (triangleWidth - width) / 2;
    baseRightY = y;
  } else if (direction == "down") {
    // Triangle ABOVE the strip (tip pointing down)
    tipY = y - triangleHeight + height;
    baseLeftX = x - (triangleWidth - width) / 2;
    baseLeftY = y + height;
    baseRightX = x + width + (triangleWidth - width) / 2;
    baseRightY = y + height;
  } else if (direction === "left") {
    // Triangle to the RIGHT of the strip (tip pointing left)
    tipX = x + height - triangleHeight;
    tipY = y + width / 2;
    baseLeftX = x + height;
    baseLeftY = y - (triangleWidth - width) / 2;
    baseRightX = x + height;
    baseRightY = y + width + (triangleWidth - width) / 2;
  } else if (direction === "right") {
    // Triangle to the LEFT of the strip (tip pointing right)
    tipX = x + triangleHeight;
    tipY = y + width / 2;
    baseLeftX = x;
    baseLeftY = y - (triangleWidth - width) / 2;
    baseRightX = x;
    baseRightY = y + width + (triangleWidth - width) / 2;
  }

  // Draw modern triangle with the dark background and colored border
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(baseLeftX, baseLeftY);
  ctx.lineTo(baseRightX, baseRightY);
  ctx.closePath();

  // Fill with dark background
  ctx.fillStyle = stripBgColor;
  ctx.fill();

  // Add colored border
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Add subtle inner glow to triangle
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // Calculate circle dimensions for a more modern look
  const circleRadius = width * 0.7; // Slightly smaller for modern look
  let circleX = 0,
    circleY = 0;

  if (direction === "up") {
    circleX = x + width / 2;
    circleY = y + height;
  } else if (direction === "down") {
    circleX = x + width / 2;
    circleY = y;
  } else if (direction === "left") {
    circleX = x;
    circleY = y + width / 2;
  } else if (direction === "right") {
    circleX = x + height;
    circleY = y + width / 2;
  }

  // Draw modern circle with dark background and colored border
  ctx.beginPath();
  ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
  ctx.fillStyle = stripBgColor;
  ctx.fill();

  // Add colored border
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Add subtle inner glow to circle
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(circleX, circleY, circleRadius - 2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // Modern text styling
  ctx.fillStyle = "white"; // White text for better contrast
  ctx.font = `bold ${font_px}px sans-serif`; // Bold font for emphasis

  const text = "Slide!";
  const textWidth = ctx.measureText(text).width;

  const textX = -textWidth;

  // Draw text with different positioning based on direction
  if (direction === "right") {
    ctx.fillText(text, rectX + rectWidth / 2, rectY + (3 * rectHeight) / 4);
  } else if (direction === "left") {
    ctx.save();
    // Move origin to right edge of the rect before flipping
    const textX = rectX + rectWidth / 4;
    const textY = rectY + rectHeight / 2;
    // Move origin to the center of text
    ctx.translate(textX, textY);
    // Rotate 180 degrees (PI radians)
    ctx.rotate(Math.PI);

    // Draw the text at 0,0 because we're already translated
    ctx.fillText(text, -rectWidth / 4, rectHeight / 4);

    ctx.restore();
  } else if (direction === "down") {
    const centerX = y + width / 2 + 7;
    ctx.save();
    ctx.translate(circleX, centerX);
    ctx.rotate(-Math.PI / 2); // rotate text for vertical strip
    ctx.fillText(text, textX - rectHeight / 4, rectWidth / 4);
    ctx.restore();
  } else {
    const centerX = y + width / 2 + 7;
    ctx.save();
    ctx.translate(circleX, centerX);
    ctx.rotate((-3 * Math.PI) / 2); // rotate text for vertical strip
    ctx.fillText(text, textX + height / 2, rectWidth / 4);
    ctx.restore();
  }

  // Add a subtle glow effect around the text
  ctx.shadowColor = color;
  ctx.shadowBlur = 5;

  // Restore the context state
  ctx.restore();
};

// Store last known button bounds to detect clicks

const drawHighlightedCircles = (
  ctx: CanvasRenderingContext2D,
  coord: string,
  tileSize: number,
  color: string
) => {
  const { x, y } = coordStringToPixel(coord, tileSize);
  ctx.beginPath();
  ctx.arc(x, y, tileSize * 0.4, 0, 2 * Math.PI);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();
};

export const drawAllCircles = (
  ctx: CanvasRenderingContext2D,
  tileSize: number,
  highlights: { coord: string; color: string }[]
) => {
  highlights.forEach(({ coord, color }) => {
    drawHighlightedCircles(ctx, coord, tileSize, color);
  });
};

export const drawSafetyWord = (
  ctx: CanvasRenderingContext2D,
  safetyZone: number[][],
  rotationDeg: number = 90,
  offsetX: number,
  offsetY: number
) => {
  const word = "SAFETY ZONE";

  const startX = safetyZone[0][0] * tileSize;
  const endX = safetyZone[safetyZone.length - 1][0] * tileSize;
  const centerX = (startX + endX) / 2;
  const centerY = safetyZone[0][1] * tileSize - tileSize / 2; // above the zone

  // Convert degrees to radians
  const rotationRad = (rotationDeg * Math.PI) / 180;

  ctx.save();

  // Determine which color based on the coordinates - this is a simple way to identify which safety zone
  let zoneColor;
  if (safetyZone[0][1] === 2) {
    zoneColor = "#D70000"; // red
  } else if (safetyZone[0][1] === 13) {
    zoneColor = "#FFCC00"; // yellow
  } else if (safetyZone[0][0] === 2) {
    zoneColor = "#0066FF"; // blue
  } else {
    zoneColor = "#00AA00"; // green
  }

  // Move origin to center of text
  ctx.translate(centerX, centerY);
  // Rotate the canvas
  ctx.rotate(rotationRad);

  // Create a semi-transparent background for better visibility
  const textWidth = tileSize * 5; // Approximate width based on text length
  const textHeight = tileSize * 0.7;
  const backgroundPadding = 8;

  // Draw a rounded rectangle background
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  roundRect(
    ctx,
    offsetX - textWidth / 2 - backgroundPadding,
    offsetY - textHeight / 2 - backgroundPadding / 2,
    textWidth + backgroundPadding * 2,
    textHeight + backgroundPadding,
    6, // corner radius
    true, // filled
    false // no stroke
  );

  // Add a subtle glow effect
  ctx.shadowColor = zoneColor;
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Use a bolder, more modern font
  ctx.font = `bold ${font_px * 1.6}px Arial, sans-serif`;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Draw text at origin (0,0) because we've translated to center
  ctx.fillText(word, offsetX, offsetY);

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  ctx.restore();
};

export const drawPiecesWithOffset = (allPieces: Piece[]): DrawnPiece[] => {
  const indexedPieces = allPieces.map((piece, index) => ({
    ...piece,
    originalIndex: index,
  }));

  // Step 2: Group by tile
  const tileGroups: Record<string, (Piece & { originalIndex: number })[]> = {};

  for (const piece of indexedPieces) {
    const key = `${Math.round(piece.x)}_${Math.round(piece.y)}`;
    if (!tileGroups[key]) tileGroups[key] = [];
    tileGroups[key].push(piece);
  }

  // Step 3: Spread out and collect
  const offsetDistance = tileSize * 0.5;
  const drawnPieces: (DrawnPiece & { originalIndex: number })[] = [];

  for (const group of Object.values(tileGroups)) {
    const centerX = group[0].x;
    const centerY = group[0].y;

    group.forEach((piece, i) => {
      let offsetX = 0;
      let offsetY = 0;

      if (group.length > 1) {
        const angle = (2 * Math.PI * i) / group.length;
        offsetX = Math.cos(angle) * offsetDistance;
        offsetY = Math.sin(angle) * offsetDistance;
      }

      const drawX = centerX + offsetX;
      const drawY = centerY + offsetY;

      drawnPieces.push({ ...piece, drawX, drawY });
    });
  }

  // Step 4: Sort drawnPieces by original index
  drawnPieces.sort((a, b) => a.originalIndex - b.originalIndex);

  return drawnPieces;
};

// Helper function to draw rounded rectangles
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: boolean,
  stroke: boolean
) {
  // Use a single radius value for all corners
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}
