import Dice3D from "@/utils/UpAndDown/DiceRoller"; // Import from wherever you put Dice3D

export default function RollOverlay({
  isMyTurn,
  onRoll,
  currentPlayerName,
  rolling,
  result
}: {
  isMyTurn: boolean,
  onRoll: () => void,
  rolling: boolean,
  currentPlayerName: string,
  result: number
}) {
  const handleRoll = () => {
    onRoll(); // trigger rolling logic in parent
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-clear bg-opacity-60 space-y-4">
      {isMyTurn ? (
        <>
          <Dice3D rolling={rolling} result={result} />
          <button
            onClick={handleRoll}
            disabled={rolling}
            className="bg-black p-4 rounded-xl text-white text-2xl font-bold hover:bg-gray-800"
          >
            {rolling ? "Rolling..." : "Roll Dice"}
          </button>
        </>
      ) : (
        <>
          <Dice3D rolling={rolling} result={result} />
          <div className="text-black text-2xl font-semibold">
            {currentPlayerName} is rolling...
          </div>
        </>
      )}
    </div>
  );
}
