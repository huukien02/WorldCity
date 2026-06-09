"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { WeatherDoc, WeatherType } from "../types";

interface WeatherState {
  type: WeatherType;
  secondsLeft: number; // giây còn lại của thời tiết hiện tại
  loading: boolean;
}

export function useWeather(): WeatherState {
  const [state, setState] = useState<WeatherState>({
    type: "sunny",
    secondsLeft: 0,
    loading: true,
  });

  useEffect(() => {
    const ref = doc(db, "game", "weather");
    let interval: ReturnType<typeof setInterval> | null = null;

    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setState({ type: "sunny", secondsLeft: 0, loading: false });
        return;
      }

      const data = snap.data() as WeatherDoc;

      if (interval) clearInterval(interval);

      function tick() {
        const now = Date.now();
        const endsMs = data.endsAt.toMillis();
        const secondsLeft = Math.max(0, Math.ceil((endsMs - now) / 1000));
        setState({ type: data.type, secondsLeft, loading: false });
      }

      tick();
      interval = setInterval(tick, 1000);
    });

    return () => {
      unsub();
      if (interval) clearInterval(interval);
    };
  }, []);

  return state;
}
