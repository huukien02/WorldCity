"use client";

import { useState, useEffect } from "react";
import { CITY_EVENT_CONFIG } from "../types";
import { useResolveEvent } from "../hooks/useResolveEvent";
import type { ActiveEvent } from "../hooks/useCityEvents";

interface EventPopupProps {
  event: ActiveEvent;
  uid: string;
  userGold: number;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function EventPopup({ event, uid, userGold }: EventPopupProps) {
  const config = CITY_EVENT_CONFIG[event.type];
  const { resolveEvent } = useResolveEvent();
  const [resolving, setResolving] = useState(false);
  const [result, setResult] = useState<{
    gold: number;
    success: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-dismiss sau khi resolved
  useEffect(() => {
    if (result) {
      const t = setTimeout(() => setResult(null), 4000);
      return () => clearTimeout(t);
    }
  }, [result]);

  const canAfford = userGold >= config.actionCost;
  const isExpired = event.secondsLeft <= 0;
  const urgency = event.secondsLeft <= 30;

  async function handleResolve() {
    setResolving(true);
    setError(null);
    try {
      const goldDelta = await resolveEvent(
        uid,
        event.id,
        event.type,
        event.tileX,
        event.tileY,
      );
      setResult({ gold: goldDelta, success: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setResolving(false);
    }
  }

  // Sau khi xử lý thành công — hiện toast nhỏ
  if (result) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-once">
        <div className="bg-emerald-900 border border-emerald-500 rounded-2xl px-6 py-3 flex items-center gap-3 shadow-2xl">
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-emerald-300 font-semibold text-sm">
              Xử lý thành công!
            </p>
            <p className="text-emerald-400 text-xs">
              {result.gold >= 0
                ? `+${result.gold.toLocaleString()} gold`
                : `${result.gold.toLocaleString()} gold`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isExpired) return null;

  // Tỉ lệ thời gian còn lại
  const totalSecs = config.durationSeconds;
  const pct = Math.max(0, (event.secondsLeft / totalSecs) * 100);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm`}
    >
      <div
        className={`
          ${config.bgColor} ${config.borderColor}
          border-2 rounded-2xl p-4 shadow-2xl
          ${urgency ? "animate-pulse" : ""}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl leading-none">{config.icon}</span>
            <div>
              <p className="text-white font-bold text-sm">{config.label}</p>
              <p className="text-slate-300 text-xs">{config.description}</p>
            </div>
          </div>
          <div
            className={`text-right shrink-0 ml-2 ${urgency ? "text-red-400" : "text-slate-300"}`}
          >
            <p className="font-mono font-bold text-lg leading-none">
              {formatCountdown(event.secondsLeft)}
            </p>
            <p className="text-xs text-slate-500">còn lại</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-700 rounded-full mb-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              urgency ? "bg-red-500" : "bg-blue-400"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Tile info */}
        <p className="text-slate-400 text-xs mb-3">
          📍 Tile ({event.tileX}, {event.tileY})
          {config.actionCost > 0 && (
            <span className="ml-2 text-yellow-400">
              💰 Chi phí: {config.actionCost} gold
            </span>
          )}
          {config.rewardGold > 0 && (
            <span className="ml-2 text-emerald-400">
              🎁 Thưởng: +{config.rewardGold} gold
            </span>
          )}
        </p>

        {/* Penalty warning */}
        <p className="text-slate-500 text-xs mb-3">
          ⚠️ Nếu bỏ qua: {config.penalty}
        </p>

        {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

        {/* Action button */}
        <button
          onClick={handleResolve}
          disabled={resolving || !canAfford}
          className={`
            w-full py-2.5 rounded-xl font-semibold text-sm transition-all
            ${
              canAfford
                ? "bg-white text-slate-900 hover:bg-slate-100 active:scale-95"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }
            disabled:opacity-60
          `}
        >
          {resolving
            ? "Đang xử lý..."
            : !canAfford
              ? `Không đủ gold (cần ${config.actionCost})`
              : `${config.icon} ${config.actionLabel}`}
        </button>
      </div>
    </div>
  );
}
