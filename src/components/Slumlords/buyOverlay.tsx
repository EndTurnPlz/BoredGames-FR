
import { useState } from "react";

export type Property = {
    name: string;
    price: number;
    rent: number;
    color: string;
};
type Props = {
  property: Property
  canBuy: boolean;
  canSell: boolean;
  onBuy: () => void;
  onSell: () => void;
  onClose: () => void;
};

export default function PropertyDecisionOverlay({
  property,
  canBuy,
  canSell,
  onBuy,
  onSell,
  onClose,
}: Props) {
  const [isClosing, setIsClosing] = useState(false);

  const closeWithAnimation = () => {
    setIsClosing(true);
    setTimeout(onClose, 200); // must match animation duration
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/70 ${
        isClosing ? "animate-fade-out" : "animate-fade-in"
      }`}
    >
      <div
        className={`decision-card text-white ${
          isClosing ? "animate-pop-out" : "animate-pop-in"
        }`}
      >
        <h2 className="text-3xl font-bold mb-4">{property.name}</h2>

        <div
          className="h-4 w-full rounded mb-6"
          style={{ backgroundColor: property.color }}
        />

        <p className="text-lg mb-2">💰 Price: ${property.price}</p>
        <p className="text-lg mb-6">🏠 Rent: ${property.rent}</p>

        <div className="flex gap-4">
          {canBuy && (
            <button className="buy" onClick={onBuy}>
              Buy
            </button>
          )}

          {canSell && (
            <button className="sell" onClick={onSell}>
              Sell
            </button>
          )}

          <button className="skip" onClick={closeWithAnimation}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
