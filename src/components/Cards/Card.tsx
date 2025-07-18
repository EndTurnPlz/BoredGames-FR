import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cardW, cardH } from "@/utils/config";
import Image from "next/image";
import CardBack from "./CardBack";

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
  const [impactEffect, setImpactEffect] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (!animate) {
      setDisplaySrc(src);
      setPrevSrc(null);
      return;
    }

    if (src !== displaySrc) {
      setPrevSrc(displaySrc);
      setDisplaySrc(src);
      setIsFlipping(true);

      // Trigger impact effect after card appears
      setTimeout(() => setImpactEffect(true), 800);

      // Reset impact effect and remove prev card
      const timeout = setTimeout(() => {
        setPrevSrc(null);
        setImpactEffect(false);
        setIsFlipping(false);
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
        backgroundImage: "none",
        perspective: "1200px",
      }}
      className="relative group hover:ring-2 hover:ring-yellow-400 hover:ring-offset-2"
    >
      <div className="w-full h-full relative bg-transparent">
        {/* Previous card fading out */}
        {animate && prevSrc && (
          <motion.div
            key={"prev-" + prevSrc}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              background: "transparent",
            }}
          >
            <div className="relative w-full h-full bg-transparent">
              <Image
                src={prevSrc}
                alt="Previous card"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: "contain" }}
              />
            </div>
          </motion.div>
        )}

        {/* Animate Card Flip - this is the main flipping card */}
        {animate && isFlipping ? (
          <motion.div
            key={"flip-card-" + displaySrc}
            initial={{ x: -cardW / 2, rotateY: 0 }}
            animate={{ x: 0, rotateY: 180 }}
            transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              transformStyle: "preserve-3d",
              background: "transparent",
            }}
          >
            {/* Card Back (initially visible) */}
            <motion.div
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                backfaceVisibility: "hidden",
                transformStyle: "preserve-3d",
                background: "transparent",
              }}
            >
              <CardBack />
            </motion.div>

            {/* Card Front (initially hidden, becomes visible during flip) */}
            <motion.div
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                transformStyle: "preserve-3d",
                background: "transparent",
              }}
            >
              {/* Glow effect as a separate element */}
              {impactEffect && (
                <motion.div
                  className="absolute inset-0 bg-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.6, times: [0, 0.3, 1] }}
                  style={{
                    boxShadow: "0 0 20px 10px rgba(255, 215, 0, 0.7)",
                    borderRadius: "5px",
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* Card content */}
              <motion.div
                className="relative w-full h-full bg-transparent"
                animate={impactEffect ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.3, delay: 0.8, ease: "easeOut" }}
              >
                <Image
                  src={displaySrc}
                  alt="Card front"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "contain" }}
                  className="bg-transparent"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        ) : animate ? (
          // Show current card when not in flipping state
          <motion.div
            key={"current-" + displaySrc}
            initial={{ opacity: isFlipping ? 0 : 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              background: "transparent",
            }}
          >
            <div className="relative w-full h-full bg-transparent">
              <Image
                src={displaySrc}
                alt="Current card"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: "contain" }}
              />
            </div>
          </motion.div>
        ) : (
          // Static card for non-animated state
          <div className="relative w-full h-full bg-transparent">
            {src === "/Cards/deck.png" ? (
              <CardBack />
            ) : (
              <Image
                src={src}
                alt="Card"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: "contain" }}
              />
            )}
          </div>
        )}
      </div>
    </button>
  );
};

export default CardButton;
