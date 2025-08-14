import { API_STRING } from "../config"

export const width = 800
const prefix = "/api/game/"

export const SUBMIT_BET = (roomId: string)  => {
  return `${API_STRING}${prefix}${roomId}/action/bid`
}

export const CHOOSE_CARD = (roomId: string)  => {
  return `${API_STRING}${prefix}${roomId}/action/card`
}

export function formatCard(rank: string, suit: string) {
  const rankMap: Record<string, string> = {
    Ace: "ace",
    Two: "2",
    Three: "3",
    Four: "4",
    Five: "5",
    Six: "6",
    Seven: "7",
    Eight: "8",
    Nine: "9",
    Ten: "10",
    Jack: "jack",
    Queen: "queen",
    King: "king"
  };

  const rankStr = rankMap[rank] ?? rank.toLowerCase();
  return `${rankStr}_of_${suit.toLowerCase()}`;
}

export const suitEmojis: Record<string, string> = {
  None: "None",
  Spades: "♠️",
  Hearts: "♥️",
  Diamonds: "♦️",
  Clubs: "♣️"
};