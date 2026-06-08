"use client";

import { useEffect, useState, useCallback } from "react";
import { getDocs } from "firebase/firestore";
import { mapChunksCol } from "@/lib/firestore";
import {
  calcCityScore,
  type CityScoreBreakdown,
  type ScoredTile,
} from "@/types";

export interface UseCityScoreResult {
  score: CityScoreBreakdown | null;
  loading: boolean;
  refresh: () => void;
}

// Dùng được cho cả bản thân (uid = currentUser) lẫn người khác (uid = ownerUid)
export function useCityScore(uid: string | undefined): UseCityScoreResult {
  const [score, setScore] = useState<CityScoreBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      try {
        const snap = await getDocs(mapChunksCol);
        if (cancelled) return;

        const myTiles: ScoredTile[] = [];
        for (const doc of snap.docs) {
          const tiles = doc.data().tiles ?? {};
          for (const [key, tile] of Object.entries(tiles)) {
            if (tile.ownerId !== uid) continue;
            const [x, y] = key.split("_").map(Number);
            myTiles.push({
              x,
              y,
              buildingType: tile.buildingType,
              buildingLevel: tile.buildingLevel ?? 1,
              ownerId: tile.ownerId,
            });
          }
        }

        setScore(myTiles.length > 0 ? calcCityScore(myTiles) : null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => {
      cancelled = true;
    };
  }, [uid, tick]);

  return { score, loading, refresh };
}
