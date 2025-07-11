"use client";

type SubmitMoveButtonProps = {
  onClick: () => void;
  top: number;
  left: number;
  width: number;
  height: number;
  fontSize: number;
  borderRadius: number;
  selected: boolean;
};

export default function SubmitMoveButton({
  onClick,
  top,
  left,
  width,
  height,
  fontSize,
  borderRadius,
  selected
}: SubmitMoveButtonProps) {
  // Assume `isDisabled` is a boolean you compute elsewhere
return (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    disabled={selected}
    className={`
      absolute z-20 font-bold shadow-md transition-colors duration-200
      ${selected
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-white text-black hover:bg-yellow-300'}
    `}
    style={{
      top,
      left,
      width,
      height,
      fontSize,
      borderRadius,
    }}
  >
    Submit Move
  </button>
  );
}