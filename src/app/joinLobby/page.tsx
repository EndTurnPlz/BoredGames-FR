"use client";

import { Suspense } from "react";
import JoinLobbyClient from "./joinLobby";

export default function JoinLobby() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinLobbyClient/>
    </Suspense>
  );
}
