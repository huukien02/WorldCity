"use client";

import { useState } from "react";
import Image from "next/image";
import {
  useLeaderboard,
  type LeaderboardTab,
  type LeaderboardEntry,
} from "../hooks/useLeaderboard";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { CityScoreModal } from "@/features/city/components/CityScoreModal";
import { CITY_RATING_CONFIG } from "@/types";

const TABS: { key: LeaderboardTab; label: string; icon: string }[] = [
  { key: "gold", label: "Gold", icon: "🪙" },
  { key: "land", label: "Đất", icon: "🗺️" },
  { key: "buildings", label: "Công trình", icon: "🏗️" },
  { key: "cityScore", label: "City Score", icon: "🏙️" },
];

const RANK_MEDAL: Record<number, string> = { 0: "🥇", 1: "🥈", 2: "🥉" };

interface LeaderboardPanelProps {
  open: boolean;
  onClose: () => void;
}

export function LeaderboardPanel({ open, onClose }: LeaderboardPanelProps) {
  const [tab, setTab] = useState<LeaderboardTab>("gold");
  const { entries, loading } = useLeaderboard(tab);
  const currentUser = useCurrentUser();
  const [viewScoreUser, setViewScoreUser] = useState<{
    uid: string;
    displayName: string;
  } | null>(null);

  if (!open) return null;

  function getDisplayValue(entry: LeaderboardEntry): string {
    switch (tab) {
      case "gold":
        return entry.gold.toLocaleString() + "g";
      case "land":
        return entry.landCount.toLocaleString() + " ô";
      case "buildings":
        return entry.totalBuildings.toLocaleString();
      case "cityScore":
        return (entry.cityScore ?? 0) + "đ";
    }
  }

  function getCityRatingBadge(score: number) {
    if (score >= 90) return CITY_RATING_CONFIG.dream.badge;
    if (score >= 70) return CITY_RATING_CONFIG.urban.badge;
    if (score >= 50) return CITY_RATING_CONFIG.developing.badge;
    if (score >= 30) return CITY_RATING_CONFIG.construction.badge;
    return CITY_RATING_CONFIG.wasteland.badge;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        onClick={onClose}
      >
        <div
          className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
            <h2 className="text-white font-bold text-base">🏆 Bảng xếp hạng</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors text-lg"
            >
              ✕
            </button>
          </div>

          {/* Tabs — 2×2 grid to fit 4 tabs */}
          <div className="grid grid-cols-4 gap-1 px-4 pb-3 shrink-0">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                  tab === t.key
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span className="text-sm">{t.icon}</span>
                <span className="leading-tight text-center">{t.label}</span>
              </button>
            ))}
          </div>

          {/* City score hint */}
          {tab === "cityScore" && (
            <p className="px-4 pb-2 text-xs text-slate-500 shrink-0">
              Click vào người chơi để xem chi tiết điểm thành phố
            </p>
          )}

          {/* List */}
          <div className="overflow-y-auto flex-1 px-3 pb-4 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-10 gap-2">
                <div className="w-5 h-5 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
                {tab === "cityScore" && (
                  <span className="text-slate-500 text-xs">
                    Đang tính điểm...
                  </span>
                )}
              </div>
            ) : entries.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">
                Chưa có dữ liệu
              </p>
            ) : (
              entries.map((entry, i) => {
                const isMe = entry.uid === currentUser?.uid;
                const medal = RANK_MEDAL[i];
                const value = getDisplayValue(entry);
                const isCityTab = tab === "cityScore";

                return (
                  <button
                    key={entry.uid}
                    onClick={
                      isCityTab
                        ? () =>
                            setViewScoreUser({
                              uid: entry.uid,
                              displayName: entry.displayName,
                            })
                        : undefined
                    }
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                      isMe
                        ? "bg-blue-600/20 border border-blue-500/40"
                        : isCityTab
                          ? "bg-slate-800/60 hover:bg-slate-800 cursor-pointer"
                          : "bg-slate-800/60"
                    }`}
                  >
                    {/* Rank */}
                    <span className="w-6 text-center text-sm shrink-0">
                      {medal ?? (
                        <span className="text-xs text-slate-400">{i + 1}</span>
                      )}
                    </span>

                    {/* Avatar */}
                    {entry.photoURL ? (
                      <Image
                        src={entry.photoURL}
                        alt={entry.displayName}
                        width={28}
                        height={28}
                        className="rounded-full shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400 shrink-0">
                        {entry.displayName[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-sm truncate block ${isMe ? "text-blue-300 font-medium" : "text-slate-200"}`}
                      >
                        {entry.displayName}
                        {isMe && (
                          <span className="text-blue-500 text-xs ml-1">
                            (bạn)
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Value */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isCityTab && (
                        <span className="text-sm">
                          {getCityRatingBadge(entry.cityScore ?? 0)}
                        </span>
                      )}
                      <span
                        className={`text-sm font-mono font-medium ${i === 0 ? "text-yellow-400" : isCityTab ? "text-purple-400" : "text-slate-300"}`}
                      >
                        {value}
                      </span>
                      {isCityTab && (
                        <span className="text-slate-600 text-xs">›</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* City score detail modal — z-index cao hơn leaderboard */}
      {viewScoreUser && (
        <CityScoreModal
          uid={viewScoreUser.uid}
          displayName={viewScoreUser.displayName}
          onClose={() => setViewScoreUser(null)}
        />
      )}
    </>
  );
}
