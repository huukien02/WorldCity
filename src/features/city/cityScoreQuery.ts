import { getDocs } from "firebase/firestore";
import { mapChunksCol } from "@/lib/firestore";
import type { ScoredTile } from "@/types";

export const TILES_BY_OWNER_KEY = ["tilesByOwner"] as const;

// Giữ cache 2 phút — dùng chung cho useCityScore và leaderboard cityScore tab,
// nên full scan mapChunks chỉ chạy 1 lần thay vì mỗi hook một lần.
export const TILES_BY_OWNER_STALE = 1000 * 60 * 2;

/** Quét toàn bộ mapChunks 1 lần, gom tile theo ownerId. */
export async function fetchTilesByOwner(): Promise<
  Record<string, ScoredTile[]>
> {
  const snap = await getDocs(mapChunksCol);
  const byOwner: Record<string, ScoredTile[]> = {};

  for (const doc of snap.docs) {
    const tiles = doc.data().tiles ?? {};
    for (const [key, tile] of Object.entries(tiles)) {
      if (!tile.ownerId) continue;
      const [x, y] = key.split("_").map(Number);
      (byOwner[tile.ownerId] ??= []).push({
        x,
        y,
        buildingType: tile.buildingType,
        buildingLevel: tile.buildingLevel ?? 1,
        ownerId: tile.ownerId,
      });
    }
  }

  return byOwner;
}
