/**
 * POST /api/events/trigger
 *
 * Tạo sự kiện ngẫu nhiên cho một user.
 * Gọi từ client (WeatherAutoRotate pattern) hoặc cron job.
 *
 * Body: { uid: string }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CityEventType, CityEventDoc } from "@/features/events/types";
import { CITY_EVENT_CONFIG } from "@/features/events/types";
import { getChunkId, getTileKey, chunkDoc } from "@/lib/firestore";
import { getDoc } from "firebase/firestore";

const EVENT_TYPES: CityEventType[] = [
  "fire",
  "festival",
  "plague",
  "blackout",
  "investment",
];

// Xác suất: investment ít nhất, festival nhiều nhất
const EVENT_WEIGHTS: Record<CityEventType, number> = {
  festival: 30,
  investment: 20,
  blackout: 20,
  fire: 15,
  plague: 15,
};

function pickEventType(): CityEventType {
  const total = EVENT_TYPES.reduce((s, t) => s + EVENT_WEIGHTS[t], 0);
  let rand = Math.random() * total;
  for (const type of EVENT_TYPES) {
    rand -= EVENT_WEIGHTS[type];
    if (rand <= 0) return type;
  }
  return "festival";
}

/** Lấy một tile ngẫu nhiên của user có building */
async function getRandomBuildingTile(
  uid: string,
): Promise<{ tileX: number; tileY: number } | null> {
  // Tìm trong chunks — lấy vài chunk gần origin rồi pick random tile có building
  const candidates: { tileX: number; tileY: number }[] = [];

  // Quét chunk 0_0 đến 9_9 (100x100 map)
  const chunkIds: string[] = [];
  for (let cx = 0; cx < 10; cx++) {
    for (let cy = 0; cy < 10; cy++) {
      chunkIds.push(`${cx}_${cy}`);
    }
  }

  // Shuffle và chỉ check tối đa 20 chunks để tránh quá chậm
  const shuffled = chunkIds.sort(() => Math.random() - 0.5).slice(0, 20);

  for (const chunkId of shuffled) {
    const snap = await getDoc(chunkDoc(chunkId));
    if (!snap.exists()) continue;
    const tiles = snap.data().tiles;
    for (const [key, tile] of Object.entries(tiles)) {
      if (tile.ownerId === uid && tile.buildingType) {
        const [x, y] = key.split("_").map(Number);
        candidates.push({ tileX: x, tileY: y });
      }
    }
    if (candidates.length >= 5) break;
  }

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid } = body as { uid: string };
    if (!uid)
      return NextResponse.json({ error: "uid required" }, { status: 400 });

    // Kiểm tra đã có event active chưa
    const eventsCol = collection(db, `users/${uid}/events`);
    const activeQ = query(eventsCol, where("status", "==", "active"), limit(1));
    const activeSnap = await getDocs(activeQ);
    if (!activeSnap.empty) {
      return NextResponse.json({ ok: false, reason: "already_active" });
    }

    // Tìm tile có building
    const tile = await getRandomBuildingTile(uid);
    if (!tile) {
      return NextResponse.json({ ok: false, reason: "no_buildings" });
    }

    const type = pickEventType();
    const config = CITY_EVENT_CONFIG[type];
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(
      Date.now() + config.durationSeconds * 1000,
    );

    const eventData: Omit<CityEventDoc, never> = {
      type,
      status: "active",
      tileX: tile.tileX,
      tileY: tile.tileY,
      createdAt: now,
      expiresAt,
      resolvedAt: null,
      rewardGold: config.rewardGold,
      penaltyApplied: false,
    };

    const ref = await addDoc(eventsCol, eventData);

    return NextResponse.json({
      ok: true,
      eventId: ref.id,
      type,
      tile,
      durationSeconds: config.durationSeconds,
    });
  } catch (err) {
    console.error("[events/trigger]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
