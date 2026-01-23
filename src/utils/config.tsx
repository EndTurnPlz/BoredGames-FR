let API_STRING = "";
let PRODUCTION_URL = "https://boredgames.endturnplz.win"
let DEV_URL = "http://localhost:5000"

if (typeof window !== "undefined") {
  const hostname = window.location.hostname;

  if (hostname === "localhost") {
    API_STRING = DEV_URL;
  } else if (hostname === "endturnplz.github.io") {
    API_STRING = PRODUCTION_URL;
  } else {
    API_STRING = "https://your-staging-api.com";
  }
}

export { API_STRING };

export const CREATE_GAME = "/api/room/create"
export const START_GAME = "/startGame"

export const GET_LOBBY = (gameType: string, lobbyId: string) => {
    return `http://localhost:3000/BoredGames-FR/joinLobby?game=${gameType}&lobbyId=${lobbyId}`
}

export const GET_GAMESTREAM = (lobbyId: string, playerId: string)  => {
  return `${API_STRING}/api/room/${lobbyId}/stream?playerId=${playerId}`
}

export const GET_JOIN = (roomId: string)  => {
  return `${API_STRING}/api/room/${roomId}/join`
}

export const GET_CREATE = (gameType: string) => {
  return `${API_STRING}${CREATE_GAME}?gameType=${gameType}`
}

export const indexToColor: Record<number, string> = {
  0: "blue",
  1: "yellow",
  2: "green",
  3: "red",
  4: "purple",     
  5: "orange",    
  6: "teal",     
  7: "magenta",  
};

export const maxPlayers: Record<string, number> = {
  "Apologies": 4,
  "UpsAndDowns": 8,
  "Warlocks": 6
}

export const GameInProgress: string = "GameInProgress"
export const GameEnd: string = "GameEnded"
export const WaitingForPlayers: string = "WaitingForPlayers"

export const APOLOGIES: string = "Apologies"
export const UPSANDDOWNS: string = "UpsAndDowns"
export const WARLOCKS: string = "Warlocks"