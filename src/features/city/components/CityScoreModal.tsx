"use client";

import { useCityScore } from "../hooks/useCityScore";
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

interface CityScoreModalProps {
  uid: string;
  displayName: string;
  onClose: () => void;
}

export function CityScoreModal({
  uid,
  displayName,
  onClose,
}: CityScoreModalProps) {
  const { score, loading, refresh } = useCityScore(uid);
  const ratingCfg = score ? CITY_RATING_CONFIG[score.rating] : null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <div>
            <h2 className="text-white font-bold text-base">
              🏙️ Điểm thành phố
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">{displayName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="text-slate-500 hover:text-slate-300 transition-colors text-sm px-2 py-1 rounded-lg hover:bg-slate-800"
              title="Tính lại"
            >
              🔄
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors text-lg w-7 h-7 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 pb-5 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-10 gap-2">
              <div className="w-5 h-5 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
              <span className="text-slate-500 text-sm">Đang tính điểm...</span>
            </div>
          )}

          {!loading && !score && (
            <div className="text-center py-10">
              <p className="text-4xl mb-2">🌱</p>
              <p className="text-slate-400 text-sm">
                {displayName} chưa có đất nào
              </p>
            </div>
          )}

          {!loading && score && ratingCfg && (
            <>
              {/* Rating badge */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{
                  borderColor: ratingCfg.color + "50",
                  backgroundColor: ratingCfg.color + "15",
                }}
              >
                <span className="text-3xl">{ratingCfg.badge}</span>
                <div className="flex-1">
                  <p className="text-white font-bold">{ratingCfg.label}</p>
                  <p className="text-slate-400 text-xs">
                    {score.total} / {MAX_TOTAL} điểm
                  </p>
                </div>
                <div
                  className="text-2xl font-black font-mono"
                  style={{ color: ratingCfg.color }}
                >
                  {score.total}
                </div>
              </div>

              {/* Total bar */}
              <div>
                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min((score.total / MAX_TOTAL) * 100, 100)}%`,
                      backgroundColor: ratingCfg.color,
                    }}
                  />
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 pt-1">
                {BREAKDOWN_ITEMS.map(({ key, label, max, icon }) => {
                  const val = score[key] as number;
                  if (key === "penalty" && val === 0) return null;
                  const isPenalty = key === "penalty";
                  const pct = isPenalty || max === 0 ? 0 : (val / max) * 100;
                  const barColor =
                    pct >= 80 ? "#22c55e" : pct >= 50 ? "#eab308" : "#3b82f6";

                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <span>{icon}</span>
                          <span>{label}</span>
                        </span>
                        <span
                          className={
                            isPenalty
                              ? "text-red-400 font-semibold"
                              : "text-slate-200 font-medium"
                          }
                        >
                          {isPenalty ? val : `${val}/${max}`}
                        </span>
                      </div>
                      {!isPenalty && (
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: barColor,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
