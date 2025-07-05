import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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
  const [prevSrc, setPrevSrc] = useState<string | null>(null);
  const [displaySrc, setDisplaySrc] = useState(src);

  useEffect(() => {
    if (!animate) {
      setDisplaySrc(src);
      setPrevSrc(null);
      return;
    }

    if (src !== displaySrc) {
      setPrevSrc(displaySrc);
      setDisplaySrc(src);

      const timeout = setTimeout(() => {
        setPrevSrc(null);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [src, animate, displaySrc]);

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
        {/* Animate Previous Card Fade Out */}
        {animate && prevSrc && (
          <motion.img
            key={"prev-" + prevSrc}
            src={prevSrc}
            alt="Previous card"
            initial={{ opacity: 1, scale: 1, rotate: 0 }}
            animate={{ opacity: 0, scale: 0.9, rotate: -10 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
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

        {/* Animate New Card Draw In */}
        {animate ? (
          <motion.img
            key={"current-" + displaySrc}
            src={displaySrc}
            alt="Current card"
            initial={{ opacity: 0, y: 40, scale: 0.8, rotate: -15 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
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
