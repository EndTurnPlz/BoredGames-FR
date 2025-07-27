export const API_STRING = "http://localhost:5000"

export const CREATE_GAME = "/room/create"
export const JOIN_GAME = "/room/join"
export const START_GAME = "/startGame"

export const GET_LOBBY = (gameType: string, lobbyId: string) => {
    return `http://localhost:3000/joinLobby?game=${gameType}&lobbyId=${lobbyId}`
}