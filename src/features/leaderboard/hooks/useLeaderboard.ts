"use client";

import { useEffect, useState } from "react";
import { query, orderBy, limit, onSnapshot, getDocs } from "firebase/firestore";
import { usersCol, mapChunksCol } from "@/lib/firestore";
import { calcCityScore } from "@/types";
import type { UserDoc } from "@/types/firestore";
import type { ScoredTile } from "@/types";

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

  useEffect(() => {
    setLoading(true);
    setEntries([]);

    if (tab === "cityScore") {
      // City score: tính từ mapChunks rồi sort client-side
      let cancelled = false;
      async function fetchCityScores() {
        try {
          // Load users và chunks song song
          const [usersSnap, chunksSnap] = await Promise.all([
            getDocs(query(usersCol, limit(50))),
            getDocs(mapChunksCol),
          ]);
          if (cancelled) return;

          // Build tile map per user
          const tilesByUser = new Map<string, ScoredTile[]>();
          for (const doc of chunksSnap.docs) {
            const tiles = doc.data().tiles ?? {};
            for (const [key, tile] of Object.entries(tiles)) {
              if (!tile.ownerId) continue;
              const [x, y] = key.split("_").map(Number);
              if (!tilesByUser.has(tile.ownerId))
                tilesByUser.set(tile.ownerId, []);
              tilesByUser.get(tile.ownerId)!.push({
                x,
                y,
                buildingType: tile.buildingType,
                buildingLevel: tile.buildingLevel ?? 1,
                ownerId: tile.ownerId,
              });
            }
          }

          const result: LeaderboardEntry[] = usersSnap.docs.map((d) => {
            const data = d.data();
            const tiles = tilesByUser.get(d.id) ?? [];
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
