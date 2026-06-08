"use client";

import { useEffect, useState } from "react";
import { query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { usersCol } from "@/lib/firestore";
import type { UserDoc } from "@/types/firestore";

export type LeaderboardTab = "gold" | "land" | "buildings";

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  gold: number;
  landCount: number;
  totalBuildings: number;
}

const FIELD_MAP: Record<LeaderboardTab, keyof UserDoc> = {
  gold: "gold",
  land: "landCount",
  buildings: "totalBuildings",
};

export function useLeaderboard(tab: LeaderboardTab) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
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
