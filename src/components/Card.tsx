import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cardW, cardH } from "@/utils/config";

type CardButtonProps = {
  onClick: () => void;
  x: number;
  y: number;
  src: string;
  label: string;
  animate?: boolean; // default = true
};

const CardButton = ({
  onClick,
  x,
  y,
  src,
  label,
  animate = true,
}: CardButtonProps) => {
  const hasMounted = useRef(false);
  const [prevSrc, setPrevSrc] = useState<string | null>(null);
  const [displaySrc, setDisplaySrc] = useState(src);

  useEffect(() => {
  if (!animate) {
    setDisplaySrc(src);
    setPrevSrc(null);
    return;
  }

  // Always animate, even if src is the same
  setPrevSrc(displaySrc);
  setDisplaySrc("/Cards/deck.png"); // Clear image to force re-mount

  const resetTimeout = setTimeout(() => {
    setDisplaySrc(src);
  }, 50); // small delay to allow unmount/remount

  const clearPrevTimeout = setTimeout(() => {
    setPrevSrc(null);
  }, 2050); // slightly longer than animation duration (2s)

  return () => {
    clearTimeout(resetTimeout);
    clearTimeout(clearPrevTimeout);
  };
}, [src, animate]);


  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        position: "absolute",
        top: y,
        left: x,
        width: cardW,
        height: cardH,
        border: "none",
        padding: 0,
        cursor: "pointer",
        overflow: "hidden",
        zIndex: 30,
        background: "none",
      }}
      className="relative group hover:ring-2 hover:ring-yellow-400 hover:ring-offset-2"
    >
      <div className="w-full h-full relative">
        {animate && prevSrc && (
          <motion.img
            key={"prev"}
            src={prevSrc}
            alt="Previous card"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        )}

        {animate ? (
          <motion.img
            key={"current" + src}
            src={displaySrc}
            alt="Current card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        ) : (
          <img
            src={src}
            alt="Card"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        )}
      </div>
    </button>
  );
};

export default CardButton;
