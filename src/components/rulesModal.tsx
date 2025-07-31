"use client";
import { HiArrowRight, HiArrowLeft, HiOutlineBookOpen } from "react-icons/hi";
import ApologiesRulesModal from "./Apologies/ApologiesRulesModal";
import UpsAndDownsRulesModal from "./UpsAndDowns/UpsAndDownsRulesModal";

export default function RulesModal({
  showRules,
  showCards,
  setShowRules,
  setShowCards,
  gameType
}: {
  showRules: boolean;
  showCards: boolean;
  setShowRules: (v: boolean) => void;
  setShowCards: (v: boolean) => void;
  gameType: string;
}) {

  return (
    <>
      {gameType === "Apologies" && (
        <ApologiesRulesModal
          showRules={showRules}
          showCards={showCards}
          setShowRules={setShowRules}
          setShowCards={setShowCards}
        />
      )}
      {gameType === "UpsAndDowns" && (
        <UpsAndDownsRulesModal
          showRules={showRules}
          showCards={showCards}
          setShowRules={setShowRules}
        />
      )}
    </>
  );
}
