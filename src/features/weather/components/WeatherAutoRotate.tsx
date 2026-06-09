"use client";

/**
 * WeatherAutoRotate — mount trong GameScreen
 *
 * Làm 2 việc:
 * 1. Init: khi game load, nếu chưa có weather doc thì tạo mới
 * 2. Auto-rotate: khi secondsLeft = 0, gọi API route để đổi thời tiết
 *    (chỉ 1 client thực sự gọi được nhờ Firestore transaction)
 */

import { useEffect, useRef } from "react";
import { useWeather } from "../hooks/useWeather";

export function WeatherAutoRotate() {
  const { secondsLeft, loading } = useWeather();
  const hasInitialized = useRef(false);
  const isRotating = useRef(false);

  // Init lần đầu
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    fetch("/api/weather/rotate").catch(() => {});
  }, []);

  // Auto rotate khi hết giờ
  useEffect(() => {
    if (loading) return;
    if (secondsLeft > 0) return;
    if (isRotating.current) return;

    isRotating.current = true;
    // Thêm random delay nhỏ để tránh nhiều client gọi cùng lúc
    const delay = Math.random() * 2000;
    const timer = setTimeout(() => {
      fetch("/api/weather/rotate", { method: "POST" })
        .catch(() => {})
        .finally(() => {
          isRotating.current = false;
        });
    }, delay);

    return () => clearTimeout(timer);
  }, [secondsLeft, loading]);

  return null; // không render gì
}
