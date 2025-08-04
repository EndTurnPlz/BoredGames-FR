"use client";

import { Suspense } from "react";
import BoardGamePageClient from "./boardGame";

export default function JoinLobby() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BoardGamePageClient/>
    </Suspense>
  );
}
