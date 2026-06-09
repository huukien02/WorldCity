export type { BuildingType, TileData, MapChunkDoc, UserDoc } from "./firestore";

export interface TileCoord {
  x: number;
  y: number;
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

// Sorted by cost ascending
export const BUILDING_CONFIG = {
  // ── Tier 0: Decoration / Infrastructure ──────────────────────────────────
  fence: { label: "Hàng rào", cost: 30, incomePerMinute: 1, color: "#d4d4d4" },
  gate: { label: "Cổng", cost: 70, incomePerMinute: 1, color: "#e5c48b" },
  road: { label: "Đường sá", cost: 50, incomePerMinute: 0, color: "#9ca3af" },
  streetlight: {
    label: "Đèn đường",
    cost: 60,
    incomePerMinute: 0,
    color: "#facc15",
  },
  // ── Tier 1: Green / Nature ───────────────────────────────────────────────
  farm: { label: "Nông trại", cost: 80, incomePerMinute: 1, color: "#a3e635" },
  park: { label: "Công viên", cost: 150, incomePerMinute: 1, color: "#6ee7b7" },
  playground: {
    label: "Sân chơi",
    cost: 180,
    incomePerMinute: 2,
    color: "#86efac",
  },
  // ── Tier 2: Residential ──────────────────────────────────────────────────
  house: { label: "Nhà ở", cost: 200, incomePerMinute: 2, color: "#86efac" },
  // ── Tier 3: Commercial ───────────────────────────────────────────────────
  cafe: {
    label: "Quán cà phê",
    cost: 300,
    incomePerMinute: 3,
    color: "#fb923c",
  },
  market: { label: "Chợ", cost: 340, incomePerMinute: 4, color: "#fca5a5" },
  gasStation: {
    label: "Trạm xăng",
    cost: 380,
    incomePerMinute: 4,
    color: "#fdba74",
  },
  // ── Tier 4: Public Services ──────────────────────────────────────────────
  busStation: {
    label: "Bến xe buýt",
    cost: 400,
    incomePerMinute: 4,
    color: "#67e8f9",
  },
  school: {
    label: "Trường học",
    cost: 450,
    incomePerMinute: 4,
    color: "#60a5fa",
  },
  policeStation: {
    label: "Đồn cảnh sát",
    cost: 460,
    incomePerMinute: 5,
    color: "#38bdf8",
  },
  fireStation: {
    label: "Trạm cứu hỏa",
    cost: 480,
    incomePerMinute: 5,
    color: "#f97316",
  },
  shop: { label: "Cửa hàng", cost: 500, incomePerMinute: 5, color: "#fcd34d" },
  temple: {
    label: "Đình chùa",
    cost: 560,
    incomePerMinute: 6,
    color: "#fde68a",
  },
  library: {
    label: "Thư viện",
    cost: 660,
    incomePerMinute: 8,
    color: "#a5b4fc",
  },
  bank: { label: "Ngân hàng", cost: 700, incomePerMinute: 9, color: "#fbbf24" },
  factory: {
    label: "Nhà máy",
    cost: 800,
    incomePerMinute: 10,
    color: "#94a3b8",
  },
  cinema: {
    label: "Rạp chiếu phim",
    cost: 860,
    incomePerMinute: 11,
    color: "#f0abfc",
  },
  hospital: {
    label: "Bệnh viện",
    cost: 950,
    incomePerMinute: 13,
    color: "#f87171",
  },
  museum: {
    label: "Bảo tàng",
    cost: 1000,
    incomePerMinute: 14,
    color: "#c4b5fd",
  },
  // ── Tier 5: Landmark ─────────────────────────────────────────────────────
  arena: {
    label: "Đấu trường",
    cost: 1100,
    incomePerMinute: 16,
    color: "#34d399",
  },
  stadium: {
    label: "Sân vận động",
    cost: 1150,
    incomePerMinute: 17,
    color: "#4ade80",
  },
  tower: {
    label: "Tòa tháp",
    cost: 1200,
    incomePerMinute: 20,
    color: "#c4b5fd",
  },
  hotel: {
    label: "Khách sạn",
    cost: 1600,
    incomePerMinute: 26,
    color: "#e879f9",
  },
  powerPlant: {
    label: "Nhà máy điện",
    cost: 2000,
    incomePerMinute: 35,
    color: "#facc15",
  },
  mall: {
    label: "Trung tâm TM",
    cost: 3000,
    incomePerMinute: 55,
    color: "#f472b6",
  },
  harbor: {
    label: "Cảng biển",
    cost: 3500,
    incomePerMinute: 65,
    color: "#22d3ee",
  },
  university: {
    label: "Đại học",
    cost: 5000,
    incomePerMinute: 100,
    color: "#818cf8",
  },
  airport: {
    label: "Sân bay",
    cost: 8000,
    incomePerMinute: 160,
    color: "#7dd3fc",
  },
  spaceCenter: {
    label: "Trung tâm vũ trụ",
    cost: 15000,
    incomePerMinute: 300,
    color: "#a78bfa",
  },
} as const satisfies Record<
  string,
  { label: string; cost: number; incomePerMinute: number; color: string }
>;

export const BUILDING_EMOJI: Record<string, string> = {
  fence: "🪵",
  gate: "⛩️",
  farm: "🌾",
  park: "🌳",
  playground: "🛝",
  house: "🏠",
  cafe: "☕",
  market: "🛒",
  gasStation: "⛽",
  busStation: "🚌",
  school: "🏫",
  policeStation: "🚓",
  fireStation: "🚒",
  shop: "🏪",
  temple: "🛕",
  library: "📚",
  bank: "🏦",
  factory: "🏭",
  cinema: "🎬",
  hospital: "🏥",
  museum: "🏛️",
  arena: "🏟️",
  stadium: "⚽",
  tower: "🗼",
  hotel: "🏨",
  road: "🚧",
  streetlight: "💡",
  powerPlant: "⚡",
  mall: "🛍️",
  harbor: "⚓",
  university: "🎓",
  airport: "✈️",
  spaceCenter: "🚀",
};

export const TILE_COLORS = {
  empty: "#166534",
  owned: "#334155",
  mine: "#1e3a5f",
  hovered: "#854d0e",
  selected: "#7c2d12",
  forSale: "#4c1d95",
  moving: "#1e40af",
} as const;

export const CLAIM_COST = 100;
export const MAP_SIZE = 100;
export const CHUNK_SIZE = 10;
export const TILE_W = 64;
export const TILE_H = 32;

// Tích lũy tối đa 60 phút; sau đó building ngưng cộng dồn cho tới khi thu hoạch.
export const HARVEST_CAP_MINUTES = 60;

// ─────────────────────────────────────────────────────────────────────────────
// City Score System
// ─────────────────────────────────────────────────────────────────────────────

export type BuildingGroup =
  | "green"
  | "residential"
  | "commercial"
  | "industrial"
  | "public"
  | "landmark"
  | "infrastructure";

export const BUILDING_GROUP: Record<string, BuildingGroup> = {
  // Infrastructure
  fence: "infrastructure",
  gate: "infrastructure",
  road: "infrastructure",
  streetlight: "infrastructure",
  busStation: "infrastructure",
  powerPlant: "infrastructure",
  // Green / Nature
  farm: "green",
  park: "green",
  playground: "green",
  temple: "green",
  // Residential
  house: "residential",
  // Commercial
  cafe: "commercial",
  market: "commercial",
  gasStation: "commercial",
  shop: "commercial",
  bank: "commercial",
  cinema: "commercial",
  mall: "commercial",
  hotel: "commercial",
  harbor: "commercial",
  airport: "commercial",
  // Industrial
  factory: "industrial",
  // Public Services
  school: "public",
  policeStation: "public",
  fireStation: "public",
  library: "public",
  hospital: "public",
  museum: "public",
  university: "public",
  // Landmark
  arena: "landmark",
  stadium: "landmark",
  tower: "landmark",
  spaceCenter: "landmark",
};

export const GROUP_LABEL: Record<BuildingGroup, string> = {
  green: "🌿 Cây xanh",
  residential: "🏘️ Dân cư",
  commercial: "💼 Thương mại",
  industrial: "🏭 Công nghiệp",
  public: "🏛️ Dịch vụ công",
  landmark: "🏆 Điểm nhấn",
  infrastructure: "🔧 Hạ tầng",
};

export interface CityScoreBreakdown {
  diversity: number; // 0–30
  zoning: number; // 0–25
  compactness: number; // 0–20
  greenRatio: number; // 0–15
  landmark: number; // 0–10
  levelBonus: number; // 0–10
  penalty: number; // 0 or negative
  total: number;
  rating: CityRating;
}

export type CityRating =
  | "wasteland"
  | "construction"
  | "developing"
  | "urban"
  | "dream";

export const CITY_RATING_CONFIG: Record<
  CityRating,
  { label: string; badge: string; color: string }
> = {
  wasteland: { label: "Vùng đất hoang", badge: "🌱", color: "#6b7280" },
  construction: { label: "Đang xây dựng", badge: "🔨", color: "#f97316" },
  developing: { label: "Thành phố đang lên", badge: "⭐", color: "#eab308" },
  urban: { label: "Nhà quy hoạch đô thị", badge: "⭐⭐", color: "#3b82f6" },
  dream: { label: "Thành phố trong mơ", badge: "⭐⭐⭐", color: "#a855f7" },
};

export interface ScoredTile {
  x: number;
  y: number;
  buildingType: string | null;
  buildingLevel: number;
  ownerId: string;
}

export function calcCityScore(tiles: ScoredTile[]): CityScoreBreakdown {
  const ownedTiles = tiles.filter((t) => t.ownerId);
  const buildingTiles = ownedTiles.filter((t) => t.buildingType);
  const totalLand = ownedTiles.length;
  const totalBuildings = buildingTiles.length;

  if (totalLand === 0) {
    return {
      diversity: 0,
      zoning: 0,
      compactness: 0,
      greenRatio: 0,
      landmark: 0,
      levelBonus: 0,
      penalty: 0,
      total: 0,
      rating: "wasteland",
    };
  }

  const ownedSet = new Set(ownedTiles.map((t) => `${t.x}_${t.y}`));
  const buildingMap = new Map(buildingTiles.map((t) => [`${t.x}_${t.y}`, t]));
  const DIRS: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  // ── 1. Diversity (0–30) ──────────────────────────────────────────────────
  const uniqueTypes = new Set(buildingTiles.map((t) => t.buildingType)).size;
  const diversity = Math.min(uniqueTypes * 3, 30);

  // ── 2. Zoning (0–25) ────────────────────────────────────────────────────
  let sameGroupNeighbors = 0;
  for (const tile of buildingTiles) {
    const group = BUILDING_GROUP[tile.buildingType!];
    if (!group) continue;
    for (const [dx, dy] of DIRS) {
      const neighbor = buildingMap.get(`${tile.x + dx}_${tile.y + dy}`);
      if (
        neighbor?.buildingType &&
        BUILDING_GROUP[neighbor.buildingType] === group
      ) {
        sameGroupNeighbors++;
      }
    }
  }
  const zoningRaw =
    totalBuildings > 1 ? sameGroupNeighbors / (totalBuildings * 2) : 0;
  const zoning = Math.round(Math.min(zoningRaw * 25, 25));

  // ── 3. Compactness (0–20) ────────────────────────────────────────────────
  let connectedCount = 0;
  for (const tile of ownedTiles) {
    if (
      DIRS.some(([dx, dy]) => ownedSet.has(`${tile.x + dx}_${tile.y + dy}`))
    ) {
      connectedCount++;
    }
  }
  const compactness =
    totalLand > 1 ? Math.round((connectedCount / totalLand) * 20) : 0;

  // ── 4. Green Ratio (0–15) ────────────────────────────────────────────────
  const greenCount = buildingTiles.filter(
    (t) => BUILDING_GROUP[t.buildingType!] === "green",
  ).length;
  const greenRatio =
    totalBuildings > 0
      ? Math.round(Math.min((greenCount / totalBuildings) * 3 * 15, 15))
      : 0;

  // ── 5. Landmark Bonus (0–10) ─────────────────────────────────────────────
  const landmarkCount = buildingTiles.filter(
    (t) => BUILDING_GROUP[t.buildingType!] === "landmark",
  ).length;
  const landmark = Math.min(landmarkCount * 2, 10);

  // ── 6. Level Bonus (0–10) ────────────────────────────────────────────────
  const avgLevel =
    totalBuildings > 0
      ? buildingTiles.reduce((s, t) => s + (t.buildingLevel ?? 1), 0) /
        totalBuildings
      : 1;
  const levelBonus = Math.round(Math.min((avgLevel - 1) * 5, 10));

  // ── 7. Penalties ─────────────────────────────────────────────────────────
  let penalty = 0;
  if (totalBuildings / totalLand < 0.5) penalty -= 5;
  if (totalBuildings > 0 && uniqueTypes === 1) penalty -= 10;
  if (totalBuildings > 0 && greenCount === 0) penalty -= 5;

  const total = Math.max(
    0,
    diversity +
      zoning +
      compactness +
      greenRatio +
      landmark +
      levelBonus +
      penalty,
  );

  let rating: CityRating;
  if (total >= 90) rating = "dream";
  else if (total >= 70) rating = "urban";
  else if (total >= 50) rating = "developing";
  else if (total >= 30) rating = "construction";
  else rating = "wasteland";

  return {
    diversity,
    zoning,
    compactness,
    greenRatio,
    landmark,
    levelBonus,
    penalty,
    total,
    rating,
  };
}
