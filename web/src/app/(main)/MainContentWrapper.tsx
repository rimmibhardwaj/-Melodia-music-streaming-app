"use client";

import { usePlayer } from "@/context/PlayerContext";
import { ReactNode } from "react";

export function MainContentWrapper({ children }: { children: ReactNode }) {
  const { showLyrics } = usePlayer();

  return (
    <div className="flex flex-1 overflow-hidden h-[calc(100vh-90px)]">
      {children}
      <div
        id="lyrics-sidebar-root"
        className={`flex-shrink-0 transition-all duration-300 ease-in-out my-2 overflow-hidden ${
          showLyrics ? "w-[320px] lg:w-[380px] mr-2 opacity-100" : "w-0 opacity-0"
        }`}
      />
    </div>
  );
}
