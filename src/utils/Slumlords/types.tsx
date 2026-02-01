export type PlayerData = {
  id: string;            // unique identifier
  name: string;          // player name
  color: string;         // color for the circle
  money: number;         // current money
  position: number;      // index on the board
  properties: string[];  // owned properties
};
