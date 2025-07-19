export const canvasWidth = 800;
export const canvasHeight = 800;
export const tileSize = canvasWidth / 16;

export const radius = tileSize / 2 - 3;

export const font_px = canvasWidth / 40;

export const numberDict: { [key: number]: string } = {
  0: "apologies",
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  7: "seven",
  8: "eight",
  10: "ten",
  11: "eleven",
  12: "twelve"
};

export const colorToAngleDict: { [key: string]: number } = {
    "yellow": 0,
    "green": 270,
    "red": 180,
    "blue": 90
} 

export const wordToAngleDict: { [key: string]: number } = {
    "yellow": 0,
    "green": 90,
    "red": 180,
    "blue": 270
} 

export const darkColorMap: Record<string, string> = {
  red: "#8B0000",
  yellow: "#B8860B",
  blue: "#000080",
  green: "#006400",
};

export const lightColorMap: Record<string, string> = {
  red: "#D32F2F",
  yellow: "#FBC02D",
  blue: "#1976D2",
  green: "#006400",
};

export const cardX1 = canvasWidth / 2 - 3 * tileSize;
export const cardX2 = cardX1 + 3.5 * tileSize;
export const cardY = canvasHeight / 2 - 2.5 * tileSize;
export const cardW = 3 * tileSize;
export const cardH = 5 * tileSize;

export const API_STRING = "http://localhost:5000"

export const CREATE_GAME = "/room/create"
export const JOIN_GAME = "/room/join"
export const START_GAME = "/startGame"
export const JOIN_LOBBY = "http://localhost:3000/joinLobby?game=Apologies&lobbyId="

export const GET_JOIN = (roomId: string)  => {
  return `${API_STRING}/room/${roomId}/join`
}

export const GET_START = (roomId: string)  => {
  return `${API_STRING}/game/${roomId}/start`
}

export const GET_GAMESTATS = (roomId: string)  => {
  return `${API_STRING}/game/${roomId}/action?action=Stats`
}

export const GET_ROOMSTATE = (lobbyId: string)  => {
  return `${API_STRING}/room/${lobbyId}/snapshot`
}

export const GET_GAMESTREAM = (lobbyId: string, playerId: string)  => {
  return `${API_STRING}/room/${lobbyId}/stream?playerId=${playerId}`
}

export const DRAW_CARD = (roomId: string)  => {
  return `${API_STRING}/game/${roomId}/action?action=draw`
}

export const MOVE_PAWN = (roomId: string)  => {
  return `${API_STRING}/game/Apologies/${roomId}/action?action=move`
}

export const indexToColor: Record<number, string> = {
  0: "blue",
  1: "yellow",
  2: "green",
  3: "red",
};

export const colorToIndex: Record<string, number> = {
  "blue": 0,
 "yellow": 1,
  "green": 2,
  "red": 3
};

export const deck_card = "/Cards/deck.png"

export const card_path = (id: string) => {
  return `/Cards/FaceCards/${id}.png`
}

export const zoneToColor: Record<string, string> = {
    a: "blue",
    b: "yellow",
    c: "green",
    d: "red",
  };

