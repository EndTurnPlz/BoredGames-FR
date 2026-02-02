import { PlayerData } from "./types"; // or wherever you defined it

// tempProperties.ts
export const tempYourProperties = [
  { name: "Boardwalk", price: 400, rent: 50, color: "#1e40af" },
  { name: "Park Place", price: 350, rent: 35, color: "#1e3a8a" },
  { name: "Baltic Avenue", price: 60, rent: 4, color: "#9333ea" },
  { name: "Marvin Gardens", price: 280, rent: 24, color: "#f59e0b" },
  { name: "Ventnor Avenue", price: 260, rent: 22, color: "#f97316" },
  { name: "Mediterranean Avenue", price: 60, rent: 2, color: "#ef4444" },
  { name: "Marvin Gardens", price: 280, rent: 24, color: "#f59e0b" },
  { name: "Ventnor Avenue", price: 260, rent: 22, color: "#f97316" },
  { name: "Mediterranean Avenue", price: 60, rent: 2, color: "#ef4444" },
];

export const tempOtherProperties = [
  { name: "Marvin Gardens", price: 280, rent: 24, color: "#f59e0b" },
  { name: "Ventnor Avenue", price: 260, rent: 22, color: "#f97316" },
  { name: "Mediterranean Avenue", price: 60, rent: 2, color: "#ef4444" },
];

export const tempPlayers: PlayerData[] = [
  {
    id: "p1",
    name: "Alice",
    color: "#e63946", // red
    money: 1500,
    position: 0,
    properties: tempOtherProperties
  },
  {
    id: "p2",
    name: "Bob",
    color: "#457b9d", // blue
    money: 1500,
    position: 0,
    properties: tempYourProperties
  },
  {
    id: "p3",
    name: "Charlie",
    color: "#2a9d8f", // teal
    money: 1500,
    position: 0,
    properties: []
  },
  {
    id: "p4",
    name: "Diana",
    color: "#f4a261", // orange
    money: 1500,
    position: 0,
    properties: []
  },
];