/**
 * POST /api/weather/rotate
 *
 * Endpoint để đổi thời tiết ngẫu nhiên.
 * Gọi từ Firebase Scheduled Function, cron job bên ngoài, hoặc thủ công.
 *
 * Bảo vệ bằng CRON_SECRET header để tránh gọi công khai.
 * Thêm CRON_SECRET=<random_string> vào .env.local
 */

import { NextRequest, NextResponse } from "next/server";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { WeatherType } from "@/features/weather/types";

// Thời gian mỗi loại thời tiết kéo dài (giây)
const DURATION_MAP: Record<WeatherType, number> = {
  sunny: 20 * 60, // 20 phút
  rain: 15 * 60, // 15 phút
  storm: 8 * 60, //  8 phút
  snow: 12 * 60, // 12 phút
  fog: 10 * 60, // 10 phút
};

function pickNextWeather(current: WeatherType | null): WeatherType {
  // Xác suất: sunny 40%, rain 25%, snow 15%, fog 12%, storm 8%
  const weights: [WeatherType, number][] = [
    ["sunny", 40],
    ["rain", 25],
    ["snow", 15],
    ["fog", 12],
    ["storm", 8],
  ];
  const total = weights.reduce((s, [, w]) => s + w, 0);
  let rand = Math.random() * total;
  for (const [type, weight] of weights) {
    rand -= weight;
    if (rand <= 0 && type !== current) return type;
  }
  return "sunny";
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Đọc thời tiết hiện tại để tránh lặp lại ngay
    const { getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, "game", "weather"));
    const currentType: WeatherType | null = snap.exists()
      ? (snap.data() as { type: WeatherType }).type
      : null;

    const nextType = pickNextWeather(currentType);
    const duration = DURATION_MAP[nextType];
    const now = Timestamp.now();
    const endsAt = Timestamp.fromMillis(Date.now() + duration * 1000);

    await setDoc(doc(db, "game", "weather"), {
      type: nextType,
      startedAt: now,
      endsAt,
    });

    return NextResponse.json({
      ok: true,
      weather: nextType,
      durationMinutes: Math.round(duration / 60),
    });
  } catch (err) {
    console.error("[weather/rotate]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// GET để init thời tiết lần đầu (không cần secret)
export async function GET() {
  try {
    const { getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, "game", "weather"));

    if (snap.exists()) {
      return NextResponse.json({ ok: true, current: snap.data() });
    }

    // Tạo mới nếu chưa có
    const endsAt = Timestamp.fromMillis(Date.now() + 20 * 60 * 1000);
    await setDoc(doc(db, "game", "weather"), {
      type: "sunny",
      startedAt: Timestamp.now(),
      endsAt,
    });

    return NextResponse.json({ ok: true, initialized: true, weather: "sunny" });
  } catch (err) {
    console.error("[weather/init]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
