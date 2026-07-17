"use client";

import { Home, Search, Compass } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomTabBar() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: Compass, label: "Explore", href: "/explore" },
  ];

  return (
    <div className="md:hidden glass-panel border-t border-white/5 flex items-center justify-around px-4 py-2 sticky bottom-0 z-40 bg-[#121212]/95 backdrop-blur-md">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive ? "text-[#FF3366]" : "text-[#9D84C7] hover:text-white"}`}>
            <Icon size={24} />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
