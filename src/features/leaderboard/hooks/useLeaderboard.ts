"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { query, orderBy, limit, onSnapshot, getDocs } from "firebase/firestore";
import { usersCol } from "@/lib/firestore";
import { calcCityScore } from "@/types";
import {
  fetchTilesByOwner,
  TILES_BY_OWNER_KEY,
  TILES_BY_OWNER_STALE,
} from "@/features/city/cityScoreQuery";
import type { UserDoc } from "@/types/firestore";

export type LeaderboardTab = "gold" | "land" | "buildings" | "cityScore";

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  gold: number;
  landCount: number;
  totalBuildings: number;
  cityScore?: number;
}

const FIELD_MAP: Record<Exclude<LeaderboardTab, "cityScore">, keyof UserDoc> = {
  gold: "gold",
  land: "landCount",
  buildings: "totalBuildings",
};

export function useLeaderboard(tab: LeaderboardTab) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    setLoading(true);
    setEntries([]);

    if (tab === "cityScore") {
      // City score: tính từ mapChunks rồi sort client-side
      let cancelled = false;
      async function fetchCityScores() {
        try {
          // Dùng chung cache với useCityScore — full scan mapChunks chỉ chạy 1 lần
          const [usersSnap, tilesByUser] = await Promise.all([
            getDocs(query(usersCol, limit(50))),
            queryClient.fetchQuery({
              queryKey: TILES_BY_OWNER_KEY,
              queryFn: fetchTilesByOwner,
              staleTime: TILES_BY_OWNER_STALE,
            }),
          ]);
          if (cancelled) return;

          const result: LeaderboardEntry[] = usersSnap.docs.map((d) => {
            const data = d.data();
            const tiles = tilesByUser[d.id] ?? [];
            const score = tiles.length > 0 ? calcCityScore(tiles) : null;
            return {
              uid: d.id,
              displayName: data.displayName ?? "Unknown",
              photoURL: data.photoURL ?? "",
              gold: data.gold ?? 0,
              landCount: data.landCount ?? 0,
              totalBuildings: data.totalBuildings ?? 0,
              cityScore: score?.total ?? 0,
            };
          });

          result.sort((a, b) => (b.cityScore ?? 0) - (a.cityScore ?? 0));
          setEntries(result.slice(0, 20));
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
      fetchCityScores();
      return () => {
        cancelled = true;
      };
    }

    // Standard tabs — realtime
    const q = query(usersCol, orderBy(FIELD_MAP[tab], "desc"), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      setEntries(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            uid: d.id,
            displayName: data.displayName ?? "Unknown",
            photoURL: data.photoURL ?? "",
            gold: data.gold ?? 0,
            landCount: data.landCount ?? 0,
            totalBuildings: data.totalBuildings ?? 0,
          };
        }),
      );
      setLoading(false);
    });
    return unsub;
  }, [tab]);

  return { entries, loading };
}
