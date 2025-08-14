"use client";

import { motion, AnimatePresence } from "framer-motion";

type TrickWinnerOverlayProps = {
  winner: string;
  show: boolean;
};

export default function TrickWinnerOverlay({ winner, show }: TrickWinnerOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex justify-center items-center bg-black/80 text-white text-4xl font-bold pointer-events-auto z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-center"
          >
            Winner: {winner}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
