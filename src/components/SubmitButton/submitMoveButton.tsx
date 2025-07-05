"use client";

type SubmitMoveButtonProps = {
  onClick: () => void;
  top: number;
  left: number;
  width: number;
  height: number;
  fontSize: number;
  borderRadius: number;
};

export default function SubmitMoveButton({
  onClick,
  top,
  left,
  width,
  height,
  fontSize,
  borderRadius,
}: SubmitMoveButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute font-bold z-20 shadow-md transition-colors duration-200 
        bg-white text-black hover:bg-yellow-300"
      style={{
        top,
        left,
        width,
        height,
        fontSize,
        borderRadius,
        pointerEvents: "auto",
      }}
    >
      Submit Move
    </button>
  );
}