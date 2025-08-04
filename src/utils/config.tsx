export const API_STRING = "http://localhost:5000"

export const CREATE_GAME = "/api/room/create"
export const START_GAME = "/startGame"

export const GET_LOBBY = (gameType: string, lobbyId: string) => {
    return `http://localhost:3000/joinLobby?game=${gameType}&lobbyId=${lobbyId}`
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