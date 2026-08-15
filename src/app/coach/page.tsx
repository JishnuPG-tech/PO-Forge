"use client";

import React from "react";
import { GlobalShell } from "@/components/shell/GlobalShell";
import { CoachChatView } from "@/components/coach/CoachChatView";

export default function CoachPage() {
  return (
    <GlobalShell>
      <CoachChatView />
    </GlobalShell>
  );
}
