import { useState } from "react";
import { Property } from "./buyOverlay";
import { TradeColumn } from "./tradeColumn";

export type PlayerTradeData = {
  id: string;
  name: string;
  cash: number;
  properties: Property[];
};

type Props = {
  you: PlayerTradeData;
  other: PlayerTradeData;
  onConfirm: (trade: {
    youGiveProperties: string[];
    youGiveCash: number;
    youReceiveProperties: string[];
    otherGiveCash: number;
  }) => void;
  onCancel: () => void;
};

export default function TradeOverlay({
  you,
  other,
  onConfirm,
  onCancel,
}: Props) {
  const [youGiveProps, setYouGiveProps] = useState<string[]>([]);
  const [otherGiveProps, setOtherGiveProps] = useState<string[]>([]);
  const [youCash, setYouCash] = useState(0);
  const [otherCash, setOtherCash] = useState(0);
  const [closing, setClosing] = useState(false);

  const close = () => {
    setClosing(true);
    setTimeout(onCancel, 200);
  };

  const toggle = (id: string, list: string[], setList: any) => {
    setList(
      list.includes(id)
        ? list.filter((p) => p !== id)
        : [...list, id]
    );
  };

  return (
    <div className={`trade-overlay ${closing ? "fade-out" : "fade-in"}`}>
      <div className={`trade-card ${closing ? "pop-out" : "pop-in"}`}>
        <h2 className="trade-title">Trade Proposal</h2>

        <div className="trade-columns">
          {/* OTHER PLAYER */}
            <TradeColumn
                title="You"
                properties={you.properties}
                selected={youGiveProps}
                setSelected={setYouGiveProps}
                cash={youCash}
                setCash={setYouCash}
                maxCash={you.cash}
            />


          {/* YOU */}
            <TradeColumn
                title={other.name}
                properties={other.properties}
                selected={otherGiveProps}
                setSelected={setOtherGiveProps}
                cash={otherCash}
                setCash={setOtherCash}
                maxCash={other.cash}
            />
        </div>

        <div className="trade-actions">
          <button className="cancel" onClick={close}>
            Cancel
          </button>
          <button
            className="confirm"
            onClick={() =>
              onConfirm({
                youGiveProperties: youGiveProps,
                youGiveCash: youCash,
                youReceiveProperties: otherGiveProps,
                otherGiveCash: otherCash,
              })
            }
          >
            Propose Trade
          </button>
        </div>
      </div>
    </div>
  );
}
