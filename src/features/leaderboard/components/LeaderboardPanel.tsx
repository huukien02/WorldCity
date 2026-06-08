"use client";

import { useState } from "react";
import Image from "next/image";
import { useLeaderboard, type LeaderboardTab } from "../hooks/useLeaderboard";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";

const TABS: {
  key: LeaderboardTab;
  label: string;
  icon: string;
  unit: string;
}[] = [
  { key: "gold", label: "Gold", icon: "🪙", unit: "g" },
  { key: "land", label: "Đất", icon: "🗺️", unit: " ô" },
  { key: "buildings", label: "Công trình", icon: "🏗️", unit: "" },
];

const RANK_STYLE: Record<number, string> = {
  0: "text-yellow-400 font-bold",
  1: "text-slate-300 font-semibold",
  2: "text-amber-600 font-semibold",
};

const RANK_MEDAL: Record<number, string> = {
  0: "🥇",
  1: "🥈",
  2: "🥉",
};

interface LeaderboardPanelProps {
  open: boolean;
  onClose: () => void;
}

export function LeaderboardPanel({ open, onClose }: LeaderboardPanelProps) {
  const [tab, setTab] = useState<LeaderboardTab>("gold");
  const { entries, loading } = useLeaderboard(tab);
  const currentUser = useCurrentUser();

  if (!open) return null;

  const currentTabCfg = TABS.find((t) => t.key === tab)!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-white font-bold text-base">🏆 Bảng xếp hạng</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-3">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === t.key
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-3 pb-4 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">
              Chưa có dữ liệu
            </p>
          ) : (
            entries.map((entry, i) => {
              const isMe = entry.uid === currentUser?.uid;
              const medal = RANK_MEDAL[i];
              const rankStyle = RANK_STYLE[i] ?? "text-slate-400";
              const value =
                tab === "gold"
                  ? entry.gold.toLocaleString() + currentTabCfg.unit
                  : tab === "land"
                    ? entry.landCount.toLocaleString() + currentTabCfg.unit
                    : entry.totalBuildings.toLocaleString() +
                      currentTabCfg.unit;

              return (
                <div
                  key={entry.uid}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isMe
                      ? "bg-blue-600/20 border border-blue-500/40"
                      : "bg-slate-800/60 hover:bg-slate-800"
                  }`}
                >
                  {/* Rank */}
                  <span
                    className={`w-6 text-center text-sm shrink-0 ${rankStyle}`}
                  >
                    {medal ?? <span className="text-xs">{i + 1}</span>}
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
                  <span
                    className={`flex-1 text-sm truncate ${isMe ? "text-blue-300 font-medium" : "text-slate-200"}`}
                  >
                    {entry.displayName}
                    {isMe && (
                      <span className="text-blue-500 text-xs ml-1">(bạn)</span>
                    )}
                  </span>

                  {/* Value */}
                  <span
                    className={`text-sm font-mono font-medium shrink-0 ${i === 0 ? "text-yellow-400" : "text-slate-300"}`}
                  >
                    {value}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
