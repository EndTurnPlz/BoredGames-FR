import { API_STRING } from "../config"

export const width = 800
const prefix = "/api/game/"

export const SUBMIT_BET = (roomId: string)  => {
  return `${API_STRING}${prefix}${roomId}/action/bid`
}