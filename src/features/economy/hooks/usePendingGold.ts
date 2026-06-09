"use client";

import { useEffect, useState } from "react";
import type { TileData } from "@/types/firestore";
import { BUILDING_CONFIG, BUILDING_GROUP, HARVEST_CAP_MINUTES } from "@/types";
import { useWeather } from "@/features/weather/hooks/useWeather";
import { getWeatherMultiplier } from "@/features/weather/types";

export const HARVEST_COOLDOWN_MS = 60 * 60_000; // 60 phút

interface PendingGoldResult {
  pending: number;
  secondsLeft: number; // giây còn lại trước khi được harvest
  canHarvest: boolean;
  weatherMultiplier: number; // để UI hiển thị badge thời tiết
}

export function usePendingGold(tile: TileData | null): PendingGoldResult {
  const { type: weatherType } = useWeather();
  const [result, setResult] = useState<PendingGoldResult>({
    pending: 0,
    secondsLeft: 60,
    canHarvest: false,
    weatherMultiplier: 1,
  });

  useEffect(() => {
    if (!tile?.buildingType || !tile.lastHarvestAt) {
      setResult({
        pending: 0,
        secondsLeft: 60,
        canHarvest: false,
        weatherMultiplier: 1,
      });
      return;
    }

    const config = BUILDING_CONFIG[tile.buildingType];
    const level = tile.buildingLevel ?? 1;
    const buildingGroup = BUILDING_GROUP[tile.buildingType];
    const multiplier = getWeatherMultiplier(weatherType, buildingGroup);

    // Festival bonus x2 nếu còn hiệu lực
    const festivalActive =
      tile.festivalBonusUntil != null &&
      tile.festivalBonusUntil.toMillis() > Date.now();
    const festivalMultiplier = festivalActive ? 2 : 1;

    function calculate() {
      const lastMs = tile!.lastHarvestAt!.toMillis();
      const elapsedMs = Date.now() - lastMs;
      const elapsedMinutes = elapsedMs / 60_000;
      const capped = Math.min(elapsedMinutes, HARVEST_CAP_MINUTES);
      const pending = Math.floor(
        capped *
          config.incomePerMinute *
          level *
          multiplier *
          festivalMultiplier,
      );
      const secondsLeft = Math.max(
        0,
        Math.ceil((HARVEST_COOLDOWN_MS - elapsedMs) / 1000),
      );
      setResult({
        pending,
        secondsLeft,
        canHarvest: secondsLeft === 0 && pending > 0,
        weatherMultiplier: multiplier,
      });
    }

    calculate();
    const interval = setInterval(calculate, 1_000);
    return () => clearInterval(interval);
  }, [tile, weatherType]);

  return result;
}
