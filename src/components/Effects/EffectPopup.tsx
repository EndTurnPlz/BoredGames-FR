import React from "react";

interface EffectPopupProps {
  position: { x: number; y: number };
  effects: number[];
  selectedEffect: number | null;
  onSelectEffect: (eff: number) => void;
  onClickEffect: (eff: number) => void;
}

const EffectPopup: React.FC<EffectPopupProps> = ({
  position,
  effects,
  selectedEffect,
  onSelectEffect,
  onClickEffect,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        zIndex: 100,
        backgroundColor: "black",
        border: "1px solid black",
        borderRadius: "8px",
        padding: "0.5rem",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
      }}
    >
      {effects.map((eff) => (
        <div
          key={eff}
          onClick={() => onSelectEffect(eff)}
          style={{
            padding: "0.25rem 0.5rem",
            cursor: "pointer",
            borderBottom: "1px solid #ccc",
            backgroundColor: eff === selectedEffect ? "#444" : "transparent",
            color: eff === selectedEffect ? "white" : "lightgray",
            borderRadius: "4px",
          }}
        >
          <button
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onClickEffect(eff);
            }}
          >
            {eff === 4 ? "Swap" : "Move"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default EffectPopup;
