// utils/drawUtils.ts

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  tileX: number,
  tileY: number,
  radius: number,
  color: string,
  tileSize: number
) => {
  ctx.beginPath();
  ctx.arc(tileX * tileSize, tileY * tileSize, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.stroke();
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
  ctx.fillStyle = color;
  ctx.fillRect(x, y, tileSize, tileSize);
  ctx.strokeStyle = "#000";
  ctx.strokeRect(x, y, tileSize, tileSize);
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
  // Draw the vertical strip
  
   ctx.fillStyle = color;

  let rectX = x, rectY = y;
  let rectWidth = width, rectHeight = height;

  if (direction === "left" || direction === "right") {
    rectWidth = height;
    rectHeight = width;
  }

  // Draw the strip
  ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
  ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

  const triangleWidth = width * 1.6;
  const triangleHeight = height * 0.15;

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
    baseLeftY = y ;
    baseRightX = x + width + (triangleWidth - width) / 2;
    baseRightY = y ;
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
    tipY = y +  width / 2;
    baseLeftX = x;
    baseLeftY = y - (triangleWidth - width) / 2;
    baseRightX = x;
    baseRightY = y + width + (triangleWidth - width) / 2;
  }

  // Draw triangle
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(baseLeftX, baseLeftY);
  ctx.lineTo(baseRightX, baseRightY);
  ctx.closePath();
  ctx.fill();

  const circleRadius = width * 0.8;
  let circleX = 0, circleY = 0;

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
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
}
export const drawCard = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  imgName: string
) => {

  // Draw black background
  ctx.fillStyle = "black";
  ctx.fillRect(x, y, width, height);
  const img = new Image();
  img.src = imgName; // Can be a relative path or full URL

  img.onload = () => {
    ctx.drawImage(img, x, y, width, height);
  };

  img.onerror = () => {
    console.error(`Failed to load image: ${imgName}`);
  };
};


interface ButtonProps {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  isPlayerTurn: boolean;
  opponent: string
}

// Store last known button bounds to detect clicks

export const drawTurnButton = ({
  ctx,
  x,
  y,
  width,
  height,
  isPlayerTurn,
  opponent
}: ButtonProps) => {
  // Draw the button background
  if (isPlayerTurn) {
    ctx.fillStyle =  "#4CAF50"; // Green if it's player's turn
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  }

  // Draw text
  ctx.fillStyle = "black";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    isPlayerTurn ? "Your Turn" : opponent + " is playing...",
    x + width / 2,
    y + height / 2
  );

  // Save button bounds for click detection
  return { x, y, width, height };
};
