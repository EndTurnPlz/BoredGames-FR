import { motion } from "framer-motion";
import { tileSize, colorToAngleDict } from "@/utils/Apologies/config";
import { coordStringToPixel, getUnrotatedMousePosition } from "@/utils/Apologies/outerPath";

type AnimatedOverlayCircleProps = {
  coord: string; // tile coordinate like "b_4"
  playerColor: string;
  borderColor: string;
  backgroundColor?: string;
  onClick?: () => void;
  zIndex?: number;
  animatePulse?: boolean;
  selected: boolean;
};

export const AnimatedOverlayCircle = ({
  coord,
  playerColor,
  borderColor,
  backgroundColor = "transparent",
  onClick,
  zIndex = 1000,
  animatePulse = false,
  selected
}: AnimatedOverlayCircleProps) => {
  const { x: rawX, y: rawY } = coordStringToPixel(coord, tileSize);
  const { x, y } = getUnrotatedMousePosition(rawX, rawY, colorToAngleDict[playerColor]);
  console.log(rawX, rawY, playerColor)
  return (
    <motion.div
      style={{
        position: "absolute",
        top: y - tileSize / 2,
        left: x - tileSize / 2,
        width: tileSize,
        height: tileSize,
        borderRadius: "50%",
        border: `3px solid ${borderColor}`,
        backgroundColor,
        pointerEvents: "auto",
        zIndex,
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      animate={
        selected
      ? {
          y: -5,
          boxShadow:
            "0 8px 16px rgba(0,0,0,0.4), inset 0 -4px 4px rgba(0,0,0,0.3), inset 0 4px 4px rgba(255,255,255,0.5)",
        }
      : animatePulse
      ? {
          scale: [1, 1.1, 1],
          transition: {
            duration: 1,
            repeat: Infinity,
          },
        }
      : undefined
      }
    />
  );
};
