"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CityEventDoc } from "../types";

export interface ActiveEvent extends CityEventDoc {
  id: string;
  secondsLeft: number;
}

export function useCityEvents(uid: string | undefined): ActiveEvent | null {
  const [event, setEvent] = useState<ActiveEvent | null>(null);

  useEffect(() => {
    if (!uid) return;

    const eventsCol = collection(db, `users/${uid}/events`);
    // Mỗi user chỉ có tối đa 1 event active (API trigger đảm bảo điều này),
    // nên không cần orderBy — tránh phải tạo composite index.
    const q = query(
      eventsCol,
      where("status", "==", "active"),
      limit(1),
    );

    let interval: ReturnType<typeof setInterval> | null = null;
    let currentDoc: (CityEventDoc & { id: string }) | null = null;

    const unsub = onSnapshot(q, (snap) => {
      if (interval) clearInterval(interval);

      if (snap.empty) {
        setEvent(null);
        currentDoc = null;
        return;
      }

      const doc = snap.docs[0];
      currentDoc = { id: doc.id, ...(doc.data() as CityEventDoc) };

      function tick() {
        if (!currentDoc) return;
        const secondsLeft = Math.max(
          0,
          Math.ceil((currentDoc.expiresAt.toMillis() - Date.now()) / 1000),
        );
        setEvent({ ...currentDoc, secondsLeft });
      }

      tick();
      interval = setInterval(tick, 1000);
    });

    return () => {
      unsub();
      if (interval) clearInterval(interval);
    };
  }, [uid]);

  return event;
}
