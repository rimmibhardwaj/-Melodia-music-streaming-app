"use client";

import { Search, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Show, UserButton, SignInButton } from "@clerk/nextjs";

export function TopBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [query, router]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 bg-[#121212]/90 backdrop-blur-md">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you want to listen to?" 
          className="bg-[#242424] text-white text-sm rounded-full pl-10 pr-4 py-2.5 w-[160px] sm:w-[350px] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all hover:bg-[#2a2a2a]"
        />
      </div>

      {/* Profile */}
      <div className="flex items-center gap-4">
        <Show when="signed-in">
          <UserButton />
        </Show>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition">
              Log in
            </button>
          </SignInButton>
        </Show>
      </div>
    </div>
  );
}
