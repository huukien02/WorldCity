"use client";

import {
  runTransaction,
  doc,
  updateDoc,
  serverTimestamp,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  userDoc,
  chunkDoc,
  goldLogsCol,
  getChunkId,
  getTileKey,
} from "@/lib/firestore";
import { CITY_EVENT_CONFIG } from "../types";
import type { CityEventType } from "../types";

export function useResolveEvent() {
  async function resolveEvent(
    uid: string,
    eventId: string,
    eventType: CityEventType,
    tileX: number,
    tileY: number,
  ): Promise<number> {
    const config = CITY_EVENT_CONFIG[eventType];
    const eventDocRef = doc(db, `users/${uid}/events`, eventId);
    const chunkId = getChunkId(tileX, tileY);
    const tileKey = getTileKey(tileX, tileY);
    let earned = 0;

    await runTransaction(db, async (tx) => {
      const userSnap = await tx.get(userDoc(uid));
      if (!userSnap.exists()) throw new Error("User not found");

      const eventSnap = await tx.get(eventDocRef);
      if (!eventSnap.exists()) throw new Error("Sự kiện không tồn tại");
      if (eventSnap.data().status !== "active")
        throw new Error("Sự kiện đã kết thúc");

      const now = Date.now();
      const expiresAt = (eventSnap.data().expiresAt as Timestamp).toMillis();
      if (now > expiresAt) throw new Error("Sự kiện đã hết hạn");

      const user = userSnap.data();
      if (user.gold < config.actionCost) {
        throw new Error(`Không đủ gold (cần ${config.actionCost})`);
      }

      earned = config.rewardGold;

      // Trừ chi phí + cộng thưởng
      const goldDelta = earned - config.actionCost;
      tx.update(userDoc(uid), {
        gold: user.gold + goldDelta,
      });

      // Đánh dấu event đã resolved
      tx.update(eventDocRef, {
        status: "resolved",
        resolvedAt: serverTimestamp(),
        penaltyApplied: false,
      });

      // Xử lý đặc biệt theo loại: lễ hội → ghi bonus flag lên tile
      if (eventType === "festival") {
        tx.update(chunkDoc(chunkId), {
          [`tiles.${tileKey}.festivalBonusUntil`]: Timestamp.fromMillis(
            Date.now() + 10 * 60 * 1000,
          ),
          updatedAt: serverTimestamp(),
        });
      }
    });

    // Log gold transaction
    if (config.actionCost > 0 || earned > 0) {
      await addDoc(goldLogsCol(uid), {
        type: earned > config.actionCost ? "earn" : "spend",
        amount: Math.abs(earned - config.actionCost),
        reason: `Xử lý sự kiện: ${config.label}`,
        balanceBefore: 0,
        balanceAfter: 0,
        createdAt: serverTimestamp(),
      });
    }

    return earned - config.actionCost;
  }

  return { resolveEvent };
}
