"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { calcCityScore, type CityScoreBreakdown } from "@/types";
import {
  fetchTilesByOwner,
  TILES_BY_OWNER_KEY,
  TILES_BY_OWNER_STALE,
} from "../cityScoreQuery";

export interface UseCityScoreResult {
  score: CityScoreBreakdown | null;
  loading: boolean;
  refresh: () => void;
}

// Dùng được cho cả bản thân (uid = currentUser) lẫn người khác (uid = ownerUid)
export function useCityScore(uid: string | undefined): UseCityScoreResult {
  const queryClient = useQueryClient();

  const { data, isFetching } = useQuery({
    queryKey: TILES_BY_OWNER_KEY,
    queryFn: fetchTilesByOwner,
    staleTime: TILES_BY_OWNER_STALE,
    enabled: !!uid,
  });

  const score = useMemo(() => {
    if (!uid) return null;
    const tiles = data?.[uid] ?? [];
    return tiles.length > 0 ? calcCityScore(tiles) : null;
  }, [data, uid]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: TILES_BY_OWNER_KEY });
  }, [queryClient]);

  return { score, loading: isFetching, refresh };
}
