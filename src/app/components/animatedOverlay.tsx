import { motion } from "framer-motion";
import { tileSize, colorToAngleDict } from "@/utils/config";
import { coordStringToPixel, getUnrotatedMousePosition } from "@/utils/outerPath";

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
        animatePulse && !selected
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
