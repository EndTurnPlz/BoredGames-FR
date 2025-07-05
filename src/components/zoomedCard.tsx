import React from "react";

type ZoomedCardProps = {
  imageSrc: string;
  onClose: () => void;
};

export default function ZoomedCard({ imageSrc, onClose }: ZoomedCardProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        cursor: "pointer",
      }}
    >
      <img
        src={imageSrc}
        alt="Zoomed Card"
        style={{
          maxWidth: "90%",
          maxHeight: "90%",
          borderRadius: "8px",
          boxShadow: "0 0 20px rgba(0,0,0,0.3)",
          pointerEvents: "none", // so clicks go to overlay div
        }}
      />
    </div>
  );
}
