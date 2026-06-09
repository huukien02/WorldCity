import type { Timestamp } from "firebase/firestore";

export type WeatherType = "sunny" | "rain" | "storm" | "snow" | "fog";

export interface WeatherDoc {
  type: WeatherType;
  startedAt: Timestamp;
  endsAt: Timestamp;
}

export interface WeatherConfig {
  label: string;
  icon: string;
  description: string;
  /** Multiplier áp dụng theo loại building group */
  multipliers: {
    farm?: number; // green group có farm
    green?: number; // tất cả green group
    commercial?: number;
    industrial?: number;
    all?: number; // áp dụng cho tất cả nếu set
  };
  /** màu overlay trên canvas */
  overlayColor: string;
  overlayOpacity: number;
}

export const WEATHER_CONFIG: Record<WeatherType, WeatherConfig> = {
  sunny: {
    label: "Nắng đẹp",
    icon: "☀️",
    description: "Sản xuất bình thường",
    multipliers: { all: 1.0 },
    overlayColor: "#ffffff",
    overlayOpacity: 0,
  },
  rain: {
    label: "Mưa",
    icon: "🌧️",
    description: "Farm +30%, Nhà máy -10%",
    multipliers: { green: 1.3, industrial: 0.9 },
    overlayColor: "#3b82f6",
    overlayOpacity: 0.08,
  },
  storm: {
    label: "Bão",
    icon: "⛈️",
    description: "Tất cả công trình -40%",
    multipliers: { all: 0.6 },
    overlayColor: "#1e1b4b",
    overlayOpacity: 0.25,
  },
  snow: {
    label: "Tuyết",
    icon: "❄️",
    description: "Thương mại +20%, Farm -20%",
    multipliers: { commercial: 1.2, green: 0.8 },
    overlayColor: "#e0f2fe",
    overlayOpacity: 0.1,
  },
  fog: {
    label: "Sương mù",
    icon: "🌫️",
    description: "Không ảnh hưởng sản xuất",
    multipliers: { all: 1.0 },
    overlayColor: "#94a3b8",
    overlayOpacity: 0.15,
  },
};

/** Tính multiplier cho một building dựa vào thời tiết hiện tại */
export function getWeatherMultiplier(
  weatherType: WeatherType,
  buildingGroup: string | undefined,
): number {
  const config = WEATHER_CONFIG[weatherType];
  const m = config.multipliers;

  if (m.all !== undefined) return m.all;

  if (buildingGroup === "green" && m.green !== undefined) return m.green;
  if (buildingGroup === "commercial" && m.commercial !== undefined)
    return m.commercial;
  if (buildingGroup === "industrial" && m.industrial !== undefined)
    return m.industrial;

  return 1.0;
}
