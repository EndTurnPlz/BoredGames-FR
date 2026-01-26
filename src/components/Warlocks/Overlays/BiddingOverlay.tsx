"use client";

import { motion, AnimatePresence } from "framer-motion";

type BiddingOverlayProps = {
  round: number;
  show: boolean;
};

export default function BiddingOverlay({ round, show }: BiddingOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex justify-center items-center bg-black/80 text-white text-4xl font-bold z-50 pointer-events-auto"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-center"
          >
            Round {round} — Bidding
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
