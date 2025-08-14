"use client";

import { motion, AnimatePresence } from "framer-motion";

type TrickOverlayProps = {
  round: number;
  trickNumber: number;
  show: boolean;
};

export default function TrickOverlay({ round, trickNumber, show }: TrickOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex flex-col justify-center items-center bg-black/80 text-white text-4xl font-bold pointer-events-auto z-50"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="text-center"
          >
            <div>Round: {round}</div>
            <div>Trick: {trickNumber}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
