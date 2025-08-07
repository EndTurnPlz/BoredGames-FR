"use client";

import { Suspense } from "react";
import LobbyPage from "./lobbyScreen";

export default function JoinLobby() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LobbyPage/>
    </Suspense>
  );
}
