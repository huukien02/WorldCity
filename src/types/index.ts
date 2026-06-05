export type { BuildingType, TileData, MapChunkDoc, UserDoc } from './firestore'

export interface TileCoord {
  x: number
  y: number
}

export interface Viewport {
  x: number
  y: number
  scale: number
}

// Sorted by cost ascending
export const BUILDING_CONFIG = {
  fence:         { label: 'Hàng rào',         cost:   30, incomePerMinute:  1, color: '#d4d4d4' },
  gate:          { label: 'Cổng',             cost:   70, incomePerMinute:  1, color: '#e5c48b' },
  farm:          { label: 'Nông trại',         cost:   80, incomePerMinute:  1, color: '#a3e635' },
  park:          { label: 'Công viên',         cost:  150, incomePerMinute:  1, color: '#6ee7b7' },
  house:         { label: 'Nhà ở',             cost:  200, incomePerMinute:  2, color: '#86efac' },
  cafe:          { label: 'Quán cà phê',       cost:  300, incomePerMinute:  3, color: '#fb923c' },
  gasStation:    { label: 'Trạm xăng',         cost:  380, incomePerMinute:  4, color: '#fdba74' },
  school:        { label: 'Trường học',         cost:  450, incomePerMinute:  4, color: '#60a5fa' },
  policeStation: { label: 'Đồn cảnh sát',      cost:  460, incomePerMinute:  5, color: '#38bdf8' },
  shop:          { label: 'Cửa hàng',          cost:  500, incomePerMinute:  5, color: '#fcd34d' },
  temple:        { label: 'Đình chùa',         cost:  560, incomePerMinute:  6, color: '#fde68a' },
  library:       { label: 'Thư viện',          cost:  660, incomePerMinute:  8, color: '#a5b4fc' },
  bank:          { label: 'Ngân hàng',         cost:  700, incomePerMinute:  9, color: '#fbbf24' },
  factory:       { label: 'Nhà máy',           cost:  800, incomePerMinute: 10, color: '#94a3b8' },
  cinema:        { label: 'Rạp chiếu phim',    cost:  860, incomePerMinute: 11, color: '#f0abfc' },
  hospital:      { label: 'Bệnh viện',         cost:  950, incomePerMinute: 13, color: '#f87171' },
  arena:         { label: 'Đấu trường',        cost: 1100, incomePerMinute: 16, color: '#34d399' },
  tower:         { label: 'Tòa tháp',          cost: 1200, incomePerMinute: 20, color: '#c4b5fd' },
  hotel:         { label: 'Khách sạn',         cost: 1600, incomePerMinute: 26, color: '#e879f9' },
  mall:          { label: 'Trung tâm TM',      cost: 3000, incomePerMinute: 55, color: '#f472b6' },
  university:    { label: 'Đại học',           cost: 5000, incomePerMinute: 100, color: '#818cf8' },
} as const satisfies Record<string, { label: string; cost: number; incomePerMinute: number; color: string }>

export const BUILDING_EMOJI: Record<string, string> = {
  fence:         '🪵',
  gate:          '⛩️',
  farm:          '🌾',
  park:          '🌳',
  house:         '🏠',
  cafe:          '☕',
  gasStation:    '⛽',
  school:        '🏫',
  policeStation: '🚓',
  shop:          '🏪',
  temple:        '🛕',
  library:       '📚',
  bank:          '🏦',
  factory:       '🏭',
  cinema:        '🎬',
  hospital:      '🏥',
  arena:         '🏟️',
  tower:         '🏙',
  hotel:         '🏨',
  mall:          '🏬',
  university:    '🎓',
}

export const TILE_COLORS = {
  empty:    '#166534',
  owned:    '#334155',
  mine:     '#1e3a5f',
  hovered:  '#854d0e',
  selected: '#7c2d12',
  forSale:  '#4c1d95',
  moving:   '#1e40af',
} as const

export const CLAIM_COST = 100
export const MAP_SIZE = 100
export const CHUNK_SIZE = 10
export const TILE_W = 64
export const TILE_H = 32

// Tích lũy tối đa 3 ngày = 4320 phút
export const HARVEST_CAP_MINUTES = 4320
