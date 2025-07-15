import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cardW, cardH } from "@/utils/config";
import Image from "next/image";

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

  // Card back image - this would be your card back design
  const cardBackImage = "/Cards/deck.png";

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
        perspective: "1200px",
      }}
      className="relative group hover:ring-2 hover:ring-yellow-400 hover:ring-offset-2"
    >
      <div className="w-full h-full relative">
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
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src={prevSrc}
                alt="Previous card"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{
                  objectFit: "contain",
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Animate Card Flip - this is the main flipping card */}
        {animate && isFlipping ? (
          <motion.div
            key={"flip-card-" + displaySrc}
            initial={{
              x: -cardW / 2,
              rotateY: 0,
            }}
            animate={{
              x: 0,
              rotateY: 180,
            }}
            transition={{
              duration: 0.8,
              ease: [0.4, 0.0, 0.2, 1],
            }}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              transformStyle: "preserve-3d",
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
              }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={cardBackImage}
                  alt="Card back"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{
                    objectFit: "contain",
                  }}
                />
              </div>
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
              }}
            >
              <motion.div
                initial={{ filter: "drop-shadow(0 0 0 rgba(255, 215, 0, 0))" }}
                animate={{
                  filter: impactEffect
                    ? "drop-shadow(0 0 15px rgba(255, 215, 0, 0.9))"
                    : "drop-shadow(0 0 5px rgba(255, 215, 0, 0.5))",
                }}
                transition={{ duration: 0.3, delay: impactEffect ? 0.8 : 0.5 }}
                className="relative w-full h-full"
              >
                <motion.div
                  animate={
                    impactEffect
                      ? {
                          scale: [1, 1.08, 1],
                        }
                      : {}
                  }
                  transition={{
                    duration: 0.3,
                    delay: 0.8,
                    ease: "easeOut",
                  }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={displaySrc}
                    alt="Card front"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{
                      objectFit: "contain",
                    }}
                  />
                </motion.div>
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
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src={displaySrc}
                alt="Current card"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{
                  objectFit: "contain",
                }}
              />
            </div>
          </motion.div>
        ) : (
          // Static card for non-animated state
          <div className="relative w-full h-full">
            <Image
              src={src}
              alt="Card"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{
                objectFit: "contain",
              }}
            />
          </div>
        )}
      </div>
    </button>
  );
};

export default CardButton;
