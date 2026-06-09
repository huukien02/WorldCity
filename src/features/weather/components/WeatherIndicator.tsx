"use client";

import { useWeather } from "../hooks/useWeather";
import { WEATHER_CONFIG } from "../types";

function formatTime(seconds: number): string {
  if (seconds <= 0) return "...";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}p${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

export function WeatherIndicator() {
  const { type, secondsLeft, loading } = useWeather();

  if (loading) return null;

  const config = WEATHER_CONFIG[type];

  return (
    <div className="group relative flex items-center gap-1.5 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-full px-3 py-1.5 cursor-default select-none">
      <span className="text-base leading-none">{config.icon}</span>
      <span className="text-slate-200 text-xs font-medium hidden sm:inline">
        {config.label}
      </span>
      <span className="text-slate-400 text-xs tabular-nums">
        {formatTime(secondsLeft)}
      </span>

      {/* Tooltip — hiển thị phía dưới */}
      <div className="absolute top-full right-0 mt-2 hidden group-hover:block z-50 pointer-events-none">
        <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 whitespace-nowrap shadow-xl">
          <p className="font-semibold mb-0.5">
            {config.icon} {config.label}
          </p>
          <p className="text-slate-400">{config.description}</p>
          <p className="text-slate-500 mt-1">
            Đổi sau: {formatTime(secondsLeft)}
          </p>
        </div>
        {/* Arrow pointing up */}
        <div className="absolute bottom-full right-4 border-4 border-transparent border-b-slate-700" />
      </div>
    </div>
  );
}
