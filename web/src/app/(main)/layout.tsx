import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { PlayerBar } from "@/components/PlayerBar";
import { PlayerProvider } from "@/context/PlayerContext";
import { MainContentWrapper } from "./MainContentWrapper";
import { BottomTabBar } from "@/components/BottomTabBar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PlayerProvider>
      <MainContentWrapper>
        <Sidebar />
        {/* Outer shell: flex-col so BottomTabBar sits below scrollable content, outside overflow-hidden */}
        <div className="flex-1 flex flex-col overflow-hidden rounded-lg my-2 mr-2 relative">
          {/* Top bar + scrollable page content */}
          <div className="flex-1 bg-[#121212] overflow-hidden relative flex flex-col">
            <TopBar />
            {/* pb-16 on mobile reserves space equal to BottomTabBar height so last content isn't hidden under it */}
            <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
              {children}
            </div>
          </div>
          {/* BottomTabBar lives outside overflow-hidden — always fully visible, never clipped */}
          <BottomTabBar />
        </div>
      </MainContentWrapper>
      <PlayerBar />
    </PlayerProvider>
  );
}

