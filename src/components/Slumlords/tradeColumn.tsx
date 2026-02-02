import { Property } from "./buyOverlay";

type TradeColumnProps = {
  title: string;
  properties: Property[];
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  cash: number;
  setCash: React.Dispatch<React.SetStateAction<number>>;
  maxCash: number;
};

export function TradeColumn({
  title,
  properties,
  selected,
  setSelected,
  cash,
  setCash,
  maxCash,
}: TradeColumnProps) {
  // Compute available properties
  const available = properties.filter((p) => !selected.includes(p.name));

  const addProperty = (id: string) => setSelected([...selected, id]);
  const removeProperty = (id: string) =>
    setSelected(selected.filter((s) => s !== id));

  return (
    <div className="trade-column">
      <h3>{title}</h3>

      {/* Top-level selected bar */}
      <div className="selected-bar">
        {selected.map((id) => {
          const prop = properties.find((p) => p.name === id);
          if (!prop) return null;
          return (
            <div
              key={id}
              className="selected-property"
              style={{ borderLeft: `4px solid ${prop.color}` }}
              onClick={() => removeProperty(id)}
            >
              {prop.name} (${prop.price}) ✕
            </div>
          );
        })}
      </div>

      {/* Dropdown / available list */}
      <div className="available-list">
        {available.map((p) => (
          <div
            key={p.name}
            className="available-property"
            style={{ borderLeft: `4px solid ${p.color}` }}
            onClick={() => addProperty(p.name)}
          >
            {p.name} (${p.price})
          </div>
        ))}
      </div>

      {/* Cash input */}
      <div className="cash-input">
        <label>💰 Cash Offered</label>
        <input
            type="number"
            min={0}
            max={maxCash}
            value={cash === 0 ? "" : cash} // show empty if 0
            onChange={(e) => {
                const val = e.target.value;
                // empty string -> 0
                if (val === "") {
                setCash(0);
                return;
                }
                const num = Math.min(maxCash, +val);
                setCash(num);
            }}
            placeholder="0"
        />
        <span className="max">Max: ${maxCash}</span>
      </div>
    </div>
  );
}
