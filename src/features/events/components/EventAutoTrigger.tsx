"use client";

/**
 * EventAutoTrigger — mount trong GameScreen
 *
 * Sau khi game load, mỗi 10 phút có 15% cơ hội trigger sự kiện cho user.
 * Nếu đã có event active thì bỏ qua.
 */

import { useEffect, useRef } from "react";
import { useCityEvents } from "../hooks/useCityEvents";

const TRIGGER_INTERVAL_MS = 10 * 60 * 1000; // check mỗi 10 phút
const TRIGGER_CHANCE = 0.15; // 15% mỗi lần check

interface EventAutoTriggerProps {
  uid: string | undefined;
}

export function EventAutoTrigger({ uid }: EventAutoTriggerProps) {
  const activeEvent = useCityEvents(uid);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!uid) return;

    function tryTrigger() {
      // Không trigger nếu đang có event
      if (activeEvent) return;
      if (Math.random() > TRIGGER_CHANCE) return;

      fetch("/api/events/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      }).catch(() => {});
    }

    // Trigger lần đầu sau 2 phút (cho user kịp settle)
    const initTimer = setTimeout(
      () => {
        tryTrigger();
      },
      2 * 60 * 1000,
    );

    // Sau đó check định kỳ
    timerRef.current = setInterval(tryTrigger, TRIGGER_INTERVAL_MS);

    return () => {
      clearTimeout(initTimer);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [uid, activeEvent]);

  return null;
}
