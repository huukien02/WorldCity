"use client";

import { useState } from "react";
import { useCityScore } from "../hooks/useCityScore";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { CITY_RATING_CONFIG, type CityScoreBreakdown } from "@/types";

const BREAKDOWN_ITEMS: {
  key: keyof Omit<CityScoreBreakdown, "total" | "rating">;
  label: string;
  max: number;
  icon: string;
}[] = [
  { key: "diversity", label: "Đa dạng công trình", max: 30, icon: "🎨" },
  { key: "zoning", label: "Quy hoạch theo vùng", max: 25, icon: "🗺️" },
  { key: "compactness", label: "Sự liên kết", max: 20, icon: "🔗" },
  { key: "greenRatio", label: "Tỉ lệ cây xanh", max: 15, icon: "🌿" },
  { key: "landmark", label: "Điểm nhấn", max: 10, icon: "🏆" },
  { key: "levelBonus", label: "Độ đầu tư", max: 10, icon: "⬆️" },
  { key: "penalty", label: "Phạt", max: 0, icon: "⚠️" },
];

const MAX_TOTAL = 110;

export function CityScoreCard() {
  const user = useCurrentUser();
  const { score, loading, refresh } = useCityScore(user?.uid);
  const [expanded, setExpanded] = useState(false);

  if (!user) return null;

  const ratingCfg = score ? CITY_RATING_CONFIG[score.rating] : null;

  function handleExpand() {
    const next = !expanded;
    setExpanded(next);
    // Fetch khi mở lần đầu hoặc refresh
    if (next) refresh();
  }

  return (
    <div className="border-t border-slate-800">
      {/* Header toggle */}
      <button
        onClick={handleExpand}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wider">
            Điểm thành phố
          </span>
          {score && !loading && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-slate-700 text-slate-300">
              {score.total}đ
            </span>
          )}
        </div>
        <span className="text-slate-600 text-xs">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div className="px-3 pb-4 space-y-3">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-4 gap-2">
              <div className="w-4 h-4 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
              <span className="text-xs text-slate-500">Đang tính điểm...</span>
            </div>
          )}

          {/* No data */}
          {!loading && !score && (
            <p className="text-xs text-slate-600 text-center py-2">
              Hãy claim đất và xây dựng để tính điểm
            </p>
          )}

          {/* Score display */}
          {!loading && score && ratingCfg && (
            <>
              {/* Rating badge */}
              <div
                className="flex items-center gap-2 p-2.5 rounded-xl border"
                style={{
                  borderColor: ratingCfg.color + "50",
                  backgroundColor: ratingCfg.color + "15",
                }}
              >
                <span className="text-xl">{ratingCfg.badge}</span>
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">
                    {ratingCfg.label}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {score.total} / {MAX_TOTAL} điểm
                  </p>
                </div>
                {/* Refresh button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    refresh();
                  }}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded"
                  title="Tính lại"
                >
                  🔄
                </button>
              </div>

              {/* Total progress bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Tổng điểm</span>
                  <span>{score.total}đ</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min((score.total / MAX_TOTAL) * 100, 100)}%`,
                      backgroundColor: ratingCfg.color,
                    }}
                  />
                </div>
              </div>

              {/* Breakdown items */}
              <div className="space-y-1.5">
                {BREAKDOWN_ITEMS.map(({ key, label, max, icon }) => {
                  const val = score[key] as number;
                  if (key === "penalty" && val === 0) return null;
                  const isPenalty = key === "penalty";
                  const pct = isPenalty || max === 0 ? 0 : (val / max) * 100;

                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="text-slate-400 flex items-center gap-1">
                          <span>{icon}</span>
                          <span>{label}</span>
                        </span>
                        <span
                          className={
                            isPenalty
                              ? "text-red-400 font-medium"
                              : pct >= 80
                                ? "text-green-400"
                                : "text-slate-300"
                          }
                        >
                          {isPenalty ? val : `${val}/${max}`}
                        </span>
                      </div>
                      {!isPenalty && (
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              backgroundColor:
                                pct >= 80
                                  ? "#22c55e"
                                  : pct >= 50
                                    ? "#eab308"
                                    : "#3b82f6",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Improvement tips */}
              <ScoreTips score={score} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreTips({ score }: { score: CityScoreBreakdown }) {
  const tips: string[] = [];

  if (score.diversity < 15)
    tips.push("🎨 Xây thêm nhiều loại công trình khác nhau");
  if (score.zoning < 12) tips.push("🗺️ Đặt các công trình cùng nhóm gần nhau");
  if (score.compactness < 10) tips.push("🔗 Claim đất liền kề thay vì rải rác");
  if (score.greenRatio < 8) tips.push("🌿 Thêm Farm, Park hoặc Sân chơi");
  if (score.landmark === 0)
    tips.push("🏆 Xây Arena, Tòa tháp hoặc Sân vận động");
  if (score.penalty < 0) tips.push("⚠️ Xây thêm building và đa dạng loại hơn");

  if (tips.length === 0) return null;

  return (
    <div className="space-y-1 pt-1 border-t border-slate-800">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider">
        Gợi ý cải thiện
      </p>
      {tips.slice(0, 2).map((tip, i) => (
        <p key={i} className="text-xs text-slate-400 leading-snug">
          {tip}
        </p>
      ))}
    </div>
  );
}
