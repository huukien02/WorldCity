"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { TileInfoPanel } from "./TileInfoPanel";
import { QuestPanel } from "@/features/quest/components/QuestPanel";
import { Minimap } from "./Minimap";
import { ChatPanel } from "@/features/chat/components/ChatPanel";
import { LeaderboardPanel } from "@/features/leaderboard/components/LeaderboardPanel";
import { MobileSideSheet } from "./MobileSideSheet";
import { CityScoreCard } from "@/features/city/components/CityScoreCard";
import { WeatherIndicator } from "@/features/weather/components/WeatherIndicator";
import { WeatherAutoRotate } from "@/features/weather/components/WeatherAutoRotate";
import { EventPopup } from "@/features/events/components/EventPopup";
import { EventAutoTrigger } from "@/features/events/components/EventAutoTrigger";
import { useCityEvents } from "@/features/events/hooks/useCityEvents";
import { useUserGold } from "@/features/economy/hooks/useUserGold";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { useMapStore } from "../store";

const MapCanvas = dynamic(
  () => import("./MapCanvas").then((m) => ({ default: m.MapCanvas })),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-[#0a0f1a]">
        <div className="text-slate-500 text-sm">Đang tải bản đồ...</div>
      </div>
    ),
  },
);

export function GameScreen() {
  const user = useCurrentUser();
  const [chatOpen, setChatOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const selectedTile = useMapStore((s) => s.selectedTile);
  const activeEvent = useCityEvents(user?.uid);
  const { gold } = useUserGold(user?.uid);

  // Auto-open sheet when a tile is selected on mobile
  function handleTileSelect() {
    setSheetOpen(true);
  }

  return (
    <div className="flex flex-col h-[100dvh]">
      <WeatherAutoRotate />
      <EventAutoTrigger uid={user?.uid} />
      <Header
        onLeaderboardClick={() => setLeaderboardOpen(true)}
        onMenuClick={() => setSheetOpen((v) => !v)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Desktop sidebar ── hidden on mobile, collapsible on desktop */}
        <aside
          className={`${sidebarOpen ? "md:flex" : "md:hidden"} hidden w-64 bg-slate-900 border-r border-slate-800 flex-col overflow-y-auto scrollbar-none shrink-0`}
        >
          <div className="p-3 border-b border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              Thông tin ô đất
            </p>
          </div>
          <TileInfoPanel />
          <QuestPanel />
          <CityScoreCard />
        </aside>

        {/* ── Map canvas ── */}
        <main className="flex-1 relative">
          <MapCanvas
            currentUserId={user?.uid}
            onTileSelect={handleTileSelect}
          />

          {/* Desktop: toggle sidebar — always visible */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="hidden md:flex absolute top-3 left-3 z-10 w-8 h-8 items-center justify-center bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 hover:text-white text-sm transition-colors shadow"
            title={sidebarOpen ? "Ẩn bảng thông tin" : "Hiện bảng thông tin"}
            aria-label={sidebarOpen ? "Ẩn bảng thông tin" : "Hiện bảng thông tin"}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>

          <ZoomControls />
          {/* Minimap only on desktop */}
          <div className="hidden md:block">
            <Minimap />
          </div>
          <ChatPanel open={chatOpen} onToggle={() => setChatOpen((v) => !v)} />

          {/* Weather indicator — top right of map */}
          <div className="absolute top-3 right-3 z-10">
            <WeatherIndicator />
          </div>

          {/* Mobile: tap-to-open tile info hint */}
          {!selectedTile && (
            <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none">
              <p className="text-slate-300 text-xs">
                Tap ô đất để xem thông tin
              </p>
            </div>
          )}

          {/* Mobile: floating action button to open side sheet when tile selected */}
          {selectedTile && (
            <button
              onClick={() => setSheetOpen(true)}
              className="md:hidden absolute bottom-20 left-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-4 py-2.5 rounded-full shadow-lg transition-colors"
            >
              <span className="text-white text-sm">📋</span>
              <span className="text-white text-sm font-medium">
                ({selectedTile.x}, {selectedTile.y})
              </span>
            </button>
          )}
        </main>
      </div>

      {/* ── Mobile bottom sheet ── */}
      <MobileSideSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />

      <LeaderboardPanel
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
      />

      {/* City Event Popup */}
      {activeEvent && user && (
        <EventPopup event={activeEvent} uid={user.uid} userGold={gold} />
      )}
    </div>
  );
}

function ZoomControls() {
  const { stageScale, stagePos, setStageScale, setStagePos } = useMapStore();

  function zoom(factor: number) {
    const newScale = Math.max(0.25, Math.min(4, stageScale * factor));
    const ratio = newScale / stageScale;
    setStagePos({
      x: stagePos.x * ratio,
      y: stagePos.y * ratio,
    });
    setStageScale(newScale);
  }

  return (
    // On mobile push up above the FAB; on desktop stay above minimap
    <div className="absolute bottom-24 md:bottom-52 right-4 flex flex-col gap-1">
      <button
        onClick={() => zoom(1.2)}
        className="w-9 h-9 md:w-8 md:h-8 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 rounded text-white text-lg font-bold leading-none transition-colors shadow"
      >
        +
      </button>
      <button
        onClick={() => zoom(1 / 1.2)}
        className="w-9 h-9 md:w-8 md:h-8 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 rounded text-white text-lg font-bold leading-none transition-colors shadow"
      >
        −
      </button>
    </div>
  );
}
