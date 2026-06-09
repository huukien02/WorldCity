import type { Timestamp } from "firebase/firestore";

export type CityEventType =
  | "fire"
  | "festival"
  | "plague"
  | "blackout"
  | "investment";

export type CityEventStatus = "active" | "resolved" | "expired";

export interface CityEventDoc {
  type: CityEventType;
  status: CityEventStatus;
  tileX: number;
  tileY: number;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  resolvedAt: Timestamp | null;
  rewardGold: number; // gold thưởng nếu xử lý kịp
  penaltyApplied: boolean; // đã áp dụng hậu quả chưa
}

export interface CityEventConfig {
  label: string;
  icon: string;
  description: string; // mô tả sự kiện
  actionLabel: string; // text nút hành động
  actionCost: number; // gold cần bỏ ra để xử lý (0 = miễn phí)
  rewardGold: number; // gold nhận được nếu xử lý thành công
  durationSeconds: number; // thời gian tồn tại
  penalty: string; // mô tả hậu quả nếu bỏ qua
  overlayColor: string; // màu highlight trên tile
  bgColor: string; // màu background popup
  borderColor: string;
}

export const CITY_EVENT_CONFIG: Record<CityEventType, CityEventConfig> = {
  fire: {
    label: "Hỏa hoạn!",
    icon: "🔥",
    description: "Công trình của bạn đang bốc cháy. Dập lửa ngay!",
    actionLabel: "Dập lửa",
    actionCost: 50,
    rewardGold: 0,
    durationSeconds: 3 * 60,
    penalty: "Building mất 1 level",
    overlayColor: "#ef4444",
    bgColor: "bg-red-950",
    borderColor: "border-red-500",
  },
  festival: {
    label: "Lễ hội thành phố!",
    icon: "🎉",
    description: "Lễ hội đang diễn ra! Tham gia ngay để nhận thưởng.",
    actionLabel: "Tham gia",
    actionCost: 0,
    rewardGold: 300,
    durationSeconds: 5 * 60,
    penalty: "Mất cơ hội nhận gold",
    overlayColor: "#eab308",
    bgColor: "bg-yellow-950",
    borderColor: "border-yellow-500",
  },
  plague: {
    label: "Dịch bệnh bùng phát!",
    icon: "🦠",
    description: "Dịch bệnh xuất hiện. Cách ly ngay để ngăn lây lan.",
    actionLabel: "Cách ly",
    actionCost: 80,
    rewardGold: 50,
    durationSeconds: 4 * 60,
    penalty: "Lan sang tile lân cận, giảm sản xuất 50%",
    overlayColor: "#22c55e",
    bgColor: "bg-green-950",
    borderColor: "border-green-500",
  },
  blackout: {
    label: "Mất điện!",
    icon: "⚡",
    description: "Công trình mất điện. Sửa chữa để khôi phục sản xuất.",
    actionLabel: "Sửa chữa",
    actionCost: 60,
    rewardGold: 20,
    durationSeconds: 3 * 60,
    penalty: "Ngưng sản xuất gold 1 giờ",
    overlayColor: "#6366f1",
    bgColor: "bg-indigo-950",
    borderColor: "border-indigo-500",
  },
  investment: {
    label: "Cơ hội đầu tư!",
    icon: "💰",
    description: "Nhà đầu tư đang tìm kiếm đối tác. Đừng bỏ lỡ!",
    actionLabel: "Đầu tư ngay",
    actionCost: 100,
    rewardGold: 500,
    durationSeconds: 5 * 60,
    penalty: "Mất cơ hội",
    overlayColor: "#f59e0b",
    bgColor: "bg-amber-950",
    borderColor: "border-amber-500",
  },
};
